## 2026-11-13T10:19:27Z
You are Worker 3 (`m5_m6_worker_1`) in project Dooz (دوز).
Your working directory is: /Users/sotoon/personal/dooz/.agents/teamwork/m5_m6_worker_1/

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
- /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_3/handoff.md and /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_3/analysis.md (Complete technical blueprint and component listings)
- /Users/sotoon/personal/dooz/tests/harness/ledger-math.mjs, tests/harness/sheba.mjs, and tests/harness/ai-schema.mjs

EXCLUSIVE FILE OWNERSHIP:
You own and will implement the following files exclusively:
- `src/lib/ledger.ts` (Double-entry accounting, 80/20 split, ISO 7064 Mod 97-10 Sheba validator, Iranian central bank code catalog)
- `src/lib/ai-garment.ts` (Gemini Vision API integration with zero-crash heuristic fallback engine, schema validation, Studio deep-linking)
- `src/app/api/payouts/route.ts` (Creator payout requests with Sheba validation & balance deduction)
- `src/app/api/analyze-garment/route.ts` (POST garment analysis handling image uploads and preset analysis)
- `src/components/creator/wizard-step-1.tsx`
- `src/components/creator/wizard-step-2.tsx`
- `src/components/creator/wizard-step-3.tsx`
- `src/components/creator/wizard-step-4.tsx`
- `src/components/creator/wizard-step-5.tsx`
- `src/components/creator/earnings-chart.tsx` (responsive native SVG area/bar chart with zero external dependencies)
- `src/app/creator/page.tsx`
- `src/app/creator/new/page.tsx`
- `src/app/creator/earnings/page.tsx`
- `src/app/ai-analyzer/page.tsx` (dropzone upload, presets gallery, structured results view, studio deep-link)

TASK REQUIREMENTS:
1. Implement `src/lib/ledger.ts` matching exact mathematical algorithms from `tests/harness/ledger-math.mjs` and `tests/harness/sheba.mjs`.
2. Implement `src/lib/ai-garment.ts` and `/api/analyze-garment` supporting preset analysis, multipart image parsing, Google Gemini Vision API, and zero-crash heuristic fallback conforming to `tests/harness/ai-schema.mjs`.
3. Implement Creator Studio (`/creator`, `/creator/new` 5-step wizard, `/creator/earnings` with KPI cards, SVG telemetry chart, payout modal with Sheba validation).
4. Implement `/ai-analyzer` interactive UI with image upload, presets gallery, and direct link to load recommended base block into `/studio`.
5. Run tests and typecheck:
   - Run `/opt/homebrew/bin/node tests/runner.mjs` to ensure 100% pass rate.
   - Run `/opt/homebrew/bin/node ./node_modules/typescript/bin/tsc --noEmit` and verify zero errors.
6. Write your completion report in `/Users/sotoon/personal/dooz/.agents/teamwork/m5_m6_worker_1/handoff.md` and send a message back.
