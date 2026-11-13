# Project: Dooz (دوز) — Parametric Garment Drafting SaaS & Two-Sided Pattern Marketplace

## Architecture
Dooz is a production-ready, full-stack Next.js 15 (App Router) web application built for immediate deployment on Vercel. It bridges deterministic parametric pattern drafting CAD, a tailor measurement CRM, a two-sided creator marketplace, and AI outfit reverse-engineering into a unified Persian (`fa-IR`) RTL platform.

### High-Level System Architecture
```
                         ┌──────────────────────────────────────────────┐
                         │              Next.js 15 App Router           │
                         │          (Vercel Edge / Serverless)          │
                         └──────────────────────┬───────────────────────┘
                                                │
         ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
         │                  │                   │                   │                  │
         ▼                  ▼                   ▼                   ▼                  ▼
   /studio (R1)       /clients (R2)     /marketplace (R3)     /creator (R4)    /ai-analyzer (R5)
  Interactive SVG    Tailor CRM &       Discovery Catalog     Wizard & Multi-   Gemini Vision &
  Drafting Studio    Measurements       Detail View & Specs   Size Blueprints   Heuristic Engine
  Timeline Player    Posture Flags      Fabric Calculator     Financial Ledger  Drafting Recipe
  1:1 PDF/DXF Export Studio Launch      Sandbox Checkout      Sheba Payouts     Studio Bridge
         │                  │                   │                   │                  │
         └──────────────────┴─────────┬─────────┴───────────────────┴──────────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Data Layer & Security   │
                        │  Prisma ORM (PostgreSQL)  │
                        │   Auth.js (NextAuth v5)   │
                        │   Modular Blob Storage    │
                        │   Vazirmatn RTL Theme     │
                        └───────────────────────────┘
```

