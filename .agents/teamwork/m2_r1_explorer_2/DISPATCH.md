## 2026-11-13T09:57:42Z
Sender: f4959968-8be7-421f-82e3-6c3965358b16
Priority: MESSAGE_PRIORITY_HIGH

You are Explorer 2 (m2_r1_explorer_2) in project Dooz (دوز).
Your working directory is: /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_2/

MANDATORY FIRST STEP:
Read the following authoritative files:
- /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md (Original user requirements)
- /Users/sotoon/personal/dooz/PROJECT.md (Master architecture and code layout)
- /Users/sotoon/personal/dooz/TEST_READY.md (Passing test suite specification)
- /Users/sotoon/personal/dooz/tests/harness/fabric-math.mjs and /Users/sotoon/personal/dooz/tests/harness/fixtures.mjs

YOUR OBJECTIVE:
Investigate and produce an exact, actionable technical implementation blueprint for:
1. Drafting Studio UI (`src/app/studio/page.tsx`, `src/components/studio/canvas.tsx`, `src/components/studio/timeline-player.tsx`, `src/components/studio/sidebar.tsx`):
   - Interactive zoomable/pannable SVG canvas (mouse wheel zoom, drag pan, reset view).
   - Step-by-step construction timeline player (Prev, Next, Auto-Play with interval, Show All, step counter, active element highlight with pulse).
   - Real-time parameter controls (block selection: Skirt/Bodice/Sleeve/Trouser, method selection: Müller/Metric/Grlawein, fit preference: Tight/Classic/Loose, posture toggles: prominent abdomen, swayback, prominent hip, shoulder slope).
   - In-canvas cm measurements and Persian instructional text per step.
   - Real-time export buttons (A4 tiled PDF, A0 plotter PDF, SVG, DXF).
2. Client Anthropometric CRM (`src/app/clients/page.tsx`, `src/app/clients/new/page.tsx`, `src/app/clients/[id]/page.tsx`, `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`):
   - Full CRUD for client anthropometric measurements (26 key body measurements in cm with sensible Persian labels and validation).
   - Posture/body-defect tags toggling (`PROMINENT_ABDOMEN`, `SWAYBACK`, `PROMINENT_HIP`, `SLOPING_SHOULDERS`, `SQUARE_SHOULDERS`) and private tailor notes.
   - One-click action button "الگوسازی برای این مشتری" that launches `/studio?clientId={id}` pre-populating client measurements.
3. Two-Sided Pattern Marketplace (`src/app/marketplace/page.tsx`, `src/app/marketplace/[slug]/page.tsx`, `src/components/marketplace/filter-bar.tsx`, `src/components/marketplace/pattern-card.tsx`, `src/components/marketplace/fabric-calculator.tsx`):
   - Responsive discovery catalog with multi-faceted filtering (category, drafting method, fit type, difficulty, price free/paid).
   - Blueprint detail page (`/marketplace/[slug]`): photo gallery, garment specs, creator profile, technical flat vector sketches (front & back).
   - Smart fabric consumption calculator: dynamic calculation of required fabric length for 110cm and 150cm fabric rolls with layout schematic.
   - Pattern transformation breakdown accordion (dart manipulation, slash-and-spread, neckline/collar, seam allowances).
   - Verified ratings and reviews with 5-star display and "true to size" fit feedback.
   - Purchase / unlock flow with sandbox checkout bridge.

RULES:
- You are READ-ONLY. DO NOT edit or create any source code files outside your working directory.
- Write your full analysis and findings to `/Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_2/analysis.md` and `/Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_2/handoff.md`.
- Send a completion message back with the path to your handoff report.
