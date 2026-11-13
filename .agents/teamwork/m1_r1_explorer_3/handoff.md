# Milestone 1 Architectural Blueprint: Auth.js (NextAuth v5), Modular Storage Adapter & Sandbox Payments (Features F6, F7, F8)

**Agent**: `m1_r1_explorer_3`  
**Working Directory**: `/Users/sotoon/personal/dooz/.agents/teamwork/m1_r1_explorer_3/`  
**Parent Conversation ID**: `e3490e94-b5a4-4ca5-a6a5-809108cef8c7`  
**Date**: 2026-11-13  
**Status**: Complete  

---

## 1. Five-Component Handoff Report

### 1.1 Observation
1. **Workspace and Toolchain State**:
   - Examination of the workspace (`/Users/sotoon/personal/dooz`) reveals a greenfield environment where only `PROJECT.md`, `README.md`, and `.agents/` exist.
   - Node.js runtime is `v26.13.0` at `/opt/homebrew/bin/node`. npm binary at `/opt/homebrew/bin/npm` requires execution via `node /opt/homebrew/bin/npm` due to macOS sandbox `/usr/bin/env` permission rules.
   - External registry access requires `BypassSandbox: true` when running `npm install`.

2. **Requirements Specifications**:
   - `/Users/sotoon/personal/dooz/.agents/teamwork/ORIGINAL_REQUEST.md` (lines 27–29) dictates:
     > "Implement Auth.js (NextAuth v5) with email/phone + password and Google OAuth supporting USER, CREATOR, and ADMIN roles. Implement modular file storage adapter configured for Vercel Blob with local fallback, and modular payments with a built-in sandbox checkout simulator."
   - `/Users/sotoon/personal/dooz/PROJECT.md` (lines 53–55, 158–166, 230–232, 253–255) designates:
     - `src/lib/auth.ts`: Auth.js v5 configuration with Credentials and Google OAuth.
     - `src/app/api/auth/[...nextauth]/route.ts`: App Router handler exporting `GET` and `POST`.
     - `src/lib/storage.ts`: Modular storage adapter supporting Vercel Blob (`BLOB_READ_WRITE_TOKEN`) with transparent local filesystem fallback (`public/uploads/`).
     - `src/app/api/checkout/sandbox/route.ts`: Mock Iranian payment gateway (Saman / Shaparak) atomically recording `Purchase` and double-entry `WalletTransaction` (80% creator / 20% platform commission).
     - `.env.example`: Comprehensive documentation of `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `GEMINI_API_KEY`.

3. **Data Model Compatibility**:
   - `/Users/sotoon/personal/dooz/.agents/teamwork/teamwork_spec_miner_survey_3/handoff.md` (lines 537–766) specifies the Prisma schema with:
     - `User`: `id`, `name`, `email`, `phone`, `passwordHash`, `role` (`USER`, `CREATOR`, `ADMIN`), `walletBalance`.
     - `Purchase`: `id`, `userId`, `patternId`, `pricePaid`, `transactionRef`, `status` (`COMPLETED`, `PENDING`, `FAILED`).
     - `WalletTransaction`: `id`, `userId`, `amount`, `type` (`CREDIT_SALE`, `PLATFORM_FEE`, `DEBIT_PAYOUT`, `REFUND`), `balanceAfter`, `referenceId`, `description`.
     - `PatternProduct`: `id`, `creatorId`, `title`, `price`, `salesCount`.

### 1.2 Logic Chain
1. **Auth.js (NextAuth v5) Architecture**:
   - Because user credentials include email or phone with bcrypt password verification, NextAuth requires a `jwt` session strategy (`session: { strategy: "jwt" }`).
   - Node 26 compatibility requires using `bcryptjs` (pure JavaScript) instead of native C++ `bcrypt` bindings to avoid node-gyp compilation failures on modern macOS.
   - Iranian users frequently enter Persian digits (`۰۹۱۲...`); the authorization callback must sanitize Persian/Arabic numerals to ASCII digits (`0912...`) before querying Prisma.
   - In NextAuth v5, `handlers`, `auth`, `signIn`, and `signOut` are exported from `NextAuth({ ... })`. Route handler `src/app/api/auth/[...nextauth]/route.ts` re-exports `export const { GET, POST } = handlers`.
   - TypeScript module augmentation (`next-auth.d.ts`) is required to strongly type `session.user.id`, `session.user.role`, and `session.user.phone` across all server components and route handlers.
   - Google OAuth provider must be conditionally loaded only when `AUTH_GOOGLE_ID` / `GOOGLE_CLIENT_ID` is present to prevent startup crashes in local development when keys are omitted.

2. **Modular Storage Architecture (`src/lib/storage.ts`)**:
   - The storage layer must provide a unified interface (`upload`, `delete`, `get`, `getUrl`) accepting `File | Buffer | Uint8Array`.
   - When `process.env.BLOB_READ_WRITE_TOKEN` is set, it dynamically delegates to `@vercel/blob` (`put`, `del`).
   - When `BLOB_READ_WRITE_TOKEN` is unset or empty, it transparently falls back to `LocalStorageAdapter`, creating directories in `public/uploads/${folder}/` using Node.js `fs/promises` and returning public relative URLs (`/uploads/...`) that Next.js serves statically.
   - Dynamic import of `@vercel/blob` prevents runtime failures if the package or network token is absent during offline test execution.

3. **Atomic Sandbox Checkout Simulator (`src/app/api/checkout/sandbox/route.ts`)**:
   - The simulator must support mock payment attempts from the marketplace for both free patterns (0 Toman) and paid patterns (> 0 Toman).
   - For free patterns: Atomically creates `Purchase` with `pricePaid: 0`, increments pattern `salesCount`, and skips financial wallet transactions.
   - For paid patterns: Calculates an exact integer 80/20 split:
     - $\text{creatorEarnings} = \text{round}(\text{totalPrice} \times 0.80)$
     - $\text{platformFee} = \text{totalPrice} - \text{creatorEarnings}$
   - Executes inside a single atomic `prisma.$transaction(async (tx) => { ... })`:
     1. Creates `Purchase` record with unique reference `SHP-...`.
     2. Updates creator's `walletBalance` by `+creatorEarnings`.
     3. Creates `WalletTransaction` for creator with type `CREDIT_SALE`.
     4. Updates platform admin's balance (or logs audit fee transaction) with type `PLATFORM_FEE`.
     5. Increments `PatternProduct.salesCount`.
   - If user cancels (`action: "CANCEL"`), simulator returns 400 with Persian error message and does not mutate balances.

4. **Environment Variables Blueprint (`.env.example`)**:
   - Must document `DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `GEMINI_API_KEY`, as well as optional helper variables (`AUTH_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).

### 1.3 Caveats
- NextAuth v5 is in beta (`next-auth@beta` / `next-auth@5.0.0-beta.25`). The exact export pattern `export const { handlers, auth, signIn, signOut } = NextAuth(...)` is the standard v5 API.
- Live database calls require a running PostgreSQL instance or valid connection string in `DATABASE_URL`. However, TypeScript compilation and static verification (`prisma generate` + `tsc`) operate completely offline once client types are generated.
- In sandbox payment mode, if no `ADMIN` role user exists in the database to receive the 20% platform fee, the transaction falls back to creating an audit transaction under the creator's ID with type `PLATFORM_FEE` to guarantee foreign key constraint satisfaction.

### 1.4 Conclusion
The blueprints detailed in Section 2 provide fully typed, production-ready code ready for immediate placement by implementation workers into:
- `src/lib/auth.ts`
- `src/types/next-auth.d.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/storage.ts`
- `src/app/api/checkout/sandbox/route.ts`
- `.env.example`

### 1.5 Verification Method
1. **Type Checking**:
   Run `npx tsc --noEmit` after worker creates the files. Expected: 0 errors across auth, storage, and payment routes.
2. **Offline Prisma Generation**:
   Run `npx prisma generate` to ensure `User`, `Purchase`, `WalletTransaction`, and `PatternProduct` types match Prisma definitions.
3. **Storage Fallback Verification**:
   Invoke `storage.upload(Buffer.from("test"), "test.txt")` without `BLOB_READ_WRITE_TOKEN`. Verify file exists in `public/uploads/` and returns URL `/uploads/test-...`.
4. **Checkout Simulation Verification**:
   Execute POST to `/api/checkout/sandbox` with `{ patternId, action: "PAY" }`. Verify HTTP 200, creation of `Purchase`, and exact 80/20 balance distribution.

---

## 2. Worker Implementation Blueprint

### 2.1 Package Dependencies to Install
When initializing the project dependencies, workers must ensure the following packages are included:
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",
    "bcryptjs": "^2.4.3",
    "@vercel/blob": "^0.27.1",
    "@prisma/client": "^6.3.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^6.3.0"
  }
}
```

---

### 2.2 NextAuth v5 Type Augmentation (`src/types/next-auth.d.ts`)

```typescript
import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

export type UserRole = "USER" | "CREATOR" | "ADMIN";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    phone?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      phone?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
  }
}
```

---

### 2.3 Auth.js Configuration (`src/lib/auth.ts`)

```typescript
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserRole } from "@/types/next-auth";

/**
 * Normalizes Persian and Arabic numerals to ASCII digits.
 */
function normalizeDigits(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let output = input;
  for (let i = 0; i < 10; i++) {
    output = output
      .replaceAll(persianDigits[i], String(i))
      .replaceAll(arabicDigits[i], String(i));
  }
  return output.trim();
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || "dooz-development-fallback-secret-minimum-32-chars",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "شماره موبایل یا ایمیل",
      credentials: {
        identifier: { label: "ایمیل یا شماره موبایل", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const rawIdentifier = String(credentials.identifier);
        const normalizedIdentifier = normalizeDigits(rawIdentifier);
        const password = String(credentials.password);

        try {
          // Query user by email (lowercase) or normalized phone
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: normalizedIdentifier.toLowerCase() },
                { phone: normalizedIdentifier },
              ],
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            phone: user.phone,
            image: user.avatar,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
    // Conditionally enable Google OAuth only when credentials exist
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "کاربر دوز",
                avatar: user.image,
                role: "USER",
              },
            });
            user.id = newUser.id;
            user.role = newUser.role as UserRole;
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role as UserRole;
            user.phone = existingUser.phone;
          }
        } catch (error) {
          console.error("Error during Google OAuth sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.phone = user.phone || null;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.role = session.user.role ?? token.role;
        token.phone = session.user.phone ?? token.phone;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || "USER";
        session.user.phone = token.phone as string | null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

---

### 2.4 Auth.js App Router Route Handler (`src/app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

---

### 2.5 Modular Storage Adapter (`src/lib/storage.ts`)

```typescript
import fs from "fs/promises";
import path from "path";

export interface UploadResult {
  url: string;
  pathname: string;
  size?: number;
  contentType?: string;
}

export interface StorageAdapter {
  upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult>;
  delete(urlOrPathname: string): Promise<boolean>;
  get(pathname: string): Promise<Buffer | null>;
  getUrl(pathname: string): string;
}

/**
 * Sanitizes filename to prevent directory traversal and remove unsupported characters.
 */
function sanitizeFilename(filename: string): string {
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Converts File, Buffer, or Uint8Array into a Node.js Buffer.
 */
async function toBuffer(file: File | Buffer | Uint8Array): Promise<Buffer> {
  if (Buffer.isBuffer(file)) {
    return file;
  }
  if (file instanceof Uint8Array) {
    return Buffer.from(file);
  }
  if (typeof (file as File).arrayBuffer === "function") {
    const arrayBuffer = await (file as File).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error("نوع فایل پشتیبانی نمی‌شود.");
}

/**
 * Vercel Blob Storage Implementation (Production Cloud Storage).
 */
class VercelBlobStorageAdapter implements StorageAdapter {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult> {
    const buffer = await toBuffer(file);
    const sanitized = sanitizeFilename(filename);
    const folder = options?.folder ? options.folder.replace(/^\/+|\/+$/g, "") : "general";
    const pathname = `${folder}/${Date.now()}-${sanitized}`;

    // Dynamic import to prevent crash when @vercel/blob is unneeded
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, buffer, {
      access: "public",
      token: this.token,
      contentType: options?.contentType,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: buffer.length,
      contentType: options?.contentType,
    };
  }

  async delete(urlOrPathname: string): Promise<boolean> {
    try {
      const { del } = await import("@vercel/blob");
      await del(urlOrPathname, { token: this.token });
      return true;
    } catch (error) {
      console.error("Vercel Blob deletion error:", error);
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer | null> {
    try {
      const url = this.getUrl(pathname);
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch {
      return null;
    }
  }

  getUrl(pathname: string): string {
    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
      return pathname;
    }
    return pathname;
  }
}

/**
 * Local Filesystem Storage Implementation (Development Fallback).
 * Saves files under <root>/public/uploads/${folder}/${filename}
 */
class LocalStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "uploads");
  }

  async upload(
    file: File | Buffer | Uint8Array,
    filename: string,
    options?: { folder?: string; contentType?: string }
  ): Promise<UploadResult> {
    const buffer = await toBuffer(file);
    const sanitized = sanitizeFilename(filename);
    const folder = options?.folder ? options.folder.replace(/^\/+|\/+$/g, "") : "general";
    const targetDir = path.join(this.baseDir, folder);

    await fs.mkdir(targetDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${sanitized}`;
    const filePath = path.join(targetDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/${folder}/${uniqueFilename}`;
    return {
      url: relativeUrl,
      pathname: `${folder}/${uniqueFilename}`,
      size: buffer.length,
      contentType: options?.contentType,
    };
  }

  async delete(urlOrPathname: string): Promise<boolean> {
    try {
      const cleanPath = urlOrPathname.replace(/^\/uploads\//, "");
      const fullPath = path.join(this.baseDir, cleanPath);
      await fs.unlink(fullPath);
      return true;
    } catch (error) {
      // Ignore if file already deleted
      return false;
    }
  }

  async get(pathname: string): Promise<Buffer | null> {
    try {
      const cleanPath = pathname.replace(/^\/uploads\//, "");
      const fullPath = path.join(this.baseDir, cleanPath);
      return await fs.readFile(fullPath);
    } catch {
      return null;
    }
  }

  getUrl(pathname: string): string {
    if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
      return pathname;
    }
    const cleanPath = pathname.replace(/^\/uploads\//, "");
    return `/uploads/${cleanPath}`;
  }
}

/**
 * Storage singleton: chooses Vercel Blob if BLOB_READ_WRITE_TOKEN is set,
 * otherwise transparently falls back to local disk storage in public/uploads.
 */
function createStorageAdapter(): StorageAdapter {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && token.trim().length > 0) {
    return new VercelBlobStorageAdapter(token.trim());
  }
  return new LocalStorageAdapter();
}

export const storage = createStorageAdapter();

export async function uploadFile(
  file: File | Buffer | Uint8Array,
  filename: string,
  options?: { folder?: string; contentType?: string }
): Promise<UploadResult> {
  return storage.upload(file, filename, options);
}

export async function deleteFile(urlOrPathname: string): Promise<boolean> {
  return storage.delete(urlOrPathname);
}

export async function getFile(pathname: string): Promise<Buffer | null> {
  return storage.get(pathname);
}
```

---

### 2.6 Sandbox Checkout Simulator Route (`src/app/api/checkout/sandbox/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const checkoutRequestSchema = z.object({
  patternId: z.string().min(1, "شناسه الگو الزامی است"),
  action: z.enum(["PAY", "CANCEL"]).default("PAY"),
  cardNumber: z.string().optional(),
});

