# Technical Survey & Codebase Status Report

## 1. Observation

### 1.1 Repository State and File Inventory
- **Repository Root**: `/Users/sotoon/personal/dooz`
- **Git Remote**: `https://github.com/amirHHP/dooz.git`
- **Git Branch**: `main` (commit `463d636e800e0ed7606e2f3348001bae69a7a1a2`, "Initial commit")
- **File System Audit**:
  Executed `find /Users/sotoon/personal/dooz -maxdepth 3 -not -path '*/.git*'`:
  ```
  /Users/sotoon/personal/dooz
  /Users/sotoon/personal/dooz/.agents
  /Users/sotoon/personal/dooz/.agents/teamwork
  /Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md
  /Users/sotoon/personal/dooz/.agents/teamwork/...
  /Users/sotoon/personal/dooz/README.md
  ```
  Content of `/Users/sotoon/personal/dooz/README.md`: `# dooz\n`
- **Result**: The workspace is a 100% greenfield repository. There is no `package.json`, `tsconfig.json`, `next.config.*`, `.env`, `.env.example`, `.gitignore`, `prisma/`, or `src/` directory.

### 1.2 Toolchain & Runtime Environment
- **Operating System**: macOS (Darwin 24.3.0, Apple Silicon `arm64`).
- **Node.js**:
  - Command: `node -v`
  - Output: `v26.13.0`
  - Binary location: `/opt/homebrew/bin/node` (symlinked to `/opt/homebrew/Cellar/node/26.13.0_2/bin/node`)
- **npm & npx**:
  - Direct execution command: `npm -v`
  - Error verbatim: `env: node: Operation not permitted` (Exit code 126).
  - Cause: `/opt/homebrew/bin/npm` contains `#!/usr/bin/env node`. In the macOS seatbelt sandbox, `/usr/bin/env` cannot spawn the homebrew node binary directly.
  - Verified workaround: `node /opt/homebrew/bin/npm -v` succeeds with output `11.20.0`.
  - Verified workaround: `node /opt/homebrew/bin/npx -v` succeeds with output `11.20.0`.
- **Alternative Package Managers**:
  - `pnpm`: Not installed (`command not found: pnpm`).
  - `yarn`: Not installed (`command not found: yarn`).
  - `bun`: Not installed (`command not found: bun`).
- **Vercel CLI**:
  - Command: `vercel --version`
  - Output: `Vercel CLI 63.1.2 (native)` at `/opt/homebrew/bin/vercel`.
- **Git**:
  - Command: `git --version`
  - Output: `git version 2.56.0` at `/opt/homebrew/bin/git`.
- **Python**:
  - Command: `python3 --version`
  - Output: `Python 3.15.2` at `/opt/homebrew/bin/python3`.
- **SQLite**:
  - Command: `/usr/bin/sqlite3 --version`
  - Output: Available at `/usr/bin/sqlite3`.

### 1.3 Sandbox Network Constraints
- **npm Registry Connectivity**:
  - Command: `node /opt/homebrew/bin/npm view next version`
  - Output verbatim:
    ```
    npm error code E403
    npm error 403 403 Forbidden - GET https://registry.npmjs.org/next
    ```
  - Command: `curl -s -o - https://registry.npmjs.org/`
  - Output verbatim: `Request to GET / on registry.npmjs.org not allowed by policy`
  - Finding: Outbound connections to external registries (`registry.npmjs.org`) are intercepted by the local sandbox proxy (`HTTP_PROXY=http://127.0.0.1:58398`) unless `BypassSandbox: true` is passed to `run_command` (which requests elevated user authorization for network access).

### 1.4 Database & External Services
- **PostgreSQL**:
  - `which psql` -> not found
  - `which postgres` -> not found
  - `lsof -i :5432` -> closed / no listener
  - `docker` -> not found
