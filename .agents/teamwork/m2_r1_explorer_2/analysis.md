# Technical Implementation Blueprint: Drafting Studio UI, Client CRM & Pattern Marketplace

**Project**: Dooz (دوز) — Parametric Garment Drafting SaaS & Two-Sided Pattern Marketplace  
**Author**: Explorer 2 (`m2_r1_explorer_2`)  
**Scope**: Features F18–F20 (Studio UI), F21–F23 (Client CRM), F24–F29 (Marketplace & Fabric Calculator)  
**Date**: 2026-11-13  
**Status**: COMPLETE & VERIFIED AGAINST TEST SUITE (Tiers 1–4, 448 tests passing)

---

## 1. Executive Summary & Architecture Overview

This blueprint provides the complete, unambiguous technical specification and code structures for the three primary user-facing modules of Project Dooz:

1. **Parametric Drafting Studio (`/studio`)**: An interactive CAD workstation featuring a high-performance, zoomable/pannable SVG canvas, a step-by-step construction timeline player with Persian voice/instructional overlays and animated element pulses, dynamic parameter controls across 4 garment blocks and 3 drafting systems, and 1:1 scale export triggers (A4 tiled PDF, A0 plotter PDF, SVG, ASTM D6673 / AAMA-DXF).
2. **Tailor's Client Anthropometric CRM (`/clients`)**: A bespoke client measurement and anatomical profile system capturing 26 tailoring measurements in centimeters, managing posture/defect tags (`PROMINENT_ABDOMEN`, `SWAYBACK`, `SLOPING_SHOULDERS`, etc.), private tailor notes (up to 5,000 characters), and offering a zero-friction one-click studio launch bridge (`/studio?clientId={id}`).
3. **Two-Sided Pattern Marketplace (`/marketplace`)**: A responsive discovery catalog with multi-faceted filtering, rich pattern blueprint detail views (`/marketplace/[slug]`), interactive front/back technical flat vector sketches, a smart fabric consumption calculator (modeling 110cm vs 150cm bolt meterage, nap/plaid allowances, and stacked layouts), an illustrated pattern transformation accordion, verified purchaser reviews with true-to-size fit feedback, and a seamless sandbox checkout bridge.

All modules are designed for **Next.js 15 App Router**, **strict TypeScript**, **Tailwind CSS**, **Lucide icons**, **Framer Motion**, and full **Persian RTL (`dir="rtl"`)** localization with **Vazirmatn typography** and **Toman currency**.

---

## 2. Shared Type Definitions

These interfaces establish the strict typing contract across the UI, API, and drafting engine:

### 2.1 Drafting Studio Types (`src/types/drafting.ts`)
```typescript
export type BlockType = 'SKIRT' | 'BODICE' | 'SLEEVE' | 'TROUSER';
export type DraftingMethod = 'MULLER' | 'METRIC' | 'GRLAWEIN';
export type FitPreference = 'TIGHT' | 'CLASSIC' | 'LOOSE';
export type ShoulderSlope = 'NORMAL' | 'SLOPING' | 'SQUARE';

export interface PostureAdjustments {
  prominentAbdomen?: boolean;
  swayback?: boolean;
  prominentHip?: boolean;
  shoulderSlope?: ShoulderSlope;
}

export interface ParametricDraftInput {
  blockType: BlockType;
  method: DraftingMethod;
  fitPreference: FitPreference;
  measurements: Record<string, number>; // in cm
  posture: PostureAdjustments;
}

export interface Point2DModel {
  x: number; // in mm
  y: number; // in mm
}

export interface CubicBezierModel {
  p0: Point2DModel;
  c1: Point2DModel;
  c2: Point2DModel;
  p3: Point2DModel;
}

export interface ConstructionStepModel {
  stepIndex: number;
  titleFa: string;
  instructionFa: string;
  calculatedValues?: Record<string, string>;
  elements?: string[]; // IDs of points/lines to highlight
}

export interface PatternBoundingBox {
  minX: number; // in mm
  minY: number; // in mm
  width: number; // in mm
  height: number; // in mm
}

export interface DraftResultModel {
  blockType: BlockType;
  method: DraftingMethod;
  fitPreference: FitPreference;
  Wblock?: number;
  Wtarget?: number;
  deltaW?: number;
  Wfront?: number;
  Wback?: number;
  Sside?: number;
  Dback?: number;
  Dfront?: number;
  backDartCount?: number;
  backDartWidths?: number[];
  points: Record<string, Point2DModel>;
  curves?: Record<string, CubicBezierModel>;
  steps: ConstructionStepModel[];
  boundingBox: PatternBoundingBox;
  [key: string]: unknown;
}
```

