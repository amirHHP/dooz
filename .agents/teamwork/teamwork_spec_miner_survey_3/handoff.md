# Comprehensive Specification Report: Full-Stack Architecture, Client CRM, Marketplace, Creator Portal & AI Assistant (R2-R6)

**Agent**: `teamwork_spec_miner_survey_3`  
**Working Directory**: `/Users/sotoon/personal/dooz/.agents/teamwork/teamwork_spec_miner_survey_3/`  
**Parent Agent ID**: `e3490e94-b5a4-4ca5-a6a5-809108cef8c7`  
**Date**: 2026-11-13  
**Status**: Complete  

---

## 1. Five-Component Handoff Protocol

### 1.1 Observation
- Direct examination of `/Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md` establishes five core full-stack functional pillars beyond the core drafting math (assigned to Survey 2):
  1. **R2: Tailor's Client Measurement CRM (`/clients`)**: Full CRUD anthropometric database, body defect/posture flags, private notes, pattern generation history, and 1-click launch bridge into `/studio`.
  2. **R3: Two-Sided Pattern Marketplace (`/marketplace`, `/marketplace/[slug]`)**: Faceted catalog search (category, drafting method, fit type, difficulty, price), blueprint detail view, technical flat vector drawings (front/back), smart fabric consumption calculator for 110cm and 150cm widths, pattern transformation breakdown (darts, slash-and-spread, necklines, seam allowances), verified reviews, and sandbox purchase flow.
  3. **R4: Creator Studio & Monetization (`/creator`, `/creator/new`, `/creator/earnings`)**: 5-step publishing wizard, dual attachment models (parametric presets vs multi-size blueprint PDFs), Recharts earnings dashboard, double-entry ledger (80% creator / 20% platform fee), and Sheba/IBAN payout request system with ISO 7064 Mod 97-10 checksum validation.
  4. **R5: AI Outfit Reverse-Engineering Assistant (`/ai-analyzer`, `/api/analyze-garment`)**: Gemini Vision API multimodal analyzer with strict JSON schema, robust structured heuristic fallback (when `GEMINI_API_KEY` is omitted or rate-limited), silhouette/neckline/sleeve/dart/fabric analysis, drafting recipes, and matching marketplace patterns.
  5. **R6: Platform Architecture & Infrastructure**: Next.js 15 App Router, strict TypeScript, Tailwind CSS, Shadcn/UI, Lucide icons, Framer Motion, RTL Persian (`fa-IR`) layout with Vazirmatn font and Toman currency formatting, PostgreSQL with Prisma ORM (`prisma/schema.prisma` covering 9 models), rich `prisma/seed.ts` (3 demo users, 3 realistic client profiles with body defect tags, 8 complete marketplace patterns), Auth.js (NextAuth v5), modular storage (Vercel Blob + local fallback), and sandbox checkout simulator.
- Repository root inspection confirmed a greenfield workspace containing only `.agents`, `.git`, and `README.md`. No legacy constraints or conflicting packages exist.

### 1.2 Logic Chain
1. *Requirements to Data Model*: Delivering R2-R6 requires a normalized relational schema with strict foreign keys, transactional integrity, and JSON fields for dynamic tailoring metrics and AI outputs. Prisma ORM on PostgreSQL is specified.
2. *CRM to Studio Data Flow*: Tailor anthropometric records must serialize into deterministic parameters (`measurements`, `postureAdjustments`, `fitPreference`) that the parametric drafting studio (`/studio`) consumes seamlessly via query parameter or session state.
3. *Marketplace Math*: Fabric consumption cannot be a static placeholder; it must deterministically compute linear meterage and cutting layouts for 110cm vs 150cm rolls based on garment dimensions, sleeve length, ease, and grainline orientation.
4. *Ledger Accounting*: E-commerce trust requires double-entry accounting. When a pattern sells, the buyer's purchase atomically creates two ledger transactions: an 80% credit to the creator's wallet balance and a 20% credit to the platform fee account. Payout requests deduct from available wallet balance only when verified by Sheba ISO 7064 checksum rules.
5. *AI Fault Tolerance*: AI-driven features often fail in production due to missing API keys or provider outages. A dual-mode pipeline (Gemini Vision API + structured deterministic heuristic analyzer) guarantees that `/api/analyze-garment` and `/ai-analyzer` always return high-fidelity, schema-valid JSON without 500 errors.
6. *Localization Standard*: Tailoring terminology in Iran has distinct loanwords and French/German origins (کارور, ساسون, اوزمان, بالاتنه, متد مولر, متد گرلاوین). All UI strings, numbers, dates, and currency must be strictly formatted in Persian (`fa-IR`) with Vazirmatn font.

### 1.3 Caveats
- No external payment gateway credentials (e.g. ZarinPal merchant ID) or Vercel Blob tokens are pre-configured in local development. The design specifies sandbox simulators and local filesystem fallbacks as primary development drivers with production environment hooks.
- External Google Gemini API requires a `GEMINI_API_KEY`. If absent, the system transparently falls back to the deterministic pattern recognition engine.

### 1.4 Conclusion
The specifications below provide an exhaustive, production-grade technical blueprint for implementing R2, R3, R4, R5, and R6. Every API route, Prisma model, TypeScript interface, math formula, and UI workflow is documented with zero ambiguity.

### 1.5 Verification Method
- **Schema Validation**: Run `npx prisma validate` and `npx prisma generate` against the specified `prisma/schema.prisma`.
- **Database Seeding**: Run `npx prisma db seed` and verify that 3 users, 3 client profiles, and 8 pattern products are populated.
- **Type Checking**: Run `npm run build` or `npx tsc --noEmit` to verify strict TypeScript adherence.
- **API Functional Tests**: Execute HTTP POST to `/api/analyze-garment` with and without `GEMINI_API_KEY` to verify structured JSON response parity.
- **Ledger Verification**: Execute a sandbox purchase at `/api/checkout/sandbox` and query `WalletTransaction` to confirm an exact 80/20 balance split.
- **Sheba Validation**: Verify valid Iranian Sheba numbers against the ISO 7064 Mod 97-10 algorithm.

---

## 2. Specification Miner Tables

