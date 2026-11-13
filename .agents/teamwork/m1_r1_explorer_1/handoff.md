# Milestone 1 Implementation Blueprint & Handoff Report
**Platform Core, Design System & RTL Layout (Features F1, F2, F3, F8)**

## 1. Observation

### 1.1 Codebase & File State
- **Workspace**: `/Users/sotoon/personal/dooz`
- **Initial State**: Greenfield repository containing only `.git/`, `README.md`, `PROJECT.md`, `TEST_INFRA.md`, and `.agents/`.
- **Target Directories**: `src/app/`, `src/components/`, `src/lib/` do not yet exist.
- **Requirements Reference**:
  - `ORIGINAL_REQUEST.md` (lines 27–29, 51–54): Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide icons, Framer Motion, class-variance-authority, clsx, tailwind-merge, Vazirmatn font, full Persian RTL (`dir="rtl"`), Toman formatting, `.env.example`, and clean build.
  - `PROJECT.md` (lines 48–55, 95): Feature F1 (Greenfield Next.js 15 & TS Setup), Feature F2 (Design System & UI Kit), Feature F3 (RTL Persian Typography & Localization), Feature F8 (Config & Build Baseline).
  - `TEST_INFRA.md` (lines 14–21): 4-tier test specifications for F1, F2, F3, F8.

### 1.2 Toolchain & Execution Restrictions
- **Node.js**: `v26.13.0` at `/opt/homebrew/bin/node`.
- **npm**: `11.20.0` at `/opt/homebrew/bin/npm`.
- **Direct Execution**:
  - Running `npm -v` fails verbatim: `env: node: Operation not permitted` (exit code 126).
  - Workaround command: `/opt/homebrew/bin/node /opt/homebrew/bin/npm <args>` succeeds cleanly.
- **Sandbox Network Constraints**:
  - `curl -s -I https://registry.npmjs.org/` returns HTTP 403 Forbidden (`Request to GET / on registry.npmjs.org not allowed by policy`).
  - `curl -s -I https://fonts.googleapis.com/` returns HTTP 403 Forbidden.
  - Worker commands executing package downloads (`npm install`) **MUST** specify `BypassSandbox: true`.
- **Font Bundling Discovery**:
  - Because `fonts.googleapis.com` is blocked by default sandbox proxy policies, using `next/font/google` in offline build scenarios can trigger build-time font fetch failures.
  - Using `@fontsource-variable/vazirmatn` bundled in `node_modules` and imported in `src/app/globals.css` completely decouples font rendering from external network requests, ensuring 100% offline build immunity.

### 1.3 Localization & Runtime Capabilities
- **Persian Calendar & Digit Support**:
  - Tested: `node -e 'console.log(new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-persian", { year: "numeric", month: "long", day: "numeric" }).format(new Date("2026-11-13T06:00:00Z")))'`
  - Output verbatim: `۲۲ آبان ۱۴۰۵`.
  - Tested: `node -e 'console.log(new Intl.NumberFormat("fa-IR").format(1250000))'`
  - Output verbatim: `۱٬۲۵۰٬۰۰۰`.
  - Native `Intl` handles Persian calendar, Persian numerals, and number formatting without external date libraries.

---

## 2. Logic Chain

