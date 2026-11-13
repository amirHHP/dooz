# E2E Test Infra: Dooz (دوز)

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests are derived strictly from `ORIGINAL_REQUEST.md` and user specifications, with zero coupling to internal implementation details.
- **Methodology**: 4-Tier verification incorporating Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial Testing, and Real-World Iranian Tailoring Workloads.
- **Verification Stability**: Progressive testability — Tier 1 tests verify basic standalone inputs, Tier 2 stresses boundaries and defect configurations, Tier 3 validates cross-module interactions, and Tier 4 exercises comprehensive end-to-end tailor, creator, and shopper journeys.

---

## Feature Inventory & Test Mapping

| # | Feature | Source | Tier 1 (Coverage ≥5) | Tier 2 (Boundary ≥5) | Tier 3 (Pairwise) |
|---|---------|--------|:-------------------:|:--------------------:|:-----------------:|
| F1 | Greenfield Next.js 15 & TS Setup | R6 | 5 cases (configs, tsconfig, build targets) | 5 cases (strict flags, path aliases) | ✓ |
| F2 | Design System & UI Kit | R6 | 5 cases (Tailwind classes, Shadcn components) | 5 cases (responsive breakpoints, theme tokens) | ✓ |
| F3 | RTL Persian Typography & Localization | R6 | 5 cases (dir="rtl", Vazirmatn font, Toman format) | 5 cases (Persian numerals, large Toman numbers) | ✓ |
| F4 | Prisma ORM PostgreSQL Schema | R6 | 5 cases (9 models, primary keys, relations) | 5 cases (cascades, unique indexes, constraints) | ✓ |
| F5 | Comprehensive Database Seeder | R6 | 5 cases (3 demo roles, 3 clients, 8 patterns) | 5 cases (defect tags in seed, step completeness) | ✓ |
| F6 | Auth.js (NextAuth v5) Setup | R6 | 5 cases (Credentials login, session tokens, RBAC) | 5 cases (invalid phone, expired tokens, role guards) | ✓ |
| F7 | Modular Storage Adapter | R6 | 5 cases (Blob upload, local fallback, URL return) | 5 cases (large payloads, MIME validation, missing token) | ✓ |
| F8 | Config & Build Baseline | R6 | 5 cases (.env.example variables, clean build) | 5 cases (missing env fallback, build offline) | ✓ |
| F9 | Basic Skirt Parametric Engine | R1 | 5 cases (waist, hip, length for Müller/Metric/Grlawein) | 5 cases (extreme waist/hip ratios, mini/maxi lengths) | ✓ |
| F10 | Basic Fitted Bodice Engine | R1 | 5 cases (bust dart, armhole depth, neck curve) | 5 cases (extreme bust-to-waist differences, high bust) | ✓ |
| F11 | Basic Sleeve Parametric Engine | R1 | 5 cases (crown height, bicep ease, wrist taper) | 5 cases (narrow vs muscular bicep, armhole perimeter parity) | ✓ |
| F12 | Basic Trouser Parametric Engine | R1 | 5 cases (front/back rise, crotch extensions, crease) | 5 cases (short crotch depth, wide hips, tapered hem) | ✓ |
| F13 | Posture & Defect Adjustments | R1 | 5 cases (abdomen, swayback, hip, shoulders, ease) | 5 cases (combined defects, extreme ease toggles) | ✓ |
| F14 | Timeline Construction Graph | R1 | 5 cases (ordered steps, Persian labels, cm annotations) | 5 cases (empty steps guard, step count integrity) | ✓ |
| F15 | Tiled A4 PDF Generator | R1 | 5 cases (2.8346 pt/mm scale, grid indices, cut margins) | 5 cases (verified 5cmx5cm square, multi-page boundary) | ✓ |
| F16 | Single-Sheet A0 Plotter PDF | R1 | 5 cases (A0 roll dimensions, 1:1 geometry, headers) | 5 cases (oversized patterns, tight margins) | ✓ |
| F17 | SVG & DXF CAD Exporters | R1 | 5 cases (SVG viewBox, ASTM D6673 layers, entities) | 5 cases (closed polylines, DXF coordinate precision) | ✓ |
| F18 | Interactive SVG Studio Canvas | R1 | 5 cases (render paths, pan/zoom viewBox, coordinates) | 5 cases (zoom limits, window resizing, negative bounds) | ✓ |
| F19 | Studio Timeline Player Controls | R1 | 5 cases (prev, next, play, pause, show all) | 5 cases (boundary steps 0 and N, fast forward) | ✓ |
| F20 | Real-Time Studio Parameters | R1 | 5 cases (measurement input, method toggle, recalculation) | 5 cases (decimal inputs, live geometry update latency) | ✓ |
| F21 | Client Anthropometric CRM | R2 | 5 cases (CRUD client, 26 measurement fields) | 5 cases (missing non-critical measurements, range checks) | ✓ |
| F22 | Client Posture Tags & Notes | R2 | 5 cases (assign tags, notes persistence, edit tags) | 5 cases (conflicting tags resolution, empty notes) | ✓ |
| F23 | Studio Launch Bridge & History | R2 | 5 cases (one-click launch, url params, draft history) | 5 cases (invalid clientId, draft overwriting) | ✓ |
| F24 | Marketplace Discovery Catalog | R3 | 5 cases (category, method, fit, difficulty, price filter) | 5 cases (0-result filter combinations, reset action) | ✓ |
| F25 | Garment Detail View & Specs | R3 | 5 cases (slug routing, photography gallery, meta) | 5 cases (non-existent slug 404, long descriptions) | ✓ |
| F26 | Technical Flat Vector Sketches | R3 | 5 cases (front/back views, seamline renders, zoom) | 5 cases (missing sketch fallback SVG, responsive fit) | ✓ |
| F27 | Smart Fabric Consumption Calc | R3 | 5 cases (110cm vs 150cm rolls, yardage estimation) | 5 cases (size 50+ stacked layout, nap/pattern factor) | ✓ |
| F28 | Pattern Transformation Breakdown | R3 | 5 cases (dart manipulation, slash-spread, seam allow) | 5 cases (complex multi-step accordion transitions) | ✓ |
| F29 | Verified Reviews & Ratings | R3 | 5 cases (1-5 star ratings, fit feedback, verified badge) | 5 cases (unauthenticated block, duplicate review guard) | ✓ |
| F30 | AI Outfit Assistant Upload | R5 | 5 cases (image upload, sample wardrobe selection) | 5 cases (file size >10MB reject, non-image MIME) | ✓ |
| F31 | Gemini Vision & Heuristic Fallback | R5 | 5 cases (valid JSON schema, silhouette/dart extraction) | 5 cases (missing API key fallback, malformed response) | ✓ |
| F32 | AI Studio & Marketplace Deep-Links | R5 | 5 cases (deep-link to studio, pattern recommendations) | 5 cases (query param encoding, unmatched garment type) | ✓ |
| F33 | 5-Step Pattern Publishing Wizard | R4 | 5 cases (details, sizing, sketches, attachments, price) | 5 cases (step validation blocking, draft save) | ✓ |
| F34 | Parametric Presets & Blueprints | R4 | 5 cases (preset attachment, PDF blueprint upload) | 5 cases (corrupt PDF reject, preset schema validation) | ✓ |
| F35 | Creator Earnings Dashboard | R4 | 5 cases (KPI cards, Recharts revenue line, sales count) | 5 cases (zero sales state, date range filtering) | ✓ |
| F36 | Double-Entry Financial Ledger | R4 | 5 cases (80/20 credit calculation, immutable ledger) | 5 cases (atomic transaction rollback, rounding safety) | ✓ |
| F37 | Sheba/IBAN Payout Request System | R4 | 5 cases (payout request, bank detection, status state) | 5 cases (ISO 7064 Mod 97-10 invalid Sheba, overdraw) | ✓ |
| F38 | Sandbox Checkout Simulator | R6 | 5 cases (Saman mock gateway, success, cancel, unlock) | 5 cases (duplicate purchase prevent, failed callback) | ✓ |