### 2.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | R2: CRM | Client CRUD API & UI | Full management of tailor clients with anthropometric data, defect flags, and contact information. | Client profile payload (name, phone, gender, 26 measurements, posture flags, notes) | Saved `ClientProfile` record, updated list | 400 Bad Request on invalid numeric ranges; 401 Unauthorized for non-tailors | R2 Spec / `ORIGINAL_REQUEST.md` |
| 2 | R2: CRM | Posture & Body Defect Tags | Categorization of anatomical variations (swayback, prominent abdomen, sloping shoulder, etc.) with default delta values. | Tag selections (`SWAYBACK`, `PROMINENT_ABDOMEN`, etc.) | Serialized tags in profile; active toggles in Studio | Unrecognized tags ignored or rejected by Zod schema | R2 Spec / Studio Integration |
| 3 | R2: CRM | Launch Studio Bridge | One-click button on client card/detail to open `/studio` pre-populated with client measurements and posture adjustments. | Client ID | Redirect to `/studio?clientId={id}` with loaded state | If client not found, toast error and redirect to `/clients` | R2 Spec |
| 4 | R2: CRM | Client Pattern History | Tracking and linking previously drafted or exported patterns associated with a specific client. | Client ID, User ID | List of historical `SavedDraft` records with dates and blocks | Empty list displayed if no prior drafts exist | R2 Spec |
| 5 | R3: Marketplace | Discovery Feed & Faceted Filters | Filterable, searchable catalog of garment blueprints with URL state persistence. | Query params: `q`, `category`, `method`, `fit`, `difficulty`, `priceMin`, `priceMax`, `sort`, `page` | Filtered list of `PatternProduct` cards with pagination | Empty state with "الگویی یافت نشد" and filter reset button | R3 Spec |
| 6 | R3: Marketplace | Garment Detail Gallery & Specs | Blueprint detail view with cover carousel, difficulty, method pills, creator bio, and specifications. | Pattern slug | Rendered detail page with full pattern metadata | 404 Not Found if slug does not exist | R3 Spec |
| 7 | R3: Marketplace | Technical Flat Vector Illustrations | Interactive vector sketches showing front and back views with seamlines, topstitching, darts, and annotations. | Vector SVG assets or interactive SVG component | Scalable, zoomable front/back technical flats | Fallback placeholder SVG if custom sketch missing | R3 Spec |
| 8 | R3: Marketplace | Smart Fabric Consumption Calculator | Deterministic calculator estimating required fabric meterage for 110cm vs 150cm fabric rolls and cutting layout. | Selected garment size (36-50 or custom), fabric width (110cm/150cm), fabric pattern type | Required length (meters/cm), wastage percentage, cutting layout schematic | Clamps to minimum safe meterage (e.g., 0.5m) if input corrupted | R3 Spec |
| 9 | R3: Marketplace | Pattern Transformation Breakdown | Illustrated step-by-step breakdown of pattern manipulation (darts, slash-and-spread, collars, seam allowances). | Array of `PatternStep` records for the product | Visual timeline/accordion with technical instructions in Persian | Shows basic blueprint instructions if steps not published | R3 Spec |
| 10 | R3: Marketplace | Verified Reviews & Ratings | User reviews with star rating (1-5), fit feedback ("دقیقاً اندازه بود", etc.), and verified purchaser badge. | Review submission (rating, comment, fit feedback, patternId) | Created `Review`, updated product average rating | Prevents duplicate reviews per purchase; rejects unauthenticated users | R3 Spec |
| 11 | R3: Marketplace | Sandbox Purchase Flow | Mock checkout simulating Iranian banking portal (Saman/Shaparak) for purchasing paid/free patterns. | Pattern ID, User ID, mock gateway response (`SUCCESS` or `CANCEL`) | Created `Purchase`, updated `WalletTransaction` (80/20 split), library unlock | Displays error and reverts transaction if canceled | R3 Spec / R6 Spec |
| 12 | R4: Creator | 5-Step Publishing Wizard | Guided creator form to publish patterns with metadata, sizing, media, attachments, and pricing. | 5-step form data (basics, sizing, media, blueprint/preset attachment, price) | Created `PatternProduct` and associated `PatternStep` records | Multi-step client-side validation prevents progressing with invalid fields | R4 Spec |
| 13 | R4: Creator | Parametric Preset Attachment | Attaching parametric drafting rules (base block + offsets + ease) allowing buyers to customize patterns to custom sizes. | Base block enum, method enum, ease offsets JSON, dart manipulation rules | Stored `parametricConfig` JSON in pattern record | Validated against Parametric Engine schema | R4 Spec |
| 14 | R4: Creator | Multi-Size Blueprint Attachment | Uploading pre-graded PDF files (A4 tiled, A0 plotter) for standard sizes (36 to 48) + instruction booklet. | PDF file buffers or URLs | Stored `blueprintPdfUrl` and size variant records | File type and size validation (max 50MB, PDF only) | R4 Spec |
| 15 | R4: Creator | Earnings Dashboard & KPIs | Real-time financial telemetry showing gross sales, net earnings, wallet balance, and sales volume. | Creator User ID, date range filter | 4 KPI cards, Recharts revenue line/area chart, pattern sales distribution | Zero state with helpful onboarding tips for new creators | R4 Spec |
| 16 | R4: Creator | Double-Entry Transaction Ledger | Financial audit trail recording all credits (sales), platform fees (20%), debits (payouts), and refunds. | Transaction triggers (purchase, payout request) | `WalletTransaction` records with updated `balanceAfter` | Rejects transactions that would cause negative wallet balance | R4 Spec |
| 17 | R4: Creator | Sheba/IBAN Payout Request | Withdrawal flow with Iranian Sheba checksum validation and bank identification. | Requested amount, Sheba number (`IR...`), account holder name | Created `PayoutRequest` in `PENDING` state, deducted wallet balance | Rejects if amount > available balance or Sheba fails Mod 97-10 check | R4 Spec |
| 18 | R5: AI Analyzer | Multimodal Image Upload & Gallery | Garment image ingestion via file drop or pre-loaded Persian/international sample wardrobe gallery. | Image file (JPEG, PNG, WebP) or sample image identifier | Image preview, encoded data payload for analysis | File validation (max 10MB, image MIME type only) | R5 Spec |
| 19 | R5: AI Analyzer | Gemini Vision Multimodal Pipeline | Deep learning reverse-engineering of uploaded garment via Gemini Vision API producing structured JSON. | Garment image base64 + structured Persian prompt | Comprehensive JSON: silhouette, neckline, sleeve, darts, fabric, steps, pattern matches | Automatically switches to Heuristic Fallback if API fails or key absent | R5 Spec |
| 20 | R5: AI Analyzer | Structured Heuristic Fallback Engine | Deterministic fallback analyzer delivering realistic reverse-engineering blueprints when Gemini is unavailable. | Image metadata, aspect ratio, color profile, or sample image preset | Complete JSON matching the identical TypeScript schema as Gemini | Never throws unhandled exception; 100% uptime guaranteed | R5 Spec |
| 21 | R5: AI Analyzer | Studio & Marketplace Integration | Direct buttons to launch `/studio` pre-configured with recommended base block or view matching marketplace patterns. | Reverse-engineering analysis result | Deep-links with query parameters to `/studio` and `/marketplace` | Gracefully hides buttons if no direct match exists | R5 Spec |
| 22 | R6: Platform | Persian RTL Localization & Typography | Full RTL layout (`dir="rtl"`), Vazirmatn font loading, Persian numerals, and Toman currency formatting. | Number, date, or text inputs | RTL rendered layout, `۳۵۰,۰۰۰ تومان`, Persian dates | Standard fallback font (system-ui) if Vazirmatn fails to load | R6 Spec |
| 23 | R6: Platform | PostgreSQL & Prisma ORM Layer | Relational database schema with 9 models, cascading relations, and performance indexes. | Database queries via Prisma Client | Typed query responses | Throws typed Prisma exceptions handled by API route wrappers | R6 Spec |
| 24 | R6: Platform | Comprehensive Seed Dataset | Complete database seeder populating 3 demo roles (tailor, creator, admin), 3 client profiles, and 8 patterns. | Command `npx prisma db seed` | Fully populated database ready for immediate evaluation | Idempotent upserts prevent duplicate key errors on rerun | R6 Spec |
| 25 | R6: Platform | Auth.js (NextAuth v5) Authentication | Secure authentication supporting Credentials (email/phone + bcrypt) and Google OAuth with role claims. | Login credentials or OAuth token | JWT session with `id`, `email`, `role` (`USER`, `CREATOR`, `ADMIN`) | 401 Unauthorized for invalid credentials; redirect to login | R6 Spec |
| 26 | R6: Platform | Modular Storage Adapter | Unified file upload service supporting Vercel Blob with transparent fallback to local disk. | File buffer, target filename, folder | Public accessible URL for uploaded asset | Falls back to local filesystem if `BLOB_READ_WRITE_TOKEN` missing | R6 Spec |

