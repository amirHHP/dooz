#!/usr/bin/env node
/**
 * Dooz Test Runner
 * Deterministic, standalone, zero-dependency Node.js test runner for Tiers 1-4.
 * Runnable via: `node tests/runner.mjs` or individually `node tests/tierX/some_file.test.mjs`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';

class TestRegistry {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.failures = [];
    this.tierResults = {
      tier1: { total: 0, passed: 0, failed: 0 },
      tier2: { total: 0, passed: 0, failed: 0 },
      tier3: { total: 0, passed: 0, failed: 0 },
      tier4: { total: 0, passed: 0, failed: 0 },
      other: { total: 0, passed: 0, failed: 0 },
    };
  }

  describe(name, fn) {
    const parentSuite = this.currentSuite;
    const suite = {
      name,
      tests: [],
      parent: parentSuite,
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
    };

    if (parentSuite) {
      parentSuite.tests.push(suite);
    } else {
      this.suites.push(suite);
    }

    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  test(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.test(name, fn));
      return;
    }
    this.currentSuite.tests.push({ name, fn, type: 'test' });
    this.totalTests++;
  }

  skip(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.skip(name, fn));
      return;
    }
    this.currentSuite.tests.push({ name, fn, type: 'skip' });
    this.totalTests++;
    this.skippedTests++;
  }

  async runSuiteNode(node, currentTier = 'other', indent = '  ') {
    if (node.type === 'test') {
      const startTime = performance.now();
      try {
        await node.fn();
        const duration = (performance.now() - startTime).toFixed(1);
        this.passedTests++;
        this.tierResults[currentTier].passed++;
        this.tierResults[currentTier].total++;
        console.log(`${indent}${GREEN}✓${RESET} ${node.name} ${DIM}(${duration}ms)${RESET}`);
      } catch (err) {
        const duration = (performance.now() - startTime).toFixed(1);
        this.failedTests++;
        this.tierResults[currentTier].failed++;
        this.tierResults[currentTier].total++;
        console.log(`${indent}${RED}✗${RESET} ${node.name} ${DIM}(${duration}ms)${RESET}`);
        this.failures.push({
          suite: node.parentSuiteName || 'Default Suite',
          name: node.name,
          error: err,
        });
      }
    } else if (node.type === 'skip') {
      console.log(`${indent}${YELLOW}⚠${RESET} ${DIM}[SKIPPED] ${node.name}${RESET}`);
      this.tierResults[currentTier].total++;
    } else {
      // It's a suite
      console.log(`\n${indent}${BOLD}${CYAN}▸ ${node.name}${RESET}`);
      for (const item of node.tests) {
        item.parentSuiteName = node.name;
        await this.runSuiteNode(item, currentTier, indent + '  ');
      }
    }
  }

  async runAll(currentTier = 'other') {
    for (const suite of this.suites) {
      await this.runSuiteNode(suite, currentTier);
    }
  }

  reset() {
    this.suites = [];
    this.currentSuite = null;
  }
}

export const registry = new TestRegistry();
export const describe = (name, fn) => registry.describe(name, fn);
export const test = (name, fn) => registry.test(name, fn);
export const it = test;
export const skip = (name, fn) => registry.skip(name, fn);

/**
 * Discover test files matching patterns
 */
function discoverTestFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...discoverTestFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.test.mjs') || entry.name.endsWith('.test.js'))) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

/**
 * Main Runner CLI
 */
