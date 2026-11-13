## 2026-11-13T09:52:53Z

Build Dooz (دوز), a complete, production-ready, full-stack web application ready for immediate deployment on Vercel, providing a parametric garment drafting SaaS and a two-sided pattern creator marketplace.

Working directory: /Users/sotoon/personal/dooz
Integrity mode: development

Resume execution from current codebase state:
1. Requirements R1-R6:
   - Parametric Pattern Drafting Studio (/studio)
   - Tailor's Client Measurement CRM (/clients)
   - Two-Sided Pattern Marketplace (/marketplace and /marketplace/[slug])
   - Creator Studio & Monetization Portal (/creator and /creator/earnings)
   - AI Outfit Reverse-Engineering Assistant (/ai-analyzer and /api/analyze-garment)
   - Authentication, Data Layer & Platform Infrastructure (Prisma, NextAuth v5, Vercel Blob, Sandbox checkout)
2. Current Status:
   - All 448 automated tests in `tests/` pass with 100% pass rate (`node tests/runner.mjs`).
   - Scaffolding, configuration files, layout, homepage, and tests are written.
   - Run npm install with BypassSandbox: true if needed to ensure all dependencies and binaries (`prisma`, `next`) are installed in node_modules/.bin.
   - Complete the implementation of all remaining studio, clients, marketplace, creator, and ai-analyzer pages, components, and API routes.
   - Run `npx prisma generate` and `npm run build` to verify zero TypeScript errors.

---
Original request file: /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md
Your working directory: /Users/sotoon/personal/dooz/.agents/teamwork/orchestrator_gen2/
Project root: /Users/sotoon/personal/dooz
