export interface CustomerAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string; // ISO 3166-1 alpha-2
  province?: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  vat_number: string | null;
  price_group: string | null; // e.g. "A", "B", "wholesale"
  address: CustomerAddress | null;
  notes: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
