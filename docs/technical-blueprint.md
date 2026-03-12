# ScanOrder — Technical Blueprint

**Product:** Offline-first POS & B2B order management SaaS
**Version:** v0.2 (PoC → MVP Blueprint)
**Date:** March 2026 (revised)
**Status:** Pre-development specification

> **Positioning:** ScanOrder is a Point of Sale (POS) application first, with deep B2B trade show features as its differentiator. It handles the full POS lifecycle: scanning, cart, checkout, receipts, cash management, and shift reconciliation — with offline-first sync and trade show event management as key USPs.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [PoC Strategy & Platform Priorities](#2-poc-strategy--platform-priorities)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure (Monorepo)](#4-project-structure-monorepo)
5. [Database Schema](#5-database-schema)
6. [POS Features](#6-pos-features)
7. [API Design](#7-api-design)
8. [Offline-First Sync Architecture](#8-offline-first-sync-architecture)
9. [Mobile App — Screens & Flows](#9-mobile-app--screens--flows)
10. [Web Admin Dashboard](#10-web-admin-dashboard)
11. [Barcode Scanning](#11-barcode-scanning)
12. [Payment Processing](#12-payment-processing)
13. [Integration Architecture](#13-integration-architecture)
14. [Security Architecture](#14-security-architecture)
15. [Scalability Strategy](#15-scalability-strategy)
16. [UI Mock Designs](#16-ui-mock-designs)
17. [POS Reference Analysis](#17-pos-reference-analysis)
18. [CI/CD & Deployment](#18-cicd--deployment)
19. [Cost Breakdown](#19-cost-breakdown)
20. [Development Roadmap](#20-development-roadmap)

---

## 1. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐                │
│  │    Mobile App        │         │   Web Dashboard      │               │
│  │    (Expo/RN)         │         │   (Next.js 15)       │               │
│  │                     │         │                     │                │
│  │  ┌───────────────┐  │         │  ┌───────────────┐  │                │
│  │  │ PowerSync SDK │  │         │  │ Supabase SDK  │  │                │
│  │  │ + SQLite      │  │         │  │ + React Query │  │                │
│  │  │ (offline DB)  │  │         │  └───────────────┘  │                │
│  │  └───────────────┘  │         │                     │                │
│  │  ┌───────────────┐  │         │  Server Components   │               │
│  │  │ Vision Camera │  │         │  + Server Actions     │               │
│  │  │ (barcode)     │  │         │                     │                │
│  │  └───────────────┘  │         │                     │                │
│  └──────────┬──────────┘         └──────────┬──────────┘                │
│             │                               │                           │
└─────────────┼───────────────────────────────┼───────────────────────────┘
              │ WebSocket (sync)              │ HTTPS
              │ HTTPS (uploads)               │
              ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EDGE / API LAYER                                 │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │              Cloudflare Workers (Hono framework)                │     │
│  │                                                                │     │
│  │  /api/webhooks/*     ← WooCommerce, Exact Online, Mollie      │     │
│  │  /api/integrations/* ← Sync orchestration                     │     │
│  │  /api/pdf/*          ← Order confirmation generation          │     │
│  │  /api/images/*       ← R2 upload/resize                       │     │
│  │                                                                │     │
│  │  Middleware: JWT validation, rate limiting, tenant resolution   │     │
│  └────────────────────────┬───────────────────────────────────────┘     │
│                           │                                             │
│  ┌────────────────────────┴───────────────────────────────────────┐     │
│  │  Cloudflare R2          │  Cloudflare KV        │  Cloudflare Q│     │
│  │  (product images,       │  (rate limit state,   │  (async jobs,│     │
│  │   PDF exports)          │   session cache)      │   webhooks)  │     │
│  └─────────────────────────┴───────────────────────┴──────────────┘     │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │ Hyperdrive (connection pooling)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVICES                                 │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │    Supabase       │  │   PowerSync       │  │  Mollie Connect  │     │
│  │                  │  │   Service          │  │                 │      │
│  │  PostgreSQL 16   │◄─┤                   │  │  Payments       │      │
│  │  + Auth (GoTrue) │  │  WAL reader       │  │  Split payments │      │
│  │  + Realtime      │  │  Sync Streams     │  │  KYC            │      │
│  │  + Row-Level Sec │  │  Client SDK       │  │  Terminals      │      │
│  │  + Edge Functions│  │  Conflict detect  │  │                 │      │
│  │  + Storage       │  │                   │  │                 │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐                             │
│  │  WooCommerce      │  │  Exact Online     │                            │
│  │  (REST API v3)    │  │  (REST API)       │                            │
│  │                  │  │                   │                             │
│  │  Products sync   │  │  Orders push      │                            │
│  │  Orders push     │  │  Invoices push    │                            │
│  │  Inventory pull  │  │  Customers sync   │                            │
│  │  Webhooks        │  │  OAuth2           │                            │
│  └──────────────────┘  └──────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Mobile framework** | Expo (React Native) | Shopify POS proves RN works at scale for POS. Expo adds OTA updates, cloud builds, no Mac needed. |
| **Offline sync** | PowerSync | Only production-ready Postgres→SQLite sync. $49/mo Pro. Official Supabase integration. |
| **Backend** | Supabase | Auth + DB + Realtime + RLS + Storage in one service. Biggest time saver for small team. |
| **API edge layer** | Cloudflare Workers + Hono | A-Journal already on Cloudflare. Webhooks, image processing, rate limiting at edge. Hyperdrive for Postgres. |
| **Database** | PostgreSQL (Supabase-hosted) | RLS for multi-tenancy, JSONB for flexible attributes, proven at scale. |
| **Web dashboard** | Next.js 15 (App Router) | Largest ecosystem, Server Components, most Claude-codeable framework. |
| **Payments** | Mollie Connect (primary) | Dutch HQ, iDEAL native, lower EU fees, SaaS split payments built in. |
| **Monorepo** | Turborepo + pnpm | Shared TypeScript types and Zod validation across mobile, web, API. |
| **Barcode scanning** | react-native-vision-camera | Best maintained, native ML Kit/Vision Kit, multi-code detection. |
| **AI-assisted dev** | Claude via MCP | Every component has APIs/CLIs Claude can connect to and operate. |

---

## 2. PoC Strategy & Platform Priorities

### PoC Goal

Prove the core POS loop in **~3 weeks**: scan barcode → add to cart → select customer → submit order → see order on web dashboard. Everything else is post-PoC.

### Platform Priority Order

| Priority | Platform | Why | Timeline |
|:--------:|----------|-----|----------|
| **1** | **iPad (iOS)** | Trade show standard hardware. Best camera scanning. Real offline. | PoC (week 1-3) |
| **2** | **Web dashboard** | Admin needs to see orders from day 1. Next.js, minimal features. | PoC (week 1-3) |
| **3** | **iPhone (iOS)** | Same Expo codebase as iPad, just different layout. | Alpha (week 4-6) |
| **4** | **Android tablet** | Second priority platform. Expo builds for Android from same code. | MVP (week 8+) |
| **5** | **Android phone** | Lowest priority. Most trade show reps use iPads. | MVP (week 10+) |

### PoC Scope (What's IN)

- Expo app targeting iPad (iOS only)
- Barcode scanning (camera + BT hardware scanner)
- Product catalog (local SQLite via PowerSync)
- Cart with quantity management
- Customer selection
- Order submission with offline queue
- Sync to Supabase when online
- Basic web dashboard: order list + order detail
- Supabase Auth (email/password)
- Single tenant (multi-tenancy infra in place but not enforced)

### PoC Scope (What's OUT — deferred to MVP+)

- Android builds
- Price lists / volume discounts
- Exact Online integration
- WooCommerce integration
- Mollie/Stripe payment processing
- PDF generation
- Analytics / reporting
- Cash management / shift management
- Returns / refunds
- Onboarding wizard
- App Store submission (TestFlight only)
- Multi-tenant billing

### Why iPad-First, Not Web PWA

A web-based PoC (PWA) would be faster to deploy but:
1. **Camera barcode scanning** is unreliable in mobile browsers (no ML Kit, poor autofocus control)
2. **Offline** via Service Workers is fragile vs. native SQLite + PowerSync
3. **Bluetooth scanner** support in browsers is experimental (Web Bluetooth API ≠ HID)
4. **App Store presence** matters for B2B credibility — even TestFlight signals "real product"
5. **Expo builds for iOS from Linux** — EAS Build handles it, no Mac needed

The web dashboard (Next.js) covers the "accessible anywhere" angle.

### Why This Stack is Claude-Connectable

Every component was selected with AI-assisted development in mind:

| Component | Claude Integration |
|-----------|-------------------|
| **Supabase** | CLI (`supabase`), Management API, SQL migrations — Claude can create tables, write RLS policies, deploy edge functions |
| **Cloudflare** | Wrangler CLI, REST API, MCP server available — Claude can deploy Workers, manage R2, configure routes |
| **Expo/EAS** | EAS CLI — Claude can trigger builds, push OTA updates, manage app config |
| **Next.js** | Standard file-based routing — Claude can create pages, API routes, server actions by writing files |
| **GitHub** | CLI + API — Claude can create PRs, manage issues, trigger Actions |
| **Mollie** | REST API with OpenAPI spec — Claude can manage payments, create refunds, handle webhooks |
| **PowerSync** | Dashboard API — Claude can manage sync rules and monitor sync health |
| **Drizzle ORM** | Schema-as-code in TypeScript — Claude generates migrations from schema changes |

---

## 3. Technology Stack

### Complete Stack Specification

| Layer | Technology | Version | License |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 22 LTS | MIT |
| **Language** | TypeScript | 5.5+ | Apache 2.0 |
| **Mobile framework** | Expo (React Native) | SDK 52+ | MIT |
| **Mobile offline** | PowerSync | SDK 1.32+ | Apache 2.0 (client) |
| **Mobile SQLite** | op-sqlite | 15.x | MIT |
| **Mobile encryption** | SQLCipher (via op-sqlite) | 4.x | BSD |
| **Barcode scanning** | react-native-vision-camera | 4.7+ | MIT |
| **Web framework** | Next.js | 15.x | MIT |
| **Web styling** | Tailwind CSS | 4.x | MIT |
| **Mobile styling** | NativeWind | 4.x | MIT |
| **State management** | Zustand (mobile) / React Query (web) | 5.x / 5.x | MIT |
| **ORM** | Drizzle ORM | 0.36+ | Apache 2.0 |
| **Validation** | Zod | 3.x | MIT |
| **API framework** | Hono | 4.x | MIT |
| **Database** | PostgreSQL (Supabase) | 16+ | PostgreSQL License |
| **Auth** | Supabase Auth (GoTrue) | — | Apache 2.0 |
| **Realtime** | Supabase Realtime | — | Apache 2.0 |
| **Object storage** | Cloudflare R2 | — | Proprietary |
| **Edge compute** | Cloudflare Workers | — | Proprietary |
| **Queue** | Cloudflare Queues | — | Proprietary |
| **KV cache** | Cloudflare KV | — | Proprietary |
| **Payments (EU)** | Mollie Connect | — | Proprietary |
| **Payments (Intl)** | Stripe Connect | — | Proprietary |
| **Monitoring** | Sentry | — | BSL / Free tier |
| **CI/CD** | GitHub Actions + EAS Build | — | Proprietary / Free tier |
| **PDF generation** | @react-pdf/renderer (mobile) / Puppeteer (server) | — | MIT |

---

## 4. Project Structure (Monorepo)

```
scanorder/
├── apps/
│   ├── mobile/                          # Expo React Native app
│   │   ├── app/                         # Expo Router file-based routing
│   │   │   ├── (auth)/                  # Auth screens (login, register)
│   │   │   │   ├── login.tsx
│   │   │   │   └── _layout.tsx
│   │   │   ├── (app)/                   # Authenticated app screens
│   │   │   │   ├── (tabs)/              # Bottom tab navigator
│   │   │   │   │   ├── scan.tsx         # Scan & order (primary screen)
│   │   │   │   │   ├── orders.tsx       # Order history
│   │   │   │   │   ├── customers.tsx    # Customer list
│   │   │   │   │   ├── catalog.tsx      # Product catalog browse
│   │   │   │   │   └── _layout.tsx      # Tab bar config
│   │   │   │   ├── order/
│   │   │   │   │   ├── [id].tsx         # Order detail
│   │   │   │   │   └── new.tsx          # New order (full screen)
│   │   │   │   ├── customer/
│   │   │   │   │   ├── [id].tsx         # Customer detail
│   │   │   │   │   └── new.tsx          # New customer
│   │   │   │   ├── product/
│   │   │   │   │   └── [id].tsx         # Product detail
│   │   │   │   ├── settings/
│   │   │   │   │   ├── index.tsx        # Settings menu
│   │   │   │   │   ├── sync.tsx         # Sync status & controls
│   │   │   │   │   ├── scanner.tsx      # Scanner preferences
│   │   │   │   │   └── integrations.tsx # Connected integrations
│   │   │   │   └── _layout.tsx
│   │   │   └── _layout.tsx              # Root layout (auth check, sync init)
│   │   ├── components/
│   │   │   ├── scanner/
│   │   │   │   ├── BarcodeScanner.tsx   # Camera viewfinder + scanning
│   │   │   │   ├── ScanOverlay.tsx      # Scan result overlay
│   │   │   │   └── ScanFeedback.tsx     # Haptic + sound feedback
│   │   │   ├── order/
│   │   │   │   ├── Cart.tsx             # Order cart sidebar/bottom sheet
│   │   │   │   ├── CartItem.tsx         # Individual cart line item
│   │   │   │   ├── OrderSummary.tsx     # Totals, discounts, tax
│   │   │   │   └── CustomerPicker.tsx   # Customer selection modal
│   │   │   ├── product/
│   │   │   │   ├── ProductGrid.tsx      # Product grid (FlashList)
│   │   │   │   ├── ProductCard.tsx      # Individual product tile
│   │   │   │   └── ProductDetail.tsx    # Full product view
│   │   │   ├── common/
│   │   │   │   ├── SyncIndicator.tsx    # Online/offline/syncing badge
│   │   │   │   ├── SearchBar.tsx        # Universal search
│   │   │   │   └── QuantityInput.tsx    # +/- quantity controls
│   │   │   └── layout/
│   │   │       ├── SplitPane.tsx        # Tablet split layout
│   │   │       └── TabletHeader.tsx     # Header with sync status
│   │   ├── hooks/
│   │   │   ├── useSync.ts              # PowerSync connection management
│   │   │   ├── useProducts.ts          # Product queries (local DB)
│   │   │   ├── useCustomers.ts         # Customer queries (local DB)
│   │   │   ├── useOrders.ts            # Order CRUD (local DB + queue)
│   │   │   ├── useCart.ts              # Cart state management
│   │   │   ├── useScanner.ts           # Scanner state + handler
│   │   │   └── useNetwork.ts           # Connectivity detection
│   │   ├── lib/
│   │   │   ├── powersync.ts            # PowerSync client config
│   │   │   ├── supabase.ts             # Supabase client config
│   │   │   ├── schema.ts               # PowerSync local schema
│   │   │   └── sync-status.ts          # Sync queue monitoring
│   │   ├── store/
│   │   │   ├── cart.ts                 # Zustand cart store
│   │   │   ├── auth.ts                 # Auth state
│   │   │   └── settings.ts            # App settings (MMKV)
│   │   ├── app.json                    # Expo config
│   │   ├── eas.json                    # EAS Build config
│   │   └── package.json
│   │
│   ├── web/                             # Next.js admin dashboard
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── page.tsx             # Dashboard home (KPIs)
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx         # Orders list
│   │   │   │   │   └── [id]/page.tsx    # Order detail
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx         # Product management
│   │   │   │   │   └── [id]/page.tsx    # Product edit
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx         # Customer list
│   │   │   │   │   └── [id]/page.tsx    # Customer detail
│   │   │   │   ├── events/
│   │   │   │   │   ├── page.tsx         # Trade show events
│   │   │   │   │   └── [id]/page.tsx    # Event detail + orders
│   │   │   │   ├── integrations/
│   │   │   │   │   ├── page.tsx         # Integration overview
│   │   │   │   │   ├── woocommerce/page.tsx
│   │   │   │   │   └── exact-online/page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx         # Sales analytics
│   │   │   │   ├── settings/
│   │   │   │   │   ├── page.tsx         # General settings
│   │   │   │   │   ├── team/page.tsx    # User management
│   │   │   │   │   ├── billing/page.tsx # Subscription management
│   │   │   │   │   └── api/page.tsx     # API keys
│   │   │   │   └── layout.tsx           # Dashboard layout (sidebar)
│   │   │   └── layout.tsx               # Root layout
│   │   ├── components/
│   │   │   ├── ui/                      # shadcn/ui components
│   │   │   ├── dashboard/               # Dashboard-specific
│   │   │   ├── orders/                  # Order management
│   │   │   └── integrations/            # Integration config UIs
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── server.ts            # Server-side Supabase client
│   │   │   │   └── client.ts            # Client-side Supabase client
│   │   │   └── utils.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                              # Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts                  # Hono app entry
│       │   ├── routes/
│       │   │   ├── webhooks/
│       │   │   │   ├── woocommerce.ts    # WooCommerce webhook handler
│       │   │   │   ├── exact-online.ts   # Exact Online webhook handler
│       │   │   │   └── mollie.ts         # Mollie payment webhook
│       │   │   ├── integrations/
│       │   │   │   ├── woocommerce.ts    # WooCommerce sync endpoints
│       │   │   │   └── exact-online.ts   # Exact Online sync endpoints
│       │   │   ├── pdf/
│       │   │   │   └── order.ts          # PDF order confirmation
│       │   │   └── images/
│       │   │       └── upload.ts         # R2 image upload + resize
│       │   ├── middleware/
│       │   │   ├── auth.ts               # JWT validation
│       │   │   ├── tenant.ts             # Tenant resolution
│       │   │   └── rate-limit.ts         # Rate limiting (KV-based)
│       │   └── lib/
│       │       ├── supabase.ts           # Supabase client (via Hyperdrive)
│       │       ├── woocommerce.ts        # WooCommerce API client
│       │       ├── exact-online.ts       # Exact Online API client
│       │       └── mollie.ts             # Mollie API client
│       ├── wrangler.jsonc                # Cloudflare Worker config
│       └── package.json
│
├── packages/
│   ├── shared/                           # Shared business logic
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── order.ts              # Order, OrderLine, OrderStatus
│   │   │   │   ├── product.ts            # Product, ProductVariant
│   │   │   │   ├── customer.ts           # Customer, CustomerGroup
│   │   │   │   ├── event.ts              # TradeShow, EventConfig
│   │   │   │   ├── integration.ts        # Integration, SyncJob
│   │   │   │   └── index.ts
│   │   │   ├── validation/
│   │   │   │   ├── order.ts              # Zod schemas for orders
│   │   │   │   ├── product.ts            # Zod schemas for products
│   │   │   │   ├── customer.ts           # Zod schemas for customers
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── order-status.ts       # Order lifecycle states
│   │   │   │   ├── sync-status.ts        # Sync states
│   │   │   │   └── currencies.ts         # Supported currencies
│   │   │   └── utils/
│   │   │       ├── pricing.ts            # Price calculation, discounts, tax
│   │   │       ├── barcode.ts            # Barcode parsing/validation
│   │   │       └── format.ts             # Number/date formatting (NL locale)
│   │   └── package.json
│   │
│   ├── db/                               # Database schema & migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── tenants.ts            # Tenant/organization table
│   │   │   │   ├── users.ts              # Users (linked to Supabase Auth)
│   │   │   │   ├── products.ts           # Products + variants
│   │   │   │   ├── customers.ts          # B2B customers
│   │   │   │   ├── orders.ts             # Orders + line items
│   │   │   │   ├── events.ts             # Trade show events
│   │   │   │   ├── integrations.ts       # Integration configs
│   │   │   │   ├── sync-log.ts           # Sync audit log
│   │   │   │   └── index.ts
│   │   │   ├── migrations/               # Drizzle migrations
│   │   │   ├── seed/
│   │   │   │   └── demo.ts              # Demo data for development
│   │   │   └── rls/
│   │   │       └── policies.sql          # Row-Level Security policies
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── config/                           # Shared configs
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   ├── base.json
│       │   ├── react-native.json
│       │   └── nextjs.json
│       └── package.json
│
├── supabase/                             # Supabase local config
│   ├── config.toml
│   ├── migrations/                       # SQL migrations (generated from Drizzle)
│   └── functions/                        # Edge Functions (if needed beyond Workers)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint, type-check, test
│       ├── deploy-api.yml                # Deploy Cloudflare Workers
│       ├── deploy-web.yml                # Deploy Next.js to Vercel
│       └── build-mobile.yml              # EAS Build triggers
│
├── turbo.json                            # Turborepo config
├── pnpm-workspace.yaml                   # Workspace config
├── package.json                          # Root package.json
├── .env.example                          # Environment variable template
└── CLAUDE.md                             # Claude Code project instructions
```

### CLAUDE.md (for AI-assisted development)

```markdown
# ScanOrder — Claude Code Instructions

## Project
Offline-first B2B trade show order scanning SaaS. Monorepo with Turborepo + pnpm.

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
- `pnpm lint` — lint all packages
- `pnpm typecheck` — TypeScript check all packages
- `pnpm test` — run all tests

## Conventions
- All shared types in `packages/shared/src/types/`
- All Zod validation in `packages/shared/src/validation/`
- DB schema in `packages/db/src/schema/` (Drizzle)
- Every table has `tenant_id` for multi-tenancy (enforced by RLS)
- UUIDs for all primary keys (generated client-side for offline)
- Soft deletes (`is_deleted` boolean), never hard delete
- Dutch locale (NL) as default, English as fallback
- Prices stored as integers (cents), displayed with formatting util

## PowerSync
- Sync rules in PowerSync dashboard control data partitioning
- Products + customers: sync DOWN (server → device)
- Orders: created locally, queued UP (device → server)
- Upload handler at `apps/mobile/lib/powersync.ts`

## Integrations
- WooCommerce: REST API v3, consumer key/secret auth
- Exact Online: OAuth2, token refresh in edge function
- Mollie: API key + OAuth for Connect
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   tenants    │     │    users     │     │   events     │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │────┐│ id (PK)      │     │ id (PK)      │
│ name         │    ││ tenant_id(FK)│◄────│ tenant_id(FK)│
│ slug         │    ││ email        │     │ name         │
│ plan         │    ││ role         │     │ location     │
│ settings{}   │    ││ auth_id      │     │ start_date   │
└──────────────┘    │└──────────────┘     │ end_date     │
                    │                     │ status       │
                    │                     └──────┬───────┘
                    │                            │
                    │  ┌──────────────┐          │
                    │  │  customers   │          │
                    │  ├──────────────┤          │
                    ├──│ tenant_id(FK)│          │
                    │  │ id (PK)      │          │
                    │  │ company_name │          │
                    │  │ contact_name │          │
                    │  │ email        │          │
                    │  │ phone        │          │
                    │  │ vat_number   │          │
                    │  │ price_group  │          │
                    │  │ address{}    │          │
                    │  │ notes        │          │
                    │  └──────┬───────┘          │
                    │         │                  │
                    │         │ (customer_id)    │
                    │         ▼                  │ (event_id)
                    │  ┌──────────────┐          │
                    │  │   orders     │◄─────────┘
                    │  ├──────────────┤
                    ├──│ tenant_id(FK)│
                    │  │ id (PK)      │
                    │  │ order_number │
                    │  │ customer_id  │
                    │  │ event_id     │
                    │  │ user_id      │
                    │  │ status       │
                    │  │ subtotal     │
                    │  │ discount     │
                    │  │ tax_amount   │
                    │  │ total        │
                    │  │ currency     │
                    │  │ notes        │
                    │  │ device_id    │
                    │  │ synced_at    │
                    │  └──────┬───────┘
                    │         │
                    │         │ (order_id)
                    │         ▼
                    │  ┌──────────────┐     ┌──────────────┐
                    │  │ order_lines  │     │  products    │
                    │  ├──────────────┤     ├──────────────┤
                    │  │ id (PK)      │     │ id (PK)      │
                    │  │ order_id(FK) │     │ tenant_id(FK)│◄──┐
                    │  │ product_id   │────►│ sku          │   │
                    │  │ variant_id   │     │ barcode      │   │
                    │  │ quantity     │     │ name         │   │
                    │  │ unit_price   │     │ description  │   │
                    │  │ discount_pct │     │ base_price   │   │
                    │  │ line_total   │     │ tax_rate     │   │
                    │  │ notes        │     │ stock_qty    │   │
                    │  └──────────────┘     │ image_url    │   │
                    │                       │ category     │   │
                    │                       │ attributes{} │   │
                    │                       │ is_active    │   │
                    │                       └──────┬───────┘   │
                    │                              │           │
                    │                       ┌──────┴───────┐   │
                    │                       │product_variants│  │
                    │                       ├──────────────┤   │
                    │                       │ id (PK)      │   │
                    │                       │ product_id   │───┘
                    │                       │ sku          │
                    │                       │ barcode      │
                    │                       │ name (e.g. "L / Red") │
                    │                       │ price_override│
                    │                       │ stock_qty    │
                    │                       │ attributes{} │
                    │                       └──────────────┘
                    │
                    │  ┌──────────────┐     ┌──────────────┐
                    │  │ price_lists  │     │ price_rules  │
                    │  ├──────────────┤     ├──────────────┤
                    └──│ tenant_id(FK)│     │ id (PK)      │
                       │ id (PK)      │────►│ price_list_id│
                       │ name         │     │ product_id   │
                       │ currency     │     │ min_quantity  │
                       │ is_default   │     │ price        │
                       └──────────────┘     │ discount_pct │
                                            └──────────────┘
```

### Drizzle Schema (Key Tables)

```typescript
// packages/db/src/schema/tenants.ts
import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['starter', 'professional', 'business', 'event_pass']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: planEnum('plan').notNull().default('starter'),
  settings: jsonb('settings').default({}),        // tenant-level config
  default_currency: text('default_currency').default('EUR'),
  default_tax_rate: integer('default_tax_rate').default(2100), // basis points (21% = 2100)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Integration credentials live in their own table — not on tenants.
// This scales to any number of integrations without schema changes.
export const integrationTypeEnum = pgEnum('integration_type', [
  'woocommerce', 'exact_online', 'mollie', 'stripe', 'shopify',
]);

export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  type: integrationTypeEnum('type').notNull(),
  is_active: boolean('is_active').default(true),
  credentials: jsonb('credentials').notNull(),    // encrypted at rest, type-specific
  settings: jsonb('settings').default({}),        // sync settings, mappings
  last_sync_at: timestamp('last_sync_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// External ID mappings — connects local records to external system IDs
export const integration_mappings = pgTable('integration_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  integration_id: uuid('integration_id').notNull().references(() => integrations.id),
  local_table: text('local_table').notNull(),     // 'products', 'orders', 'customers'
  local_id: uuid('local_id').notNull(),
  external_id: text('external_id').notNull(),      // WC product ID, Exact item ID, etc.
  external_data: jsonb('external_data').default({}), // cache of external state
  synced_at: timestamp('synced_at').defaultNow().notNull(),
});

// packages/db/src/schema/products.ts
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  sku: text('sku').notNull(),
  barcode: text('barcode'),                       // EAN-13, UPC, etc.
  name: text('name').notNull(),
  description: text('description'),
  base_price: integer('base_price').notNull(),    // cents
  tax_rate: integer('tax_rate').default(2100),     // basis points (21.00% = 2100)
  stock_qty: integer('stock_qty').default(0),
  image_url: text('image_url'),
  category: text('category'),
  attributes: jsonb('attributes').default({}),    // flexible: color, size, weight, etc.
  is_active: boolean('is_active').default(true),
  is_deleted: boolean('is_deleted').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
// External IDs (woo_product_id, exact_item_id) now live in integration_mappings table

// packages/db/src/schema/orders.ts
export const orderStatusEnum = pgEnum('order_status', [
  'draft',           // Being composed on device
  'pending',         // Submitted, awaiting sync
  'confirmed',       // Synced to server, confirmed
  'processing',      // Being processed (sent to ERP)
  'shipped',         // Shipped via 3PL
  'completed',       // Delivered
  'cancelled',       // Cancelled
]);

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey(),                    // Generated on device (offline!)
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  order_number: text('order_number'),             // Human-readable, assigned by server
  customer_id: uuid('customer_id').references(() => customers.id),
  event_id: uuid('event_id').references(() => events.id),
  user_id: uuid('user_id').references(() => users.id),
  status: orderStatusEnum('status').notNull().default('draft'),
  subtotal: integer('subtotal').notNull().default(0),  // cents
  discount_amount: integer('discount_amount').default(0),
  tax_amount: integer('tax_amount').default(0),
  total: integer('total').notNull().default(0),
  currency: text('currency').default('EUR'),
  notes: text('notes'),
  device_id: text('device_id'),                   // Which device created this order
  payment_method: text('payment_method'),          // 'invoice', 'cash', 'card', 'ideal'
  payment_terms: text('payment_terms'),            // 'net_30', 'net_60', 'immediate'
  session_id: uuid('session_id').references(() => pos_sessions.id), // POS shift/session
  created_offline: boolean('created_offline').default(false),
  synced_at: timestamp('synced_at'),              // When order synced to server
  is_deleted: boolean('is_deleted').default(false),
  // External IDs (woo_order_id, exact_order_id) now live in integration_mappings table
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
```

### POS-Specific Tables (Drizzle Schema)

```typescript
// packages/db/src/schema/pos-sessions.ts
// Shift/session management — a POS fundamental

export const sessionStatusEnum = pgEnum('session_status', [
  'open',       // Currently active
  'closing',    // Being reconciled
  'closed',     // Reconciled and closed
]);

export const pos_sessions = pgTable('pos_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  user_id: uuid('user_id').notNull().references(() => users.id),
  event_id: uuid('event_id').references(() => events.id),
  device_id: text('device_id').notNull(),
  status: sessionStatusEnum('status').notNull().default('open'),
  opened_at: timestamp('opened_at').defaultNow().notNull(),
  closed_at: timestamp('closed_at'),
  opening_cash: integer('opening_cash').default(0),       // cents — cash float
  closing_cash: integer('closing_cash'),                   // cents — counted at close
  expected_cash: integer('expected_cash'),                  // cents — calculated
  cash_difference: integer('cash_difference'),             // cents — over/short
  total_orders: integer('total_orders').default(0),
  total_revenue: integer('total_revenue').default(0),      // cents
  notes: text('notes'),
});

// packages/db/src/schema/cash-movements.ts
// Track all cash in/out during a session (not just order payments)

export const cashMovementTypeEnum = pgEnum('cash_movement_type', [
  'sale',           // Cash received from order
  'refund',         // Cash returned for refund
  'cash_in',        // Manual cash added (e.g., change float)
  'cash_out',       // Manual cash removed (e.g., safe drop)
]);

export const cash_movements = pgTable('cash_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').notNull().references(() => pos_sessions.id),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  type: cashMovementTypeEnum('type').notNull(),
  amount: integer('amount').notNull(),              // cents (positive = in, negative = out)
  order_id: uuid('order_id').references(() => orders.id),
  reason: text('reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// packages/db/src/schema/tax-rates.ts
// Proper VAT handling for EU B2B (including reverse charge)

export const tax_rates = pgTable('tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),                     // "BTW 21%", "BTW 9%", "Reverse Charge"
  rate: integer('rate').notNull(),                   // basis points: 2100 = 21.00%
  is_default: boolean('is_default').default(false),
  applies_to: text('applies_to').default('all'),    // 'all', 'domestic', 'eu', 'non_eu'
  is_reverse_charge: boolean('is_reverse_charge').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
```

### Updated ERD (POS additions)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ pos_sessions │     │ cash_movements│     │  tax_rates   │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)      │◄───┐│ id (PK)      │     │ id (PK)      │
│ tenant_id    │    ││ session_id   │     │ tenant_id    │
│ user_id      │    ││ type         │     │ name         │
│ event_id     │    ││ amount       │     │ rate         │
│ device_id    │    ││ order_id     │     │ is_default   │
│ status       │    ││ reason       │     │ is_reverse_  │
│ opening_cash │    │└──────────────┘     │   charge     │
│ closing_cash │    │                     └──────────────┘
│ expected_cash│    │
│ total_orders │    │  ┌──────────────┐   ┌──────────────────┐
│ total_revenue│    │  │ integrations │   │integration_      │
└──────────────┘    │  ├──────────────┤   │  mappings         │
                    │  │ id (PK)      │◄──┤──────────────────┤
         ┌──────────┘  │ tenant_id    │   │ id (PK)          │
         │             │ type         │   │ integration_id   │
    orders.session_id  │ credentials{}│   │ local_table      │
                       │ settings{}   │   │ local_id         │
                       └──────────────┘   │ external_id      │
                                          └──────────────────┘
```

### Row-Level Security Policies

```sql
-- Every query is automatically scoped to the tenant
-- User's tenant_id is extracted from their JWT

-- Tenants: users can only see their own tenant
CREATE POLICY "tenant_isolation" ON tenants
  USING (id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Products: users see products from their tenant
CREATE POLICY "products_tenant" ON products
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Orders: users see orders from their tenant
CREATE POLICY "orders_tenant" ON orders
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Sales reps: can only see/create orders assigned to them
CREATE POLICY "orders_rep" ON orders
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- Customers: tenant-scoped
CREATE POLICY "customers_tenant" ON customers
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);
```

---

## 6. POS Features

### Core POS Capabilities

These features distinguish ScanOrder as a real POS app, not just an order form:

#### 6.1 Shift/Session Management

Every POS session has a lifecycle:

```
OPEN SESSION → SELL → CLOSE SESSION → RECONCILE
     │                      │              │
     ├─ Set cash float      ├─ Count cash  ├─ Compare expected vs. actual
     ├─ Select event        ├─ Print Z-report ├─ Flag discrepancies
     └─ Confirm device      └─ Submit      └─ Lock session
```

- **Open shift**: Sales rep opens a session, enters starting cash float, selects event
- **During shift**: All orders tied to the session. Cash movements tracked.
- **Close shift**: Count physical cash, app calculates expected cash, shows difference
- **Z-report**: End-of-day summary (total orders, revenue by payment method, cash over/short)

#### 6.2 Cash Management

```
┌─────────────────────────────────────┐
│  CASH DRAWER                         │
│                                     │
│  Opening float:      €150.00        │
│  + Cash sales:       +€345.00       │
│  - Cash refunds:     -€24.50        │
│  + Manual cash in:   +€0.00         │
│  - Safe drops:       -€200.00       │
│  ────────────────────────────       │
│  Expected in drawer: €270.50        │
│  Counted:            €268.00        │
│  Difference:         -€2.50         │
│                                     │
│  [ACCEPT & CLOSE SHIFT]             │
└─────────────────────────────────────┘
```

#### 6.3 Quick Sale (Walk-in Customer)

Not every transaction needs a registered customer:
- **"Quick Sale" button** starts an order without customer selection
- Order gets tagged as `customer_id: null` with optional walk-in name
- Later, admin can assign a customer to the order from the web dashboard

#### 6.4 Returns & Refunds

```
FIND ORIGINAL ORDER → SELECT ITEMS TO RETURN → PROCESS REFUND
                          │                        │
                          ├─ Full/partial return    ├─ Cash back
                          ├─ Reason code            ├─ Credit note
                          └─ Stock adjustment       └─ Reverse to payment method
```

- Returns create a negative order linked to the original via `refund_of_order_id`
- Stock auto-adjusted on return confirmation
- Cash movements tracked for cash refunds

#### 6.5 EU VAT Handling (B2B Critical)

| Scenario | VAT Treatment | Example |
|----------|--------------|---------|
| **Domestic B2C** | Standard rate (21% NL) | Selling to Dutch consumer at Maison&Objet |
| **Domestic B2B** | Standard rate | Selling to De Bijenkorf (Dutch company) |
| **EU B2B (valid VAT ID)** | Reverse charge (0%) | Selling to German retailer with DE VAT number |
| **EU B2C** | Destination country rate | Selling to French consumer → 20% FR VAT |
| **Non-EU** | Zero-rated export | Selling to US retailer |

The app validates EU VAT numbers via the VIES API (EU Commission service) and automatically applies the correct tax treatment. This is stored per-customer in `tax_treatment` and per-order-line in `tax_rate_id`.

#### 6.6 Receipt Generation

- **Digital receipt**: Email to customer (PDF or link)
- **Thermal printer**: Bluetooth receipt printer support (Star Micronics, Epson TM series via Expo Print)
- **Receipt includes**: Order number, items, tax breakdown, payment method, event name, company details

### PoC vs Full POS Feature Matrix

| Feature | PoC | MVP | v1.0 |
|---------|:---:|:---:|:----:|
| Barcode scanning | Yes | Yes | Yes |
| Cart & checkout | Yes | Yes | Yes |
| Customer selection | Yes | Yes | Yes |
| Quick sale (no customer) | Yes | Yes | Yes |
| Offline ordering | Yes | Yes | Yes |
| Order sync | Yes | Yes | Yes |
| Web dashboard (orders) | Yes | Yes | Yes |
| Shift/session management | — | Yes | Yes |
| Cash management | — | Yes | Yes |
| Returns/refunds | — | Yes | Yes |
| EU VAT handling | — | Yes | Yes |
| Receipt printing | — | Yes | Yes |
| Price lists / volume discounts | — | — | Yes |
| WooCommerce integration | — | Yes | Yes |
| Exact Online integration | — | — | Yes |
| Payment processing (Mollie) | — | — | Yes |
| Analytics/reporting | — | Basic | Full |
| Multi-tenant billing | — | — | Yes |
| Android support | — | Yes | Yes |

---

## 7. API Design

### API Architecture

Three API surfaces serve different clients:

| Surface | Technology | Purpose | Auth |
|---------|-----------|---------|------|
| **Supabase Auto-API** | PostgREST | Direct DB access from web dashboard | Supabase JWT + RLS |
| **Cloudflare Workers** | Hono | Webhooks, integrations, PDF, images | JWT + API key |
| **PowerSync** | PowerSync Service | Offline sync (mobile) | Supabase JWT |

### Key API Endpoints (Cloudflare Workers)

```
# Integration Sync
POST   /api/integrations/woocommerce/sync       # Trigger full WooCommerce sync
POST   /api/integrations/exact-online/sync       # Trigger Exact Online sync
GET    /api/integrations/status                   # Check sync status

# Webhooks (inbound from external services)
POST   /api/webhooks/woocommerce                 # WooCommerce product/order updates
POST   /api/webhooks/exact-online                # Exact Online callbacks
POST   /api/webhooks/mollie                      # Payment status updates

# PDF Generation
POST   /api/pdf/order/:id                        # Generate order confirmation PDF
GET    /api/pdf/order/:id/download               # Download generated PDF

# Image Management
POST   /api/images/upload                        # Upload product image to R2
DELETE /api/images/:key                           # Delete image from R2

# PowerSync Upload Handler (receives offline order uploads)
POST   /api/sync/upload                          # PowerSync upload endpoint
```

### PowerSync Sync Streams Configuration

```yaml
# PowerSync Sync Streams — defines what data syncs to which devices

# Products: all active products for this tenant sync to all devices
- name: products
  query: |
    SELECT id, sku, barcode, name, description, base_price, tax_rate,
           stock_qty, image_url, category, attributes, is_active
    FROM products
    WHERE tenant_id = {{ user.tenant_id }}
      AND is_deleted = false
  user_filter: "tenant_id"

# Product variants
- name: product_variants
  query: |
    SELECT pv.id, pv.product_id, pv.sku, pv.barcode, pv.name,
           pv.price_override, pv.stock_qty, pv.attributes
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE p.tenant_id = {{ user.tenant_id }}
      AND pv.is_deleted = false

# Customers: all customers for this tenant
- name: customers
  query: |
    SELECT id, company_name, contact_name, email, phone,
           vat_number, price_group, address, notes
    FROM customers
    WHERE tenant_id = {{ user.tenant_id }}
      AND is_deleted = false

# Price lists and rules
- name: price_lists
  query: |
    SELECT id, name, currency, is_default
    FROM price_lists
    WHERE tenant_id = {{ user.tenant_id }}

- name: price_rules
  query: |
    SELECT pr.id, pr.price_list_id, pr.product_id,
           pr.min_quantity, pr.price, pr.discount_pct
    FROM price_rules pr
    JOIN price_lists pl ON pl.id = pr.price_list_id
    WHERE pl.tenant_id = {{ user.tenant_id }}

# Events: active and upcoming trade shows
- name: events
  query: |
    SELECT id, name, location, start_date, end_date, status
    FROM events
    WHERE tenant_id = {{ user.tenant_id }}
      AND status IN ('upcoming', 'active')

# Orders: sync back to device for order history
- name: orders
  query: |
    SELECT id, order_number, customer_id, event_id, user_id,
           status, subtotal, discount_amount, tax_amount, total,
           currency, notes, created_at
    FROM orders
    WHERE tenant_id = {{ user.tenant_id }}
      AND is_deleted = false
```

---

## 8. Offline-First Sync Architecture

### Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEVICE (React Native)                       │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │   UI Layer   │────►│  Local DB   │────►│Upload Queue │      │
│  │             │◄────│  (SQLite)   │     │ (PowerSync) │      │
│  └─────────────┘     └──────┬──────┘     └──────┬──────┘      │
│                             │                    │              │
│                     ┌───────┴────────┐    ┌──────┴──────┐      │
│                     │ PowerSync SDK  │    │ Upload      │      │
│                     │ (sync down)    │    │ Handler     │      │
│                     └───────┬────────┘    └──────┬──────┘      │
│                             │                    │              │
└─────────────────────────────┼────────────────────┼──────────────┘
                              │ WebSocket          │ HTTPS POST
                              ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POWERSYNC SERVICE                              │
│                                                                 │
│  WAL Reader ──► Sync Streams ──► Client SDKs                   │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Reads WAL
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                          │
│                                                                 │
│  Upload Handler (Edge Function or Worker):                      │
│    1. Validate order data (Zod)                                 │
│    2. Check for duplicates (idempotency key = order.id)         │
│    3. Assign order_number (sequence)                            │
│    4. Insert into orders + order_lines                          │
│    5. Update stock quantities                                   │
│    6. Queue integration sync (WooCommerce, Exact Online)        │
│    7. Return success → PowerSync marks upload complete           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Offline Data Budget

| Data Type | Est. Records | Size per Record | Total | Sync Direction |
|-----------|:------------:|:---------------:|:-----:|:--------------:|
| Products | 5,000-50,000 | ~1 KB | 5-50 MB | Down |
| Product variants | 10,000-100,000 | ~500 B | 5-50 MB | Down |
| Customers | 1,000-10,000 | ~500 B | 0.5-5 MB | Down |
| Price lists | 5-20 | ~200 B | <1 KB | Down |
| Price rules | 5,000-50,000 | ~100 B | 0.5-5 MB | Down |
| Events | 5-20 | ~300 B | <10 KB | Down |
| Orders (pending) | 0-500 | ~2 KB | 0-1 MB | **Up** |
| Order lines (pending) | 0-5,000 | ~200 B | 0-1 MB | **Up** |
| **Total local DB** | | | **~11-112 MB** | |

Well within mobile device capabilities. Initial sync takes 10-30 seconds on 4G; subsequent delta syncs are near-instant.

### Conflict Resolution Strategy

| Data Type | Strategy | Rationale |
|-----------|----------|-----------|
| **Products** | Server-authoritative (LWW) | Product data comes from WooCommerce/admin. Device never edits products. |
| **Customers** | Server-authoritative + merge | New customers created on device get merged. Edits to existing customers: server wins. |
| **Orders** | Append-only (no conflicts) | Each order has a unique UUID generated on-device. Orders are immutable once synced. |
| **Stock quantities** | Server-authoritative | Stock counts updated server-side after order confirmation. Device shows "last known" stock. |
| **Price rules** | Server-authoritative | Pricing controlled by admin. Device caches current prices. |

### Pre-Show Sync Checklist (App Feature)

Before a trade show, the app prompts the user to ensure data is current:

```
┌─────────────────────────────────┐
│  PRE-SHOW SYNC CHECK            │
│                                 │
│  ✅ Products synced (4,832)     │
│  ✅ Customers synced (1,203)    │
│  ✅ Price lists synced (3)      │
│  ✅ Event "Maison&Objet" loaded │
│  ⏳ Product images (87%)        │
│                                 │
│  Storage used: 45 MB / 512 MB   │
│                                 │
│  Last sync: 2 minutes ago       │
│                                 │
│  [SYNC NOW]    [START SHOW →]   │
└─────────────────────────────────┘
```

---

## 9. Mobile App — Screens & Flows

### Screen Map

```
Login
  │
  ▼
Tab Navigator
  ├── Scan (primary tab, default)
  │     └── Active scanner + cart
  ├── Orders
  │     ├── Order list (filterable by event, status)
  │     └── Order detail
  ├── Customers
  │     ├── Customer list
  │     ├── Customer detail
  │     └── New customer form
  ├── Catalog
  │     ├── Product grid/list
  │     └── Product detail
  └── Settings
        ├── Sync status
        ├── Scanner preferences
        ├── Current event selection
        └── Account / logout
```

### Primary Flow: Scan → Order → Submit

```
1. SELECT CUSTOMER (or skip)
   ↓
2. SCAN PRODUCTS (camera active)
   → Each scan adds to cart
   → Haptic feedback on scan
   → Product thumbnail + name + price flashes
   → Quantity auto-increments if same product scanned again
   ↓
3. REVIEW CART
   → Adjust quantities
   → Apply line discounts
   → Add notes per line
   → See subtotal, tax, total
   ↓
4. ORDER DETAILS
   → Select/create customer (if not done in step 1)
   → Select event/trade show
   → Add order notes
   → Choose payment terms (net 30, net 60, etc.)
   ↓
5. CONFIRM & SUBMIT
   → Order saved to local DB
   → Added to sync queue
   → Order confirmation shown
   → Option: generate PDF / email to customer
   → Ready for next order
```

---

## 10. Web Admin Dashboard

### Dashboard Pages

| Page | Purpose | Key Features |
|------|---------|-------------|
| **Home** | KPI overview | Orders today, revenue this show, sync status, top products |
| **Orders** | Order management | Filter by event/status/customer. View, edit, cancel. Export CSV. |
| **Products** | Product catalog | CRUD, bulk import (CSV), image upload, variant management |
| **Customers** | Customer management | CRUD, customer groups, price lists assignment |
| **Events** | Trade show management | Create events, assign teams, view per-event analytics |
| **Integrations** | Connect external systems | WooCommerce setup, Exact Online OAuth, sync controls |
| **Analytics** | Sales reporting | Revenue by event, product performance, sales rep performance |
| **Settings** | Account management | Team members, roles, billing, API keys |

---

## 11. Barcode Scanning

### Implementation

```typescript
// apps/mobile/components/scanner/BarcodeScanner.tsx
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function BarcodeScanner({ onScan }: { onScan: (barcode: string) => void }) {
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: [
      'ean-13',    // European Article Number (most common for products)
      'ean-8',     // Short EAN
      'upc-a',     // Universal Product Code
      'upc-e',     // Compressed UPC
      'code-128',  // Logistics / shipping
      'code-39',   // Industrial
      'qr',        // QR codes (customer cards, etc.)
    ],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const barcode = codes[0].value;
        if (barcode) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onScan(barcode);
        }
      }
    },
  });

  if (!device) return <NoCameraView />;

  return (
    <Camera
      device={device}
      isActive={true}
      codeScanner={codeScanner}
      style={{ flex: 1 }}
    />
  );
}
```

### Bluetooth Hardware Scanner Support

Bluetooth HID barcode scanners emulate keyboard input — they send characters rapidly, terminated by Enter/newline. The approach: a **hidden TextInput** that captures this input without showing a keyboard.

```typescript
// apps/mobile/hooks/useHardwareScanner.ts
import { useRef, useCallback } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HardwareScannerProps {
  onScan: (barcode: string) => void;
  minLength?: number;  // minimum barcode length to accept
}

// Hidden TextInput component — mount this in your scan screen
export function HardwareScannerInput({ onScan, minLength = 8 }: HardwareScannerProps) {
  const inputRef = useRef<TextInput>(null);
  const lastScanTime = useRef(0);

  const handleSubmit = useCallback(({ nativeEvent: { text } }: { nativeEvent: { text: string } }) => {
    const trimmed = text.trim();
    const now = Date.now();

    // Debounce: ignore if same scan within 500ms
    if (trimmed.length >= minLength && now - lastScanTime.current > 500) {
      lastScanTime.current = now;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(trimmed);
    }

    // Clear input for next scan
    inputRef.current?.clear();
  }, [onScan, minLength]);

  return (
    <TextInput
      ref={inputRef}
      style={styles.hiddenInput}
      autoFocus
      showSoftInputOnFocus={false}  // Don't show on-screen keyboard
      onSubmitEditing={handleSubmit}
      blurOnSubmit={false}           // Keep focus for continuous scanning
      caretHidden
    />
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
```

---

## 12. Payment Processing

### Mollie Connect Architecture (Primary — EU/NL)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  ScanOrder   │     │    Mollie    │     │   Merchant   │
│  (Platform)  │────►│   Connect   │────►│  (Customer)  │
│              │     │             │     │              │
│  Platform fee│     │  Payment    │     │  Receives    │
│  deducted    │     │  processing │     │  net amount  │
└──────────────┘     └──────────────┘     └──────────────┘

Flow:
1. Merchant connects via Mollie OAuth (during onboarding)
2. ScanOrder creates payments on behalf of merchant
3. Mollie handles KYC, PCI, payment methods
4. ScanOrder takes application fee (e.g., 1.5% per transaction)
5. Merchant receives funds minus Mollie fees minus platform fee
```

### Supported Payment Methods (via Mollie)

| Method | Market | In-Person | Online |
|--------|--------|:---------:|:------:|
| **iDEAL** | Netherlands | No | Yes |
| **Bancontact** | Belgium | No | Yes |
| **Credit Card** | International | Via terminal | Yes |
| **SEPA Direct Debit** | EU | No | Yes |
| **Klarna** | EU | No | Yes |
| **Apple Pay** | International | Via NFC | Yes |
| **Bank Transfer** | EU | No | Yes |

### Trade Show Payment Flow

At trade shows, most B2B orders are **not paid immediately**. The typical flow is:

1. Order placed at booth → **no payment collected**
2. Order confirmed post-show → **invoice sent** (PDF or via Exact Online)
3. Customer pays via bank transfer (SEPA) with **net 30/60 terms**
4. Optional: collect deposit at booth via Mollie terminal or iDEAL QR

This means payment processing is secondary to order capture. The MVP can launch without in-app payments and add it as a v1.1 feature.

---

## 13. Integration Architecture

### WooCommerce Integration

```
┌─────────────────┐                    ┌──────────────────┐
│   WooCommerce    │                    │    ScanOrder     │
│   (A-Journal)    │                    │    (Supabase)    │
│                  │                    │                  │
│  Products ──────►│───── webhook ─────►│  Products table  │
│  Inventory ─────►│───── webhook ─────►│  stock_qty       │
│  Customers ─────►│───── REST API ────►│  Customers table │
│                  │                    │                  │
│  Orders ◄────────│◄──── REST API ────│  Orders (synced) │
│  (new WC order)  │                    │                  │
└─────────────────┘                    └──────────────────┘

Sync Logic:
- Products: WooCommerce → ScanOrder (webhook on create/update/delete)
- Inventory: WooCommerce → ScanOrder (webhook on stock change)
- Customers: Bidirectional (new customers from app → WooCommerce)
- Orders: ScanOrder → WooCommerce (push confirmed orders as WC orders)
```

### Exact Online Integration

```
┌─────────────────┐                    ┌──────────────────┐
│  Exact Online    │                    │    ScanOrder     │
│                  │                    │                  │
│  Items ─────────►│───── REST API ────►│  Products table  │
│  Accounts ──────►│───── REST API ────►│  Customers table │
│                  │                    │                  │
│  Sales Orders ◄──│◄──── REST API ────│  Orders (synced) │
│  Invoices ◄──────│◄──── REST API ────│  Confirmed orders│
└─────────────────┘                    └──────────────────┘

Auth: OAuth2 with refresh token rotation
Rate limit: 60 requests/minute (per division)
Sync frequency: On-demand + post-show batch
```

### Integration Adapter Pattern

```typescript
// apps/api/src/lib/integration-adapter.ts

interface IntegrationAdapter {
  // Product sync (inbound)
  pullProducts(since?: Date): Promise<ExternalProduct[]>;
  mapProduct(external: ExternalProduct): Product;

  // Customer sync (bidirectional)
  pullCustomers(since?: Date): Promise<ExternalCustomer[]>;
  pushCustomer(customer: Customer): Promise<string>; // returns external ID

  // Order sync (outbound)
  pushOrder(order: Order): Promise<string>; // returns external order ID
  pushInvoice(order: Order): Promise<string>; // returns external invoice ID

  // Webhook handling
  handleWebhook(payload: unknown): Promise<void>;

  // Health check
  testConnection(): Promise<boolean>;
}

// Implemented per integration:
class WooCommerceAdapter implements IntegrationAdapter { ... }
class ExactOnlineAdapter implements IntegrationAdapter { ... }
// Future: class ShopifyAdapter implements IntegrationAdapter { ... }
```

---

## 14. Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────────────────────┐
│                    AUTH FLOW                               │
│                                                          │
│  Mobile App / Web Dashboard                              │
│       │                                                  │
│       │ 1. Email + Password (or Magic Link)              │
│       ▼                                                  │
│  Supabase Auth (GoTrue)                                  │
│       │                                                  │
│       │ 2. Returns JWT with claims:                      │
│       │    {                                             │
│       │      sub: "user-uuid",                           │
│       │      app_metadata: {                             │
│       │        tenant_id: "tenant-uuid",                 │
│       │        role: "admin" | "manager" | "sales_rep"   │
│       │      }                                           │
│       │    }                                             │
│       ▼                                                  │
│  JWT used for:                                           │
│  - Supabase RLS (auto-scopes all queries to tenant)     │
│  - PowerSync (determines which data syncs to device)     │
│  - Cloudflare Workers (validated in middleware)           │
└──────────────────────────────────────────────────────────┘
```

### Role-Based Access Control

| Permission | Sales Rep | Manager | Admin |
|-----------|:---------:|:-------:|:-----:|
| Create orders | Yes | Yes | Yes |
| View own orders | Yes | Yes | Yes |
| View all orders | No | Yes | Yes |
| Edit/cancel orders | Own only | Yes | Yes |
| Manage products | No | View | Full CRUD |
| Manage customers | Create | Full | Full |
| Manage events | No | View | Full CRUD |
| Manage team | No | No | Yes |
| Manage integrations | No | No | Yes |
| View analytics | Own stats | Full | Full |
| Billing/settings | No | No | Yes |

### Data Security Measures

| Layer | Measure | Implementation |
|-------|---------|---------------|
| **Data at rest (server)** | AES-256 | Supabase default encryption |
| **Data at rest (device)** | SQLCipher | op-sqlite with SQLCipher enabled |
| **Data in transit** | TLS 1.3 | Enforced on all connections |
| **API auth** | JWT (15-min expiry) | Supabase Auth + refresh tokens |
| **API rate limiting** | Per-tenant limits | Cloudflare KV counters |
| **Input validation** | Zod schemas | Shared validation package |
| **SQL injection** | Parameterized queries | Drizzle ORM (no raw SQL) |
| **XSS** | React auto-escaping | Next.js + React Native defaults |
| **CSRF** | SameSite cookies | Supabase Auth defaults |
| **Secrets** | Environment variables | Cloudflare secrets, Supabase vault |
| **Dependencies** | Auto-scanning | Dependabot + `pnpm audit` in CI |
| **GDPR** | Data isolation + deletion | RLS + tenant deletion endpoint |

---

## 15. Scalability Strategy

### Current Limits & Growth Triggers

| Service | Current Tier | Limit | Trigger to Upgrade | Action |
|---------|-------------|-------|-------------------|--------|
| **PowerSync** | Pro ($49/mo) | 1K concurrent connections | ~200 merchants × 3 devices | Self-host PowerSync (open-source, Docker) |
| **Supabase** | Pro ($25/mo) | 50K MAU, 8GB DB, 250GB bandwidth | ~300 merchants | Upgrade to Team ($599/mo) or self-host |
| **Vercel** | Pro ($20/mo) | Per-seat pricing, bandwidth limits | Team growth + traffic | Migrate to Cloudflare Pages via OpenNext |
| **Cloudflare Workers** | Free/Pro | 100K req/day (free), unlimited (paid $5/mo) | Sustained webhook traffic | Already on $5/mo Pro |

### PowerSync Scaling Path

PowerSync is the most likely bottleneck. Scaling plan:

```
0-200 merchants:  PowerSync Cloud Pro ($49/mo, 1K connections)
                      ↓ growing pains
200-1K merchants: Self-host PowerSync (Docker, your own infra)
                  - PowerSync is open-source (self-host option)
                  - Run on Hetzner/Fly.io for €20-50/mo
                  - Full control over connection limits
                      ↓
1K+ merchants:    Multiple PowerSync instances behind load balancer
                  - Shard by tenant_id range
                  - Each instance reads same Postgres WAL
```

### Database Scaling

**Single Supabase instance works longer than you'd think** because:
- RLS handles tenant isolation at the query level
- PowerSync reads WAL (not queries), so sync traffic doesn't hit your connection pool
- Most queries are simple (read products, write orders) — no complex joins

**When to shard:**
- DB size > 50GB (unlikely before 1K+ merchants)
- Connection count > 500 sustained (Workers use Hyperdrive pooling, so this is high)
- Replication lag affects sync latency

**Sharding strategy when needed:**
1. Move to Supabase per-tenant projects (Supabase supports this, complex to manage)
2. OR: Use Citus extension for horizontal sharding on `tenant_id` (Supabase doesn't support this yet)
3. OR: Self-host Postgres on Neon (branching + auto-scaling)

### Vercel → Cloudflare Migration Path

A-Journal already uses Cloudflare. Long-term, hosting the Next.js dashboard on Cloudflare Pages via OpenNext saves money and consolidates infrastructure:

| Phase | Dashboard Hosting | Cost |
|-------|------------------|------|
| PoC/MVP | Vercel Pro | $20/mo |
| Scale (500+ users) | Cloudflare Pages (OpenNext) | ~$5/mo |

OpenNext compiles Next.js for non-Vercel platforms. The Cloudflare adapter is production-ready as of 2025.

### Database Migration with PowerSync

Schema changes require coordination because PowerSync reads the WAL:

1. **Additive changes** (new columns, tables): No coordination needed. PowerSync ignores unknown columns.
2. **Column renames/deletes**: Update PowerSync sync rules FIRST, then migrate DB.
3. **Type changes**: Deploy new PowerSync sync rules + new client schema version simultaneously.
4. **Rollback**: Always keep one previous sync rule version available.

Rule: **Never deploy a breaking schema change without updating the PowerSync sync rules and client schema in the same release window.**

---

## 16. UI Mock Designs

### 16.1 Mobile — Scan & Order (Tablet, Landscape)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ● ScanOrder          📡 Online  ⚡ Synced       Maison&Objet 2026   ☰    │
├────────────────────────────────────────┬────────────────────────────────────┤
│                                        │                                    │
│         ┌──────────────────────┐       │   CURRENT ORDER          #SO-0047 │
│         │                      │       │                                    │
│         │                      │       │   Customer: De Bijenkorf B.V.      │
│         │     📷 CAMERA        │       │   ─────────────────────────────── │
│         │     VIEWFINDER       │       │                                    │
│         │                      │       │   ┌──────┬──────┬──────┬───────┐  │
│         │    [scan area with   │       │   │ Item │ Qty  │ Price│ Total │  │
│         │     targeting box]   │       │   ├──────┼──────┼──────┼───────┤  │
│         │                      │       │   │ 🖼 A5│      │      │       │  │
│         │                      │       │   │ Dot  │  12  │€8.95 │€107.40│  │
│         │                      │       │   │ Grid │ [-][+]│      │       │  │
│         │                      │       │   ├──────┼──────┼──────┼───────┤  │
│         └──────────────────────┘       │   │ 🖼 B5│      │      │       │  │
│                                        │   │ Week │  6   │€12.50│€75.00 │  │
│  ┌──────────────────────────────────┐  │   │ Plan │ [-][+]│      │       │  │
│  │ 🔍 Search product or scan...    │  │   ├──────┼──────┼──────┼───────┤  │
│  └──────────────────────────────────┘  │   │ 🖼 A4│      │      │       │  │
│                                        │   │ Daily│  24  │€6.50 │€156.00│  │
│  Last scanned:                         │   │ Plan │ [-][+]│      │       │  │
│  ┌──────────────────────────────────┐  │   └──────┴──────┴──────┴───────┘  │
│  │ 🖼  A5 Dotted Notebook - Sage   │  │                                    │
│  │     SKU: AJ-A5-DOT-SAG          │  │   ─────────────────────────────── │
│  │     EAN: 8719326523145          │  │   Subtotal:              €338.40  │
│  │     Stock: 142  |  Price: €8.95 │  │   Discount (10%):        -€33.84  │
│  │     ✅ Added to order (qty: 12) │  │   Tax (21% BTW):         €63.96  │
│  └──────────────────────────────────┘  │   ─────────────────────────────── │
│                                        │   TOTAL:                €368.52  │
│  Quick access:                         │                                    │
│  [Bestsellers] [New Arrivals] [Sale]   │   [💬 Add Note] [🏷️ Discount]     │
│                                        │                                    │
│                                        │   ┌────────────────────────────┐  │
│                                        │   │    CONFIRM ORDER    →      │  │
│                                        │   └────────────────────────────┘  │
├────────────────────────────────────────┴────────────────────────────────────┤
│  [📷 Scan]          [📋 Orders]     [👥 Customers]    [📦 Catalog]   [⚙️]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Mobile — Scan & Order (Phone, Portrait)

```
┌───────────────────────────┐
│ ● ScanOrder    📡 ⚡  ☰  │
├───────────────────────────┤
│                           │
│  ┌─────────────────────┐  │
│  │                     │  │
│  │    📷 CAMERA        │  │
│  │    VIEWFINDER       │  │
│  │                     │  │
│  │  [targeting box]    │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🖼 A5 Dotted - Sage │  │
│  │ €8.95  Stock: 142   │  │
│  │ ✅ Added (qty: 12)  │  │
│  └─────────────────────┘  │
│                           │
│  🔍 Search product...     │
│                           │
├───────────────────────────┤
│  ┌─────────────────────┐  │
│  │  🛒 Cart (3 items)  │  │
│  │  Total: €368.52     │  │
│  │  Customer: Bijenkorf│  │
│  │                     │  │
│  │  [VIEW CART →]      │  │
│  └─────────────────────┘  │
├───────────────────────────┤
│ 📷  📋  👥  📦  ⚙️       │
└───────────────────────────┘
```

### 16.3 Mobile — Customer Selection

```
┌───────────────────────────────────────────────┐
│  Select Customer                         [✕]  │
├───────────────────────────────────────────────┤
│  🔍 Search company or contact name...         │
├───────────────────────────────────────────────┤
│                                               │
│  RECENT                                       │
│  ┌───────────────────────────────────────┐    │
│  │ 🏢 De Bijenkorf B.V.                 │    │
│  │    Anna van der Berg · Net 30         │    │
│  │    Group A pricing                    │    │
│  ├───────────────────────────────────────┤    │
│  │ 🏢 Dille & Kamille                   │    │
│  │    Mark Jansen · Net 60              │    │
│  │    Group B pricing                    │    │
│  ├───────────────────────────────────────┤    │
│  │ 🏢 HEMA Inkoop                       │    │
│  │    Lisa de Groot · Net 30            │    │
│  │    Group A pricing                    │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ALL CUSTOMERS (1,203)                        │
│  ┌───────────────────────────────────────┐    │
│  │ A                                     │    │
│  │ 🏢 Aardewerk & Co                    │    │
│  │ 🏢 Aldi Inkoop                       │    │
│  │ B                                     │    │
│  │ 🏢 Blokker B.V.                      │    │
│  │ ...                                   │    │
│  └───────────────────────────────────────┘    │
│                                               │
│  ┌───────────────────────────────────────┐    │
│  │  ➕ NEW CUSTOMER                      │    │
│  └───────────────────────────────────────┘    │
└───────────────────────────────────────────────┘
```

### 16.4 Mobile — Order Confirmation

```
┌───────────────────────────────────────────────┐
│                                               │
│              ✅                                │
│                                               │
│        ORDER CONFIRMED                        │
│                                               │
│        Order #SO-0047                         │
│        De Bijenkorf B.V.                      │
│        Maison&Objet 2026                      │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  3 products · 42 items                        │
│  Total: €368.52 incl. BTW                     │
│                                               │
│  Status: 📤 Queued for sync                   │
│          (will sync when online)              │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │  📧 EMAIL CONFIRMATION TO CUSTOMER      │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  📄 GENERATE PDF                        │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  📋 VIEW ORDER DETAILS                  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │       START NEW ORDER  →                │  │
│  └─────────────────────────────────────────┘  │
│                                               │
└───────────────────────────────────────────────┘
```

### 16.5 Mobile — Sync Status Screen

```
┌───────────────────────────────────────────────┐
│  ← Sync Status                                │
├───────────────────────────────────────────────┤
│                                               │
│  CONNECTION: 📡 Online (WiFi)                 │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  DOWNLOAD (Server → Device)                   │
│                                               │
│  Products       ✅ 4,832 synced               │
│                    Last: 2 min ago             │
│  Customers      ✅ 1,203 synced               │
│                    Last: 2 min ago             │
│  Price lists    ✅ 3 synced                   │
│                    Last: 5 min ago             │
│  Events         ✅ 2 synced                   │
│                    Last: 5 min ago             │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  UPLOAD (Device → Server)                     │
│                                               │
│  Pending orders    0 in queue                 │
│  Failed uploads    0                          │
│                                               │
│  ─────────────────────────────────────────── │
│                                               │
│  STORAGE                                      │
│                                               │
│  Local database    47.2 MB                    │
│  Product images    128.4 MB (cached)          │
│  Total             175.6 MB                   │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │          FORCE FULL SYNC                │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │     CLEAR IMAGE CACHE (128 MB)          │  │
│  └─────────────────────────────────────────┘  │
│                                               │
└───────────────────────────────────────────────┘
```

### 16.6 Web Dashboard — Home

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ● ScanOrder                                    Anna van der Berg  [⚙️]  │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                               │
│  📊 Home │  DASHBOARD                    Active event: Maison&Objet '26  │
│          │                                                               │
│  📋 Orders│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│          │  │ ORDERS     │ │ REVENUE    │ │ CUSTOMERS  │ │ PENDING  │  │
│  📦 Products│ │ TODAY      │ │ THIS SHOW  │ │ THIS SHOW  │ │ SYNC     │  │
│          │  │            │ │            │ │            │ │          │  │
│  👥 Cust.│  │    47      │ │  €14,832   │ │    31      │ │   0 ✅   │  │
│          │  │  ↑12 vs yst│ │  ↑23% vs ys│ │  8 new     │ │ all good │  │
│  📅 Events│ └────────────┘ └────────────┘ └────────────┘ └──────────┘  │
│          │                                                               │
│  🔗 Integ│  RECENT ORDERS                                    [View all →]│
│          │  ┌──────────────────────────────────────────────────────────┐ │
│  📈 Stats│  │ #  │ Customer         │ Items │ Total    │ Status      │ │
│          │  ├────┼──────────────────┼───────┼──────────┼─────────────┤ │
│  ⚙️ Sett.│  │ 47 │ Dille & Kamille  │ 156   │ €2,340.00│ ● Confirmed │ │
│          │  │ 46 │ HEMA Inkoop      │ 89    │ €1,245.50│ ● Processing│ │
│          │  │ 45 │ De Bijenkorf     │ 42    │ €368.52  │ ● Confirmed │ │
│          │  │ 44 │ Bol.com Partners │ 234   │ €3,890.00│ ● Processing│ │
│          │  │ 43 │ Bruna Wholesale  │ 67    │ €891.30  │ ● Shipped   │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│          │  TOP PRODUCTS THIS SHOW              SALES BY REP            │
│          │  ┌─────────────────────────┐  ┌─────────────────────────┐    │
│          │  │ 1. A5 Dotted Sage  284  │  │ Anna    ████████  €8.2K │    │
│          │  │ 2. B5 Weekly Plan  231  │  │ Max     █████     €5.1K │    │
│          │  │ 3. A4 Daily Plan   198  │  │ Sophie  ███       €1.5K │    │
│          │  │ 4. A6 Pocket Note  176  │  │                         │    │
│          │  │ 5. Desk Planner    142  │  │                         │    │
│          │  └─────────────────────────┘  └─────────────────────────┘    │
│          │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### 16.7 Web Dashboard — Integration Setup (WooCommerce)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ● ScanOrder                                    Anna van der Berg  [⚙️]  │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                               │
│  ...     │  INTEGRATIONS → WooCommerce                                   │
│          │                                                               │
│  🔗 Integ│  ┌──────────────────────────────────────────────────────────┐ │
│   ► WooC │  │  Status: ● Connected                 [Disconnect]       │ │
│     Exact│  │  Store: https://a-journal.nl                            │ │
│     Mollie│ │  Last sync: 3 minutes ago                               │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│          │  CONNECTION                                                   │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │  Store URL:     [https://a-journal.nl            ]      │ │
│          │  │  Consumer Key:  [ck_••••••••••••••••••            ]     │ │
│          │  │  Consumer Secret:[cs_••••••••••••••••••           ]     │ │
│          │  │                                                         │ │
│          │  │  [Test Connection]    [Save]                            │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│          │  SYNC SETTINGS                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │  Products:  [✓] Sync from WooCommerce → ScanOrder      │ │
│          │  │             Categories: [All ▼]                         │ │
│          │  │                                                         │ │
│          │  │  Orders:    [✓] Push confirmed orders → WooCommerce    │ │
│          │  │             Status mapping:                             │ │
│          │  │             Confirmed → wc-processing                   │ │
│          │  │             Shipped → wc-completed                      │ │
│          │  │                                                         │ │
│          │  │  Inventory: [✓] Sync stock levels (WooCommerce → here) │ │
│          │  │                                                         │ │
│          │  │  Customers: [✓] Bidirectional sync                     │ │
│          │  │                                                         │ │
│          │  │  Auto-sync: [Every 15 minutes ▼]                       │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│          │  SYNC HISTORY                                                 │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │  14:32  Products synced (4,832)               ✅        │ │
│          │  │  14:32  Inventory synced (4,832)              ✅        │ │
│          │  │  14:30  Order #SO-0045 pushed                 ✅        │ │
│          │  │  14:15  Webhook: product updated (SKU: AJ-B5) ✅        │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                               │
│          │  [SYNC NOW]    [VIEW FULL LOG]                                │
│          │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

---

## 17. POS Reference Analysis

### Lessons from Existing POS Systems

| POS System | Key Lesson for ScanOrder |
|-----------|--------------------------|
| **Shopify POS** | React Native works at scale for POS with offline. Smart Grid tiles for quick access. Split-pane layout is the gold standard on tablets. |
| **Square POS** | Clean, minimal interface with large touch targets. Cart always visible. Single-tap item addition. |
| **Toast POS** | Color-coding for categories and status. Large tile grid for menu items. Modifier selection as modal overlays. |
| **FooSales** | Direct WooCommerce integration via REST API (no middleware). Pragmatic offline: queue transactions, sync on reconnect, XML fallback. |
| **Lightspeed/Vend** | Web-based POS works on tablets but limits offline. Segmented views (Sales/Inventory/Reports) is a solid navigation pattern. |
| **Pepperi** | Dedicated trade show module proves the use case. Offline-first is praised by users. Tablet-first design — phone is secondary. |

### Design Principles Borrowed

1. **From Square:** Minimal clicks per transaction. Cart always visible on tablet.
2. **From Shopify:** Smart Grid customizable tiles. Background sync with native modules.
3. **From Toast:** Color-coding categories. Large touch targets for booth environments.
4. **From Pepperi:** Pre-show sync checklist. Event-based order grouping.
5. **From FooSales:** Direct WooCommerce REST API integration without middleware.

---

## 18. CI/CD & Deployment

### Pipeline Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  GitHub   │────►│  GitHub  │────►│  Deploy  │────►│  Health  │
│  Push     │     │  Actions │     │          │     │  Check   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │
               ┌──────┼──────┐
               ▼      ▼      ▼
          ┌────────┐┌────────┐┌────────┐
          │ Lint & ││ Type   ││  Test  │
          │ Format ││ Check  ││        │
          └────────┘└────────┘└────────┘
               │      │      │
               ▼      ▼      ▼
          ┌────────┐┌────────┐┌────────┐
          │ Deploy ││ Deploy ││  EAS   │
          │  API   ││  Web   ││ Build  │
          │(Worker)││(Vercel)││(Mobile)│
          └────────┘└────────┘└────────┘
```

### Deployment Targets

| App | Platform | Trigger | URL |
|-----|----------|---------|-----|
| **API** | Cloudflare Workers | Push to `main` | `api.scanorder.com` |
| **Web** | Vercel | Push to `main` | `app.scanorder.com` |
| **Mobile (staging)** | EAS Build (internal) | Push to `main` | TestFlight / Internal Track |
| **Mobile (prod)** | EAS Build → App Store / Play Store | Git tag `v*` | App Store / Play Store |

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  deploy-api:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}

  deploy-web:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-typecheck, test]
    # Vercel auto-deploys from GitHub integration
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deployed via Vercel GitHub integration"

  build-mobile:
    if: github.ref == 'refs/heads/main'
    needs: [lint-and-typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --profile preview --non-interactive
```

---

## 19. Cost Breakdown

### Monthly Infrastructure Costs

| Service | Plan | Monthly Cost | Notes |
|---------|------|:------------:|-------|
| **Supabase** | Pro | €25 | PostgreSQL + Auth + Realtime + Storage |
| **PowerSync** | Pro | €49 | Offline sync service (30GB/mo, 1K connections) |
| **Cloudflare Workers** | Free/Pro | €0-5 | API edge layer, R2 storage |
| **Cloudflare R2** | Pay-as-you-go | ~€5 | Product images (no egress fees) |
| **Vercel** | Pro | €20 | Next.js dashboard hosting |
| **Expo EAS** | Free | €0 | Cloud builds (30 builds/mo free) |
| **Sentry** | Free | €0 | Error tracking (5K events/mo free) |
| **GitHub** | Free/Team | €0-4 | Repo, Actions (2K mins/mo free) |
| **Mollie** | Pay-per-tx | Variable | ~1.8% + €0.25 per transaction |
| **Domain** | — | ~€1 | scanorder.com or similar |
| **Total (fixed)** | | **~€100-110/mo** | Before transaction fees |

### Cost at Scale

| Users | Orders/mo | Estimated Monthly Cost |
|:-----:|:---------:|:---------------------:|
| 10 | 200 | ~€110 |
| 50 | 1,000 | ~€150 |
| 200 | 5,000 | ~€300 |
| 500 | 15,000 | ~€600 |

Infrastructure costs remain low because:
- Supabase Pro handles significant load
- PowerSync pricing is connection-based, not query-based
- Cloudflare Workers has generous free tier
- No always-on compute (serverless everywhere)

---

## 20. Development Roadmap

### Phase 0: PoC — Prove the Loop (Weeks 1-3)

**Goal**: Scan → cart → checkout → order appears on web dashboard. iPad only.

| Task | Deliverable | Priority |
|------|------------|:--------:|
| Monorepo setup | Turborepo + pnpm + shared types package | P0 |
| Database schema (core only) | tenants, users, products, customers, orders, order_lines | P0 |
| Supabase setup | Project, Auth, RLS policies, seed data | P0 |
| PowerSync setup | Sync streams for products + customers DOWN, orders UP | P0 |
| Expo app shell (iPad) | Tab navigation, auth flow, iPad landscape layout | P0 |
| Barcode scanner | Camera scanning + BT hardware scanner | P0 |
| Cart & checkout | Scan → add to cart → adjust quantities → submit order | P0 |
| Customer selection | Pick existing customer or "quick sale" | P0 |
| Offline ordering | Orders saved to local SQLite, queued for sync | P0 |
| Web dashboard (minimal) | Next.js: login + order list + order detail page | P0 |
| Cloudflare Worker (stub) | Upload handler for PowerSync order uploads | P0 |

**Exit criteria**: Demo to stakeholders — scan real A-Journal products, create an order offline, show it syncing to the web dashboard.

### Phase 1: Alpha — Real POS Features (Weeks 4-8)

| Task | Deliverable | Priority |
|------|------------|:--------:|
| iPhone layout | Stacked layout (camera top, cart bottom sheet) | P1 |
| Product catalog screen | Browse, search, filter by category (offline) | P1 |
| Shift/session management | Open/close shift, cash float, basic reconciliation | P1 |
| Event management | Create events, assign orders to events | P1 |
| Order status flow | draft → pending → confirmed → processing | P1 |
| Web: product management | CRUD products, bulk CSV import, image upload (R2) | P1 |
| Web: customer management | CRUD customers, customer groups | P1 |
| Pre-show sync checklist | Ensure data is fresh before going offline | P1 |
| Basic error handling | Sync failures, network state UI, retry logic | P1 |
| TestFlight distribution | Internal testing via TestFlight | P1 |

### Phase 2: MVP — Integrations & Polish (Weeks 9-14)

| Task | Deliverable | Priority |
|------|------------|:--------:|
| WooCommerce integration | Product pull, order push, webhooks | P2 |
| Android builds | Expo builds for Android tablet + phone | P2 |
| Returns/refunds | Return flow with stock adjustment | P2 |
| Cash management | Full cash tracking, safe drops, Z-report | P2 |
| EU VAT handling | Tax rates, reverse charge, VIES validation | P2 |
| Receipt generation | PDF receipts, email to customer | P2 |
| Web: analytics (basic) | Orders/revenue per event, top products | P2 |
| Web: integration setup UI | WooCommerce connection wizard | P2 |
| CI/CD pipeline | GitHub Actions: lint, typecheck, test, deploy | P2 |
| Sentry monitoring | Error tracking across all apps | P2 |

### Phase 3: v1.0 — Commercial Ready (Weeks 15-20)

| Task | Deliverable | Priority |
|------|------------|:--------:|
| Exact Online integration | OAuth, order push, invoice creation | P3 |
| Mollie Connect | Payment processing, split payments, SaaS fees | P3 |
| Price lists / volume discounts | B2B pricing engine | P3 |
| Multi-tenant billing | Subscription management via Mollie | P3 |
| Onboarding wizard | First-run setup, demo data, guided tour | P3 |
| App Store submission | iOS App Store + Google Play | P3 |
| Performance optimization | Large catalog perf, sync speed, image caching | P3 |
| E2E testing | Detox (mobile) + Playwright (web) | P3 |
| User documentation | Setup guide, API docs, integration guides | P3 |

### Timeline Summary

```
Week  1──3    4──────8    9──────14    15──────20
      PoC      Alpha       MVP          v1.0
      │        │           │            │
      iPad     +iPhone     +Android     +Payments
      Scan     +Sessions   +WooCommerce +Exact Online
      Cart     +Events     +Returns     +Billing
      Orders   +TestFlight +VAT         +App Store
      Web(min) +Products   +Receipts    +Onboarding
```

### Total: ~20 weeks with PoC at week 3

PoC is the most important milestone. If the core loop doesn't feel right, stop and adjust before investing in Phase 1+. Assumes 2 developers, add 2-4 weeks buffer.

---

## Appendix: Key Technical Decisions Log

| # | Decision | Options Considered | Choice | Rationale |
|---|----------|-------------------|--------|-----------|
| 1 | Mobile framework | React Native, Flutter, Native | Expo (React Native) | Shopify POS proves it at scale. TypeScript end-to-end. Largest ecosystem. |
| 2 | Offline sync | PowerSync, WatermelonDB, ElectricSQL, CouchDB | PowerSync | Only production-ready Postgres→SQLite sync. Built-in upload queue. $49/mo. |
| 3 | Backend | Supabase, Neon + custom, Railway + custom | Supabase | Auth + DB + Realtime + RLS in one. Biggest time saver for small team. |
| 4 | API layer | Supabase Edge Functions, Cloudflare Workers, AWS Lambda | Cloudflare Workers | Already in stack. Hono framework. Hyperdrive for Postgres. R2 for images. |
| 5 | Web framework | Next.js, Remix, SvelteKit | Next.js | Largest ecosystem. Most Claude-codeable. Server Components. |
| 6 | Payments | Mollie, Stripe, Adyen | Mollie (primary) + Stripe (secondary) | Dutch HQ, iDEAL native, lower EU fees. Stripe for international later. |
| 7 | Barcode SDK | Vision Camera, Expo Camera, Scandit | react-native-vision-camera | Best maintained, native ML Kit, multi-code, works with Expo. |
| 8 | Database | PostgreSQL, MySQL, MongoDB | PostgreSQL (Supabase) | RLS for multi-tenancy, JSONB flexibility, PowerSync compatibility. |
| 9 | ORM | Drizzle, Prisma, TypeORM | Drizzle | Lightweight, TypeScript-first, no binary engine, works with Supabase. |
| 10 | Monorepo | Turborepo, Nx, pnpm workspaces | Turborepo + pnpm | Smart caching, Expo auto-detection, simplest config. |

---

*This blueprint is a living document. Update it as technical decisions evolve during development. The PoC (Phase 0) is deliberately minimal — resist the urge to expand its scope.*