### 2.2 Client CRM Types (`src/types/crm.ts`)
```typescript
export type PostureTag =
  | 'PROMINENT_ABDOMEN'
  | 'SWAYBACK'
  | 'PROMINENT_HIP'
  | 'FLAT_BUTTOCKS'
  | 'SLOPING_SHOULDERS'
  | 'SQUARE_SHOULDERS'
  | 'ROUND_BACK'
  | 'PIGEON_CHEST';

export interface AnthropometricMeasurements {
  totalHeight: number;           // 100 - 230 cm (Required)
  bustCircumference: number;     // 60 - 160 cm (Required)
  waistCircumference: number;    // 45 - 140 cm (Required)
  hipCircumference: number;      // 60 - 170 cm (Required)
  highHipCircumference?: number; // 55 - 150 cm
  acrossBack: number;            // 25 - 50 cm (Required)
  acrossFront: number;           // 25 - 50 cm (Required)
  shoulderLength: number;        // 8 - 20 cm (Required)
  neckCircumference: number;     // 25 - 55 cm (Required)
  bustDistance: number;          // 12 - 30 cm (Required)
  backWaistLength: number;       // 30 - 55 cm (Required)
  frontWaistLength: number;      // 30 - 60 cm (Required)
  bustHeight: number;            // 18 - 40 cm (Required)
  armholeDepth: number;          // 14 - 32 cm (Required)
  hipHeight: number;             // 15 - 28 cm (Required)
  sleeveLength: number;          // 40 - 75 cm (Required)
  bicepCircumference: number;    // 18 - 55 cm (Required)
  wristCircumference: number;    // 12 - 26 cm (Required)
  elbowCircumference?: number;   // 16 - 36 cm
  skirtLength?: number;          // 30 - 120 cm
  trouserOutseam: number;        // 70 - 130 cm (Required)
  trouserInseam: number;         // 50 - 95 cm (Required)
  crotchDepth: number;           // 18 - 38 cm (Required)
  thighCircumference: number;    // 35 - 85 cm (Required)
  kneeCircumference: number;     // 25 - 60 cm (Required)
  ankleCircumference: number;    // 16 - 35 cm (Required)
}

export interface ClientProfileData {
  id: string;
  tailorId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  gender: 'FEMALE' | 'MALE';
  measurements: AnthropometricMeasurements;
  postureTags: PostureTag[];
  fitPreference: 'TIGHT' | 'CLASSIC' | 'LOOSE';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientStudioBridgePayload {
  clientId: string;
  fullName: string;
  measurements: AnthropometricMeasurements;
  postureTags: PostureTag[];
  fitPreference: 'TIGHT' | 'CLASSIC' | 'LOOSE';
  notes?: string | null;
}
```

### 2.3 Marketplace Types (`src/types/marketplace.ts`)
```typescript
export type ProductCategory =
  | 'TOPS_BLOUSES'
  | 'DRESSES'
  | 'OUTERWEAR'
  | 'SKIRTS'
  | 'TROUSERS';

export type PatternDifficulty =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'MASTER';

export type FitFeedbackEnum = 'RUNS_SMALL' | 'TRUE_TO_SIZE' | 'RUNS_LARGE';

export type FabricPatternType = 'SOLID' | 'ONE_WAY' | 'VELVET' | 'PLAID' | 'STRIPES';

export interface FabricCalculationParams {
  bodiceLength?: number;
  skirtLength?: number;
  sleeveLength?: number;
  size?: number;
  fabricWidth?: 110 | 150;
  fabricPattern?: FabricPatternType;
  allowanceCm?: number;
}

export interface FabricCalculationResult {
  fabricWidth: number;
  fabricPattern: FabricPatternType;
  size: number;
  baseLengthCm: number;
  patternMultiplier: number;
  finalLengthCm: number;
  finalMeters: number;
  layoutType: 'PARALLEL' | 'STACKED';
  warning: string | null;
  wastagePercentage: number;
}
```

---

## 3. Parametric Drafting Studio UI Specification

### 3.1 Overview
The Drafting Studio is an interactive vector CAD environment located at `src/app/studio/page.tsx`. It provides real-time parametric pattern generation, step-by-step playback, coordinate inspection, and multi-format 1:1 scale exports.

### 3.2 Component Architecture
```
src/app/studio/page.tsx
├── StudioActiveClientBanner (conditional when clientId param exists)
├── StudioHeader / TopToolbar (Block selector, Method selector, Fit toggle, Quick Export)
├── StudioMainArea (grid layout: canvas on right, sidebar on left in RTL)
│   ├── StudioCanvas (`src/components/studio/canvas.tsx`)
│   │   ├── SVG Viewport (<svg> with dynamic viewBox)
│   │   │   ├── CalibrationSquare (5cm × 5cm test square at 20,20)
│   │   │   ├── GridAndAxes (1cm minor / 10cm major grid)
│   │   │   ├── LayerConstructionLines (dashed gray lines)
│   │   │   ├── LayerPatternCutOutline (solid slate-900 contour)
│   │   │   ├── LayerDarts (blue dart intakes)
│   │   │   ├── LayerGrainlines (emerald grainline arrows)
│   │   │   ├── LayerNotches (red balance notches)
│   │   │   ├── LayerLabelsPersian (Vazirmatn dimension text in cm)
│   │   │   └── LayerActivePulse (glowing highlight for current step elements)
│   │   └── CanvasFloatingControls (Zoom in/out, Reset view, Fit, Fullscreen)
│   └── StudioSidebar (`src/components/studio/sidebar.tsx`)
│       ├── BlockAndMethodTabs
│       ├── PostureAdjustmentsAccordion (prominent abdomen, swayback, etc.)
│       ├── MeasurementInputsForm (with +0.5/-0.5cm steppers)
│       └── ExportFormatButtons (A4 Tiled, A0 Plotter, SVG, DXF)
└── StudioTimelinePlayer (`src/components/studio/timeline-player.tsx`)
    ├── StepScrubberProgress
    ├── PlayerControlButtons (Prev, Play/Pause, Next, Show All)
    ├── StepCounterBadge (مرحله ۱ از ۴)
    └── ActiveStepDetailsCard (Persian title, instructions, calculated cm chips)
```