### Module Boundaries
1. **Core Platform & Infrastructure**: Auth.js authentication, RBAC (`USER`, `CREATOR`, `ADMIN`), Prisma schema & client, seed data, Vazirmatn RTL design system with Tailwind CSS & Shadcn/UI, modular file storage (Vercel Blob + local fallback).
2. **Parametric Drafting Engine**: Pure TypeScript deterministic math library computing 2D coordinates, Bézier splines, darts, and seam allocations for 4 base blocks (Skirt, Fitted Bodice, Sleeve, Trouser) across Müller, Metric, and Grlawein methods with real-time posture adjustments and 1:1 scale export compilers (A4 tiled PDF, A0 PDF, SVG, ASTM/AAMA-DXF).
3. **Drafting Studio UI & Tailor CRM**: Interactive zoom/pan SVG canvas with construction timeline player and cm annotations, paired with tailor client profile management and studio pre-population bridges.
4. **Marketplace & AI Reverse-Engineering**: Faceted discovery catalog, garment blueprint detail pages, technical flat illustrations, smart fabric consumption calculator, verified reviews, sandbox checkout, and Gemini Vision multimodal reverse-engineering assistant with zero-crash heuristic fallback.
5. **Creator Studio & Financial Ledger**: 5-step pattern wizard (pricing, presets/blueprints, sketches), Recharts earnings telemetry, 80/20 double-entry ledger, and Iranian Sheba/IBAN payout requests with ISO 7064 Mod 97-10 checksum validation.
6. **E2E Testing & Adversarial Hardening**: Independent 4-tier requirement-driven opaque-box test suite (`TEST_READY.md`) followed by white-box adversarial coverage hardening.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Greenfield Next.js 15 & TS Setup | Next.js 15 App Router, strict TypeScript, ESLint, PostCSS | M1 | R6 |
| 2 | Design System & UI Kit | Tailwind CSS, Shadcn/UI primitives, Lucide icons, Framer Motion | M1 | R6 |
| 3 | RTL Persian Typography & Localization | Full `dir="rtl"`, Vazirmatn font, Persian numerals, Toman currency utilities | M1 | R6 |
| 4 | Prisma ORM PostgreSQL Schema | 9 models (`User`, `ClientProfile`, `PatternProduct`, `PatternStep`, `Purchase`, `WalletTransaction`, `PayoutRequest`, `Review`, `SavedDraft`) | M1 | R6 |
| 5 | Comprehensive Database Seeder | `prisma/seed.ts` populating 3 roles, 3 clients with defect tags, 8 complete marketplace patterns | M1 | R6 |
| 6 | Auth.js (NextAuth v5) Setup | Credentials (phone/email + password) & Google OAuth with RBAC | M1 | R6 |
| 7 | Modular Storage Adapter | Unified file upload service for Vercel Blob with local disk fallback | M1 | R6 |
| 8 | Config & Build Baseline | `.env.example`, Next config, typecheck baseline with zero errors | M1 | R6 |
| 9 | Basic Skirt Parametric Engine | Exact 2D math & Bézier curves for Skirt across Müller, Metric, Grlawein | M2 | R1 |
| 10 | Basic Fitted Bodice Engine | Front & back bodice math, armhole curves, waist and bust darts across 3 methods | M2 | R1 |
| 11 | Basic Sleeve Parametric Engine | Sleeve cap curve, bicep ease, wrist tapering, armhole perimeter matching | M2 | R1 |
| 12 | Basic Trouser Parametric Engine | Front/back rise, crotch extensions, crease line/grainline, knee/hem width | M2 | R1 |
| 13 | Posture & Defect Adjustments | Prominent abdomen, swayback, prominent hip, sloping/square shoulders, fit ease | M2 | R1 |
| 14 | Timeline Construction Graph | Ordered point/line sequence with Persian instructions and calculated cm values | M2 | R1 |
| 15 | Tiled A4 PDF Generator | 1:1 scale multi-page printable PDF with grid coordinates, cut margins, and 5cm calibration square | M2 | R1 |
| 16 | Single-Sheet A0 Plotter PDF | 1:1 scale continuous roll plotter PDF export | M2 | R1 |
| 17 | SVG & DXF CAD Exporters | 1:1 raw SVG and ASTM D6673 / AAMA-DXF layered CAD vector files | M2 | R1 |
| 18 | Interactive SVG Studio Canvas | Zoomable/pannable drafting canvas at `/studio` with coordinate transforms | M3 | R1 |
| 19 | Studio Timeline Player Controls | Prev/Next step, Auto-Play, Show All, step counter, active highlight | M3 | R1 |
| 20 | Real-Time Studio Parameters | Sidebar for switching block, method, measurements, posture toggles, and live export | M3 | R1 |
| 21 | Client Anthropometric CRM | Complete CRUD for client anthropometric measurements (`/clients`) with 26 metrics | M3 | R2 |
| 22 | Client Posture Tags & Notes | Anatomical defect tags (`PROMINENT_ABDOMEN`, `SWAYBACK`, etc.) and private tailor notes | M3 | R2 |
| 23 | Studio Launch Bridge & History | One-click button on client profile to launch `/studio?clientId=...`, draft history | M3 | R2 |
| 24 | Marketplace Discovery Catalog | Responsive feed (`/marketplace`) with multi-faceted filtering (category, method, fit, difficulty, price) | M4 | R3 |
| 25 | Garment Detail View & Specs | Pattern blueprint page (`/marketplace/[slug]`) with gallery, metadata, creator profile | M4 | R3 |
| 26 | Technical Flat Vector Sketches | Interactive vector sketches showing front and back views with seamlines & darts | M4 | R3 |
| 27 | Smart Fabric Consumption Calc | Computes required fabric meterage for 110cm & 150cm rolls with layout schematic | M4 | R3 |
| 28 | Pattern Transformation Breakdown | Illustrated breakdown of dart manipulation, slash-and-spread, necklines, seam allowances | M4 | R3 |
| 29 | Verified Reviews & Ratings | 5-star ratings, fit feedback ("true to size", etc.), verified purchaser badge | M4 | R3 |
| 30 | AI Outfit Assistant Upload | File upload & curated gallery at `/ai-analyzer` and `/api/analyze-garment` | M4 | R5 |
| 31 | Gemini Vision & Heuristic Fallback | Multimodal garment extraction with zero-crash structured heuristic fallback | M4 | R5 |
| 32 | AI Studio & Marketplace Deep-Links | Direct links to load recommended base block in `/studio` or view matching patterns | M4 | R5 |
| 33 | 5-Step Pattern Publishing Wizard | Guided publishing wizard at `/creator/new` (details, sizing, sketches, attachments, price) | M5 | R4 |
| 34 | Parametric Presets & Blueprints | Attach parametric rule presets or multi-size graded PDF blueprints | M5 | R4 |
| 35 | Creator Earnings Dashboard | KPI cards (total revenue, net 80%, wallet balance, sales) and Recharts telemetry | M5 | R4 |
| 36 | Double-Entry Financial Ledger | Immutable credit/debit records, 80% creator / 20% platform commission | M5 | R4 |
| 37 | Sheba/IBAN Payout Request System | Iranian Sheba validation via ISO 7064 Mod 97-10, bank code identification, payout states | M5 | R4 |
| 38 | Sandbox Checkout Simulator | Mock Iranian bank payment portal (Saman/Shaparak) for purchasing patterns | M5 | R6 |
| 39 | Full-Stack E2E Test Suite | 100% pass across Tiers 1-4 tests published in `TEST_READY.md` | M6 | Acceptance |
| 40 | Adversarial Coverage Hardening | White-box stress testing, boundary condition verification, zero regressions | M6 | Acceptance |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Platform Core, Data Layer & Auth | Next.js 15, TypeScript, Tailwind/Shadcn, RTL Vazirmatn layout, Prisma 9-model schema, seed data, Auth.js v5, modular storage, .env.example | none | DONE |
| M2 | Parametric Pattern Drafting Core Engine | Deterministic 2D geometry math for 4 blocks (Skirt, Bodice, Sleeve, Trouser) × 3 methods (Müller, Metric, Grlawein) + posture compensations + timeline steps + 1:1 A4/A0 PDF, SVG, DXF exporters | M1 | DONE |
| M3 | Drafting Studio UI & Client CRM | Interactive zoom/pan SVG canvas, timeline player, real-time recalculation, Client CRM CRUD (`/clients`), 26 anthropometric measurements, defect tags, and `/studio?clientId=...` launch bridge | M1, M2 | DONE |
| M4 | Marketplace & AI Outfit Assistant | Marketplace catalog (`/marketplace`), filters, blueprint detail (`/marketplace/[slug]`), technical flat vector sketches, fabric calculator (110cm/150cm), transformation accordion, reviews, AI outfit analyzer (`/ai-analyzer`, `/api/analyze-garment`) with Gemini Vision + heuristic fallback | M1, M2 | DONE |
| M5 | Creator Portal, Monetization & Financial Ledger | Pattern wizard (`/creator/new`), parametric preset/blueprint attachments, earnings dashboard (`/creator/earnings`) with Recharts, 80/20 double-entry ledger, Sheba ISO 7064 payout system, sandbox checkout simulator | M1, M3, M4 | DONE |
| M6 | E2E Testing Pass & Adversarial Hardening | Phase 1: Pass 100% of Tiers 1-4 E2E tests (`TEST_READY.md`). Phase 2: Tier 5 white-box adversarial coverage hardening. | M1, M2, M3, M4, M5 | DONE |

