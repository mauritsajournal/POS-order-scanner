import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { syncUpload } from './routes/sync/upload';

type Bindings = {
  ENVIRONMENT: string;
  // IMAGES: R2Bucket;
  // CACHE: KVNamespace;
  // DB: Hyperdrive;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8081'], // dev origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', environment: c.env.ENVIRONMENT }));

// PowerSync upload handler
app.post('/api/sync/upload', syncUpload);

// Webhook stubs (will be implemented in later phases)
app.post('/api/webhooks/woocommerce', (c) => c.json({ received: true }));
app.post('/api/webhooks/mollie', (c) => c.json({ received: true }));

export default app;
