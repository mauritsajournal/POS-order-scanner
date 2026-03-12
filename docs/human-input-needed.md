# Human Input Needed

**Last updated:** 2026-03-12
**Context:** These are blockers that Claude cannot resolve autonomously. They require human action — account creation, dashboard configuration, credential provisioning, or physical device access.

---

## CRITICAL BLOCKERS (blocking the PoC critical path)

### 1. PowerSync Cloud Setup — blocks INFRA-008, MOB-003, MOB-008, MOB-012
**What's needed:** Create a PowerSync Cloud project and configure sync streams.
**Why Claude can't do it:** PowerSync requires account creation and dashboard-based configuration (no CLI/API for initial setup).
**Steps for human:**
1. Sign up at https://www.powersync.com/ (Pro plan)
2. Create a new project, connect it to Supabase (project ref: `bygulilidempcmiclwji`)
3. Define sync streams:
   - **DOWN** (server → device): `products`, `product_variants`, `customers`, `events` — filtered by `tenant_id`
   - **UP** (device → server): `orders`, `order_lines`
4. Copy the PowerSync URL and public key into `.env`:
   ```
   POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
   POWERSYNC_PUBLIC_KEY=your-public-key
   EXPO_PUBLIC_POWERSYNC_URL=https://your-instance.powersync.journeyapps.com
   ```
**Impact:** Without this, the entire offline-first data layer is non-functional. Product lookup from barcode scan, order submission, and sync all depend on PowerSync. This is the single biggest blocker for the PoC.

---

### 2. Cloudflare Hyperdrive Configuration — blocks INFRA-010, API-002
**What's needed:** Create a Hyperdrive configuration in Cloudflare dashboard connecting to Supabase PostgreSQL.
**Why Claude can't do it:** Requires Cloudflare dashboard access and storing the DB connection string as a secret.
**Steps for human:**
1. Go to Cloudflare Dashboard → Workers & Pages → Hyperdrive
2. Create a new configuration pointing to Supabase PostgreSQL:
   ```
   Host: db.bygulilidempcmiclwji.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your Supabase DB password]
   ```
3. Note the Hyperdrive ID and update `apps/api/wrangler.jsonc`
4. Set the connection string as a Cloudflare secret: `wrangler secret put DATABASE_URL`
**Impact:** Without this, the API Worker cannot write to the database. Order uploads from mobile devices will fail.

---

### 3. Supabase Local Dev & Migrations — blocks INFRA-004 (completion), INFRA-005 (migration)
**What's needed:** Run `supabase init` and apply the Drizzle migration + RLS policies to the actual database.
**Why Claude can't do it:** Requires Docker (for local Supabase) and network access to Supabase project.
**Steps for human:**
1. Install Supabase CLI: `npm install -g supabase`
2. Run `supabase init` in repo root (creates `supabase/config.toml`)
3. Run `pnpm db:generate` to generate Drizzle migrations
4. Run `pnpm db:push` to apply schema to Supabase
5. Apply RLS policies: `psql $DATABASE_URL < packages/db/src/rls/policies.sql`
6. Run `pnpm db:seed` to populate demo data
**Impact:** Database schema exists in code but has not been applied to the live Supabase instance.

---

## IMPORTANT (needed before testing but not blocking code)

### 4. Supabase Auth Users — blocks end-to-end testing
**What's needed:** Create test users in Supabase Auth with correct `app_metadata`.
**Steps for human:**
1. In Supabase Dashboard → Authentication → Users, create:
   - Admin: `admin@scanorder.dev` with `app_metadata: {"tenant_id": "...", "role": "admin"}`
   - Manager: `manager@scanorder.dev` with `app_metadata: {"tenant_id": "...", "role": "manager"}`
   - Sales rep: `sales@scanorder.dev` with `app_metadata: {"tenant_id": "...", "role": "sales_rep"}`
2. Use the tenant UUID from the seed data
**Impact:** Login screens exist but cannot authenticate without real users.

---

### 5. Cloudflare Worker Deployment — blocks INFRA-009 (deploy step)
**What's needed:** Deploy the API Worker to Cloudflare.
**Steps for human:**
1. `cd apps/api && npx wrangler deploy`
2. Or set up CI with `CLOUDFLARE_API_TOKEN`
**Impact:** API only runs locally until deployed.

---

### 6. EAS / Expo Build — blocks MOB-001 (device testing)
**What's needed:** Build and run the Expo app on a physical iPad/iPhone.
**Why Claude can't do it:** Requires macOS with Xcode for iOS simulator, or EAS Build with Apple Developer account.
**Steps for human:**
1. `cd apps/mobile && npx expo start` (for Expo Go testing)
2. Or `eas build --profile development --platform ios` (for dev build)
**Impact:** All mobile UI code exists but has not been tested on a real device.

---

## NICE TO HAVE (not blocking PoC)

### 7. Cloudflare R2 Bucket — blocks INFRA-011
**What's needed:** Create R2 bucket for product images.
**Steps:** Cloudflare Dashboard → R2 → Create bucket `scanorder-images`

### 8. Domain / Custom URL Setup
**What's needed:** Configure custom domains for web dashboard and API.
**Steps:** DNS records + Vercel/Cloudflare configuration.

---

## Summary

| # | Blocker | Blocks | Effort | Priority |
|---|---------|--------|--------|----------|
| 1 | PowerSync Cloud setup | INFRA-008, MOB-003, MOB-008, MOB-012 | 30min | **CRITICAL** |
| 2 | Cloudflare Hyperdrive | INFRA-010, API-002 | 15min | **CRITICAL** |
| 3 | Supabase migrations | INFRA-004, INFRA-005 | 30min | **CRITICAL** |
| 4 | Auth test users | E2E testing | 15min | Important |
| 5 | CF Worker deploy | INFRA-009 | 5min | Important |
| 6 | Expo device build | MOB-001 | 30min | Important |
| 7 | R2 bucket | INFRA-011 | 5min | Nice to have |
| 8 | Custom domains | — | varies | Nice to have |

**Total human time for critical blockers: ~75 minutes**
Once these are done, Claude can continue implementing the remaining P0 tickets (PowerSync client, mobile offline sync) without further human intervention.

---

## Run Summary — 2026-03-12 18:00 UTC

- **Tickets completed:** #API-001 (JWT middleware), #API-007 (order number sequence), #API-002 (upload handler DB writes)
- **Tickets skipped (blocked):** #INFRA-004 (Supabase local dev), #INFRA-008 (PowerSync setup), #INFRA-010 (Hyperdrive), #MOB-003 (PowerSync client), #MOB-008 (product lookup), #MOB-012 (order submission offline queue)
- **Tickets remaining (P0, not blocked):** None — all remaining P0 tickets are blocked by human input (PowerSync/Hyperdrive/Supabase setup)
- **Notes:** All three workable P0 tickets were implemented and pass typecheck. API-002 upload handler works in ack-only mode without Hyperdrive, and will perform full DB writes once Hyperdrive binding is configured. The order_sequences table was added to Drizzle schema but needs to be applied to the live DB via migration (blocker #3).

---