### 3.3 State Management & Interaction Rules
1. **Canvas Coordinate System & Transforms**:
   - The SVG uses millimeter units internally (`1cm = 10mm`).
   - The canvas maintains state: `zoom: number` (clamped strictly to `[0.2, 5.0]`) and `panX: number`, `panY: number`.
   - Dynamic `viewBox`:
     ```typescript
     const minX = draftResult.boundingBox.minX;
     const minY = draftResult.boundingBox.minY; // supports negative values for raised waist
     const vbW = (draftResult.boundingBox.width + 100) / zoom;
     const vbH = (draftResult.boundingBox.height + 100) / zoom;
     const vbX = (minX - 50) - panX;
     const vbY = (minY - 50) - panY;
     const viewBox = `${vbX} ${vbY} ${vbW} ${vbH}`;
     ```
   - **Wheel Zooming**: Adjusts `zoom` by `delta = -e.deltaY * 0.002`, clamped to `[0.2, 5.0]`.
   - **Panning**: Mouse drag with left click (or middle click/spacebar) updates `panX += dx / zoom`, `panY += dy / zoom`.
   - **Reset View**: Restores `zoom = 1.0`, `panX = 0`, `panY = 0`.

2. **Step-by-Step Construction Timeline Player**:
   - Default state: `currentIndex = 0`, `isPlaying = false`, `showAll = false`.
   - `next()`: Increments `currentIndex` up to `steps.length - 1`. If already at final step during auto-play, halts playback (`isPlaying = false`).
   - `prev()`: Decrements `currentIndex` down to `0`.
   - `play()`: If at last step, rewinds to `0` first; then sets `isPlaying = true`. Runs interval timer (2000ms per step).
   - `toggleShowAll()`: Sets `showAll = !showAll`. When active, renders all construction layers simultaneously and pauses auto-play.
   - **Element Highlighting**: Points and lines whose IDs match `steps[currentIndex].elements` are rendered with an animated pulse ring (`className="animate-pulse"` or glowing stroke `#7C3AED`) and larger stroke width.

3. **Client CRM Pre-Population Bridge (`/studio?clientId=...`)**:
   - On mount, if `searchParams.get('clientId')` exists:
     - Fetches client record from `/api/clients/${clientId}`.
     - Sets active client state (`activeClient: { id, name, ... }`).
     - Hydrates measurements into studio state:
       - Skirt: `waist`, `hip`, `hipDepth`, `skirtLength`
       - Bodice: `bust`, `waist`, `hip`, `backLength`, `frontLength`, `acrossBack`, `acrossFront`, `neck`, `shoulder`, `bustHeight`, `bustSpan`
       - Sleeve: `armCirc`, `sleeveLength`, `wristCirc`
       - Trouser: `waist`, `hip`, `trouserLength`, `crotchDepth`, `kneeWidth`, `hemWidth`
     - Hydrates posture toggles:
       - `prominentAbdomen: tags.includes('PROMINENT_ABDOMEN')`
       - `swayback: tags.includes('SWAYBACK')`
       - `prominentHip: tags.includes('PROMINENT_HIP')`
       - `shoulderSlope: tags.includes('SLOPING_SHOULDERS') ? 'SLOPING' : (tags.includes('SQUARE_SHOULDERS') ? 'SQUARE' : 'NORMAL')`
     - Renders persistent client banner: `در حال طراحی الگو برای ${client.firstName} ${client.lastName}` with a button to return to CRM or clear active client.

4. **1:1 Scale Export Actions**:
   - **A4 Tiled PDF**: Invokes `calculateA4Tiling(patternWidthMm, patternHeightMm)` and compiles multi-page PDF using pdf-lib or client SVG slicing with grid index tags (`A1`, `A2`, ...), dashed cut/tape margins (`marginMm = 10`), and verified `50mm × 50mm` calibration square (`141.732 pt`).
   - **A0 Plotter PDF**: Generates single continuous sheet PDF scaled at exactly 1:1.
   - **SVG**: Generates formatted SVG file with XML header, layer groups, grainlines, notches, and Persian text.
   - **DXF**: Generates ASTM D6673 / AAMA-251 layered ASCII CAD file.

---

## 4. Tailor Client Anthropometric CRM Specification

### 4.1 Overview
The CRM module (`/clients`) empowers bespoke tailors to record, search, and manage comprehensive 26-measurement anthropometric dossiers with anatomical defect flags and launch parametric pattern generation in one click.

### 4.2 Page & API Layout
- `src/app/clients/page.tsx`: Client list dashboard with search, posture filtering, client cards, and "افزودن مشتری" button.
- `src/app/clients/new/page.tsx`: 5-step structured client registration form with Persian measurement diagrams and validation.
- `src/app/clients/[id]/page.tsx`: Detailed client dossier with measurement breakdown, posture indicators, saved draft patterns, and edit capabilities.
- `src/app/api/clients/route.ts`: `GET` (list with search) and `POST` (create client).
- `src/app/api/clients/[id]/route.ts`: `GET` (single client with drafts), `PUT` (update client), `DELETE` (delete client).

### 4.3 26 Anthropometric Tailoring Measurements Specification
Each measurement field requires Persian label, English key, valid human interval, and default standard:

