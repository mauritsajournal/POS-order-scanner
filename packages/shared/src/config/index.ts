/**
 * Centralized configuration constants.
 *
 * All hardcoded values that were scattered across the codebase are collected here.
 * Environment variable overrides are noted where applicable.
 */

/** Network connectivity check settings */
export const NETWORK = {
  /** Timeout for connectivity check requests (ms) */
  CONNECTIVITY_TIMEOUT_MS: 3000,
  /** Polling interval for network status (ms) */
  POLL_INTERVAL_MS: 30_000,
} as const;

/** Barcode scanner settings */
export const SCANNER = {
  /** Debounce time to prevent duplicate scans (ms) */
  SCAN_DEBOUNCE_MS: 500,
  /** Minimum barcode length to accept from hardware scanner */
  MIN_BARCODE_LENGTH: 8,
} as const;

/** API settings */
export const API = {
  /** Default CORS origins for development */
  DEV_ORIGINS: ['http://localhost:3000', 'http://localhost:8081'] as readonly string[],
  /** Rate limit: max requests per minute per tenant (default / fallback) */
  RATE_LIMIT_PER_MINUTE: 100,
  /** Rate limits by plan tier — requests per minute per tenant */
  RATE_LIMITS_BY_PLAN: {
    free: 60,
    starter: 120,
    professional: 300,
    enterprise: 1000,
  } as Record<string, number>,
  /** Max operations per PowerSync upload transaction */
  MAX_OPS_PER_TRANSACTION: 100,
  /** Path prefixes exempted from rate limiting (PowerSync sync traffic) */
  RATE_LIMIT_EXEMPT_PATHS: ['/api/sync/'] as readonly string[],
} as const;

/** Order settings */
export const ORDER = {
  /** Default order number prefix */
  ORDER_NUMBER_PREFIX: 'SO',
  /** Default currency */
  DEFAULT_CURRENCY: 'EUR',
  /** Default payment terms */
  DEFAULT_PAYMENT_TERMS: 'net_30',
} as const;

/** Tax settings (Netherlands) */
export const TAX = {
  /** Standard Dutch BTW rate in basis points (21%) */
  STANDARD_RATE_BPS: 2100,
  /** Reduced Dutch BTW rate in basis points (9%) */
  REDUCED_RATE_BPS: 900,
  /** Zero rate in basis points */
  ZERO_RATE_BPS: 0,
} as const;
