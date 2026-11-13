# BRIEFING — 2026-11-13T06:05:00Z

## Mission
Investigate and design the exact technical blueprint for Milestone 1 (Platform Core, Design System & RTL Layout).

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /Users/sotoon/personal/dooz/.agents/teamwork/m1_r1_explorer_1
- Original parent: e3490e94-b5a4-4ca5-a6a5-809108cef8c7
- Milestone: Milestone 1 — Platform Core, Design System & RTL Layout

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Worker commands downloading npm packages must use node /opt/homebrew/bin/npm with BypassSandbox: true
- Target Next.js 15, React 19, Tailwind CSS, Lucide icons, Framer Motion
- Clean Persian RTL, Vazirmatn typography, Toman currency, Jalali formatting

## Current Parent
- Conversation ID: e3490e94-b5a4-4ca5-a6a5-809108cef8c7
- Updated: 2026-11-13T06:05:00Z

## Investigation State
- **Explored paths**:
  - `/Users/sotoon/personal/dooz/PROJECT.md`
  - `/Users/sotoon/personal/dooz/TEST_INFRA.md`
  - `/Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md`
  - `/Users/sotoon/personal/dooz/.agents/teamwork/teamwork_explorer_survey_1/handoff.md`
  - `/Users/sotoon/.npm` cache and global node environment
- **Key findings**:
  - Environment runs Node v26.13.0 and npm 11.20.0; direct `npm` fails due to sandbox shebang restriction; worker must execute `/opt/homebrew/bin/node /opt/homebrew/bin/npm`.
  - Downloading npm packages requires `BypassSandbox: true` due to local sandbox HTTP proxy blocking registry.npmjs.org.
  - To prevent sandbox network 403 errors during `npm run build` or offline execution, Vazirmatn font should be packaged via `@fontsource-variable/vazirmatn` in dependencies and imported in `globals.css` rather than relying on `next/font/google` remote fetches.
  - Native Node.js `Intl` API (`Intl.DateTimeFormat` with `fa-IR-u-ca-persian-nu-persian` and `Intl.NumberFormat('fa-IR')`) supports 100% of Persian calendar dates, Persian digits, and thousands separators without external date libraries.
- **Unexplored areas**: None for M1; ready to produce complete Worker blueprint.

## Key Decisions Made
- Recommended package.json dependencies targeting Next.js 15, React 19, Tailwind CSS v3.4, Lucide icons, Framer Motion v12, CVA, clsx, tailwind-merge, and `@fontsource-variable/vazirmatn`.
- Established strict `tsconfig.json` with `@/*` path aliases and strict null/any checks.
- Prepared complete code blueprints for `src/lib/format.ts`, `src/lib/utils.ts`, `src/components/layout/navbar.tsx`, `src/components/layout/footer.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, and `.env.example`.

## Artifact Index
- DISPATCH.md — Parent dispatch instruction
- BRIEFING.md — Persistent working memory
- progress.md — Liveness heartbeat and milestone checklist
- handoff.md — Final investigation blueprint for Worker implementation
