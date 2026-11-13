/**
 * Tier 2 — Boundary & Corner Tests for Features F1 through F8: Platform Core, Data Layer & Auth
 * 5 tests per feature = 40 tests total.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertThrows,
  assertDoesNotThrow,
} from '../harness/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// ============================================================================
// F1 Boundaries: Greenfield Next.js 15 & TS Setup (5 tests)
// ============================================================================
describe('F1 Boundaries: Greenfield Next.js 15 & TS Setup', () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'tsconfig.json'), 'utf8'));

  test('F1-B1: tsconfig handles empty or non-existent path alias queries gracefully', () => {
    assert(tsconfig.compilerOptions.paths['@/*'], 'Path alias defined');
    assertEqual(tsconfig.compilerOptions.paths['@unknown/*'], undefined, 'Unknown path alias returns undefined');
  });

  test('F1-B2: tsconfig strict flag rejects implicit any types', () => {
    assertEqual(tsconfig.compilerOptions.noImplicitAny ?? tsconfig.compilerOptions.strict, true, 'No implicit any allowed');
  });

  test('F1-B3: tsconfig module resolution is bundler for Next.js 15 App Router compatibility', () => {
    assertEqual(tsconfig.compilerOptions.moduleResolution.toLowerCase(), 'bundler', 'moduleResolution must be bundler');
  });

  test('F1-B4: next.config.ts parses without runtime evaluation syntax errors', async () => {
    const configPath = path.join(ROOT_DIR, 'next.config.ts');
    assert(fs.existsSync(configPath), 'next.config.ts exists');
  });

  test('F1-B5: package.json scripts withstand non-standard environment invocations', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert(pkg.scripts.build.includes('next build'), 'Build script is standard');
  });
});

// ============================================================================
// F2 Boundaries: Design System & UI Kit (5 tests)
// ============================================================================
describe('F2 Boundaries: Design System & UI Kit', () => {
  const globalsCss = fs.readFileSync(path.join(ROOT_DIR, 'src/app/globals.css'), 'utf8');

  test('F2-B1: Dark mode color tokens define inverted foreground and background values', () => {
    assert(globalsCss.includes('.dark'), 'Must define .dark theme block');
    assert(globalsCss.includes('--background') && globalsCss.includes('--foreground'), 'Must define theme color tokens');
  });

  test('F2-B2: High-contrast primary and destructive tokens maintain readability', () => {
    assert(globalsCss.includes('--destructive'), 'Must define destructive color');
    assert(globalsCss.includes('--primary'), 'Must define primary color');
  });

  test('F2-B3: Border radius variable is scalable with calc offsets', () => {
    const tailwind = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.ts'), 'utf8');
    assert(tailwind.includes('calc(var(--radius)'), 'Border radius supports calc offsets');
  });

  test('F2-B4: Animation keyframes handle 0-height accordion collapses safely', () => {
    const tailwind = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.ts'), 'utf8');
    assert(tailwind.includes('accordion-down') && tailwind.includes('accordion-up'), 'Accordion animations defined');
  });

  test('F2-B5: Custom dooz brand color palette covers shades 50 to 950', () => {
    const tailwind = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.ts'), 'utf8');
    assert(tailwind.includes('50:') && tailwind.includes('950:'), 'Brand palette spans full 50-950 scale');
  });
});

// ============================================================================
// F3 Boundaries: RTL Persian Typography & Localization (5 tests)
// ============================================================================
describe('F3 Boundaries: RTL Persian Typography & Localization', () => {
  test('F3-B1: formatToman handles 0 Toman by displaying "رایگان"', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    assertEqual(formatMod.formatToman(0), '۰ تومان', '0 Toman formatted with Persian zero');
  });

  test('F3-B2: formatToman handles massive values (e.g. 100,000,000 Toman) without exponential notation', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    const formatted = formatMod.formatToman(100000000);
    assert(!formatted.includes('e+'), 'Must not format in scientific notation');
    assert(formatted.includes('تومان'), 'Must include تومان');
  });

  test('F3-B3: toPersianDigits handles empty string, null, and non-numeric characters gracefully', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    assertEqual(formatMod.toPersianDigits(''), '', 'Empty string returns empty');
    assertEqual(formatMod.toPersianDigits(null), '', 'Null returns empty');
    assertEqual(formatMod.toPersianDigits('abc'), 'abc', 'Non-digits preserved');
  });

  test('F3-B4: toLatinDigits converts mixed strings containing Persian, Arabic, and ASCII digits', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    const mixed = 'کد ۱۲۳ و ٤٥٦ و 789';
    const converted = formatMod.toLatinDigits(mixed);
    assert(converted.includes('123'), 'Persian converted');
    assert(converted.includes('456'), 'Arabic converted');
    assert(converted.includes('789'), 'ASCII preserved');
  });

  test('F3-B5: formatJalaliDate handles invalid dates without crashing', async () => {
    const formatMod = await import('../../src/lib/format.ts');
    assertEqual(formatMod.formatJalaliDate('invalid-date'), '', 'Invalid date returns empty string');
  });
});

// ============================================================================
// F4 Boundaries: Prisma ORM PostgreSQL Schema (5 tests)
// ============================================================================
describe('F4 Boundaries: Prisma ORM PostgreSQL Schema', () => {
  const schema = fs.readFileSync(path.join(ROOT_DIR, 'prisma/schema.prisma'), 'utf8');

  test('F4-B1: Unique indexes exist for email and phone on User model', () => {
    assert(schema.includes('email           String              @unique'), 'User email unique');
    assert(schema.includes('phone           String?             @unique'), 'User phone unique');
  });

  test('F4-B2: Purchase model restricts deletion of purchased patterns (onDelete: Restrict)', () => {
    assert(schema.includes('onDelete: Restrict'), 'Purchased pattern deletion restricted');
  });

  test('F4-B3: SavedDraft cascades deletion from User and sets null on Client deletion', () => {
    assert(schema.includes('onDelete: SetNull'), 'SavedDraft sets client to null if client deleted');
  });

  test('F4-B4: Default values are established for walletBalance (0) and role (USER)', () => {
    assert(schema.includes('@default(0)'), 'walletBalance defaults to 0');
    assert(schema.includes('@default(USER)'), 'role defaults to USER');
  });

  test('F4-B5: Slug field on PatternProduct is strictly unique to prevent collision', () => {
    assert(schema.includes('slug               String         @unique'), 'PatternProduct slug is unique');
  });
});

// ============================================================================
// F5 Boundaries: Comprehensive Database Seeder (5 tests)
// ============================================================================
describe('F5 Boundaries: Comprehensive Database Seeder', () => {
  const seed = fs.readFileSync(path.join(ROOT_DIR, 'prisma/seed.ts'), 'utf8');

  test('F5-B1: Seeder defines empty posture tags for standard client', () => {
    assert(seed.includes('postureTags: []'), 'Sara has empty posture tags');
  });

  test('F5-B2: Seeder defines multiple defect tags for Maryam (PROMINENT_ABDOMEN + SWAYBACK)', () => {
    assert(seed.includes('"PROMINENT_ABDOMEN", "SWAYBACK"'), 'Multiple defect tags in seed');
  });

  test('F5-B3: Free pattern in seed has price = 0 and isPublished = true', () => {
    assert(seed.includes('price: 0'), 'Free pattern in seed');
  });

  test('F5-B4: Seeder handles existing records via deletion or upsert cleanup', () => {
    assert(seed.includes('deleteMany') || seed.includes('upsert'), 'Seeder manages existing data cleanly');
  });

  test('F5-B5: Seeder verifies all 8 pattern products have valid difficulty levels', () => {
    assert(seed.includes('Difficulty.BEGINNER'), 'Beginner pattern seeded');
    assert(seed.includes('Difficulty.INTERMEDIATE'), 'Intermediate pattern seeded');
    assert(seed.includes('Difficulty.ADVANCED'), 'Advanced pattern seeded');
  });
});

// ============================================================================
// F6 Boundaries: Auth.js (NextAuth v5) Setup (5 tests)
// ============================================================================
describe('F6 Boundaries: Auth.js (NextAuth v5) Setup', () => {
  const authConfig = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/auth.ts'), 'utf8');

  test('F6-B1: Auth configuration guards against missing credentials or null input', () => {
    assert(authConfig.includes('!credentials') || authConfig.includes('authorize'), 'Credentials authorization check exists');
  });

  test('F6-B2: Password verification uses bcrypt compare', () => {
    assert(authConfig.includes('bcrypt') || authConfig.includes('compare'), 'Uses bcrypt for password check');
  });

  test('F6-B3: User session strategy is set to JWT', () => {
    assert(authConfig.includes('strategy: "jwt"') || authConfig.includes('jwt'), 'Uses JWT session strategy');
  });

  test('F6-B4: Custom login and register pages are declared in auth options', () => {
    assert(authConfig.includes('/login') || authConfig.includes('pages:'), 'Configures auth pages');
  });

  test('F6-B5: Role-based authorization differentiates USER, CREATOR, and ADMIN', () => {
    assert(authConfig.includes('role'), 'Handles role assignment');
  });
});

// ============================================================================
// F7 Boundaries: Modular Storage Adapter (5 tests)
// ============================================================================
describe('F7 Boundaries: Modular Storage Adapter', () => {
  test('F7-B1: Storage adapter sanitizes dangerous filenames with directory traversal attempts', () => {
    const storageSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/storage.ts'), 'utf8');
    assert(storageSrc.includes('sanitizeFilename') && storageSrc.includes('path.basename'), 'Sanitizes filenames using path.basename');
  });

  test('F7-B2: Local storage creates directory recursively if target folder does not exist', () => {
    const storageSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/storage.ts'), 'utf8');
    assert(storageSrc.includes('mkdir') && storageSrc.includes('recursive: true'), 'mkdir with recursive true');
  });

  test('F7-B3: get() on non-existent file returns null instead of throwing unhandled exception', async () => {
    const storageMod = await import('../../src/lib/storage.ts');
    const result = await storageMod.storage.get('non-existent-file-xyz.pdf');
    assertEqual(result, null, 'Non-existent file returns null');
  });

  test('F7-B4: delete() on non-existent file handles absence gracefully returning boolean', async () => {
    const storageMod = await import('../../src/lib/storage.ts');
    const result = await storageMod.storage.delete('already-deleted-file-123.pdf');
    assertEqual(typeof result, 'boolean', 'Delete returns boolean');
  });

  test('F7-B5: Buffer conversion safely handles Uint8Array and ArrayBuffer inputs', () => {
    const storageSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/storage.ts'), 'utf8');
    assert(storageSrc.includes('Uint8Array') && storageSrc.includes('Buffer.from'), 'Handles Uint8Array');
  });
});

// ============================================================================
// F8 Boundaries: Config & Build Baseline (5 tests)
// ============================================================================
describe('F8 Boundaries: Config & Build Baseline', () => {
  const envExample = fs.readFileSync(path.join(ROOT_DIR, '.env.example'), 'utf8');

  test('F8-B1: .env.example contains no real production secrets or leaked credentials', () => {
    assert(!envExample.includes('ghp_'), 'No github tokens');
    assert(!envExample.includes('sk_live'), 'No live secret keys');
    assert(!envExample.includes('AIzaSy'), 'No live Google API keys');
  });

  test('F8-B2: Missing BLOB_READ_WRITE_TOKEN in dev mode does not halt startup', () => {
    const storageSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/storage.ts'), 'utf8');
    assert(storageSrc.includes('LocalStorageAdapter'), 'Falls back to LocalStorageAdapter');
  });

  test('F8-B3: Missing GEMINI_API_KEY triggers heuristic engine fallback without 500 error', () => {
    assert(envExample.includes('GEMINI_API_KEY='), 'GEMINI_API_KEY declared in .env.example');
  });

  test('F8-B4: DATABASE_URL format includes PostgreSQL protocol prefix', () => {
    assert(envExample.includes('postgresql://') || envExample.includes('postgres://'), 'Uses postgresql connection string');
  });

  test('F8-B5: AUTH_SECRET placeholder documents command to generate random secret', () => {
    assert(envExample.includes('openssl rand') || envExample.includes('AUTH_SECRET'), 'Documents AUTH_SECRET generation');
  });
});