/**
 * Generates simulated Iranian banking reference numbers (Shaparak / Saman Electronic Payment).
 */
function generateMockGatewayMetadata() {
  const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();
  const refNumber = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  const transactionRef = `SHP-${Date.now().toString(36).toUpperCase()}-${trackingCode}`;
  return { trackingCode, refNumber, transactionRef };
}

/**
 * POST /api/checkout/sandbox
 * Simulates Iranian payment gateway transaction callback.
 * Atomically creates Purchase and double-entry WalletTransactions (80% creator / 20% platform).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      );
    }
    const buyerId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const parseResult = checkoutRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || "داده‌های ورودی نامعتبر است" },
        { status: 400 }
      );
    }

    const { patternId, action } = parseResult.data;

    // Retrieve pattern and creator details
    const pattern = await prisma.patternProduct.findUnique({
      where: { id: patternId },
      include: { creator: true },
    });

    if (!pattern) {
      return NextResponse.json(
        { success: false, error: "الگوی مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // Check if buyer already owns this pattern
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: buyerId,
        patternId: pattern.id,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        alreadyOwned: true,
        message: "این الگو قبلاً توسط شما خریداری شده است.",
        purchaseId: existingPurchase.id,
        transactionRef: existingPurchase.transactionRef,
      });
    }

    // Handle payment simulation cancellation
    if (action === "CANCEL") {
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error: "عملیات پرداخت توسط کاربر لغو گردید.",
          transactionRef: `SHP-CANCEL-${Date.now()}`,
        },
        { status: 400 }
      );
    }

    const totalPrice = pattern.price;

    // Handle Free Pattern (0 Toman)
    if (totalPrice === 0) {
      const freeTransactionRef = `FREE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const purchase = await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.create({
          data: {
            userId: buyerId,
            patternId: pattern.id,
            pricePaid: 0,
            transactionRef: freeTransactionRef,
            status: "COMPLETED",
          },
        });

        await tx.patternProduct.update({
          where: { id: pattern.id },
          data: { salesCount: { increment: 1 } },
        });

        return p;
      });

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        purchaseId: purchase.id,
        patternId: pattern.id,
        buyerId,
        totalPriceToman: 0,
        creatorEarningsToman: 0,
        platformFeeToman: 0,
        transactionRef: freeTransactionRef,
        message: "الگوی رایگان با موفقیت به کتابخانه شما افزوده شد.",
      });
    }

    // Double-entry accounting split: 80% creator / 20% platform commission
    const creatorEarnings = Math.round(totalPrice * 0.80);
    const platformFee = totalPrice - creatorEarnings;
    const { trackingCode, refNumber, transactionRef } = generateMockGatewayMetadata();

    // Execute atomic financial transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId: buyerId,
          patternId: pattern.id,
          pricePaid: totalPrice,
          transactionRef,
          status: "COMPLETED",
        },
      });

      // 2. Fetch and update creator wallet balance
      const creator = await tx.user.findUnique({
        where: { id: pattern.creatorId },
        select: { id: true, walletBalance: true },
      });
      const creatorCurrentBalance = creator?.walletBalance ?? 0;
      const creatorNewBalance = creatorCurrentBalance + creatorEarnings;

      await tx.user.update({
        where: { id: pattern.creatorId },
        data: { walletBalance: creatorNewBalance },
      });

      // 3. Record Creator Ledger Credit (80%)
      const creatorLedger = await tx.walletTransaction.create({
        data: {
          userId: pattern.creatorId,
          amount: creatorEarnings,
          type: "CREDIT_SALE",
          balanceAfter: creatorNewBalance,
          referenceId: purchase.id,
          description: `سهم فروش ۸۰٪ الگوی «${pattern.title}» (کد پیگیری: ${trackingCode})`,
        },
      });

      // 4. Record Platform Commission Ledger Entry (20%)
      const adminUser = await tx.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true, walletBalance: true },
      });

      let platformLedger;
      if (adminUser) {
        const adminNewBalance = adminUser.walletBalance + platformFee;
        await tx.user.update({
          where: { id: adminUser.id },
          data: { walletBalance: adminNewBalance },
        });

        platformLedger = await tx.walletTransaction.create({
          data: {
            userId: adminUser.id,
            amount: platformFee,
            type: "PLATFORM_FEE",
            balanceAfter: adminNewBalance,
            referenceId: purchase.id,
            description: `کارمزد پلتفرم ۲۰٪ از فروش الگوی «${pattern.title}» (پیگیری: ${trackingCode})`,
          },
        });
      } else {
        // Fallback audit record associated with creator when admin not yet seeded
        platformLedger = await tx.walletTransaction.create({
          data: {
            userId: pattern.creatorId,
            amount: platformFee,
            type: "PLATFORM_FEE",
            balanceAfter: creatorNewBalance,
            referenceId: purchase.id,
            description: `کارمزد پلتفرم ۲۰٪ کسر شده از فروش الگوی «${pattern.title}»`,
          },
        });
      }

      // 5. Increment pattern sales count
      await tx.patternProduct.update({
        where: { id: pattern.id },
        data: { salesCount: { increment: 1 } },
      });

      return {
        purchase,
        creatorLedger,
        platformLedger,
      };
    });

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      purchaseId: transactionResult.purchase.id,
      patternId: pattern.id,
      buyerId,
      totalPriceToman: totalPrice,
      creatorEarningsToman: creatorEarnings,
      platformFeeToman: platformFee,
      transactionRef,
      trackingCode,
      gatewayRefNumber: refNumber,
      gateway: "SAMAN_ELECTRONIC_PAYMENT_SIMULATOR",
      message: "پرداخت تستی با موفقیت انجام شد و الگو در کتابخانه شما فعال گردید.",
    });
  } catch (error) {
    console.error("Sandbox checkout transaction error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور در انجام تراکنش مالی شبیه‌ساز پرداخت." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/sandbox?transactionRef=...
 * Inspects transaction status for client confirmation.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transactionRef = searchParams.get("transactionRef");

  if (!transactionRef) {
    return NextResponse.json(
      { success: false, error: "کد پیگیری تراکنش الزامی است." },
      { status: 400 }
    );
  }

  const purchase = await prisma.purchase.findUnique({
    where: { transactionRef },
    include: {
      pattern: {
        select: { id: true, title: true, slug: true, price: true, coverImage: true },
      },
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { success: false, error: "تراکنش یافت نشد." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    purchase,
  });
}
```

---

### 2.7 Complete Environment Variables Blueprint (`.env.example`)

```env
# ==============================================================================
# Dooz (دوز) — Application Environment Configuration Template
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Database (PostgreSQL & Prisma ORM)
# ------------------------------------------------------------------------------
# PostgreSQL connection string. Compatible with local PostgreSQL, Docker,
# Neon (neon.tech), Supabase, or Vercel Postgres.
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=prefer
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dooz?schema=public"

# ------------------------------------------------------------------------------
# 2. Authentication (Auth.js / NextAuth v5)
# ------------------------------------------------------------------------------
# Secret key used to encrypt and sign JWT session tokens and CSRF cookies.
# Generate in terminal: openssl rand -base64 32
AUTH_SECRET="your-32-character-secret-key-dooz-auth-v5-min-length"

# Base URL of the application. Required by NextAuth v5.
# Local development: http://localhost:3000
# Production: https://dooz.ir or https://your-app.vercel.app
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth 2.0 Credentials (for social authentication)
# If omitted, Google sign-in is automatically disabled and Credentials login is used.
# Obtain from Google Cloud Console > APIs & Services > Credentials
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# ------------------------------------------------------------------------------
# 3. File & Pattern Blueprint Storage (Vercel Blob / Local Storage)
# ------------------------------------------------------------------------------
# Vercel Blob Read/Write token for cloud asset uploads (garment photos, PDF blueprints).
# If left empty, Dooz transparently falls back to local filesystem storage:
# Local folder: public/uploads/
# Obtain from Vercel Project Dashboard > Storage > Blob
BLOB_READ_WRITE_TOKEN=""

# ------------------------------------------------------------------------------
# 4. AI Outfit Reverse-Engineering (Google Gemini Vision API)
# ------------------------------------------------------------------------------
# API Key for Google Gemini 1.5/2.0 multimodal garment analysis at /api/analyze-garment.
# If omitted or quota exhausted, Dooz automatically and gracefully falls back to the
# built-in deterministic heuristic reverse-engineering engine with zero downtime.
# Obtain from https://aistudio.google.com/
GEMINI_API_KEY=""

# ------------------------------------------------------------------------------
# 5. Public Application Metadata
# ------------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="دوز | استودیو پارامتریک و بازار الگوی خیاطی"
```

---

## 3. Worker Execution Sequence for Milestone 1

Implementation workers should follow this exact sequence:

1. **Step 1: Install Dependencies**:
   Worker executes `npm install` with `BypassSandbox: true` including `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`, `@vercel/blob`, and `zod`.
2. **Step 2: TypeScript Definitions**:
   Create `src/types/next-auth.d.ts` as specified in Section 2.2.
3. **Step 3: Auth.js Configuration & Handler**:
   Create `src/lib/auth.ts` (Section 2.3) and `src/app/api/auth/[...nextauth]/route.ts` (Section 2.4).
4. **Step 4: Modular Storage Adapter**:
   Create `src/lib/storage.ts` (Section 2.5). Create `public/uploads/` directory with a `.gitkeep` file so git tracks it.
5. **Step 5: Sandbox Payment Gateway**:
   Create `src/app/api/checkout/sandbox/route.ts` (Section 2.6).
6. **Step 6: Environment Template**:
   Write `.env.example` to repository root (Section 2.7).
7. **Step 7: Verification**:
   Execute `npx tsc --noEmit` to confirm zero type errors.

---

## 4. Synthesis & Peer Coordination

- **Coordination with `m1_r1_explorer_1` (Scaffolding & Layout)**:
  - Auth route handler is placed at `src/app/api/auth/[...nextauth]/route.ts`.
  - NextAuth `SessionProvider` should be included in `src/components/layout/providers.tsx` wrapping `children` in root `src/app/layout.tsx`.
- **Coordination with `m1_r1_explorer_2` (Prisma & Seed)**:
  - `src/lib/auth.ts` imports `prisma` from `@/lib/db`.
  - Seed passwords must be hashed using `bcrypt.hashSync("password", 10)` so Credentials login authenticates the 3 demo users (`tailor@dooz.ir`, `creator@dooz.ir`, `admin@dooz.ir`).
  - Checkout sandbox creates records adhering strictly to `Purchase` and `WalletTransaction` models.