1. **Scaffolding Strategy**:
   - The repository is greenfield (Observation 1.1).
   - Therefore, the Worker must construct all configuration baselines (`package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `components.json`, `.gitignore`, `.env.example`) and foundational application files before running compilation checks.

2. **Command Invocation Discipline**:
   - Direct execution of `npm` or `npx` fails with code 126 due to macOS seatbelt sandbox shebang blocking (Observation 1.2).
   - Outbound connections to `registry.npmjs.org` are intercepted and blocked with HTTP 403 by the sandbox proxy (Observation 1.2).
   - Therefore, the Worker must run `/opt/homebrew/bin/node /opt/homebrew/bin/npm install --legacy-peer-deps` with `BypassSandbox: true`.

3. **Font Loading & Offline Resilience**:
   - Outbound requests to `fonts.googleapis.com` return 403 (Observation 1.2).
   - Next.js `next/font/google` attempts to fetch font files during `next build`.
   - Bundling `@fontsource-variable/vazirmatn` locally via npm guarantees that Vazirmatn is available locally inside the build sandbox without network requests.
   - Therefore, the Tailwind typography stack must point to `'Vazirmatn Variable', 'Vazirmatn', system-ui, sans-serif` via `@fontsource-variable/vazirmatn`.

4. **Localization Architecture**:
   - Native Node and browser `Intl` APIs natively support `fa-IR-u-ca-persian` (Observation 1.3).
   - Therefore, `src/lib/format.ts` should implement deterministic utilities (`formatToman`, `toPersianDigits`, `toLatinDigits`, `formatJalaliDate`, `formatNumber`) using standard JavaScript built-ins, adhering strictly to the minimal-dependency Solution Ladder.

5. **Layout & Component Structure**:
   - The root layout (`src/app/layout.tsx`) must set `dir="rtl"` and `lang="fa"`.
   - The navigation bar (`src/components/layout/navbar.tsx`) and footer (`src/components/layout/footer.tsx`) must expose routing anchors to all 5 core application pillars:
     - `/studio` (Parametric Studio)
     - `/clients` (Tailor CRM)
     - `/marketplace` (Pattern Marketplace)
     - `/ai-analyzer` (Gemini Garment Assistant)
     - `/creator` (Creator Portal)
   - Landing page (`src/app/page.tsx`) must deliver Persian marketing copy, interactive feature showcases, and drafting method cards (Müller, Metric, Grlawein).

---

## 3. Caveats

1. **Interactive Sandbox Prompt**: The `BypassSandbox: true` flag on `run_command` initiates a permission elevation prompt. The Worker should run `npm install` in a single unified execution step to avoid prompting repeatedly.
2. **React 19 Peer Dependencies**: React 19 is specified. While modern versions of `lucide-react`, `clsx`, `tailwind-merge`, and `class-variance-authority` support React 19, passing `--legacy-peer-deps` to npm install prevents potential strict peer dependency locks from auxiliary tools.
3. **Database Client Status in M1**: Full Prisma schema and seed are slated for Milestone 1 / Milestone 2 integration. While `@prisma/client` and `prisma` are included in `package.json`, `npx prisma generate` should only be called if `prisma/schema.prisma` is present.

---

## 4. Conclusion & Complete Implementation Blueprint

The Worker must create the following 15 files and execute the build verification.

### File 1: `/Users/sotoon/personal/dooz/package.json`
```json
{
  "name": "dooz",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "node tests/runner.mjs"
  },
  "dependencies": {
    "@fontsource-variable/vazirmatn": "^5.1.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.4.7",
    "lucide-react": "^0.475.0",
    "next": "^15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.0",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.2",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.7.3"
  }
}
```

### File 2: `/Users/sotoon/personal/dooz/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### File 3: `/Users/sotoon/personal/dooz/next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
```

### File 4: `/Users/sotoon/personal/dooz/postcss.config.mjs`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### File 5: `/Users/sotoon/personal/dooz/tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "var(--font-vazirmatn)",
          "Vazirmatn Variable",
          "Vazirmatn",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        dooz: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### File 6: `/Users/sotoon/personal/dooz/components.json`
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### File 7: `/Users/sotoon/personal/dooz/.env.example`
```bash
# Database (PostgreSQL / Neon / Supabase / Vercel Postgres)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dooz?schema=public"

# Auth.js (NextAuth v5)
AUTH_SECRET="change-me-to-a-secure-random-32-byte-hex-or-base64-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-to-a-secure-random-32-byte-hex-or-base64-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional for local development)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Modular File Storage (Vercel Blob / Local Storage Fallback)
BLOB_READ_WRITE_TOKEN=""

# AI Garment Reverse-Engineering (Google Gemini API)
GEMINI_API_KEY=""

# Application Runtime
NODE_ENV="development"
PORT="3000"
```

### File 8: `/Users/sotoon/personal/dooz/.gitignore`
```gitignore
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js build output
/.next/
/out/

# Production
/build

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# OS & IDE
.DS_Store
*.pem
.idea/
.vscode/
```

