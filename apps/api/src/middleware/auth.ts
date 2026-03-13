import type { Context, MiddlewareHandler } from 'hono';

/**
 * User context extracted from Supabase JWT.
 * Available via c.get('user') after auth middleware.
 */
export interface AuthUser {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

/**
 * JWT validation middleware for Supabase tokens.
 *
 * Validates the JWT signature using the Supabase JWT secret (HMAC-SHA256).
 * Extracts tenant_id and role from app_metadata.
 * Attaches user context to the Hono request for downstream handlers.
 *
 * Expects:
 *   - Authorization: Bearer <token> header
 *   - SUPABASE_JWT_SECRET env var set in wrangler config / Cloudflare secrets
 */
export const authMiddleware: MiddlewareHandler<{
  Bindings: { SUPABASE_JWT_SECRET: string };
  Variables: { user: AuthUser; tenantId: string };
}> = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifySupabaseJWT(token, c.env.SUPABASE_JWT_SECRET);

    const appMetadata = payload.app_metadata ?? {};
    const tenantId = appMetadata.tenant_id;
    const role = appMetadata.role ?? 'sales_rep';

    if (!tenantId) {
      return c.json({ error: 'Token missing tenant_id in app_metadata' }, 403);
    }

    if (!payload.sub) {
      return c.json({ error: 'Token missing subject (user ID)' }, 401);
    }

    const user: AuthUser = {
      userId: payload.sub,
      tenantId,
      role,
      email: payload.email ?? '',
    };

    c.set('user', user);
    c.set('tenantId', tenantId);
    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token validation failed';
    console.error('Auth middleware error:', message);
    return c.json({ error: message }, 401);
  }
};

/**
 * Verify a Supabase JWT (HS256) using the Web Crypto API.
 *
 * Supabase uses HMAC-SHA256 for JWT signing with the project's JWT secret.
 * This runs entirely on the Web Crypto API, which is available in
 * Cloudflare Workers (no Node.js crypto needed).
 */
async function verifySupabaseJWT(
  token: string,
  secret: string
): Promise<SupabaseJWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const headerB64 = parts[0]!;
  const payloadB64 = parts[1]!;
  const signatureB64 = parts[2]!;

  // Decode and verify header
  const header = JSON.parse(base64UrlDecode(headerB64));
  if (header.alg !== 'HS256') {
    throw new Error(`Unsupported algorithm: ${header.alg}`);
  }

  // Import the secret key for HMAC verification
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  // Verify the signature
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToArrayBuffer(signatureB64);

  const valid = await crypto.subtle.verify('HMAC', key, signature, data);
  if (!valid) {
    throw new Error('Invalid JWT signature');
  }

  // Decode payload
  const payload: SupabaseJWTPayload = JSON.parse(base64UrlDecode(payloadB64));

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }

  // Check not-before
  if (payload.nbf && payload.nbf > now) {
    throw new Error('Token not yet valid');
  }

  return payload;
}

/**
 * Supabase JWT payload shape.
 * Supabase stores custom claims in app_metadata and user_metadata.
 */
interface SupabaseJWTPayload {
  sub?: string; // user UUID
  email?: string;
  role?: string; // Supabase role (e.g., 'authenticated')
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  app_metadata?: {
    tenant_id?: string;
    role?: string; // app role (admin, manager, sales_rep)
    [key: string]: unknown;
  };
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Decode a base64url-encoded string to a UTF-8 string. */
function base64UrlDecode(str: string): string {
  // Replace base64url chars with standard base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad if needed
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  // Decode: atob is available in Workers
  return atob(padded);
}

/** Decode a base64url-encoded string to an ArrayBuffer. */
function base64UrlToArrayBuffer(str: string): ArrayBuffer {
  const binary = base64UrlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
