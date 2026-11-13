## 2026-11-13T05:59:47Z
From: e3490e94-b5a4-4ca5-a6a5-809108cef8c7 (parent)
Scope: Milestone 1 — Prisma ORM PostgreSQL Schema & Rich Database Seeder (Features F4, F5).
1. Read /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md.
2. Read /Users/sotoon/personal/dooz/PROJECT.md.
3. Read /Users/sotoon/personal/dooz/.agents/teamwork/teamwork_spec_miner_survey_3/handoff.md.
4. Investigate and recommend the exact implementation blueprint for:
   - prisma/schema.prisma covering all 9 models: User, ClientProfile, PatternProduct, PatternStep, Purchase, WalletTransaction, PayoutRequest, Review, SavedDraft.
   - Enums: Role (USER, CREATOR, ADMIN), DraftingMethod (MULLER, METRIC, GRLAWEIN), BlockType (SKIRT, BODICE, SLEEVE, TROUSER), FitType (TIGHT, CLASSIC, LOOSE), Difficulty (BEGINNER, INTERMEDIATE, ADVANCED), TransactionType (CREDIT, DEBIT, COMMISSION, PAYOUT), PayoutStatus (PENDING, APPROVED, REJECTED, PAID), PurchaseStatus (PENDING, COMPLETED, FAILED).
   - prisma/seed.ts populating:
     a) 3 demo user accounts: Tailor (tailor@dooz.ir), Creator (creator@dooz.ir), Admin (admin@dooz.ir) with hashed passwords.
     b) 3 realistic client profiles with full anthropometric measurements and body irregularity tags (prominent abdomen, swayback, sloping shoulder).
     c) 8 rich marketplace patterns with full Persian titles, descriptions, categories, methods, prices in Toman, step-by-step instructions, and verified reviews.
   - Offline prisma generate verification strategy so build passes without requiring a live remote Postgres daemon.
5. Write your findings and recommended Worker implementation strategy to:
   /Users/sotoon/personal/dooz/.agents/teamwork/m1_r1_explorer_2/handoff.md
6. Send completion message to parent (e3490e94-b5a4-4ca5-a6a5-809108cef8c7).
