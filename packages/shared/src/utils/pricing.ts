import { CURRENCIES, type CurrencyCode } from '../constants/currencies';

/**
 * Format cents to display string.
 * formatPrice(36852, 'EUR') → "€368,52"
 * formatPrice(36852, 'EUR', 'en') → "€368.52"
 */
export function formatPrice(
  cents: number,
  currency: CurrencyCode = 'EUR',
  locale: string = 'nl-NL',
): string {
  const info = CURRENCIES[currency];
  const amount = cents / Math.pow(10, info.decimals);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: info.code,
    minimumFractionDigits: info.decimals,
  }).format(amount);
}

/**
 * Calculate line total in cents.
 * lineTotal(895, 12, 10) → 9666 (€89.50 * 12 items * 90% after 10% discount, rounded)
 */
export function lineTotal(
  unitPriceCents: number,
  quantity: number,
  discountPct: number = 0,
): number {
  const gross = unitPriceCents * quantity;
  const discount = Math.round(gross * (discountPct / 100));
  return gross - discount;
}

/**
 * Calculate tax amount from a net amount in cents.
 * taxAmount = net * (rate / 10000)
 * calculateTax(10000, 2100) → 2100 (€100 * 21% = €21)
 */
export function calculateTax(netCents: number, taxRateBasisPoints: number): number {
  return Math.round(netCents * (taxRateBasisPoints / 10000));
}

/**
 * Calculate order totals from line items.
 */
export function calculateOrderTotals(
  lines: Array<{
    unit_price: number;
    quantity: number;
    discount_pct: number;
    tax_rate: number;
  }>,
): { subtotal: number; taxAmount: number; total: number } {
  let subtotal = 0;
  let taxAmount = 0;

  for (const line of lines) {
    const net = lineTotal(line.unit_price, line.quantity, line.discount_pct);
    subtotal += net;
    taxAmount += calculateTax(net, line.tax_rate);
  }

  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
}