---

### 2.2 Edge Cases Matrix

| # | Feature | Input / Condition | Observed / Required Behavior |
|---|---------|-------------------|------------------------------|
| 1 | R2: CRM | Client height < 100cm or > 230cm | Zod schema validation flags error: "قد باید بین ۱۰۰ تا ۲۳۰ سانتی‌متر باشد". Save button disabled. |
| 2 | R2: CRM | Waist circumference exceeds hip circumference (extreme prominent abdomen) | Studio launch bridge applies prominent abdomen wedge adjustment to front waist and expands dart allowance. |
| 3 | R2: CRM | Client has conflicting posture tags (e.g. Sloping + Square shoulders) | UI switches to radio group for mutually exclusive tags (Sloping vs Square; Swayback vs Flat back). |
| 4 | R2: CRM | Deleting client profile with existing pattern drafts | Cascade soft-delete or nullify `clientId` on `SavedDraft` so historical tailor drafts are preserved. |
| 5 | R3: Marketplace | Filter combination yields 0 results | Shows Persian empty state with active filter tags and one-click "پاک کردن تمام فیلترها" (Clear all filters) button. |
| 6 | R3: Marketplace | Free pattern checkout (price = 0 Toman) | Bypasses payment gateway; instantly creates `Purchase` with status `COMPLETED`, adds to library without wallet transaction. |
| 7 | R3: Marketplace | Fabric consumption for size 50+ on 110cm roll | Calculator detects bodice and skirt cannot cross-cut; switches to stacked layout and flags "نیاز به دو برابر قد پارچه". |
| 8 | R3: Marketplace | User attempts to review pattern they did not buy | Review form hidden; displays message "تنها خریداران تایید شده این الگو می‌توانند نظر ثبت کنند". |
| 9 | R3: Marketplace | User submits multiple reviews for same purchase | Enforces unique constraint on `(userId, patternId)` in Prisma; updates existing review instead of duplicating. |
| 10 | R4: Creator | Creator requests payout exceeding wallet balance | Server action rejects request: "مبلغ درخواستی بیشتر از موجودی قابل تسویه است" (400 Bad Request). |
| 11 | R4: Creator | Invalid Iranian Sheba (incorrect checksum or non-IR prefix) | ISO 7064 Mod 97-10 client & server validator rejects: "شماره شبا وارد شده نامعتبر است". |
| 12 | R4: Creator | Payout request below minimum threshold (< 100,000 Toman) | Validation error: "حداقل مبلغ قابل تسویه ۱۰۰,۰۰۰ تومان می‌باشد". |
| 13 | R4: Creator | Creator uploads huge image (> 10MB) or non-PDF blueprint | Modular storage adapter validates MIME type and file size, rejecting with clear Persian error message. |
| 14 | R5: AI Analyzer | `GEMINI_API_KEY` environment variable missing or empty | Transparently invokes structured heuristic engine; returns 200 OK with valid reverse-engineering data. |
| 15 | R5: AI Analyzer | Gemini Vision returns malformed or incomplete JSON | Response validator catches JSON parsing error and triggers heuristic fallback synthesizer to ensure schema compliance. |
| 16 | R5: AI Analyzer | Uploaded image contains multiple garments or non-clothing item | Heuristic analyzer detects bounding context or returns "لباس عمومی زنانه" with moderate confidence score (0.65). |
| 17 | R6: Platform | Concurrent purchases of the same pattern by same user | Prisma transaction with unique index on `(userId, patternId)` prevents double charging; returns existing purchase. |
| 18 | R6: Platform | Database offline during local development | Prisma Client throws connection error; API routes return standard Persian service-unavailable JSON error format. |
| 19 | R6: Platform | User enters Persian numerals (۱۲۳۴۵۶) in phone or measurement fields | Input sanitizer converts Persian/Arabic numerals to ASCII digits (`123456`) before numeric parsing and Zod validation. |

---

## 3. Detailed Specifications by Requirement

### 3.1 R2: Tailor's Client Measurement CRM (`/clients`)

#### 3.1.1 Anthropometric Data Schema
The tailor CRM captures 26 key body measurements essential for drafting garments across Müller, Metric, and Grlawein methodologies.

```typescript
export interface AnthropometricMeasurements {
  // 1. Basic & Height Metrics (سانتی‌متر)
  totalHeight: number;            // قد کل (120 - 220 cm)
  bustCircumference: number;      // دور سینه (70 - 150 cm)
  waistCircumference: number;     // دور کمر (50 - 140 cm)
  hipCircumference: number;       // دور باسن بزرگ (75 - 160 cm)
  highHipCircumference?: number;  // دور باسن کوچک / شکم (70 - 150 cm)

  // 2. Torso & Bodice Widths (سانتی‌متر)
  acrossBack: number;             // کارور پشت (28 - 50 cm)
  acrossFront: number;            // کارور جلو (26 - 48 cm)
  shoulderLength: number;         // طول سرشانه (10 - 18 cm)
  neckCircumference: number;      // دور گردن (30 - 50 cm)
  bustDistance: number;           // فاصله سینه / بین دو برجستگی (14 - 26 cm)

  // 3. Vertical Torso Lengths (سانتی‌متر)
  backWaistLength: number;        // قد بالاتنه پشت (34 - 52 cm)
  frontWaistLength: number;       // قد بالاتنه جلو (36 - 56 cm)
  bustHeight: number;             // بلندی سینه / از سرشانه تا نوک سینه (20 - 38 cm)
  armholeDepth: number;           // بلندی کف حلقه آستین (16 - 28 cm)
  hipHeight: number;              // بلندی باسن / از خط کمر تا باسن بزرگ (16 - 26 cm)

  // 4. Arms & Sleeves (سانتی‌متر)
  sleeveLength: number;           // قد آستین (45 - 72 cm)
  bicepCircumference: number;     // دور بازو (20 - 50 cm)
  wristCircumference: number;     // دور مچ (13 - 26 cm)
  elbowCircumference?: number;    // دور آرنج (20 - 38 cm)

  // 5. Lower Body & Trousers (سانتی‌متر)
  skirtLength?: number;           // قد دامن دلخواه (40 - 115 cm)
  trouserOutseam: number;         // قد شلوار از خط پهلو تا زمین (90 - 125 cm)
  trouserInseam: number;          // قد داخل پای شلوار (65 - 95 cm)
  crotchDepth: number;            // بلندی فاق / خط نشست (22 - 36 cm)
  thighCircumference: number;     // دور ران (40 - 85 cm)
  kneeCircumference: number;      // دور زانو (30 - 55 cm)
  ankleCircumference: number;     // دور دمپای شلوار (20 - 45 cm)
}
```