- **Environment Variables**:
  - Executed `env | grep -E -i 'dooz|database|postgres|gemini|vercel|next'`
  - Result: No `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, or `GEMINI_API_KEY` are currently set.
- **Prisma Engine Capabilities**:
  - Tested cached Prisma engine via `node /Users/sotoon/.npm/_npx/2778af9cee32ff87/node_modules/prisma/build/index.js -v`:
    ```
    prisma               : 7.9.1
    Operating System     : darwin
    Architecture         : arm64
    Node.js              : v26.13.0
    Query Compiler       : enabled
    PSL                  : @prisma/prisma-schema-wasm 7.9.0
    Schema Engine        : schema-engine-cli darwin-arm64
    ```
  - Prisma client generation (`prisma generate`) can run offline once dependencies are populated in `node_modules`.

---

## 2. Logic Chain

1. **Premise (Greenfield Status)**:
   - Observation 1.1 confirms that only `README.md` and `.agents/` exist in `/Users/sotoon/personal/dooz`.
   - Therefore, the application architecture must be scaffolded from scratch in accordance with R1–R6: Next.js 15 App Router, Tailwind CSS, Shadcn/UI, Prisma ORM, Auth.js, and Iranian RTL/Persian localization.

2. **Premise (Toolchain Selection)**:
   - Observation 1.2 demonstrates that `node` (v26.13.0) and `npm` (v11.20.0) are installed and fully operational, while `pnpm`, `yarn`, and `bun` are absent.
   - Therefore, `npm` is the required package manager for this project.

3. **Premise (Execution Discipline in Sandboxed Shell)**:
   - Observation 1.2 shows that running `npm` directly causes `env: node: Operation not permitted` due to macOS sandbox restrictions on `/usr/bin/env`.
   - Therefore, all worker commands must execute npm scripts and binaries using the explicit prefix `node /opt/homebrew/bin/npm` or `node /opt/homebrew/bin/npx`, or workers should wrap them or use npm run scripts via node.

4. **Premise (Network Access During Scaffolding)**:
   - Observation 1.3 reveals that outbound network requests to `registry.npmjs.org` are blocked by default sandbox proxy policies (`403 Request not allowed by policy`).
   - Therefore, the initial project initialization and dependency installation (`npm install`) must execute with `BypassSandbox: true` so the user is prompted to authorize the network connection to download dependencies.

5. **Premise (Database & Prisma Architecture)**:
   - Observation 1.4 confirms that no local PostgreSQL daemon or Docker container exists on the machine, and `DATABASE_URL` is unset.
   - Requirement R6 requires: PostgreSQL with Prisma ORM (`prisma/schema.prisma` covering 9 models) and `npx prisma generate` + `npm run build` succeeding with zero errors.
   - Prisma client generation (`prisma generate`) generates TypeScript definitions directly from the schema file without requiring an active database server.
   - For database connectivity, `.env.example` must specify the PostgreSQL connection string format (e.g. `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require` compatible with Neon/Supabase/Vercel Postgres). For seed/local test workflows where no remote Postgres is supplied, a SQLite fallback or connection string simulator can be provided.

---

## 3. Caveats

1. **Network Bypass Requirement**:
   Worker agents executing `npm install` or `npx` must set `BypassSandbox: true` on `run_command` when downloading packages from npm. If executed without `BypassSandbox: true`, the command will fail with `npm error 403 Forbidden`.
2. **Node 26 Compatibility**:
   The host has Node.js `v26.13.0`. Next.js 15 and React 19 run on Node 18+, but very recent major Node versions (v26) occasionally show deprecation warnings for certain native modules or punycode. Pure TypeScript / JavaScript packages should be preferred over compiled native bindings where possible.
3. **Absence of Local PostgreSQL Server**:
   Because neither `postgres` nor `docker` is installed on macOS, live database operations (`prisma migrate deploy`, `prisma db push`, `prisma db seed`) require a reachable PostgreSQL URL (e.g. cloud Neon/Supabase or local mock/fallback) or test configuration. However, compilation, bundling (`npm run build`), and typechecking (`tsc --noEmit`) require only generated Prisma client types.

---

## 4. Conclusion

The repository is completely greenfield, ready for immediate Next.js 15 scaffolding.

### Work Item Summary for Orchestration

| Component | Status | Required Action |
|---|---|---|
| **Project Foundation** | Not Present | Scaffold Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide icons, Framer Motion, Vazirmatn font, RTL layout (`dir="rtl"`). |
| **Package Manager** | Available | Use `node /opt/homebrew/bin/npm` with `BypassSandbox: true` for installs. |
| **Data Layer (R6)** | Not Present | Create `prisma/schema.prisma` with 9 models (`User`, `ClientProfile`, `PatternProduct`, `PatternStep`, `Purchase`, `WalletTransaction`, `PayoutRequest`, `Review`, `SavedDraft`). Create `prisma/seed.ts`. |
| **Auth & Security (R6)** | Not Present | Configure Auth.js (NextAuth v5) for Credentials (email/phone + password) and OAuth with role RBAC (`USER`, `CREATOR`, `ADMIN`). |
| **Parametric Studio (R1)** | Not Present | Implement 4 base blocks (Skirt, Bodice, Sleeve, Trouser) × 3 methods (Müller, Metric, Grlawein) + posture recalculation + SVG timeline player + 1:1 scale A4/A0 PDF exports. |
| **Client CRM (R2)** | Not Present | Build `/clients` CRUD, measurements schema, posture tags, and Studio launch bridge. |
| **Marketplace (R3)** | Not Present | Build `/marketplace` catalog, filters, detail view, smart fabric consumption calculator (110cm & 150cm), and purchase sandbox. |
| **Creator Portal (R4)** | Not Present | Build `/creator/new` pattern publishing wizard, `/creator/earnings` dashboard with Recharts, 80/20 ledger accounting, and Sheba payout system. |
| **AI Reverse Engineer (R5)**| Not Present | Build `/ai-analyzer` and `/api/analyze-garment` with Gemini Vision integration and structured heuristic fallback. |
| **Config & Build (R6)** | Not Present | Create `.env.example`, verify `npx prisma generate` and `npm run build` pass with zero errors. |

---

## 5. Verification Method

To independently verify the observations and environment capabilities documented in this report:

1. **Verify Greenfield Workspace**:
   ```bash
   ls -la /Users/sotoon/personal/dooz
   git status
   ```
   *Expected*: Only `README.md`, `.git/`, and `.agents/` exist.

2. **Verify Node & npm Invocation in Sandbox**:
   ```bash
   /opt/homebrew/bin/node -v
   /opt/homebrew/bin/node /opt/homebrew/bin/npm -v
   ```
   *Expected*: Node `v26.13.0` and npm `11.20.0` output cleanly without exit code 126.

3. **Verify Shebang Failure without Node Prefix**:
   ```bash
   npm -v
   ```
   *Expected*: `env: node: Operation not permitted` (exit code 126).

4. **Verify Outbound Sandbox Network Block (Necessitating BypassSandbox)**:
   ```bash
   curl -s -o - https://registry.npmjs.org/
   ```
   *Expected*: Output contains `Request to GET / on registry.npmjs.org not allowed by policy`.

5. **Verify Vercel CLI**:
   ```bash
   /opt/homebrew/bin/vercel --version
   ```
   *Expected*: `Vercel CLI 63.1.2 (native)`.
