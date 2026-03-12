export type Plan = 'starter' | 'professional' | 'business' | 'event_pass';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  settings: Record<string, unknown>;
  default_currency: string;
  default_tax_rate: number; // basis points: 2100 = 21%
  created_at: string;
  updated_at: string;
}
