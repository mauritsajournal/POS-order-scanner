# Trade Show Order & Scan Software — Market Analysis Report

**Date:** March 2026
**Author:** Claude (AI Research Agent)
**Purpose:** Commercial feasibility study for developing a SaaS trade show order/scan platform
**Context:** A-Journal currently operates an in-house MS Access tool for B2B trade show order processing via barcode scanning. This report evaluates the market landscape, competitive positioning, and technical feasibility of commercializing this capability.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Landscape](#2-market-landscape)
3. [Competitor Deep-Dive](#3-competitor-deep-dive)
   - [3.1 Trade Show Order Management](#31-trade-show-order-management)
   - [3.2 Wholesale B2B Platforms](#32-wholesale-b2b-platforms)
   - [3.3 Mobile B2B Order Apps](#33-mobile-b2b-order-apps)
   - [3.4 WooCommerce-Native POS](#34-woocommerce-native-pos)
   - [3.5 Barcode Scanning SDKs](#35-barcode-scanning-sdks)
4. [Comparison Matrix](#4-comparison-matrix)
5. [Review Analysis & User Sentiment](#5-review-analysis--user-sentiment)
6. [Gap Analysis](#6-gap-analysis)
7. [Feasibility & Maintenance Assessment](#7-feasibility--maintenance-assessment)
8. [Critical Technical Considerations](#8-critical-technical-considerations)
9. [Product Vision & Positioning](#9-product-vision--positioning)
10. [IT Infrastructure Recommendations](#10-it-infrastructure-recommendations)
11. [Conclusions & Recommendations](#11-conclusions--recommendations)
12. [Sources](#12-sources)

---

## 1. Executive Summary

The trade show order management software market is fragmented across several overlapping categories: dedicated trade show platforms, wholesale B2B commerce, mobile field sales apps, and POS systems. No single product dominates all segments.

**Key findings:**

- **15+ active competitors** identified across categories, ranging from $12/mo (FooSales) to $7,000+/yr (NuORDER)
- **Offline-first is rare but critical** — only ~6 products offer genuine offline ordering capability
- **No product integrates with Exact Online** — this is a universal gap across the entire market
- **WooCommerce integration is scarce** — only Pepperi offers native B2B integration; FooSales/Jovvie offer POS-level integration
- **The market has clear whitespace** in the intersection of: offline-first + open API + affordable pricing + platform-agnostic integrations
- **Fashion/wholesale platforms** (NuORDER, JOOR, Brandboom) are category-specific and lack offline capability
- **Trade show-specific tools** (Perenso, WizCommerce) are enterprise-focused with opaque pricing
- **A mid-market, offline-first, integration-rich order platform priced at €30-100/mo would have limited direct competition**

### Market Opportunity Rating: **Medium-High**

The opportunity exists, but execution risk is significant for a 2-person tech team. The strongest competitive moat would be in offline-first architecture combined with open, platform-agnostic integrations — the exact area where current solutions are weakest.

---

## 2. Market Landscape

### 2.1 Market Segments

The trade show order management space spans five overlapping segments:

| Segment | Key Players | Price Range | Offline | Trade Show Focus |
|---------|------------|-------------|---------|-----------------|
| **Trade Show Order Mgmt** | Perenso, WizCommerce, Ai2, JT Smith showPRO | Custom ($$$) | Yes | Primary |
| **Wholesale B2B Platforms** | NuORDER, JOOR, Brandboom | $79-$7,000+/yr | Limited | Secondary |
| **Mobile B2B Order Apps** | Pepperi, Onsight, inSitu Sales, Skynamo, RepZio | $25-$500/mo | Yes | Partial |
| **WooCommerce POS** | FooSales, Jovvie, ConnectPOS | $12-$30/mo | Yes | Incidental |
| **Enterprise B2B Commerce** | Shopify B2B, Salesforce B2B | $2,300+/mo | No | No |

### 2.2 Market Size & Trends

- **Global B2B eCommerce:** $19.34 trillion (2024), projected $47.5 trillion by 2030
- **US B2B site-based sales:** $2.3 trillion (2024), growing 10.5% annually
- **Multichannel Order Management Software:** Projected $4.2B market by 2027, 9.4% CAGR
- **B2B buyer behavior:** 70% prefer ordering online over phone/email; 73% willing to spend $50K+ through digital channels; 39% comfortable with self-serve orders over $500K
- Trade show industry recovering post-COVID, with increasing demand for digital order capture
- Trend toward "hybrid shows" — physical events with digital ordering capabilities
- Growing demand for offline-capable tools as trade show WiFi remains notoriously unreliable
- Consolidation happening: Lightspeed acquired NuORDER ($425M, 2021), Advantive acquired Pepperi (2024), Shopify absorbed Handshake
- B2C expectations creeping into B2B: business buyers now expect consumer-grade digital experiences
- 1/3 of B2B companies increased ecommerce investment by 11%+ in 2024

### 2.3 Buyer Personas

1. **Wholesale distributors** running dealer/distributor shows (Perenso, WizCommerce target)
2. **Fashion brands** selling to retailers at market weeks (NuORDER, JOOR, Brandboom target)
3. **Manufacturers/brands** with field sales teams doing trade shows + road sales (Pepperi, Onsight, Skynamo target)
4. **Small/mid brands** at pop-ups, markets, and trade fairs (underserved — current options are either too expensive or too basic)

---

## 3. Competitor Deep-Dive

### 3.1 Trade Show Order Management

#### Perenso

| Attribute | Detail |
|-----------|--------|
| **HQ** | Denver, CO, USA |
| **Founded** | 1994 |
| **Employees** | ~37-40 |
| **Revenue** | ~$4.1-4.6M/yr |
| **Funding** | Bootstrapped |

**Core functionality:**
- All-in-one trade show event software: pre-show, at-show, post-show workflows
- Complex B2B ordering: ordering groups, warehouse availability, product inventory management
- Vendor/broker deal management with tiered pricing (percentage off, fixed, BOGO, rebates)
- Mobile Event App (Perenso Event Explorer, white-label available)
- Interactive show floor maps, registration, lead capture
- Claims to get orders out 2 weeks faster post-show

**Pricing:** Custom/quote-based only. Commerce Show License (per iPad), Cloud Show License (per booth). Implementation fees apply.

**Integrations:** Microsoft Dynamics 365, NetSuite, Salesforce, Sage, Xero, PayPal, Stripe, Tableau, WordPress, Zapier, HubSpot CRM, Dropbox. **No WooCommerce. No Exact Online.**

**Offline:** iPad-based ordering designed for trade show floor use (implies offline but not explicitly documented).

**Technology:** Native iPad/iPhone/Android apps + web platform.

**Assessment:** Strong trade show specialist but enterprise-focused, opaque pricing, no WooCommerce/Exact Online. Targets large distributor shows, not the mid-market.

---

#### WizCommerce

| Attribute | Detail |
|-----------|--------|
| **HQ** | Not disclosed (likely India/US) |
| **Founded** | 2020 |
| **Employees** | ~97 |
| **Revenue** | Not disclosed |
| **Funding** | $13.5M total (Series A: $8M led by Peak XV Partners) |

**Core functionality:**
- AI-first B2B ecommerce platform for wholesale
- Trade show app: badge scanning, lead capture, order taking, inventory check — all offline
- Quick Add badge scanning, QR/barcode/UPC scanning
- POS terminal payment collection on-floor
- AI-powered order recommendations and upselling
- Pre-show order consolidation with live show orders

**Pricing:** Custom/quote-based. Pay-per-event or subscription options. No public pricing.

**Integrations:** 100+ pre-built ERP integrations: NetSuite, QuickBooks, Epicor P21, SAP, Sage Intacct, Fishbowl. WooCommerce mentioned in customer context. **No Exact Online.**

**Offline:** Full offline mode across all devices and operating systems.

**Technology:** Cross-platform web + mobile. Specific stack not publicly disclosed.

**Assessment:** Fast-growing startup with strong trade show focus and genuine offline capability. AI features are a differentiator. But opaque pricing and young company (founded 2020) carry risk. Worth monitoring.

---

#### Ai2 Ordering Solutions

| Attribute | Detail |
|-----------|--------|
| **Focus** | Trade show order taking system |

**Core functionality:**
- Camera-based badge and barcode scanning
- Pre-show order consolidation with live show orders
- Online portal for customer order visibility
- B2B order management mobile app

**Pricing:** Not publicly available.

**Assessment:** Niche trade show player. Limited public information. Not a major competitive threat.

---

#### JT Smith & Associates (showPRO)

**Core functionality:** Full-service trade show automation for wholesale distributor/dealer shows. Cloud-based real-time order processing, badge registration, event app, leads, vendor contracts, deal management. Claims 50% faster order processing.

**Pricing:** Custom/quote-based.

**Assessment:** Service-oriented (not pure SaaS). Targets large distributor shows. Not competing in the self-service mid-market.

---

### 3.2 Wholesale B2B Platforms

#### NuORDER (by Lightspeed)

| Attribute | Detail |
|-----------|--------|
| **HQ** | Los Angeles, CA, USA |
| **Founded** | 2011 |
| **Employees** | ~131-132 |
| **Revenue** | Not disclosed post-acquisition |
| **Funding** | $81.3M pre-acquisition |
| **Acquisition** | Lightspeed Commerce, 2021, $425M |
| **Network** | 3,000+ wholesalers, 150,000+ vetted buyers |

**Core functionality:**
- Global B2B wholesale commerce platform
- Digital linesheets, virtual showrooms, brand discovery for retail buyers
- 24/7 online trade show functionality (virtual)
- 120+ ERP, PLM, and POS integrations

**Pricing:** Starting at ~$7,000/year ($583/mo). Implementation/onboarding fee: ~$7,500+ (sometimes waived). Custom pricing based on volume.

**Integrations:** 120+ ERP/PLM/POS systems. Shopify, WooCommerce (via third-party connectors only). **No Exact Online.**

**Offline:** **No offline mode.** Web/cloud-based only. No native mobile app.

**Technology:** Cloud/web-based platform, mobile-friendly browser interface.

**Assessment:** Strong in fashion wholesale with large buyer network. But expensive, no offline, no native WooCommerce. Not a direct competitor for trade show floor operations.

---

#### JOOR

| Attribute | Detail |
|-----------|--------|
| **HQ** | New York, NY, USA |
| **Founded** | ~2010 |
| **Employees** | ~234 |
| **Revenue** | ~$36.5M/yr |
| **Funding** | $108M total (last round $46M, 2021) |
| **Valuation** | ~$255M (2021) |
| **Network** | 14,000+ brands, 650,000+ buyers, 150+ countries |
| **GMV** | ~$20B/yr in wholesale transactions |

**Core functionality:**
- Leading B2B fashion wholesale platform
- Virtual showrooms with 360-degree imagery and style videos
- JOOR Pay: embedded payments (multi-currency, merchant of record)
- Advanced assortment tool for size allocation
- Connects brands with buyers globally

**Pricing:** User-based pricing (per-user, per-month). Different tiers for smaller vs larger brands. Exact prices not publicly disclosed.

**Integrations:** 100+ ERPs, POS systems, accounting, PLM tools. Shopify (native). WooCommerce (via third-party). **No Exact Online.**

**Offline:** **No offline mode.** Cloud/web-based.

**Technology:** Cloud/web-based, mobile-optimized web.

**Assessment:** Market leader in fashion wholesale by network size. Not relevant for offline trade show order capture. Different market segment entirely.

---

#### Brandboom

| Attribute | Detail |
|-----------|--------|
| **HQ** | Los Angeles, CA, USA |
| **Founded** | 2007 |
| **Employees** | ~32-45 |
| **Revenue** | ~$3.7M/yr |
| **Funding** | $220K (largely self-funded) |

**Core functionality:**
- Digital linesheets and lookbooks creation
- End-to-end order management (Open to Shipped)
- Volume discounts and price breaks
- Brandboom Marketplace for buyer discovery
- Return/refund processing

**Pricing:**
- Free plan: $0 (limited features)
- Startup: $79-99/user/month
- Business: $149-179/user/month
- Marketplace fee: $40-60 flat per order received through marketplace

**Integrations:** Shopify (native, recently overhauled). Stripe, PayPal, Shippo, ApparelMagic. **No WooCommerce. No Exact Online. No major ERP integrations.**

**Offline:** iPad app with offline mode — can present and write orders offline. Requires pre-downloading presentations. Orders saved as drafts, auto-synced on reconnect. iOS 15+ required.

**Technology:** Web platform + native iPad app (touch-optimized).

**Assessment:** Affordable entry point with free plan. iPad offline mode is a plus. But limited integrations, only one user can access account at a time (critical limitation), and fashion-focused. Small, self-funded company.

---

### 3.3 Mobile B2B Order Apps

#### Pepperi (by Advantive)

| Attribute | Detail |
|-----------|--------|
| **HQ** | Tel Aviv, Israel / New York, USA |
| **Founded** | 2012 |
| **Employees** | ~89 |
| **Revenue** | Not disclosed |
| **Funding** | Bootstrapped pre-acquisition |
| **Acquisition** | Advantive, July 2024 |
| **Customers** | 1,000+ in 65-70 countries |

**Core functionality:**
- **Most comprehensive unified B2B commerce platform** in this analysis
- Combines: B2B eCommerce storefront, field sales rep app, route accounting/DSD, merchandising, inside sales
- Dedicated trade show app module with smart search, barcode scanning, payment processing
- Trade promotions management
- Customer-specific catalogues and price lists
- Mobile CRM, retail execution (surveys, planogram, stocktaking)

**Pricing:**
- Platform-level: Pro from $500/month, Corporate from $1,500/month
- Per-user: $25-75/user/month depending on features
- Implementation: $5K-10K (small business) to $50K-100K (enterprise)
- No per-transaction fees for B2B orders

**Integrations:**
- **60+ code-free ERP plugins**: Microsoft Dynamics, SAP, Oracle, NetSuite, Salesforce, Epicor, Sage, MYOB, Xero, QuickBooks
- **Native WooCommerce integration** (built-in, configurable data sync, no third-party needed)
- Shopify, BigCommerce
- "Exact Macola" listed — **NOT Exact Online** (different product)
- Full API available

**Offline:** **Excellent.** Native iOS/Android/Windows apps with full offline functionality. Queues transactions locally, auto-syncs on reconnect. Offline product catalogs, attachments (videos, PDFs), pricing data. **Explicitly designed for trade show use.**

**Technology:** Native apps for iOS, Android, Windows + cloud backend + web admin portal/B2B storefront. iPaaS integration module.

**Barcode scanning:** Built-in camera-based scanning from device camera. Integrated into product pages and order entry.

**Assessment:** **Strongest overall fit** in the current market. Native WooCommerce, full offline, trade show-dedicated. But expensive ($500+/mo + implementation) and missing Exact Online. Post-acquisition direction unclear.

---

#### Onsight

| Attribute | Detail |
|-----------|--------|
| **HQ** | Cape Town, South Africa |
| **Founded** | ~2017+ |
| **Employees** | 11-50 |

**Core functionality:**
- B2B mobile sales app for manufacturers, wholesalers, distributors
- Digital product catalogue with images and descriptions
- Order and quote creation on the go
- Customer self-ordering portal (B2B eCommerce add-on)
- PDF catalogue generation, GPS tracking

**Pricing:**
- Starter: $49.50/user/month (1,000 products, 500 orders/mo)
- Business: $65/user/month (5,000 products, 1,000 orders/mo)
- Integration add-on: $28.50/user/month
- Customer self-ordering: $55 for 10 customers

**Integrations:** QuickBooks Online, Xero, Zoho, NetSuite, SAP Business One, MYOB, Sage 50, Unleashed WMS. REST API available. **No WooCommerce. No Exact Online.**

**Offline:** Full offline mode. Create orders and quotes offline, syncs on reconnect.

**Technology:** Native apps (iOS, Android, Windows tablet) + cloud backend + web admin.

**Barcode scanning:** In-app camera scanner + Bluetooth hardware scanner support (1D barcodes, QR codes).

**Assessment:** Affordable per-user pricing with good offline and barcode support. Lacks WooCommerce and Exact Online — would need API development. Small company.

---

#### inSitu Sales

| Attribute | Detail |
|-----------|--------|
| **HQ** | Los Angeles, CA, USA |
| **Founded** | 2016 |
| **Employees** | ~23-28 |

**Core functionality:**
- All-in-one mobile sales app for field sales, DSD, and order entry
- Route optimization and management
- Real-time inventory tracking
- Mobile invoicing and payment collection (Stripe, Authorize.Net)
- Warehouse inventory management module

**Pricing:**
- Starter B2B eCommerce: $200/mo
- Starter Apps: $200/mo (3 users included, $34.99/extra user)
- Pro: $329/mo (3 users)
- Enterprise: $429/mo (3 users)

**Integrations:** QuickBooks (primary, two-way sync), NetSuite, SAP Business One, Odoo, Epicor, Fishbowl, Xero, ShipStation. **No WooCommerce. No Exact Online.**

**Offline:** Yes. Authenticate/sync once, then full offline. Android: manual sync button. iOS: automatic sync.

**Technology:** Flutter-based cross-platform app (iOS + Android). Cloud backend.

**Barcode scanning:** Built-in camera scanner + external Bluetooth (Socket Mobile, Zebra, Honeywell).

**Assessment:** Good all-rounder with flat pricing model. Flutter app may have some performance limitations. No WooCommerce or Exact Online integration.

---

#### Skynamo

| Attribute | Detail |
|-----------|--------|
| **HQ** | Stellenbosch, South Africa |
| **Founded** | 2012 |
| **Employees** | ~66-94 |
| **Customers** | ~1,000 |

**Core functionality:**
- Field sales app focused on rep productivity and management visibility
- Route planning and GPS tracking (automatic call reports)
- Customizable forms for field data collection
- Sales rep performance KPIs and dashboards
- Customer CRM with activity timeline
- Multiple price lists, contract prices

**Pricing:** $39-$69/user/month depending on users, integrations, features.

**Integrations:** 700+ successful integrations completed. Sage (certified partner), SAP, Acumatica, Xero, QuickBooks. API available. **No WooCommerce. No Exact Online.**

**Offline:** Full offline mode. All functionality accessible offline. Sync on reconnect.

**Technology:** Native iOS + Android apps. Cloud backend + web dashboard.

**Barcode scanning:** Barcode scanning via product page, barcode scanning keyboard support, camera-based QR scanning.

**Assessment:** Strong field sales CRM/management tool. More focused on rep management than pure order taking. Lacks WooCommerce and Exact Online integration.

---

#### RepZio

| Attribute | Detail |
|-----------|--------|
| **HQ** | Jupiter, FL, USA |
| **Founded** | 2010 |
| **Employees** | ~11-21 |
| **Revenue** | ~$1.8-2.1M/yr |

**Core functionality:**
- Mobile sales solution for field reps: product browsing, inventory tracking, order placement
- Barcode scanning (Bluetooth or device camera)
- In-app reports, secure credit card processing
- ShopZio B2B eCommerce marketplace for buyer discovery

**Pricing:**
- RepZio App: $25/user/month
- ShopZio (B2B marketplace): $249/month
- B2B Direct: $300/month

**Integrations:** QuickBooks, Sage, Xero, Salesforce. **No WooCommerce. No Exact Online.**

**Offline:** Full offline mode — view inventory, create presentations, generate reports, carry out inventories offline.

**Technology:** Native iOS app (iPad/iPhone) + web app with offline access. **iOS-only for native app.**

**Barcode scanning:** Bluetooth scanner + device camera support.

**Assessment:** Most affordable option at $25/user/mo with genuine offline. But iOS-only native app, very small company, limited integrations.

---

### 3.4 WooCommerce-Native POS

#### FooSales

| Attribute | Detail |
|-----------|--------|
| **Focus** | WooCommerce POS |

**Core functionality:**
- Native WooCommerce POS with full offline mode
- Dynamic pricing adjustments (override prices, apply discounts per item/cart)
- Inventory sync between online store and POS
- Built for pop-ups, markets, trade shows

**Pricing:** Starting at $12/month; ~$30/month for Stripe/Square payments tier.

**Integrations:** **Direct WooCommerce integration** (native). Stripe, Square for payments.

**Offline:** Full offline mode with auto-sync on reconnection.

**Technology:** Native iOS + Android + web app.

**Assessment:** Cheapest WooCommerce-native option with offline. But it's a POS, not a B2B wholesale ordering tool — lacks customer-specific pricing, volume discounts, complex order workflows. Suitable for B2C-style order taking only.

---

#### Jovvie (by BizSwoop)

| Attribute | Detail |
|-----------|--------|
| **Focus** | WooCommerce POS plugin |

**Core functionality:**
- WooCommerce POS plugin with real-time inventory sync
- Stripe partner (cash, cards, Google/Apple Pay, QR payments)
- Unlimited cashiers and locations

**Pricing:** Free trial; tiered plans (exact pricing not publicly available).

**Integrations:** **Direct WooCommerce integration** (WordPress plugin). Stripe for payments.

**Offline:** Cloud-based with event/offline capabilities mentioned.

**Technology:** Works on laptop, iOS, Android. WordPress plugin.

**Assessment:** Similar to FooSales — WooCommerce POS, not B2B wholesale ordering. Suitable for simple point-of-sale at events.

---

### 3.5 Barcode Scanning SDKs

#### Scandit

| Attribute | Detail |
|-----------|--------|
| **HQ** | Zurich, Switzerland |
| **Founded** | ~2009 |
| **Employees** | 355-550+ |
| **Revenue** | $119.1M (2024) |
| **Funding** | $273M total (Series D at $1B+ valuation, 2022) |
| **Customers** | 1,000+ |

**Core functionality:**
- Enterprise barcode scanning SDK (not an order management app)
- Camera-based smart data capture: turns any smartphone/tablet camera into a scanner
- Scans 1D/2D barcodes, QR codes, text, IDs
- MatrixScan: scan multiple barcodes simultaneously
- AR overlay: augmented reality feedback on scanned items
- ML-enhanced recognition, works on low-end phones

**Pricing:** Custom/quote-based. Three editions (Core, Standard, Advanced). Per-device, per-scan, or annual subscription. Free Community Edition for education.

**Platform support:** Native iOS, Android, Web/PWA, React Native, Flutter, Cordova, Capacitor, Xamarin, .NET, Linux/C.

**Assessment:** Relevant as a technology component if building a custom app. Camera-based scanning matches or exceeds hardware scanner speed/accuracy. Cost only makes sense at scale (hundreds of devices). For a small team, use built-in scanning of the chosen B2B app.

---

## 4. Comparison Matrix

### 4.1 Feature Comparison

| Product | Offline Mode | WooCommerce | Exact Online | Barcode Scan | Trade Show Focus | B2B eCommerce | Native Mobile |
|---------|:----------:|:-----------:|:------------:|:------------:|:---------------:|:-------------:|:------------:|
| **Perenso** | Likely | No | No | Yes | **Primary** | No | Yes (iPad) |
| **WizCommerce** | **Yes** | Mentioned | No | **Yes** | **Primary** | Yes | Yes |
| **Pepperi** | **Yes** | **Native** | No* | Yes (camera) | **Dedicated** | Yes | Yes (iOS/Android/Win) |
| **Onsight** | **Yes** | No (API) | No | Yes (camera+BT) | Partial | Add-on | Yes (iOS/Android/Win) |
| **inSitu Sales** | **Yes** | No | No | Yes (camera+BT) | Partial | Yes | Yes (Flutter) |
| **Skynamo** | **Yes** | No | No | Yes (camera) | Partial | No | Yes (iOS/Android) |
| **RepZio** | **Yes** | No | No | Yes (camera+BT) | Partial | Via ShopZio | iOS only |
| **NuORDER** | No | Via connector | No | No | Virtual only | Yes | No (web) |
| **JOOR** | No | Via connector | No | No | Virtual only | Yes | No (web) |
| **Brandboom** | iPad only | No | No | No | Partial | Yes | iPad only |
| **FooSales** | **Yes** | **Native** | No | No | Incidental | No (POS) | Yes |
| **Jovvie** | Partial | **Native** | No | No | Incidental | No (POS) | Yes |

*Pepperi lists "Exact Macola" — a different product from Exact Online.

### 4.2 Pricing Comparison

| Product | Pricing Model | Starting Price | Cost for ~3 Users | Implementation |
|---------|--------------|---------------|-------------------|----------------|
| **RepZio** | Per user | $25/user/mo | ~$75/mo | None |
| **FooSales** | Flat | $12/mo | $12-30/mo | None |
| **Skynamo** | Per user | $39/user/mo | ~$120-207/mo | Minimal |
| **Onsight** | Per user + add-ons | $49.50/user/mo | ~$150-280/mo | Minimal |
| **Brandboom** | Per user | Free-$179/user/mo | $0-537/mo | None |
| **inSitu Sales** | Flat + extra users | $200/mo | $200-329/mo | Minimal |
| **Pepperi** | Platform + per user | $500/mo (Pro) | $500+/mo | $5K-100K |
| **NuORDER** | Annual | ~$7,000/yr | ~$583/mo | $7,500+ |
| **Perenso** | Custom | Quote required | Unknown | Yes |
| **WizCommerce** | Custom | Quote required | Unknown | Yes |
| **Shopify B2B** | Platform | $2,300/mo | $2,300+/mo | Significant |
| **Salesforce B2B** | Per order | $4/order | Variable | $50K-500K+ |

---

## 5. Review Analysis & User Sentiment

### 5.1 Ratings Overview

**Key observation:** The total public review volume across ALL products is extremely low (~1,800 reviews combined). This indicates a market where buyer decisions are driven by trade show/event operator mandates, direct sales, and industry word-of-mouth — NOT by review-driven comparison shopping.

| Product | App Store | Trustpilot | SourceForge | Total Reviews | Verdict |
|---------|-----------|------------|-------------|:-------------:|---------|
| **Onsight** | 4.78/5 (1,287) | N/A | N/A | ~1,287 | Strong SMB adoption |
| **RepZio** | 4.09/5 (312) | N/A | N/A | ~312 | Solid but dated |
| **inSitu Sales** | 4.55/5 (106) | 3.2/5 (1) | N/A | ~107 | Good app, risky support |
| **Pepperi** | 3.56/5 (27) | N/A | **4.9/5 (29)** | ~56 | Best professional reviews |
| **NuORDER** | 4.45/5 (20) | 2.9/5 (2) | 5.0/5 (1) | ~23 | Network lock-in, not quality |
| **Skynamo** | **2.72/5** (18) | N/A | N/A | ~18 | Serious app quality issues |
| **Brandboom** | 5.0/5 (11) | 4.0/5 (4) | 2.0/5 (1) | ~16 | Mixed across platforms |
| **Perenso** | 4.33/5 (12) | N/A | N/A | ~12 | Too few reviews |
| **JOOR** | N/A | 2.9/5 (3) | **2.3/5 (3)** | ~6 | Terrible independent scores |
| **Shopify B2B** | N/A | 3.2/5 (1) | N/A | ~1 | N/A (part of Shopify) |

### 5.2 Per-Product Review Detail

#### Perenso
- **App Store:** 4.33/5 (12 ratings)
- **Company claims:** 97% customer retention, $1.5B in sales processed, 2x order processing speed
- **Praised:** Speed and simplicity at shows — *"Everyone raves about the speed, accuracy, and simplicity"* (Matt Kirkwood, Gordon Food Service). Minimal learning curve — *"There was no learning curve"* (Eileen Wilmarth, Pet Food Experts). *"Has cut two weeks off the delivery process."*
- **Criticized:** Very limited independent review footprint. Opaque pricing. Niche focus (US food service/convenience).

#### NuORDER
- **App Store:** 4.45/5 (20 ratings). **Trustpilot:** 2.9/5 (both reviews are 1-star)
- **Praised:** Best-in-class visual product presentation — *"Best platform for digitally showcasing product to retailers."* Required for Nordstrom FLS purchasing (strategic lock-in).
- **Criticized:** **Overpriced** — *"Nuorder is way too overprized, arrogant employees and accountmanagers who are absolutely not helpful"* (Trustpilot). **Trade show dissatisfaction** — *"many companies at tradeshow CIFF, all being extremely unhappy with the service NUORDER is offering."* **Damning recommendation:** *"Please do yourself a favor and go work with JOOR or any other B2B system."*

#### JOOR
- **Trustpilot:** 2.9/5 (all 1-star). **SourceForge:** 2.3/5 (3 reviews)
- **Praised (the one positive review):** *"Easy to use, POS integration, retailers seem to favor it above NuOrder."*
- **Criticized:** **Zero ROI for many brands** — *"It delivered nothing...zero sales even after 12 months...a drain on the bank account."* *"NOT ONE SALE...immaculate profile...followed all instructions."* *"Complete waste of time!"* Outdated/dead retailer profiles not cleaned from platform. Self-service limitations (need account rep to modify linesheets).

#### Brandboom
- **App Store:** 5.0/5 (11 ratings). **Trustpilot:** 4.0/5 (4 reviews, all 5-star). **SourceForge:** 2.0/5 (1 very negative review)
- **Praised:** Streamlined wholesale order processing, easy to use, global buyer reach (600,000+ buyers, $7B+ GMV).
- **Criticized:** **Broken import** — *"System works ridiculously with file imports. You can NOT update any product info using import files."* **Inventory not enforced** — *"The product quantity you set doesn't affect the quantity customers can purchase."* 40+ minute support wait times.

#### Pepperi
- **SourceForge:** **4.9/5 (29 reviews)** — highest professional review score. **App Store:** 3.56/5 (27 ratings). **G2:** Momentum Leader + High Performer badges.
- **Praised:** *"Best on the market for Sales Reps"* (Managing Director). *"always available online/offline"* (National Field Manager). *"Incredible speed and flexibility — transformative business impact"* (CFO). *"Very flexible, functional, staff adapt quickly, offline capability, great support since 2013"* (IT Manager). Support rated 4.9/5.
- **Criticized:** Back office occasionally slow. *"Not out-of-box; desired features require additional costs"* (Online Sales Coordinator). Phone experience not optimal (tablet-first design). Trade promotions module inflexible. Occasional full-day outages.

#### Onsight
- **App Store:** **4.78/5 (1,287 ratings)** — highest review count by far, indicating strong SMB adoption.
- **Praised:** Cross-platform (iOS + Android + Windows), offline order creation, visual product catalog.
- **Criticized:** Integration costs extra ($28.50/user/month add-on), product limits on lower tiers, barcode scanning not prominently featured.

#### inSitu Sales
- **App Store:** 4.55/5 (106 ratings). **Trustpilot:** 3.2/5 (1 review, 1-star)
- **Praised:** Comprehensive DSD/route accounting, barcode scanning, mobile invoice printing.
- **Criticized:** **Data loss issues** — *"Lost so much money and data"* (Trustpilot). Missing invoices reported. *"An excel spreadsheet is a better solution than this."*

#### Skynamo
- **App Store:** **2.72/5 (18 ratings)** — lowest App Store rating in category.
- **Praised (marketing):** Field + inside sales + self-service on one platform. Radar AI for customer risk scoring. Works with legacy on-premises ERPs.
- **Criticized:** Very low App Store rating suggests significant app quality issues. No public pricing. Small/regional customer base (primarily South Africa/ANZ).

#### RepZio
- **App Store:** 4.09/5 (312 ratings)
- **Praised:** Built-in barcode generating and scanning. True offline on iOS. Affordable ($25/user/month).
- **Criticized:** iOS-only native app. Now owned by ANDMORE (parent company change creates uncertainty). App appears dated.

#### Other Products
- **OrderLinker:** **DEFUNCT** — domain redirects to GoDaddy "for sale" page
- **OrderPort:** **Wrong category** — winery-specific POS, not trade show ordering

### 5.3 Universal Pain Points (Across All Products)

Based on review mining across G2, Capterra, Trustpilot, SourceForge, and app stores:

1. **Offline mode unreliability** — Even products claiming offline support often have sync issues, data loss on reconnect, or incomplete offline feature sets. Only Pepperi is consistently praised for offline quality.
2. **Integration gaps** — Users consistently report that connecting to their specific ERP/accounting system is either impossible or requires expensive custom work
3. **Pricing opacity & sticker shock** — "Contact sales" pricing frustrates buyers. JOOR and NuORDER draw the harshest criticism for cost vs. value. Even "affordable" options charge extra for integrations.
4. **ROI uncertainty** — Multiple JOOR reviewers report ZERO sales after 12+ months of paying. No product offers performance guarantees or usage-based pricing.
5. **Support quality inconsistency** — NuORDER: "arrogant employees." Brandboom: 40-min wait times. inSitu: lost data. Pepperi is the notable exception (4.9/5 support).
6. **Setup complexity for temp staff** — Trade show tools require significant onboarding that doesn't suit temporary booth workers. Only Perenso explicitly claims "no learning curve."
7. **Mobile UX quality** — Many products have web-based "mobile" interfaces. Pepperi's phone experience is "not optimal" (tablet-first). Skynamo's 2.72 App Store rating indicates serious UX issues.
8. **Platform lock-in** — NuORDER required for Nordstrom. JOOR required by certain fashion weeks. Brands are forced onto platforms by retail partners, not product quality.
9. **No Exact Online support** — Completely absent across the entire market
10. **Barcode scanning as afterthought** — Only RepZio and Pepperi highlight scanning. No product optimizes for the "scan physical sample → build order" workflow.

---

## 6. Gap Analysis

### 6.1 Identified Market Gaps

#### Gap 1: The "Missing Middle" — Affordable, Offline-First, Platform-Agnostic Order Platform

**The whitespace:** Between RepZio at $25/user and enterprise platforms at $500+/month, there is no well-executed product in the €50-150/month range targeting small/mid wholesale brands doing trade shows.

- Pepperi comes closest but starts at $500/mo
- RepZio is affordable ($25/user) but has limited integrations and iOS-only native app
- FooSales is cheap ($12/mo) but is a POS, not B2B ordering

**Opportunity:** A product that offers offline-first B2B ordering at €39-149/mo with modular integrations (WooCommerce, Shopify, Exact Online, QuickBooks, Xero) would have **no direct competitor**.

#### Gap 2: European Market is Entirely Unserved

**The whitespace:** Zero products integrate with Exact Online, Bol.com, or Faire. No product offers EU VAT handling or European marketplace integrations. All products are US-centric with US-centric ERP integrations (QuickBooks, NetSuite, SAP).

**Opportunity:** Native Exact Online integration would be a unique differentiator for the Dutch/Benelux market. Exact Online has ~660,000 customers in the Netherlands alone. A product built for the European wholesale ecosystem (WooCommerce + Exact Online + Bol.com + Faire) would have **zero direct competition**.

#### Gap 3: Quick Setup for Temporary Staff

**The whitespace:** Most trade show tools require significant setup and training. Brands often use temporary staff at trade shows who need to be productive within minutes, not hours.

- Perenso and WizCommerce require dedicated onboarding
- Pepperi has a learning curve for its full platform
- Simple tools (FooSales) lack B2B features

**Opportunity:** A product designed for "zero training" setup — scan a product, select a customer, place an order — that can be taught to temporary booth staff in 5 minutes.

#### Gap 4: Cross-Platform Native Apps with Hardware Scanner Support

**The whitespace:** Most products either have native apps on one platform (RepZio = iOS only) or use web-based/hybrid approaches. Few combine native iOS + Android + hardware Bluetooth scanner support.

- Onsight and inSitu Sales support hardware scanners
- Pepperi is camera-only
- RepZio is iOS-only

**Opportunity:** A truly cross-platform native app with both camera and hardware scanner support.

#### Gap 5: Event-Based Pricing Model

**The whitespace:** Current pricing models are per-user/month or flat monthly. For companies doing 4-6 trade shows per year, paying monthly for a tool used intermittently is wasteful.

**Opportunity:** Pay-per-event or seasonal pricing (e.g., €X per trade show day + €Y base/month for data retention) could appeal to occasional users.

#### Gap 6: Post-Show → Fulfillment Pipeline

**The whitespace:** Getting orders from a trade show into an ERP and then to a 3PL is manual for most brands. Only Perenso claims to cut post-show delivery time. No product offers seamless order→ERP→3PL automation.

**Opportunity:** Automating the post-show pipeline (order capture → Exact Online/ERP → e-fulfilment/3PL) would solve a real pain point, especially for the WooCommerce + Exact Online + e-fulfilment stack.

#### Gap 7: Barcode-First Trade Show Workflow

**The whitespace:** No product optimizes for the specific workflow of: scan physical product sample → add to customer order → apply show-specific pricing → sync to ERP. Barcode scanning is treated as a secondary feature by most platforms.

**Opportunity:** A "scan-first" interface designed around the physical product booth — where the primary interaction is scanning samples rather than browsing a digital catalog — would be genuinely novel.

### 6.2 Integration Gap Detail

| Platform/ERP | # of Products Supporting | Gap Severity |
|-------------|------------------------|--------------|
| **Exact Online** | 0/15 | **Critical** (NL/Benelux market) |
| **Bol.com / Faire** | 0/15 | **High** (for NL/EU brands) |
| **e-fulfilment / 3PL** | 0/15 | **High** (post-show fulfillment) |
| **WooCommerce (native)** | 2/15 (Pepperi, FooSales) | High |
| **Shopify** | 5/15 | Medium |
| **QuickBooks** | 8/15 | Low |
| **SAP** | 5/15 | Medium |
| **Xero** | 6/15 | Medium |

---

## 7. Feasibility & Maintenance Assessment

### 7.1 Technical Complexity

| Component | Complexity | Rationale |
|-----------|-----------|-----------|
| **Offline-first sync** | **High** | Conflict resolution, data consistency, queue management. CRDT or operational transform needed for multi-device scenarios. |
| **Barcode scanning** | **Medium** | Camera-based via ML Kit or Scandit SDK. Hardware BT scanners are simpler (HID keyboard emulation). |
| **Multi-tenant SaaS** | **High** | Data isolation, tenant-aware APIs, separate config per tenant, usage metering. |
| **eCommerce integrations** | **High** | WooCommerce REST API (v3), Shopify Admin API (versioned quarterly), Exact Online REST API. Each requires auth, sync logic, webhook handling, rate limiting. |
| **Payment processing** | **Medium** | Stripe/Mollie integration for in-app payments. PCI DSS considerations. |
| **Mobile apps** | **Medium-High** | Cross-platform native (React Native or Flutter) with offline storage, camera access, BT. |

**Overall technical complexity: HIGH**

### 7.2 Maintenance Burden

| Maintenance Area | Effort | Frequency |
|-----------------|--------|-----------|
| **WooCommerce API changes** | Medium | WooCommerce REST API is relatively stable but WordPress ecosystem updates frequently. Plugin conflicts possible. |
| **Shopify API versioning** | High | Shopify deprecates API versions quarterly. Mandatory migration every 12 months. Breaking changes are common. |
| **Exact Online API** | Medium | Relatively stable REST API. OAuth2 token refresh management. Rate limiting at 60 requests/minute. |
| **Mobile OS updates** | Medium | iOS and Android annual major releases. Camera/BT API changes. App Store review compliance. |
| **Security patches** | Ongoing | Dependencies, SSL certs, OWASP compliance, GDPR. |
| **Infrastructure** | Medium | Database backups, monitoring, scaling, CDN cache invalidation. |

**Key risk for a 2-person team:** The integration maintenance alone (WooCommerce + Shopify + Exact Online + future integrations) could consume 40-60% of one developer's time. This is the primary feasibility concern.

### 7.3 Team & Stack Requirements

**Minimum viable team for a commercial SaaS product:**

| Role | FTE | Notes |
|------|-----|-------|
| Full-stack developer | 1.5-2 | Backend API + frontend + mobile |
| DevOps/infra | 0.25 | CI/CD, monitoring, deployment |
| Product/support | 0.5 | Customer onboarding, support, product decisions |
| **Total** | **2.25-2.75** | Tight for 2-person team |

A 2-person tech team can build an MVP but will struggle to maintain a multi-integration SaaS product long-term without either:
- Narrowing scope (fewer integrations, single platform)
- Outsourcing specific components (e.g., using an iPaaS for integrations)
- Growing the team to 3-4 engineers

### 7.4 Regulatory Considerations

| Area | Requirement | Effort |
|------|------------|--------|
| **GDPR** | Mandatory for EU market. Data processing agreements, right to deletion, data portability, consent management. | Medium — must be designed in from the start. |
| **PCI DSS** | Required if handling payment card data. Can be mostly offloaded to Stripe/Mollie (SAQ-A eligible). | Low if using Stripe/Mollie hosted checkout. |
| **Cookie consent** | ePrivacy Directive compliance for web components. | Low |
| **Data residency** | Some customers may require EU data residency. | Medium — choose EU hosting from day one. |
| **Accessibility** | WCAG 2.1 AA for web interfaces (increasingly required in EU). | Medium |

---

## 8. Critical Technical Considerations

### 8.1 Offline-First Architecture

**The hardest problem to solve well.** This is where most competitors fail or cut corners.

#### Sync Strategy Options

| Strategy | Pros | Cons | Best For |
|----------|------|------|----------|
| **Last-Write-Wins (LWW)** | Simple to implement, predictable | Data loss when concurrent edits happen | Single-user-per-device scenarios |
| **CRDT (Conflict-free Replicated Data Types)** | No conflicts by design, mathematically proven | Complex to implement, larger data payloads, limited operation types | Multi-device, real-time collaboration |
| **Operational Transform (OT)** | Handles concurrent edits well | Requires central server for transformation, complex | Real-time collaborative editing |
| **Event Sourcing + Manual Merge** | Full audit trail, flexible conflict resolution | Requires conflict UI, more storage | Business-critical data where human oversight needed |

**Recommendation:** For trade show order taking, **Last-Write-Wins with conflict detection and flagging** is the pragmatic choice:
- Orders are typically created by one person on one device
- Conflicts are rare but must be detected (not silently resolved)
- Flag conflicts for manual review post-sync rather than blocking the user
- Store full event log for audit trail

#### Offline Storage

- **SQLite** (via SQLCipher for encryption) on mobile devices — proven, fast, supports complex queries
- **IndexedDB** for PWA/web fallback
- **Sync queue**: ordered list of pending operations with retry logic and exponential backoff
- **Data preload**: product catalog, customer list, price lists synced before the trade show (delta sync for updates)

#### Sync Protocol Design

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Device A   │         │  Sync Server  │         │   Device B   │
│  (offline)   │         │   (central)   │         │  (offline)   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ Local SQLite │◄──────►│  PostgreSQL   │◄──────►│ Local SQLite │
│ + Event Log  │  sync  │  + Event Log  │  sync  │ + Event Log  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              WooCommerce  Exact Online  Shopify
              (webhook +   (REST API)   (Admin API)
               REST API)
```

Key sync protocol requirements:
- **Idempotent operations**: every sync operation must be safe to retry
- **Sequence numbers**: monotonically increasing per-device to detect gaps
- **Checksum verification**: detect corruption during transfer
- **Bandwidth-efficient**: delta sync, not full dataset on each connect
- **Background sync**: automatic when connectivity detected, no user action required

### 8.2 Barcode Scanning Architecture

#### Camera-Based (Recommended Primary)

| SDK/Library | License | Platform | Performance | Cost |
|-------------|---------|----------|-------------|------|
| **Google ML Kit Barcode** | Free | Android, iOS | Good | Free |
| **Apple Vision Framework** | Free | iOS only | Excellent | Free |
| **ZXing** | Apache 2.0 | Cross-platform | Good | Free |
| **Scandit** | Commercial | All platforms | Best-in-class | $$$ (quote) |
| **Dynamsoft** | Commercial | All platforms | Very good | $$ |

**Recommendation:** Start with **Google ML Kit** (free, good quality) and **Apple Vision Framework** (iOS). Add Scandit as a premium option later if customers demand higher accuracy.

#### Hardware Scanner Support

Bluetooth HID (Human Interface Device) scanners appear as keyboard input — no special SDK needed. The app receives scanned barcodes as text input events.

Recommended hardware compatibility:
- Socket Mobile CX-series ($300-400) — compact, reliable
- Zebra CS-series — enterprise-grade
- Honeywell Voyager — mid-range

### 8.3 Multi-Tenant SaaS Architecture

```
┌─────────────────────────────────────────────┐
│              API Gateway (Kong/Traefik)       │
│         Rate limiting, auth, routing         │
├─────────────────────────────────────────────┤
│              Application Layer               │
│          (Node.js / Rust / Go)               │
│   ┌─────────┬─────────┬─────────────────┐   │
│   │ Auth &  │  Order  │  Integration    │   │
│   │ Tenant  │ Service │  Service        │   │
│   │ Service │         │  (per-platform) │   │
│   └─────────┴─────────┴─────────────────┘   │
├─────────────────────────────────────────────┤
│              Data Layer                      │
│   Option A: Schema-per-tenant (PostgreSQL)   │
│   Option B: Row-level security (RLS)         │
│   Option C: Database-per-tenant (expensive)  │
│                                              │
│   Recommended: Row-level security (RLS)      │
│   with PostgreSQL — simplest for small team  │
└─────────────────────────────────────────────┘
```

**Data isolation strategy recommendation:** PostgreSQL Row-Level Security (RLS).
- Every table has a `tenant_id` column
- RLS policies enforce data isolation at the database level
- Single database, single schema — simplest to maintain
- Scale to schema-per-tenant only if customer demands it (e.g., compliance)

### 8.4 Integration Architecture

```
┌──────────────────────────────────────────────────────┐
│                Integration Service                    │
├──────────┬──────────┬───────────┬───────────────────┤
│ WooCom.  │ Shopify  │ Exact     │ Future            │
│ Adapter  │ Adapter  │ Online    │ Adapters          │
│          │          │ Adapter   │ (Xero, QB, etc.)  │
├──────────┴──────────┴───────────┴───────────────────┤
│              Adapter Interface (common)               │
│  - syncProducts()                                     │
│  - syncCustomers()                                    │
│  - pushOrder()                                        │
│  - pullInventory()                                    │
│  - handleWebhook()                                    │
├──────────────────────────────────────────────────────┤
│              Queue (Redis/BullMQ or SQS)              │
│  - Retry with exponential backoff                     │
│  - Dead letter queue for failed syncs                 │
│  - Rate limiting per tenant per platform              │
└──────────────────────────────────────────────────────┘
```

Key integration patterns:
- **Webhook-first**: receive real-time updates where available (WooCommerce, Shopify)
- **Polling fallback**: for platforms without webhooks or as reliability backup
- **Idempotency keys**: prevent duplicate order creation on retry
- **Rate limit awareness**: Shopify (2 requests/second), WooCommerce (varies by host), Exact Online (60/minute)
- **Credential management**: OAuth2 refresh token rotation, encrypted storage
- **Circuit breaker pattern**: stop retrying when a platform is down, resume when healthy

### 8.5 Migration from MS Access

**What to preserve:**
- Product/customer data model and relationships
- Business logic (pricing rules, discount structures, customer tiers)
- Barcode mapping logic
- Historical order data (for analysis, not for the new system to depend on)

**What to rebuild:**
- Everything else. MS Access is a prototype environment; the architecture, UI, sync logic, and data layer all need to be purpose-built.

**Migration approach:**
1. Export MS Access data to CSV/JSON
2. Map data model to new schema (PostgreSQL)
3. Build import pipeline for initial data load
4. Run parallel (MS Access + new system) for 1-2 trade shows before cutover
5. Decommission MS Access after validation

---

## 9. Product Vision & Positioning

### 9.1 Positioning Statement

**For B2B brands and wholesalers** who exhibit at trade shows and need to capture orders on the floor, **[Product Name]** is an **offline-first order scanning platform** that syncs seamlessly with your existing eCommerce and ERP stack. Unlike enterprise solutions that cost $500+/month and require weeks of setup, **[Product Name]** is designed to be productive within 5 minutes, priced for small teams, and integrates with the platforms you already use.

### 9.2 Target Market Segmentation

| Segment | Size | Willingness to Pay | Competition | Priority |
|---------|------|-------------------|-------------|----------|
| **B2B brands at trade shows** (primary) | Medium | €50-100/mo | Low (gap) | **P0** |
| **Wholesale field sales reps** | Large | €30-70/user/mo | High (Pepperi, Onsight, etc.) | P1 |
| **Pop-up/market vendors** | Large | €15-30/mo | Medium (POS tools) | P2 |
| **Dutch/Benelux B2B** (Exact Online users) | Medium | €50-100/mo | Very low | **P0** |

### 9.3 Differentiation Strategy

| Differentiator | vs. Enterprise (Pepperi, Perenso) | vs. Affordable (Onsight, RepZio) | vs. POS (FooSales) |
|---------------|----------------------------------|----------------------------------|---------------------|
| **Price** | 5-10x cheaper | Comparable | Slightly higher |
| **Offline-first** | Comparable | Better architecture | Comparable |
| **Setup time** | 10x faster | Comparable | Comparable |
| **Exact Online** | Unique | Unique | Unique |
| **WooCommerce** | Comparable (Pepperi) | Better (native) | Comparable |
| **B2B features** | Simpler | Comparable | Much better |
| **Barcode scanning** | Comparable | Comparable | Better |
| **Multi-platform integrations** | Fewer (initially) | More (initially) | Fewer |

### 9.4 MVP Scope

**Must-have for launch (v1.0):**

1. **Product catalog sync** — pull products from WooCommerce (name, SKU, price, image, barcode)
2. **Customer management** — create/select customers, store company details, assign price tiers
3. **Barcode scanning** — camera-based product lookup + hardware BT scanner support
4. **Order creation** — scan products, adjust quantities, apply discounts, submit order
5. **Offline mode** — full functionality without internet, queue-based sync on reconnect
6. **WooCommerce sync** — push orders to WooCommerce, pull product/inventory updates
7. **Basic admin dashboard** — web-based, order overview, customer list, product management
8. **Cross-platform mobile app** — iOS + Android (React Native or Flutter)

**Should-have for v1.1-1.2:**

9. Exact Online integration (push orders/invoices, pull customer data)
10. PDF order confirmation generation (email to customer from show floor)
11. Multiple price lists per customer segment
12. Event/show management (group orders by trade show)
13. Basic analytics (orders per show, top products, conversion)

**Could-have for v2.0:**

14. Shopify integration
15. B2B self-service portal (customers reorder online)
16. AI-powered product recommendations
17. Multi-language support
18. White-label option

### 9.5 Pricing Strategy

**Recommended: Tiered subscription with event-based option**

| Plan | Price | Includes | Target |
|------|-------|----------|--------|
| **Starter** | €39/mo | 1 user, 500 products, 1 integration (WooCommerce OR Exact Online) | Solo exhibitors |
| **Professional** | €79/mo | 3 users, 2,000 products, 2 integrations, PDF export | Small brands |
| **Business** | €149/mo | 10 users, unlimited products, all integrations, analytics, priority support | Growing brands |
| **Event Pass** | €29/day | 3 users, full features, 30-day data retention | Occasional exhibitors |

**Rationale:**
- Undercuts Pepperi ($500/mo) by 3-6x while covering the mid-market gap
- Event Pass pricing is unique in the market and appeals to occasional trade show exhibitors
- Professional tier at €79/mo is the sweet spot — affordable for small B2B brands, profitable at scale
- Integration-based upsell (additional integrations at €20/mo each) provides expansion revenue

### 9.6 Go-to-Market Considerations

1. **Launch market: Netherlands/Benelux** — Exact Online integration as unique differentiator, local market knowledge
2. **Distribution channels:**
   - WooCommerce plugin directory (free tier or limited version)
   - Exact Online App Center
   - Trade show industry events and associations
   - Content marketing: "How to digitize your trade show ordering" guides
3. **Early adopter strategy:** Offer free/discounted access to 10-20 brands for first 2 trade shows in exchange for feedback and testimonials
4. **Partnership opportunities:**
   - e-fulfilment (3PL partners) — co-marketing to shared customer base
   - Trade show organizers — bundled offering or preferred vendor status
   - Exact Online consultants/partners — referral program
5. **Competitive positioning:** Don't compete with Pepperi/NuORDER on features. Compete on:
   - Speed to value (5-minute setup vs. weeks)
   - Price (€79 vs. $500+)
   - Exact Online integration (unique)
   - Dutch-market understanding

---

## 10. IT Infrastructure Recommendations

This section provides concrete input for a follow-up IT infrastructure plan.

### 10.1 Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile app** | React Native (with Expo) | Cross-platform, large ecosystem, good offline libraries, easier to hire for than Flutter. |
| **Mobile offline DB** | WatermelonDB (on top of SQLite) | Purpose-built for React Native offline-first sync. Handles sync primitives. |
| **Backend API** | Node.js (NestJS framework) or Go | NestJS: TypeScript end-to-end, good structure, active community. Go: better performance, lower memory, but smaller hiring pool. |
| **API style** | REST (OpenAPI spec) + WebSocket for real-time sync | REST for integrations and admin. WebSocket for device sync. GraphQL adds complexity without clear benefit at this scale. |
| **Database** | PostgreSQL 16+ | RLS for multi-tenancy, JSONB for flexible product attributes, excellent ecosystem. |
| **Queue/jobs** | BullMQ (Redis-backed) | Integration sync jobs, webhook processing, email sending. Reliable, dashboard available. |
| **Cache** | Redis | Session store, rate limiting, queue backend, integration token cache. |
| **Object storage** | Cloudflare R2 or S3 | Product images, PDF order confirmations, catalog exports. R2: no egress fees. |
| **Search** | PostgreSQL full-text search (initially) → Meilisearch (later) | Avoid Elasticsearch complexity. pg_trgm + GIN indexes handle product search at trade show scale. |

### 10.2 Hosting & Deployment

| Component | Recommendation | Alternative | Monthly Cost Estimate |
|-----------|---------------|-------------|----------------------|
| **Application hosting** | Fly.io or Railway | AWS ECS, Hetzner VPS + Docker | €30-100/mo |
| **Database** | Neon (serverless PostgreSQL) or Supabase | Self-managed PostgreSQL on Hetzner | €20-50/mo |
| **Redis** | Upstash (serverless) | Self-managed Redis | €10-20/mo |
| **Object storage** | Cloudflare R2 | AWS S3 | €5-15/mo |
| **CDN** | Cloudflare (already in stack) | — | Free-€20/mo |
| **CI/CD** | GitHub Actions | GitLab CI | Free-€20/mo |
| **Monitoring** | Sentry (errors) + Grafana Cloud (metrics) | Self-hosted Grafana + Prometheus | €0-30/mo |
| **Email** | Postmark or Resend | SendGrid | €10-20/mo |
| **DNS/SSL** | Cloudflare (already in stack) | — | Free |
| **Total estimate** | | | **€105-275/mo** |

### 10.3 CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │───►│  Build & │───►│  Deploy  │───►│  Health  │
│  to Git  │    │   Test   │    │ Staging  │    │  Check   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                 ┌────▼────┐
                                                 │ Manual  │
                                                 │ Promote │
                                                 │ to Prod │
                                                 └─────────┘
```

- **Branching:** Trunk-based development with short-lived feature branches
- **Testing:** Unit tests (Jest/Vitest), integration tests (Testcontainers for PostgreSQL), E2E (Detox for mobile)
- **Deploy:** Docker containers, blue-green deployment
- **Mobile:** EAS Build (Expo) for iOS/Android builds, OTA updates for JS-only changes

### 10.4 Security Architecture

| Layer | Measure |
|-------|---------|
| **Authentication** | JWT + refresh tokens (short-lived access tokens: 15 min). OAuth2 for third-party integrations. |
| **Authorization** | RBAC (admin, manager, sales rep). Tenant-scoped at middleware level. |
| **Data at rest** | AES-256 encryption for sensitive fields. SQLCipher for mobile local DB. |
| **Data in transit** | TLS 1.3 everywhere. Certificate pinning on mobile. |
| **API security** | Rate limiting per tenant. CORS whitelist. Input validation (Zod/Joi). |
| **GDPR** | Data processing agreements template. Right-to-deletion API. Data export API. Consent tracking. EU-only hosting. |
| **Secrets management** | Environment variables via hosting platform. No secrets in code/repo. |
| **Dependency scanning** | Dependabot + npm audit / Snyk in CI. |

### 10.5 Monitoring & Observability

| What | Tool | Why |
|------|------|-----|
| **Error tracking** | Sentry | Real-time error alerting, stack traces, release tracking |
| **Application metrics** | Grafana Cloud + Prometheus | API latency, sync success rates, order throughput |
| **Uptime monitoring** | Better Uptime or UptimeRobot | Public status page, alerting |
| **Log aggregation** | Grafana Loki or Logtail | Centralized logs, searchable |
| **Mobile crash reporting** | Sentry (mobile SDK) | Crash-free rate tracking, device-specific issues |

**Key metrics to track:**
- Sync success rate (target: >99.5%)
- Offline queue depth (should trend toward 0 when online)
- API p99 latency (target: <200ms)
- Integration webhook processing time
- Order creation rate per trade show

---

## 11. Conclusions & Recommendations

### 11.1 Should A-Journal Commercialize?

**Conditional yes**, with significant caveats:

**Arguments for:**
- Clear market gap in affordable, offline-first, platform-agnostic trade show ordering
- Exact Online integration would be unique in the entire market
- Existing domain knowledge from running the MS Access tool at trade shows
- Growing market (B2B digitization, trade show tech adoption)
- Mid-market pricing (€39-149/mo) is underserved

**Arguments against:**
- 2-person tech team is insufficient for sustained SaaS development + maintenance
- Integration maintenance burden (WooCommerce + Shopify + Exact Online APIs) is substantial
- Pepperi at $500/mo already covers much of the functionality
- Customer support expectations for SaaS are high
- Mobile app development and maintenance across iOS + Android is ongoing work

### 11.2 Recommended Path

**Option A: Build & Sell (Recommended if team grows to 3-4 developers)**

1. Build MVP targeting WooCommerce + Exact Online users in NL/Benelux
2. Launch at €39-79/mo price point
3. Validate with 20-30 paying customers over 2-3 trade show seasons
4. Expand integrations (Shopify, Xero) based on demand
5. Requires: 1 additional full-stack developer + 0.5 FTE product/support

**Option B: Build for Internal Use, License on Demand**

1. Rebuild MS Access tool as a modern web+mobile app
2. Use it internally for A-Journal trade shows
3. Offer it to partner brands on an informal basis
4. If demand materializes, evaluate Option A
5. Lower risk, lower investment, lower potential return

**Option C: Don't Build — Use Pepperi**

1. Adopt Pepperi ($500/mo) for internal trade show ordering
2. Bridge Exact Online gap with middleware (Combidesk, Make, or custom connector)
3. Focus tech team on core business (PIM, website, operations)
4. Lowest risk, highest ongoing cost, no product asset created

### 11.3 Decision Framework

| Factor | Build (A) | License (B) | Buy Pepperi (C) |
|--------|:---------:|:-----------:|:----------------:|
| **Upfront investment** | €50-80K | €20-30K | €5K (setup) |
| **Monthly cost** | €200-500 (infra) | €100-200 | €500-1,500 |
| **Revenue potential** | High | Low | None |
| **Team requirement** | 3-4 devs | 2 devs | 0.5 dev |
| **Time to market** | 6-9 months | 3-4 months | 1-2 months |
| **Risk** | High | Medium | Low |
| **Strategic value** | Product asset | Internal tool | Vendor dependency |

---

## 12. Sources

### Trade Show Order Management
- [Perenso Trade Show Software](https://www.perenso.com/trade-show-software-for-sales)
- [Perenso Features](https://www.perenso.com/explanation-of-trade-show-features)
- [Perenso Integrations — SourceForge](https://sourceforge.net/software/product/Perenso-Trade-Show/integrations/)
- [Perenso Company Data — GetLatka](https://getlatka.com/companies/perenso.com)
- [Perenso Reviews — Capterra](https://www.capterra.com/p/129651/Perenso/reviews/)
- [WizCommerce Platform](https://wizcommerce.com/)
- [WizCommerce Trade Show App](https://wizcommerce.com/market-solution/)
- [WizCommerce Funding — Entrepreneur](https://www.entrepreneur.com/en-in/news-and-trends/wizcommerce-bags-usd-8-mn-in-series-a-funding-led-by-peak/496302)
- [Ai2 Trade Show System](https://ai2.com/trade-show-order-taking-system/)
- [JT Smith showPRO](https://www.jtsmith.com/showpro.html)

### Wholesale B2B Platforms
- [NuORDER Wholesale Platform](https://www.nuorder.com/wholesale/)
- [NuORDER Pricing — WizCommerce](https://wizcommerce.com/blog/nuorder-pricing/)
- [NuORDER Acquisition — TechCrunch](https://techcrunch.com/2021/06/07/lightspeed-buys-ecwid-for-500m-nuorder-for-425m-in-ongoing-e-commerce-consolidation-play/)
- [JOOR Platform](https://www.joor.com)
- [JOOR Integrations](https://www.joor.com/integration)
- [JOOR Reviews — G2](https://www.g2.com/products/joor/reviews)
- [JOOR Company Data — Growjo](https://growjo.com/company/JOOR)
- [JOOR vs NuORDER — WizCommerce](https://wizcommerce.com/blog/joor-vs-nuorder/)
- [Brandboom Home](https://www.brandboom.com/)
- [Brandboom Pricing — GetApp](https://www.getapp.com/operations-management-software/a/brandboom/)
- [Brandboom Reviews — Capterra](https://www.capterra.com/p/235520/Brandboom/reviews/)
- [Brandboom iPad App Overview](https://support.brandboom.com/brandboom-ipad-app-overview)

### Mobile B2B Order Apps
- [Pepperi Trade Show App](https://www.pepperi.com/trade-show-app/)
- [Pepperi WooCommerce Integration](https://www.pepperi.com/integration/woocommerce/)
- [Pepperi Pricing](https://www.pepperi.com/pricing/)
- [Pepperi Plugin Directory](https://www.pepperi.com/plugin-directory/)
- [Pepperi Acquired by Advantive](https://www.thescxchange.com/articles/10609-advantive-expands-international-footprint-with-acquisition-of-b2b-unified-commerce-leader-pepperi)
- [Onsight Pricing](https://www.onsightapp.com/mobile-sales-app-pricing)
- [Onsight Integrations](https://www.onsightapp.com/integration)
- [Onsight Barcode Guide](https://www.onsightapp.com/blog/buying-guide-bluetooth-barcode-scanners)
- [inSitu Sales Website](https://www.insitusales.com/en/)
- [inSitu Sales Integrations](https://www.insitusales.com/en/integrations/)
- [inSitu Sales Barcode Scanner](https://www.insitusales.com/en/using-a-barcode-scanner/)
- [Skynamo Website](https://skynamo.com/)
- [Skynamo Integrations](https://skynamo.com/mobile-sales-app/integrations/)
- [RepZio Mobile Sales](https://repzio.com/pages/repzio-mobile-sales-rep-software)
- [RepZio Pricing — GetApp](https://www.getapp.com/sales-software/a/repzio/)

### WooCommerce POS
- [FooSales WooCommerce POS](https://www.foosales.com)
- [FooSales Offline Mode](https://www.foosales.com/features/offline-mode/)
- [FooSales Pricing](https://www.foosales.com/pricing/)
- [Jovvie by BizSwoop](https://jovvie.com/)
- [Jovvie Trade Show POS](https://jovvie.com/blog/trade-show-pos/)
- [ConnectPOS WooCommerce](https://www.connectpos.com/woocommerce-pos/)

### Barcode Scanning
- [Scandit Pricing](https://www.scandit.com/pricing/)
- [Scandit Platform Support](https://support.scandit.com/hc/en-us/articles/209726485)
- [Scandit vs Hardware Scanners](https://www.scandit.com/resources/guides/best-barcode-scanner-hardware/)
- [Scandit on TechCrunch](https://techcrunch.com/2022/02/09/scandit-snaps-up-150m-at-a-1b-valuation-for-its-computer-vision-based-data-capture-technology/)

### Enterprise B2B Commerce
- [Shopify Plus Pricing](https://www.shopify.com/plus/pricing)
- [Shopify B2B Help Center](https://help.shopify.com/en/manual/b2b)
- [Salesforce Commerce Pricing](https://www.salesforce.com/commerce/b2b-ecommerce/pricing/)
- [Salesforce B2B Commerce Pricing Breakdown — Litextension](https://litextension.com/blog/salesforce-b2b-commerce-pricing/)

### Market & Industry
- [Best Trade Show Apps 2025/2026 — Eventify](https://eventify.io/blog/best-trade-show-apps)
- [Best Trade Show Apps — WizCommerce](https://wizcommerce.com/blog/best-trade-show-app/)
- [Wholesale Order Management Systems — The Retail Exec](https://theretailexec.com/tools/best-wholesale-order-management-system/)
- [B2B Order App Comparison — Ai2](https://ai2.com/b2b-order-management-mobile-app/)
- [State of B2B on Shopify 2025](https://totalcommerce.partners/blogs/articles/the-state-of-b2b-wholesale-on-shopify-in-2025)

---

*This report was generated through automated web research and analysis. Pricing, features, and company data were current as of March 2026 but may change. Verify critical details directly with vendors before making purchasing or development decisions.*
