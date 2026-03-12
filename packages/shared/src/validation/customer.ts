import { z } from 'zod';

export const customerAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().length(2), // ISO 3166-1 alpha-2
  province: z.string().optional(),
});

export const createCustomerSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().nullable().default(null),
  email: z.string().email().nullable().default(null),
  phone: z.string().nullable().default(null),
  vat_number: z.string().nullable().default(null),
  price_group: z.string().nullable().default(null),
  address: customerAddressSchema.nullable().default(null),
  notes: z.string().nullable().default(null),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
