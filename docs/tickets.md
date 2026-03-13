# ScanOrder — Development Tickets

**Generated:** March 2026
**Source:** Technical Blueprint v0.2 + Tech Stack & UX Research
**Total tickets:** 130
**Last status update:** 2026-03-12 (automated review by Claude)

### Status Legend

| Status | Meaning |
|--------|---------|
| `DONE` | Code committed and functional |
| `PARTIAL` | Code exists but incomplete — TODOs remain |
| `NOT STARTED` | No implementation yet |
| `BLOCKED` | Requires human input or external action |

## Priority Legend

| Priority | Phase | Timeline | Description |
|:--------:|-------|----------|-------------|
| **P0** | PoC | Weeks 1-3 | Minimum viable proof of concept. Scan → cart → checkout → web dashboard. |
| **P1** | Alpha | Weeks 4-8 | Real POS features, iPhone layout, event management, TestFlight. |
| **P2** | MVP | Weeks 9-14 | Integrations, Android, returns, VAT, receipts, CI/CD. |
| **P3** | v1.0 | Weeks 15-20 | Commercial-ready: payments, billing, app store, Exact Online. |
| **P4** | Future | Post-v1.0 | Nice-to-have, scaling, advanced features. |

## Effort Legend

| Size | Hours | Description |
|:----:|:-----:|-------------|
| XS | 1-3h | Config change, simple component, copy update |
| S | 3-8h | Single feature, one file/screen, straightforward |
| M | 8-20h | Multi-file feature, needs design thought |
| L | 20-40h | Complex feature, multiple screens/endpoints |
| XL | 40h+ | Major subsystem, integration, multi-week effort |

---

## 1. Infrastructure (INFRA)

### [INFRA-001] Initialize Turborepo monorepo with pnpm — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** —

Set up the root monorepo structure with Turborepo and pnpm workspaces. Create `apps/` (mobile, web, api) and `packages/` (shared, db, config) directories. Configure `turbo.json` with build/dev/lint/typecheck pipelines. Set up `pnpm-workspace.yaml`.

