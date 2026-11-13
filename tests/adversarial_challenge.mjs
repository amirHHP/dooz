/**
 * Dooz Adversarial Empirical Verification Harness
 * Comprehensive stress-testing of:
 * 1. Client Anthropometric CRM API (input bounds, missing fields, non-positive numbers, height bounds 100-230cm, posture tag mutual exclusion)
 * 2. AI Garment Analyzer API /api/analyze-garment (empty payload, corrupted base64, missing GEMINI_API_KEY, deterministic response, studio deep-link)
 * 3. Canvas zoom clamping (0.2 to 5.0) in src/components/studio/canvas.tsx
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  validateAnthropometricMeasurements,
  sanitizePostureTags,
  REQUIRED_MEASUREMENT_FIELDS,
  ALLOWED_POSTURE_TAGS,
} from '../src/types/crm';
import {
  analyzeGarmentImage,
  generateHeuristicFallback,
  validateGarmentAnalysis,
  generateStudioDeepLink,
  validateUploadPayload,
  PRESET_ANALYSES,
} from '../src/lib/ai-garment';

// ANSI Colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureList = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message ? message + ' — ' : ''}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    failedTests++;
    console.log(`  ${RED}✗${RESET} ${name} — ${err.message}`);
    failureList.push({ name, error: err });
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ${GREEN}✓${RESET} ${name}`);
  } catch (err) {
    failedTests++;
    console.log(`  ${RED}✗${RESET} ${name} — ${err.message}`);
    failureList.push({ name, error: err });
  }
}

// Complete valid benchmark measurements dictionary
const VALID_MEASUREMENTS = {
  totalHeight: 168.0,
  bustCircumference: 88.0,
  waistCircumference: 70.0,
  hipCircumference: 94.0,
  highHipCircumference: 85.0,
  hipHeight: 20.0,
  acrossBack: 34.5,
  acrossFront: 32.0,
  shoulderLength: 12.5,
  neckCircumference: 36.0,
  bustDistance: 18.5,
  backWaistLength: 41.0,
  frontWaistLength: 43.5,
  bustHeight: 26.5,
  armholeDepth: 20.0,
  sleeveLength: 58.0,
  bicepCircumference: 27.5,
  wristCircumference: 16.0,
  elbowCircumference: 24.5,
  skirtLength: 65.0,
  trouserOutseam: 102.0,
  trouserInseam: 76.0,
  crotchDepth: 26.0,
  thighCircumference: 55.0,
  kneeCircumference: 38.0,
  ankleCircumference: 24.0,
};

async function main() {
  console.log(`\n${BOLD}${CYAN}========================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}  DOOZ (دوز) — EMPIRICAL ADVERSARIAL CHALLENGE HARNESS                   ${RESET}`);
  console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);

  // ==========================================================================
  // SECTION 1: Client Anthropometric CRM API & Validation
  // ==========================================================================
  console.log(`${BOLD}1. Challenge Client Anthropometric CRM API${RESET}`);

  runTest('1.1 Baseline: Valid 26-measurement profile passes validation', () => {
    const res = validateAnthropometricMeasurements(VALID_MEASUREMENTS);
    assertEqual(res.valid, true, 'Valid measurements must return valid: true');
    assertEqual(res.error, undefined, 'No error for valid measurements');
  });

  runTest('1.2 Missing Required Fields: Omission of each required field individually is rejected', () => {
    for (const field of REQUIRED_MEASUREMENT_FIELDS) {
      const cloned = { ...VALID_MEASUREMENTS };
      delete cloned[field];
      const res = validateAnthropometricMeasurements(cloned);
      assertEqual(res.valid, false, `Field ${field} omitted must be invalid`);
      assert(
        res.error?.includes(`Missing required field: ${field}`),
        `Error must identify missing field: ${field}, got ${res.error}`
      );
    }
  });

  runTest('1.3 Missing Required Fields: Setting field to undefined or null is rejected', () => {
    const cloneUndefined = { ...VALID_MEASUREMENTS, totalHeight: undefined };
    const res1 = validateAnthropometricMeasurements(cloneUndefined);
    assertEqual(res1.valid, false, 'undefined totalHeight must be rejected');

    const cloneNull = { ...VALID_MEASUREMENTS, bustCircumference: null };
    const res2 = validateAnthropometricMeasurements(cloneNull);
    assertEqual(res2.valid, false, 'null bustCircumference must be rejected');
  });

  runTest('1.4 Non-Positive Numbers: Zero values are rejected', () => {
    for (const field of ['totalHeight', 'bustCircumference', 'waistCircumference', 'hipCircumference']) {
      const cloned = { ...VALID_MEASUREMENTS, [field]: 0 };
      const res = validateAnthropometricMeasurements(cloned);
      assertEqual(res.valid, false, `0 for ${field} must be rejected`);
      assert(res.error?.includes('must be a positive number'), `Error must mention positive number for ${field}`);
    }
  });

  runTest('1.5 Non-Positive Numbers: Negative values are rejected', () => {
    for (const field of ['totalHeight', 'bustCircumference', 'waistCircumference', 'shoulderLength']) {
      const cloned = { ...VALID_MEASUREMENTS, [field]: -15.5 };
      const res = validateAnthropometricMeasurements(cloned);
      assertEqual(res.valid, false, `Negative for ${field} must be rejected`);
      assert(res.error?.includes('must be a positive number'), `Error must mention positive number for ${field}`);
    }
  });

  runTest('1.6 Non-Positive Numbers: NaN, non-numeric strings, and Infinity are rejected', () => {
    const cloneNaN = { ...VALID_MEASUREMENTS, totalHeight: NaN };
    assertEqual(validateAnthropometricMeasurements(cloneNaN).valid, false, 'NaN height rejected');

    const cloneStr = { ...VALID_MEASUREMENTS, bustCircumference: 'invalid_text' };
    assertEqual(validateAnthropometricMeasurements(cloneStr).valid, false, 'String bust rejected');

    const cloneInf = { ...VALID_MEASUREMENTS, waistCircumference: -Infinity };
    assertEqual(validateAnthropometricMeasurements(cloneInf).valid, false, '-Infinity waist rejected');
  });

  runTest('1.7 Height Bounds: Heights strictly outside 100-230cm are rejected', () => {
    // Under 100cm
    const sub99 = { ...VALID_MEASUREMENTS, totalHeight: 99.9 };
    const res99 = validateAnthropometricMeasurements(sub99);
    assertEqual(res99.valid, false, 'Height 99.9cm rejected');
    assertEqual(res99.error, 'قد باید بین ۱۰۰ تا ۲۳۰ سانتی‌متر باشد', 'Persian height bounds error');

    const sub50 = { ...VALID_MEASUREMENTS, totalHeight: 50 };
    assertEqual(validateAnthropometricMeasurements(sub50).valid, false, 'Height 50cm rejected');

    // Over 230cm
    const over230 = { ...VALID_MEASUREMENTS, totalHeight: 230.1 };
    const res230 = validateAnthropometricMeasurements(over230);
    assertEqual(res230.valid, false, 'Height 230.1cm rejected');
    assertEqual(res230.error, 'قد باید بین ۱۰۰ تا ۲۳۰ سانتی‌متر باشد', 'Persian height bounds error');

    const over300 = { ...VALID_MEASUREMENTS, totalHeight: 300 };
    assertEqual(validateAnthropometricMeasurements(over300).valid, false, 'Height 300cm rejected');
  });

  runTest('1.8 Height Bounds: Boundary values (100cm and 230cm) are strictly accepted', () => {
    const minHeight = { ...VALID_MEASUREMENTS, totalHeight: 100.0 };
    assertEqual(validateAnthropometricMeasurements(minHeight).valid, true, 'Height exactly 100cm must be valid');

    const maxHeight = { ...VALID_MEASUREMENTS, totalHeight: 230.0 };
    assertEqual(validateAnthropometricMeasurements(maxHeight).valid, true, 'Height exactly 230cm must be valid');
  });

  runTest('1.9 Bust Bounds: Bust circumference bounds (60cm - 160cm)', () => {
    const sub60 = { ...VALID_MEASUREMENTS, bustCircumference: 59.9 };
    assertEqual(validateAnthropometricMeasurements(sub60).valid, false, 'Bust < 60 rejected');

    const over160 = { ...VALID_MEASUREMENTS, bustCircumference: 160.1 };
    assertEqual(validateAnthropometricMeasurements(over160).valid, false, 'Bust > 160 rejected');

    const minBust = { ...VALID_MEASUREMENTS, bustCircumference: 60.0 };
    assertEqual(validateAnthropometricMeasurements(minBust).valid, true, 'Bust exactly 60cm accepted');

    const maxBust = { ...VALID_MEASUREMENTS, bustCircumference: 160.0 };
    assertEqual(validateAnthropometricMeasurements(maxBust).valid, true, 'Bust exactly 160cm accepted');
  });

  runTest('1.10 Posture Mutual Exclusion: [SLOPING_SHOULDERS, SQUARE_SHOULDERS] resolves to [SQUARE_SHOULDERS]', () => {
    const input1 = ['SLOPING_SHOULDERS', 'SQUARE_SHOULDERS'];
    const sanitized1 = sanitizePostureTags(input1);
    assertEqual(sanitized1.includes('SLOPING_SHOULDERS'), false, 'SLOPING_SHOULDERS must be dropped');
    assertEqual(sanitized1.includes('SQUARE_SHOULDERS'), true, 'SQUARE_SHOULDERS must be retained');
    assertEqual(sanitized1.length, 1, 'Only 1 tag remaining');
  });

  runTest('1.11 Posture Mutual Exclusion: Reverse order [SQUARE_SHOULDERS, SLOPING_SHOULDERS] also resolves to [SQUARE_SHOULDERS]', () => {
    const input2 = ['SQUARE_SHOULDERS', 'SLOPING_SHOULDERS'];
    const sanitized2 = sanitizePostureTags(input2);
    assertEqual(sanitized2.includes('SLOPING_SHOULDERS'), false, 'SLOPING_SHOULDERS must be dropped');
    assertEqual(sanitized2.includes('SQUARE_SHOULDERS'), true, 'SQUARE_SHOULDERS must be retained');
    assertEqual(sanitized2.length, 1, 'Only 1 tag remaining');
  });

  runTest('1.12 Posture Mutual Exclusion: Mixed with other posture tags preserves non-conflicting tags', () => {
    const mixed = ['PROMINENT_ABDOMEN', 'SLOPING_SHOULDERS', 'SWAYBACK', 'SQUARE_SHOULDERS', 'ROUND_BACK'];
    const sanitized = sanitizePostureTags(mixed);
    assertEqual(sanitized.includes('SLOPING_SHOULDERS'), false, 'SLOPING dropped in mixed array');
    assertEqual(sanitized.includes('SQUARE_SHOULDERS'), true, 'SQUARE retained in mixed array');
    assertEqual(sanitized.includes('PROMINENT_ABDOMEN'), true, 'PROMINENT_ABDOMEN preserved');
    assertEqual(sanitized.includes('SWAYBACK'), true, 'SWAYBACK preserved');
    assertEqual(sanitized.includes('ROUND_BACK'), true, 'ROUND_BACK preserved');
    assertEqual(sanitized.length, 4, 'Exactly 4 tags retained');
  });

  runTest('1.13 Posture Tag Sanitization: Deduplication and filtering of unknown values', () => {
    const withDuplicates = ['SWAYBACK', 'SWAYBACK', 'INVALID_TAG', 123, null, 'SLOPING_SHOULDERS'];
    const sanitized = sanitizePostureTags(withDuplicates);
    assertEqual(sanitized.length, 2, 'Deduplicated and filtered unknown values');
    assertEqual(sanitized.includes('SWAYBACK'), true);
    assertEqual(sanitized.includes('SLOPING_SHOULDERS'), true);
    assertEqual(sanitized.includes('INVALID_TAG'), false);
  });

  // ==========================================================================
  // SECTION 2: AI Garment Analyzer API (/api/analyze-garment)
  // ==========================================================================
  console.log(`\n${BOLD}2. Challenge AI Garment Analyzer API (/api/analyze-garment)${RESET}`);

  runTest('2.1 Payload Validation: Empty payload or null file returns error', () => {
    const resNull = validateUploadPayload(null);
    assertEqual(resNull.valid, false);
    assertEqual(resNull.error, 'هیچ فایلی ارسال نشده است');

    const resEmpty = validateUploadPayload({});
    assertEqual(resEmpty.valid, false);
  });

  runTest('2.2 Payload Validation: Oversized payload (> 10MB) returns size error', () => {
    const resOver = validateUploadPayload({ size: 10 * 1024 * 1024 + 1, mimeType: 'image/jpeg' });
    assertEqual(resOver.valid, false);
    assertEqual(resOver.error, 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد');

    const resExact10M = validateUploadPayload({ size: 10 * 1024 * 1024, mimeType: 'image/jpeg' });
    assertEqual(resExact10M.valid, true);
  });

  runTest('2.3 Payload Validation: Invalid MIME types (.pdf, .exe, .gif) rejected', () => {
    for (const badMime of ['application/pdf', 'application/x-msdownload', 'image/gif', 'text/plain']) {
      const res = validateUploadPayload({ size: 1024, mimeType: badMime });
      assertEqual(res.valid, false, `${badMime} rejected`);
      assertEqual(res.error, 'تنها تصاویر JPG، PNG و WebP مجاز هستند');
    }

    for (const goodMime of ['image/jpeg', 'image/png', 'image/webp']) {
      const res = validateUploadPayload({ size: 1024, mimeType: goodMime });
      assertEqual(res.valid, true, `${goodMime} accepted`);
    }
  });

  await runAsyncTest('2.4 Missing GEMINI_API_KEY: Transparently triggers deterministic heuristic engine', async () => {
    // undefined API key
    const resUndef = await analyzeGarmentImage(undefined, {
      base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      preset: 'trench_coat',
    });
    assertEqual(resUndef.source, 'HEURISTIC_FALLBACK');
    const valUndef = validateGarmentAnalysis(resUndef.result);
    assertEqual(valUndef.valid, true, 'Schema validation must pass');

    // Empty string API key
    const resEmpty = await analyzeGarmentImage('', {
      base64: 'somebase64',
      preset: 'evening_gown',
    });
    assertEqual(resEmpty.source, 'HEURISTIC_FALLBACK');
    assertEqual(resEmpty.result.silhouette.type, 'HOURGLASS');

    // Whitespace string API key
    const resSpaces = await analyzeGarmentImage('   ', {
      base64: 'somebase64',
      preset: 'blouse',
    });
    assertEqual(resSpaces.source, 'HEURISTIC_FALLBACK');
    assertEqual(resSpaces.result.baseBlockRecommendation.baseBlock, 'FITTED_BODICE');
    assertEqual(resSpaces.result.baseBlockRecommendation.recommendedMethod, 'METRIC');
  });

  await runAsyncTest('2.5 Corrupted / Garbage Base64: Zero-crash deterministic fallback conforming to schema', async () => {
    const garbagePayloads = [
      'NOT_BASE64_AT_ALL_!@#$%^&*()_+',
      'data:image/jpeg;base64,???corrupted???',
      '==',
      'a',
    ];

    for (const garbage of garbagePayloads) {
      const res = await analyzeGarmentImage(undefined, {
        base64: garbage,
        preset: 'tailored_trousers',
      });
      assertEqual(res.source, 'HEURISTIC_FALLBACK');
      assertEqual(res.result.baseBlockRecommendation.baseBlock, 'TROUSER');
      assertEqual(res.result.baseBlockRecommendation.recommendedMethod, 'MULLER');
      const val = validateGarmentAnalysis(res.result);
      assertEqual(val.valid, true, `Garbage base64 schema validation for ${garbage}`);
    }
  });

  runTest('2.6 Deterministic Heuristic Engine: All 4 presets conform strictly to GarmentAnalysis schema', () => {
    const presets = ['trench_coat', 'evening_gown', 'blouse', 'tailored_trousers'];
    for (const p of presets) {
      const result = generateHeuristicFallback(p);
      const val = validateGarmentAnalysis(result);
      assertEqual(val.valid, true, `Preset ${p} must be schema-valid: ${val.error}`);
      assert(result.confidenceScore >= 0 && result.confidenceScore <= 1, 'Confidence score in [0, 1]');
      assert(result.draftingSteps.length > 0, 'draftingSteps non-empty');
      assert(result.matchingMarketplacePatterns.length > 0, 'matchingMarketplacePatterns non-empty');
      assert(result.fabricRecommendations.primaryFabrics.length > 0, 'primaryFabrics non-empty');
    }

    // Unknown preset falls back to default trench_coat safely
    const unknown = generateHeuristicFallback('completely_unknown_preset_123');
    assertEqual(validateGarmentAnalysis(unknown).valid, true, 'Unknown preset fallback must be schema-valid');
    assertEqual(unknown.silhouette.type, 'A_LINE');
  });

  runTest('2.7 Studio Deep-Link Generation: Encodes baseBlock, method, and preset correctly', () => {
    // Trench coat -> FITTED_BODICE / MULLER
    const trench = generateHeuristicFallback('trench_coat');
    const linkTrench = generateStudioDeepLink(trench);
    assert(linkTrench.startsWith('/studio?'), 'Starts with /studio?');
    const paramsTrench = new URLSearchParams(linkTrench.replace('/studio?', ''));
    assertEqual(paramsTrench.get('baseBlock'), 'FITTED_BODICE');
    assertEqual(paramsTrench.get('method'), 'MULLER');
    assertEqual(paramsTrench.get('preset'), 'ai-extracted');

    // Tailored Trousers -> TROUSER / MULLER
    const trousers = generateHeuristicFallback('tailored_trousers');
    const linkTrousers = generateStudioDeepLink(trousers);
    const paramsTrousers = new URLSearchParams(linkTrousers.replace('/studio?', ''));
    assertEqual(paramsTrousers.get('baseBlock'), 'TROUSER');
    assertEqual(paramsTrousers.get('method'), 'MULLER');

    // Evening gown -> FITTED_BODICE / GRLAWEIN
    const gown = generateHeuristicFallback('evening_gown');
    const linkGown = generateStudioDeepLink(gown);
    const paramsGown = new URLSearchParams(linkGown.replace('/studio?', ''));
    assertEqual(paramsGown.get('baseBlock'), 'FITTED_BODICE');
    assertEqual(paramsGown.get('method'), 'GRLAWEIN');

    // Invalid base block defaults gracefully to FITTED_BODICE
    const hacked = JSON.parse(JSON.stringify(trench));
    hacked.baseBlockRecommendation.baseBlock = 'INVALID_BLOCK_TYPE';
    const linkHacked = generateStudioDeepLink(hacked);
    const paramsHacked = new URLSearchParams(linkHacked.replace('/studio?', ''));
    assertEqual(paramsHacked.get('baseBlock'), 'FITTED_BODICE', 'Defaults to FITTED_BODICE');
  });

  // ==========================================================================
  // SECTION 3: Canvas Zoom Clamping (0.2 to 5.0) in src/components/studio/canvas.tsx
  // ==========================================================================
  console.log(`\n${BOLD}3. Challenge Canvas Zoom Clamping in src/components/studio/canvas.tsx${RESET}`);

  // Extract and verify exact clamping implementation
  const canvasPath = path.resolve(process.cwd(), 'src/components/studio/canvas.tsx');
  assert(fs.existsSync(canvasPath), 'src/components/studio/canvas.tsx must exist');
  const canvasContent = fs.readFileSync(canvasPath, 'utf8');

  runTest('3.1 Source Verification: clampZoom implementation exists in canvas.tsx', () => {
    assert(canvasContent.includes('Math.min(5.0, Math.max(0.2, Number(k)))'), 'canvas.tsx contains exact min 0.2 and max 5.0 clamping');
    assert(canvasContent.includes('setZoom((prev) => clampZoom(prev + zoomDelta))'), 'wheel handler invokes clampZoom');
    assert(canvasContent.includes('setZoom((z) => clampZoom(z + 0.25))'), 'zoom-in button invokes clampZoom +0.25');
    assert(canvasContent.includes('setZoom((z) => clampZoom(z - 0.25))'), 'zoom-out button invokes clampZoom -0.25');
  });

  // Emulate exact clampZoom function from canvas.tsx:
  // const clampZoom = (k: number) => {
  //   if (isNaN(k) || k === null) return 1.0;
  //   return Math.min(5.0, Math.max(0.2, Number(k)));
  // };
  const clampZoom = (k) => {
    if (isNaN(k) || k === null) return 1.0;
    return Math.min(5.0, Math.max(0.2, Number(k)));
  };

  runTest('3.2 Zoom Lower Bound Clamping (cannot be less than 0.2)', () => {
    assertEqual(clampZoom(0.2), 0.2, 'Exact lower bound 0.2 preserved');
    assertEqual(clampZoom(0.1999), 0.2, '0.1999 clamped to 0.2');
    assertEqual(clampZoom(0.1), 0.2, '0.1 clamped to 0.2');
    assertEqual(clampZoom(0.0), 0.2, '0.0 clamped to 0.2');
    assertEqual(clampZoom(-1.0), 0.2, '-1.0 clamped to 0.2');
    assertEqual(clampZoom(-100.0), 0.2, '-100.0 clamped to 0.2');
    assertEqual(clampZoom(-Infinity), 0.2, '-Infinity clamped to 0.2');
  });

  runTest('3.3 Zoom Upper Bound Clamping (cannot be greater than 5.0)', () => {
    assertEqual(clampZoom(5.0), 5.0, 'Exact upper bound 5.0 preserved');
    assertEqual(clampZoom(5.0001), 5.0, '5.0001 clamped to 5.0');
    assertEqual(clampZoom(5.25), 5.0, '5.25 clamped to 5.0');
    assertEqual(clampZoom(10.0), 5.0, '10.0 clamped to 5.0');
    assertEqual(clampZoom(100.0), 5.0, '100.0 clamped to 5.0');
    assertEqual(clampZoom(Infinity), 5.0, 'Infinity clamped to 5.0');
  });

  runTest('3.4 Zoom Non-Numeric / Null Safety (defaults to 1.0)', () => {
    assertEqual(clampZoom(NaN), 1.0, 'NaN returns 1.0');
    assertEqual(clampZoom(null), 1.0, 'null returns 1.0');
    assertEqual(clampZoom(undefined), 1.0, 'undefined returns 1.0');
  });

  runTest('3.5 Stress Test: Repeated Zoom In/Out sequence clamps within [0.2, 5.0]', () => {
    // Simulate clicking zoom-in button 40 times from 1.0
    let zoomLevel = 1.0;
    for (let i = 0; i < 40; i++) {
      zoomLevel = clampZoom(zoomLevel + 0.25);
      assert(zoomLevel <= 5.0, `Zoom level ${zoomLevel} must never exceed 5.0 at step ${i}`);
      assert(zoomLevel >= 0.2, `Zoom level ${zoomLevel} must never drop below 0.2 at step ${i}`);
    }
    assertEqual(zoomLevel, 5.0, 'Zoom capped at 5.0 after 40 zoom-in clicks');

    // Simulate clicking zoom-out button 50 times from 5.0
    for (let i = 0; i < 50; i++) {
      zoomLevel = clampZoom(zoomLevel - 0.25);
      assert(zoomLevel <= 5.0, `Zoom level ${zoomLevel} must never exceed 5.0 at step ${i}`);
      assert(zoomLevel >= 0.2, `Zoom level ${zoomLevel} must never drop below 0.2 at step ${i}`);
    }
    assertEqual(zoomLevel, 0.2, 'Zoom capped at 0.2 after 50 zoom-out clicks');

    // Simulate extreme wheel deltas
    const massiveZoomIn = clampZoom(zoomLevel + (-(-100000) * 0.0015));
    assertEqual(massiveZoomIn, 5.0, 'Massive wheel zoom in clamped to 5.0');

    const massiveZoomOut = clampZoom(zoomLevel + (-(100000) * 0.0015));
    assertEqual(massiveZoomOut, 0.2, 'Massive wheel zoom out clamped to 0.2');
  });

  // ==========================================================================
  // Summary
  // ==========================================================================
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}           EMPIRICAL ADVERSARIAL CHALLENGE SUMMARY                      ${RESET}`);
  console.log(`${BOLD}========================================================================${RESET}`);
  console.log(`Total Adversarial Checks Run:  ${totalTests}`);
  console.log(`Passed Checks:                 ${GREEN}${passedTests}${RESET}`);
  console.log(`Failed Checks:                 ${failedTests > 0 ? RED : GREEN}${failedTests}${RESET}`);

  if (failedTests > 0) {
    console.log(`\n${RED}${BOLD}Failures encountered (${failedTests}):${RESET}`);
    for (const f of failureList) {
      console.log(`- ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${GREEN}${BOLD}✔ ALL ADVERSARIAL CHECKS PASSED EMPIRICALLY WITH 100% SUCCESS RATE!${RESET}\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