#### 3.1.2 Posture & Anatomical Defect Irregularities
Tailors classify client postures to trigger automatic geometric compensation in the parametric studio:

| Tag Identifier | Persian Name | Anatomical Definition | Mathematical Offset in Studio |
|----------------|--------------|-----------------------|--------------------------------|
| `PROMINENT_ABDOMEN` | شکم برجسته | Front abdomen protrudes beyond the vertical line of the bust. | Front waist raised by `+1.0` to `+2.0 cm`; front center length expanded; side dart redistributed forward. |
| `SWAYBACK` | گودی کمر | Deep lumbar lordosis causing back hem to hike up. | Center-back waist suppressed by `+1.5 cm`; back waist dart depth increased by `+1.0 cm`; center-back seam slanted. |
| `PROMINENT_HIP` | باسن برجسته | Gluteal projection exceeds standard hip slope. | Back hip arc increased by `+1.5 cm`; back dart length extended by `+2.0 cm` towards apex. |
| `FLAT_BUTTOCKS` | باسن صاف | Minimal gluteal curvature. | Back hip arc reduced by `-1.0 cm`; back dart intake decreased. |
| `SLOPING_SHOULDERS` | افتادگی شانه | Shoulder angle > 24° from horizontal. | Shoulder point dropped by `1.0` to `1.5 cm` at armhole edge; scye depth adjusted downward. |
| `SQUARE_SHOULDERS` | شانه مربعی | Shoulder angle < 16° from horizontal. | Shoulder point raised by `+1.0 cm` at armhole edge; scye depth raised. |
| `ROUND_BACK` | قوز پشت / گوژپشتی | Thoracic kyphosis. | Back width (`acrossBack`) increased by `+1.0 cm`; back center seam curved outwards; back waist length increased. |
| `PIGEON_CHEST` | سینه کفتری | Protruding sternum. | Front chest width (`acrossFront`) increased; front dart intake widened. |

#### 3.1.3 Fit Preferences
Stored per client to set default ease allowances:
- `TIGHT` (جذب): 0 to 2 cm total bust ease; form-fitting silhouette.
- `CLASSIC` (معمولی / استاندارد): 4 to 6 cm total bust ease; comfortable everyday movement.
- `LOOSE` (آزاد / اورسایز): 8 to 12 cm total bust ease; modest or relaxed fit.

#### 3.1.4 Launch Studio Integration Contract
The `/clients` view provides a direct action button: **«الگوکشی برای این مشتری»**.
- **Action**: Navigates to `/studio?clientId={client.id}`.
- **State Hydration**:
  When `/studio` detects `clientId` in query parameters:
  1. It fetches the client record via `/api/clients/[id]`.
  2. It hydrates the Studio's state store (Zustand or React Context) with:
     - `measurements: client.measurements`
     - `postureAdjustments: client.postureTags`
     - `fitPreference: client.fitPreference`
     - `activeClient: { id: client.id, name: `${client.firstName} ${client.lastName}` }`
  3. The studio displays an active client indicator banner: *"در حال طراحی الگو برای سارا محمدی"* with a quick switch button.

---

### 3.2 R3: Two-Sided Pattern Marketplace (`/marketplace`, `/marketplace/[slug]`)

#### 3.2.1 Responsive Discovery Feed & Faceted Filters (`/marketplace`)
- **URL Query Schema**:
  `?q={search}&category={cat}&method={method}&fit={fit}&difficulty={diff}&minPrice={min}&maxPrice={max}&sort={sort}&page={page}`
- **Categories**:
  - `TOPS_BLOUSES` (شومیز، بلوز و تاپ)
  - `DRESSES` (پیراهن و مجلسی)
  - `OUTERWEAR` (مانتو، پالتو، بارانی و کت)
  - `SKIRTS` (دامن)
  - `TROUSERS` (شلوار و سرهمی)
  - `TRADITIONAL` (پوشاک سنتی و محلی)
- **Drafting Methods**:
  - `MULLER` (مولر آلمان)
  - `METRIC` (متریک بریتانیا)
  - `GRLAWEIN` (گرلاوین)
  - `UNIVERSAL` (چندمتده / استاندارد تجاری)
- **Difficulty Levels**:
  - `BEGINNER` (مبتدی - ۱ قیچی)
  - `INTERMEDIATE` (متوسط - ۲ قیچی)
  - `ADVANCED` (پیشرفته - ۳ قیچی)
  - `MASTER` (تخصصی / مزونی - ۴ قیچی)
- **Sorting Options**:
  - `NEWEST` (جدیدترین)
  - `POPULAR` (محبوب‌ترین / بالاترین امتیاز)
  - `BEST_SELLING` (پرفروش‌ترین)
  - `PRICE_ASC` (ارزان‌ترین)
  - `PRICE_DESC` (گران‌ترین)

#### 3.2.2 Garment Blueprint Detail Page (`/marketplace/[slug]`)
1. **Cover Photography Gallery**:
   - Primary lookbook image with high-resolution lightbox zoom.
   - Thumbnail carousel of finished garments on live models and dress forms.
2. **Technical Flat Vector Illustrations (طراحی فنی تخت)**:
   - Front view (`technicalFlatFront`): SVG vector rendering with labeled stitch lines, darts, pockets, front placket, collar roll line, and buttonhole spacing.
   - Back view (`technicalFlatBack`): SVG vector rendering with back yoke, center-back zipper/vent, waist darts, and hem finishes.
   - Interactive SVG with hover tooltips highlighting pattern landmarks.