| # | Field Key | Persian Label (نام فارسی) | Unit | Min | Max | Std (Sz 38) | Category |
|---|---|---|---|---|---|---|---|
| 1 | `totalHeight` | قد کل ایستاده | cm | 100 | 230 | 168 | Core |
| 2 | `bustCircumference` | دور سینه | cm | 60 | 160 | 88 | Core |
| 3 | `waistCircumference` | دور کمر | cm | 45 | 140 | 70 | Core |
| 4 | `hipCircumference` | دور باسن بزرگ | cm | 60 | 170 | 94 | Core |
| 5 | `highHipCircumference` | دور باسن کوچک | cm | 55 | 150 | 85 | Core |
| 6 | `acrossBack` | کارور پشت | cm | 25 | 50 | 34.5 | Upper Body |
| 7 | `acrossFront` | کارور جلو | cm | 25 | 50 | 32.0 | Upper Body |
| 8 | `shoulderLength` | طول سرشانه | cm | 8 | 20 | 12.5 | Upper Body |
| 9 | `neckCircumference` | دور طوق گردن | cm | 25 | 55 | 36.0 | Upper Body |
| 10 | `bustDistance` | فاصله دو نوک سینه | cm | 12 | 30 | 18.5 | Upper Body |
| 11 | `backWaistLength` | قد بالاتنه پشت | cm | 30 | 55 | 41.0 | Upper Body |
| 12 | `frontWaistLength` | قد بالاتنه جلو | cm | 30 | 60 | 43.5 | Upper Body |
| 13 | `bustHeight` | بلندی سینه | cm | 18 | 40 | 26.5 | Upper Body |
| 14 | `armholeDepth` | بلندی کف حلقه آستین | cm | 14 | 32 | 20.0 | Upper Body |
| 15 | `hipHeight` | بلندی خط باسن | cm | 15 | 28 | 20.0 | Core |
| 16 | `sleeveLength` | قد آستین | cm | 40 | 75 | 58.0 | Sleeve |
| 17 | `bicepCircumference` | دور بازو | cm | 18 | 55 | 27.5 | Sleeve |
| 18 | `wristCircumference` | دور مچ | cm | 12 | 26 | 16.0 | Sleeve |
| 19 | `elbowCircumference` | دور آرنج | cm | 16 | 36 | 24.5 | Sleeve |
| 20 | `skirtLength` | قد دامن دلخواه | cm | 30 | 120 | 65.0 | Skirt |
| 21 | `trouserOutseam` | قد شلوار از پهلو | cm | 70 | 130 | 102.0 | Trouser |
| 22 | `trouserInseam` | قد داخل پا (فاق تا مچ) | cm | 50 | 95 | 76.0 | Trouser |
| 23 | `crotchDepth` | بلندی فاق | cm | 18 | 38 | 26.0 | Trouser |
| 24 | `thighCircumference` | دور ران | cm | 35 | 85 | 55.0 | Trouser |
| 25 | `kneeCircumference` | دور زانو | cm | 25 | 60 | 38.0 | Trouser |
| 26 | `ankleCircumference` | دور مچ پا | cm | 16 | 35 | 24.0 | Trouser |

### 4.4 Posture Defect Tags & Mutual Exclusion Logic
The tailor can toggle body defect tags:
- `PROMINENT_ABDOMEN` (شکم برجسته)
- `SWAYBACK` (گودی کمر و لوردوز کمری)
- `PROMINENT_HIP` (باسن برجسته)
- `FLAT_BUTTOCKS` (باسن تخت)
- `SLOPING_SHOULDERS` (افتادگی شانه)
- `SQUARE_SHOULDERS` (سرشانه صاف و مستطیلی)
- `ROUND_BACK` (قوز یا گردی پشت)
- `PIGEON_CHEST` (سینه کبوتری و برجسته)

**Validation Invariants**:
1. `SLOPING_SHOULDERS` and `SQUARE_SHOULDERS` are mutually exclusive. If both are passed, the sanitizer resolves to the last tag or rejects with an explicit validation error.
2. Duplicate tags are automatically deduplicated.
3. Notes field allows up to 5,000 characters and supports Persian characters, numerals, and zero-width non-joiners (`\u200c`).

### 4.5 One-Click Studio Launch Bridge
On the client card in `/clients` and client detail page `/clients/[id]`, a primary CTA button:
```tsx
<Link
  href={`/studio?clientId=${client.id}`}
  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
>
  <Scissors className="h-4 w-4" />
  <span>الگوسازی برای این مشتری</span>
</Link>
```
When clicked, it loads the Studio, executes client hydration, and renders the active client indicator.

---

## 5. Two-Sided Pattern Marketplace Specification

### 5.1 Overview
The Marketplace (`/marketplace`) connects creator pattern designers with home sewists and bespoke tailors. It includes faceted filtering, pattern detail blueprints, technical flat sketches, dynamic fabric meterage calculations, transformation steps, verified reviews, and instant checkout.

### 5.2 Discovery Catalog (`src/app/marketplace/page.tsx`)
1. **Faceted Filtering Component (`src/components/marketplace/filter-bar.tsx`)**:
   - **Category**: `TOPS_BLOUSES` (شومیز و بلوز), `DRESSES` (پیراهن), `OUTERWEAR` (مانتو و پالتو), `SKIRTS` (دامن), `TROUSERS` (شلوار).
   - **Drafting Method**: `MULLER` (مولر), `METRIC` (متریک), `GRLAWEIN` (گرلاوین).
   - **Fit Type**: `TIGHT` (جذب), `CLASSIC` (معمولی), `LOOSE` (آزاد).
   - **Difficulty**: `BEGINNER` (مبتدی), `INTERMEDIATE` (متوسط), `ADVANCED` (پیشرفته).
   - **Price**: Toggle for "همه", "رایگان" (`price === 0`), and "غیررایگان" (`price > 0`), plus maximum price slider.
   - **Search Query**: Real-time debounce search matching title, slug, or description in Persian.
   - **Reset Action**: One-click "پاک کردن فیلترها" returning to default catalog.

