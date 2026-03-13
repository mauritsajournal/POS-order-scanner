import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from './cart';
import type { Product, ProductVariant } from '@scanorder/shared';
import { lineTotal, calculateOrderTotals } from '@scanorder/shared';

// Helper to create a test product
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    tenant_id: 'tenant-1',
    sku: 'TEST-001',
    barcode: '8710000000001',
    name: 'Test Product',
    description: null,
    base_price: 1995, // €19.95
    tax_rate: 2100, // 21% BTW
    stock_qty: 100,
    image_url: null,
    category: 'stationery',
    attributes: {},
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeVariant(overrides: Partial<ProductVariant> = {}): ProductVariant {
  return {
    id: 'var-1',
    product_id: 'prod-1',
    sku: 'TEST-001-L',
    barcode: '8710000000002',
    name: 'Large',
    price_override: 2495, // €24.95
    stock_qty: 50,
    attributes: { size: 'L' },
    is_deleted: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('cart store', () => {
  beforeEach(() => {
    // Reset cart state before each test
    useCart.getState().clearCart();
  });

  describe('addItem', () => {
    it('adds a new product and returns quantity 1', () => {
      const product = makeProduct();
      const qty = useCart.getState().addItem(product);

      expect(qty).toBe(1);
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]!.product.id).toBe('prod-1');
      expect(useCart.getState().lines[0]!.unitPrice).toBe(1995);
      expect(useCart.getState().lines[0]!.quantity).toBe(1);
    });

    it('increments quantity when same product is added again', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);
      const qty = useCart.getState().addItem(product);

      expect(qty).toBe(2);
      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]!.quantity).toBe(2);
    });

    it('creates separate lines for different products', () => {
      const prod1 = makeProduct({ id: 'prod-1', name: 'Product A' });
      const prod2 = makeProduct({ id: 'prod-2', name: 'Product B', base_price: 995 });

      useCart.getState().addItem(prod1);
      useCart.getState().addItem(prod2);

      expect(useCart.getState().lines).toHaveLength(2);
    });

    it('uses variant price_override when variant is provided', () => {
      const product = makeProduct();
      const variant = makeVariant({ price_override: 2495 });

      useCart.getState().addItem(product, variant);

      expect(useCart.getState().lines[0]!.unitPrice).toBe(2495);
    });

    it('uses product base_price when variant has null price_override', () => {
      const product = makeProduct({ base_price: 1995 });
      const variant = makeVariant({ price_override: null });

      useCart.getState().addItem(product, variant);

      expect(useCart.getState().lines[0]!.unitPrice).toBe(1995);
    });

    it('creates separate lines for same product with different variants', () => {
      const product = makeProduct();
      const varA = makeVariant({ id: 'var-a', name: 'Small' });
      const varB = makeVariant({ id: 'var-b', name: 'Large' });

      useCart.getState().addItem(product, varA);
      useCart.getState().addItem(product, varB);

      expect(useCart.getState().lines).toHaveLength(2);
    });

    it('increments quantity for same product+variant combination', () => {
      const product = makeProduct();
      const variant = makeVariant();

      useCart.getState().addItem(product, variant);
      const qty = useCart.getState().addItem(product, variant);

      expect(qty).toBe(2);
      expect(useCart.getState().lines).toHaveLength(1);
    });
  });

  describe('removeItem', () => {
    it('removes a line from the cart', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);
      const lineId = useCart.getState().lines[0]!.id;

      useCart.getState().removeItem(lineId);

      expect(useCart.getState().lines).toHaveLength(0);
    });

    it('only removes the specified line, not others', () => {
      const prod1 = makeProduct({ id: 'prod-1' });
      const prod2 = makeProduct({ id: 'prod-2' });

      useCart.getState().addItem(prod1);
      useCart.getState().addItem(prod2);

      const lineId = useCart.getState().lines[0]!.id;
      useCart.getState().removeItem(lineId);

      expect(useCart.getState().lines).toHaveLength(1);
      expect(useCart.getState().lines[0]!.product.id).toBe('prod-2');
    });

    it('does nothing when lineId does not exist', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);

      useCart.getState().removeItem('nonexistent-id');

      expect(useCart.getState().lines).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates quantity of a line', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);
      const lineId = useCart.getState().lines[0]!.id;

      useCart.getState().updateQuantity(lineId, 5);

      expect(useCart.getState().lines[0]!.quantity).toBe(5);
    });

    it('removes line when quantity is set to 0', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);
      const lineId = useCart.getState().lines[0]!.id;

      useCart.getState().updateQuantity(lineId, 0);

      expect(useCart.getState().lines).toHaveLength(0);
    });

    it('removes line when quantity is negative', () => {
      const product = makeProduct();
      useCart.getState().addItem(product);
      const lineId = useCart.getState().lines[0]!.id;

      useCart.getState().updateQuantity(lineId, -1);

      expect(useCart.getState().lines).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('removes all lines and customer', () => {
      const prod1 = makeProduct({ id: 'prod-1' });
      const prod2 = makeProduct({ id: 'prod-2' });

      useCart.getState().addItem(prod1);
      useCart.getState().addItem(prod2);
      useCart.getState().setCustomer({
        id: 'cust-1',
        tenant_id: 'tenant-1',
        company_name: 'Test BV',
        contact_name: 'Jan',
        email: 'jan@test.nl',
        phone: null,
        vat_number: null,
        price_group: null,
        address: null,
        notes: null,
        is_deleted: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      });
      useCart.getState().setNotes('Test notes');

      useCart.getState().clearCart();

      expect(useCart.getState().lines).toHaveLength(0);
      expect(useCart.getState().customer).toBeNull();
      expect(useCart.getState().notes).toBeNull();
    });
  });

  describe('computed values', () => {
    it('calculates subtotal correctly', () => {
      const product = makeProduct({ base_price: 1000 }); // €10.00
      useCart.getState().addItem(product);
      useCart.getState().addItem(product); // qty=2

      // lineTotal(1000, 2, 0) = 2000
      const expected = lineTotal(1000, 2, 0);
      expect(useCart.getState().subtotal()).toBe(expected);
      expect(useCart.getState().subtotal()).toBe(2000);
    });

    it('calculates subtotal with multiple products', () => {
      const prodA = makeProduct({ id: 'a', base_price: 1000 });
      const prodB = makeProduct({ id: 'b', base_price: 500 });

      useCart.getState().addItem(prodA); // 1 x 1000
      useCart.getState().addItem(prodB); // 1 x 500

      expect(useCart.getState().subtotal()).toBe(1500);
    });

    it('calculates taxAmount matching shared utility', () => {
      const product = makeProduct({ base_price: 10000, tax_rate: 2100 }); // €100 at 21%
      useCart.getState().addItem(product);

      const expected = calculateOrderTotals([
        { unit_price: 10000, quantity: 1, discount_pct: 0, tax_rate: 2100 },
      ]);

      expect(useCart.getState().taxAmount()).toBe(expected.taxAmount);
      expect(useCart.getState().taxAmount()).toBe(2100); // €21.00
    });

    it('calculates total (subtotal + tax)', () => {
      const product = makeProduct({ base_price: 10000, tax_rate: 2100 }); // €100 at 21%
      useCart.getState().addItem(product);

      const expected = calculateOrderTotals([
        { unit_price: 10000, quantity: 1, discount_pct: 0, tax_rate: 2100 },
      ]);

      expect(useCart.getState().total()).toBe(expected.total);
      expect(useCart.getState().total()).toBe(12100); // €121.00
    });

    it('calculates itemCount as sum of quantities', () => {
      const prodA = makeProduct({ id: 'a' });
      const prodB = makeProduct({ id: 'b' });

      useCart.getState().addItem(prodA);
      useCart.getState().addItem(prodA); // qty=2
      useCart.getState().addItem(prodB); // qty=1

      expect(useCart.getState().itemCount()).toBe(3);
    });

    it('handles discount in total calculations', () => {
      const product = makeProduct({ base_price: 10000, tax_rate: 2100 });
      useCart.getState().addItem(product);

      // Manually set discount on the line
      const lineId = useCart.getState().lines[0]!.id;
      const store = useCart.getState();
      // Directly update discountPct via Zustand setState
      useCart.setState({
        lines: store.lines.map((l) =>
          l.id === lineId ? { ...l, discountPct: 10 } : l,
        ),
      });

      // lineTotal(10000, 1, 10) = 9000 (10% off)
      expect(useCart.getState().subtotal()).toBe(9000);

      // Tax on 9000 at 21% = 1890
      const expected = calculateOrderTotals([
        { unit_price: 10000, quantity: 1, discount_pct: 10, tax_rate: 2100 },
      ]);
      expect(useCart.getState().taxAmount()).toBe(expected.taxAmount);
      expect(useCart.getState().total()).toBe(expected.total);
    });
  });

  describe('customer and notes', () => {
    it('sets and clears customer', () => {
      const customer = {
        id: 'cust-1',
        tenant_id: 'tenant-1',
        company_name: 'Test BV',
        contact_name: 'Jan',
        email: 'jan@test.nl',
        phone: null,
        vat_number: null,
        price_group: null,
        address: null,
        notes: null,
        is_deleted: false,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      useCart.getState().setCustomer(customer);
      expect(useCart.getState().customer?.id).toBe('cust-1');

      useCart.getState().setCustomer(null);
      expect(useCart.getState().customer).toBeNull();
    });

    it('sets and clears notes', () => {
      useCart.getState().setNotes('Deliver to booth 42');
      expect(useCart.getState().notes).toBe('Deliver to booth 42');

      useCart.getState().setNotes(null);
      expect(useCart.getState().notes).toBeNull();
    });
  });
});
