-- ============================================
-- Row-Level Security Policies for ScanOrder
-- ============================================
-- Every table is scoped to tenant_id extracted from JWT app_metadata.
-- Applied after running migrations.

-- Helper: extract tenant_id from current JWT
-- Usage in policies: get_tenant_id()
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: extract user role from current JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- TENANTS
-- ============================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_select" ON tenants
  FOR SELECT USING (id = get_tenant_id());

-- ============================================
-- USERS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON users
  FOR SELECT USING (tenant_id = get_tenant_id());

-- ============================================
-- PRODUCTS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON products
  FOR SELECT USING (tenant_id = get_tenant_id());

CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (
    tenant_id = get_tenant_id()
    AND get_user_role() IN ('admin', 'manager')
  );

CREATE POLICY "products_update" ON products
  FOR UPDATE USING (
    tenant_id = get_tenant_id()
    AND get_user_role() IN ('admin', 'manager')
  );

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_variants_select" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
      AND products.tenant_id = get_tenant_id()
    )
  );

-- ============================================
-- CUSTOMERS
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON customers
  FOR SELECT USING (tenant_id = get_tenant_id());

CREATE POLICY "customers_insert" ON customers
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());

CREATE POLICY "customers_update" ON customers
  FOR UPDATE USING (tenant_id = get_tenant_id());

-- ============================================
-- EVENTS
-- ============================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON events
  FOR SELECT USING (tenant_id = get_tenant_id());

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (
    tenant_id = get_tenant_id()
    AND get_user_role() IN ('admin', 'manager')
  );

-- ============================================
-- ORDERS
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- All tenant users can see orders
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (tenant_id = get_tenant_id());

-- Sales reps can only insert orders with their own user_id
CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (
    tenant_id = get_tenant_id()
    AND user_id = auth.uid()
  );

-- Managers and admins can update any tenant order
CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (
    tenant_id = get_tenant_id()
    AND get_user_role() IN ('admin', 'manager')
  );

-- ============================================
-- ORDER LINES
-- ============================================
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_lines_select" ON order_lines
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_lines.order_id
      AND orders.tenant_id = get_tenant_id()
    )
  );

CREATE POLICY "order_lines_insert" ON order_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_lines.order_id
      AND orders.tenant_id = get_tenant_id()
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- INTEGRATIONS
-- ============================================
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integrations_select" ON integrations
  FOR SELECT USING (
    tenant_id = get_tenant_id()
    AND get_user_role() = 'admin'
  );

-- ============================================
-- INTEGRATION MAPPINGS
-- ============================================
ALTER TABLE integration_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "integration_mappings_select" ON integration_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM integrations
      WHERE integrations.id = integration_mappings.integration_id
      AND integrations.tenant_id = get_tenant_id()
    )
  );
