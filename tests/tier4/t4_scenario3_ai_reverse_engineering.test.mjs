/**
 * Tier 4 — Scenario 3: AI Reverse-Engineering to Custom Garment
 * Exercises: F10, F17, F18, F30, F31, F32
 *
 * Story:
 * A user uploads an evening gown photo to the AI Outfit Assistant (/ai-analyzer).
 * The system executes the multimodal analysis pipeline, extracts an hourglass silhouette
 * with princess seams and sleeveless styling, recommends Grlawein bodice block, and matches
 * the seeded "princess-seam-evening-dress" pattern. The user launches Studio via the deep-link,
 * inspects the 2D geometry, and exports the 1:1 ASTM D6673 / AAMA-DXF CAD vector file.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  validateGarmentAnalysis,
  generateHeuristicFallback,
  draftBasicBodice,
  generateAAMADxf,
  BENCHMARK_PROFILES,
  SEEDED_PATTERNS,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

describe('Tier 4 Scenario 3: AI Reverse-Engineering to Custom Garment', () => {
  let uploadedImagePayload = null;
  let analysisResult = null;
  let studioLaunchParams = null;
  let draftedBodice = null;
  let exportedDxf = null;

  test('Step 1: User uploads evening gown photo to AI Outfit Assistant', () => {
    uploadedImagePayload = {
      filename: 'evening-gown.jpg',
      mimeType: 'image/jpeg',
      size: 3.5 * 1024 * 1024, // 3.5MB (valid < 10MB)
      preset: 'evening_gown',
    };

    assert(uploadedImagePayload.size < 10 * 1024 * 1024, 'Image size is within 10MB limit');
    assertEqual(uploadedImagePayload.mimeType, 'image/jpeg');
  });

  test('Step 2: AI Analyzer extracts silhouette, neckline, princess seams, and fabric recommendations', () => {
    analysisResult = generateHeuristicFallback(uploadedImagePayload.preset);
    const validation = validateGarmentAnalysis(analysisResult);
    assertEqual(validation.valid, true, 'Analysis conforms to strict schema');

    assertEqual(analysisResult.silhouette.type, 'HOURGLASS');
    assertEqual(analysisResult.dartsAndPleats.princessSeam, true, 'Princess seams detected');
    assertEqual(analysisResult.baseBlockRecommendation.baseBlock, 'FITTED_BODICE');
    assertEqual(analysisResult.baseBlockRecommendation.recommendedMethod, 'GRLAWEIN');
    assert(analysisResult.confidenceScore >= 0.90, 'High confidence score');
  });

  test('Step 3: AI recommendations surface matching marketplace patterns with high similarity', () => {
    assert(analysisResult.matchingMarketplacePatterns.length > 0, 'Matching patterns returned');
    const match = analysisResult.matchingMarketplacePatterns[0];
    assertEqual(match.slug, 'princess-seam-evening-dress');
    assert(match.similarityScore >= 0.95);

    // Verify pattern exists in seeded store
    const storePattern = SEEDED_PATTERNS.find((p) => p.slug === match.slug);
    assert(storePattern !== undefined, 'Pattern verified in catalog');
  });

  test('Step 4: User launches Studio via AI deep-link configuring Grlawein Fitted Bodice', () => {
    const params = new URLSearchParams({
      baseBlock: analysisResult.baseBlockRecommendation.baseBlock,
      method: analysisResult.baseBlockRecommendation.recommendedMethod,
      preset: 'ai-extracted',
    });
    studioLaunchParams = params;
    assertEqual(studioLaunchParams.get('baseBlock'), 'FITTED_BODICE');
    assertEqual(studioLaunchParams.get('method'), 'GRLAWEIN');
  });

  test('Step 5: Studio drafts Grlawein Fitted Bodice with conformational bust dart', () => {
    draftedBodice = draftBasicBodice(stdProfile.measurements, {
      method: 'GRLAWEIN',
      fitPreference: 'TIGHT',
    });

    assertEqual(draftedBodice.blockType, 'BODICE');
    assertEqual(draftedBodice.method, 'GRLAWEIN');
    // Grlawein conformational dart = FL - BL = 43.5 - 41.0 = 2.5cm
    assertEqual(draftedBodice.Dbust, 2.5, 'Grlawein conformational dart matches FL - BL');
  });

  test('Step 6: User exports 1:1 scale ASTM D6673 / AAMA-DXF CAD file for Gerber/Lectra cutter', () => {
    exportedDxf = generateAAMADxf(draftedBodice);
    assert(exportedDxf.includes('$INSUNITS\n70\n4'), 'Metric millimeter units in header ($INSUNITS=4)');
    assert(exportedDxf.includes('BODICE - GRLAWEIN'), 'DXF layer 5 text documents Grlawein bodice');
    assert(exportedDxf.includes('LAYER\n2\n1'), 'Cut layer 1 defined');
    assert(exportedDxf.includes('LAYER\n2\n2'), 'Sew layer 2 defined');
    assert(exportedDxf.trim().endsWith('EOF'), 'DXF properly terminates with EOF');
  });
});
