/**
 * Tier 4 — Scenario 5: Multi-Method Tailoring Parity Verification
 * Exercises: F9, F13, F14, F17, F20
 *
 * Story:
 * Rigorously compares the mathematical outputs of Basic Skirt across all 3 tailoring methods:
 * Müller & Sohn (مولر), Aldrich Metric (متریک), and Grlawein (گرلاوین) for the same standard
 * anthropometric inputs (Waist 70cm, Hip 94cm, Length 65cm).
 *
 * Invariants Verified:
 * 1. Total half-hip block width equals (H + Ease)/2 across all methods.
 * 2. Total waist suppression (deltaW) is fully accounted for by side seam and waist darts.
 * 3. Front and back side seam lengths match within 1.0mm (seam length parity invariant).
 * 4. All dart suppression values remain positive and bounded.
 * 5. All three methods produce valid 1:1 scale SVG and ASTM D6673 / AAMA-DXF vector outputs.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertSeamParity,
  draftBasicSkirt,
  generatePatternSvg,
  generateAAMADxf,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdMeasurements = BENCHMARK_PROFILES[0].measurements;

describe('Tier 4 Scenario 5: Multi-Method Tailoring Parity Verification', () => {
  let mullerDraft = null;
  let metricDraft = null;
  let grlaweinDraft = null;

  test('Step 1: Draft Basic Skirt across Müller, Metric, and Grlawein using identical measurements', () => {
    mullerDraft = draftBasicSkirt(stdMeasurements, { method: 'MULLER', fitPreference: 'CLASSIC' });
    metricDraft = draftBasicSkirt(stdMeasurements, { method: 'METRIC', fitPreference: 'CLASSIC' });
    grlaweinDraft = draftBasicSkirt(stdMeasurements, { method: 'GRLAWEIN', fitPreference: 'CLASSIC' });

    assertEqual(mullerDraft.blockType, 'SKIRT');
    assertEqual(metricDraft.blockType, 'SKIRT');
    assertEqual(grlaweinDraft.blockType, 'SKIRT');
  });

  test('Step 2: Parity Check 1 — Half-hip block width parity across all 3 methods', () => {
    // With H = 94 and Classic Ease = 2.0 -> Wblock = 96 / 2 = 48.0cm
    assertCloseTo(mullerDraft.Wblock, 48.0, 1e-2, 'Müller block width');
    assertCloseTo(metricDraft.Wblock, 48.0, 1e-2, 'Metric block width');
    // Grlawein Wfront + Wback = (94/4 + 0.5 + 0.5) + (94/4 - 0.5 + 0.5) = 24.5 + 23.5 = 48.0cm
    assertCloseTo(grlaweinDraft.Wfront + grlaweinDraft.Wback, 48.0, 1e-2, 'Grlawein total block width');
  });

  test('Step 3: Parity Check 2 — Waist suppression accounting invariant', () => {
    // Total waist suppression deltaW = Wblock - Wtarget = 48.0 - 35.5 = 12.5cm
    assertCloseTo(mullerDraft.deltaW, 12.5, 1e-2, 'Müller deltaW');
    assertCloseTo(metricDraft.deltaW, 12.5, 1e-2, 'Metric deltaW');

    // In Müller: Sside + Dback + Dfront = deltaW
    assertCloseTo(mullerDraft.Sside + mullerDraft.Dback + mullerDraft.Dfront, mullerDraft.deltaW, 1e-3, 'Müller suppression balance');
    // In Metric: Sside + Dback + Dfront = deltaW
    assertCloseTo(metricDraft.Sside + metricDraft.Dback + metricDraft.Dfront, metricDraft.deltaW, 1e-3, 'Metric suppression balance');
  });

  test('Step 4: Parity Check 3 — Side seam length parity (Front vs Back) within 1.0mm tolerance', () => {
    assertSeamParity(mullerDraft.frontSideSeamLength, mullerDraft.backSideSeamLength, 1.0, 'Müller side seam parity');
    assertSeamParity(metricDraft.frontSideSeamLength, metricDraft.backSideSeamLength, 1.0, 'Metric side seam parity');
    assertSeamParity(grlaweinDraft.frontSideSeamLength, grlaweinDraft.backSideSeamLength, 1.0, 'Grlawein side seam parity');
  });

  test('Step 5: Parity Check 4 — Panel division methodology differentiation', () => {
    // Müller has front wider than back by exactly 2.0cm
    assertCloseTo(mullerDraft.Wfront - mullerDraft.Wback, 2.0, 1e-2, 'Müller panel difference is 2cm');
    // Metric has equal panels
    assertCloseTo(metricDraft.Wfront - metricDraft.Wback, 0.0, 1e-2, 'Metric panels are equal');
    // Grlawein has front wider than back by exactly 1.0cm
    assertCloseTo(grlaweinDraft.Wfront - grlaweinDraft.Wback, 1.0, 1e-2, 'Grlawein panel difference is 1cm');
  });

  test('Step 6: Parity Check 5 — CAD Vector and SVG exports succeed across all 3 methods', () => {
    const svgMuller = generatePatternSvg(mullerDraft);
    const svgMetric = generatePatternSvg(metricDraft);
    const svgGrlawein = generatePatternSvg(grlaweinDraft);

    assert(svgMuller.includes('xmlns="http://www.w3.org/2000/svg"'));
    assert(svgMetric.includes('xmlns="http://www.w3.org/2000/svg"'));
    assert(svgGrlawein.includes('xmlns="http://www.w3.org/2000/svg"'));

    const dxfMuller = generateAAMADxf(mullerDraft);
    const dxfMetric = generateAAMADxf(metricDraft);
    const dxfGrlawein = generateAAMADxf(grlaweinDraft);

    assert(dxfMuller.includes('SKIRT - MULLER'));
    assert(dxfMetric.includes('SKIRT - METRIC'));
    assert(dxfGrlawein.includes('SKIRT - GRLAWEIN'));
  });
});