#### 3.2.3 Smart Fabric Consumption Calculator
Tailors need exact fabric yardage based on bolt width and size:
- **Formulas**:
  - **Standard Suiting/Crepe Bolt (عرض ۱۵۰ سانتی‌متر)**:
    $$\text{Length}_{150} = \text{Bodice Length} + \text{Skirt Length} + \text{Sleeve Length} + \text{Ease \& Seam Allowances (20 cm)}$$
    *Example (Standard Midi Dress, Size 40)*: $42\text{cm} + 65\text{cm} + 60\text{cm} + 20\text{cm} = 187\text{cm} \approx 1.9\text{ meters}$.
  - **Narrow Bolt (عرض ۱۱۰ سانتی‌متر - ابریشم، نخی و آستری)**:
    For narrow bolts, pattern pieces cannot be nested side-by-side.
    $$\text{Length}_{110} = (\text{Bodice Front} + \text{Bodice Back}) + (\text{Skirt Front} + \text{Skirt Back}) + \text{Sleeve Length} + 25\text{ cm}$$
    $$\text{Ratio} \approx 1.55 \times \text{Length}_{150}$$
    *Example*: $1.9\text{m} \times 1.55 \approx 2.95\text{ meters}$.
  - **Directional Nap / Pattern Matching Multiplier**:
    - Solid / Two-Way print: $1.0\times$
    - Velvet / Corduroy / One-Way print: $+15\%$ extra length
    - Plaid / Stripes matching: $+20\%$ extra length
- **Interactive Visual Layout**:
  An SVG diagram renders the fabric bolt outline (110cm vs 150cm), showing the 2D packing rectangles of the pattern pieces with grainline arrows pointing lengthwise.

#### 3.2.4 Pattern Transformation Breakdown (مراحل تبدیل الگو)
Each blueprint provides a visual step-by-step transformation guide:
1. **Dart Manipulation (انتقال ساسون)**: e.g., transferring shoulder dart into the side seam (ساسون زیر بغل) or armhole (برش عصایی/پرنسسی).
2. **Slash and Spread (اوزمان دادن)**: e.g., spreading the hem of the skirt by 6 cm per panel for an A-line flare or slashing sleeve cap for puff gathers.
3. **Neckline & Collar Design (طراحی یقه و سجاف)**: e.g., drawing lapel break line, collar stand, and 4cm front facing (سجاف جلو).
4. **Seam Allowances (حق درزها)**:
   - Neckline & Armhole: 1.0 cm
   - Side seams & Shoulder: 2.0 cm to 2.5 cm
   - Hem: 3.5 cm to 4.0 cm

#### 3.2.5 Verified Ratings & Reviews
- Buyers who purchased the pattern can submit:
  - Star rating (1 to 5 stars).
  - Title & review text in Persian.
  - Fit feedback tag: `RUNS_SMALL` (کمی تنگ بود), `TRUE_TO_SIZE` (دقیقاً اندازه بود), `RUNS_LARGE` (کمی گشاد بود).
- Displays average star rating, total review count, and verified badge: **«خریدار تایید شده»**.

#### 3.2.6 Sandbox Purchase Simulator
- Clicking **«خرید و دانلود الگو»**:
  1. Opens a mock Iranian payment gateway modal (styled after Shaparak / Saman Electronic Payment).
  2. Displays pattern title, creator name, price in Toman (`formatToman(price)`), and simulated card number inputs.
  3. Action buttons:
     - **«پرداخت تستی موفق»**: Calls `/api/checkout/sandbox` with status `SUCCESS`. Atomically executes:
       - Creates `Purchase` record.
       - Creates double-entry `WalletTransaction`: credits creator wallet (80%), logs platform fee (20%).
       - Unlocks pattern in buyer's library (`/library`).
       - Redirects to success page with instant download links.
     - **«انصراف / خطای پرداخت»**: Cancels flow and displays failure toast.

---

### 3.3 R4: Creator Studio & Monetization (`/creator`, `/creator/new`, `/creator/earnings`)

#### 3.3.1 Multi-Step Pattern Publishing Wizard (`/creator/new`)
A 5-step stepper interface:

```
[۱. اطلاعات پایه] ──> [۲. متد و سایزبندی] ──> [۳. تصاویر و نمودارها] ──> [۴. پیوست الگو] ──> [۵. قیمت‌گذاری و انتشار]
```

- **Step 1: Basic Information (اطلاعات پایه)**:
  - Pattern Title (e.g. *مانتو کتی یقه انگلیسی چهار دکمه*)
  - Auto-generated URL slug (e.g. `classic-tailored-blazer-coat`)
  - Category, Target Gender, Difficulty Level
  - Detailed Persian Description & Styling Recommendations
  - Recommended Fabrics (multi-select / tag input: کرپ باربی، فاستونی، کتان لنین، حریر...)
- **Step 2: Drafting Method & Sizing Specs (متد و سایزبندی)**:
  - Drafting Method: Müller, Metric, Grlawein
  - Fit Type: Tight, Classic, Loose
  - Base Sizing: European standard (36 to 50) + Ease allowance description
- **Step 3: Media & Technical Sketches (تصاویر و نمودارهای فنی)**:
  - Main Cover Image upload (minimum 1200x1600px)
  - Lookbook Gallery (up to 5 additional model photos)
  - Technical Flat Sketches: SVG or crisp PNG for Front and Back
  - Cutting Layout Schematics
- **Step 4: Pattern Assets & Attachment Type (پیوست‌های الگو)**:
  - **Model A: Parametric Rule Preset (قالب پارامتریک)**:
    Links pattern to Dooz Studio base block (`FittedBodice`, `Skirt`, `Sleeve`, `Trouser`) with creator's custom mathematical offset rules:
    ```json
    {
      "baseBlock": "FITTED_BODICE",
      "method": "MULLER",
      "easeOffsets": { "bust": 5.0, "waist": 4.0, "hip": 5.0 },
      "dartModifications": [
        { "source": "SHOULDER", "target": "SIDE_SEAM", "distanceBelowArmhole": 3.5 }
      ],
      "necklineModifications": { "depthDrop": 14.0, "shoulderDrop": 2.0, "lapelWidth": 8.0 }
    }
    ```
  - **Model B: Multi-Size Blueprints (الگوهای چندسایزه آماده)**:
    File upload for pre-graded PDF files (A4 Tiled PDF and A0 Plotter PDF) + Sewing Instruction Booklet PDF.
- **Step 5: Pricing & Publishing (قیمت‌گذاری و انتشار)**:
  - Pricing radio: Free (رایگان) or Paid (نقدی).
  - Price in Toman (e.g. `250,000`).
  - Real-time earnings breakdown calculator:
    - Sale Price: $250,000$ Toman
    - Creator Net (80%): $200,000$ Toman
    - Platform Fee (20%): $50,000$ Toman
  - Publish Toggle: Draft (پیش‌نویس) vs Published (منتشر شده در فروشگاه).

#### 3.3.2 Financial Dashboard (`/creator/earnings`)
- **KPI Telemetry Cards**:
  1. **فروش ناخالص کل (Gross Revenue)**: Total revenue generated across all sales.
  2. **درآمد خالص من (Net Creator Earnings)**: Exactly 80% of gross sales.
  3. **موجودی قابل تسویه (Available Balance)**: Net earnings minus processed/pending payouts.
  4. **تعداد فروش موفق (Total Sales Count)**: Count of completed pattern purchases.