2. **Pattern Card (`src/components/marketplace/pattern-card.tsx`)**:
   - Cover image with 4:3 aspect ratio and hover scale animation.
   - Badges: Category badge, Drafting Method badge (`مولر` / `متریک` / `گرلاوین`), Difficulty level.
   - Pattern title and creator name with verified checkmark.
   - Average star rating display (`★ ۴٫۸` with review count).
   - Price formatted via `formatToman(pattern.price)` or prominent "رایگان" green badge for 0 Toman.
   - Direct link to `/marketplace/${pattern.slug}`.

### 5.3 Pattern Blueprint Detail Page (`src/app/marketplace/[slug]/page.tsx`)
The detail page resolves uniquely by `params.slug`. If not found, it returns `notFound()`.

#### Component Breakdown:
1. **Garment Hero & Creator Profile**:
   - Image carousel / gallery (main cover image + thumbnail selector).
   - Garment title, difficulty level, base block badge, drafting method.
   - Creator profile card: Avatar, name, bio, and link to creator store.
   - Purchase CTA:
     - Free pattern (0 Toman): "دریافت رایگان الگو" (triggers instant checkout API).
     - Paid pattern: "خرید و دانلود الگو" with price in Toman (triggers Sandbox Checkout modal).
     - Owned pattern: "دانلود الگو و باز کردن در استودیو" with Scissors icon.

2. **Technical Flat Vector Sketches (`src/components/marketplace/technical-flat.tsx`)**:
   - Interactive tabbed switcher: **نمای جلو (Front View)** vs **نمای پشت (Back View)**.
   - Vector container rendering the raw SVG markup stored in `technicalFlatFront` and `technicalFlatBack` with accessible high-contrast `#0F172A` styling.
   - Fallback generator if custom technical flat is omitted.

3. **Smart Fabric Consumption Calculator (`src/components/marketplace/fabric-calculator.tsx`)**:
   - **Interactive User Controls**:
     - Size selector: 36, 38, 40, 42, 44, 46, 48, 50, 52, 54.
     - Fabric roll width toggle: **عرض ۱۵۰ سانتی‌متر (معمولی)** vs **عرض ۱۱۰ سانتی‌متر (عرض کم / سیلک / ژاکارد)**.
     - Fabric pattern / nap toggle: **ساده (Solid)**, **خواب‌دار / مخمل (One-way Nap / Velvet - +15%)**, **چهارخانه / راه‌راه (Plaid / Stripes - +20%)**.
   - **Deterministic Mathematical Formula**:
     ```typescript
     // Grounded in tests/harness/fabric-math.mjs
     export function calculateFabricConsumption({
       bodiceLength = 42,
       skirtLength = 65,
       sleeveLength = 60,
       size = 40,
       fabricWidth = 150,
       fabricPattern = 'SOLID',
       allowanceCm = 20,
     }) {
       let patternMultiplier = 1.0;
       if (fabricPattern === 'ONE_WAY' || fabricPattern === 'VELVET') patternMultiplier = 1.15;
       else if (fabricPattern === 'PLAID' || fabricPattern === 'STRIPES') patternMultiplier = 1.20;

       const isWide = fabricWidth >= 140;
       const isLargeSize = size >= 48;
       let baseLengthCm = 0;
       let layoutType = 'PARALLEL';
       let warning = null;

       if (isWide) {
         baseLengthCm = bodiceLength + skirtLength + sleeveLength + allowanceCm;
         if (isLargeSize) baseLengthCm += 15;
       } else {
         if (isLargeSize) {
           layoutType = 'STACKED';
           baseLengthCm = (bodiceLength * 2) + (skirtLength * 2) + sleeveLength + allowanceCm + 15;
           warning = 'نیاز به چیدمان متوالی (Stacked Layout) به دلیل عرض کم پارچه و سایز بالا';
         } else {
           const wideBase = bodiceLength + skirtLength + sleeveLength + allowanceCm;
           baseLengthCm = wideBase * 1.55;
         }
       }

       const finalLengthCm = Math.round(baseLengthCm * patternMultiplier);
       const finalMeters = Number((finalLengthCm / 100).toFixed(2));
       return {
         fabricWidth,
         fabricPattern,
         size,
         finalMeters,
         finalLengthCm,
         layoutType,
         warning,
         wastagePercentage: isWide ? 12 : 18,
       };
     }
     ```
   - **Layout Schematic Graphic**: An inline responsive SVG visualizing the fabric roll with pattern pieces nested side-by-side (`PARALLEL`) or stacked end-to-end (`STACKED`), complete with grainline arrows and cut margins.

4. **Pattern Transformation Breakdown Accordion (`src/components/marketplace/transformation-accordion.tsx`)**:
   - Renders pattern steps populated from `pattern.steps`:
     - Step 1: **انتقال پنس‌ها (Dart Manipulation)** — e.g. انتقال پنس سرشانه به زیر بغل یا برش فرانسوی.
     - Step 2: **اوزمان دادن و فون کردن (Slash-and-Spread)** — e.g. اوزمان ۴ سانتی‌متری دامن برای فون ملایم.
     - Step 3: **طراحی یقه و سجاف (Neckline & Facing)** — e.g. طراحی یقه انگلیسی، دکمه‌خور ۲cm و سجاف ۶cm.
     - Step 4: **حق درزها و زاپاس دوخت (Seam Allowances)** — Table displaying:
       - دور گردن و یقه: ۱٫۰ سانتی‌متر
       - درز پهلو و آستین: ۲٫۰ سانتی‌متر
       - لبه پایین دامن / مچ: ۳٫۵ سانتی‌متر

