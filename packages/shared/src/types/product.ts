export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  barcode: string | null; // EAN-13, UPC, etc.
  name: string;
  description: string | null;
  base_price: number; // cents
  tax_rate: number; // basis points: 2100 = 21%
  stock_qty: number;
  image_url: string | null;
  category: string | null;
  attributes: Record<string, unknown>; // flexible: color, size, weight, etc.
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode: string | null;
  name: string; // e.g. "L / Red"
  price_override: number | null; // cents, null = use product base_price
  stock_qty: number;
  attributes: Record<string, unknown>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