- **Recharts Data Visualizations**:
  - **نمودار روند فروش (Revenue Trend)**: Area chart with gradient fill plotting gross revenue and net earnings over the last 30 days or 6 months.
  - **تفکیک فروش بر اساس الگو (Sales by Pattern)**: Bar chart showing revenue contribution per pattern product.
- **Double-Entry Transaction Ledger Table**:
  Filterable table showing:
  - Date & Time (Persian formatted: e.g. *۱۴۰۵/۰۲/۱۵ ساعت ۱۶:۳۰*)
  - Transaction Type badge: `CREDIT_SALE` (فروش الگو - سبز), `DEBIT_PAYOUT` (تسویه حساب - قرمز), `PLATFORM_FEE` (کارمزد پلتفرم - خاکستری), `REFUND` (استرداد وجه).
  - Reference ID (Purchase # or Payout #).
  - Amount in Toman (`+۱۶۰,۰۰۰ تومان` / `-۵۰۰,۰۰۰ تومان`).
  - Resulting Wallet Balance (`balanceAfter`).

#### 3.3.3 Sheba/IBAN Payout Request System
- **Iranian Sheba Structure**:
  - Length: 26 characters.
  - Format: `IR` followed by 24 digits.
  - Digits 3-4: 2-digit checksum.
  - Digits 5-7: 3-digit Central Bank bank code (کد بانک).
  - Digits 8-26: 19-digit account/BBAN identifier.
- **ISO 7064 Mod 97-10 Checksum Algorithm**:
  1. Validate length equals 26 and starts with `IR`.
  2. Rearrange characters: move first 4 characters (`IR` + 2 checksum digits) to the end.
  3. Replace letters with numbers: `I` $\to 18$, `R` $\to 27$.
  4. Compute modulo 97 on the resulting 28-digit integer using big-integer arithmetic.
  5. Valid if and only if $\text{Remainder} = 1$.
- **Bank Code Lookup Table**:
  - `010`: بانک مرکزی | `011`: بانک صنعت و معدن | `012`: بانک ملت | `013`: بانک رفاه
  - `014`: بانک مسکن | `015`: بانک سپه | `016`: بانک کشاورزی | `017`: بانک ملی ایران
  - `018`: بانک تجارت | `019`: بانک صادرات ایران | `020`: بانک توسعه صادرات | `021`: پست بانک
  - `054`: بانک پارسیان | `055`: بانک اقتصاد نوین | `056`: بانک سامان | `057`: بانک پاسارگاد
  - `058`: بانک سرمایه | `059`: بانک سینا | `061`: بانک شهر | `062`: بانک آینده
- **Payout Workflow**:
  - Minimum payout: $100,000$ Toman.
  - Creator enters: Amount, Sheba number, Account Holder Name.
  - System verifies Sheba checksum and checks `amount <= user.walletBalance`.
  - Atomically creates `PayoutRequest` (status: `PENDING`) and deducts amount from available wallet balance.

---

### 3.4 R5: AI Outfit Reverse-Engineering Assistant (`/ai-analyzer`, `/api/analyze-garment`)

#### 3.4.1 Multimodal Ingestion Pipeline (`/ai-analyzer`)
- Drag-and-drop zone with image preview and file validation (JPEG, PNG, WebP; max 10MB).
- **گالری لباس‌های نمونه (Sample Wardrobe Gallery)**:
  Four pre-loaded garments for immediate 1-click test analysis without requiring user file upload:
  1. *مانتو ترنچ کژوال با آستین رگلان و یقه انگلیسی*
  2. *پیراهن مجلسی ماکسی با برش عصایی (پرنسسی)*
  3. *شومیز دراپه با آستین پفی و یقه کراواتی*
  4. *شلوار فاق بلند واید لگ با پیلی دوقلو در کمر*
- Multi-step scanning animation with Persian status indicators:
  - *«در حال پردازش تصویر و فشرده‌سازی...»*
  - *«تشخیص سیلوئت و ساختار پایه بالاتنه...»*
  - *«آنالیز خطوط انتقال ساسون، یقه و الگوی آستین...»*
  - *«تولید دستورالعمل الگوکشی متد مولر و متریک...»*

#### 3.4.2 API Specification (`/api/analyze-garment`)
- **Method**: `POST`
- **Content-Type**: `multipart/form-data` (file: `image`) or `application/json` (body: `{ imageBase64: string, sampleId?: string }`)
- **Gemini Vision Prompt Architecture**:
  System prompt instructs the model to act as a Master Patternmaker (استاد الگوکشی و طراحی دوخت) and return ONLY a valid JSON object matching the TypeScript interface below:

```typescript
export interface GarmentAnalysisResult {
  silhouette: {
    type: 'A_LINE' | 'HOURGLASS' | 'STRAIGHT_BOXY' | 'OVERSIZED' | 'FIT_AND_FLARE' | 'EMPIRE';
    persianName: string;            // e.g. "سیلوئت ساعت شنی با دامن فون"
    description: string;
  };
  neckline: {
    type: string;                   // e.g. "یقه انگلیسی سرخود"
    collarType?: string;            // e.g. "برگردان دو تکه"
    facingWidthCm: number;          // e.g. 4.0
    instructions: string;           // دستور سجاف و زاویه شکست یقه
  };
  sleeves: {
    type: 'SET_IN' | 'RAGLAN' | 'KIMONO_DOLMAN' | 'PUFF_BISHOP' | 'SLEEVELESS';
    persianName: string;            // e.g. "آستین پفی کلوش با مچ پهن"
    capHeightAdjustment: string;    // e.g. "افزایش بلندی تاج به میزان ۳ سانتی‌متر برای چین"
    cuffType?: string;              // e.g. "مچی ۵ سانتی‌متری دکمه‌خور"
  };
  dartsAndPleats: {
    frontDarts: string[];           // e.g. ["انتقال ساسون سرشانه به زیر حلقه (برش عصایی)"]
    backDarts: string[];            // e.g. ["ساسون کمر پشت به عمق ۲ سانتی‌متر"]
    pleatsOrGathers?: string;       // e.g. "چین ملایم در خط کمر"
    princessSeam: boolean;          // true/false
    waistSuppression: string;       // e.g. "تنگ‌کردن پهلوها به میزان ۱.۵ سانتی‌متر"
  };
  fabricRecommendations: {
    primaryFabrics: string[];       // e.g. ["کرپ باربی", "فاستونی پشمی لطیف", "لینن ترک"]
    requiredStretch: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedLengthMeters150cm: number; // e.g. 1.85
    estimatedLengthMeters110cm: number; // e.g. 2.90
    liningRequired: boolean;
  };
  baseBlockRecommendation: {
    baseBlock: 'FITTED_BODICE' | 'SKIRT' | 'TROUSER' | 'DRESS_COMBO';
    recommendedMethod: 'MULLER' | 'METRIC' | 'GRLAWEIN';
    rationale: string;              // دلیل انتخاب متد مولر به دلیل دقت در آستین و ساسون‌ها
  };
  draftingSteps: Array<{
    stepNumber: number;
    title: string;                  // عنوان گام به فارسی
    description: string;            // توضیحات گام‌به‌گام الگوکشی
    modifications: string[];        // مقادیر دقیق تغییرات به سانتی‌متر
  }>;
  matchingMarketplacePatterns: Array<{
    id: string;
    title: string;
    slug: string;
    similarityScore: number;
  }>;
  confidenceScore: number;          // 0.85 - 0.98
}
```

#### 3.4.3 Robust Structured Heuristic Fallback Engine
If `GEMINI_API_KEY` is undefined, or if the external API returns 429 / 5xx, the server immediately activates the heuristic analyzer:
1. Matches against sample templates or extracts image dimensions/features.
2. Constructs a full, syntactically conforming `GarmentAnalysisResult` object.
3. Maps matching patterns from the seeded marketplace catalog.
4. Response time < 50ms, zero external dependencies, 100% resilient.

#### 3.4.4 UI Integration
The analysis results page provides:
- **«طراحی مستقیم این الگو در استودیو»**: Deep-links to `/studio?baseBlock=FITTED_BODICE&method=MULLER&preset=ai-extracted` to immediately open the parametric drafting studio with the recommended geometry.
- **«الگوهای آماده مشابه در مارکت‌پلیس»**: Renders interactive cards of matching marketplace patterns with 1-click sandbox purchase.

---

### 3.5 R6: Platform Architecture, Data Layer & Tech Stack

#### 3.5.1 Next.js 15 App Router Architecture & Directory Layout
```
/Users/sotoon/personal/dooz/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (marketplace)/
│   │   ├── marketplace/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── library/page.tsx
│   ├── (tailor)/
│   │   ├── studio/page.tsx
│   │   └── clients/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── (creator)/
│   │   ├── creator/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── earnings/page.tsx
│   ├── ai-analyzer/page.tsx
│   ├── checkout/
│   │   └── simulator/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── clients/route.ts
│   │   ├── clients/[id]/route.ts
│   │   ├── patterns/route.ts
│   │   ├── patterns/[slug]/route.ts
│   │   ├── analyze-garment/route.ts
│   │   ├── checkout/sandbox/route.ts
│   │   ├── creator/payout/route.ts
│   │   └── studio/export/route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Shadcn/UI primitives (Button, Dialog, Tabs, etc.)
│   ├── studio/           # Canvas, Timeline player, Measurement panels
│   ├── marketplace/      # FilterBar, PatternCard, FabricCalculator, ReviewSection
│   ├── creator/          # WizardSteps, EarningsChart, ShebaModal
│   ├── analyzer/         # Dropzone, GarmentScanView, RecipeCard
│   └── layout/           # Navbar, Footer, UserMenu, RTLProvider
├── lib/
│   ├── prisma.ts         # Prisma singleton client
│   ├── auth.ts           # NextAuth v5 configuration
│   ├── storage/          # Modular storage adapter (Vercel Blob / Local FS)
│   ├── sheba.ts          # ISO 7064 Mod 97-10 validator
│   ├── fabric-math.ts    # Fabric consumption & cutting layout engine
│   ├── utils.ts          # Persian currency/number formatters (formatToman, toPersianDigits)
│   └── ai-fallback.ts    # Deterministic heuristic reverse-engineering engine
├── prisma/
│   ├── schema.prisma     # 9 relational models
│   └── seed.ts           # Demo users, clients, marketplace patterns
└── public/
    ├── fonts/            # Vazirmatn font assets
    ├── samples/          # Sample wardrobe photos for AI analyzer
    └── patterns/         # Sample vector technical sketches
```

#### 3.5.2 Complete Prisma ORM Schema (`prisma/schema.prisma`)
The definitive schema adhering to all business rules:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  CREATOR
  ADMIN
}