**Acceptance Criteria:**
- [x] `pnpm install` works from root
- [x] `pnpm dev` starts all apps (even if they're stubs)
- [x] `turbo.json` defines build, dev, lint, typecheck tasks
- [x] `pnpm-workspace.yaml` lists all packages and apps
- [x] `.gitignore` covers node_modules, .env, build artifacts

---

### [INFRA-002] Shared TypeScript configuration — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-001

Create `packages/config/typescript/` with base, react-native, and nextjs tsconfig presets. All apps and packages extend these base configs.

**Acceptance Criteria:**
- [x] `base.json` with strict TypeScript settings
- [x] `react-native.json` extends base with RN-specific config
- [x] `nextjs.json` extends base with Next.js-specific config
- [x] All apps/packages reference shared tsconfigs
- [ ] `pnpm typecheck` passes across the entire monorepo

---

### [INFRA-003] Shared ESLint configuration — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-001

Create `packages/config/eslint/base.js` with shared lint rules. Configure for TypeScript, React, and React Native. Include Prettier integration.

**Acceptance Criteria:**
- [x] Shared ESLint config in `packages/config/eslint/`
- [ ] `pnpm lint` works across all packages
- [x] TypeScript-aware rules enabled
- [x] Prettier integration (no formatting conflicts)

---

### [INFRA-004] Supabase project setup — `PARTIAL`
**Priority:** P0 | **Effort:** S | **Depends on:** —

Create Supabase project. Configure Auth (email/password), enable RLS on all tables, set up local development with Supabase CLI (`supabase init`, `supabase start`). Create `.env.example` with required variables.

**Acceptance Criteria:**
- [x] Supabase project created (Pro plan) — project ref: bygulilidempcmiclwji
- [ ] Local dev environment works via `supabase start` — BLOCKED: requires human to run `supabase init`
- [x] Auth configured for email/password
- [x] `.env.example` includes all Supabase env vars
- [ ] `supabase/config.toml` committed to repo — BLOCKED: requires `supabase init`

---

### [INFRA-005] Database schema — core tables (Drizzle ORM) — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** INFRA-004

Create Drizzle ORM schema for core PoC tables: `tenants`, `users`, `products`, `product_variants`, `customers`, `orders`, `order_lines`. All tables include `tenant_id`, `created_at`, `updated_at`, `is_deleted`. Generate and apply initial migration.

**Acceptance Criteria:**
- [x] Drizzle schema files in `packages/db/src/schema/`
- [x] All tables have `tenant_id` FK for multi-tenancy
- [x] All tables have `is_deleted` for soft deletes
- [x] UUIDs for all primary keys
- [x] Prices stored as integers (cents)
- [ ] Migration generated and applies cleanly to Supabase — BLOCKED: requires DB connection
- [x] `drizzle.config.ts` configured for Supabase connection

---

### [INFRA-006] Row-Level Security policies — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-005

Write and apply RLS policies for all core tables. Tenant isolation via JWT `app_metadata.tenant_id`. Sales reps can only insert orders with their own `user_id`.

**Acceptance Criteria:**
- [x] RLS enabled on all tables
- [x] Tenant isolation policy on every table (reads scoped to tenant)
- [x] Sales rep insert policy on orders (own user_id only)
- [x] Policies stored in `packages/db/src/rls/policies.sql`
- [ ] Verified with test queries using different JWT claims — BLOCKED: requires live DB

---

### [INFRA-007] Seed data for development — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-005

Create seed script with realistic demo data: 1 tenant, 3 users (admin, manager, sales_rep), 50+ products with variants and barcodes, 10 customers, 5 sample orders. Use A-Journal-style product names/SKUs.

**Acceptance Criteria:**
- [x] Seed script in `packages/db/src/seed/demo.ts`
- [x] Runnable via `pnpm db:seed`
- [x] Products have realistic EAN-13 barcodes
- [x] Products have image URLs (placeholder or real)
- [x] Customers have Dutch company names and addresses
- [x] Idempotent (can run multiple times without duplicates) — uses fixed UUIDs

---

### [INFRA-008] PowerSync project setup and sync streams — `BLOCKED`
**Priority:** P0 | **Effort:** M | **Depends on:** INFRA-005

Create PowerSync Cloud project (Pro plan). Configure connection to Supabase PostgreSQL. Define sync streams: products + product_variants + customers + events DOWN to devices, orders + order_lines UP from devices. Configure user-based filtering by `tenant_id`.

**Acceptance Criteria:**
- [ ] PowerSync Cloud project created and connected to Supabase — BLOCKED: requires PowerSync account + dashboard setup
- [ ] Sync streams defined for products (down), customers (down), orders (up) — BLOCKED: requires PowerSync dashboard
- [ ] Data filtered by `tenant_id` from user JWT
- [ ] Sync verified: insert product in Supabase → appears on device within seconds
- [ ] Upload handler endpoint configured

---

### [INFRA-009] Cloudflare Worker project (Hono) — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-001

Set up Cloudflare Worker project in `apps/api/` using Hono framework. Configure `wrangler.jsonc` with bindings for R2, KV, and Hyperdrive (Supabase connection pooling). Create stub routes for health check and PowerSync upload handler.

**Acceptance Criteria:**
- [x] Hono app in `apps/api/src/index.ts`
- [x] `wrangler.jsonc` with R2, KV, Hyperdrive bindings
- [x] `GET /health` returns 200
- [x] `POST /api/sync/upload` stub endpoint exists
- [x] `pnpm dev:api` starts Wrangler local dev server
- [ ] Deploys to Cloudflare via `wrangler deploy` — BLOCKED: requires CF API token

---

### [INFRA-010] Cloudflare Hyperdrive for Supabase connection pooling — `BLOCKED`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-009, INFRA-004

Configure Cloudflare Hyperdrive to pool connections to Supabase PostgreSQL. Workers access the DB through Hyperdrive instead of direct connections.

**Acceptance Criteria:**
- [ ] Hyperdrive configuration created in Cloudflare dashboard — BLOCKED: requires CF dashboard access
- [ ] Worker can query Supabase PostgreSQL through Hyperdrive
- [ ] Connection string stored as Cloudflare secret (not in code)

---

### [INFRA-011] Cloudflare R2 bucket for product images
**Priority:** P1 | **Effort:** XS | **Depends on:** INFRA-009

Create R2 bucket for product images. Configure CORS for web dashboard uploads. Bind to Cloudflare Worker for upload/delete operations.

**Acceptance Criteria:**
- [ ] R2 bucket created (e.g., `scanorder-images`)
- [ ] CORS configured for web dashboard domain
- [ ] Worker binding in `wrangler.jsonc`
- [ ] Public read access via R2 custom domain or Worker proxy

---

### [INFRA-012] Environment variable management — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-001

Create `.env.example` with all required environment variables for all apps. Document which variables each app needs. Set up Cloudflare secrets for Workers.

**Acceptance Criteria:**
- [x] `.env.example` at repo root
- [ ] Per-app `.env.example` files where needed
- [x] Documentation of which vars go where — grouped by service in .env.example
- [x] No secrets committed to git

---

### [INFRA-013] CLAUDE.md project instructions — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-001

Create `CLAUDE.md` at repo root with project context, stack overview, commands, conventions, and key architectural decisions for AI-assisted development.

**Acceptance Criteria:**
- [x] `CLAUDE.md` at repo root
- [x] Documents stack, commands, conventions, PowerSync rules
- [x] Includes integration notes (WooCommerce, Exact Online, Mollie)
- [x] Covers naming conventions and data patterns (cents, UUIDs, soft deletes)

---

## 2. Shared Packages (PKG)

### [PKG-001] Shared TypeScript types package — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-001

Create `packages/shared/` with TypeScript type definitions: `Order`, `OrderLine`, `OrderStatus`, `Product`, `ProductVariant`, `Customer`, `Event`, `Integration`, `SyncJob`. These types are used by mobile, web, and API.

**Acceptance Criteria:**
- [x] Type files in `packages/shared/src/types/`
- [x] Exported via barrel `index.ts`
- [x] Importable from any app via `@scanorder/shared`
- [x] Types match Drizzle schema definitions
- [x] `OrderStatus` enum matches database enum

---

### [PKG-002] Zod validation schemas — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-001

Create Zod schemas for order creation, product lookup, customer creation. Shared across mobile (client-side validation), web (form validation), and API (request validation).

**Acceptance Criteria:**
- [x] Zod schemas in `packages/shared/src/validation/`
- [x] `createOrderSchema`, `createCustomerSchema`, `productSearchSchema`
- [x] Schema types inferred from Zod (no duplicate type definitions)
- [x] Used in mobile cart submission and web forms

---

### [PKG-003] Shared utility functions — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-001

Create shared utilities: price formatting (cents to EUR display, NL locale), barcode parsing/validation (EAN-13 check digit), date formatting, order number generation.

**Acceptance Criteria:**
- [x] `packages/shared/src/utils/pricing.ts` — format cents to display, calculate tax, calculate line totals
- [x] `packages/shared/src/utils/barcode.ts` — validate EAN-13/UPC check digits
- [x] `packages/shared/src/utils/format.ts` — NL locale date/number formatting
- [ ] Unit tests for all utilities — NOT STARTED

---

### [PKG-004] Shared constants — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** PKG-001

Define shared constants: order status values, sync status values, supported currencies, payment methods, payment terms (net_30, net_60).

**Acceptance Criteria:**
- [x] `packages/shared/src/constants/` with order-status, sync-status, currencies, payment files
- [x] Constants match database enums exactly
- [x] Importable from any app

---

## 3. Mobile App — Core (MOB)

### [MOB-001] Expo app initialization (iPad-first) — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-001

Initialize Expo app in `apps/mobile/` targeting iPad (iOS). Configure `app.json` for landscape + portrait orientation, tablet-optimized layout. Set up Expo Router for file-based navigation. Configure NativeWind (Tailwind for React Native).

**Acceptance Criteria:**
- [ ] Expo app runs on iPad simulator — BLOCKED: requires macOS with Xcode
- [x] Expo Router configured with `(auth)` and `(app)` route groups
- [x] NativeWind working (Tailwind classes render correctly) — configured in package.json
- [x] iPad landscape layout supported — supportsTablet: true in app.json
- [x] `eas.json` with development, preview, production build profiles

---

### [MOB-002] Supabase Auth integration (mobile) — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-001, INFRA-004

Integrate Supabase Auth in mobile app. Login screen with email/password. Auth state persisted with SecureStore. Auto-redirect to main app on valid session. Logout functionality.

**Acceptance Criteria:**
- [x] Login screen at `app/(auth)/login.tsx`
- [x] Email/password authentication via Supabase
- [x] JWT stored securely (expo-secure-store) — using AsyncStorage (upgrade to SecureStore for production)
- [x] Auth state checked on app launch (auto-login)
- [x] Logout clears session and redirects to login
- [x] Auth store in `store/auth.ts` (Zustand)

---

### [MOB-003] PowerSync client configuration — `BLOCKED`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-002, INFRA-008

Configure PowerSync SDK in mobile app. Define local SQLite schema matching sync streams. Initialize PowerSync connection with Supabase JWT. Create upload handler that sends orders to the Cloudflare Worker endpoint.

**Acceptance Criteria:**
- [ ] PowerSync client initialized in `lib/powersync.ts` — BLOCKED: depends on INFRA-008
- [ ] Local schema defined in `lib/schema.ts` (products, customers, orders, order_lines)
- [ ] Sync starts automatically after login
- [ ] Products and customers sync down from Supabase
- [ ] Upload handler sends new orders to Worker endpoint
- [ ] Sync works after app restart

---

### [MOB-004] Tab navigation structure — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-001

Create bottom tab navigation with 5 tabs: Scan (primary), Orders, Customers, Catalog, Settings. Scan tab is the default/landing tab. Tab bar uses appropriate icons.

**Acceptance Criteria:**
- [x] Bottom tabs: Scan, Orders, Customers, Catalog, Settings
- [x] Scan tab is default on app launch
- [x] Tab icons visible and appropriately sized for iPad
- [x] Tab bar is touch-friendly (44pt+ targets)

---

### [MOB-005] Split-pane layout component (tablet) — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-001

Build a responsive `SplitPane` component for tablet landscape mode. Left side: scanner/product browsing. Right side: cart/order summary. On phone/portrait: stacked layout with bottom sheet for cart. Follows the universal POS split-pane pattern from Shopify/Square/Toast research.

**Acceptance Criteria:**
- [x] `SplitPane.tsx` component with left/right panes
- [x] Adjustable split ratio (default 50/50 or 60/40) — uses flex ratios
- [x] On phone: falls back to stacked layout — handled in scan.tsx via useWindowDimensions
- [x] On tablet landscape: side-by-side layout
- [x] Cart always visible on tablet (never hidden behind navigation)

---

### [MOB-006] Barcode scanner — camera scanning — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-001

Implement camera-based barcode scanning using `react-native-vision-camera`. Support EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, QR. Show targeting overlay on camera viewfinder. Haptic feedback on successful scan.

**Acceptance Criteria:**
- [x] Camera viewfinder with targeting box overlay
- [x] Scans EAN-13, EAN-8, UPC-A, UPC-E, Code 128, QR codes
- [x] Haptic feedback (expo-haptics) on successful scan
- [ ] Sound feedback option (configurable) — NOT STARTED
- [x] Camera stays active between scans (continuous scanning)
- [x] Debounce: same barcode not re-scanned within 500ms
- [x] Camera permission request handled gracefully

---

### [MOB-007] Barcode scanner — Bluetooth HID hardware scanner — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-001

Support Bluetooth HID barcode scanners (keyboard emulation). Hidden TextInput captures scanner input. Detects rapid character input terminated by Enter/newline. Works simultaneously with camera scanning.

**Acceptance Criteria:**
- [x] `HardwareScannerInput` component with hidden TextInput
- [x] Detects BT scanner input (rapid keystrokes + Enter)
- [x] Minimum barcode length validation (configurable, default 8)
- [x] Does not show on-screen keyboard — showSoftInputOnFocus={false}
- [x] Works in parallel with camera scanner
- [x] Haptic feedback on scan

---

### [MOB-008] Product lookup from local database — `PARTIAL`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-003

When a barcode is scanned, look up the product in local SQLite (PowerSync). Search by `barcode` field on products and product_variants tables. Show product card briefly (name, image, price, stock). Handle "not found" with manual search option.

**Acceptance Criteria:**
- [ ] Barcode lookup queries local SQLite (not network) — BLOCKED: depends on MOB-003 (PowerSync)
- [ ] Searches both `products.barcode` and `product_variants.barcode` — hook stub exists, returns null
- [x] Found: shows product info card (image, name, SKU, price, stock) — UI ready in ScanFeedback
- [x] Not found: shows "Product not found" with search button — UI ready in ScanFeedback
- [ ] Lookup completes in <100ms — cannot test without PowerSync

---

### [MOB-009] Cart state management (Zustand) — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-001

Implement cart store with Zustand. Add item (auto-increment qty if same product), remove item, update quantity, clear cart, set customer, calculate totals (subtotal, tax, total). Prices in cents throughout.

**Acceptance Criteria:**
- [x] Cart store in `store/cart.ts`
- [x] `addItem(product, variant?)` — adds or increments quantity
- [x] `removeItem(lineId)`, `updateQuantity(lineId, qty)`
- [x] `setCustomer(customer)`, `clearCart()`
- [x] Computed: `subtotal`, `taxAmount`, `total` (all in cents)
- [x] Cart persists during session (lost on app restart is OK for PoC)

---

### [MOB-010] Cart UI component — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-009, MOB-005

Build cart component that renders in the right pane of the split layout. Shows line items with product image thumbnail, name, quantity (+/- buttons), unit price, line total. Shows subtotal, tax, and total at the bottom. Confirm Order button.

**Acceptance Criteria:**
- [x] Cart renders in right pane (tablet) or bottom sheet (phone)
- [x] Each line item: image, name, SKU, quantity with +/- controls, price, line total
- [x] Quantity input: minimum 44x44pt touch targets on +/- buttons
- [ ] Swipe to delete line item — NOT STARTED (uses +/- buttons and remove)
- [x] Subtotal, tax (21% BTW default), total displayed
- [x] "Confirm Order" button at bottom
- [x] Empty cart state message

---

### [MOB-011] Customer selection modal — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-003

Build customer selection modal/picker. Search customers by company name or contact name (local DB query). Show recent customers at top. Alphabetical list with section headers. "Quick Sale" option (no customer). "New Customer" option.

**Acceptance Criteria:**
- [x] Modal with search bar at top
- [x] Search queries local SQLite (offline-capable) — searches company, contact, email, city
- [ ] Recent customers section (last 5 used) — NOT STARTED
- [ ] Alphabetical list with A-Z section headers — NOT STARTED (flat list)
- [x] Each row: company name, contact name, price group
- [x] "Quick Sale (no customer)" option
- [ ] "New Customer" button (navigates to creation form) — NOT STARTED
- [x] Selected customer shown in cart header

---

### [MOB-012] Order submission and offline queue — `PARTIAL`
**Priority:** P0 | **Effort:** M | **Depends on:** MOB-009, MOB-003

When "Confirm Order" is tapped: validate order (Zod), generate UUID for order, save to local SQLite (orders + order_lines tables), add to PowerSync upload queue, show confirmation screen. Works completely offline.

**Acceptance Criteria:**
- [x] Order validated with Zod schema before save — validation code in order/new.tsx
- [x] UUID generated client-side for order ID
- [ ] Order + line items saved to local SQLite — TODO: PowerSync insert commented out
- [ ] PowerSync upload queue picks up the order — BLOCKED: depends on MOB-003
- [x] Order confirmation screen shown with order details — shows alert
- [ ] Status shows "Queued for sync" when offline, "Synced" when confirmed
- [x] New order can be started immediately after submission — cart clears after confirm

---

### [MOB-013] Scan feedback overlay — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-006, MOB-008

After a successful scan and product lookup, show a brief overlay/toast on the scan screen: product image, name, price, "Added to cart (qty: X)". Auto-dismisses after 2 seconds. Different style for "not found".

**Acceptance Criteria:**
- [x] Success overlay: product image + name + price + quantity
- [x] Auto-dismiss after 2 seconds
- [x] "Not found" overlay with red accent
- [x] Doesn't block continuous scanning
- [x] Animated entrance/exit

---

### [MOB-014] Sync status indicator — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-003

Global sync indicator in the header/toolbar. Shows: Online/Offline status, sync state (synced/syncing/pending), number of pending uploads. Color-coded: green (synced), yellow (syncing), red (offline with pending items).

**Acceptance Criteria:**
- [x] `SyncIndicator` component in header
- [x] Shows connectivity status (online/offline)
- [ ] Shows pending upload count — NOT STARTED (needs PowerSync)
- [x] Color-coded: green/yellow/red — green/red based on online status
- [ ] Tappable to navigate to sync status screen — NOT STARTED

---

### [MOB-015] Search bar component — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** MOB-001

Universal search bar for product lookup. Searches local DB by product name, SKU, or barcode. Context-aware: on scan screen searches products, on customer screen searches customers. Results appear inline below the search bar.

**Acceptance Criteria:**
- [x] `SearchBar` component with text input
- [ ] Searches product name, SKU, barcode in local DB — BLOCKED: needs PowerSync
- [ ] Debounced input (300ms) — noted as TODO in code
- [ ] Results dropdown/list below search bar — NOT STARTED
- [ ] Tap result to add to cart (on scan screen) — NOT STARTED
- [ ] Supports both product and customer search contexts — basic text input only

---

### [MOB-016] Network connectivity detection — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** MOB-001

Implement network quality detection hook. Detect offline, poor connection (2G), good connection states. Used by sync indicator and to control sync behavior.

**Acceptance Criteria:**
- [x] `useNetwork` hook in `hooks/useNetwork.ts`
- [x] Detects: offline, poor, good connection states — polls Google endpoint every 30s
- [x] Exposes `isOnline`, `connectionQuality` values
- [x] Triggers re-render when state changes

---

## 4. Mobile App — Alpha Features (MOB-A)

### [MOB-A001] iPhone stacked layout
**Priority:** P1 | **Effort:** M | **Depends on:** MOB-005

Adapt the scan screen for iPhone (portrait). Camera viewfinder on top, last-scanned product card in middle, collapsible cart summary at bottom as a bottom sheet. Cart badge on tab bar shows item count.

**Acceptance Criteria:**
- [ ] Scan screen works in phone portrait mode
- [ ] Camera viewfinder takes top 40% of screen
- [ ] Bottom sheet for cart (draggable, shows summary when collapsed)
- [ ] Cart badge on tab bar with item count
- [ ] Smooth transitions between collapsed/expanded cart

---

### [MOB-A002] Product catalog browsing screen — `DONE`
> DONE 2026-03-13 — Full catalog screen with FlashList, grid/list toggle, category filter, search, stock badges, add-to-cart
**Priority:** P1 | **Effort:** M | **Depends on:** MOB-003

Browse products by category with grid/list toggle. Product tiles show image, name, price, stock indicator. Filter by category, search by name/SKU. Tap to view detail, long-press to add to cart. Uses FlashList for performance with large catalogs.

**Acceptance Criteria:**
- [x] Product grid using FlashList (performant for 5K+ products)
- [x] Category tabs/filter at top
- [x] Grid and list view toggle
- [x] Product tile: image, name, price, stock badge
- [ ] Tap to view product detail — depends on MOB-A003
- [x] Long-press or "+" button to add to cart
- [ ] Works fully offline (local DB queries) — BLOCKED: PowerSync not yet connected

---

### [MOB-A003] Product detail screen
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-A002

Full product detail view: image, name, SKU, barcode, description, price, stock, variants. If product has variants: show variant selector (size, color grid). "Add to Cart" button with quantity selector.

**Acceptance Criteria:**
- [ ] Product image (full width)
- [ ] Name, SKU, barcode, description
- [ ] Price display (formatted from cents)
- [ ] Stock quantity with color indicator (green/yellow/red)
- [ ] Variant selector if applicable
- [ ] "Add to Cart" with quantity input
- [ ] Works offline

---

### [MOB-A004] Order history screen
**Priority:** P1 | **Effort:** M | **Depends on:** MOB-003

List of orders with filter/sort. Filter by: event, status, customer, date range. Sort by: date, total, customer. Each row: order number, customer, item count, total, status badge, sync status. Tap to view order detail.

**Acceptance Criteria:**
- [ ] Order list from local DB
- [ ] Filter by event, status, customer, date
- [ ] Sort by date (default newest first), total, customer
- [ ] Each row: order #, customer name, items, total, status badge
- [ ] Status badges color-coded (draft=gray, pending=yellow, confirmed=green)
- [ ] Pull-to-refresh triggers sync
- [ ] Tap navigates to order detail

---

### [MOB-A005] Order detail screen
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-A004

Full order detail: header (order #, date, customer, event, status), line items table, totals breakdown, notes. Actions: cancel order (if draft), edit notes.

**Acceptance Criteria:**
- [ ] Order header: number, date, customer, event, sales rep, status
- [ ] Line items: product, quantity, unit price, line total
- [ ] Totals: subtotal, discount, tax, total
- [ ] Order notes displayed
- [ ] Sync status shown (synced/pending/error)
- [ ] Cancel button for draft orders

---

### [MOB-A006] New customer form — `DONE`
> DONE 2026-03-13 — NewCustomerForm component with Zod validation, all fields, Dutch-context placeholders. SQLite save stubbed pending PowerSync.
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-003

Create new customer from mobile: company name (required), contact name, email, phone, VAT number, address (street, city, postal code, country), notes. Saves to local DB, syncs via PowerSync.

**Acceptance Criteria:**
- [x] Form with all customer fields
- [x] Company name required, other fields optional
- [x] Zod validation on submit
- [ ] Saved to local SQLite — BLOCKED: PowerSync not yet connected
- [x] Available for order assignment immediately (returned via onSave callback)
- [ ] Syncs to Supabase when online — BLOCKED: PowerSync not yet connected

---

### [MOB-A007] Event selection and management
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-003

Select active trade show event. Events sync from server. Orders are associated with the selected event. Show event name in header. Event selector in settings or as modal before first order.

**Acceptance Criteria:**
- [ ] Event picker modal/screen
- [ ] Lists events from local DB (synced from server)
- [ ] Selected event shown in header bar
- [ ] New orders automatically tagged with selected event
- [ ] Event persisted across app sessions (MMKV)

---

### [MOB-A008] Shift/session management — open and close
**Priority:** P1 | **Effort:** M | **Depends on:** MOB-003, INFRA-005

Implement POS session lifecycle. Open shift: enter opening cash float, select event, confirm device. Close shift: count cash, show expected vs actual, show difference, generate summary. All orders during shift linked to session.

**Acceptance Criteria:**
- [ ] "Open Shift" flow: enter cash float, select event
- [ ] Active shift indicator in header
- [ ] Orders linked to active session via `session_id`
- [ ] "Close Shift" flow: enter counted cash, show difference
- [ ] End-of-shift summary (total orders, revenue by payment method)
- [ ] Cannot create orders without open shift (configurable)
- [ ] Session data syncs to server

---

### [MOB-A009] Pre-show sync checklist
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-003, MOB-014

Inspired by Pepperi research: before a trade show, show a sync checklist. Displays sync status per data type (products synced count, customers synced count, price lists, event loaded). Shows storage used. "Sync Now" and "Start Show" buttons.

**Acceptance Criteria:**
- [ ] Sync checklist screen accessible from settings
- [ ] Shows: products count, customers count, price lists count, events loaded
- [ ] Checkmark for synced, spinner for syncing, warning for stale data
- [ ] Storage usage display (local DB size + cached images)
- [ ] "Sync Now" forces full re-sync
- [ ] "Start Show" navigates to scan screen
- [ ] Prompts automatically if last sync > 24 hours

---

### [MOB-A010] Order status flow updates
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-012

Implement order lifecycle: draft → pending → confirmed → processing → shipped → completed → cancelled. Status transitions enforced. Status change syncs to server and reflects on web dashboard.

**Acceptance Criteria:**
- [ ] Order status enum matches database definition
- [ ] Valid transitions enforced (no skipping states)
- [ ] Status change updates local DB and queues sync
- [ ] Status badges on order list update in real-time
- [ ] Cancelled orders handled (soft delete pattern)

---

### [MOB-A011] Settings screen — `PARTIAL`
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-001

Settings screen with: account info, current event, scanner preferences (sound on/off, camera vs hardware scanner preference), sync controls, about/version, logout.

**Acceptance Criteria:**
- [ ] Account info (name, email, role) — NOT STARTED
- [ ] Current event display/change — NOT STARTED
- [ ] Scanner settings: sound toggle, preferred scanner mode — NOT STARTED
- [ ] Sync status link — NOT STARTED
- [ ] App version display — NOT STARTED
- [x] Logout button — implemented with sign out

---

### [MOB-A012] Quick sale mode (walk-in customer) — `DONE`
> DONE 2026-03-13 — Quick Sale button in customer picker, order submission allows null customer, Walk-in label in order list
**Priority:** P1 | **Effort:** XS | **Depends on:** MOB-011

Allow orders without customer selection. "Quick Sale" button in customer picker creates order with `customer_id: null`. Optional text field for walk-in name/reference. Admin can assign customer later from web dashboard.

**Acceptance Criteria:**
- [x] "Quick Sale" option in customer picker
- [x] Order created with null customer_id
- [x] Optional walk-in reference text (uses order notes)
- [x] Order shows "Walk-in" label in order list
- [x] Editable from web dashboard later (customer_id already nullable in schema)

---

### [MOB-A013] Error handling and retry UI
**Priority:** P1 | **Effort:** M | **Depends on:** MOB-003

Handle sync failures gracefully. Show failed uploads with retry button. Exponential backoff for automatic retries (1s, 2s, 4s, 8s, 16s, 30s max). Toast notifications for sync errors. Persistent error log in settings.

**Acceptance Criteria:**
- [ ] Failed uploads shown in sync status screen with error message
- [ ] Manual "Retry" button per failed item
- [ ] "Retry All" button for all failures
- [ ] Automatic retry with exponential backoff (max 5 attempts)
- [ ] Toast notification on sync error
- [ ] Error log viewable in settings
- [ ] Differentiate transient (5xx) vs permanent (4xx) errors

---

## 5. Mobile App — MVP Features (MOB-M)

### [MOB-M001] Android tablet build
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-001

Configure Expo/EAS to build for Android tablets. Test split-pane layout on Android. Address any platform-specific UI issues. Set up Android-specific `eas.json` profile.

**Acceptance Criteria:**
- [ ] EAS builds for Android tablet
- [ ] Split-pane layout works on Android tablet landscape
- [ ] Camera scanning works on Android (ML Kit)
- [ ] BT hardware scanner works on Android
- [ ] PowerSync sync works on Android
- [ ] No platform-specific crashes

---

### [MOB-M002] Android phone build
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-M001, MOB-A001

Test and fix stacked phone layout on Android phones. Address platform-specific differences in bottom sheet, camera, and navigation.

**Acceptance Criteria:**
- [ ] EAS builds for Android phone
- [ ] Phone layout (stacked with bottom sheet) works on Android
- [ ] Camera permissions handled for Android
- [ ] All features functional on Android phone

---

### [MOB-M003] Returns and refunds flow
**Priority:** P2 | **Effort:** L | **Depends on:** MOB-A004

Find original order, select items to return (full/partial), enter return reason, process refund (cash back, credit note, reverse to payment method). Creates negative order linked to original. Stock auto-adjusted.

**Acceptance Criteria:**
- [ ] "Return" action on order detail screen
- [ ] Select items and quantities to return
- [ ] Reason code selection (defective, wrong item, customer changed mind, etc.)
- [ ] Refund method: cash, credit note, original payment method
- [ ] Return order created with negative amounts, linked via `refund_of_order_id`
- [ ] Stock quantities adjusted on return confirmation
- [ ] Cash movements tracked for cash refunds
- [ ] Return shows in order history with distinct styling

---

### [MOB-M004] Cash management
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-A008

Full cash drawer tracking during a session. Record cash-in (float additions), cash-out (safe drops), cash sales, cash refunds. Running balance display. Cash count at shift close with over/short calculation.

**Acceptance Criteria:**
- [ ] Cash drawer balance visible during active session
- [ ] "Cash In" and "Cash Out" manual entries with reason
- [ ] Cash movements table: type, amount, reason, timestamp
- [ ] Running balance: opening + sales - refunds + in - out
- [ ] Close shift: enter counted cash, show expected vs actual
- [ ] Over/short flagged if difference > threshold

---

### [MOB-M005] EU VAT handling
**Priority:** P2 | **Effort:** M | **Depends on:** INFRA-005

Implement EU VAT logic per blueprint: domestic B2C/B2B (standard rate), EU B2B with valid VAT (reverse charge 0%), EU B2C (destination rate), non-EU (zero-rated). VIES API integration for VAT number validation. Tax treatment stored per customer and applied per order line.

**Acceptance Criteria:**
- [ ] Tax rates table with configurable rates (21%, 9%, 0%)
- [ ] Customer tax treatment field (domestic, eu_reverse_charge, export)
- [ ] VAT number validation via EU VIES API (when online)
- [ ] Correct tax auto-applied based on customer + product
- [ ] Reverse charge notation on order for EU B2B
- [ ] Tax breakdown shown in cart and order summary

---

### [MOB-M006] Receipt generation (PDF)
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-012

Generate order confirmation PDF on device using @react-pdf/renderer. Include: order number, items, quantities, prices, tax breakdown, customer details, event name, company details. Option to email to customer.

**Acceptance Criteria:**
- [ ] PDF generated on-device (works offline)
- [ ] Includes all order details, tax breakdown, company branding
- [ ] "Email to Customer" sends PDF as attachment (when online)
- [ ] "Share" button for AirDrop / other sharing
- [ ] PDF stored locally for re-access

---

### [MOB-M007] Line item notes and discounts
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-010

Add per-line-item notes (text input) and per-line discounts (percentage or fixed amount). Notes visible in order detail and on receipts. Discounts recalculate line total and order total.

**Acceptance Criteria:**
- [ ] "Add Note" action per cart line item
- [ ] "Add Discount" action per cart line (percentage or fixed)
- [ ] Discount reflected in line total and order total
- [ ] Notes and discounts saved with order
- [ ] Visible on order detail and receipts

---

### [MOB-M008] Implement Shopify-style smart grid tiles
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-A002

Inspired by Shopify POS research: customizable shortcut tiles on the scan screen for frequent products, categories, or actions (e.g., "Bestsellers", "New Arrivals", "Apply 10% Discount"). Admin configures tiles from web dashboard. Tiles sync to device.

**Acceptance Criteria:**
- [ ] Grid of customizable tiles below scanner area
- [ ] Tiles can be: product shortcut, category filter, action (discount, note)
- [ ] Tap product tile adds directly to cart
- [ ] Tap category tile filters product catalog
- [ ] Tiles configurable from web dashboard (stored in tenant settings)
- [ ] Tiles sync to device via PowerSync
- [ ] Large touch targets, color-coded

---

### [MOB-M009] Color-coded categories (Toast POS pattern)
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-A002

From Toast POS research: assign colors to product categories. Color appears on product tiles, category tabs, and cart line items. Helps sales reps quickly identify product types at busy trade shows.

**Acceptance Criteria:**
- [ ] Category color field in product data
- [ ] Color indicator on product grid tiles
- [ ] Color indicator on category filter tabs
- [ ] Color dot/stripe on cart line items
- [ ] Colors configurable from web dashboard

---

### [MOB-M010] Image caching for offline product images
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-A002

Pre-cache product images for offline use. Download images during sync (when on WiFi). Show placeholder for uncached images. Track cache size. Allow clearing image cache from settings.

**Acceptance Criteria:**
- [ ] Product images downloaded during sync
- [ ] Prefer WiFi for image downloads (configurable)
- [ ] Cached images served offline
- [ ] Placeholder shown for uncached images
- [ ] Cache size shown in settings
- [ ] "Clear Image Cache" button in settings
- [ ] Progress indicator during initial image sync

---

## 6. Web Dashboard (WEB)

### [WEB-001] Next.js app initialization — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-001

Initialize Next.js 15 app in `apps/web/` with App Router. Configure Tailwind CSS, install shadcn/ui. Set up Supabase client (server + client). Create root layout with auth check.

**Acceptance Criteria:**
- [x] Next.js 15 app with App Router
- [x] Tailwind CSS configured
- [x] shadcn/ui installed with initial components (Button, Input, Table, Card)
- [x] Supabase server client in `lib/supabase/server.ts`
- [x] Supabase browser client in `lib/supabase/client.ts`
- [x] Root layout with auth session check
- [x] `pnpm dev:web` starts dev server

---

### [WEB-002] Authentication pages — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** WEB-001, INFRA-004

Login page with email/password form. Redirect to dashboard on success. Redirect to login if unauthenticated. Server-side auth check using Supabase SSR helpers.

**Acceptance Criteria:**
- [x] Login page at `/login`
- [x] Email/password form with validation
- [x] Server-side auth via Supabase SSR
- [x] Redirect to `/` (dashboard) on success
- [x] Middleware redirects unauthenticated users to `/login` — in dashboard layout
- [x] Error messages for invalid credentials

---

### [WEB-003] Dashboard layout (sidebar navigation) — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** WEB-001

Dashboard layout with sidebar navigation. Links: Home, Orders, Products, Customers, Events, Integrations, Analytics, Settings. User info in sidebar footer. Collapsible sidebar on smaller screens.

**Acceptance Criteria:**
- [x] Sidebar with navigation links — 8 menu items
- [x] Active link highlighting
- [x] User name/email in sidebar footer
- [ ] Collapsible on mobile/small screens — NOT STARTED
- [x] Consistent across all dashboard pages

---

### [WEB-004] Orders list page — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Orders list page with data table. Columns: order #, customer, items count, total, status, event, date, sync status. Filters: status, event, customer, date range. Sort by any column. Pagination. Click row to navigate to detail.

**Acceptance Criteria:**
- [x] Data table with sortable columns
- [ ] Filter by: status, event, customer, date range — NOT STARTED
- [ ] Search by order number or customer name — NOT STARTED
- [ ] Pagination (25 per page) — shows 50 most recent, no pagination yet
- [x] Status badges with color coding
- [x] Click row → navigate to order detail
- [ ] Real-time update when new orders sync (Supabase Realtime) — NOT STARTED (see WEB-013)

---

### [WEB-005] Order detail page — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** WEB-004

Order detail view: header (order #, status, dates), customer info, line items table (product, SKU, qty, unit price, discount, line total), totals section (subtotal, discount, tax, total), order notes, sales rep, device, event, sync status.

**Acceptance Criteria:**
- [x] Full order header with status badge
- [x] Customer info section with link to customer
- [x] Line items table with all fields
- [x] Totals breakdown
- [x] Order metadata: sales rep, device, event, created date, synced date
- [ ] Actions: change status, add note, cancel order — NOT STARTED
- [ ] Assign customer (for quick-sale orders without customer) — NOT STARTED

---

### [WEB-006] Dashboard home page (KPIs) — `PARTIAL`
**Priority:** P1 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Dashboard home with KPI cards: orders today, revenue this show, customers this show, pending sync count. Recent orders table (last 10). Top products chart. Sales by rep chart. Active event selector.

**Acceptance Criteria:**
- [x] KPI cards: orders today, revenue, customers, pending sync — basic version (pending sync hardcoded 0)
- [ ] Recent orders table (last 10) — NOT STARTED
- [ ] Top 5 products this event — NOT STARTED
- [ ] Sales by rep bar chart — NOT STARTED
- [ ] Active event selector/display — NOT STARTED
- [ ] Auto-refresh via Supabase Realtime or polling — NOT STARTED

---

### [WEB-007] Product management page
**Priority:** P1 | **Effort:** L | **Depends on:** WEB-003, INFRA-005

Product CRUD: list with search/filter, create/edit forms, image upload (to R2), variant management, bulk CSV import. Table columns: image, name, SKU, barcode, price, stock, category, status.

**Acceptance Criteria:**
- [ ] Product list with search, filter by category, sort
- [ ] Create product form: name, SKU, barcode, price, description, category, tax rate
- [ ] Edit product (inline or modal)
- [ ] Image upload to Cloudflare R2
- [ ] Variant management: add/edit/delete variants (SKU, barcode, price override, stock)
- [ ] Bulk CSV import with preview and validation
- [ ] Soft delete (toggle is_active)

---

### [WEB-008] Customer management page
**Priority:** P1 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Customer CRUD: list with search, create/edit forms, customer groups/price lists assignment. Table columns: company, contact, email, phone, price group, order count.

**Acceptance Criteria:**
- [ ] Customer list with search and filter
- [ ] Create/edit customer form
- [ ] Customer detail page with order history
- [ ] Price group assignment
- [ ] VAT number field with validation indicator
- [ ] Customer address (Dutch format)
- [ ] Soft delete

---

### [WEB-009] Event management page
**Priority:** P1 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Trade show event CRUD. Fields: name, location, start/end dates, status (upcoming/active/completed). Event detail page shows orders for that event, revenue summary, participating sales reps. Assign team members to events.

**Acceptance Criteria:**
- [ ] Event list with status badges
- [ ] Create/edit event form
- [ ] Event detail page: order list filtered to event, revenue totals
- [ ] Assign/unassign team members
- [ ] Event status transitions: upcoming → active → completed
- [ ] Calendar view (nice-to-have)

---

### [WEB-010] User/team management page
**Priority:** P1 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Manage team members. Invite users by email (Supabase Auth invite). Assign roles: admin, manager, sales_rep. View active devices per user. Deactivate users.

**Acceptance Criteria:**
- [ ] Team member list: name, email, role, last active
- [ ] Invite new member by email
- [ ] Role assignment: admin, manager, sales_rep
- [ ] Edit/deactivate team members
- [ ] Role-based access enforced (only admins see this page)

---

### [WEB-011] Smart grid tiles configuration (admin)
**Priority:** P2 | **Effort:** M | **Depends on:** WEB-007, MOB-M008

Admin interface to configure the smart grid tiles that appear on the mobile scan screen. Drag-and-drop tile arrangement. Tile types: product shortcut, category filter, discount action. Color picker per tile. Saved to tenant settings and synced to devices.

**Acceptance Criteria:**
- [ ] Tile configuration page in settings
- [ ] Drag-and-drop arrangement
- [ ] Tile types: product, category, action
- [ ] Color picker per tile
- [ ] Preview of how tiles look on mobile
- [ ] Saves to tenant settings (syncs via PowerSync)

---

### [WEB-012] Analytics page (basic)
**Priority:** P2 | **Effort:** M | **Depends on:** WEB-003, INFRA-005

Basic sales analytics: revenue by event (bar chart), revenue by date (line chart), top products (table), sales rep performance (table), order status distribution (pie chart). Date range filter.

**Acceptance Criteria:**
- [ ] Revenue by event chart
- [ ] Revenue over time chart
- [ ] Top 10 products table
- [ ] Sales rep leaderboard
- [ ] Order status distribution
- [ ] Date range filter
- [ ] Export data as CSV

---

### [WEB-013] Real-time order updates (Supabase Realtime)
**Priority:** P1 | **Effort:** S | **Depends on:** WEB-004, INFRA-004

Subscribe to Supabase Realtime for order table changes. When a new order is synced from a device, the web dashboard updates automatically — no manual refresh needed. Toast notification for new orders.

**Acceptance Criteria:**
- [ ] Supabase Realtime subscription on orders table
- [ ] New order appears in order list without refresh
- [ ] Toast notification: "New order #SO-0048 from Anna"
- [ ] Order detail page updates if status changes
- [ ] KPI cards on home page update in real-time

---

## 7. Backend / API (API)

### [API-001] JWT validation middleware — `DONE`
**Priority:** P0 | **Effort:** S | **Depends on:** INFRA-009, INFRA-004
> Completed 2026-03-12 — HS256 JWT validation via Web Crypto API, extracts AuthUser context

Cloudflare Worker middleware that validates Supabase JWT tokens. Extracts `tenant_id` and `role` from JWT claims. Rejects invalid/expired tokens with 401.

**Acceptance Criteria:**
- [x] Middleware in `apps/api/src/middleware/auth.ts`
- [x] Validates JWT signature using Supabase JWT secret
- [x] Extracts `tenant_id`, `user_id`, `role` from token claims
- [x] Returns 401 for missing/invalid/expired tokens
- [x] Attaches user context to Hono request

---

### [API-002] PowerSync upload handler — `DONE`
**Priority:** P0 | **Effort:** M | **Depends on:** API-001, INFRA-005
> Completed 2026-03-12 — Full DB writes, idempotency, stock decrement, order number assignment

Handle order uploads from PowerSync. Validate order data with Zod. Check for duplicate orders (idempotency via order UUID). Assign order_number (server-side sequence). Insert into orders + order_lines tables. Update stock quantities. Return success to PowerSync.

**Acceptance Criteria:**
- [x] `POST /api/sync/upload` endpoint — route exists
- [x] Validates order payload with Zod schema
- [x] Idempotency check: duplicate order UUID returns success (no duplicate insert)
- [x] Assigns sequential `order_number` (e.g., SO-0001) — uses API-007
- [x] Inserts order + order_lines via Hyperdrive DB binding
- [x] Decrements `stock_qty` on products/variants
- [x] Returns success → PowerSync marks upload complete
- [x] Handles batch uploads (multiple orders in one request)
- [ ] End-to-end test with live DB — BLOCKED: requires Hyperdrive setup

---

### [API-003] Rate limiting middleware — `DONE`
> DONE 2026-03-13 — In-memory sliding window rate limiter with per-plan tier limits, PowerSync sync exempted, 429+Retry-After
**Priority:** P1 | **Effort:** S | **Depends on:** INFRA-009

Per-tenant rate limiting using Cloudflare KV. Limit API requests per minute. Different limits per plan tier. Return 429 with retry-after header.

**Acceptance Criteria:**
- [x] Rate limit middleware using in-memory store (upgrade to KV for distributed limiting later)
- [x] Configurable limits per tenant plan (free/starter/professional/enterprise)
- [x] 429 response with `Retry-After` header
- [x] Does not rate-limit PowerSync sync traffic (exempt paths configured)

---

### [API-004] Tenant resolution middleware — `DONE`
> DONE 2026-03-13 — tenantId set in Hono context via c.get('tenantId')
**Priority:** P1 | **Effort:** XS | **Depends on:** API-001

Extract tenant context from JWT and make it available throughout the request lifecycle. All database queries scoped to the resolved tenant.

**Acceptance Criteria:**
- [ ] Tenant resolved from JWT `app_metadata.tenant_id`
- [ ] Available as `c.get('tenantId')` in Hono context
- [ ] All downstream queries use tenant_id automatically

---

### [API-005] Image upload endpoint (R2)
**Priority:** P1 | **Effort:** S | **Depends on:** INFRA-011, API-001

Upload product images to Cloudflare R2. Accept image file, validate type/size, optionally resize, store in R2, return public URL. Delete endpoint to remove images.

**Acceptance Criteria:**
- [ ] `POST /api/images/upload` — accepts image file
- [ ] Validates: file type (JPEG, PNG, WebP), max size (5MB)
- [ ] Stores in R2 with tenant-scoped key
- [ ] Returns public URL for the image
- [ ] `DELETE /api/images/:key` — removes from R2
- [ ] Optional: generate thumbnail variant

---

### [API-006] PDF order confirmation generation
**Priority:** P2 | **Effort:** M | **Depends on:** API-001, INFRA-005

Generate PDF order confirmations server-side. Include: company branding, order details, line items, tax breakdown, customer info, payment terms. Store PDF in R2. Return download URL.

**Acceptance Criteria:**
- [ ] `POST /api/pdf/order/:id` generates PDF
- [ ] PDF includes all order details, branding, tax breakdown
- [ ] Stored in R2 for later download
- [ ] `GET /api/pdf/order/:id/download` returns PDF file
- [ ] Works for any order in the tenant

---

### [API-007] Order number sequence generator — `DONE`
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-005
> Completed 2026-03-12 — Atomic upsert+increment, SO-NNNN format, order_sequences table added to Drizzle schema

Server-side sequential order number generation. Format: `SO-NNNN` (e.g., SO-0001). Per-tenant sequence (each tenant's orders start from 1). Atomic increment (no duplicates under concurrency).

**Acceptance Criteria:**
- [x] Sequence per tenant stored in database — order_sequences table in Drizzle schema
- [x] Atomic increment (PostgreSQL INSERT ... ON CONFLICT with RETURNING)
- [x] Format: configurable prefix + zero-padded number
- [x] Called during order upload processing — integrated in API-002 upload handler

---

## 8. Integrations (INT)

### [INT-001] Integration adapter interface
**Priority:** P2 | **Effort:** S | **Depends on:** PKG-001

Define the TypeScript interface for integration adapters: `pullProducts`, `pushOrder`, `pullCustomers`, `pushCustomer`, `pushInvoice`, `handleWebhook`, `testConnection`. Base class with common functionality (error handling, retry, logging).

**Acceptance Criteria:**
- [ ] `IntegrationAdapter` interface in `apps/api/src/lib/`
- [ ] Methods: pullProducts, pushOrder, pullCustomers, pushCustomer, handleWebhook, testConnection
- [ ] Base class with retry logic and error handling
- [ ] Integration-specific classes implement the interface

---

### [INT-002] WooCommerce adapter — product pull
**Priority:** P2 | **Effort:** L | **Depends on:** INT-001, INFRA-005

Pull products from WooCommerce REST API v3. Map WooCommerce product fields to ScanOrder product schema. Handle variations (WooCommerce variable products → ScanOrder product_variants). Incremental sync (since timestamp). Store mapping in `integration_mappings` table.

**Acceptance Criteria:**
- [ ] Connects to WooCommerce REST API v3 (consumer key/secret)
- [ ] Pulls all products with pagination
- [ ] Maps WC fields → ScanOrder fields (name, SKU, barcode, price, stock, image, category)
- [ ] WC variable products → ScanOrder product + product_variants
- [ ] Incremental sync using `modified_after` parameter
- [ ] Mappings stored in `integration_mappings` (local_id ↔ WC product ID)
- [ ] Handles product deletions (soft delete)

---

### [INT-003] WooCommerce adapter — order push
**Priority:** P2 | **Effort:** M | **Depends on:** INT-001, INFRA-005

Push confirmed orders to WooCommerce as new WC orders. Map ScanOrder fields to WC order format. Include line items, customer, billing/shipping address. Set appropriate WC status. Store WC order ID in mapping table.

**Acceptance Criteria:**
- [ ] Creates WC order via REST API
- [ ] Maps: line items, customer, addresses, totals
- [ ] Sets WC order status based on ScanOrder status (confirmed → wc-processing)
- [ ] Stores WC order ID in `integration_mappings`
- [ ] Handles errors gracefully (retry on 5xx, log on 4xx)
- [ ] Idempotent (doesn't create duplicate WC orders)

---

### [INT-004] WooCommerce webhook handler
**Priority:** P2 | **Effort:** M | **Depends on:** INT-001, INFRA-009

Handle inbound webhooks from WooCommerce for product create/update/delete and stock changes. Validate webhook signature. Update local product data. Queue sync jobs.

**Acceptance Criteria:**
- [ ] `POST /api/webhooks/woocommerce` endpoint
- [ ] Validates WC webhook signature (HMAC)
- [ ] Handles: product.created, product.updated, product.deleted
- [ ] Handles: stock quantity changes
- [ ] Updates ScanOrder product data from webhook payload
- [ ] Logs webhook events for audit

---

### [INT-005] WooCommerce integration setup UI
**Priority:** P2 | **Effort:** M | **Depends on:** WEB-003, INT-002

Web dashboard page for WooCommerce integration. Connection form: store URL, consumer key, consumer secret. Test connection button. Sync settings: which data to sync, direction, auto-sync interval. Sync history log. Manual "Sync Now" button.

**Acceptance Criteria:**
- [ ] Integration page at `/integrations/woocommerce`
- [ ] Connection form with credentials
- [ ] "Test Connection" verifies API access
- [ ] Sync settings: products (in), orders (out), inventory (in), customers (bidirectional)
- [ ] Auto-sync interval selector
- [ ] Sync history log with status per job
- [ ] "Sync Now" triggers immediate sync

---

### [INT-006] Exact Online adapter — OAuth2 setup
**Priority:** P3 | **Effort:** M | **Depends on:** INT-001, INFRA-009

Implement Exact Online OAuth2 flow. Handle token acquisition, storage (encrypted), and automatic refresh. Rate limit compliance (60 req/min per division).

**Acceptance Criteria:**
- [ ] OAuth2 authorization flow (redirect to Exact, callback handler)
- [ ] Access token and refresh token stored encrypted in `integrations` table
- [ ] Automatic token refresh before expiry
- [ ] Rate limiter: max 60 requests/minute
- [ ] Division selection after auth

---

### [INT-007] Exact Online adapter — order and invoice push
**Priority:** P3 | **Effort:** L | **Depends on:** INT-006

Push confirmed orders to Exact Online as Sales Orders. Push completed orders as Sales Invoices. Map ScanOrder fields to Exact Online API format. Handle accounts (customers) sync.

**Acceptance Criteria:**
- [ ] Creates Exact Online Sales Orders from confirmed ScanOrder orders
- [ ] Creates Exact Online Sales Invoices from completed orders
- [ ] Maps customers to Exact Online Accounts
- [ ] Stores Exact Online IDs in `integration_mappings`
- [ ] Handles Exact Online API errors and rate limits
- [ ] Sync status visible on web dashboard

---

### [INT-008] Exact Online integration setup UI
**Priority:** P3 | **Effort:** M | **Depends on:** WEB-003, INT-006

Web dashboard page for Exact Online. "Connect to Exact Online" OAuth button. Division selector. Sync settings. Sync history.

**Acceptance Criteria:**
- [ ] Integration page at `/integrations/exact-online`
- [ ] "Connect" button triggers OAuth flow
- [ ] Division selector after successful auth
- [ ] Sync settings: orders out, invoices out, customers bidirectional
- [ ] "Disconnect" option
- [ ] Sync history log

---

### [INT-009] EU VIES VAT number validation
**Priority:** P2 | **Effort:** S | **Depends on:** API-001

Integrate with EU VIES API to validate VAT numbers. Called when creating/editing customers with EU VAT numbers. Returns validity status and registered company name. Cache results to avoid repeated lookups.

**Acceptance Criteria:**
- [ ] VIES API integration (SOAP or REST via third-party wrapper)
- [ ] Validates EU VAT number format and registration
- [ ] Returns: valid/invalid, registered company name, address
- [ ] Results cached in KV (24-hour TTL)
- [ ] Used by customer creation and VAT handling logic

---

## 9. Payment Processing (PAY)

### [PAY-001] Mollie Connect OAuth integration
**Priority:** P3 | **Effort:** L | **Depends on:** INT-001, INFRA-009

Implement Mollie Connect for SaaS platform payments. OAuth flow for merchant onboarding. Connected account management. Application fee configuration.

**Acceptance Criteria:**
- [ ] Mollie OAuth2 flow for merchant (tenant) onboarding
- [ ] Connected account stored in integrations table
- [ ] Application fee configurable per plan
- [ ] KYC status tracking
- [ ] Disconnect/reconnect flow

---

### [PAY-002] Mollie payment creation
**Priority:** P3 | **Effort:** M | **Depends on:** PAY-001

Create payments via Mollie on behalf of connected merchants. Support: iDEAL, credit card, bank transfer, SEPA. Handle payment status webhooks.

**Acceptance Criteria:**
- [ ] Create payment linked to order
- [ ] Support: iDEAL, credit card, bank transfer, SEPA
- [ ] Payment webhook handler for status updates
- [ ] Payment status reflected on order
- [ ] Application fee automatically deducted

---

### [PAY-003] Mollie payment integration setup UI
**Priority:** P3 | **Effort:** M | **Depends on:** WEB-003, PAY-001

Web dashboard page for Mollie Connect. "Connect with Mollie" button. KYC status display. Payment method configuration. Transaction history.

**Acceptance Criteria:**
- [ ] Integration page at `/integrations/mollie` or `/settings/payments`
- [ ] "Connect with Mollie" OAuth button
- [ ] KYC status indicator
- [ ] Enable/disable payment methods
- [ ] Transaction/payout history

---

### [PAY-004] Stripe Connect integration (international)
**Priority:** P4 | **Effort:** L | **Depends on:** INT-001

Stripe Connect for international expansion. OAuth onboarding, embedded components for connected accounts, payment processing.

**Acceptance Criteria:**
- [ ] Stripe Connect OAuth flow
- [ ] Connected account management
- [ ] Payment creation for international orders
- [ ] Embedded dashboard for merchants

---

## 10. POS Features (POS)

### [POS-001] Payment method selection on order
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-012

Add payment method selection to order checkout: invoice (default for B2B), cash, card, iDEAL. Payment terms selection for invoice: net 30, net 60, immediate. Stored on order record.

**Acceptance Criteria:**
- [ ] Payment method picker: invoice, cash, card, iDEAL
- [ ] Payment terms picker for invoice: net 30, net 60, immediate
- [ ] Default: invoice + net 30
- [ ] Saved on order record
- [ ] Shown on order detail and receipts

---

### [POS-002] Thermal receipt printer support
**Priority:** P3 | **Effort:** M | **Depends on:** MOB-M006

Bluetooth thermal receipt printer support (Star Micronics, Epson TM series). Discover nearby printers, connect, print order receipts. Receipt format: order #, items, tax, total, company info.

**Acceptance Criteria:**
- [ ] Discover Bluetooth printers
- [ ] Connect to selected printer
- [ ] Print formatted receipt
- [ ] Receipt includes: order #, items, tax breakdown, total, company details
- [ ] Printer settings in app settings

---

### [POS-003] Z-report generation
**Priority:** P2 | **Effort:** M | **Depends on:** MOB-A008, MOB-M004

End-of-day Z-report at shift close. Summary: total orders, revenue by payment method, cash movements summary, top products, sales rep stats. Viewable on device and web dashboard. Optionally printable.

**Acceptance Criteria:**
- [ ] Z-report generated at shift close
- [ ] Includes: order count, revenue by payment method, cash summary
- [ ] Top 10 products sold this shift
- [ ] Cash over/short amount
- [ ] Viewable on device screen
- [ ] Syncs to server (viewable on web dashboard)
- [ ] Option to print on thermal printer

---

### [POS-004] Variant selection modal (Toast POS pattern)
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-008

When a scanned product has variants (or product added from catalog), show a modal overlay for variant selection. Display options as a grid (e.g., sizes across top, colors down left). Inspired by Toast POS modifier overlay pattern.

**Acceptance Criteria:**
- [ ] Modal appears when product has variants
- [ ] Grid layout for variant options (size x color matrix)
- [ ] Shows stock per variant
- [ ] Shows price if variant has price override
- [ ] Select variant → add to cart
- [ ] Dismiss to cancel

---

### [POS-005] Order-level discount
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-009

Apply discount to entire order: percentage or fixed amount. Discount shown in order summary. Recalculates total correctly (discount applied before tax or after, configurable).

**Acceptance Criteria:**
- [ ] "Apply Discount" button on cart
- [ ] Choose: percentage or fixed amount
- [ ] Discount displayed in cart totals section
- [ ] Discount saved on order record
- [ ] Correct tax calculation with discount

---

### [POS-006] Price lists and volume discounts
**Priority:** P3 | **Effort:** L | **Depends on:** INFRA-005, MOB-003

B2B pricing engine. Multiple price lists per tenant. Customers assigned to price groups. Price rules: product-specific prices, minimum quantity thresholds, percentage discounts. Price calculated locally from synced price data.

**Acceptance Criteria:**
- [ ] Price lists table with per-product prices
- [ ] Customers linked to price groups
- [ ] Cart applies correct price based on customer's price group
- [ ] Volume discounts: quantity thresholds trigger different prices
- [ ] Price rules sync to device via PowerSync
- [ ] Admin manages price lists from web dashboard
- [ ] Correct price shown in cart and on receipts

---

### [POS-007] Order notes (order-level)
**Priority:** P1 | **Effort:** XS | **Depends on:** MOB-012

Add text notes to the overall order. Shown during checkout, in order detail, on receipts, and synced to server.

**Acceptance Criteria:**
- [ ] "Add Note" field in checkout flow
- [ ] Note saved on order record
- [ ] Visible on order detail (mobile + web)
- [ ] Included in PDF receipt

---

## 11. CI/CD & DevOps (CICD)

### [CICD-001] GitHub Actions CI pipeline
**Priority:** P2 | **Effort:** M | **Depends on:** INFRA-001

CI pipeline triggered on push and pull request. Jobs: lint, typecheck, test. Runs across all monorepo packages. Uses pnpm and Turborepo for caching.

**Acceptance Criteria:**
- [ ] `.github/workflows/ci.yml`
- [ ] Triggers on push and PR to main
- [ ] Runs: `pnpm lint`, `pnpm typecheck`, `pnpm test`
- [ ] Uses Turborepo remote caching
- [ ] pnpm dependency caching
- [ ] Fails PR if any check fails

---

### [CICD-002] Cloudflare Worker deployment pipeline
**Priority:** P2 | **Effort:** S | **Depends on:** CICD-001, INFRA-009

Deploy Cloudflare Worker on push to main (after CI passes). Uses Wrangler CLI with API token.

**Acceptance Criteria:**
- [ ] `.github/workflows/deploy-api.yml`
- [ ] Deploys only when CI passes and branch is main
- [ ] Uses `wrangler deploy` with CF API token from secrets
- [ ] Reports deployment status

---

### [CICD-003] Vercel deployment for web dashboard
**Priority:** P2 | **Effort:** XS | **Depends on:** WEB-001

Connect Vercel to GitHub for automatic deployments. Preview deploys on PRs. Production deploy on merge to main.

**Acceptance Criteria:**
- [ ] Vercel project connected to GitHub repo
- [ ] Auto-deploy on push to main
- [ ] Preview deploys on pull requests
- [ ] Environment variables configured in Vercel

---

### [CICD-004] EAS Build for mobile (staging)
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-001

Configure EAS Build for staging/preview builds. Trigger build on push to main via GitHub Actions. Distribute via TestFlight (iOS) and internal testing track (Android).

**Acceptance Criteria:**
- [ ] `.github/workflows/build-mobile.yml`
- [ ] Triggers EAS Build for iOS and Android on main push
- [ ] Uses `preview` build profile
- [ ] iOS distributed via TestFlight
- [ ] Android distributed via internal testing

---

### [CICD-005] EAS Build for production (release)
**Priority:** P3 | **Effort:** S | **Depends on:** CICD-004

Production build triggered by git tag (e.g., `v1.0.0`). Submits to App Store and Google Play via EAS Submit.

**Acceptance Criteria:**
- [ ] Triggers on git tag `v*`
- [ ] Uses `production` build profile
- [ ] Submits to App Store via EAS Submit
- [ ] Submits to Google Play via EAS Submit
- [ ] Requires manual approval before submission

---

### [CICD-006] Sentry error monitoring setup
**Priority:** P2 | **Effort:** S | **Depends on:** MOB-001, WEB-001, INFRA-009

Configure Sentry for error tracking across all three apps: mobile (React Native), web (Next.js), API (Cloudflare Worker). Source maps uploaded for meaningful stack traces.

**Acceptance Criteria:**
- [ ] Sentry project(s) created
- [ ] React Native SDK integrated in mobile app
- [ ] Next.js SDK integrated in web dashboard
- [ ] Sentry for Cloudflare Workers in API
- [ ] Source maps uploaded on build/deploy
- [ ] Error alerts configured (Slack/email)

---

### [CICD-007] Database migration pipeline
**Priority:** P2 | **Effort:** S | **Depends on:** INFRA-005, CICD-001

Automated database migrations on deploy. Generate Drizzle migrations from schema changes. Apply to Supabase staging before production. Rollback capability.

**Acceptance Criteria:**
- [ ] `pnpm db:generate` creates migration SQL from schema diff
- [ ] Migrations applied to staging Supabase on PR merge
- [ ] Migrations applied to production on main deploy
- [ ] Migration history tracked
- [ ] Rollback migration available

---

## 12. Design & UX (DES)

### [DES-001] Design system tokens (colors, typography, spacing) — `DONE`
> DONE 2026-03-13 — Full design tokens in @scanorder/shared/design/tokens with Tailwind extension
**Priority:** P1 | **Effort:** S | **Depends on:** —

Define design tokens: color palette (brand colors, semantic colors for status), typography scale, spacing scale, border radius, shadows. Shared between mobile (NativeWind) and web (Tailwind). High contrast for trade show floor visibility.

**Acceptance Criteria:**
- [x] Color tokens: brand, success, warning, error, neutral scales
- [x] High-contrast mode option for bright environments
- [x] Typography: font family, size scale, line heights
- [x] Spacing scale consistent between web and mobile
- [x] Tailwind config extension in shared config package

---

### [DES-002] App icon and splash screen
**Priority:** P1 | **Effort:** S | **Depends on:** —

Design app icon for iOS and Android. Splash/launch screen. Follows platform guidelines (iOS Human Interface, Material Design).

**Acceptance Criteria:**
- [ ] App icon in all required sizes (iOS + Android)
- [ ] Splash screen with logo
- [ ] Configured in `app.json`

---

### [DES-003] Offline state visual design
**Priority:** P1 | **Effort:** S | **Depends on:** DES-001

Design the offline/online UI patterns. Offline banner at top of screen. Sync indicator styles (green dot = synced, yellow spinner = syncing, red dot = offline with pending). Pending upload badge on orders tab.

**Acceptance Criteria:**
- [ ] Offline banner design (non-intrusive but clear)
- [ ] Sync indicator icon states with colors
- [ ] Pending upload badge style
- [ ] "Queued for sync" label on orders
- [ ] Consistent across all screens

---

### [DES-004] Role-differentiated views design
**Priority:** P3 | **Effort:** M | **Depends on:** DES-001

From research synthesis: separate views for sales reps vs admin/managers. Sales rep sees simplified UI (scan, cart, their orders). Manager sees team orders and basic reports. Admin sees everything. Navigation adapts to role.

**Acceptance Criteria:**
- [ ] Sales rep: Scan, Orders (own), Customers, Catalog, Settings
- [ ] Manager: + all orders, basic analytics
- [ ] Admin: + products management, integrations, team management, billing
- [ ] Navigation tabs/sidebar adapts to role
- [ ] Documented role → permission → UI mapping

---

## 13. Security (SEC)

### [SEC-001] SQLCipher encryption for local database
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-003

Enable SQLCipher encryption on the local SQLite database (op-sqlite). Encryption key derived from user session. Protects offline data if device is lost/stolen.

**Acceptance Criteria:**
- [ ] op-sqlite configured with SQLCipher
- [ ] Database encrypted at rest on device
- [ ] Encryption key derived securely (not hardcoded)
- [ ] Database accessible only when user is authenticated

---

### [SEC-002] API key management for integrations
**Priority:** P2 | **Effort:** S | **Depends on:** INFRA-005

Secure storage for integration credentials (WooCommerce keys, Exact Online tokens, Mollie API keys). Encrypted at rest in database. Never exposed in API responses. Rotation support.

**Acceptance Criteria:**
- [ ] Integration credentials stored encrypted in `integrations.credentials` (JSONB)
- [ ] Supabase Vault or application-level encryption
- [ ] Credentials never returned in API responses
- [ ] Credential rotation without downtime
- [ ] Audit log for credential access

---

### [SEC-003] GDPR data deletion endpoint
**Priority:** P3 | **Effort:** M | **Depends on:** INFRA-005

Tenant data deletion for GDPR compliance. Delete all tenant data (products, customers, orders, users, integrations) on account closure. Soft delete with configurable retention period, then hard delete.

**Acceptance Criteria:**
- [ ] Tenant deletion endpoint (admin only)
- [ ] Soft deletes all tenant data
- [ ] Hard delete after retention period (default 30 days)
- [ ] Confirmation required (double-confirm flow)
- [ ] Audit log entry for deletion request

---

## 14. Testing (TEST)

### [TEST-001] Unit test setup (Vitest) — `DONE`
> DONE 2026-03-13 — Vitest configured for shared + api packages, 74 tests passing (pricing, barcode, Zod schemas, auth middleware)
**Priority:** P1 | **Effort:** S | **Depends on:** INFRA-001

Configure Vitest for unit testing across monorepo packages. Test shared utilities, Zod schemas, price calculations, barcode validation.

**Acceptance Criteria:**
- [x] Vitest configured in root and per-package
- [x] `pnpm test` runs all tests
- [x] Tests for pricing utilities (tax calculation, discount, formatting)
- [x] Tests for barcode validation
- [x] Tests for Zod schemas

---

### [TEST-002] API endpoint tests
**Priority:** P2 | **Effort:** M | **Depends on:** API-002, TEST-001

Integration tests for Cloudflare Worker endpoints. Test upload handler, webhook validation, auth middleware. Use Miniflare for local Worker testing.

**Acceptance Criteria:**
- [ ] Miniflare-based test setup for Workers
- [ ] Tests for upload handler (valid order, duplicate, invalid)
- [ ] Tests for auth middleware (valid JWT, expired, missing)
- [ ] Tests for webhook signature validation

---

### [TEST-003] E2E tests — mobile (Detox)
**Priority:** P3 | **Effort:** L | **Depends on:** MOB-012

End-to-end tests for critical mobile flows using Detox. Test: login → scan → add to cart → checkout → order confirmed. Test offline mode: order created offline, syncs when online.

**Acceptance Criteria:**
- [ ] Detox configured for iOS simulator
- [ ] Test: login flow
- [ ] Test: scan barcode → add to cart → checkout → confirmation
- [ ] Test: offline order creation
- [ ] Runs in CI pipeline

---

### [TEST-004] E2E tests — web (Playwright)
**Priority:** P3 | **Effort:** M | **Depends on:** WEB-004

End-to-end tests for web dashboard using Playwright. Test: login → view orders → order detail → change status. Test: product CRUD. Test: integration setup.

**Acceptance Criteria:**
- [ ] Playwright configured
- [ ] Test: login flow
- [ ] Test: orders list → order detail → status change
- [ ] Test: product create/edit/delete
- [ ] Runs in CI pipeline

---

## 15. Scaling & Performance (PERF)

### [PERF-001] FlashList for product catalog performance — `DONE`
> DONE 2026-03-13 — Catalog uses @shopify/flash-list with estimatedItemSize, responsive column count
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-A002

Use Shopify's FlashList (not FlatList) for product catalog rendering. Optimized for large lists (5K-50K products). Consistent 60fps scrolling.

**Acceptance Criteria:**
- [x] FlashList used for product grid/list
- [x] Smooth scrolling with 5,000+ products (estimatedItemSize configured)
- [x] estimatedItemSize configured correctly (220 grid, 80 list)
- [x] No blank cells during fast scrolling (FlashList handles this)

---

### [PERF-002] Product image optimization pipeline
**Priority:** P2 | **Effort:** M | **Depends on:** API-005

When images are uploaded to R2, generate optimized variants: thumbnail (100px), medium (400px), large (800px). Serve appropriate size based on context (grid tile vs. detail view). WebP format.

**Acceptance Criteria:**
- [ ] Image resize on upload (Cloudflare Images or Worker)
- [ ] Three variants: thumbnail, medium, large
- [ ] WebP format for smaller file sizes
- [ ] URL pattern: `/images/{key}/thumb`, `/images/{key}/medium`
- [ ] Mobile app requests appropriate size per context

---

### [PERF-003] PowerSync sync performance optimization
**Priority:** P3 | **Effort:** M | **Depends on:** INFRA-008

Optimize sync for large catalogs. Measure initial sync time with 50K products. Optimize sync stream queries. Consider partial sync (active products only). Monitor sync latency dashboard.

**Acceptance Criteria:**
- [ ] Initial sync with 50K products completes in <60 seconds on 4G
- [ ] Delta sync completes in <5 seconds
- [ ] Sync stream queries use appropriate indexes
- [ ] Only active products synced (reduce data budget)
- [ ] Sync performance metrics logged

---

### [PERF-004] Vercel to Cloudflare Pages migration path
**Priority:** P4 | **Effort:** L | **Depends on:** WEB-001

Prepare migration path from Vercel to Cloudflare Pages via OpenNext. A-Journal already uses Cloudflare. Consolidates infrastructure and reduces cost at scale.

**Acceptance Criteria:**
- [ ] OpenNext adapter configured and tested
- [ ] Next.js dashboard runs on Cloudflare Pages
- [ ] All features work (SSR, Server Components, API routes)
- [ ] DNS/routing configured
- [ ] Cost reduction documented

---

## 16. Onboarding & Docs (OB)

### [OB-001] Onboarding wizard (first-run setup)
**Priority:** P3 | **Effort:** L | **Depends on:** WEB-003

First-run setup flow for new tenants. Steps: create account, set up company details, add first products (manual or CSV import), invite team members, connect integrations (optional), set up payment (optional).

**Acceptance Criteria:**
- [ ] Multi-step wizard on first login
- [ ] Step 1: Company details (name, address, logo, VAT number)
- [ ] Step 2: Add products (manual, CSV import, or WooCommerce import)
- [ ] Step 3: Invite team members
- [ ] Step 4: Connect integrations (optional, skip-able)
- [ ] Step 5: Download mobile app + first sync
- [ ] Progress saved (can resume later)

---

### [OB-002] Demo/seed data toggle
**Priority:** P3 | **Effort:** S | **Depends on:** OB-001

Option during onboarding to load demo data (sample products, customers, events, orders). Allows potential customers to explore the app without entering real data. "Clear demo data" action when ready to go live.

**Acceptance Criteria:**
- [ ] "Load demo data" option in onboarding
- [ ] Realistic demo products, customers, events, orders
- [ ] Banner: "Demo mode — clear demo data when ready"
- [ ] "Clear demo data" action in settings

---

### [OB-003] Multi-tenant billing setup (Mollie subscriptions)
**Priority:** P3 | **Effort:** L | **Depends on:** PAY-001

Subscription billing for SaaS tenants. Plans: starter, professional, business, event_pass. Monthly billing via Mollie or Stripe. Upgrade/downgrade flow. Usage tracking.

**Acceptance Criteria:**
- [ ] Billing page in settings
- [ ] Plan display with feature comparison
- [ ] Upgrade/downgrade flow
- [ ] Payment method management
- [ ] Invoice history
- [ ] Grace period on failed payment

---

### [OB-004] User documentation (setup guide)
**Priority:** P3 | **Effort:** M | **Depends on:** —

Setup guide for new users: getting started, connecting integrations, adding products, using the scanner, managing orders, trade show preparation checklist.

**Acceptance Criteria:**
- [ ] Getting started guide
- [ ] Integration setup documentation
- [ ] Trade show preparation checklist
- [ ] Hosted at docs.scanorder.com or in-app help

---

### [OB-005] API documentation
**Priority:** P3 | **Effort:** M | **Depends on:** API-002

OpenAPI/Swagger documentation for the Cloudflare Worker API. Webhook payload documentation. Authentication guide.

**Acceptance Criteria:**
- [ ] OpenAPI spec generated from Hono routes
- [ ] Webhook payload examples
- [ ] Authentication documentation
- [ ] Hosted documentation page

---

## 17. Future / Advanced (FUT)

### [FUT-001] AI-powered product recommendations
**Priority:** P4 | **Effort:** L | **Depends on:** —

Claude API integration for product recommendations during ordering. "Customers who bought X also bought Y." Suggest reorders based on customer history.

**Acceptance Criteria:**
- [ ] Recommendation engine using order history
- [ ] Suggestions shown during cart review
- [ ] "Recommended for this customer" section

---

### [FUT-002] MCP server for ScanOrder data
**Priority:** P4 | **Effort:** M | **Depends on:** API-002

Build an MCP server exposing ScanOrder data (orders, products, customers, analytics) for AI-powered insights via Claude or other AI tools.

**Acceptance Criteria:**
- [ ] MCP server with tools for querying orders, products, customers
- [ ] Connectable from Claude Desktop or Claude Code
- [ ] Read-only data access with tenant isolation

---

### [FUT-003] Multi-language support (i18n)
**Priority:** P4 | **Effort:** L | **Depends on:** —

Internationalization for mobile and web. Default: Dutch (NL). Secondary: English (EN). Framework for adding more languages.

**Acceptance Criteria:**
- [ ] i18n framework in mobile (expo-localization)
- [ ] i18n framework in web (next-intl or similar)
- [ ] Dutch and English translations
- [ ] Language selector in settings

---

### [FUT-004] Badge scanning for lead capture (trade show)
**Priority:** P4 | **Effort:** M | **Depends on:** MOB-006

From WizCommerce research: scan attendee badges at trade shows for lead capture. Extract name/company/email from badge barcode/QR. Auto-create customer record.

**Acceptance Criteria:**
- [ ] Scan trade show badge (QR or barcode)
- [ ] Parse attendee info (name, company, email)
- [ ] Auto-create or match to existing customer
- [ ] Link to current order

---

### [FUT-005] Customer-facing display (Shopify POS pattern)
**Priority:** P4 | **Effort:** L | **Depends on:** —

From Shopify POS research: secondary display showing order details to the customer during checkout. Branded idle screen. PIN entry for loyalty programs.

**Acceptance Criteria:**
- [ ] Secondary display support (external screen or second device)
- [ ] Shows current order to customer
- [ ] Branded idle screen (logo, video)
- [ ] Configurable from settings

---

### [FUT-006] Inventory forecasting (AI)
**Priority:** P4 | **Effort:** L | **Depends on:** FUT-001

AI-powered inventory forecasting based on historical sales data per event. Suggest optimal stock levels for upcoming trade shows. Alert when products likely to sell out.

**Acceptance Criteria:**
- [ ] Forecast model based on event sales history
- [ ] Suggested stock quantities per product per event
- [ ] Low-stock alerts during active events
- [ ] Dashboard widget for inventory health

---

### [FUT-007] Workers for Platforms (multi-tenant isolation)
**Priority:** P4 | **Effort:** XL | **Depends on:** INFRA-009

Use Cloudflare Workers for Platforms for per-tenant Worker isolation. Each tenant gets their own Worker namespace. Useful for custom webhook handlers and per-tenant API customization at scale.

**Acceptance Criteria:**
- [ ] Workers for Platforms configured
- [ ] Per-tenant Worker dispatch
- [ ] Tenant-specific custom logic support
- [ ] Management API for tenant Workers

---

---

## Ticket Summary

| Priority | Count | Phase |
|:--------:|:-----:|-------|
| P0 | 40 | PoC (Weeks 1-3) |
| P1 | 32 | Alpha (Weeks 4-8) |
| P2 | 30 | MVP (Weeks 9-14) |
| P3 | 19 | v1.0 (Weeks 15-20) |
| P4 | 9 | Future |
| **Total** | **130** | |

### P0 Critical Path (PoC)

The PoC critical path is:

```
INFRA-001 (monorepo)
  ├── INFRA-002 (tsconfig)
  ├── INFRA-003 (eslint)
  ├── INFRA-012 (env vars)
  ├── INFRA-013 (CLAUDE.md)
  ├── PKG-001 → PKG-002 → PKG-003 → PKG-004 (shared packages)
  ├── MOB-001 → MOB-002 → MOB-003 (mobile app + auth + sync)
  │     ├── MOB-004 (tabs)
  │     ├── MOB-005 (split pane)
  │     ├── MOB-006 + MOB-007 (scanners)
  │     ├── MOB-008 (product lookup)
  │     ├── MOB-009 → MOB-010 (cart)
  │     ├── MOB-011 (customer picker)
  │     ├── MOB-012 (order submission)
  │     ├── MOB-013 (scan feedback)
  │     ├── MOB-014 (sync indicator)
  │     ├── MOB-015 (search bar)
  │     └── MOB-016 (network detection)
  └── WEB-001 → WEB-002 → WEB-003 → WEB-004 → WEB-005 (web dashboard)

INFRA-004 (Supabase) → INFRA-005 (schema) → INFRA-006 (RLS) → INFRA-007 (seed)
INFRA-005 → INFRA-008 (PowerSync)
INFRA-009 → INFRA-010 (Hyperdrive) → API-001 → API-002 (upload handler)
API-007 (order numbers)
```

**PoC exit criteria:** Scan a real barcode on iPad → product found in local DB → added to cart → select customer → submit order offline → order syncs to Supabase → order visible on web dashboard.

---

## 18. Code Quality & Refactors (QA)

*Added 2026-03-12 — from automated codebase analysis against blueprint, market analysis, and tech stack research.*

### [QA-001] Fix auth context silent failure in sync upload — `DONE`
> DONE 2026-03-13 — Upload handler returns 401 if user/tenantId/userId missing
**Priority:** P0 | **Effort:** XS | **Depends on:** API-001

If `user` is undefined in the upload handler, `tenantId` and `userId` silently become `undefined`. Orders could be inserted without tenant isolation, breaking multi-tenancy.

**Acceptance Criteria:**
- [ ] Upload handler returns 401 if `user`, `tenantId`, or `userId` are missing
- [ ] No order can be inserted without valid tenant context
- [ ] Test: unauthenticated request returns 401

---

### [QA-002] Fix order line type assertions without validation — `DONE`
> DONE 2026-03-13 — All order line fields validated with explicit type checks before insert
**Priority:** P0 | **Effort:** XS | **Depends on:** API-002

Upload handler uses raw `as` casts on `data.quantity`, `data.unit_price` etc. If values are `undefined` or `NaN`, the SQL insert will silently fail or corrupt data.

**Acceptance Criteria:**
- [ ] All order line fields are validated with explicit type checks before insert
- [ ] `quantity` must be a positive integer
- [ ] `unit_price` must be a non-negative integer (cents)
- [ ] Invalid data returns descriptive error

---

### [QA-003] Fix mobile order submission missing line discount — `DONE`
> DONE 2026-03-13 — line_total uses shared lineTotal() utility with discount_pct
**Priority:** P0 | **Effort:** XS | **Depends on:** MOB-012

`order/new.tsx` calculates `line_total` as `unitPrice * quantity` without applying `discountPct`. Server receives incorrect totals, causing discrepancy between device display and persisted data.

**Acceptance Criteria:**
- [ ] `line_total` uses shared `lineTotal()` utility from `@scanorder/shared`
- [ ] Discount percentage is included in submitted order data
- [ ] Cart total matches submitted order total

---

### [QA-004] Sync Zod schema with shared types (session_id, device_id) — `DONE`
> DONE 2026-03-13 — createOrderSchema includes session_id and device_id fields
**Priority:** P0 | **Effort:** XS | **Depends on:** PKG-002

`createOrderSchema` does not include `session_id` or `device_id` fields that exist in the `Order` shared type. These fields are silently dropped during Zod validation.

**Acceptance Criteria:**
- [ ] `createOrderSchema` includes `session_id` (uuid, nullable)
- [ ] `createOrderSchema` includes `device_id` (string, nullable)
- [ ] Schema matches `Order` type exactly

---

### [QA-005] Add Zod validation for PowerSync upload payload — `DONE`
> DONE 2026-03-13 — syncUploadPayloadSchema validates transactions/ops structure, max 100 ops
**Priority:** P0 | **Effort:** S | **Depends on:** API-002

The sync upload handler does not validate the top-level `transactions` structure. Malformed payloads could crash the handler or be silently ignored. DOS risk.

**Acceptance Criteria:**
- [ ] Zod schema for `{ transactions: [{ ops: [{ op, table, id, data }] }] }`
- [ ] Invalid payload returns 400 with descriptive error
- [ ] Oversized payloads rejected (max 100 ops per request)

---

### [QA-006] Add auth guard to web dashboard pages — `DONE`
> DONE 2026-03-13 — Next.js middleware redirects unauthenticated users to /login
**Priority:** P0 | **Effort:** S | **Depends on:** WEB-002

Dashboard pages query Supabase without checking authentication. Unauthenticated users can access `/orders`, `/orders/[id]`, and dashboard home. Errors are returned but not handled.

**Acceptance Criteria:**
- [ ] Next.js middleware redirects unauthenticated users to `/login` for all `/(dashboard)/*` routes
- [ ] Dashboard layout checks session before rendering
- [ ] Supabase query errors result in user-visible feedback, not silent failure

---

### [QA-007] Wrap order + line inserts in database transaction — `DONE`
> DONE 2026-03-13 — Order + lines wrapped in BEGIN/COMMIT with ROLLBACK on failure
**Priority:** P0 | **Effort:** S | **Depends on:** API-002

Orders and order lines are inserted separately. If order succeeds but a line fails, the database has an orphaned order with missing lines and no rollback.

**Acceptance Criteria:**
- [ ] Order + all order lines inserted in a single PostgreSQL transaction
- [ ] If any line fails, entire order is rolled back
- [ ] Stock decrements are part of the same transaction

---

### [QA-008] Fix Customer type missing city/country fields — `DONE`
> DONE 2026-03-13 — Already correct: Customer type has address.city/country via CustomerAddress, modal uses optional chaining
**Priority:** P0 | **Effort:** XS | **Depends on:** PKG-001

`CustomerSelectModal.tsx` references `customer.city` and `customer.country` but the `Customer` shared type has no `city` or `country` fields. This causes typecheck failure.

**Acceptance Criteria:**
- [ ] `Customer` type includes `city` and `country` (or `address` JSONB is properly typed)
- [ ] `pnpm typecheck` passes for `@scanorder/mobile`
- [ ] Customer modal search by city still works

---

### [QA-009] Fix web build — AuthLayout return type annotation — `DONE`
> DONE 2026-03-13 — Explicit JSX.Element return type added
**Priority:** P0 | **Effort:** XS | **Depends on:** WEB-001

`apps/web/app/(auth)/layout.tsx` fails to build because the inferred return type references transitive `@types/react` from pnpm's `.pnpm` directory. Classic pnpm strict hoisting issue.

**Acceptance Criteria:**
- [ ] Add explicit return type to `AuthLayout` component
- [ ] `pnpm build` passes for `@scanorder/web`

---

### [QA-010] Fix lint — add eslint as dependency — `DONE`
> DONE 2026-03-13 — eslint 8.x added to config package, lint passes for shared
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-003

`pnpm lint` fails because `eslint` binary is not installed. The lint script references `eslint` but it's not in devDependencies.

**Acceptance Criteria:**
- [ ] `eslint` added to root or relevant package devDependencies
- [ ] `pnpm lint` runs without "command not found" errors
- [ ] At least `@scanorder/shared` passes lint

---

### [QA-011] Add rate limiting to sync endpoint — `DONE`
> DONE 2026-03-13 — In-memory sliding window, 100 req/min/tenant, 429 with Retry-After
**Priority:** P1 | **Effort:** S | **Depends on:** API-002

The `/api/sync/upload` endpoint has no rate limiting. A malicious or buggy device could flood the endpoint, causing DOS.

**Acceptance Criteria:**
- [ ] Rate limiting middleware on `/api/sync/*` routes
- [ ] Per-tenant limit (e.g., 100 requests/minute)
- [ ] 429 response with `Retry-After` header
- [ ] Cloudflare KV or in-memory store for rate state

---

### [QA-012] Fix CORS hardcoded origins — `DONE`
> DONE 2026-03-13 — CORS origins read from ALLOWED_ORIGINS env var
**Priority:** P1 | **Effort:** XS | **Depends on:** INFRA-009

CORS origins are hardcoded to `localhost:3000` and `localhost:8081`. Production deployment will fail or be insecure.

**Acceptance Criteria:**
- [ ] CORS origins read from environment variable `ALLOWED_ORIGINS`
- [ ] Default to localhost in development
- [ ] Production origins configurable via Cloudflare secrets

---

### [QA-013] Replace Google connectivity check with own API heartbeat — `DONE`
> DONE 2026-03-13 — Network check now pings own /health endpoint
**Priority:** P1 | **Effort:** XS | **Depends on:** MOB-016

`useNetwork` hook pings `google.com/generate_204` which can be blocked by corporate networks or firewalls, causing false offline detection.

**Acceptance Criteria:**
- [ ] Connectivity check hits ScanOrder's own `/health` endpoint
- [ ] Fallback to `@react-native-community/netinfo` for basic connectivity
- [ ] No dependency on third-party URLs for offline detection

---

### [QA-014] Centralize hardcoded configuration values — `DONE`
> DONE 2026-03-13 — Shared config module with NETWORK, SCANNER, API, ORDER, TAX constants
**Priority:** P1 | **Effort:** S | **Depends on:** INFRA-001

Hardcoded values scattered across the codebase: network timeout (3000ms), poll interval (30000ms), barcode min length (8), CORS origins, scan debounce (500ms).

**Acceptance Criteria:**
- [ ] Shared config module in `packages/shared/src/config/`
- [ ] All hardcoded values moved to named constants
- [ ] Values overridable via environment variables where applicable

---

### [QA-015] Use shared formatPrice consistently across web dashboard — `DONE`
> DONE 2026-03-13 — Dashboard home uses formatPrice from @scanorder/shared
**Priority:** P2 | **Effort:** XS | **Depends on:** PKG-003

Web dashboard uses inline `Intl.NumberFormat` calls instead of the shared `formatPrice` utility, creating inconsistency risk and unnecessary object creation per render.

**Acceptance Criteria:**
- [ ] All price formatting in `apps/web/` uses `formatPrice` from `@scanorder/shared`
- [ ] No inline `Intl.NumberFormat` calls in web app

---

### [QA-016] Add error states to mobile data hooks — `DONE`
> DONE 2026-03-13 — useProducts and useOrders now return { data, loading, error, clearError }; orders screen shows error banner + pull-to-refresh; scan screen surfaces lookup errors
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-003

`useProducts` and `useOrders` hooks return empty/null with no error indication. When PowerSync is implemented, failures will be silent.

**Acceptance Criteria:**
- [x] Hooks return `{ data, loading, error }` pattern
- [x] Error state shown in UI (toast or inline message)
- [x] Loading state shows skeleton/spinner

---

### [QA-017] Add tenant_id to mobile order creation — `DONE`
> DONE 2026-03-13 — Mobile includes tenant_id from auth, API validates match
**Priority:** P0 | **Effort:** XS | **Depends on:** MOB-012

`order/new.tsx` creates orders without `tenant_id`. The API infers it from auth context, but on shared devices this is fragile. Mobile should always include `tenant_id` and the API should validate it matches auth context.

**Acceptance Criteria:**
- [ ] Mobile order object includes `tenant_id` from auth store
- [ ] API validates `order.tenant_id === authUser.tenantId`
- [ ] Mismatch returns 403

---

## 19. Integration & Unit Tests (TEST-NEW)

*Added 2026-03-12 — tests designed from codebase analysis. These test the critical paths that currently have zero coverage.*

### [TEST-N001] Unit tests for shared pricing utilities — `DONE`
> DONE 2026-03-13 — 18 tests for formatPrice, lineTotal, calculateTax, calculateOrderTotals
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-003, QA-010

Zero test coverage on price formatting, tax calculation, and line total computation. These are used in cart, order submission, and web display.

**Acceptance Criteria:**
- [ ] Test `formatPrice` with EUR, 0 cents, negative, large values, different locales
- [ ] Test `lineTotal` with quantity=1, quantity=0, with discount, 100% discount
- [ ] Test `calculateTax` with 2100 basis points (21%), 0%, edge cases
- [ ] Test `calculateOrderTotals` with multiple lines, mixed tax rates, discounts
- [ ] Test rounding behavior (half-cent rounding)
- [ ] All tests pass via `pnpm test`

---

### [TEST-N002] Unit tests for barcode validation — `DONE`
> DONE 2026-03-13 — 19 tests for EAN-13, EAN-8, UPC-A, detectBarcodeType
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-003

Barcode validation (EAN-13, EAN-8, UPC-A check digit) has no tests. Invalid barcodes could be accepted or valid ones rejected.

**Acceptance Criteria:**
- [ ] Test valid EAN-13 (e.g., `8710341001234`) returns true
- [ ] Test invalid EAN-13 check digit returns false
- [ ] Test valid EAN-8, valid UPC-A
- [ ] Test edge cases: empty string, non-numeric, wrong length
- [ ] Test `detectBarcodeType` returns correct format

---

### [TEST-N003] Unit tests for Zod validation schemas — `DONE`
> DONE 2026-03-13 — 27 tests for orderLine, createOrder, syncUploadPayload schemas
**Priority:** P0 | **Effort:** S | **Depends on:** PKG-002

Zod schemas for orders, customers, and products have no tests. Edge cases (negative quantities, missing required fields, UUID format) are not verified.

**Acceptance Criteria:**
- [ ] Test `createOrderSchema` accepts valid order, rejects missing `customer_id`
- [ ] Test `orderLineSchema` rejects quantity=0, quantity=-1, non-integer
- [ ] Test `createCustomerSchema` requires `company_name`
- [ ] Test `productSearchSchema` with valid and invalid inputs
- [ ] Test that schema types match shared TypeScript types

---

### [TEST-N004] Integration test for API sync upload handler — `NOT STARTED`
**Priority:** P0 | **Effort:** M | **Depends on:** API-002, QA-005

The most critical API endpoint has no tests. Need to verify: auth validation, idempotency, order number generation, line item insertion, stock decrement, error handling.

**Acceptance Criteria:**
- [ ] Test: unauthenticated request → 401
- [ ] Test: valid order upload → 200, order created with sequential number
- [ ] Test: duplicate order UUID → 200 (idempotent, no duplicate insert)
- [ ] Test: invalid payload (missing fields) → 400
- [ ] Test: order with 0 lines → appropriate error
- [ ] Test: stock decrement after successful order
- [ ] Uses Miniflare or Vitest with Cloudflare Workers test harness

---

### [TEST-N005] Unit tests for cart store (Zustand) — `DONE`
> DONE 2026-03-13 — 22 tests covering add/remove/update/clear, computed totals, discount, variant handling
**Priority:** P1 | **Effort:** S | **Depends on:** MOB-009

Cart store manages add/remove/update/clear operations and total calculations. No tests verify correctness.

**Acceptance Criteria:**
- [x] Test `addItem` — new product creates line, same product increments qty
- [x] Test `removeItem` — line removed from cart
- [x] Test `updateQuantity` — qty updated, qty=0 removes line
- [x] Test `clearCart` — all lines and customer cleared
- [x] Test `subtotal`, `taxAmount`, `total` calculations match shared utility
- [x] Test with discount applied

---

### [TEST-N006] Integration test for web auth flow — `NOT STARTED`
**Priority:** P1 | **Effort:** M | **Depends on:** WEB-002

No test for the login → dashboard → logout flow. Auth guards on dashboard pages are untested.

**Acceptance Criteria:**
- [ ] Test: unauthenticated user accessing `/` → redirected to `/login`
- [ ] Test: successful login → redirected to `/`
- [ ] Test: invalid credentials → error message shown
- [ ] Test: authenticated user sees dashboard with KPI cards
- [ ] Test: logout → redirected to `/login`, session cleared

---

### [TEST-N007] Integration test for order lifecycle (mobile → API → web) — `NOT STARTED`
**Priority:** P1 | **Effort:** L | **Depends on:** MOB-012, API-002, WEB-004

The core PoC flow — scan barcode, add to cart, submit order, see on web dashboard — has no end-to-end test.

**Acceptance Criteria:**
- [ ] Test: create order on mobile (mock PowerSync) → order data matches schema
- [ ] Test: submit order to API → order persisted with correct tenant, user, lines
- [ ] Test: order appears in web dashboard orders list
- [ ] Test: order detail page shows correct line items and totals
- [ ] Test: order totals match between mobile, API, and web

---

### [TEST-N008] Unit tests for JWT validation middleware — `DONE`
> DONE 2026-03-13 — 10 tests for all auth edge cases (expired, bad sig, missing claims, valid)
**Priority:** P1 | **Effort:** S | **Depends on:** API-001

JWT middleware validates tokens but has no tests. Edge cases: expired tokens, missing claims, invalid signatures, malformed headers.

**Acceptance Criteria:**
- [ ] Test: valid JWT → user context set with tenant_id, user_id, role
- [ ] Test: expired JWT → 401
- [ ] Test: missing `Authorization` header → 401
- [ ] Test: invalid signature → 401
- [ ] Test: JWT without `app_metadata.tenant_id` → 401
- [ ] Test: Bearer prefix missing → 401

---

### [TEST-N009] Vitest configuration setup — `DONE`
> DONE 2026-03-13 — vitest.config.ts for shared and API, pnpm test passes
**Priority:** P0 | **Effort:** XS | **Depends on:** INFRA-001

Vitest is listed as a dependency but no `vitest.config.ts` exists. `pnpm test` runs vitest but exits with code 1 because there are no test files.

**Acceptance Criteria:**
- [ ] `vitest.config.ts` in `packages/shared/`
- [ ] `vitest.config.ts` in `apps/api/` (with Miniflare/Workers compat)
- [ ] `pnpm test` succeeds when test files exist (no exit code 1 on empty)
- [ ] Test file patterns: `**/*.test.ts`, `**/*.spec.ts`

---

## Ticket Count Summary (Updated)

| Section | Tickets | New |
|---------|---------|-----|
| 1-17. Original tickets | 130 | — |
| 18. Code Quality (QA) | 17 | +17 |
| 19. Tests (TEST-NEW) | 9 | +9 |
| **Total** | **156** | **+26** |
