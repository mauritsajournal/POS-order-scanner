import type { MiddlewareHandler } from 'hono';
import type { AuthUser } from './auth';
import { API } from '@scanorder/shared';

/**
 * In-memory sliding window rate limiter.
 *
 * Limits requests per tenant per minute. Uses a Map that lives for the
 * lifetime of the Worker isolate. In production with multiple isolates,
 * this provides per-isolate limiting — for true distributed limiting,
 * replace with Cloudflare KV or Durable Objects.
 *
 * Runs AFTER auth middleware so tenant context is available.
 */

interface RateWindow {
  count: number;
  resetAt: number; // Unix timestamp (ms) when the window resets
}

const rateLimitStore = new Map<string, RateWindow>();

// Cleanup stale entries periodically to prevent memory leaks
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, window] of rateLimitStore) {
    if (window.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export const rateLimitMiddleware: MiddlewareHandler = async (c, next) => {
  const user = c.get('user') as AuthUser | undefined;

  // Rate limit by tenant, or by IP if no auth context
  const key = user?.tenantId ?? c.req.header('CF-Connecting-IP') ?? 'unknown';
  const limit = API.RATE_LIMIT_PER_MINUTE;
  const windowMs = 60_000;

  cleanupStaleEntries();

  const now = Date.now();
  let window = rateLimitStore.get(key);

  if (!window || window.resetAt <= now) {
    // Start new window
    window = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, window);
  } else {
    window.count++;
  }

  // Set rate limit headers
  const remaining = Math.max(0, limit - window.count);
  const retryAfterSeconds = Math.ceil((window.resetAt - now) / 1000);

  c.header('X-RateLimit-Limit', String(limit));
  c.header('X-RateLimit-Remaining', String(remaining));
  c.header('X-RateLimit-Reset', String(Math.ceil(window.resetAt / 1000)));

  if (window.count > limit) {
    c.header('Retry-After', String(retryAfterSeconds));
    return c.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: retryAfterSeconds,
      },
      429,
    );
  }

  await next();
};