enum DraftingMethod {
  MULLER
  METRIC
  GRLAWEIN
  UNIVERSAL
}

enum FitType {
  TIGHT
  CLASSIC
  LOOSE
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  MASTER
}

enum AttachmentType {
  PARAMETRIC_PRESET
  BLUEPRINT_PDF
}

enum PurchaseStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum TransactionType {
  CREDIT_SALE
  DEBIT_PAYOUT
  PLATFORM_FEE
  REFUND
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}

enum FitFeedback {
  RUNS_SMALL
  TRUE_TO_SIZE
  RUNS_LARGE
}

model User {
  id             String          @id @default(cuid())
  name           String
  email          String          @unique
  phone          String?         @unique
  passwordHash   String?
  role           Role            @default(USER)
  avatar         String?
  bio            String?
  shebaNumber    String?
  walletBalance  Int             @default(0) // In Iranian Toman
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  clients        ClientProfile[]
  createdPatterns PatternProduct[] @relation("CreatorPatterns")
  purchases      Purchase[]
  transactions   WalletTransaction[]
  payoutRequests PayoutRequest[]
  reviews        Review[]
  savedDrafts    SavedDraft[]
}

model ClientProfile {
  id             String          @id @default(cuid())
  tailorId       String
  tailor         User            @relation(fields: [tailorId], references: [id], onDelete: Cascade)
  firstName      String
  lastName       String
  phone          String?
  gender         String          @default("FEMALE")
  measurements   Json            // AnthropometricMeasurements object
  postureTags    String[]        // Array of posture flags (e.g. ["SWAYBACK", "PROMINENT_ABDOMEN"])
  fitPreference  FitType         @default(CLASSIC)
  notes          String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  savedDrafts    SavedDraft[]

  @@index([tailorId])
}

model PatternProduct {
  id                  String          @id @default(cuid())
  creatorId           String
  creator             User            @relation("CreatorPatterns", fields: [creatorId], references: [id], onDelete: Cascade)
  title               String
  slug                String          @unique
  description         String
  category            String          // TOPS_BLOUSES, DRESSES, OUTERWEAR, SKIRTS, TROUSERS
  draftingMethod      DraftingMethod  @default(MULLER)
  fitType             FitType         @default(CLASSIC)
  difficulty          DifficultyLevel @default(INTERMEDIATE)
  price               Int             @default(0) // In Toman (0 = Free)
  coverImage          String
  galleryImages       String[]
  technicalFlatFront  String          // SVG or high-res vector path
  technicalFlatBack   String          // SVG or high-res vector path
  fabricRequirements  Json            // Recommended fabrics, estimated length 110cm/150cm
  attachmentType      AttachmentType  @default(PARAMETRIC_PRESET)
  parametricConfig    Json?           // Parametric preset rules & formulas
  blueprintPdfUrl     String?         // Multi-size graded PDF bundle URL
  isPublished         Boolean         @default(true)
  salesCount          Int             @default(0)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  steps               PatternStep[]
  purchases           Purchase[]
  reviews             Review[]

  @@index([creatorId])
  @@index([category])
  @@index([draftingMethod])
  @@index([price])
}

