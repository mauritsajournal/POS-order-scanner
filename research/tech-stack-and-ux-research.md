# POS & B2B Order Tools — Technical Stack & UX Research Report

**Date:** March 2026
**Author:** Claude (AI Research Agent)
**Purpose:** Technical research for building a trade show order scanning SaaS app — covering UI/UX patterns, tech stacks, offline architecture, and recommended tooling for a small (2-3 dev) team.

---

## Table of Contents

1. [POS Product UI/UX & Tech Analysis](#1-pos-product-uiux--tech-analysis)
   - [1.1 Square POS](#11-square-pos)
   - [1.2 Shopify POS](#12-shopify-pos)
   - [1.3 Lightspeed / Vend](#13-lightspeed--vend)
   - [1.4 FooSales (WooCommerce POS)](#14-foosales-woocommerce-pos)
   - [1.5 Toast POS](#15-toast-pos)
   - [1.6 B2B Trade Show Order Apps](#16-b2b-trade-show-order-apps)
2. [POS UI Design Patterns — Synthesis](#2-pos-ui-design-patterns--synthesis)
3. [Open Source POS References](#3-open-source-pos-references)
4. [Offline-First Architecture Patterns](#4-offline-first-architecture-patterns)
5. [Tech Stack Deep Dives](#5-tech-stack-deep-dives)
   - [5.1 Next.js vs Remix for Admin Dashboard](#51-nextjs-vs-remix-for-admin-dashboard)
   - [5.2 Supabase vs Neon for PostgreSQL](#52-supabase-vs-neon-for-postgresql)
   - [5.3 WatermelonDB vs PowerSync vs ElectricSQL](#53-watermelondb-vs-powersync-vs-electricsql)
   - [5.4 Expo EAS vs Bare React Native](#54-expo-eas-vs-bare-react-native)
   - [5.5 Barcode Scanning Libraries](#55-barcode-scanning-libraries)
   - [5.6 Payment Processing (EU/NL)](#56-payment-processing-eunl)
   - [5.7 Cloudflare Workers for API Backend](#57-cloudflare-workers-for-api-backend)
   - [5.8 Turborepo Monorepo Structure](#58-turborepo-monorepo-structure)
   - [5.9 Claude AI / MCP Integration](#59-claude-ai--mcp-integration)
6. [Recommended Stack for Trade Show Order Scanner SaaS](#6-recommended-stack-for-trade-show-order-scanner-saas)
7. [Sources](#7-sources)

---

## 1. POS Product UI/UX & Tech Analysis

### 1.1 Square POS

**Tech Stack:**
- Native iOS and Android apps (not cross-platform for the core POS app)
- Provides React Native SDK for third-party integrations (In-App Payments SDK)
- API-based architecture: mobile device + Square card reader + backend service
- Cloud-based with local transaction processing capability

**UI Patterns:**
- Clean, minimal interface with large touch targets
- Product grid layout with category tabs at the top
- Cart/order summary on the right side of the screen (split-pane on tablet)
- Quick-access tiles for frequent items
- Search bar prominent at the top
- Single-tap item addition to cart

**Scan-to-Cart Flow:**
- Barcode scan triggers product lookup
- Item added directly to cart with quantity defaulting to 1
- Cart updates in real-time on the right pane
- Quantity adjustable inline in the cart

**Offline Mode:**
- Square supports offline payments (card dipping) when connectivity drops
- Transactions are queued and processed when connection resumes
- Limited to certain payment types offline (chip cards only, no tap/NFC)
- Offline payments auto-sync on reconnection

**Key Takeaway:** Square's strength is its hardware ecosystem integration. The native SDK approach means tight control over payment hardware. Their offline mode is payment-focused (not full catalog offline).

### 1.2 Shopify POS

**Tech Stack:**
- **React Native** for all mobile apps (confirmed by Shopify Engineering, 2025)
- Migrated to React Native New Architecture in 2025 (JSI, TurboModules, Fabric)
- Shared React Native codebase across iOS and Android
- Native modules for camera, payment hardware, and background sync
- FlashList (Shopify-built) for high-performance product lists
- Sub-500ms P75 screen loads, >99.9% crash-free sessions
- Hot reloading for dev experience; TypeScript throughout

**UI Patterns:**
- **Smart Grid tiles** on the home screen — customizable shortcut tiles for products, discounts, and actions
- Split-pane layout on tablet: product grid on left, cart on right
- On phone: stack layout with product browsing and cart as separate screens
- Context-aware search that adapts to current task
- Brand-customizable customer-facing displays (idle screen videos, branded PIN screens)
- POS UI Extensions system using component building blocks

**Scan-to-Cart Flow:**
- Built-in barcode scanning via device camera or attached scanner (Scan2Add extension)
- Scan triggers product lookup by barcode/SKU
- Product added to cart with animation feedback
- Supports scanning products, customer loyalty cards, and discount codes
- Multi-code detection supported

**Offline Mode:**
- Downloads and syncs product catalog in the background for offline use
- Can process transactions even when offline
- Native code handles long-running background sync jobs
- Background tasks run outside React Native runtime for reliability

**Key Takeaway:** Shopify POS is the gold standard for React Native POS apps. They proved React Native works at scale for POS with offline. Their UI extension system (smart grid tiles, customizable layouts) is worth studying for the scan app.

### 1.3 Lightspeed / Vend

**Tech Stack:**
- Web-based POS (browser-based, runs on iPad/desktop)
- Vend (now Lightspeed Retail X-Series) is primarily a web application
- REST API for integrations
- Supports 70+ integrations (Shopify, WooCommerce, Stripe, Adyen, QuickBooks, Xero, etc.)

**UI Patterns:**
- Minimal clicks per transaction — designed for fast-moving retail
- Consistent UX between desktop and iPad
- Fast navigation with clearly segmented views: Sales, Inventory, Reports
- Product grid with drag-and-drop inventory management
- Barcode scanning integrated at the product search level
- Customer profile creation/search before item input

**Scan-to-Cart Flow:**
- Scan barcode or search by name/category
- Product auto-populates in cart
- Inline quantity editing
- Quick checkout with multiple payment methods

**Offline Mode:**
- Limited offline — primarily cloud-dependent
- Some local caching for product data

**Key Takeaway:** Lightspeed/Vend proves web-based POS can work well on tablets. Their segmented view approach (Sales/Inventory/Reports) is a solid navigation pattern. Being web-based limits offline capability.

### 1.4 FooSales (WooCommerce POS)

**Tech Stack:**
- Native mobile apps (iOS App Store listing confirms native build)
- Connects directly to WooCommerce via WordPress REST API
- No third-party API layer — reads directly from WooCommerce store
- Web-based version also available (runs on own server)

**UI Patterns:**
- Product grid with WooCommerce categories
- Uses existing WooCommerce product data (variations, stock, tax rates)
- Cart with real-time stock checking
- Customer management integrated

**Offline Sync Architecture (most relevant for this project):**
- Automatic offline mode activation when internet drops
- Continues processing cash and manual card payments offline
- Transactions queued until reconnection
- Automatic sync with WooCommerce on reconnection
- Fallback: XML export from app settings, import via WordPress admin tool
- No third-party sync service — direct WooCommerce REST API

**Key Takeaway:** FooSales is the closest existing product to what A-Journal needs. Their offline sync is pragmatic: queue transactions, sync on reconnect, XML fallback if auto-sync fails. The direct WooCommerce integration pattern (no middleware) is interesting but limits scalability.

### 1.5 Toast POS

**Tech Stack:**
- Android-only native app (custom Android hardware)
- Cloud-based backend with on-device processing
- Custom hardware: Flex terminal, Tap payment device, Hub, kitchen displays
- Kitchen Display System (KDS) integration

**UI Patterns (restaurant-specific but transferable):**
- Large, colorful tile grid for menu items
- Category tabs for quick navigation
- Split screen: menu on left, order on right
- Color-coding for categories and order status
- One-tap item addition
- Modifier/variant selection as modal overlays
- Order routing to kitchen stations

**Key Takeaway:** Toast's UI excels at high-speed order entry with large touch targets and color-coding. The modifier overlay pattern is directly applicable to product variant selection in a B2B order app.

### 1.6 B2B Trade Show Order Apps (Direct Competitors)

**WizCommerce:**
- Offline-ready lead capture + full order management
- QR code/barcode/UPC scanning + custom label creation
- Works offline, syncs when connected
- Badge scanning for lead capture

**Orderchamp Cloud:**
- iOS mobile app with barcode scanner integration
- Syncs thousands of products for offline use
- Trade show focused

**Pepperi:**
- Dedicated trade show order-taking system
- iPad-first design
- Catalog browsing + barcode scanning
- Offline order capture
- ERP integration (SAP, NetSuite, etc.)

**App4Sales:**
- B2B sales at trade fairs
- Product catalog with images
- Barcode scanning
- Offline capable

**Key Takeaway:** These B2B trade show apps share a common pattern: offline product catalog + barcode scanning + cart/order + sync. Most are closed-source enterprise products with high per-user pricing. The market gap is an affordable, modern, self-serve SaaS version.

---

## 2. POS UI Design Patterns — Synthesis

### Universal Layout Pattern (Tablet)

```
+------------------+------------------+
|   HEADER BAR     |   SEARCH / SCAN  |
+------------------+------------------+
|                  |                  |
|   PRODUCT GRID   |   CART/ORDER     |
|   (categories)   |   SUMMARY        |
|                  |                  |
|   [tile] [tile]  |   - Item 1  x2   |
|   [tile] [tile]  |   - Item 2  x1   |
|   [tile] [tile]  |                  |
|                  |   SUBTOTAL       |
+------------------+   TAX            |
|   CATEGORY TABS  |   TOTAL          |
+------------------+------------------+
|                  |   [CHECKOUT]     |
+------------------+------------------+
```

### Universal Layout Pattern (Phone)

```
Screen 1: Product Browsing    Screen 2: Cart/Order
+------------------+         +------------------+
|   SEARCH / SCAN  |         |   ORDER SUMMARY  |
+------------------+         +------------------+
|                  |         |                  |
|   PRODUCT LIST   |         |   - Item 1  x2   |
|   or GRID        |         |   - Item 2  x1   |
|                  |         |   - Item 3  x3   |
|                  |         |                  |
+------------------+         +------------------+
|   [CART BADGE]   |         |   TOTAL          |
+------------------+         |   [CHECKOUT]     |
                             +------------------+
```

### Core Design Principles (from Shopify, Square, Lightspeed, and POS UX research)

1. **Simplicity first** — Eliminate cognitive load. Every unnecessary element slows transactions.
2. **Fat-finger friendly** — Minimum 44x44pt touch targets. Visual press feedback.
3. **Split-pane on tablet** — Products left, cart right. Always visible cart.
4. **Smart grids** — Customizable tile shortcuts for frequent products/actions.
5. **Scan-first workflow** — Scan input should be the default/primary entry method.
6. **Context-aware search** — Search adapts to current task (product lookup vs customer lookup).
7. **Conversational ordering** — Allow items in any order (not forced menu sequence).
8. **Color-coding** — Categories, order status, sync status all benefit from color.
9. **Offline indicator** — Always show sync status. Users need to trust the app works offline.
10. **Role differentiation** — Separate views for sales reps vs. admin/managers.
11. **High contrast** — POS used in varied lighting (bright trade show floors, dim warehouses).
12. **Quantity inline editing** — +/- buttons or number input directly in cart.

### Scan-to-Cart Flow (Synthesized Best Practice)

```
1. SCAN barcode (camera or hardware scanner)
      ↓
2. LOOKUP product (local DB first, then remote if online)
      ↓
3. MATCH FOUND?
   → YES: Show product card briefly (image, name, price, stock)
           Auto-add to cart with qty=1
           Haptic/sound feedback
   → NO:  Show "Product not found" with manual search option
      ↓
4. CART UPDATES in real-time
   → Quantity +/- adjustable
   → Variant selection if applicable (color, size)
   → Notes per line item
      ↓
5. CONTINUE SCANNING (camera stays active)
      ↓
6. CHECKOUT when ready
   → Customer selection/creation
   → Payment method
   → Order confirmation
   → Sync to backend
```

---

## 3. Open Source POS References

| Project | Stack | Notes |
|---------|-------|-------|
| [react-point-of-sale](https://github.com/shanmugharajk/react-point-of-sale) | React, Redux, TypeScript, Material-UI, PostgreSQL, Express, TypeORM | Clean architecture, good reference for data model |
| [TailPOS](https://github.com/nicedaybrothers/tailpos) | React, Offline-first, ERPNext integration | Offline-first design pattern reference |
| [pos-react](https://github.com/PabloAvelar/pos-react) | React.js, Express.js backend | Simple POS UI reference |
| [MERN POS](https://github.com/topics/pos?l=javascript) | MongoDB, Express, React, Node | Restaurant POS, good cart pattern reference |
| Electron + React + SQLite POS | Electron, React, SQLite | Desktop POS with local DB — relevant offline pattern |

**Recommendation:** Use `react-point-of-sale` as a code reference for data model patterns (TypeORM + PostgreSQL) and TailPOS for offline-first architecture patterns.

---

## 4. Offline-First Architecture Patterns

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER                │
│   React Native Components           │
│   (Optimistic UI updates)           │
├─────────────────────────────────────┤
│   DATA ACCESS LAYER                 │
│   Repositories + Sync Manager       │
│   (Queue operations, conflict       │
│    resolution, retry logic)         │
├─────────────────────────────────────┤
│   PERSISTENCE LAYER                 │
│   SQLite (via PowerSync/WatermelonDB)│
│   + MMKV (key-value preferences)    │
└─────────────────────────────────────┘
```

### Sync Strategy: Local-First, Sync-Later

1. All reads/writes target local SQLite database
2. Changes are persisted and queued for sync
3. Network monitor detects connectivity changes
4. On reconnect: queued operations sent to server in batches
5. Server responses update local state + clear queue

### Essential Data Model Fields for Sync

Every entity that syncs must have:
- `id` — UUID (generated locally for offline creation)
- `created_at` / `updated_at` — timestamps
- `server_created_at` — server-side timestamp
- `sync_status` — enum: `synced`, `pending`, `conflict`, `error`
- `version` — integer for optimistic locking
- `is_deleted` — boolean (soft delete, never hard delete)
- `last_modified_by` — user/device identifier

### Conflict Resolution Strategies

| Strategy | Complexity | Best For |
|----------|-----------|----------|
| **Last-Write-Wins** | Low | Simple data (order status) |
| **Version-based** | Medium | Concurrent edits to same record |
| **Field-level merge** | High | Rich documents with many fields |
| **User-driven** | Medium | Critical data (pricing, inventory) |

**Recommendation for trade show order app:** Last-Write-Wins for order data (orders are typically created by one person), Version-based for shared inventory counts, User-driven for pricing conflicts.

### Retry Mechanism

- Exponential backoff: base 1s, max 30s, with jitter
- Max 5 retries for transient errors (5xx)
- Immediate fail for client errors (4xx)
- Persistent queue survives app restart

### Network Quality Detection

```
Offline → Queue everything, show offline indicator
2G/Poor → Queue writes, allow reads from cache
Good → Real-time sync, background batch operations
```

---

## 5. Tech Stack Deep Dives

### 5.1 Next.js vs Remix for Admin Dashboard

| Factor | Next.js | Remix |
|--------|---------|-------|
| **Ecosystem maturity** | Largest community, most plugins | Growing but smaller |
| **Data loading** | 4 modes (SSR, SSG, ISR, CSR) | 1 mode (loader) — simpler mental model |
| **JS bundle size** | 566 kB (starter) | 371 kB (starter) — 35% smaller |
| **Server Components** | Yes (App Router) | No (but React Router v7 converging) |
| **Form handling** | Needs client-side libraries | Built-in progressive enhancement |
| **Real-time** | Good with Server Actions | Good with loader revalidation |
| **Deployment** | Vercel-optimized, works anywhere | Works anywhere, Cloudflare-native |
| **Learning curve** | Steeper (many modes) | Simpler (one way to do things) |

**Verdict for this project: Next.js.**
- Larger ecosystem = faster development for small team
- Server Components reduce client JS for dashboard
- Better Supabase/auth integration ecosystem
- Vercel deployment or self-host on Cloudflare (via OpenNext)
- More Claude AI coding assistance available (more training data)

### 5.2 Supabase vs Neon for PostgreSQL

| Factor | Supabase | Neon |
|--------|----------|------|
| **Core offering** | BaaS (DB + Auth + Realtime + Storage + Edge Functions) | Database only (serverless Postgres) |
| **Auth** | Built-in (GoTrue) | None (bring your own) |
| **Realtime** | Built-in (Postgres changes via websocket) | None |
| **Edge Functions** | Deno-based | None |
| **Row Level Security** | First-class | Standard Postgres RLS |
| **Auto-generated API** | PostgREST + GraphQL | None |
| **Branching** | Git-integrated with migrations | Instant copy-on-write |
| **Scale to zero** | No (always-on instance) | Yes |
| **Pricing (starter)** | $25/month (Pro) | $19/month (Launch) |
| **Offline sync** | Via PowerSync integration | Via PowerSync integration |
| **AI integration** | pgvector built-in, AI SDK | pgvector available |
| **Compliance** | SOC2 + HIPAA | SOC2 |
| **Acquired by** | Independent | Databricks (May 2025) |

**Verdict for this project: Supabase.**
- Built-in auth eliminates a major development effort
- Realtime subscriptions useful for dashboard live updates
- Auto-generated REST API speeds up development
- PowerSync integration for offline-first is proven and documented
- Row Level Security perfect for multi-tenant SaaS
- Edge Functions for webhooks/background jobs
- More batteries-included = faster for 2-3 person team
- Strong community and extensive docs for AI-assisted development

### 5.3 WatermelonDB vs PowerSync vs ElectricSQL

| Factor | WatermelonDB | PowerSync | ElectricSQL |
|--------|-------------|-----------|-------------|
| **Architecture** | Local-only DB + DIY sync | Client-server sync service | CRDT-based sync (rewriting) |
| **Server authority** | You decide | Server-authoritative | Local-write finality |
| **Conflict resolution** | Build your own | Custom (server-side) | CRDT (automatic) |
| **Backend requirement** | Build your own sync API | Your API for writes | Direct to Postgres |
| **Client platforms** | React Native, Web | React Native, Web, Flutter, Kotlin, Swift, .NET | JavaScript only |
| **Postgres integration** | None (separate) | Reads WAL, non-invasive | Modifies schema heavily |
| **Schema changes** | Your responsibility | Schemaless client | Must use migration proxy |
| **Production ready** | Yes (mature) | Yes (enterprise proven) | No (alpha, being rewritten) |
| **Pricing** | Free (OSS) | Free tier, Pro $49/mo | Free (OSS, self-host) |
| **Supabase integration** | Manual | Official, documented | Experimental |

**Verdict for this project: PowerSync.**
- Production-ready with proven enterprise track record (10+ years core tech)
- Official Supabase integration with documentation and demos
- React Native SDK available with Expo compatibility
- Server-authoritative model suits B2B orders (inventory must be consistent)
- Non-invasive — reads Postgres WAL, no schema modifications
- Sync Rules control which data syncs to which users (multi-tenant)
- Managed cloud service reduces ops burden for small team
- $49/mo Pro plan is reasonable for SaaS

### 5.4 Expo EAS vs Bare React Native

| Factor | Expo (Managed + EAS) | Bare React Native |
|--------|---------------------|-------------------|
| **Build infrastructure** | Cloud-based (EAS Build) | Local Xcode/Android Studio |
| **OTA updates** | EAS Update (skip app store) | CodePush (Microsoft, being deprecated) |
| **Native modules** | Config Plugins (JS-based) | Direct native code access |
| **Dev experience** | Hot reload, Expo Go for testing | Slower build cycles |
| **Barcode scanning** | expo-camera or vision-camera | Same libraries available |
| **Background tasks** | expo-task-manager | Full native control |
| **App store submission** | EAS Submit (automated) | Manual or Fastlane |
| **Cost** | Free tier, paid for frequent builds | Free (your own machines) |
| **React Native team rec** | Recommended starting point (2025) | For deep native needs |

**Verdict for this project: Expo with EAS.**
- React Native core team recommends Expo as default in 2025
- Shopify (POS at scale) uses React Native — proves the approach works
- EAS Build eliminates need for Mac hardware for iOS builds
- EAS Update enables critical OTA patches without app store review
- Config Plugins handle barcode scanner and payment hardware integration
- Expo SDK 54 includes monorepo auto-detection (works with Turborepo)
- Faster iteration cycles for small team
- Cost: free tier sufficient for early stage, scales reasonably

### 5.5 Barcode Scanning Libraries

| Library | Maintenance | Features | Recommendation |
|---------|------------|----------|----------------|
| **react-native-vision-camera** | Active, well-maintained | ML Kit (Android) + Vision Kit (iOS), multi-code detection, image scanning, GS1 DataBar | **Primary choice** |
| **expo-camera** | Expo team, 3 releases/year | Built-in barcode via CameraView, simpler API | Fallback / simple use |
| **Scanbot SDK** | Commercial, premium | Enterprise-grade reliability, paid license | If free options insufficient |
| ~~react-native-qrcode-scanner~~ | **Abandoned** | Deprecated dependency | Do not use |

**Verdict: react-native-vision-camera.**
- Most versatile, actively maintained
- Uses native platform APIs (ML Kit, Vision Kit)
- Multi-code detection (scan multiple barcodes in view)
- Works with Expo via Config Plugin
- Supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128, QR — all needed for trade show products

### 5.6 Payment Processing (EU/NL)

#### Stripe Connect (SaaS Platform Payments)

- **Model:** Platform takes payments on behalf of connected accounts (merchants)
- **15,000+ SaaS platforms** already use Connect (Shopify, DoorDash scale)
- **Connected account onboarding:** 3-click networked onboarding for existing Stripe users
- **135+ currencies, 25+ payment methods** including iDEAL, Bancontact, SEPA
- **Embedded components:** Pre-built UI for onboarding, payouts, dashboards
- **Fraud:** AI-based Radar built for platforms
- **Split payments:** Application fees automatically deducted
- **Pricing:** 1.5% + EUR 0.25 per EU card transaction + platform fee

#### Mollie Connect (EU-Native Alternative)

- **Headquarters:** Amsterdam, Netherlands
- **Model:** Platform (SaaS) and Marketplace models
- **130,000+ businesses** across Europe
- **Split payments:** Route funds between connected sellers, retain application fee
- **25+ payment methods** including iDEAL, Bancontact, SEPA, Klarna, Apple Pay
- **KYC:** Mollie handles verification for both platform and sellers
- **In-person payments:** Supports kiosk terminals, payment terminals, Tap to Pay
- **OAuth-based:** Connect via OAuth, no manual API key exchange
- **API:** RESTful, client libraries for JS, PHP, Python, .NET
- **Pricing:** Competitive EU pricing, lower than Stripe for Dutch transactions

**Verdict for this project: Both — Mollie primary, Stripe secondary.**
- Mollie for NL/EU market: lower fees, local support, iDEAL native, in-person terminal support
- Mollie Connect for SaaS model: split payments, platform fees, seller onboarding
- Stripe Connect as secondary for international expansion
- Both have strong APIs that Claude can code against
- Start with Mollie (Dutch market fit), add Stripe later for international

### 5.7 Cloudflare Workers for API Backend

**Current Capabilities (2025-2026):**
- Full-stack apps in a single Worker (frontend + backend + DB)
- Vite plugin (v1.0 GA) with HMR in Workers runtime
- Framework support: React Router v7, Astro, Hono, Vue, Nuxt, SvelteKit
- Next.js support coming (Q2 2025, likely available now)
- Static asset serving + SSR in same Worker
- **Hyperdrive:** Connection pooling for external PostgreSQL (Supabase)
- **Containers:** Open beta (June 2025) for compute-heavy tasks
- **D1:** SQLite database for edge data
- **KV:** Key-value store for caching
- **R2:** Object storage (product images)
- **Durable Objects:** Stateful actors (real-time collaboration)
- **Workers for Platforms:** Multi-tenant deployment for SaaS customers
- New REST API (beta) for programmatic management
- Max 5-minute CPU time per request

**Architecture Fit:**
```
Client App (Expo/React Native)
    ↓ HTTPS
Cloudflare Workers (API Gateway / Edge Logic)
    ├── Hono routes (REST API)
    ├── Auth middleware (validate Supabase JWT)
    ├── Rate limiting
    ├── Image optimization (R2 + Images)
    └── Hyperdrive → Supabase PostgreSQL

PowerSync Service
    └── Reads Supabase WAL → Syncs to client SQLite
```

**Verdict: Use Cloudflare Workers as API layer, not primary backend.**
- A-Journal already uses Cloudflare (per tech stack notes)
- Workers for edge logic: API gateway, webhooks, image processing
- Hyperdrive for connecting to Supabase PostgreSQL
- R2 for product image storage
- BUT: Supabase handles auth, realtime, and core DB operations
- Workers complement Supabase, don't replace it
- Workers for Platforms useful later for multi-tenant isolation

### 5.8 Turborepo Monorepo Structure

**Recommended 2025/2026 Structure:**

```
trade-show-scanner/
├── apps/
│   ├── mobile/              # Expo React Native app
│   │   ├── app/             # Expo Router screens
│   │   ├── components/      # Mobile-specific components
│   │   └── package.json
│   ├── web/                 # Next.js admin dashboard
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Web-specific components
│   │   └── package.json
│   └── api/                 # Cloudflare Workers API (Hono)
│       ├── src/
│       └── wrangler.jsonc
├── packages/
│   ├── shared/              # Shared business logic
│   │   ├── types/           # TypeScript types (Order, Product, Customer)
│   │   ├── validation/      # Zod schemas
│   │   ├── constants/       # Shared constants
│   │   └── utils/           # Shared utilities
│   ├── db/                  # Database schema + migrations
│   │   ├── schema/          # Drizzle ORM schema
│   │   ├── migrations/      # SQL migrations
│   │   └── seed/            # Seed data
│   ├── ui/                  # Shared UI components (limited)
│   │   └── components/      # Components that work on both web + native
│   └── config/              # Shared configs
│       ├── eslint/
│       └── typescript/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Key Decisions:**
- **pnpm** for package management (faster, strict dependency resolution)
- **Turborepo** for build orchestration and caching
- **Shared types** package is the highest-value shared code (Order, Product, Customer types used everywhere)
- **Shared validation** (Zod) ensures consistent validation on mobile, web, and API
- **Shared UI is limited** — web (React DOM) and mobile (React Native) have different component primitives. Share logic, not UI.
- Expo SDK 54 auto-detects monorepo structure

### 5.9 Claude AI / MCP Integration

**Model Context Protocol (MCP) — Current State:**

- Open standard for AI-to-tool connections (USB-C for AI)
- 1000+ community MCP servers by early 2025
- Claude supports remote MCP servers on claude.ai (May 2025)
- Pre-built integrations: Cloudflare, Square, Sentry, Zapier, Linear, PayPal
- MCP Apps (Jan 2026): tools can return rich interactive UI in iframes

**Integration Points for Trade Show Scanner SaaS:**

1. **Development:** Claude Code with MCP connected to Supabase, Cloudflare, and GitHub for AI-assisted development
2. **Admin features:** MCP server exposing order data, inventory, and analytics for AI-powered insights
3. **Customer-facing AI:** Product recommendations, order optimization suggestions
4. **Operations:** AI-powered inventory forecasting, reorder suggestions
5. **Support:** AI chatbot with MCP access to order/customer data

**Programmatic Management (Claude-friendly tools):**
- Supabase: Full Management API + CLI, SQL migrations, Edge Functions
- Cloudflare: Workers REST API, Wrangler CLI, Terraform provider
- Expo: EAS CLI for builds/updates/submissions
- GitHub: CLI + API for repos, PRs, actions
- Mollie: REST API with comprehensive documentation
- PowerSync: Dashboard + API for sync rules

**Verdict:** The entire recommended stack is highly Claude-programmable. Every component has a well-documented API or CLI that Claude can operate through MCP or direct coding.

---

## 6. Recommended Stack for Trade Show Order Scanner SaaS

### The Stack (for 2-3 dev team)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Mobile App** | Expo (React Native) + EAS | Shopify-proven for POS, cross-platform, OTA updates |
| **Mobile Offline DB** | PowerSync + SQLite | Production-ready offline-first sync with Supabase |
| **Barcode Scanning** | react-native-vision-camera | Best maintained, multi-code, native ML Kit/Vision Kit |
| **Web Dashboard** | Next.js 15+ (App Router) | Largest ecosystem, Server Components, fast dev |
| **Backend/Database** | Supabase (PostgreSQL) | Auth + Realtime + RLS + Storage + Edge Functions |
| **API Edge Layer** | Cloudflare Workers (Hono) | Edge logic, webhooks, image processing, Hyperdrive |
| **Image Storage** | Cloudflare R2 | S3-compatible, no egress fees, integrates with Workers |
| **Payments (EU)** | Mollie Connect (primary) | Dutch HQ, iDEAL, lower EU fees, SaaS split payments |
| **Payments (Intl)** | Stripe Connect (secondary) | Global reach, 135+ currencies, embedded components |
| **Monorepo** | Turborepo + pnpm | Shared types/validation, smart caching |
| **ORM** | Drizzle ORM | TypeScript-first, lightweight, works with Supabase |
| **Validation** | Zod | Shared schemas across mobile, web, API |
| **Styling (Web)** | Tailwind CSS | Fast prototyping, consistent design system |
| **Styling (Mobile)** | NativeWind (Tailwind for RN) | Consistent design language with web |
| **CI/CD** | GitHub Actions + EAS Build | Automated builds, preview deploys |
| **AI Integration** | Claude API + MCP | Development assistance, future AI features |
| **Monitoring** | Sentry | Error tracking across mobile + web + API |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Mobile App   │    │ Web Dashboard │                  │
│  │  (Expo/RN)    │    │ (Next.js)     │                  │
│  │              │    │              │                    │
│  │  ┌─────────┐│    │              │                    │
│  │  │ SQLite  ││    │              │                    │
│  │  │(PowerSync│    │              │                    │
│  │  │ client) ││    │              │                    │
│  │  └─────────┘│    │              │                    │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                           │
└─────────┼───────────────────┼───────────────────────────┘
          │                   │
          ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              EDGE / API LAYER                            │
│                                                         │
│  ┌──────────────────────────────────────┐               │
│  │   Cloudflare Workers (Hono)          │               │
│  │   - API Gateway                      │               │
│  │   - Auth middleware (Supabase JWT)    │               │
│  │   - Webhook handlers                 │               │
│  │   - Image optimization               │               │
│  │   - Rate limiting                    │               │
│  └──────────────┬───────────────────────┘               │
│                 │                                        │
│  ┌──────────────┴───────────────────────┐               │
│  │   Cloudflare R2 (Product Images)     │               │
│  └──────────────────────────────────────┘               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND SERVICES                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Supabase    │  │  PowerSync   │  │   Mollie     │  │
│  │              │  │  Service     │  │   Connect    │  │
│  │  - Postgres  │◄─┤              │  │              │  │
│  │  - Auth      │  │  - WAL reader│  │  - Payments  │  │
│  │  - Realtime  │  │  - Sync rules│  │  - Split pay │  │
│  │  - RLS       │  │  - Client SDK│  │  - KYC       │  │
│  │  - Edge Fn   │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Cost Estimate (Monthly, Early Stage)

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Pro | $25/mo |
| PowerSync | Pro | $49/mo |
| Cloudflare Workers | Free/Pro | $0-5/mo |
| Cloudflare R2 | Pay-as-you-go | ~$5/mo |
| Expo EAS | Free tier | $0/mo |
| Mollie | Pay-per-transaction | Variable |
| Sentry | Free tier | $0/mo |
| Vercel (dashboard) | Pro | $20/mo |
| GitHub | Free/Team | $0-4/mo |
| **Total fixed** | | **~$100-110/mo** |

### Why This Stack Answers the Key Question

For a 2-3 dev team building an offline-first mobile+web SaaS:

1. **React Native mobile (iOS + Android):** Expo with EAS handles both platforms from one codebase. Shopify proved this works for POS at massive scale.

2. **Web admin dashboard:** Next.js is the safe, productive choice with the largest ecosystem.

3. **PostgreSQL backend:** Supabase gives you Postgres plus auth, realtime, RLS, and storage — eliminating months of boilerplate.

4. **Real-time sync:** PowerSync + Supabase is a proven, documented combination. Reads the WAL, syncs to client SQLite, handles conflicts server-side.

5. **Barcode scanning:** react-native-vision-camera with native ML Kit/Vision Kit. Multi-code detection, works with Expo.

6. **Payment processing (EU/NL):** Mollie Connect for Dutch/EU market (iDEAL, lower fees, in-person terminals). Stripe Connect for international expansion.

7. **Claude AI integration:** Every component in this stack has well-documented APIs and CLIs. Supabase, Cloudflare, Expo, GitHub, Mollie — all are programmable. MCP servers exist for Cloudflare and can be built for Supabase. Claude Code can directly develop, deploy, and manage the entire stack.

---

## 7. Sources

### POS Products & UI
- [What Is POS UI? Design Principles and Extensions - Shopify](https://www.shopify.com/blog/pos-ui)
- [Shopify POS: Designed for Your Brand, Built for Modern Retail (2025)](https://www.shopify.com/retail/shopify-pos-design-update)
- [Five years of React Native at Shopify (2025)](https://shopify.engineering/five-years-of-react-native-at-shopify)
- [Migrating to React Native's New Architecture (2025) - Shopify](https://shopify.engineering/react-native-new-architecture)
- [POS System Design: Principles, Examples for Retail & Restaurants](https://agentestudio.com/blog/design-principles-pos-interface)
- [Designing a POS System: 10 User Experience Tactics](https://dev.pro/insights/designing-a-pos-system-ten-user-experience-tactics-that-improve-usability/)
- [The Design Principles of the POS System (Creative Navy)](https://medium.com/uxjournal/the-design-principles-in-the-pos-system-pos-design-guide-part-2-57d1bcb30ac0)
- [The 16 UX Factors of the Point of Sale System](https://medium.com/uxjournal/pos-ux-design-part-one-the-16-ux-factors-in-point-of-sale-b94661936eea)
- [Square POS API Documentation](https://developer.squareup.com/docs/pos-api/what-it-does)
- [Lightspeed POS Review 2026](https://tech.co/pos-system/lightspeed-pos-review)
- [Toast POS Platform Overview](https://doc.toasttab.com/doc/platformguide/platformToastPlatformOverview.html)
- [FooSales Offline Mode](https://www.foosales.com/features/offline-mode/)
- [FooSales Platform](https://www.foosales.com/features/platform/)

### B2B Trade Show Apps
- [WizCommerce Trade Show App](https://wizcommerce.com/market-solution/)
- [Orderchamp Cloud Sales App](https://www.orderchamp.cloud/sales-app)
- [Pepperi Trade Show App](https://www.pepperi.com/trade-show-app/)
- [App4Sales for Fairs](https://www.app4sales.net/use-cases/for-fairs/)
- [Ai2 B2B Order Management Mobile App](https://ai2.com/b2b-order-management-mobile-app/)

### Offline-First Architecture
- [Offline-first frontend apps in 2025 - LogRocket](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)
- [Offline-First Mobile App Architecture (DEV Community)](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-1j58)
- [How to Implement Offline-First Architecture in React Native](https://oneuptime.com/blog/post/2026-01-15-react-native-offline-architecture/view)
- [Building Offline Apps: A Fullstack Approach](https://think-it.io/insights/offline-apps)

### Framework & Database Comparisons
- [Next.js vs Remix 2025 (Strapi)](https://strapi.io/blog/next-js-vs-remix-2025-developer-framework-comparison-guide)
- [Remix vs NextJS 2025 (Merge)](https://merge.rocks/blog/remix-vs-nextjs-2025-comparison)
- [Neon vs Supabase (Bytebase)](https://www.bytebase.com/blog/neon-vs-supabase/)
- [Supabase vs Neon Benchmarks & Pricing](https://designrevision.com/blog/supabase-vs-neon)
- [ElectricSQL vs PowerSync](https://www.powersync.com/blog/electricsql-vs-powersync)
- [PowerSync: Bringing Offline-First to Supabase](https://www.powersync.com/blog/bringing-offline-first-to-supabase)
- [Supabase + PowerSync Integration Guide](https://docs.powersync.com/integration-guides/supabase-+-powersync)
- [Tech Stack Analysis for Offline-First AI Chat Client (BoltAI)](https://docs.boltai.com/blog/tech-stack-analysis-for-a-cross-platform-offline-first-ai-chat-client)

### React Native & Expo
- [Expo vs Bare React Native in 2025 (Godel Tech)](https://www.godeltech.com/blog/expo-vs-bare-react-native-in-2025/)
- [It's 2025, You Should Probably Be Using Expo](https://dev.to/devi_green_00f82b6d705/its-2025-you-should-probably-be-using-expo-for-react-native-407a)
- [Expo for React Native in 2025 (Hashrocket)](https://hashrocket.com/blog/posts/expo-for-react-native-in-2025-a-perspective)
- [Comparing React Native Barcode Scanner Libraries (Scanbot)](https://scanbot.io/blog/react-native-vision-camera-vs-expo-camera/)

### Payments
- [Stripe Connect Documentation](https://docs.stripe.com/connect)
- [Stripe Connect for SaaS](https://docs.stripe.com/connect/saas)
- [Mollie Connect Overview](https://docs.mollie.com/docs/connect-overview)
- [Mollie Connect Marketplace Split Payments](https://docs.mollie.com/docs/connect-marketplaces-processing-payments)
- [Mollie for Developers](https://www.mollie.com/developers)

### Infrastructure
- [Full-Stack Development on Cloudflare Workers](https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/)
- [Cloudflare Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/)
- [Leveraging Cloudflare for SaaS Applications](https://developers.cloudflare.com/reference-architecture/design-guides/leveraging-cloudflare-for-your-saas-applications/)
- [Turborepo + React Native + Next.js Monorepo (2025)](https://medium.com/better-dev-nextjs-react/setting-up-turborepo-with-react-native-and-next-js-the-2025-production-guide-690478ad75af)

### AI Integration
- [Introducing the Model Context Protocol (Anthropic)](https://www.anthropic.com/news/model-context-protocol)
- [Claude Integrations](https://www.anthropic.com/news/integrations)
- [Connect Claude Code to Tools via MCP](https://code.claude.com/docs/en/mcp)
- [MCP Apps (2026)](http://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/)

### Open Source POS
- [GitHub: JavaScript POS Projects](https://github.com/topics/point-of-sale?l=javascript)
- [react-point-of-sale (PostgreSQL + TypeORM)](https://github.com/shanmugharajk/react-point-of-sale)
