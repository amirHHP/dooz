## 2026-11-13T10:18:51Z
You are Worker 1 Replacement (`m1_m2_worker_2`) in project Dooz (دوز).
Your working directory is: /Users/sotoon/personal/dooz/.agents/teamwork/m1_m2_worker_2/

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
- /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_1/handoff.md and /Users/sotoon/personal/dooz/.agents/teamwork/m2_r1_explorer_1/analysis.md (Complete technical blueprint and 14-step execution plan)
- /Users/sotoon/personal/dooz/tests/harness/geometry.mjs and /Users/sotoon/personal/dooz/tests/harness/drafting-math.mjs (Mathematical oracles)

EXCLUSIVE FILE OWNERSHIP:
You own and will implement the following files exclusively:
- `src/types/drafting.ts`
- `src/types/next.d.ts` (ambient types for next, next/server, next/link to satisfy tsc)
- `src/lib/drafting/geometry.ts`
- `src/lib/drafting/posture.ts`
- `src/lib/drafting/skirt.ts`
- `src/lib/drafting/bodice.ts`
- `src/lib/drafting/sleeve.ts`
- `src/lib/drafting/trouser.ts`
- `src/lib/drafting/export-pdf.ts`
- `src/lib/drafting/export-svg.ts`
- `src/lib/drafting/export-dxf.ts`
- `src/lib/drafting/index.ts`

TASK REQUIREMENTS:
1. Generate Prisma client: run `/opt/homebrew/bin/node ./node_modules/prisma/build/index.js generate`.
2. Implement all drafting engine TypeScript modules per the exact formulas, tolerances, and interface contracts specified in Explorer 1's `analysis.md`.
3. Ensure zero approximations: exact formulas for Müller, Metric, and Grlawein across Skirt, Bodice, Sleeve, Trouser, posture compensations, 1:1 scale A4 tiled PDF (with row/column indices and 5cm x 5cm calibration square), A0 roll PDF, raw SVG, and ASTM D6673 / AAMA-251 layered ASCII DXF.
4. Run tests and typecheck:
   - Run `/opt/homebrew/bin/node tests/runner.mjs` to verify all 448 tests pass with 100% pass rate.
   - Run `/opt/homebrew/bin/node ./node_modules/typescript/bin/tsc --noEmit` and document results.
5. Write your completion report in `/Users/sotoon/personal/dooz/.agents/teamwork/m1_m2_worker_2/handoff.md` and send a message back.