export async function runCli() {
  const args = process.argv.slice(2);
  const startTime = performance.now();

  console.log(`\n${BOLD}${MAGENTA}========================================================================${RESET}`);
  console.log(`${BOLD}${MAGENTA}          DOOZ (دوز) — E2E TEST SUITE (TIERS 1 - 4)                     ${RESET}`);
  console.log(`${BOLD}${MAGENTA}========================================================================${RESET}\n`);

  const tiers = ['tier1', 'tier2', 'tier3', 'tier4'];
  let filesToRun = [];

  const tierArg = args.find((a) => a.startsWith('--tier='));
  const specificTier = tierArg ? tierArg.split('=')[1] : null;

  if (args.length > 0 && !tierArg) {
    // Specific files passed
    filesToRun = args.map((f) => ({ filePath: path.resolve(process.cwd(), f), tier: 'other' }));
  } else if (specificTier) {
    const tierDir = path.join(__dirname, specificTier);
    const discovered = discoverTestFiles(tierDir);
    filesToRun = discovered.map((f) => ({ filePath: f, tier: specificTier }));
  } else {
    for (const tier of tiers) {
      const tierDir = path.join(__dirname, tier);
      const discovered = discoverTestFiles(tierDir);
      filesToRun.push(...discovered.map((f) => ({ filePath: f, tier })));
    }
  }

  if (filesToRun.length === 0) {
    console.log(`${YELLOW}No test files discovered.${RESET}`);
    process.exit(0);
  }

  console.log(`${BOLD}Discovered ${filesToRun.length} test file(s). Running...${RESET}`);

  for (const { filePath, tier } of filesToRun) {
    const relPath = path.relative(ROOT_DIR, filePath);
    console.log(`\n${BOLD}${BLUE}=== RUNNING: ${relPath} [${tier.toUpperCase()}] ===${RESET}`);
    registry.reset();
    try {
      // Dynamic import loads test definitions into registry
      await import(`file://${filePath}?t=${Date.now()}`);
      await registry.runAll(tier);
    } catch (importErr) {
      console.error(`${RED}Failed to load test file ${relPath}:${RESET}`, importErr);
      registry.failedTests++;
      registry.tierResults[tier].failed++;
      registry.failures.push({
        suite: relPath,
        name: 'File Load / Compilation Error',
        error: importErr,
      });
    }
  }

  const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);

  // Summary Report
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}                     TEST EXECUTION SUMMARY                             ${RESET}`);
  console.log(`${BOLD}========================================================================${RESET}`);

  console.log(`
┌─────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Tier    │ Total Tests  │ Passed       │ Failed       │ Status       │
├─────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Tier 1  │ ${String(registry.tierResults.tier1.total).padEnd(12)} │ ${GREEN}${String(registry.tierResults.tier1.passed).padEnd(12)}${RESET} │ ${registry.tierResults.tier1.failed ? RED : ''}${String(registry.tierResults.tier1.failed).padEnd(12)}${RESET} │ ${registry.tierResults.tier1.failed ? RED + 'FAILED ' : GREEN + 'PASSED '}${RESET}     │
│ Tier 2  │ ${String(registry.tierResults.tier2.total).padEnd(12)} │ ${GREEN}${String(registry.tierResults.tier2.passed).padEnd(12)}${RESET} │ ${registry.tierResults.tier2.failed ? RED : ''}${String(registry.tierResults.tier2.failed).padEnd(12)}${RESET} │ ${registry.tierResults.tier2.failed ? RED + 'FAILED ' : GREEN + 'PASSED '}${RESET}     │
│ Tier 3  │ ${String(registry.tierResults.tier3.total).padEnd(12)} │ ${GREEN}${String(registry.tierResults.tier3.passed).padEnd(12)}${RESET} │ ${registry.tierResults.tier3.failed ? RED : ''}${String(registry.tierResults.tier3.failed).padEnd(12)}${RESET} │ ${registry.tierResults.tier3.failed ? RED + 'FAILED ' : GREEN + 'PASSED '}${RESET}     │
│ Tier 4  │ ${String(registry.tierResults.tier4.total).padEnd(12)} │ ${GREEN}${String(registry.tierResults.tier4.passed).padEnd(12)}${RESET} │ ${registry.tierResults.tier4.failed ? RED : ''}${String(registry.tierResults.tier4.failed).padEnd(12)}${RESET} │ ${registry.tierResults.tier4.failed ? RED + 'FAILED ' : GREEN + 'PASSED '}${RESET}     │
└─────────┴──────────────┴──────────────┴──────────────┴──────────────┘
`);

  console.log(`${BOLD}Total Tests Run:${RESET}  ${registry.totalTests}`);
  console.log(`${BOLD}Total Passed:${RESET}    ${GREEN}${registry.passedTests}${RESET}`);
  console.log(`${BOLD}Total Failed:${RESET}    ${registry.failedTests > 0 ? RED : GREEN}${registry.failedTests}${RESET}`);
  console.log(`${BOLD}Total Skipped:${RESET}   ${YELLOW}${registry.skippedTests}${RESET}`);
  console.log(`${BOLD}Duration:${RESET}        ${totalTime}s\n`);

  if (registry.failures.length > 0) {
    console.log(`${BOLD}${RED}FAILURE DETAILS (${registry.failures.length}):${RESET}\n`);
    registry.failures.forEach((f, idx) => {
      console.log(`${RED}${BOLD}[${idx + 1}] ${f.suite} > ${f.name}${RESET}`);
      console.log(`${DIM}${f.error.stack || f.error.message}${RESET}\n`);
    });
    process.exit(1);
  } else {
    console.log(`${BOLD}${GREEN}✔ ALL TESTS PASSED SUCCESSFULLY! (100% PASS RATE)${RESET}\n`);
    process.exit(0);
  }
}

// Auto-run if executed directly as main script
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
  runCli();
}
