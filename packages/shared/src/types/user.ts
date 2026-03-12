export type UserRole = 'admin' | 'manager' | 'sales_rep';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  auth_id: string; // Supabase Auth UID
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