---

## Interface Contracts

### 1. Parametric Drafting Engine (`@/lib/drafting`) ↔ Drafting Studio (`@/app/studio`)
```typescript
export interface ParametricInput {
  blockType: 'SKIRT' | 'BODICE' | 'SLEEVE' | 'TROUSER';
  method: 'MULLER' | 'METRIC' | 'GRLAWEIN';
  measurements: Record<string, number>; // in cm
  postureAdjustments: {
    prominentAbdomen?: boolean;
    swayback?: boolean;
    prominentHip?: boolean;
    shoulderSlope?: 'NORMAL' | 'SLOPING' | 'SQUARE';
  };
  fitPreference: 'TIGHT' | 'CLASSIC' | 'LOOSE';
}

export interface ConstructionStep {
  stepIndex: number;
  titleFa: string;
  instructionFa: string;
  points: { id: string; x: number; y: number; labelFa: string; cmValue?: number }[];
  lines: { fromId: string; toId: string; type: 'CONSTRUCTION' | 'CONTOUR' | 'DART' | 'GRAINLINE' }[];
  curves: { p0: Point; c1: Point; c2: Point; p3: Point; type: 'ARMHOLE' | 'NECK' | 'HIP' | 'CROTCH' }[];
}

export interface PatternGeometry {
  boundingBox: { minX: number; minY: number; width: number; height: number }; // mm
  steps: ConstructionStep[];
  allPoints: Record<string, Point>;
  contours: SVGPathCommand[];
  grainlines: LineSegment[];
  notches: Notch[];
  exportA4Pdf: () => Promise<Uint8Array>;
  exportA0Pdf: () => Promise<Uint8Array>;
  exportSvg: () => string;
  exportDxf: () => string;
}
```

### 2. Client CRM (`@/app/clients`) ↔ Drafting Studio (`@/app/studio`)
```typescript
// Query parameters: /studio?clientId={id}&block={blockType}&method={method}
export interface ClientStudioPayload {
  clientId: string;
  fullName: string;
  measurements: AnthropometricMeasurements;
  postureTags: PostureTag[];
  notes?: string;
}
```