---

## Test Architecture
- **Location**: `/Users/sotoon/personal/dooz/tests/`
- **Runner**: Deterministic Node.js / TypeScript test runner executed via `npm test` or `node tests/runner.mjs`.
- **Exit Semantics**: Exit code `0` on 100% pass; non-zero exit code with assertion diffs on any failure.
- **Structure**:
  - `tests/tier1/`: Feature coverage unit & API tests (F1–F38).
  - `tests/tier2/`: Boundary, corner-case, and error-handling tests.
  - `tests/tier3/`: Cross-feature combinatorial & integration tests.
  - `tests/tier4/`: End-to-end real-world workload scenarios.
  - `tests/harness/`: Test fixtures, mock clients, geometry assertions, and PDF/DXF byte validators.

---

## Real-World Application Scenarios (Tier 4)

| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | **Tehran Tailor Custom Client Journey**: Tailor registers client with prominent abdomen and swayback, launches Studio, inspects step-by-step Müller Bodice construction, exports A4 tiled PDF, and verifies 5cm calibration square. | F3, F4, F9, F10, F13, F14, F15, F21, F22, F23 | High |
| 2 | **Creator Pattern Monetization & Payout**: Independent creator publishes a trench coat blueprint with parametric preset, buyer purchases via sandbox checkout, ledger records 80/20 split, creator requests Sheba payout, and system validates Sheba checksum. | F4, F6, F24, F25, F33, F34, F35, F36, F37, F38 | High |
| 3 | **AI Reverse-Engineering to Custom Garment**: User uploads evening gown photo to AI Analyzer, receives structured breakdown (silhouette, neckline, darts), launches Studio with recommended base block, and exports 1:1 DXF. | F10, F17, F18, F30, F31, F32 | High |
| 4 | **Fabric Consumption & Buying Guide**: Shopper browses pleated skirt pattern on marketplace, switches between 110cm and 150cm fabric widths to view required meterage and layout schematic, and submits verified review after purchase. | F24, F25, F27, F28, F29, F38 | Medium |
| 5 | **Multi-Method Tailoring Parity Verification**: Compares the mathematical output of Basic Skirt across Müller, Metric, and Grlawein methods for the same standard measurements, ensuring valid closure, dart suppression, and positive ease. | F9, F13, F14, F17, F20 | High |

---

## Coverage Thresholds
- **Tier 1**: ≥ 5 tests per feature (38 features × 5 = ≥ 190 tests)
- **Tier 2**: ≥ 5 tests per feature (38 features × 5 = ≥ 190 tests)
- **Tier 3**: ≥ 38 cross-feature pairwise interaction tests
- **Tier 4**: ≥ 5 comprehensive real-world workload scenarios
- **Total Suite Minimum**: ≥ 423 test assertions