### File 9: `/Users/sotoon/personal/dooz/src/app/globals.css`
```css
@import "@fontsource-variable/vazirmatn";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 271 81% 56%;
    --primary-foreground: 210 20% 98%;
    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --accent: 262 83% 96%;
    --accent-foreground: 271 81% 40%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 271 81% 56%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --primary: 271 81% 60%;
    --primary-foreground: 210 20% 98%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 271 40% 20%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 271 81% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    direction: rtl;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-vazirmatn), "Vazirmatn Variable", "Vazirmatn", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
}
```

### File 10: `/Users/sotoon/personal/dooz/src/lib/utils.ts`
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional CSS classes cleanly using clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### File 11: `/Users/sotoon/personal/dooz/src/lib/format.ts`
```typescript
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Latin digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] || digit);
}

/**
 * Converts Persian and Arabic digits to standard Latin digits (0-9).
 * Crucial for parsing form inputs, Sheba codes, and measurement numbers.
 */
export function toLatinDigits(input: string): string {
  if (!input) return "";
  let result = String(input);
  for (let i = 0; i < 10; i++) {
    result = result.split(PERSIAN_DIGITS[i]).join(String(i));
    result = result.split(ARABIC_DIGITS[i]).join(String(i));
  }
  return result;
}

/**
 * Formats an integer amount in Iranian Toman with thousands separator.
 * Example: 150000 -> "۱۵۰٬۰۰۰ تومان"
 */
export function formatToman(
  amount: number,
  options: { showUnit?: boolean; persianDigits?: boolean } = {}
): string {
  const { showUnit = true, persianDigits = true } = options;
  const num = Math.round(Number(amount) || 0);

  if (!persianDigits) {
    const formatted = new Intl.NumberFormat("en-US").format(num);
    return showUnit ? `${formatted} تومان` : formatted;
  }

  const formatted = new Intl.NumberFormat("fa-IR").format(num);
  return showUnit ? `${formatted} تومان` : formatted;
}

/**
 * Formats arbitrary numbers (e.g. measurements in cm, ease values, coordinates).
 */
export function formatNumber(
  value: number,
  options: { decimals?: number; persianDigits?: boolean } = {}
): string {
  const { decimals = 1, persianDigits = true } = options;
  const num = Number(value) || 0;

  if (!persianDigits) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats a Date object or ISO string into Jalali (Persian) calendar representation.
 * Example: "۲۲ آبان ۱۴۰۵"
 */
export function formatJalaliDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-persian", {
    ...defaultOptions,
    ...options,
  }).format(d);
}
```

### File 12: `/Users/sotoon/personal/dooz/src/components/layout/navbar.tsx`
```tsx
import Link from "next/link";
import { Scissors, Ruler, ShoppingBag, Sparkles, User, Palette } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <Scissors className="h-5 w-5 transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-foreground">دوز</span>
              <span className="text-[10px] text-muted-foreground -mt-1 font-medium">استودیو الگوسازی پارامتریک</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/studio"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Ruler className="h-4 w-4 text-primary" />
              <span>استودیو الگو</span>
            </Link>
            <Link
              href="/clients"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-primary" />
              <span>پرونده مشتریان</span>
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>مارکت‌پلیس الگو</span>
            </Link>
            <Link
              href="/ai-analyzer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>دستیار هوش مصنوعی</span>
            </Link>
            <Link
              href="/creator"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
            >
              <Palette className="h-4 w-4 text-primary" />
              <span>پنل طراحان</span>
            </Link>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Scissors className="h-4 w-4" />
            <span>شروع الگوسازی</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### File 13: `/Users/sotoon/personal/dooz/src/components/layout/footer.tsx`
```tsx
import Link from "next/link";
import { Scissors, Heart } from "lucide-react";
import { formatJalaliDate } from "@/lib/format";

