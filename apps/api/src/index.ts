import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware, type AuthUser } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { syncUpload } from './routes/sync/upload';
import { API } from '@scanorder/shared';

type Bindings = {
  ENVIRONMENT: string;
  SUPABASE_JWT_SECRET: string;
  ALLOWED_ORIGINS?: string; // comma-separated list of allowed origins
  // Uncomment when Cloudflare resources are created:
  // IMAGES: R2Bucket;
  // CACHE: KVNamespace;
  // DB: Hyperdrive;
};

type Variables = {
  user: AuthUser;
  tenantId: string;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Default development origins from shared config
const DEV_ORIGINS = API.DEV_ORIGINS as unknown as string[];

// Global middleware
app.use('*', logger());
app.use('*', async (c, next) => {
  // Parse allowed origins from environment, fall back to dev defaults
  const envOrigins = c.env.ALLOWED_ORIGINS;
  const origins = envOrigins
    ? envOrigins.split(',').map((o: string) => o.trim()).filter(Boolean)
    : DEV_ORIGINS;

  const corsMiddleware = cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });

  return corsMiddleware(c, next);
});

// Health check (public — no auth required)
app.get('/health', (c) => c.json({ status: 'ok', environment: c.env.ENVIRONMENT }));

// Protected routes — require valid Supabase JWT
app.use('/api/*', authMiddleware);

// Rate limiting on all API routes (runs after auth, uses tenant context)
// Exempt paths (e.g. PowerSync sync) are handled inside the middleware
app.use('/api/*', rateLimitMiddleware);

// PowerSync upload handler
app.post('/api/sync/upload', syncUpload);

// Webhook stubs (will be implemented in later phases)
// Webhooks use their own auth (HMAC signatures), so they're outside /api/*
app.post('/webhooks/woocommerce', (c) => c.json({ received: true }));
app.post('/webhooks/mollie', (c) => c.json({ received: true }));

export default app;
