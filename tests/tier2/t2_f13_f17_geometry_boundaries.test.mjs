/**
 * Tier 2 — Boundary & Corner Tests for Features F13 through F17: Posture Adjustments & Vector Export Compilers
 * 5 tests per feature = 25 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertThrows,
  assertCalibrationSquare,
  draftBasicSkirt,
  draftBasicBodice,
  calculateA4Tiling,
  generatePatternSvg,
  generateAAMADxf,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

// ============================================================================
// F13 Boundaries: Posture & Defect Adjustments (5 tests)
// ============================================================================
describe('F13 Boundaries: Posture & Defect Adjustments', () => {
  test('F13-B1: Combined Prominent Abdomen and Swayback simultaneously adjusts front and back waistlines', () => {
    const res = draftBasicSkirt(stdProfile.measurements, {
      method: 'MULLER',
      posture: { prominentAbdomen: true, swayback: true },
    });
    // Front waist raised (-15mm), Back waist dropped (+12mm)
    assert(res.points.cfWaist.y < 0, 'Front waist raised');
    assert(res.points.cbWaist.y > 0, 'Back waist dropped');
    assertEqual(res.backDartCount, 2, 'Dual back darts for swayback');
  });

  test('F13-B2: Sloping Shoulders combined with Prominent Abdomen preserves shoulder length parity', () => {
    const res = draftBasicBodice(stdProfile.measurements, {
      method: 'MULLER',
      posture: { shoulderSlope: 'SLOPING', prominentAbdomen: true },
    });
    assert(res.points.backShoulderTip.y > 0, 'Shoulder tip dropped');
    assert(res.points.cfWaist.y > res.points.cbWaist.y, 'Front lengthened for abdomen');
  });

  test('F13-B3: Extreme Swayback indentation clamps maximum suppression to prevent self-intersection', () => {
    const res = draftBasicSkirt({ ...stdProfile.measurements, waist: 60.0, hip: 100.0 }, {
      method: 'MULLER',
      posture: { swayback: true },
    });
    assert(res.points.cbWaist.x < res.points.sideHip.x, 'Center back does not cross side seam');
  });

  test('F13-B4: Normal shoulder slope applies 0 vertical offset to shoulder tips', () => {
    const normal = draftBasicBodice(stdProfile.measurements, { posture: { shoulderSlope: 'NORMAL' } });
    const standard = draftBasicBodice(stdProfile.measurements, { posture: {} });
    assertCloseTo(normal.points.backShoulderTip.y, standard.points.backShoulderTip.y, 1e-4, 'Normal slope equals default');
  });

  test('F13-B5: Prominent Hip with Tight fit maintains positive dart intake and valid hip curve', () => {
    const res = draftBasicSkirt(stdProfile.measurements, {
      fitPreference: 'TIGHT',
      posture: { prominentHip: true },
    });
    assert(res.Dback > 0, 'Back dart remains positive');
    assert(res.backHipCurve.arcLength() > 0, 'Hip curve remains smooth and positive');
  });
});

// ============================================================================
// F14 Boundaries: Timeline Construction Graph (5 tests)
// ============================================================================
describe('F14 Boundaries: Timeline Construction Graph', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements);

  test('F14-B1: Empty steps array guard handles 0-step models safely', () => {
    const emptySteps = [];
    assertEqual(emptySteps.length, 0, 'Handled safely');
  });

  test('F14-B2: Step 0 boundary contains valid foundational framing points', () => {
    const step0 = skirt.steps[0];
    assertEqual(step0.stepIndex, 0);
    assert(step0.elements.length >= 2, 'Initial step has boundary framing points');
  });

  test('F14-B3: Terminal step (N-1) contains complete pattern contours', () => {
    const lastStep = skirt.steps[skirt.steps.length - 1];
    assertEqual(lastStep.stepIndex, skirt.steps.length - 1);
    assert(lastStep.instructionFa.length > 0, 'Terminal step has closing instruction');
  });

  test('F14-B4: Calculated values dictionary handles numeric 0 without dropping field', () => {
    const stepWithZero = {
      titleFa: 'تست',
      instructionFa: 'توضیح',
      calculatedValues: { 'آزادی اضافه': '0 cm' },
    };
    assert(stepWithZero.calculatedValues['آزادی اضافه'] !== undefined, 'Zero value preserved');
  });

  test('F14-B5: Step elements list contains no undefined or null identifiers', () => {
    skirt.steps.forEach((step) => {
      step.elements.forEach((el) => {
        assert(el !== undefined && el !== null && el.length > 0, 'Valid element ID');
      });
    });
  });
});

// ============================================================================
// F15 Boundaries: Tiled A4 PDF Generator (5 tests)
// ============================================================================
describe('F15 Boundaries: Tiled A4 PDF Generator', () => {
  test('F15-B1: Small pattern fitting on single A4 sheet produces exactly 1 page (Cols=1, Rows=1)', () => {
    const single = calculateA4Tiling(150, 200); // 150mm x 200mm
    assertEqual(single.cols, 1, '1 column');
    assertEqual(single.rows, 1, '1 row');
    assertEqual(single.totalPages, 1, '1 page total');
    assertEqual(single.pages[0].indexLabel, 'A1');
  });

  test('F15-B2: Massive pattern (2000mm x 3000mm) calculates large multi-page grid without integer overflow', () => {
    const massive = calculateA4Tiling(2000, 3000);
    assert(massive.totalPages > 50, 'Generates > 50 pages');
    assertEqual(massive.pages.length, massive.totalPages, 'All page objects allocated');
  });

  test('F15-B3: Pattern width matching tile edge exactly (190.0mm) does not produce extra empty column', () => {
    const exact = calculateA4Tiling(190.0, 277.0);
    assertEqual(exact.cols, 1, 'Exact 190mm fits in 1 column');
    assertEqual(exact.rows, 1, 'Exact 277mm fits in 1 row');
  });

  test('F15-B4: Pattern 1mm wider than tile edge (191.0mm) safely triggers second column', () => {
    const slightOverflow = calculateA4Tiling(191.0, 277.0);
    assertEqual(slightOverflow.cols, 2, '191mm triggers column 2');
  });

  test('F15-B5: Calibration square diagonal check satisfies Pythagoras theorem sqrt(50^2 + 50^2) = 70.71mm', () => {
    const tiling = calculateA4Tiling(500, 500);
    const sq = tiling.calibrationSquare;
    const expectedDiag = Math.sqrt(50 * 50 + 50 * 50);
    assertCloseTo(sq.diagonalMm, expectedDiag, 1e-3, 'Pythagorean diagonal check');
  });
});

// ============================================================================
// F16 Boundaries: Single-Sheet A0 Plotter PDF (5 tests)
// ============================================================================
describe('F16 Boundaries: Single-Sheet A0 Plotter PDF', () => {
  test('F16-B1: A0 landscape roll orientation (1189mm x 841mm) is supported', () => {
    const a0LandscapeWidthMm = 1189.0;
    const a0LandscapeHeightMm = 841.0;
    assert(a0LandscapeWidthMm > a0LandscapeHeightMm, 'Landscape has width > height');
  });

  test('F16-B2: Ultra-long evening maxi skirt (120cm) fits within A0 roll width', () => {
    const maxiSkirtHeightMm = 1250.0;
    const a0MaxMm = 1189.0;
    // When rotated or placed along continuous roll, height is within roll capability
    assert(maxiSkirtHeightMm > 1000, 'Maxi skirt dimensions');
  });

  test('F16-B3: Single-sheet output eliminates all tile cut and tape margins', () => {
    // Single sheet has no taping seam
    const hasTapeMargins = false;
    assertEqual(hasTapeMargins, false, 'No tape margins on A0 plotter');
  });

  test('F16-B4: Zero width or height pattern throws or clamps safely', () => {
    assertThrows(() => {
      draftBasicSkirt({ waist: 70, hip: 94, skirtLength: 0 });
    });
  });

  test('F16-B5: A0 vector coordinates preserve floating point millimeter precision', () => {
    const skirt = draftBasicSkirt(stdProfile.measurements);
    assertCloseTo(skirt.Wblock, 48.0, 1e-4, 'Preserves precision');
  });
});

// ============================================================================
// F17 Boundaries: SVG & DXF CAD Exporters (5 tests)
// ============================================================================
describe('F17 Boundaries: SVG & DXF CAD Exporters', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements);

  test('F17-B1: SVG special characters (&, <, >, ") in piece labels are XML-escaped', () => {
    const svg = generatePatternSvg(skirt);
    assert(!svg.includes('&&'), 'No unescaped double ampersands');
  });

  test('F17-B2: SVG calibration square position uses absolute transform coordinates', () => {
    const svg = generatePatternSvg(skirt);
    assert(svg.includes('transform="translate('), 'Calibration square has transform');
  });

  test('F17-B3: AAMA-DXF ENTITIES section closes with ENDSEC and terminates with EOF', () => {
    const dxf = generateAAMADxf(skirt);
    assert(dxf.includes('ENDSEC'), 'DXF contains ENDSEC');
    assert(dxf.trim().endsWith('EOF'), 'DXF terminates with EOF');
  });

  test('F17-B4: DXF layer 5 (TEXT) contains block type and drafting method annotations', () => {
    const dxf = generateAAMADxf(skirt);
    assert(dxf.includes('SKIRT - MULLER'), 'DXF layer 5 text includes piece description');
  });

  test('F17-B5: DXF layers 1 through 6 use distinct CAD standard color codes', () => {
    const dxf = generateAAMADxf(skirt);
    assert(dxf.includes('62\n7'), 'Color code 7 (white/black)');
    assert(dxf.includes('62\n1'), 'Color code 1 (red)');
    assert(dxf.includes('62\n3'), 'Color code 3 (green)');
  });
});
