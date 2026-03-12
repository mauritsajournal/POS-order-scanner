# ScanOrder — Claude Code Instructions

## Project
Offline-first POS & B2B trade show order management SaaS. Monorepo with Turborepo + pnpm.

## Stack
- Mobile: Expo (React Native) + PowerSync + react-native-vision-camera
- Web: Next.js 15 + Tailwind + shadcn/ui
- API: Cloudflare Workers + Hono
- DB: Supabase (PostgreSQL) + Drizzle ORM
- Payments: Mollie Connect (primary), Stripe Connect (secondary)

## Commands
- `pnpm dev` — start all apps
- `pnpm dev:mobile` — start Expo dev server
- `pnpm dev:web` — start Next.js dev server
- `pnpm dev:api` — start Wrangler dev server
- `pnpm db:generate` — generate Drizzle migrations
- `pnpm db:push` — push migrations to Supabase
- `pnpm db:seed` — seed demo data
- `pnpm lint` — lint all packages
- `pnpm typecheck` — TypeScript check all packages
- `pnpm test` — run all tests

## Conventions
- All shared types in `packages/shared/src/types/`
- All Zod validation in `packages/shared/src/validation/`
- DB schema in `packages/db/src/schema/` (Drizzle ORM)
- Every table has `tenant_id` for multi-tenancy (enforced by RLS)
- UUIDs for all primary keys (generated client-side for offline)
- Soft deletes (`is_deleted` boolean), never hard delete
- Dutch locale (NL) as default, English as fallback
- Prices stored as integers (cents), displayed with formatting util
- Import shared package as `@scanorder/shared`, `@scanorder/db`

## PowerSync
- Sync rules in PowerSync dashboard control data partitioning
- Products + customers: sync DOWN (server → device)
- Orders: created locally, queued UP (device → server)
- Upload handler at `apps/api/src/routes/sync/upload.ts`

## Integrations
- WooCommerce: REST API v3, consumer key/secret auth
- Exact Online: OAuth2, token refresh in edge function
- Mollie: API key + OAuth for Connect

## Supabase
- Project ref: bygulilidempcmiclwji
- API URL: https://bygulilidempcmiclwji.supabase.co
- Local dev: `npx supabase start` (requires Docker)
- Migrations in `packages/db/src/migrations/`
- RLS policies in `packages/db/src/rls/policies.sql`

## File Patterns
- Mobile screens: `apps/mobile/app/(app)/(tabs)/[screen].tsx`
- Mobile components: `apps/mobile/components/[area]/[Component].tsx`
- Mobile hooks: `apps/mobile/hooks/use[Name].ts`
- Web pages: `apps/web/app/(dashboard)/[section]/page.tsx`
- API routes: `apps/api/src/routes/[area]/[route].ts`
