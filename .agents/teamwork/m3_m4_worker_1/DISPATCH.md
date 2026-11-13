## 2026-11-13T10:19:06Z
[Message] timestamp=2026-11-13T10:19:06Z sender=f4959968-8be7-421f-82e3-6c3965358b16 priority=MESSAGE_PRIORITY_HIGH content=You are Worker 2 (`m3_m4_worker_1`) in project Dooz (دوز).
Your working directory is: /Users/sotoon/personal/dooz/.agents/teamwork/m3_m4_worker_1/

CRITICAL ENVIRONMENT INSTRUCTION:
- DO NOT access external networks, DO NOT run `npm install` from network registries, DO NOT use search_web.
- All dependencies are locally present. Always invoke Node directly: `/opt/homebrew/bin/node`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP:
Read the following authoritative files:
- /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md (Original user requirements)
- /Users/sotoon/personal/dooz/PROJECT.md (Master architecture and code layout)
- /Users/sotoon/personal/dooz/TEST_READY.md (Passing test suite specification)
- /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_2/handoff.md and /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_2/analysis.md (Complete technical blueprint and component listings)
- /Users/sotoon/personal/dooz/tests/harness/fabric-math.mjs and /Users/sotoon/personal/dooz/tests/harness/fixtures.mjs

EXCLUSIVE FILE OWNERSHIP:
You own and will implement the following files exclusively:
- `src/types/crm.ts`
- `src/types/marketplace.ts`
- `src/app/studio/page.tsx`
- `src/components/studio/canvas.tsx`
- `src/components/studio/timeline-player.tsx`
- `src/components/studio/sidebar.tsx`
- `src/app/clients/page.tsx`
- `src/app/clients/new/page.tsx`
- `src/app/clients/[id]/page.tsx`
- `src/app/api/clients/route.ts`
- `src/app/api/clients/[id]/route.ts`
- `src/app/marketplace/page.tsx`
- `src/app/marketplace/[slug]/page.tsx`
- `src/components/marketplace/filter-bar.tsx`
- `src/components/marketplace/pattern-card.tsx`
- `src/components/marketplace/fabric-calculator.tsx`
- `src/components/marketplace/technical-flat.tsx`
- `src/components/marketplace/transformation-accordion.tsx`
- `src/components/marketplace/reviews-section.tsx`

TASK REQUIREMENTS:
1. Implement the Drafting Studio UI (`/studio`):
   - SVG canvas (`canvas.tsx`) with zoom clamping strictly to [0.2, 5.0], dynamic viewBox handling negative coordinates, mouse wheel zoom, pan drag.
   - Timeline player (`timeline-player.tsx`) with prev/next, auto-play (2000ms), show all, step counter, pulsing active element highlights.
   - Real-time parameter controls (`sidebar.tsx`) for block, method, fit ease, posture toggles, and live export buttons (A4 PDF, A0 PDF, SVG, DXF).
2. Implement Client CRM (`/clients`):
   - Full CRUD APIs at `/api/clients` and `/api/clients/[id]` validating 26 measurements in cm, posture defect flags with mutual exclusion, and 5000-char notes.
   - Pages for listing clients, creating new client, and client detail view.
   - Studio launch bridge: one-click button "الگوسازی برای این مشتری" directing to `/studio?clientId={id}` pre-populating client measurements.
3. Implement Two-Sided Pattern Marketplace (`/marketplace` & `/marketplace/[slug]`):
   - Discovery feed with multi-faceted filtering (category, method, fit, difficulty, price free/paid).
   - Blueprint detail page with cover gallery, front & back technical flat sketches, transformation accordion, verified reviews.
   - Smart fabric calculator: computing meters dynamically for 110cm and 150cm rolls with layout schematic and stacked layout alert for Size 48+ on 110cm rolls.
4. Verify by running `/opt/homebrew/bin/node tests/runner.mjs`.
5. Write your completion report in `/Users/sotoon/personal/dooz/.agents/teamwork/m3_m4_worker_1/handoff.md` and send a message back.
