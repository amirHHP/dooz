# Original User Request

## Initial Request — 2026-11-13T05:41:51Z

Build Dooz (دوز), a complete, production-ready, full-stack web application ready for immediate deployment on Vercel, providing a parametric garment drafting SaaS and a two-sided pattern creator marketplace.

Working directory: /Users/sotoon/personal/dooz
Integrity mode: development

## Requirements

### R1. Parametric Pattern Drafting Studio
Build an interactive drafting studio (`/studio`) that calculates garment geometry deterministically from custom client measurements and posture adjustments (prominent abdomen, swayback, prominent hip, sloping/square shoulders, and fit preferences: tight/bodycon, classic, loose). The studio must implement full parametric calculation formulas across all base blocks (Basic Skirt, Basic Fitted Bodice, Basic Sleeve, and Basic Trouser) for all three drafting methods: Müller (مولر), Metric (متریک), and Grlawein (گرلاوین). The studio must render an interactive, zoomable/pannable SVG drafting canvas with a step-by-step timeline player (step forward/back, auto-play, show all) that highlights active construction lines and points with calculated centimeter values and Persian instructional text. The studio must generate true 1:1 scale printable PDFs (multi-page A4 tiled with grid coordinates, dashed cut/tape margins, and a 5cm × 5cm calibration square, and single-sheet A0 plotter PDF) as well as raw SVG and DXF file exports.

### R2. Tailor's Client Measurement CRM
Build a client management module (`/clients`) providing complete CRUD capabilities for client anthropometric measurements, posture/body-defect tags, private notes, and pattern history, with a one-click action to launch `/studio` pre-populated with that client's measurements.

### R3. Two-Sided Pattern Marketplace
Build a pattern marketplace (`/marketplace`) featuring a responsive discovery feed with multi-faceted filtering (category, drafting method, fit type, difficulty, price). Build garment blueprint detail pages (`/marketplace/[slug]`) including cover photography gallery, technical flat vector illustration, a smart fabric consumption calculator (computing required fabric length for 110cm and 150cm fabric widths with layout diagram), pattern transformation breakdown (dart manipulation, slash-and-spread, neckline/collar, seam allowances), verified ratings and reviews, and a complete purchase/unlock flow.

### R4. Creator Studio & Monetization
Build a creator portal (`/creator`) featuring a multi-step pattern publishing wizard (`/creator/new`) that allows creators to set pricing (free or Toman), upload images and technical sketches, and attach either parametric rule presets (linking to base blocks with custom ease/offsets) or multi-size blueprints with illustrated modeling instructions. Build a financial dashboard (`/creator/earnings`) displaying KPI cards (total revenue, net earnings, wallet balance, sales), Recharts sales graphs, transaction history, and a Sheba/IBAN payout request system with double-entry ledger accounting (80% creator / 20% platform commission).

### R5. AI Outfit Reverse-Engineering Assistant
Build an AI garment analyzer (`/ai-analyzer`) and API endpoint (`/api/analyze-garment`) that accepts uploaded garment photos and utilizes Google Gemini Vision API (with a rich structured heuristic fallback when `GEMINI_API_KEY` is not provided) to analyze silhouette, neckline, sleeve construction, darts/pleats, recommended fabric, step-by-step base block drafting instructions, and recommended matching marketplace patterns.

### R6. Authentication, Data Layer & Platform Infrastructure
Implement a strict TypeScript Next.js 15 (App Router) full-stack application with Tailwind CSS, Shadcn/UI, Lucide icons, Framer Motion, and full RTL (`dir="rtl"`) Persian (`fa-IR`) interface with Vazirmatn font and Toman currency formatting. Implement PostgreSQL with Prisma ORM (`prisma/schema.prisma` covering User, ClientProfile, PatternProduct, PatternStep, Purchase, WalletTransaction, PayoutRequest, Review, and SavedDraft) and a rich `prisma/seed.ts` populating demo accounts (tailor, creator, admin), 3 client profiles with realistic measurements and body irregularity flags, and 8 realistic Persian marketplace patterns with instructions and reviews. Implement Auth.js (NextAuth v5) with email/phone + password and Google OAuth supporting USER, CREATOR, and ADMIN roles. Implement modular file storage adapter configured for Vercel Blob with local fallback, and modular payments with a built-in sandbox checkout simulator.

## Acceptance Criteria

### Parametric Drafting & PDF Export
- [ ] Parametric drafting engine computes exact 2D coordinates, Bezier curves, darts, grainlines, and notches deterministically from measurements for Skirt, Bodice, Sleeve, and Trouser base blocks across Müller, Metric, and Grlawein methods with zero placeholder geometry.
- [ ] Toggling posture/body-defect adjustments (prominent abdomen, swayback, prominent hip, shoulder slope, fit preference) recalculates pattern geometry in real time.
- [ ] Step-by-step player highlights active construction lines/points, displays calculated values in cm on the canvas, and shows Persian instructions for each step.
- [ ] Exported A4 tiled PDF splits patterns across pages with row/column grid indices, cut margins, and a verified 5cm × 5cm calibration square; A0 plotter PDF and raw SVG/DXF exports download at 1:1 scale.

### Client CRM & Marketplace
- [ ] Tailor can create, view, edit, and delete client profiles, and clicking "Draft Pattern for Client" opens `/studio` pre-filled with the client's measurements.
- [ ] Marketplace catalog filters items by category, drafting method, fit type, difficulty, and price.
- [ ] Garment detail page computes required fabric length dynamically for selected size and fabric width (110cm vs 150cm).
- [ ] Purchasing a free or paid pattern (via sandbox checkout) unlocks permanent access in user's library and records ledger transactions.

### Creator Portal & Financials
- [ ] Users can publish patterns via `/creator/new` with metadata, photos, technical flat sketches, and parametric presets or multi-size blueprint attachments.
- [ ] Financial dashboard calculates and displays total revenue, net earnings (80%), wallet balance, sales counts, and transaction ledger.
- [ ] Payout requests validate Sheba/IBAN, deduct available wallet balance, and create pending/completed ledger records.

### AI Assistant & Platform Standards
- [ ] `/api/analyze-garment` accepts garment images and returns structured analysis (silhouette, neckline, sleeves, darts, fabric, drafting steps, matching patterns) via Gemini Vision API or structured fallback.
- [ ] Primary interface is fully RTL (`dir="rtl"`), styled with Vazirmatn font, and formats prices in Toman.
- [ ] `prisma/seed.ts` successfully seeds demo accounts (Tailor, Creator, Admin), 3 client profiles with measurements and body irregularity tags, and 8 marketplace patterns.
- [ ] `.env.example` documents all required environment variables (`DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `GEMINI_API_KEY`).
- [ ] `npx prisma generate` and `npm run build` succeed with zero TypeScript or build errors.