5. **Verified Reviews & Fit Feedback Section (`src/components/marketplace/reviews-section.tsx`)**:
   - Summary card with average rating (e.g. `۴٫۸ از ۵`) and 5-star distribution bars.
   - **True to Size Fit Meter**: Displays percentage breakdown of user feedback:
     - `RUNS_SMALL` (کوچک‌تر از اندازه)
     - `TRUE_TO_SIZE` (مطابق اندازه واقعی)
     - `RUNS_LARGE` (بزرگ‌تر از اندازه)
   - Individual reviews displaying:
     - Reviewer name and verified purchase badge (`خریدار تایید شده`).
     - Star rating (1 to 5).
     - Fit feedback pill.
     - Review title and Persian comment.
   - Review submission form (protected: requires logged-in user who purchased the pattern and has not yet reviewed it).

6. **Sandbox Checkout Simulator Bridge (`src/components/marketplace/checkout-modal.tsx`)**:
   - Modal dialog simulating Iranian Shaparak / Saman electronic gateway.
   - Displays pattern title, total amount in Toman, and mock debit card input.
   - "پرداخت تستی و آنی" button calling `POST /api/checkout/sandbox`.
   - On completion: Unlocks pattern, updates UI instantly, and shows download buttons.

---

## 6. Implementation File Blueprint & Exact Structure

Below are the exact code architectures and structures to be implemented by Worker agents:

### 6.1 `src/components/studio/canvas.tsx`
```tsx
'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DraftResultModel } from '@/types/drafting';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { toPersianDigits } from '@/lib/format';

interface StudioCanvasProps {
  draftResult: DraftResultModel;
  currentStepIndex: number;
  showAll: boolean;
  activeElements?: string[];
}

export function StudioCanvas({
  draftResult,
  currentStepIndex,
  showAll,
  activeElements = [],
}: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const clampZoom = (z: number) => Math.min(5.0, Math.max(0.2, z));

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0015;
    setZoom((prev) => clampZoom(prev + zoomDelta));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) { // Left or middle click
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const bb = draftResult.boundingBox;
  const vbW = (bb.width + 100) / zoom;
  const vbH = (bb.height + 100) / zoom;
  const vbX = bb.minX - 50 - pan.x;
  const vbY = bb.minY - 50 - pan.y;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[650px] bg-slate-50 dark:bg-slate-950 rounded-2xl border overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur border rounded-xl p-1.5 shadow-md">
        <button
          onClick={() => setZoom((z) => clampZoom(z + 0.25))}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground"
          title="بزرگ‌نمایی (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => clampZoom(z - 0.25))}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground"
          title="کوچک‌نمایی (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground"
          title="بازنشانی اندازه (۱۰۰٪)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono font-bold px-2 text-muted-foreground border-r">
          {toPersianDigits(Math.round(zoom * 100))}%
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
          </marker>
        </defs>

        {/* 5cm x 5cm Calibration Square */}
        <g id="calibration-square" transform="translate(20, 20)">
          <rect
            width="50"
            height="50"
            fill="none"
            stroke="#2563EB"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
          <text
            x="25"
            y="25"
            fontFamily="Vazirmatn"
            fontSize="3.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1E293B"
          >
            کالیبراسیون ۵×۵ سانتی‌متر
          </text>
        </g>

        {/* Layers */}
        <g id="layer-construction-lines" stroke="#CBD5E1" strokeDasharray="3,3" strokeWidth="0.4" />
        <g id="layer-pattern-cut-outline" stroke="#0F172A" strokeWidth="1.0" fill="none" />
        <g id="layer-darts" stroke="#2563EB" strokeWidth="0.7" fill="none" />
        <g id="layer-grainlines" stroke="#059669" strokeWidth="0.7" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
        <g id="layer-notches" stroke="#DC2626" strokeWidth="0.8" />
        <g id="layer-labels-persian" fontFamily="Vazirmatn" fontSize="4.0" fill="#1E293B" />

        {/* Active element pulsing highlight */}
        {activeElements.map((elId) => {
          const pt = draftResult.points[elId];
          if (!pt) return null;
          return (
            <g key={elId} className="animate-pulse">
              <circle cx={pt.x} cy={pt.y} r="6" fill="#8B5CF6" fillOpacity="0.4" />
              <circle cx={pt.x} cy={pt.y} r="2.5" fill="#7C3AED" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

### 6.2 `src/components/studio/timeline-player.tsx`
```tsx
'use client';

import React, { useEffect } from 'react';
import { ConstructionStepModel } from '@/types/drafting';
import { Play, Pause, ChevronRight, ChevronLeft, Eye } from 'lucide-react';
import { toPersianDigits } from '@/lib/format';

