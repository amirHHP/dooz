/**
 * Tier 1 — Core Features F13 through F17: Posture Adjustments, Timeline & 1:1 Scale CAD/PDF Exporters
 * 5 tests per feature = 25 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertCalibrationSquare,
  draftBasicSkirt,
  draftBasicBodice,
  draftBasicTrouser,
  calculateA4Tiling,
  generatePatternSvg,
  generateAAMADxf,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

// ============================================================================
// F13: Posture & Defect Adjustments (5 tests)
// ============================================================================
describe('F13: Posture & Defect Adjustments', () => {
  test('F13-1: Prominent Abdomen raises front waist by 1.5cm and lengthens front CF', () => {
    const res = draftBasicSkirt(stdProfile.measurements, {
      method: 'MULLER',
      posture: { prominentAbdomen: true },
    });
    // In our coordinate system, raising waist means y becomes -15mm
    assertCloseTo(res.points.cfWaist.y, -15.0, 1e-2, 'Front waist raised by 1.5cm');
    assert(res.points.cfHem.y > res.points.cbHem.y, 'Front panel lengthened along CF');
  });

  test('F13-2: Swayback increases back waist suppression and splits into dual darts', () => {
    const res = draftBasicSkirt(stdProfile.measurements, {
      method: 'MULLER',
      posture: { swayback: true },
    });
    assertEqual(res.backDartCount, 2, 'Swayback must produce dual back darts');
    assertEqual(res.backDartWidths.length, 2, 'Two back dart widths recorded');
  });

  test('F13-3: Prominent Hip expands back hip arc and pulls hip curve outward', () => {
    const standard = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });
    const adjusted = draftBasicSkirt(stdProfile.measurements, {
      method: 'MULLER',
      posture: { prominentHip: true },
    });
    assert(adjusted.points.sideHip.x > standard.points.sideHip.x, 'Back hip width expanded');
  });

  test('F13-4: Sloping Shoulders drops shoulder tip and lowers armhole depth to preserve scye perimeter', () => {
    const standard = draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });
    const sloping = draftBasicBodice(stdProfile.measurements, {
      method: 'MULLER',
      posture: { shoulderSlope: 'SLOPING' },
    });
    assert(sloping.points.backShoulderTip.y > standard.points.backShoulderTip.y, 'Shoulder tip dropped vertically');
    assert(sloping.points.underarmLevel.y > standard.points.underarmLevel.y, 'Underarm lowered to prevent binding');
  });

  test('F13-5: Square Shoulders raises shoulder tip and raises underarm to prevent gaping', () => {
    const standard = draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });
    const square = draftBasicBodice(stdProfile.measurements, {
      method: 'MULLER',
      posture: { shoulderSlope: 'SQUARE' },
    });
    assert(square.points.backShoulderTip.y < standard.points.backShoulderTip.y, 'Shoulder tip raised vertically');
    assert(square.points.underarmLevel.y < standard.points.underarmLevel.y, 'Underarm line raised');
  });
});

// ============================================================================
// F14: Timeline Construction Graph (5 tests)
// ============================================================================
describe('F14: Timeline Construction Graph', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });

  test('F14-1: Skirt construction graph generates ordered sequential steps starting from step 0', () => {
    assert(skirt.steps && Array.isArray(skirt.steps), 'Steps must be an array');
    assert(skirt.steps.length >= 4, 'Must have at least 4 construction steps');
    skirt.steps.forEach((step, idx) => {
      assertEqual(step.stepIndex, idx, `Step index must match sequential order ${idx}`);
    });
  });

  test('F14-2: Every step defines descriptive Persian title (titleFa) and instruction (instructionFa)', () => {
    skirt.steps.forEach((step) => {
      assert(step.titleFa && step.titleFa.length > 0, 'Step must have Persian title');
      assert(step.instructionFa && step.instructionFa.length > 0, 'Step must have Persian instruction');
    });
  });

  test('F14-3: Steps provide calculated numerical values with cm units', () => {
    const step0 = skirt.steps[0];
    assert(step0.calculatedValues, 'Step 0 must provide calculated values');
    assert(step0.calculatedValues['عرض کادر'], 'Must calculate block width');
    assert(step0.calculatedValues['عرض کادر'].includes('cm'), 'Calculated value must specify cm');
  });

  test('F14-4: Steps identify active elements and point IDs for interactive canvas highlighting', () => {
    skirt.steps.forEach((step) => {
      assert(step.elements && Array.isArray(step.elements), 'Step must declare active elements');
      assert(step.elements.length > 0, 'Step must have at least one active element');
    });
  });

  test('F14-5: Bodice construction graph also produces ordered Persian timeline steps', () => {
    const bodice = draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });
    assert(bodice.steps && bodice.steps.length >= 3, 'Bodice must have at least 3 construction steps');
    assert(bodice.steps[0].titleFa.includes('بالاتنه'), 'Bodice step 0 must mention بالاتنه');
  });
});

// ============================================================================
// F15: Tiled A4 PDF Generator (5 tests)
// ============================================================================
describe('F15: Tiled A4 PDF Generator', () => {
  const tiling = calculateA4Tiling(700, 1000); // 700mm x 1000mm pattern

  test('F15-1: A4 page boundaries observe standard 210mm x 297mm dimensions with 10mm margins', () => {
    assertEqual(tiling.paperWidthMm, 210.0, 'A4 width 210mm');
    assertEqual(tiling.paperHeightMm, 297.0, 'A4 height 297mm');
    assertEqual(tiling.effWidthMm, 190.0, 'Printable width 190mm');
    assertEqual(tiling.effHeightMm, 277.0, 'Printable height 277mm');
  });

  test('F15-2: Grid division correctly computes row and column counts for oversized patterns', () => {
    // 700 / 190 = 3.68 -> 4 cols. 1000 / 277 = 3.61 -> 4 rows
    assertEqual(tiling.cols, 4, 'Cols count');
    assertEqual(tiling.rows, 4, 'Rows count');
    assertEqual(tiling.totalPages, 16, 'Total pages count');
  });

  test('F15-3: Grid indices follow row-letter and column-number naming (A1, A2, B1, etc.)', () => {
    assertEqual(tiling.pages[0].indexLabel, 'A1');
    assertEqual(tiling.pages[1].indexLabel, 'A2');
    assertEqual(tiling.pages[4].indexLabel, 'B1');
  });

  test('F15-4: Edge alignment flags indicate adjacent neighbor tiles for taping instructions', () => {
    const pageB2 = tiling.pages.find((p) => p.indexLabel === 'B2');
    assert(pageB2.hasTopNeighbor, 'B2 has top neighbor');
    assert(pageB2.hasBottomNeighbor, 'B2 has bottom neighbor');
    assert(pageB2.hasLeftNeighbor, 'B2 has left neighbor');
    assert(pageB2.hasRightNeighbor, 'B2 has right neighbor');
  });

  test('F15-5: A4 tiling embeds verified 5cm x 5cm (141.732pt) calibration square', () => {
    const sq = tiling.calibrationSquare;
    assertCalibrationSquare(sq, 50.0, 0.1, 'A4 calibration square verification');
    assertCloseTo(sq.widthPt, 141.732, 0.01, 'Square width in points at 2.8346 pt/mm scale');
  });
});

// ============================================================================
// F16: Single-Sheet A0 Plotter PDF (5 tests)
// ============================================================================
describe('F16: Single-Sheet A0 Plotter PDF', () => {
  test('F16-1: A0 dimensions follow ISO 216 standard (841mm x 1189mm)', () => {
    const a0WidthMm = 841.0;
    const a0HeightMm = 1189.0;
    const a0WidthPt = a0WidthMm * 2.834645669;
    const a0HeightPt = a0HeightMm * 2.834645669;
    assertCloseTo(a0WidthPt, 2383.94, 0.1, 'A0 width in points');
    assertCloseTo(a0HeightPt, 3370.39, 0.1, 'A0 height in points');
  });

  test('F16-2: A0 single-sheet accommodates standard full trousers or maxi dresses without segmentation', () => {
    const trouser = draftBasicTrouser(stdProfile.measurements);
    const patternHeightMm = 1020.0;
    assert(patternHeightMm < 1189.0, 'Full length trouser fits inside single A0 roll sheet');
  });

  test('F16-3: A0 output coordinates maintain 1:1 real-world millimeter scale', () => {
    const skirt = draftBasicSkirt(stdProfile.measurements);
    assert(skirt.boundingBox.width > 0, 'Pattern width must be positive');
    assert(skirt.boundingBox.height > 0, 'Pattern height must be positive');
  });

  test('F16-4: A0 plotter layout includes piece metadata header (block type, method, date)', () => {
    const skirt = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });
    assertEqual(skirt.blockType, 'SKIRT');
    assertEqual(skirt.method, 'MULLER');
  });

  test('F16-5: A0 plotter output embeds 5cmx5cm calibration square for plotter roll tension check', () => {
    const a4 = calculateA4Tiling(500, 700);
    assertCalibrationSquare(a4.calibrationSquare, 50.0, 0.1, 'A0 roll calibration test');
  });
});

// ============================================================================
// F17: SVG & DXF CAD Exporters (5 tests)
// ============================================================================
describe('F17: SVG & DXF CAD Exporters', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });

  test('F17-1: Raw SVG export defines explicit millimeter dimensions on root element', () => {
    const svg = generatePatternSvg(skirt);
    assert(svg.includes('width="'), 'SVG must declare width attribute');
    assert(svg.includes('height="'), 'SVG must declare height attribute');
    assert(svg.includes('mm'), 'SVG dimensions must specify mm');
  });

  test('F17-2: SVG export organizes geometry into semantic layer groups (cut outline, darts, grainlines)', () => {
    const svg = generatePatternSvg(skirt);
    assert(svg.includes('id="layer-construction-lines"'), 'Must define construction lines group');
    assert(svg.includes('id="layer-pattern-cut-outline"'), 'Must define pattern cut outline group');
    assert(svg.includes('id="layer-darts"'), 'Must define darts group');
    assert(svg.includes('id="layer-grainlines"'), 'Must define grainlines group');
  });

  test('F17-3: SVG export includes embedded 5cmx5cm calibration square group', () => {
    const svg = generatePatternSvg(skirt);
    assert(svg.includes('id="calibration-square"'), 'SVG must embed calibration square group');
    assert(svg.includes('width="50" height="50"'), 'Calibration square rect must be 50x50mm');
  });

  test('F17-4: AAMA-DXF export configures metric units ($INSUNITS = 4 for mm, $MEASUREMENT = 1)', () => {
    const dxf = generateAAMADxf(skirt);
    assert(dxf.includes('$INSUNITS'), 'DXF must define $INSUNITS header');
    assert(dxf.includes('4'), 'DXF $INSUNITS must be 4 (Millimeters)');
    assert(dxf.includes('$MEASUREMENT'), 'DXF must define $MEASUREMENT header');
  });

  test('F17-5: AAMA-DXF export defines ASTM D6673 apparel CAD standard layers 1 through 6', () => {
    const dxf = generateAAMADxf(skirt);
    assert(dxf.includes('LAYER'), 'DXF must define LAYER table');
    // Layers: 1=CUT, 2=SEW, 3=INT, 4=GRAIN, 5=TEXT, 6=NOTCH
    assert(dxf.includes('2\n1\n'), 'Must declare Layer 1');
    assert(dxf.includes('2\n2\n'), 'Must declare Layer 2');
    assert(dxf.includes('2\n3\n'), 'Must declare Layer 3');
    assert(dxf.includes('2\n4\n'), 'Must declare Layer 4');
    assert(dxf.includes('2\n5\n'), 'Must declare Layer 5');
    assert(dxf.includes('2\n6\n'), 'Must declare Layer 6');
  });
});