### 3. Marketplace & Creator (`@/app/marketplace`, `@/app/creator`) ↔ Financial Ledger (`@/lib/ledger`)
```typescript
export interface PurchaseTransactionResult {
  purchaseId: string;
  patternId: string;
  buyerId: string;
  totalPriceToman: number;
  creatorEarningsToman: number; // 80%
  platformFeeToman: number;      // 20%
  status: 'COMPLETED' | 'FAILED';
}

export interface PayoutRequestPayload {
  creatorId: string;
  amountToman: number;
  shebaNumber: string; // IR + 24 digits, validated by ISO 7064 Mod 97-10
  accountHolderName: string;
}
```

### 4. AI Outfit Assistant (`@/app/api/analyze-garment`) ↔ Studio / Marketplace
```typescript
export interface GarmentAnalysisResult {
  silhouette: string;
  neckline: string;
  sleeveType: string;
  dartsAndPleats: string[];
  recommendedFabric: {
    nameFa: string;
    weight: string;
    stretch: string;
  };
  recommendedBaseBlock: 'SKIRT' | 'BODICE' | 'SLEEVE' | 'TROUSER';
  recommendedMethod: 'MULLER' | 'METRIC' | 'GRLAWEIN';
  draftingSteps: string[];
  matchingPatternSlugs: string[];
}
```

---

## Code Layout

```
/Users/sotoon/personal/dooz
├── .env.example                     # Sample environment variables
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS theme with RTL & Vazirmatn
├── components.json                  # Shadcn UI configuration
├── prisma/
│   ├── schema.prisma                # Complete 9-model normalized PostgreSQL schema
│   └── seed.ts                      # Seeder for demo accounts, clients, patterns
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root RTL layout with Vazirmatn font & providers
│   │   ├── page.tsx                 # Landing page introducing Dooz
│   │   ├── studio/                  # Parametric Drafting Studio (R1)
│   │   │   ├── page.tsx
│   │   │   └── canvas.tsx
│   │   ├── clients/                 # Tailor Client Measurement CRM (R2)
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   └── new/page.tsx
│   │   ├── marketplace/             # Two-Sided Pattern Marketplace (R3)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── creator/                 # Creator Studio & Monetization (R4)
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── earnings/page.tsx
│   │   ├── ai-analyzer/             # AI Outfit Reverse-Engineering Assistant (R5)
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # Auth.js route handlers
│   │       ├── analyze-garment/     # AI analysis endpoint (Gemini Vision + Heuristic)
│   │       ├── checkout/sandbox/    # Sandbox checkout simulator
│   │       ├── clients/             # CRM API endpoints
│   │       └── payouts/             # Creator payout requests
│   ├── components/
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── studio/                  # Studio SVG canvas, timeline player, toolbar
│   │   ├── marketplace/             # Filter bar, pattern card, fabric calculator
│   │   ├── creator/                 # Publishing wizard steps, Recharts charts
│   │   └── layout/                  # Navbar, footer, sidebar, RTL wrappers
│   ├── lib/
│   │   ├── drafting/                # Parametric Pattern Drafting Engine (M2)
│   │   │   ├── geometry.ts          # 2D points, vectors, cubic Bézier math
│   │   │   ├── skirt.ts             # Müller, Metric, Grlawein Skirt formulas
│   │   │   ├── bodice.ts            # Müller, Metric, Grlawein Bodice formulas
│   │   │   ├── sleeve.ts            # Sleeve cap & ease formulas
│   │   │   ├── trouser.ts           # Trouser, crotch, crease line formulas
│   │   │   ├── posture.ts           # Posture & defect compensation algorithms
│   │   │   ├── export-pdf.ts        # 1:1 scale A4 tiled & A0 PDF export
│   │   │   ├── export-svg.ts        # 1:1 raw SVG export
│   │   │   └── export-dxf.ts        # ASTM D6673 / AAMA-DXF CAD export
│   │   ├── db.ts                    # Prisma Client singleton
│   │   ├── auth.ts                  # Auth.js configuration
│   │   ├── storage.ts               # Modular Vercel Blob / Local storage adapter
│   │   ├── ledger.ts                # Double-entry accounting & Sheba validation
│   │   ├── ai-garment.ts            # Gemini Vision API + Heuristic Fallback
│   │   └── utils.ts                 # RTL, currency formatting, classNames
│   └── types/
│       ├── drafting.ts
│       ├── crm.ts
│       └── marketplace.ts
└── tests/                           # E2E & Integration test suite
    ├── e2e/
    └── harness/
```
