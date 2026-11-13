# BRIEFING — 2026-11-13T05:45:00Z

## Mission
Build Dooz (دوز), a complete, production-ready, full-stack Next.js 15 web application for parametric garment drafting SaaS and a two-sided pattern creator marketplace.

## 🔒 My Identity
- Archetype: orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /Users/sotoon/personal/dooz/.agents/teamwork/orchestrator
- Original parent: parent
- Original parent conversation ID: 494c86fc-8a28-4825-8072-fbb4176b9ecc

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /Users/sotoon/personal/dooz/PROJECT.md
1. **Decompose**: Decompose full-stack Dooz platform into implementation milestones + parallel E2E testing track
2. **Dispatch & Execute**:
   - **Delegate (sub-orchestrator)**: Spawn sub-orchestrators for milestones or run iteration loop (Explorer -> Worker -> Reviewer -> Challenger -> Auditor)
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign
4. **Succession**: At 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Survey & Architecture [in-progress]
  2. Milestone Decomposition [pending]
  3. Execution & Verification [pending]
- **Current phase**: 1
- **Current focus**: Survey phase (map codebase, tech stack, requirements)

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/teamwork/ folder.
- Hard audit veto: If a Forensic Auditor reports INTEGRITY VIOLATION, the milestone FAILS UNCONDITIONALLY.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.

## Current Parent
- Conversation ID: 494c86fc-8a28-4825-8072-fbb4176b9ecc
- Updated: not yet

## Key Decisions Made
- Project pattern selected for full greenfield/production web app build.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_1 | teamwork_explorer | Survey 1: Codebase & Tech Stack Discovery | completed | ac13ede8-8612-4eae-914e-83397bc99c8c |
| spec_miner_survey_2 | teamwork_spec_miner | Survey 2: Drafting Math & Export Specs | completed | 9a932ac6-aac9-4b21-b557-19c97eb7def1 |
| spec_miner_survey_3 | teamwork_spec_miner | Survey 3: Full-Stack Specs & Architecture | completed | 814f644a-df3a-4dd5-ad41-9e1af482a2fd |
| m1_r1_explorer_1 | teamwork_explorer | M1 Explorer 1: Frontend & RTL Layout Blueprint | completed | 2af6a56d-88a0-422e-ba86-cbe838932b71 |
| m1_r1_explorer_2 | teamwork_explorer | M1 Explorer 2: Prisma Schema & Seeder Blueprint | completed | 833fa0a7-40ac-4652-a187-ee78edce8c0f |
| m1_r1_explorer_3 | teamwork_explorer | M1 Explorer 3: Auth, Storage & Payments Blueprint | completed | 8185b6a3-9b9e-472a-bc7e-f98936d5f354 |
| m1_r1_worker_1 | teamwork_worker | M1 Worker 1: Platform Core Implementation | in-progress | 062cd2ea-7e36-41e9-9889-73b0414ee9a4 |
| test_writer_1 | teamwork_test_writer | E2E Test Suite Creation (Tiers 1-4) | completed | d7701bc5-24dd-4e83-ba4d-51c26ba4c3f2 |

## Succession Status
- Succession required: no
- Spawn count: 8 / 16
- Pending subagents: 062cd2ea-7e36-41e9-9889-73b0414ee9a4
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-23 (*/10 * * * *)
- Safety timer: task-549 (600s)
- On succession: kill all timers before spawning successor
- On context truncation: handle timers as step 4 of the State Recovery section of your prompt says

## Artifact Index
- /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md — Original user request
- /Users/sotoon/personal/dooz/.agents/teamwork/orchestrator/DISPATCH.md — Dispatch log
- /Users/sotoon/personal/dooz/.agents/teamwork/orchestrator/BRIEFING.md — Working memory & roster
- /Users/sotoon/personal/dooz/.agents/teamwork/orchestrator/progress.md — Progress heartbeat
