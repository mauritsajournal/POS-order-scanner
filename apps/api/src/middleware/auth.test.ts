import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { authMiddleware } from './auth';
import { createHmac } from 'node:crypto';

// Test JWT secret
const JWT_SECRET = 'test-secret-for-unit-tests-only';

/**
 * Create a signed HS256 JWT for testing.
 * Uses Node.js crypto (available in Vitest), matching the
 * Supabase JWT format the middleware expects.
 */
function createTestJWT(
  payload: Record<string, unknown>,
  secret: string = JWT_SECRET,
): string {
  const header = { alg: 'HS256', typ: 'JWT' };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));

  const data = `${headerB64}.${payloadB64}`;
  const signature = createHmac('sha256', secret).update(data).digest();
  const signatureB64 = base64UrlEncodeBuffer(signature);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlEncodeBuffer(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Hono app.request(input, requestInit, env, executionCtx)
// When input is a string (URL), requestInit is the second arg, env is third
const ENV = { SUPABASE_JWT_SECRET: JWT_SECRET };

function createTestApp() {
  const app = new Hono<{
    Bindings: { SUPABASE_JWT_SECRET: string };
    Variables: { user: { userId: string; tenantId: string; role: string; email: string } };
  }>();

  app.use('/api/*', authMiddleware);

  app.get('/api/test', (c) => {
    const user = c.get('user');
    return c.json({ user });
  });

  return app;
}

async function req(app: ReturnType<typeof createTestApp>, token?: string) {
  const headers: Record<string, string> = {};
  if (token !== undefined) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return app.request('http://localhost/api/test', { headers }, ENV);
}

async function reqWithHeader(app: ReturnType<typeof createTestApp>, authHeader: string) {
  return app.request(
    'http://localhost/api/test',
    { headers: { Authorization: authHeader } },
    ENV,
  );
}

describe('authMiddleware', () => {
  const app = createTestApp();

  it('rejects request without Authorization header', async () => {
    const res = await app.request('http://localhost/api/test', {}, ENV);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('Missing');
  });

  it('rejects request with invalid Authorization format', async () => {
    const res = await reqWithHeader(app, 'Basic abc');
    expect(res.status).toBe(401);
  });

  it('rejects expired token', async () => {
    const token = createTestJWT({
      sub: 'user-123',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) - 3600,
      app_metadata: { tenant_id: 'tenant-abc', role: 'admin' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('expired');
  });

  it('rejects token with wrong signature', async () => {
    const token = createTestJWT(
      {
        sub: 'user-123',
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
        app_metadata: { tenant_id: 'tenant-abc', role: 'admin' },
      },
      'wrong-secret',
    );
    const res = await req(app, token);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('signature');
  });

  it('rejects token without tenant_id in app_metadata', async () => {
    const token = createTestJWT({
      sub: 'user-123',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { role: 'admin' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('tenant_id');
  });

  it('rejects token without sub (user ID)', async () => {
    const token = createTestJWT({
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { tenant_id: 'tenant-abc', role: 'admin' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('subject');
  });

  it('accepts valid token and sets user context', async () => {
    const token = createTestJWT({
      sub: 'user-123',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { tenant_id: 'tenant-abc', role: 'admin' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toEqual({
      userId: 'user-123',
      tenantId: 'tenant-abc',
      role: 'admin',
      email: 'test@example.com',
    });
  });

  it('defaults role to sales_rep when not in app_metadata', async () => {
    const token = createTestJWT({
      sub: 'user-456',
      email: 'sales@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { tenant_id: 'tenant-xyz' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.role).toBe('sales_rep');
  });

  it('rejects malformed JWT (not 3 parts)', async () => {
    const res = await req(app, 'not.a.valid.jwt.token');
    expect(res.status).toBe(401);
  });

  it('rejects not-yet-valid token (nbf in future)', async () => {
    const token = createTestJWT({
      sub: 'user-123',
      email: 'test@example.com',
      exp: Math.floor(Date.now() / 1000) + 7200,
      nbf: Math.floor(Date.now() / 1000) + 3600,
      app_metadata: { tenant_id: 'tenant-abc', role: 'admin' },
    });
    const res = await req(app, token);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain('not yet valid');
  });
});
