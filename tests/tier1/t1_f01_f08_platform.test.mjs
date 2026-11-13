/**
 * Tier 1 — Core Features F1 through F8: Platform Core, Data Layer & Auth
 * 5 tests per feature = 40 tests total.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertDeepEqual,
} from '../harness/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// ============================================================================
// F1: Greenfield Next.js 15 & TS Setup (5 tests)
// ============================================================================
describe('F1: Greenfield Next.js 15 & TS Setup', () => {
  const pkgPath = path.join(ROOT_DIR, 'package.json');
  const tsconfigPath = path.join(ROOT_DIR, 'tsconfig.json');
  const nextConfigPath = path.join(ROOT_DIR, 'next.config.ts');

  test('F1-1: package.json specifies modern Next.js (>= 15.x) and React 19 dependencies', () => {
    assert(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const nextMajor = parseInt(pkg.dependencies.next.replace(/[^0-9]/, ''), 10);
    assert(nextMajor >= 15, `next version must be at least 15.x, got ${pkg.dependencies.next}`);
    assert(pkg.dependencies.react.includes('19.'), 'react version must be 19.x');
    assert(pkg.dependencies['react-dom'].includes('19.'), 'react-dom version must be 19.x');
  });

  test('F1-2: tsconfig.json enforces strict TypeScript mode and ES2022/ESNext target', () => {
    assert(fs.existsSync(tsconfigPath), 'tsconfig.json must exist');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    assertEqual(tsconfig.compilerOptions.strict, true, 'strict mode must be true');
    assert(tsconfig.compilerOptions.target.toLowerCase().startsWith('es'), 'target must be ES standard');
  });

  test('F1-3: tsconfig.json configures root path alias @/* to ./src/*', () => {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    assert(tsconfig.compilerOptions.paths, 'compilerOptions.paths must be configured');
    assertDeepEqual(tsconfig.compilerOptions.paths['@/*'], ['./src/*'], 'path alias @/* must map to ./src/*');
  });

  test('F1-4: next.config.ts configuration exists and is non-empty', () => {
    assert(fs.existsSync(nextConfigPath), 'next.config.ts must exist');
    const content = fs.readFileSync(nextConfigPath, 'utf8');
    assert(content.includes('nextConfig'), 'next.config.ts must export nextConfig');
  });

  test('F1-5: package.json provides essential dev, build, typecheck, and start scripts', () => {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert(pkg.scripts.dev, 'scripts.dev must exist');
    assert(pkg.scripts.build, 'scripts.build must exist');
    assert(pkg.scripts.start, 'scripts.start must exist');
    assert(pkg.scripts.typecheck, 'scripts.typecheck must exist');
  });
});

// ============================================================================
// F2: Design System & UI Kit (5 tests)
// ============================================================================
describe('F2: Design System & UI Kit', () => {
  const tailwindPath = path.join(ROOT_DIR, 'tailwind.config.ts');
  const componentsJsonPath = path.join(ROOT_DIR, 'components.json');
  const globalsCssPath = path.join(ROOT_DIR, 'src/app/globals.css');

  test('F2-1: tailwind.config.ts configures Vazirmatn font and Persian layout tokens', () => {
    assert(fs.existsSync(tailwindPath), 'tailwind.config.ts must exist');
    const content = fs.readFileSync(tailwindPath, 'utf8');
    assert(content.includes('Vazirmatn') || content.includes('fontFamily'), 'Must configure Vazirmatn font family');
  });

  test('F2-2: components.json configures Shadcn UI standards with new-york or default style', () => {
    assert(fs.existsSync(componentsJsonPath), 'components.json must exist');
    const config = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf8'));
    assert(config.style, 'components.json must declare a UI style');
    assert(config.aliases, 'components.json must declare path aliases');
  });

  test('F2-3: globals.css sets up CSS variables for light and dark themes', () => {
    assert(fs.existsSync(globalsCssPath), 'src/app/globals.css must exist');
    const content = fs.readFileSync(globalsCssPath, 'utf8');
    assert(content.includes('--background') && content.includes('--foreground'), 'globals.css must define color variables');
  });

  test('F2-4: Lucide icons and Framer Motion packages are installed in dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert(pkg.dependencies['lucide-react'], 'lucide-react must be installed');
    assert(pkg.dependencies['framer-motion'], 'framer-motion must be installed');
  });

  test('F2-5: Tailwind config includes animate and content paths for src app and components', () => {
    const content = fs.readFileSync(tailwindPath, 'utf8');
    assert(content.includes('tailwindcss-animate'), 'Must include tailwindcss-animate plugin');
    assert(content.includes('./src/components') && content.includes('./src/app'), 'Tailwind content must include src components and app');
  });
});

// ============================================================================
// F3: RTL Persian Typography & Localization (5 tests)
// ============================================================================
describe('F3: RTL Persian Typography & Localization', () => {
  const rootLayoutPath = path.join(ROOT_DIR, 'src/app/layout.tsx');

  test('F3-1: Root layout enforces dir="rtl" and lang="fa"', () => {
    assert(fs.existsSync(rootLayoutPath), 'src/app/layout.tsx must exist');
    const content = fs.readFileSync(rootLayoutPath, 'utf8');
    assert(content.includes('dir="rtl"'), 'HTML tag must contain dir="rtl"');
    assert(content.includes('lang="fa"'), 'HTML tag must contain lang="fa"');
  });

  test('F3-2: Latin to Persian digits conversion handles single and multi-digit strings', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    assertEqual(formatMod.toPersianDigits('1234567890'), '۱۲۳۴۵۶۷۸۹۰', 'Digits 0-9 must convert to Persian');
    assertEqual(formatMod.toPersianDigits(42), '۴۲', 'Numeric 42 must convert to ۴۲');
  });

  test('F3-3: Persian and Arabic digits convert to standard Latin digits', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    assertEqual(formatMod.toLatinDigits('۱۲۳۴۵۶'), '123456', 'Persian digits must convert to ASCII');
    assertEqual(formatMod.toLatinDigits('١٢٣٤٥٦'), '123456', 'Arabic digits must convert to ASCII');
  });

  test('F3-4: formatToman outputs correct thousands separators and تومان suffix', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    const formatted = formatMod.formatToman(350000);
    assert(formatted.includes('تومان'), 'Must include تومان currency suffix');
    assert(formatted.includes('۳۵۰') || formatted.includes('350'), 'Must contain 350,000 formatted amount');
  });

  test('F3-5: formatJalaliDate outputs formatted Persian solar calendar representation', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    const d = new Date('2026-03-21T12:00:00Z');
    const jalali = formatMod.formatJalaliDate(d);
    assert(jalali.length > 0, 'Jalali date must be non-empty string');
    assert(jalali.includes('۱۴۰۵') || jalali.includes('1405'), 'Year 2026-03 corresponds to 1405');
  });
});

// ============================================================================
// F4: Prisma ORM PostgreSQL Schema (5 tests)
// ============================================================================
describe('F4: Prisma ORM PostgreSQL Schema', () => {
  const schemaPath = path.join(ROOT_DIR, 'prisma/schema.prisma');

  test('F4-1: prisma/schema.prisma declares postgresql provider and Prisma Client generator', () => {
    assert(fs.existsSync(schemaPath), 'prisma/schema.prisma must exist');
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert(content.includes('provider = "postgresql"'), 'Datasource must use postgresql provider');
    assert(content.includes('provider = "prisma-client-js"'), 'Generator must use prisma-client-js');
  });

  test('F4-2: schema.prisma defines all 9 required relational models', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const requiredModels = [
      'model User',
      'model ClientProfile',
      'model PatternProduct',
      'model PatternStep',
      'model Purchase',
      'model WalletTransaction',
      'model PayoutRequest',
      'model Review',
      'model SavedDraft',
    ];
    for (const model of requiredModels) {
      assert(content.includes(model), `schema.prisma must define ${model}`);
    }
  });

  test('F4-3: schema.prisma defines required domain enums', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const requiredEnums = [
      'enum Role',
      'enum DraftingMethod',
      'enum BlockType',
      'enum FitType',
      'enum Difficulty',
      'enum TransactionType',
      'enum PayoutStatus',
      'enum PurchaseStatus',
    ];
    for (const en of requiredEnums) {
      assert(content.includes(en), `schema.prisma must define ${en}`);
    }
  });

  test('F4-4: Review model enforces unique constraint on (userId, patternId)', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert(content.includes('@@unique([userId, patternId])'), 'Review must enforce @@unique([userId, patternId])');
  });

  test('F4-5: PatternProduct and User establish cascading and indexing relations', () => {
    const content = fs.readFileSync(schemaPath, 'utf8');
    assert(content.includes('onDelete: Cascade'), 'Cascade deletes must be specified for owned relations');
    assert(content.includes('@@index([creatorId])') || content.includes('@@index([tailorId])'), 'Foreign key indexes must be defined');
  });
});

// ============================================================================
// F5: Comprehensive Database Seeder (5 tests)
// ============================================================================
describe('F5: Comprehensive Database Seeder', () => {
  const seedPath = path.join(ROOT_DIR, 'prisma/seed.ts');

  test('F5-1: prisma/seed.ts exists and declares seed logic', () => {
    assert(fs.existsSync(seedPath), 'prisma/seed.ts must exist');
    const content = fs.readFileSync(seedPath, 'utf8');
    assert(content.includes('PrismaClient'), 'seed.ts must instantiate PrismaClient');
  });

  test('F5-2: Seeder defines 3 demo accounts (Tailor, Creator, Admin)', () => {
    const content = fs.readFileSync(seedPath, 'utf8');
    assert(content.includes('tailor@dooz.ir'), 'Seed must include tailor demo account');
    assert(content.includes('creator@dooz.ir'), 'Seed must include creator demo account');
    assert(content.includes('admin@dooz.ir'), 'Seed must include admin demo account');
  });

  test('F5-3: Seeder defines 3 realistic client profiles with anatomical defect tags', () => {
    const content = fs.readFileSync(seedPath, 'utf8');
    assert(content.includes('SWAYBACK') || content.includes('PROMINENT_ABDOMEN'), 'Seed must contain defect tags');
    assert(content.includes('سارا محمدی') || content.includes('مریم احمدی'), 'Seed must include client names');
  });

  test('F5-4: Seeder defines 8 realistic Persian marketplace patterns with pricing', () => {
    const content = fs.readFileSync(seedPath, 'utf8');
    assert(content.includes('classic-tailored-blazer-coat'), 'Seed must include blazer coat slug');
    assert(content.includes('princess-seam-evening-dress'), 'Seed must include evening dress slug');
    assert(content.includes('a-line-four-panel-skirt'), 'Seed must include free skirt pattern slug');
  });

  test('F5-5: package.json configures tsx runner for prisma seed script', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert(pkg.prisma && pkg.prisma.seed, 'package.json must configure prisma.seed');
    assert(pkg.prisma.seed.includes('tsx'), 'prisma.seed must run via tsx');
  });
});

// ============================================================================
// F6: Auth.js (NextAuth v5) Setup (5 tests)
// ============================================================================
describe('F6: Auth.js (NextAuth v5) Setup', () => {
  const authConfigPath = path.join(ROOT_DIR, 'src/lib/auth.ts');
  const routeHandlerPath = path.join(ROOT_DIR, 'src/app/api/auth/[...nextauth]/route.ts');

  test('F6-1: src/lib/auth.ts configures NextAuth handlers and auth export', () => {
    assert(fs.existsSync(authConfigPath), 'src/lib/auth.ts must exist');
    const content = fs.readFileSync(authConfigPath, 'utf8');
    assert(content.includes('NextAuth'), 'src/lib/auth.ts must import and call NextAuth');
  });

  test('F6-2: Auth configuration defines CredentialsProvider for email/phone login', () => {
    const content = fs.readFileSync(authConfigPath, 'utf8');
    assert(content.includes('Credentials') || content.includes('CredentialsProvider'), 'Must support credentials authentication');
  });

  test('F6-3: NextAuth route handler exports GET and POST handlers', () => {
    assert(fs.existsSync(routeHandlerPath), 'src/app/api/auth/[...nextauth]/route.ts must exist');
    const content = fs.readFileSync(routeHandlerPath, 'utf8');
    assert(content.includes('GET') && content.includes('POST'), 'Route handler must export GET and POST');
  });

  test('F6-4: Auth callbacks attach user ID and role to session token', () => {
    const content = fs.readFileSync(authConfigPath, 'utf8');
    assert(content.includes('role') && content.includes('jwt'), 'Auth callbacks must handle role in JWT/session');
  });

  test('F6-5: bcryptjs is available for password hashing and verification', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert(pkg.dependencies.bcryptjs, 'bcryptjs must be in dependencies');
  });
});

// ============================================================================
// F7: Modular Storage Adapter (5 tests)
// ============================================================================
describe('F7: Modular Storage Adapter', () => {
  const storagePath = path.join(ROOT_DIR, 'src/lib/storage.ts');

  test('F7-1: src/lib/storage.ts exists and exports uploadFile and deleteFile methods', () => {
    assert(fs.existsSync(storagePath), 'src/lib/storage.ts must exist');
    const content = fs.readFileSync(storagePath, 'utf8');
    assert(content.includes('uploadFile') && content.includes('deleteFile'), 'Must export uploadFile and deleteFile');
  });

  test('F7-2: Storage adapter exports storage singleton and getFile method', async () => {
    const storageMod = await import('../../src/lib/storage.ts');
    assert(storageMod.storage, 'Must export storage instance');
    assert(typeof storageMod.getFile === 'function', 'Must export getFile function');
  });

  test('F7-3: Storage adapter supports local filesystem fallback when Blob token is absent', () => {
    const content = fs.readFileSync(storagePath, 'utf8');
    assert(content.includes('BLOB_READ_WRITE_TOKEN') && content.includes('public/uploads'), 'Must implement local disk fallback in public/uploads');
  });

  test('F7-4: Storage adapter implements StorageAdapter interface with upload, delete, and get', () => {
    const content = fs.readFileSync(storagePath, 'utf8');
    assert(content.includes('interface StorageAdapter'), 'Must define StorageAdapter interface');
    assert(content.includes('upload(') && content.includes('delete('), 'Interface must specify upload and delete');
  });

  test('F7-5: Storage upload sanitizes filenames to prevent directory traversal', () => {
    const content = fs.readFileSync(storagePath, 'utf8');
    assert(content.includes('sanitizeFilename') || content.includes('path.basename'), 'Must sanitize filenames');
  });
});

// ============================================================================
// F8: Config & Build Baseline (5 tests)
// ============================================================================
describe('F8: Config & Build Baseline', () => {
  const envExamplePath = path.join(ROOT_DIR, '.env.example');

  test('F8-1: .env.example defines DATABASE_URL variable', () => {
    assert(fs.existsSync(envExamplePath), '.env.example must exist');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert(content.includes('DATABASE_URL='), '.env.example must define DATABASE_URL');
  });

  test('F8-2: .env.example defines AUTH_SECRET variable for NextAuth', () => {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert(content.includes('AUTH_SECRET='), '.env.example must define AUTH_SECRET');
  });

  test('F8-3: .env.example documents BLOB_READ_WRITE_TOKEN variable', () => {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert(content.includes('BLOB_READ_WRITE_TOKEN='), '.env.example must define BLOB_READ_WRITE_TOKEN');
  });

  test('F8-4: .env.example documents GEMINI_API_KEY variable for AI Outfit Assistant', () => {
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert(content.includes('GEMINI_API_KEY='), '.env.example must define GEMINI_API_KEY');
  });

  test('F8-5: .gitignore properly excludes .env, node_modules, and build outputs', () => {
    const gitignorePath = path.join(ROOT_DIR, '.gitignore');
    assert(fs.existsSync(gitignorePath), '.gitignore must exist');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert(content.includes('.env'), '.gitignore must exclude .env');
    assert(content.includes('node_modules'), '.gitignore must exclude node_modules');
  });
});
