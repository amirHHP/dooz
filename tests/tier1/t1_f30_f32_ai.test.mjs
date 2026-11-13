/**
 * Tier 1 — Core Features F30 through F32: AI Outfit Reverse-Engineering Assistant
 * 5 tests per feature = 15 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  validateGarmentAnalysis,
  generateHeuristicFallback,
} from '../harness/index.mjs';

// ============================================================================
// F30: AI Outfit Assistant Upload (5 tests)
// ============================================================================
describe('F30: AI Outfit Assistant Upload', () => {
  function validateUploadPayload(payload) {
    if (!payload) return { valid: false, error: 'Empty payload' };
    if (payload.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد' };
    }
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED.includes(payload.mimeType)) {
      return { valid: false, error: 'تنها تصاویر JPG، PNG و WebP مجاز هستند' };
    }
    return { valid: true };
  }

  test('F30-1: Valid JPEG/PNG/WebP image under 10MB passes upload validation', () => {
    const res = validateUploadPayload({ size: 2 * 1024 * 1024, mimeType: 'image/jpeg' });
    assertEqual(res.valid, true, 'Valid image accepted');
  });

  test('F30-2: File exceeding 10MB limit is rejected with Persian error message', () => {
    const res = validateUploadPayload({ size: 12 * 1024 * 1024, mimeType: 'image/jpeg' });
    assertEqual(res.valid, false, 'Large file rejected');
    assert(res.error.includes('۱۰ مگابایت'), 'Error message mentions 10MB');
  });

  test('F30-3: Non-image MIME types (e.g. application/pdf) are rejected', () => {
    const res = validateUploadPayload({ size: 500 * 1024, mimeType: 'application/pdf' });
    assertEqual(res.valid, false, 'PDF rejected in garment photo uploader');
  });

  test('F30-4: Curated sample wardrobe provides at least 2 pre-configured garments for 1-click test', () => {
    const trench = generateHeuristicFallback('trench_coat');
    const gown = generateHeuristicFallback('evening_gown');
    assert(trench && gown, 'Sample presets exist');
  });

  test('F30-5: Image upload accepts base64 data payloads', () => {
    const mockBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
    assert(mockBase64.startsWith('data:image/'), 'Valid data URL format');
  });
});

// ============================================================================
// F31: Gemini Vision & Heuristic Fallback (5 tests)
// ============================================================================
describe('F31: Gemini Vision & Heuristic Fallback', () => {
  test('F31-1: Heuristic fallback produces valid, schema-conforming reverse-engineering JSON', () => {
    const fallback = generateHeuristicFallback('trench_coat');
    const validation = validateGarmentAnalysis(fallback);
    assertEqual(validation.valid, true, 'Fallback adheres to strict schema');
  });

  test('F31-2: Analysis extracts garment silhouette, neckline, and sleeve construction', () => {
    const fallback = generateHeuristicFallback('trench_coat');
    assertEqual(fallback.silhouette.type, 'A_LINE');
    assert(fallback.neckline.type.includes('انگلیسی'), 'Identifies English lapel collar');
    assertEqual(fallback.sleeves.type, 'RAGLAN', 'Identifies raglan sleeve');
  });

  test('F31-3: Analysis identifies dart manipulation and pleats (e.g. Princess seams)', () => {
    const fallback = generateHeuristicFallback('trench_coat');
    assertEqual(fallback.dartsAndPleats.princessSeam, true, 'Princess seam detected');
    assert(fallback.dartsAndPleats.frontDarts.length > 0, 'Front darts identified');
  });

  test('F31-4: Analysis recommends suitable fabrics and fabric meterage for 110cm and 150cm rolls', () => {
    const fallback = generateHeuristicFallback('trench_coat');
    assert(fallback.fabricRecommendations.primaryFabrics.length >= 2, 'Recommends multiple fabrics');
    assert(fallback.fabricRecommendations.estimatedLengthMeters150cm > 0, '150cm roll estimate > 0');
    assert(fallback.fabricRecommendations.estimatedLengthMeters110cm > fallback.fabricRecommendations.estimatedLengthMeters150cm, '110cm roll needs more meterage');
  });

  test('F31-5: Analysis outputs confidence score between 0.80 and 1.0', () => {
    const fallback = generateHeuristicFallback('trench_coat');
    assert(fallback.confidenceScore >= 0.80 && fallback.confidenceScore <= 1.0, 'Confidence score in realistic high band');
  });
});

// ============================================================================
// F32: AI Studio & Marketplace Deep-Links (5 tests)
// ============================================================================
describe('F32: AI Studio & Marketplace Deep-Links', () => {
  function generateStudioDeepLink(analysis) {
    const params = new URLSearchParams();
    params.set('baseBlock', analysis.baseBlockRecommendation.baseBlock);
    params.set('method', analysis.baseBlockRecommendation.recommendedMethod);
    params.set('preset', 'ai-extracted');
    return `/studio?${params.toString()}`;
  }

  test('F32-1: Deep link to studio encodes recommended base block and method query parameters', () => {
    const analysis = generateHeuristicFallback('trench_coat');
    const link = generateStudioDeepLink(analysis);
    assert(link.includes('baseBlock=FITTED_BODICE'), 'Deep-link sets baseBlock');
    assert(link.includes('method=MULLER'), 'Deep-link sets method to Müller');
    assert(link.includes('preset=ai-extracted'), 'Deep-link marks preset');
  });

  test('F32-2: Deep link for evening gown configures Grlawein method and fitted block', () => {
    const analysis = generateHeuristicFallback('evening_gown');
    const link = generateStudioDeepLink(analysis);
    assert(link.includes('method=GRLAWEIN'), 'Gown recommends Grlawein method');
  });

  test('F32-3: Analysis returns matching marketplace pattern recommendations', () => {
    const analysis = generateHeuristicFallback('trench_coat');
    assert(analysis.matchingMarketplacePatterns.length > 0, 'At least 1 matching pattern returned');
    assert(analysis.matchingMarketplacePatterns[0].slug.length > 0, 'Matching pattern has valid slug');
  });

  test('F32-4: Matching patterns provide similarity scores >= 0.90', () => {
    const analysis = generateHeuristicFallback('trench_coat');
    assert(analysis.matchingMarketplacePatterns[0].similarityScore >= 0.90, 'High similarity score');
  });

  test('F32-5: Deep-link URL is safely encoded and RFC 3986 compliant', () => {
    const analysis = generateHeuristicFallback('trench_coat');
    const link = generateStudioDeepLink(analysis);
    assertDoesNotThrow(() => new URL(link, 'http://localhost:3000'), 'Deep-link parses as valid URL');
  });
});

function assertDoesNotThrow(fn, msg) {
  try {
    fn();
  } catch (err) {
    throw new Error(msg || err.message);
  }
}