model PatternStep {
  id               String         @id @default(cuid())
  patternId        String
  pattern          PatternProduct @relation(fields: [patternId], references: [id], onDelete: Cascade)
  stepOrder        Int
  title            String
  description      String
  illustrationUrl  String?
  technicalDetails Json?          // e.g. dart offsets, slash measurements

  @@index([patternId, stepOrder])
}

model Purchase {
  id             String         @id @default(cuid())
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  patternId      String
  pattern        PatternProduct @relation(fields: [patternId], references: [id], onDelete: Restrict)
  pricePaid      Int            // In Toman
  transactionRef String         @unique
  status         PurchaseStatus @default(COMPLETED)
  createdAt      DateTime       @default(now())

  @@index([userId])
  @@index([patternId])
}

model WalletTransaction {
  id             String          @id @default(cuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount         Int             // In Toman (positive for credit, negative for debit)
  type           TransactionType
  balanceAfter   Int             // In Toman
  referenceId    String?         // Purchase ID or PayoutRequest ID
  description    String
  createdAt      DateTime        @default(now())

  @@index([userId])
}

model PayoutRequest {
  id                String       @id @default(cuid())
  creatorId         String
  creator           User         @relation(fields: [creatorId], references: [id], onDelete: Cascade)
  amount            Int          // In Toman
  shebaNumber       String
  accountHolderName String
  bankName          String?
  status            PayoutStatus @default(PENDING)
  processedAt       DateTime?
  adminNotes        String?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  @@index([creatorId])
}

model Review {
  id          String         @id @default(cuid())
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  patternId   String
  pattern     PatternProduct @relation(fields: [patternId], references: [id], onDelete: Cascade)
  rating      Int            // 1 to 5
  fitFeedback FitFeedback    @default(TRUE_TO_SIZE)
  title       String?
  comment     String
  createdAt   DateTime       @default(now())

  @@unique([userId, patternId])
  @@index([patternId])
}

model SavedDraft {
  id           String         @id @default(cuid())
  userId       String
  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  clientId     String?
  client       ClientProfile? @relation(fields: [clientId], references: [id], onDelete: SetNull)
  title        String
  baseBlock    String         // SKIRT, FITTED_BODICE, SLEEVE, TROUSER
  method       DraftingMethod @default(MULLER)
  measurements Json
  adjustments  Json
  studioState  Json           // Current timeline step, active layers, export settings
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([userId])
  @@index([clientId])
}
```

#### 3.5.3 Complete Seed Dataset Specification (`prisma/seed.ts`)
The seed file guarantees rich, realistic data out of the box:

1. **3 Demo Accounts**:
   - Tailor: `tailor@dooz.ir` / `Tailor123!` (Role: `USER`, Name: "استاد علی محمدی", Bio: "خیاط و طراح لباس زنانه با ۲۰ سال سابقه")
   - Creator: `creator@dooz.ir` / `Creator123!` (Role: `CREATOR`, Name: "مهسا رادمنش", Bio: "مدرس طراحی الگو و مدلسازی به روش مولر آلمان", Wallet: 2,400,000 Toman)
   - Admin: `admin@dooz.ir` / `Admin123!` (Role: `ADMIN`, Name: "مدیریت سامانه دوز")

2. **3 Tailor Client Profiles**:
   - **سارا محمدی**: Standard balanced hourglass; Bust 92cm, Waist 70cm, Hip 98cm; Metric method preference; Tag: `[]`.
   - **مریم احمدی**: Lordosis & abdominal curve; Bust 102cm, Waist 86cm, Hip 108cm; Müller preference; Tags: `["SWAYBACK", "PROMINENT_ABDOMEN"]`.
   - **زهرا کریمی**: Asymmetric posture; Bust 88cm, Waist 68cm, Hip 94cm; Grlawein preference; Tags: `["SLOPING_SHOULDERS", "PROMINENT_HIP"]`.

3. **8 Realistic Persian Marketplace Patterns**:
   1. **مانتو کتی کلاسیک با یقه انگلیسی** (Classic Tailored Blazer Coat): Category `OUTERWEAR`, Method `MULLER`, Difficulty `ADVANCED`, Price: 350,000 Toman.
   2. **پیراهن مجلسی برش پرنسسی با دامن فون** (Princess Seam Evening Dress): Category `DRESSES`, Method `METRIC`, Difficulty `MASTER`, Price: 420,000 Toman.
   3. **شومیز آستین پفی و یقه شکاری** (Bishop Sleeve Blouse): Category `TOPS_BLOUSES`, Method `METRIC`, Difficulty `INTERMEDIATE`, Price: 180,000 Toman.
   4. **شلوار راسته زنانه با خط اتو و جیب فیلتابی** (Classic Straight-Leg Trousers): Category `TROUSERS`, Method `MULLER`, Difficulty `INTERMEDIATE`, Price: 220,000 Toman.
   5. **دامن فون کلاسیک چهار تکه** (A-Line 4-Panel Skirt): Category `SKIRTS`, Method `GRLAWEIN`, Difficulty `BEGINNER`, Price: 0 Toman (رایگان).
   6. **پیراهن ماکسی چین‌دار تابستانه با یقه قایقی** (Tiered Summer Maxi Dress): Category `DRESSES`, Method `GRLAWEIN`, Difficulty `BEGINNER`, Price: 120,000 Toman.
   7. **بارانی ترنچ کژوال با آستین رگلان و کمربند** (Casual Trench Coat with Raglan Sleeve): Category `OUTERWEAR`, Method `MULLER`, Difficulty `ADVANCED`, Price: 390,000 Toman.
   8. **شلوار واید لگ فاق بلند با پیلی دوقلو** (High-Waisted Wide-Leg Pants): Category `TROUSERS`, Method `METRIC`, Difficulty `INTERMEDIATE`, Price: 260,000 Toman.

#### 3.5.4 Persian Currency & Formatting Utilities
```typescript
// lib/utils.ts
export function toPersianDigits(n: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatToman(amount: number): string {
  if (amount === 0) return 'رایگان';
  const formattedNumber = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formattedNumber} تومان`;
}
```

#### 3.5.5 Modular Storage Adapter
```typescript
// lib/storage/index.ts
export interface StorageAdapter {
  uploadFile(file: File | Buffer, filename: string, folder?: string): Promise<string>;
  deleteFile(url: string): Promise<boolean>;
}
```
- If `process.env.BLOB_READ_WRITE_TOKEN` is present: Uses `@vercel/blob` (`put()`, `del()`).
- Else (local dev): Writes file to `/public/uploads/${folder}/${filename}` and returns `/uploads/...`.

---

## 4. Execution Readiness & Next Steps
- This specification provides the exact, copy-pasteable data structures, Zod validators, Prisma models, math formulas, and page hierarchies for the implementation phase.
- Ready for orchestrator review and task dispatch to builder agents.
