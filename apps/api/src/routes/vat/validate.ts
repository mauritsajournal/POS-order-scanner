/**
 * EU VIES VAT number validation (INT-009).
 *
 * Validates EU VAT numbers against the VIES (VAT Information Exchange System).
 * Uses the European Commission's VIES REST API.
 *
 * Caching: Results are cached for 24 hours to avoid repeated lookups.
 * When KV binding is available, uses Cloudflare KV; otherwise in-memory.
 */

import type { Context } from 'hono';

// ---------- Types ----------

export interface VATValidationResult {
  valid: boolean;
  vatNumber: string;
  countryCode: string;
  name: string | null;
  address: string | null;
  requestDate: string;
  cached: boolean;
}

interface VIESResponse {
  isValid: boolean;
  requestDate: string;
  userError?: string;
  name?: string;
  address?: string;
  requestIdentifier?: string;
  vatNumber: string;
  viesApproximate?: {
    name?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    companyType?: string;
  };
}

// ---------- In-memory cache fallback ----------

const memoryCache = new Map<string, { result: VATValidationResult; expires: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(countryCode: string, vatNumber: string): string {
  return `vat:${countryCode}:${vatNumber}`;
}

async function getCached(
  key: string,
  kv?: KVNamespace,
): Promise<VATValidationResult | null> {
  // Try KV first
  if (kv) {
    const cached = await kv.get(key, 'json');
    if (cached) return { ...(cached as VATValidationResult), cached: true };
  }

  // Fallback to in-memory
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) {
    return { ...entry.result, cached: true };
  }

  return null;
}

async function setCache(
  key: string,
  result: VATValidationResult,
  kv?: KVNamespace,
): Promise<void> {
  // Store in KV with TTL
  if (kv) {
    await kv.put(key, JSON.stringify(result), { expirationTtl: 86400 });
  }

  // Also store in memory
  memoryCache.set(key, { result, expires: Date.now() + CACHE_TTL_MS });
}

// ---------- Validation logic ----------

/** EU country codes that participate in VIES */
const EU_COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES',
  'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'XI', // XI = Northern Ireland
];

/** Parse a VAT number into country code and number parts */
export function parseVATNumber(raw: string): { countryCode: string; number: string } | null {
  const cleaned = raw.replace(/[\s\-.]/g, '').toUpperCase();

  if (cleaned.length < 4) return null;

  const countryCode = cleaned.slice(0, 2);
  const number = cleaned.slice(2);

  if (!/^[A-Z]{2}$/.test(countryCode)) return null;
  if (!/^[0-9A-Z+*]{2,12}$/.test(number)) return null;

  return { countryCode, number };
}

/** Validate a VAT number against VIES */
export async function validateVAT(
  vatNumber: string,
  kv?: KVNamespace,
): Promise<VATValidationResult> {
  const parsed = parseVATNumber(vatNumber);

  if (!parsed) {
    return {
      valid: false,
      vatNumber,
      countryCode: '',
      name: null,
      address: null,
      requestDate: new Date().toISOString(),
      cached: false,
    };
  }

  const { countryCode, number } = parsed;

  // Check if country participates in VIES
  if (!EU_COUNTRY_CODES.includes(countryCode)) {
    return {
      valid: false,
      vatNumber,
      countryCode,
      name: null,
      address: null,
      requestDate: new Date().toISOString(),
      cached: false,
    };
  }

  // Check cache
  const cacheKey = getCacheKey(countryCode, number);
  const cached = await getCached(cacheKey, kv);
  if (cached) return cached;

  // Call VIES REST API
  try {
    const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        countryCode,
        vatNumber: number,
      }),
    });

    if (!response.ok) {
      // VIES API may be temporarily unavailable (common issue)
      return {
        valid: false,
        vatNumber,
        countryCode,
        name: null,
        address: null,
        requestDate: new Date().toISOString(),
        cached: false,
      };
    }

    const data: VIESResponse = await response.json();

    const result: VATValidationResult = {
      valid: data.isValid,
      vatNumber: `${countryCode}${number}`,
      countryCode,
      name: data.name || data.viesApproximate?.name || null,
      address: data.address || null,
      requestDate: data.requestDate || new Date().toISOString(),
      cached: false,
    };

    // Cache the result
    await setCache(cacheKey, result, kv);

    return result;
  } catch {
    // Network error — return invalid but don't cache failures
    return {
      valid: false,
      vatNumber,
      countryCode,
      name: null,
      address: null,
      requestDate: new Date().toISOString(),
      cached: false,
    };
  }
}

// ---------- Route handler ----------

/** POST /api/vat/validate — Validate an EU VAT number */
export async function vatValidateHandler(c: Context): Promise<Response> {
  const body = await c.req.json().catch(() => null);

  if (!body || typeof body.vatNumber !== 'string' || !body.vatNumber.trim()) {
    return c.json({ error: 'Missing vatNumber field' }, 400);
  }

  const kv = (c.env as Record<string, unknown>).CACHE as KVNamespace | undefined;
  const result = await validateVAT(body.vatNumber.trim(), kv);

  return c.json(result);
}
