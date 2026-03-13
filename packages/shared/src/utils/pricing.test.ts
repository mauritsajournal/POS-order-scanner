import { describe, it, expect } from 'vitest';
import { formatPrice, lineTotal, calculateTax, calculateOrderTotals } from './pricing';

describe('formatPrice', () => {
  it('formats EUR cents to Dutch locale', () => {
    const result = formatPrice(36852);
    // Intl.NumberFormat with nl-NL, EUR produces something like "€ 368,52"
    expect(result).toContain('368');
    expect(result).toContain('52');
  });

  it('formats zero', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
  });

  it('formats with explicit currency', () => {
    const result = formatPrice(1000, 'USD', 'en-US');
    expect(result).toContain('10');
    expect(result).toContain('00');
  });

  it('handles negative amounts', () => {
    const result = formatPrice(-500);
    expect(result).toContain('5');
  });
});

describe('lineTotal', () => {
  it('calculates simple total without discount', () => {
    expect(lineTotal(1000, 3)).toBe(3000);
  });

  it('calculates total with discount', () => {
    // 1000 cents * 2 items = 2000, 10% discount = 200 off = 1800
    expect(lineTotal(1000, 2, 10)).toBe(1800);
  });

  it('handles zero discount', () => {
    expect(lineTotal(895, 1, 0)).toBe(895);
  });

  it('handles 100% discount', () => {
    expect(lineTotal(1000, 5, 100)).toBe(0);
  });

  it('handles single item', () => {
    expect(lineTotal(2500, 1)).toBe(2500);
  });

  it('rounds correctly with odd discount amounts', () => {
    // 333 * 3 = 999, 7% discount = 69.93 -> rounded to 70 -> 929
    expect(lineTotal(333, 3, 7)).toBe(929);
  });
});

describe('calculateTax', () => {
  it('calculates 21% Dutch BTW', () => {
    // 10000 cents (100 EUR) at 21% = 2100 cents
    expect(calculateTax(10000, 2100)).toBe(2100);
  });

  it('calculates 9% reduced BTW', () => {
    // 10000 cents at 9% = 900 cents
    expect(calculateTax(10000, 900)).toBe(900);
  });

  it('handles zero tax', () => {
    expect(calculateTax(5000, 0)).toBe(0);
  });

  it('rounds correctly', () => {
    // 1234 * 2100/10000 = 259.14 -> 259
    expect(calculateTax(1234, 2100)).toBe(259);
  });
});

describe('calculateOrderTotals', () => {
  it('calculates totals for a single line', () => {
    const result = calculateOrderTotals([
      { unit_price: 1000, quantity: 2, discount_pct: 0, tax_rate: 2100 },
    ]);
    expect(result.subtotal).toBe(2000);
    expect(result.taxAmount).toBe(420);
    expect(result.total).toBe(2420);
  });

  it('calculates totals for multiple lines', () => {
    const result = calculateOrderTotals([
      { unit_price: 1000, quantity: 2, discount_pct: 0, tax_rate: 2100 },
      { unit_price: 500, quantity: 3, discount_pct: 10, tax_rate: 2100 },
    ]);
    // Line 1: 2000 net, 420 tax
    // Line 2: 1500 gross, 10% = 150 discount, 1350 net, 283.5 -> 284 tax (rounded)
    expect(result.subtotal).toBe(3350);
    expect(result.taxAmount).toBe(704); // 420 + 284 (Math.round(1350 * 0.21))
    expect(result.total).toBe(4054);
  });

  it('handles empty lines array', () => {
    const result = calculateOrderTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('handles discounted lines', () => {
    const result = calculateOrderTotals([
      { unit_price: 2000, quantity: 1, discount_pct: 50, tax_rate: 2100 },
    ]);
    expect(result.subtotal).toBe(1000);
    expect(result.taxAmount).toBe(210);
    expect(result.total).toBe(1210);
  });
});