export function Footer() {
  const currentYear = formatJalaliDate(new Date(), { year: "numeric" });

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Scissors className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">دوز (Dooz)</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              سامانه یکپارچه الگوسازی پارامتریک، پرونده اندازه‌گیری مشتریان خیاطی و مارکت‌پلیس دوطرفه الگو در ایران. محاسبات هندسی دقیق با خروجی چاپ سایز واقعی ۱:۱.
            </p>
          </div>

          {/* Col 2: Platform Modules */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">بخش‌های سامانه</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/studio" className="hover:text-primary transition-colors">استودیو پارامتریک الگو</Link>
              </li>
              <li>
                <Link href="/clients" className="hover:text-primary transition-colors">مدیریت مشتریان و اندازه‌ها</Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary transition-colors">فروشگاه و مارکت‌پلیس الگوها</Link>
              </li>
              <li>
                <Link href="/ai-analyzer" className="hover:text-primary transition-colors">آنالیز هوشمند لباس با هوش مصنوعی</Link>
              </li>
              <li>
                <Link href="/creator" className="hover:text-primary transition-colors">پنل طراحان و درآمدزایی</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Drafting Methods */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">متدهای الگوسازی</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>متد مولر آلمان (Müller) — دقت و برازش عالی</li>
              <li>متد متریک انگلیس (Metric) — استاندارد صنعتی</li>
              <li>متد گرلاوین (Grlawein) — سادگی و بومی‌سازی</li>
              <li>تطبیق عیوب اندامی (شکم، گودی کمر، شانه)</li>
              <li>خروجی PDF پلاتر A0 و کاشی‌بندی A4 شابلون‌دار</li>
            </ul>
          </div>

          {/* Col 4: Standards & Integrity */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">استانداردها و تضمین‌ها</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>مقیاس چاپ ۱:۱ به همراه مربع کالیبراسیون ۵×۵ سانتی‌متر</li>
              <li>محاسبه خودکار متراژ پارچه برای عرض‌های ۱۱۰ و ۱۵۰ سانتی‌متر</li>
              <li>تسهیم منصفانه ۸۰٪ سهم طراح / ۲۰٪ کارمزد پلتفرم</li>
              <li>تسویه حساب مستقیم بانکی از طریق شماره شبا</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {currentYear} دوز. تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-1">
            طراحی‌شده با <Heart className="h-3 w-3 text-red-500 fill-red-500" /> برای جامعه خیاطان و طراحان ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### File 14: `/Users/sotoon/personal/dooz/src/app/layout.tsx`
```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "دوز (Dooz) | سامانه تخصصی الگوسازی پارامتریک و مارکت‌پلیس الگو",
  description:
    "استودیو محاسبات دقیق الگوهای خیاطی با متدهای مولر، متریک و گرلاوین، پرونده مشتریان، مارکت‌پلیس الگو، دستیار هوش مصنوعی و خروجی چاپ ۱:۱.",
  keywords: [
    "الگوسازی خیاطی",
    "متد مولر",
    "متد متریک",
    "گرلاوین",
    "مارکت پلیس الگو",
    "پرونده خیاطی",
    "خروجی A4 الگو",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### File 15: `/Users/sotoon/personal/dooz/src/app/page.tsx`
```tsx
import Link from "next/link";
import {
  Scissors,
  Ruler,
  ShoppingBag,
  Sparkles,
  Users,
  Printer,
  ChevronLeft,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Layers,
} from "lucide-react";
import { formatToman } from "@/lib/format";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-start">
            <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>پلتفرم نسل جدید خیاطی و طراحی پوشاک در ایران</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              انقلاب الگوسازی دقیق خیاطی با <span className="text-primary">محاسبات پارامتریک</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              دوز (Dooz) پلتفرم هوشمندی است که الگوهای پایه (دامن، بالاتنه، آستین و شلوار) را بر اساس متدهای مولر، متریک و گرلاوین، متناسب با اندازه‌های اختصاصی و عیوب اندامی هر مشتری، به صورت ریاضی و بدون تقریب ترسیم می‌کند.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:shadow-lg"
              >
                <Scissors className="h-5 w-5" />
                <span>ورود به استودیو الگوسازی</span>
                <ChevronLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span>کاوش در مارکت‌پلیس</span>
              </Link>
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                خروجی ۱:۱ واقعی با مربع کالیبراسیون ۵cm
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                سازگار با پرینتر معمولی A4 و پلاتر A0
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                تطبیق عیوب اندامی در لحظه
              </span>
            </div>
          </div>

          {/* Interactive Hero Card Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border bg-card p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-muted-foreground me-2">Dooz Studio CAD Engine</span>
                </div>
                <span className="inline-block rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-bold border border-emerald-200">
                  متد مولر (Müller)
                </span>
              </div>

              {/* Parametric preview block */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">الگوی پایه فعال:</span>
                  <span className="font-bold text-foreground">بالاتنه پیش و پشت با ساسون سینه</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">دور سینه / دور کمر / دور باسن:</span>
                  <span className="font-mono font-medium text-foreground">96cm / 76cm / 102cm</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">تطبیق عیوب اندامی:</span>
                  <span className="inline-flex items-center gap-1 text-primary font-bold">
                    <span>شکم برجسته (+1.5cm)</span>
                    <span>•</span>
                    <span>گودی کمر (-1.0cm)</span>
                  </span>
                </div>
              </div>

              {/* Graphic Mock Canvas */}
              <div className="relative h-44 rounded-xl border bg-muted/40 p-3 flex flex-col justify-between overflow-hidden">
                <div className="flex justify-between items-center text-[11px] text-muted-foreground font-mono">
                  <span>A4 Tiled Grid (3 × 4 Pages)</span>
                  <span className="text-primary font-bold">Scale 100%</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative border-2 border-dashed border-primary/60 rounded-lg p-4 bg-background/80 flex items-center gap-3">
                    <Ruler className="h-6 w-6 text-primary animate-pulse" />
                    <div className="text-xs">
                      <p className="font-bold text-foreground">کالیبراسیون چاپ ۵×۵ سانتی‌متر</p>
                      <p className="text-[10px] text-muted-foreground">تضمین انطباق ۱۰۰٪ بدون کوچک‌نمایی پرینتر</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>خط مرکزی پشت (CB)</span>
                  <span className="text-emerald-600 font-bold">خط راستا (Grainline)</span>
                  <span>خط مرکزی جلو (CF)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">قیمت نسخه دمو:</span>
                <span className="font-bold text-primary">{formatToman(0)} (رایگان)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-foreground">
            پنج رکن اساسی پلتفرم <span className="text-primary">دوز</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            ابزارهای طراحی‌شده برای پاسخ به نیازهای واقعی خیاطان شخصی‌دوز، مزون‌داران، و طراحان مد و لباس ایران.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Ruler className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۱. استودیو پارامتریک تعاملی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ترسیم بلادرنگ الگوها با پخش‌کننده مرحله‌به‌مرحله خطوط راهنما، محاسبات دقیق فرمول‌های خیاطی به سانتی‌متر، و خروجی باکیفیت SVG، DXF صنعتی و PDF.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۲. پرونده مشتریان خیاطی (CRM)</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ثبت کامل ۲۶ اندازه آنتروپومتریک، برچسب‌های عیوب اندامی (شکم برجسته، گودی کمر، شانه افتاده) و دکمه تک‌کلیک بارگذاری مستقیم در استودیو.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۳. مارکت‌پلیس دوطرفه الگو</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              خرید و دانلود الگوهای آماده تجاری، محاسبه‌گر هوشمند مصرف پارچه (عرض ۱۱۰ و ۱۵۰ سانتی‌متر)، دیاگرام چیدمان الگو، و نظرات خریداران تاییدشده.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۴. تحلیل‌گر لباس با هوش مصنوعی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              آپلود تصویر لباس و تحلیل خودکار توسط Gemini Vision: استخراج سیلوئت، یقه، آستین، موقعیت ساسون‌ها و پیشنهاد الگوی پایه و متد پیشنهادی.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۵. استودیو و درآمدزایی طراحان</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              انتشار آسان الگوها با ویزارد ۵ مرحله‌ای، دفترکل دوبل مالی (۸۰٪ سهم طراح)، و درخواست تسویه حساب خودکار با بررسی اصالت شماره شبا بانکی.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">۶. چاپ سایز واقعی و استاندارد صنعتی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              خروجی PDF کاشی‌بندی A4 با خطوط برش و خط‌کش راهنما برای چسباندن آسان در منزل، و فایل‌های DXF استاندارد ASTM D6673 برای دستگاه‌های برش لیزری و CNC.
            </p>
          </div>
        </div>
      </section>

      {/* Methods Comparison Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              پشتیبانی از سه متد استاندارد الگوسازی
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              الگوی خود را با هر متدی که در آن تخصص دارید با فرمول‌های علمی و معتبر رسم کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">دقت بالا</span>
              <h3 className="text-lg font-bold text-foreground">متد مولر (Müller)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                استاندارد معتبر آلمانی برای تنخورهای مجلسی و کت و شلوارهای خوش‌فرم با آزادی کنترل‌شده و تقسیمات دقیق بالاتنه.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">استاندارد جهانی</span>
              <h3 className="text-lg font-bold text-foreground">متد متریک (Metric)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                متد سریع و صنعتی بریتانیا با جدول‌های استاندارد سایزبندی و رسم ساده‌تر برای تولید انبوه و پوشاک روزمره.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-6 space-y-3">
              <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">سادگی کاربردی</span>
              <h3 className="text-lg font-bold text-foreground">متد گرلاوین (Grlawein)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                متد سنتی و پرکاربرد در دوره‌های خیاطی ایران، رسم سریع بدون نیاز به محاسبات سنگین و تغییرات آسان روی الگو.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-l from-primary to-purple-800 p-8 sm:p-12 text-center text-primary-foreground space-y-6 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            آماده‌اید تجربه الگوسازی خیاطی خود را متحول کنید؟
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
            بدون نیاز به نصب نرم‌افزارهای پیچیده CAD، الگوی خود را به صورت آنلاین و در چند دقیقه محاسبه و با مقیاس واقعی چاپ کنید.
          </p>
          <div className="pt-2">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-base font-bold text-foreground shadow-lg hover:bg-background/90 transition-all hover:scale-105"
            >
              <Scissors className="h-5 w-5 text-primary" />
              <span>ورود رایگان به استودیو الگوسازی دوز</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

---

## 5. Verification Method

To verify this implementation blueprint, the Worker should execute the following sequence:

### Step 1: Write All Blueprint Files
Create the 15 specified files with exact contents:
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `components.json`
- `.env.example`
- `.gitignore`
- `src/app/globals.css`
- `src/lib/utils.ts`
- `src/lib/format.ts`
- `src/components/layout/navbar.tsx`
- `src/components/layout/footer.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`

### Step 2: Install Dependencies with Sandbox Bypass
Run the package installer using the verified Node and npm binaries:
```bash
/opt/homebrew/bin/node /opt/homebrew/bin/npm install --legacy-peer-deps
```
*Tool invocation requirement*: MUST set `BypassSandbox: true` and `WaitMsBeforeAsync: 10000`.
*Expected*: `node_modules` generated, `added X packages`, exit code `0`.

### Step 3: Verify TypeScript Compilation
Run typecheck to ensure zero strict errors:
```bash
/opt/homebrew/bin/node /opt/homebrew/bin/npm run typecheck
```
*Expected*: Exit code `0` with zero diagnostic errors.

### Step 4: Verify Next.js Production Build
Run full production compilation:
```bash
/opt/homebrew/bin/node /opt/homebrew/bin/npm run build
```
*Expected*:
- Next.js compiles routes `/` and static assets.
- Output shows:
  ```
  Route (app)                              Size     First Load JS
  ┌ ○ /                                    ... kB         ... kB
  └ ○ /_not-found                          ... kB         ... kB
  + First Load JS shared by all            ... kB
  ```
- Exit code `0`.

### Step 5: Test Formatters Independently
Run a verification check on `src/lib/format.ts`:
```bash
/opt/homebrew/bin/node -e '
const { toPersianDigits, formatToman, toLatinDigits, formatJalaliDate } = require("./src/lib/format.ts");
'
```
Or execute a quick test file to confirm `toPersianDigits("123") === "۱۲۳"`, `formatToman(150000)` contains `"تومان"`, and `toLatinDigits("۱۲۳") === "123"`.
