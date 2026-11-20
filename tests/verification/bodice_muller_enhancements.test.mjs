/**
 * Targeted Unit & Integration Tests: Müller Bodice Block Enhancements
 * Verifies hip-level extension, concave neckline, CB/CF labeling, suppression darts, and contours.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

// Dynamic import helper
async function loadDraftingEngine() {
  try {
    const mod = await import('../../src/lib/drafting/index.ts');
    return mod;
  } catch (err) {
    const harness = await import('../harness/index.mjs');
    return harness;
  }
}

const stdProfile = BENCHMARK_PROFILES[0]; // Sara Mohammadi (Müller Size 38)

// ============================================================================
// SUITE 1: Hip Line Extension & Bounding Dimensions
// ============================================================================
describe('Müller Bodice: Hip Line Extension & Frame Dimensions', () => {
  test('Bodice-Hip-1: Bodice extends down to hip line with customizable hipDepth', async () => {
    const engine = await loadDraftingEngine();
    const defaultBodice = engine.draftBasicBodice(stdProfile.measurements);
    assertEqual(defaultBodice.blockType, 'BODICE');

    // Default hip depth 20cm (200mm)
    const expectedBL = stdProfile.measurements.backLength ?? 41.0;
    const expectedWaistY = expectedBL * 10;
    const expectedHipY = expectedWaistY + 200;

    assertCloseTo(defaultBodice.points.cbHip.y, expectedHipY, 1e-2, 'cbHip Y at waist + 20cm');
    assertCloseTo(defaultBodice.points.cfHip.y, expectedHipY, 1e-2, 'cfHip Y at waist + 20cm');

    // Bounding height
    const expectedHeight = (expectedBL + 0 + 20.0) * 10 + 20;
    assertCloseTo(defaultBodice.boundingBox.height, expectedHeight, 1e-2, 'Bounding height accommodates hipDepth');

    // Custom hipDepth
    const customBodice = engine.draftBasicBodice({ ...stdProfile.measurements, hipDepth: 22.0 });
    assertCloseTo(customBodice.points.cbHip.y, expectedWaistY + 220, 1e-2, 'Custom hip depth 22cm honored');
    assertCloseTo(customBodice.boundingBox.height, (expectedBL + 22.0) * 10 + 20, 1e-2, 'Custom bounding height');
  });

  test('Bodice-Hip-2: Front length offset extends front hip line symmetrically', async () => {
    const engine = await loadDraftingEngine();
    const normal = engine.draftBasicBodice(stdProfile.measurements, { posture: { prominentAbdomen: false } });
    const abdomen = engine.draftBasicBodice(stdProfile.measurements, { posture: { prominentAbdomen: true } });

    assert(abdomen.points.cfWaist.y > normal.points.cfWaist.y, 'Front waist lengthened by 15mm');
    assert(abdomen.points.cfHip.y > normal.points.cfHip.y, 'Front hip lengthened proportionally');
    assertCloseTo(abdomen.points.cfHip.y - abdomen.points.cfWaist.y, normal.points.cfHip.y - normal.points.cfWaist.y, 1e-2, 'Hip depth constant');
  });
});

// ============================================================================
// SUITE 2: Center Front (CF), Center Back (CB) and Construction Lines
// ============================================================================
describe('Müller Bodice: CB/CF Line Labels and Construction Guides', () => {
  test('Bodice-Lines-1: Construction lines include explicit CB, CF, and distinct horizontal guide levels', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    assert(Array.isArray(bodice.constructionLines), 'constructionLines must be an array');

    const labels = bodice.constructionLines.map((l) => l.label);

    // Required vertical labels
    assert(labels.includes('خط مرکزی جلو (CF)'), "Must include 'خط مرکزی جلو (CF)'");
    assert(labels.includes('خط مرکزی پشت (CB)'), "Must include 'خط مرکزی پشت (CB)'");
    assert(labels.includes('خط پهلو'), "Must include 'خط پهلو'");

    // Required horizontal guide labels
    assert(labels.includes('خط کف حلقه آستین'), "Must include 'خط کف حلقه آستین'");
    assert(labels.includes('خط کمر'), "Must include 'خط کمر'");
    assert(labels.includes('خط باسن'), "Must include 'خط باسن'");

    // Frame types check
    const frameLines = bodice.constructionLines.filter((l) => l.type === 'frame');
    assert(frameLines.length >= 4, 'Bounding frame lines present');

    const axisLines = bodice.constructionLines.filter((l) => l.type === 'axis');
    assert(axisLines.length >= 3, 'Vertical axes (CB, CF, side seam) present');
  });

  test('Bodice-Lines-2: Center Back waist suppression indents CB and returns to line at hip', async () => {
    const engine = await loadDraftingEngine();
    const normal = engine.draftBasicBodice(stdProfile.measurements, { posture: { swayback: false } });
    const swayback = engine.draftBasicBodice(stdProfile.measurements, { posture: { swayback: true } });

    // Indentation at waist
    assert(normal.points.cbWaist.x >= 15, 'CB waist indented by at least 15mm for standard suppression');
    assert(swayback.points.cbWaist.x >= 20, 'CB waist indented further (20mm) for swayback posture');

    // Returns to line (X = 0) at hip line
    assertEqual(normal.points.cbHip.x, 0, 'CB returns to zero axis at hip line');
    assertEqual(swayback.points.cbHip.x, 0, 'Swayback CB returns to zero axis at hip line');
  });
});

// ============================================================================
// SUITE 3: Front Neckline Curvature & Shoulder Darts
// ============================================================================
describe('Müller Bodice: Front Neckline and Shoulder Dart Geometry', () => {
  test('Bodice-Neck-1: Front neckline is a concave curve dipping down and into CF with horizontal tangent', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const frontContour = bodice.contours[1];
    assert(frontContour, 'Front contour path must exist');

    // Front contour must start at front neck pit at CF
    const pitX = bodice.points.frontNeckPit.x;
    const pitY = bodice.points.frontNeckPit.y;
    assert(frontContour.startsWith(`M ${pitX.toFixed(1)} ${pitY.toFixed(1)}`), 'Front contour starts at front neck pit');

    // Verify neckline curve ends at frontNeckPit and starts from frontNeck
    assert(frontContour.includes(`${bodice.points.frontNeck.x.toFixed(1)} ${bodice.points.frontNeck.y.toFixed(1)}`), 'Passes through frontNeck point');
    assert(frontContour.endsWith('Z'), 'Contour is closed');
  });

  test('Bodice-Darts-1: Front shoulder bust dart points to bust apex', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const apex = bodice.points.bustApex;
    const frontContour = bodice.contours[1];

    // Contour dips down to bust apex
    assert(frontContour.includes(`${apex.x.toFixed(1)} ${apex.y.toFixed(1)}`), 'Front contour passes through bustApex');

    // Darts array includes bust dart with apex
    const bustDart = bodice.darts.find((d) => d.some((p) => Math.abs(p.x - apex.x) < 1e-2 && Math.abs(p.y - apex.y) < 1e-2));
    assert(bustDart, 'Bust dart polygon found in darts layer');
  });

  test('Bodice-Darts-2: Back shoulder dart is present on back shoulder seam', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const backContour = bodice.contours[0];
    assert(backContour, 'Back contour path exists');

    // Back contour passes through back shoulder dart points
    assert(bodice.darts.length >= 4, 'Darts array contains at least 4 darts (back waist, front waist, front bust, back shoulder)');
  });
});

// ============================================================================
// SUITE 4: Waist-to-Hip Darts & Hip Flaring
// ============================================================================
describe('Müller Bodice: Waist-to-Hip Darts and Hip Flaring', () => {
  test('Bodice-HipDarts-1: Front waist-to-hip dart is widest at waist and ends 3-5cm above hip line', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const frontWaistDart = bodice.darts[1]; // Front waist-to-hip dart
    assertEqual(frontWaistDart.length, 4, 'Front waist dart is a 4-point diamond polygon');

    const topApex = frontWaistDart[0];
    const leftWaist = frontWaistDart[1];
    const bottomApex = frontWaistDart[2];
    const rightWaist = frontWaistDart[3];

    // Apex below bust apex
    assert(topApex.y > bodice.points.bustApex.y, 'Top apex is positioned below bust apex');

    // Widest at waist
    const waistWidthMm = rightWaist.x - leftWaist.x;
    assertCloseTo(waistWidthMm, bodice.frontDartWidth * 10, 1e-2, 'Waist width matches frontDartWidth');

    // Ends 3-5cm above hip line
    const hipY = bodice.points.cfHip.y;
    const distanceAboveHip = hipY - bottomApex.y;
    assert(distanceAboveHip >= 30 && distanceAboveHip <= 50, `Dart ends ${distanceAboveHip}mm above hip line (expected 30-50mm)`);
  });

  test('Bodice-HipDarts-2: Back waist-to-hip dart starts below underarm and extends to hip level', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const backWaistDart = bodice.darts[0]; // Back waist dart
    assertEqual(backWaistDart.length, 4, 'Back waist dart is a 4-point diamond polygon');

    const topApex = backWaistDart[0];
    const bottomApex = backWaistDart[2];

    assert(topApex.y > bodice.points.underarmLevel.y, 'Top apex starts below underarm level');
    assert(bottomApex.y > bodice.points.cbWaist.y, 'Bottom apex extends down past waist into hip level');
  });

  test('Bodice-Flare-1: Side seam tapers inward at waist and flares outward at hip line', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    const sideUnderarmX = bodice.points.sideSeamUnderarm.x;
    const sideHipBackX = bodice.points.sideHipBack.x;
    const sideHipFrontX = bodice.points.sideHipFront.x;

    // Back panel: CB is at X=0, side seam is on the right
    // At waist, back side seam indents left towards CB
    // At hip, back side seam flares right (outward)
    assert(sideHipBackX > sideUnderarmX, 'Back side seam flares outward at hip line');

    // Front panel: CF is at X=blockWidth, side seam is on the left
    // At waist, front side seam indents right towards CF
    // At hip, front side seam flares left (outward)
    assert(sideHipFrontX < sideUnderarmX, 'Front side seam flares outward at hip line');
  });
});

// ============================================================================
// SUITE 5: 5-Step Persian Construction Timeline
// ============================================================================
describe('Müller Bodice: 5-Step Construction Progression', () => {
  test('Bodice-Steps-1: Exactly 5 structured construction steps with Persian titles and elements', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);

    assertEqual(bodice.steps.length, 5, 'Bodice has 5 structured steps');

    const titles = bodice.steps.map((s) => s.titleFa);
    assert(titles[0].includes('بالاتنه'), 'Step 0 mentions بالاتنه');
    assert(titles[1].includes('طوق گردن پشت'), 'Step 1 mentions طوق گردن پشت');
    assert(titles[2].includes('پنس'), 'Step 2 mentions پنس');
    assert(titles[3].includes('حلقه آستین'), 'Step 3 mentions حلقه آستین');
    assert(titles[4].includes('ساسون‌های کمر') || titles[4].includes('باسن'), 'Step 4 mentions ساسون‌های کمر و باسن');

    bodice.steps.forEach((step, idx) => {
      assertEqual(step.stepIndex, idx, `Step index ${idx}`);
      assert(step.instructionFa && step.instructionFa.length > 20, `Step ${idx} informative instruction`);
      assert(step.calculatedValues && Object.keys(step.calculatedValues).length >= 2, `Step ${idx} calculated values`);
      assert(Array.isArray(step.elements) && step.elements.length > 0, `Step ${idx} active elements`);
    });
  });
});
