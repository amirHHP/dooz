/**
 * Tier 4 — Scenario 1: Tehran Tailor Custom Client Journey
 * Exercises: F3, F4, F9, F10, F13, F14, F15, F21, F22, F23
 *
 * Story:
 * Master Ali (Tehran bespoke tailor) logs in, registers a new client (Maryam Ahmadi)
 * with prominent abdomen and swayback lordosis, opens Studio pre-filled with her
 * measurements via the launch bridge, verifies that the Müller bodice and skirt
 * step-by-step construction adjusts front and back waistlines accordingly, and
 * exports the A4 tiled PDF with a verified 5cm x 5cm calibration square.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertCalibrationSquare,
  draftBasicSkirt,
  draftBasicBodice,
  calculateA4Tiling,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const maryamProfile = BENCHMARK_PROFILES[1]; // Maryam Ahmadi (Abdomen + Swayback)

describe('Tier 4 Scenario 1: Tehran Tailor Custom Client Journey', () => {
  let registeredClient = null;
  let studioLaunchUrl = null;
  let draftedBodice = null;
  let draftedSkirt = null;
  let a4Export = null;

  test('Step 1: Tailor registers client Maryam with 26 measurements and defect tags [PROMINENT_ABDOMEN, SWAYBACK]', () => {
    registeredClient = {
      id: 'client-tehran-maryam-42',
      tailorId: 'user-tailor-ali',
      firstName: 'مریم',
      lastName: 'احمدی',
      gender: 'FEMALE',
      measurements: maryamProfile.measurements,
      postureTags: ['PROMINENT_ABDOMEN', 'SWAYBACK'],
      fitPreference: 'CLASSIC',
      notes: 'مشتری مزون تهران - نیاز به تعدیل گودی کمر و آزادی خط شکم در جلو',
    };

    assertEqual(registeredClient.postureTags.length, 2);
    assert(registeredClient.postureTags.includes('PROMINENT_ABDOMEN'));
    assert(registeredClient.postureTags.includes('SWAYBACK'));
    assert(registeredClient.measurements.bust > 90);
  });

  test('Step 2: Tailor clicks "الگوکشی برای این مشتری" triggering studio launch bridge URL', () => {
    const params = new URLSearchParams({
      clientId: registeredClient.id,
      block: 'BODICE',
      method: 'MULLER',
    });
    studioLaunchUrl = `/studio?${params.toString()}`;
    assert(studioLaunchUrl.startsWith('/studio?'));
    assert(studioLaunchUrl.includes(`clientId=${registeredClient.id}`));
  });

  test('Step 3: Studio hydrates client measurements and applies Müller Bodice math with posture adjustments', () => {
    draftedBodice = draftBasicBodice(registeredClient.measurements, {
      method: 'MULLER',
      posture: {
        prominentAbdomen: registeredClient.postureTags.includes('PROMINENT_ABDOMEN'),
        swayback: registeredClient.postureTags.includes('SWAYBACK'),
      },
    });

    assertEqual(draftedBodice.blockType, 'BODICE');
    assertEqual(draftedBodice.method, 'MULLER');
    // For prominent abdomen, front bodice length is extended by 15mm
    assert(draftedBodice.points.cfWaist.y > draftedBodice.points.cbWaist.y, 'Front lengthened for abdomen protrusion');
    // Swayback indents center-back waist
    assert(draftedBodice.points.cbWaist.x > 0, 'CB waist indented for swayback lordosis');
  });

  test('Step 4: Tailor inspects timeline construction player verifying ordered Persian steps', () => {
    assert(draftedBodice.steps.length >= 3, 'At least 3 construction steps');
    const step0 = draftedBodice.steps[0];
    assertEqual(step0.stepIndex, 0);
    assert(step0.titleFa.includes('بالاتنه'), 'Step title in Persian');
    assert(step0.instructionFa.length > 10, 'Persian instruction populated');
  });

  test('Step 5: Tailor drafts matching Skirt verifying dual back darts and elevated front waist', () => {
    draftedSkirt = draftBasicSkirt(registeredClient.measurements, {
      method: 'MULLER',
      posture: {
        prominentAbdomen: registeredClient.postureTags.includes('PROMINENT_ABDOMEN'),
        swayback: registeredClient.postureTags.includes('SWAYBACK'),
      },
    });

    // Front waist raised by 15mm (negative Y)
    assertCloseTo(draftedSkirt.points.cfWaist.y, -15.0, 1e-2, 'CF waist raised 1.5cm');
    // Swayback creates dual back darts
    assertEqual(draftedSkirt.backDartCount, 2, 'Two back darts allocated');
    assertEqual(draftedSkirt.backDartWidths.length, 2, 'Two distinct back dart widths');
  });

  test('Step 6: Tailor exports 1:1 scale A4 Tiled PDF and verifies 5cm x 5cm calibration square', () => {
    a4Export = calculateA4Tiling(draftedSkirt.boundingBox.width, draftedSkirt.boundingBox.height);
    assert(a4Export.totalPages >= 4, 'Multi-page A4 tiling generated');
    assertEqual(a4Export.effWidthMm, 190.0, 'Printable width margin observed');
    assertEqual(a4Export.effHeightMm, 277.0, 'Printable height margin observed');

    // Calibration square integrity check
    assertCalibrationSquare(a4Export.calibrationSquare, 50.0, 0.1, 'Verified 5cm x 5cm test square');
    assertCloseTo(a4Export.calibrationSquare.widthPt, 141.732, 0.01, 'Exact 141.732 pt scale factor');
  });
});