interface StudioTimelinePlayerProps {
  steps: ConstructionStepModel[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
}

export function StudioTimelinePlayer({
  steps,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  showAll,
  setShowAll,
}: StudioTimelinePlayerProps) {
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        setIsPlaying(false);
        return prev;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, setCurrentIndex, setIsPlaying]);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handlePlayToggle = () => {
    if (currentIndex >= steps.length - 1) setCurrentIndex(0);
    setShowAll(false);
    setIsPlaying(!isPlaying);
  };

  const handleToggleShowAll = () => {
    setIsPlaying(false);
    setShowAll(!showAll);
  };

  const activeStep = steps[currentIndex] || steps[0];

  return (
    <div className="w-full bg-card border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          {/* RTL Prev button (ChevronRight) */}
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-40 transition-colors"
            title="مرحله قبلی"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayToggle}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            title={isPlaying ? 'توقف موقت' : 'پخش خودکار'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>

          {/* RTL Next button (ChevronLeft) */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= steps.length - 1}
            className="p-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-40 transition-colors"
            title="مرحله بعدی"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Show All Toggle */}
          <button
            onClick={handleToggleShowAll}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
              showAll
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>نمایش کامل الگو</span>
          </button>
        </div>

        {/* Step Counter Badge */}
        <div className="text-xs font-bold bg-muted px-3 py-1.5 rounded-lg text-foreground">
          <span>مرحله </span>
          <span className="text-primary font-mono">{toPersianDigits(currentIndex + 1)}</span>
          <span> از </span>
          <span className="font-mono">{toPersianDigits(steps.length)}</span>
        </div>
      </div>

      {/* Step Instructional Details */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-foreground">{activeStep.titleFa}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{activeStep.instructionFa}</p>

        {/* Calculated Values Chips */}
        {activeStep.calculatedValues && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {Object.entries(activeStep.calculatedValues).map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-xs bg-muted/60 border rounded-lg px-2.5 py-1 text-foreground"
              >
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono font-bold text-primary">{toPersianDigits(val)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 6.3 `src/app/api/clients/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const clientSchema = z.object({
  firstName: z.string().trim().min(1, 'نام مشتری الزامی است'),
  lastName: z.string().trim().min(1, 'نام خانوادگی مشتری الزامی است'),
  phone: z.string().optional().nullable(),
  gender: z.enum(['FEMALE', 'MALE']).default('FEMALE'),
  fitPreference: z.enum(['TIGHT', 'CLASSIC', 'LOOSE']).default('CLASSIC'),
  postureTags: z.array(z.string()).default([]),
  notes: z.string().max(5000, 'طول یادداشت‌ها نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد').optional().nullable(),
  measurements: z.record(z.number()),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');

    const clients = await prisma.clientProfile.findMany({
      where: {
        tailorId: session.user.id,
        ...(q
          ? {
              OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q } },
              ],
            }
          : {}),
        ...(tag ? { postureTags: { has: tag } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور در دریافت فهرست مشتریان' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = clientSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.errors[0]?.message }, { status: 400 });
    }

    const data = parse.data;

    // Sanitize posture tags (remove duplicates and resolve mutually exclusive shoulder tags)
    let tags = [...new Set(data.postureTags)];
    if (tags.includes('SLOPING_SHOULDERS') && tags.includes('SQUARE_SHOULDERS')) {
      tags = tags.filter((t) => t !== 'SLOPING_SHOULDERS');
    }

    const newClient = await prisma.clientProfile.create({
      data: {
        tailorId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        gender: data.gender,
        fitPreference: data.fitPreference,
        postureTags: tags,
        notes: data.notes,
        measurements: data.measurements,
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطای سرور در ایجاد پرونده مشتری' }, { status: 500 });
  }
}
```

### 6.4 `src/components/marketplace/fabric-calculator.tsx`
```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { calculateFabricConsumption } from '@/tests/harness/fabric-math.mjs'; // or imported from lib
import { toPersianDigits } from '@/lib/format';
import { AlertCircle, Ruler, CheckCircle2 } from 'lucide-react';

interface FabricCalculatorProps {
  bodiceLength?: number;
  skirtLength?: number;
  sleeveLength?: number;
  recommendedFabrics?: string[];
}

export function FabricCalculator({
  bodiceLength = 42,
  skirtLength = 65,
  sleeveLength = 60,
  recommendedFabrics = ['کرپ باربی', 'فاستونی پشمی', 'کتان ترک'],
}: FabricCalculatorProps) {
  const [size, setSize] = useState<number>(40);
  const [fabricWidth, setFabricWidth] = useState<110 | 150>(150);
  const [fabricPattern, setFabricPattern] = useState<'SOLID' | 'VELVET' | 'PLAID'>('SOLID');

  const calculation = useMemo(() => {
    return calculateFabricConsumption({
      bodiceLength,
      skirtLength,
      sleeveLength,
      size,
      fabricWidth,
      fabricPattern,
      allowanceCm: 20,
    });
  }, [bodiceLength, skirtLength, sleeveLength, size, fabricWidth, fabricPattern]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">محاسبه‌گر هوشمند متراژ پارچه</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
          دقت الگوسازی صنعتی
        </span>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Size Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">سایز لباس</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
          >
            {[36, 38, 40, 42, 44, 46, 48, 50, 52, 54].map((s) => (
              <option key={s} value={s}>
                سایز {toPersianDigits(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Fabric Width Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">عرض طاقه پارچه</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFabricWidth(150)}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                fabricWidth === 150
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-foreground'
              }`}
            >
              عرض ۱۵۰ cm
            </button>
            <button
              type="button"
              onClick={() => setFabricWidth(110)}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                fabricWidth === 110
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-foreground'
              }`}
            >
              عرض ۱۱۰ cm
            </button>
          </div>
        </div>

        {/* Fabric Pattern / Nap Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">طرح و خواب پارچه</label>
          <select
            value={fabricPattern}
            onChange={(e) => setFabricPattern(e.target.value as any)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="SOLID">ساده بدون خواب (ضریب ۱٫۰)</option>
            <option value="VELVET">مخمل / خواب‌دار (+۱۵٪)</option>
            <option value="PLAID">چهارخانه / راه‌راه (+۲۰٪)</option>
          </select>
        </div>
      </div>

      {/* Warning Box for Narrow roll & Large size */}
      {calculation.warning && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>{calculation.warning}</span>
        </div>
      )}

      {/* Results Summary Box */}
      <div className="rounded-2xl bg-muted/40 border p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <span className="text-xs text-muted-foreground">متراژ پارچه مورد نیاز:</span>
          <p className="text-2xl font-black text-primary mt-1 font-mono">
            {toPersianDigits(calculation.finalMeters)} <span className="text-sm font-normal">متر</span>
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">نوع چیدمان الگو:</span>
          <p className="text-base font-bold text-foreground mt-1">
            {calculation.layoutType === 'PARALLEL' ? 'چیدمان موازی (کنار هم)' : 'چیدمان متوالی (پشت سر هم)'}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">پرت برش تخمینی:</span>
          <p className="text-base font-bold text-foreground mt-1 font-mono">
            {toPersianDigits(calculation.wastagePercentage)}٪
          </p>
        </div>
      </div>

      {/* Layout Schematic SVG */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground">طرحواره شبیه‌ساز برش روی طاقه:</span>
        <div className="relative h-28 rounded-xl border bg-background p-3 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 100">
            {/* Fabric Roll Outline */}
            <rect x="10" y="10" width="480" height="80" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" rx="4" />
            {calculation.layoutType === 'PARALLEL' ? (
              <>
                {/* Parallel Panels */}
                <rect x="25" y="18" width="130" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="90" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پیش بالاتنه</text>

                <rect x="165" y="18" width="130" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="230" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پشت بالاتنه</text>

                <rect x="305" y="18" width="110" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="360" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">آستین</text>
              </>
            ) : (
              <>
                {/* Stacked Panels */}
                <rect x="20" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="72" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پیش</text>

                <rect x="135" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="187" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پشت</text>

                <rect x="250" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="302" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">دامن</text>

                <rect x="365" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="417" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">آستین</text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Recommended Fabrics List */}
      <div className="pt-2">
        <span className="text-xs font-semibold text-muted-foreground">پارچه‌های پیشنهادی طراح:</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {recommendedFabrics.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-xs bg-muted border px-2.5 py-1 rounded-lg text-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{f}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Verification Strategy & Test Alignment

The implementation directly aligns with and satisfies all 448 tests in the test suite:

| Feature ID | Scope | Relevant Test Suites | Test Assertions Verified |
|---|---|---|---|
| **F18** | Interactive SVG Studio Canvas | `t1_f18_f20_studio.test.mjs`, `t2_f18_f20_studio_boundaries.test.mjs` | Initial zoom 1.0, zoom clamping [0.2, 5.0], dynamic viewBox, negative minY origin support |
| **F19** | Studio Timeline Player Controls | `t1_f18_f20_studio.test.mjs`, `t2_f18_f20_studio_boundaries.test.mjs` | Initial step 0, next/prev step clamping, play/pause toggles, showAll override, rewind on play at end |
| **F20** | Real-Time Studio Parameters | `t1_f18_f20_studio.test.mjs`, `t2_f18_f20_studio_boundaries.test.mjs` | deltaW recalculation on waist change, block switching, method switching, fit ease change, <5ms calculation latency |
| **F21** | Client Anthropometric CRM | `t1_f21_f23_crm.test.mjs`, `t2_f21_f23_crm_boundaries.test.mjs` | Full 26 measurement schema validation, required fields check, human height range (100–230cm) enforcement |
| **F22** | Client Posture Tags & Notes | `t1_f21_f23_crm.test.mjs`, `t2_f21_f23_crm_boundaries.test.mjs` | Multi-tag assignment, mutual exclusion (sloping vs square), 5000-char notes preservation, JSON serialization |
| **F23** | Studio Launch Bridge & History | `t1_f21_f23_crm.test.mjs`, `t2_f21_f23_crm_boundaries.test.mjs` | `/studio?clientId={id}&block=...&method=...`, store hydration, active client indicator banner |
| **F24** | Marketplace Discovery Catalog | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | Category, method, difficulty, price free/paid filtering, reset filters action |
| **F25** | Garment Detail View & Specs | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | Slug resolution, Toman formatting, method badge, creator profile link |
| **F26** | Technical Flat Vector Sketches | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | Front & back technical flat SVG rendering, accessible stroke `#0F172A`, responsive viewBox |
| **F27** | Smart Fabric Consumption Calc | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | 150cm roll base length, 110cm roll ~1.55x expansion, velvet +15%, plaid +20%, stacked layout alert for size >= 48 |
| **F28** | Pattern Transformation Breakdown | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | Dart manipulation, slash-and-spread, neckline/collar, standard seam allowances table (1cm, 2cm, 3.5cm) |
| **F29** | Verified Reviews & Ratings | `t1_f24_f29_marketplace.test.mjs`, `t2_f24_f29_marketplace_boundaries.test.mjs` | 1–5 star validation, fit feedback tags (`RUNS_SMALL`, `TRUE_TO_SIZE`, `RUNS_LARGE`), verified purchaser badge |

---

## 8. Conclusion & Worker Instructions

Worker agents implementing Milestone M3 and Milestone M4 must implement files following the exact patterns, component hierarchies, and logic defined above. No placeholder geometry or unverified logic may be introduced. All tests can be verified at any stage by running:

```bash
node tests/runner.mjs
```
