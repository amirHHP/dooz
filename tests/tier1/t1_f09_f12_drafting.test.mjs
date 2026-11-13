/**
 * Tier 1 — Core Features F9 through F12: Parametric Pattern Drafting Core Engine
 * 5 tests per feature = 20 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertSeamParity,
  assertThrows,
  draftBasicSkirt,
  draftBasicBodice,
  draftBasicSleeve,
  draftBasicTrouser,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0]; // Sara Mohammadi (Müller Size 38)

// ============================================================================
// F9: Basic Skirt Parametric Engine (5 tests)
// ============================================================================
describe('F9: Basic Skirt Parametric Engine', () => {
  test('F9-1: Müller Skirt computes half-hip block and asymmetric panel division (Wfront = Wback + 2cm)', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER', fitPreference: 'CLASSIC' });
    assertEqual(res.blockType, 'SKIRT');
    // Hip = 94, Eh = 2.0 -> Wblock = 96 / 2 = 48cm
    assertCloseTo(res.Wblock, 48.0, 1e-3, 'Müller Wblock');
    // Front = 24 + 1 = 25cm, Back = 24 - 1 = 23cm
    assertCloseTo(res.Wfront, 25.0, 1e-3, 'Müller Wfront');
    assertCloseTo(res.Wback, 23.0, 1e-3, 'Müller Wback');
    assertCloseTo(res.Wfront - res.Wback, 2.0, 1e-3, 'Front is 2cm wider than Back');
  });

  test('F9-2: Aldrich Metric Skirt splits front and back panels equally at center', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'METRIC', fitPreference: 'CLASSIC' });
    assertCloseTo(res.Wfront, res.Wback, 1e-3, 'Metric panels must be equal width');
    assertCloseTo(res.Wfront, res.Wblock / 2, 1e-3, 'Metric panel width equals Wblock / 2');
  });

  test('F9-3: Grlawein Skirt derives front and back widths using direct quarters plus ease', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'GRLAWEIN', fitPreference: 'CLASSIC' });
    // Hfront = 94/4 + 0.5 + 2/4 = 23.5 + 0.5 + 0.5 = 24.5cm
    assertCloseTo(res.Wfront, 24.5, 1e-3, 'Grlawein Wfront');
    // Hback = 94/4 - 0.5 + 2/4 = 23.5 - 0.5 + 0.5 = 23.5cm
    assertCloseTo(res.Wback, 23.5, 1e-3, 'Grlawein Wback');
  });

  test('F9-4: Waist suppression allocates side, back, and front darts with positive sum matching deltaW', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER', fitPreference: 'CLASSIC' });
    // W = 70, Ew = 1 -> Wtarget = 35.5cm. deltaW = 48 - 35.5 = 12.5cm
    assertCloseTo(res.deltaW, 12.5, 1e-3, 'Total waist suppression deltaW');
    // Müller: Sside = 50%, Dback = 30%, Dfront = 20%
    assertCloseTo(res.Sside, 6.25, 1e-3, 'Side seam suppression (50%)');
    assertCloseTo(res.Dback, 3.75, 1e-3, 'Back dart suppression (30%)');
    assertCloseTo(res.Dfront, 2.50, 1e-3, 'Front dart suppression (20%)');
    assertCloseTo(res.Sside + res.Dback + res.Dfront, res.deltaW, 1e-3, 'Total dart sum equals deltaW');
  });

  test('F9-5: Side seam waist point is raised for natural anatomical pelvic crest drape', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });
    // Raised by 1.2cm = -12mm
    assertCloseTo(res.points.sideWaistBack.y, -12.0, 1e-3, 'Back side waist raised by 12mm');
    assertCloseTo(res.points.sideWaistFront.y, -12.0, 1e-3, 'Front side waist raised by 12mm');
  });
});

// ============================================================================
// F10: Basic Fitted Bodice Engine (5 tests)
// ============================================================================
describe('F10: Basic Fitted Bodice Engine', () => {
  test('F10-1: Müller Bodice calculates armhole depth Da, back width Rb, and armhole diameter Ad proportionally', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'MULLER', fitPreference: 'CLASSIC' });
    assertEqual(res.blockType, 'BODICE');
    // B = 88. Da = 88/10 + 10.5 + 1.0 = 20.3cm
    assertCloseTo(res.Da, 20.3, 1e-2, 'Müller armhole depth Da');
    // Rb = 88/8 + 5.5 + 1.5 = 18.0cm
    assertCloseTo(res.Rb, 18.0, 1e-2, 'Müller back width Rb');
    // Ad = 88/8 - 1.5 + 2.5 = 12.0cm
    assertCloseTo(res.Ad, 12.0, 1e-2, 'Müller armhole diameter Ad');
  });

  test('F10-2: Müller Bodice bust dart width Dbust is derived from proportional chest formula 2*(B/10) - 1.0', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });
    // B = 88 -> 2 * 8.8 - 1.0 = 16.6cm
    assertCloseTo(res.Dbust, 16.6, 1e-2, 'Müller bust dart rotation formula');
  });

  test('F10-3: Aldrich Metric Bodice uses empirical bust dart sizing formula', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'METRIC' });
    // B = 88 -> 7.0 + 0.25 * (88 - 90) = 7.0 - 0.5 = 6.5cm
    assertCloseTo(res.Dbust, 6.5, 1e-2, 'Metric bust dart formula');
  });

  test('F10-4: Grlawein Bodice conformational bust dart equals difference between front length and back length', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'GRLAWEIN' });
    // FL = 43.5, BL = 41.0 -> Dbust = 43.5 - 41.0 = 2.5cm
    assertCloseTo(res.Dbust, 2.5, 1e-2, 'Grlawein conformational dart equals FL - BL');
  });

  test('F10-5: Bodice total armhole perimeter is positive and provides anchor for sleeve drafting', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });
    assert(res.totalArmholePerimeter > 40.0, 'Total armhole perimeter must exceed 40cm');
    assert(res.totalArmholePerimeter < 55.0, 'Total armhole perimeter must be realistic for size 38');
  });
});

// ============================================================================
// F11: Basic Sleeve Parametric Engine (5 tests)
// ============================================================================
describe('F11: Basic Sleeve Parametric Engine', () => {
  const bodiceRes = draftBasicBodice(stdProfile.measurements, { method: 'MULLER', fitPreference: 'CLASSIC' });

  test('F11-1: Müller Sleeve Cap Height is calculated from bodice armhole depth (3/4 * AHd - 0.5)', () => {
    const res = draftBasicSleeve(bodiceRes, stdProfile.measurements);
    assertEqual(res.blockType, 'SLEEVE');
    // AHd = 20.3 -> CapHeight = 0.75 * 20.3 - 0.5 = 15.225 - 0.5 = 14.725cm
    assertCloseTo(res.CapHeight, 14.725, 0.1, 'Müller sleeve cap height');
  });

  test('F11-2: Sleeve bicep width includes designated ease allowance', () => {
    const res = draftBasicSleeve(bodiceRes, stdProfile.measurements);
    // ArmCirc = 27.5, Classic ease = 4.0 -> BW = 31.5cm
    assertCloseTo(res.BW, 31.5, 1e-2, 'Bicep line width with classic ease');
  });

  test('F11-3: Crown apex is slanted toward back panel (xApex ~ 0.52 * BW) for natural arm pitch', () => {
    const res = draftBasicSleeve(bodiceRes, stdProfile.measurements);
    const expectedApexX = 0.52 * res.BW * 10;
    assertCloseTo(res.points.crownApex.x, expectedApexX, 1e-2, 'Apex slanted slightly toward back');
  });

  test('F11-4: Sleeve cap curves evaluate with four distinct continuous cubic Bézier spans', () => {
    const res = draftBasicSleeve(bodiceRes, stdProfile.measurements);
    assert(res.backScoop && res.backCrown && res.frontCrown && res.frontScoop, 'Four cap curves must exist');
    assert(res.backScoop.arcLength() > 0, 'Back scoop arc length must be positive');
    assert(res.frontScoop.arcLength() > 0, 'Front scoop arc length must be positive');
  });

  test('F11-5: Sleeve cap ease satisfies tailoring invariant (1.5cm <= deltaEase <= 3.5cm)', () => {
    const res = draftBasicSleeve(bodiceRes, stdProfile.measurements);
    assert(res.capEaseCm >= 1.5, `Cap ease ${res.capEaseCm.toFixed(2)}cm must be >= 1.5cm`);
    assert(res.capEaseCm <= 3.5, `Cap ease ${res.capEaseCm.toFixed(2)}cm must be <= 3.5cm`);
  });
});

// ============================================================================
// F12: Basic Trouser Parametric Engine (5 tests)
// ============================================================================
describe('F12: Basic Trouser Parametric Engine', () => {
  test('F12-1: Müller Trouser computes front crotch extension as H/20 and back extension as H/10 - 1.0', () => {
    const res = draftBasicTrouser(stdProfile.measurements, { method: 'MULLER' });
    assertEqual(res.blockType, 'TROUSER');
    // H = 94. ExtFront = 94/20 = 4.7cm. ExtBack = 94/10 - 1.0 = 8.4cm
    assertCloseTo(res.ExtFront, 4.7, 1e-2, 'Müller front crotch extension');
    assertCloseTo(res.ExtBack, 8.4, 1e-2, 'Müller back crotch extension');
  });

  test('F12-2: Metric Trouser computes crotch extensions with Aldrich ratio (H/16 and 2*ExtFront + 1.0)', () => {
    const res = draftBasicTrouser(stdProfile.measurements, { method: 'METRIC' });
    // ExtFront = 94/16 = 5.875cm. ExtBack = 2*5.875 + 1.0 = 12.75cm
    assertCloseTo(res.ExtFront, 5.875, 1e-2, 'Metric front crotch extension');
    assertCloseTo(res.ExtBack, 12.75, 1e-2, 'Metric back crotch extension');
  });

  test('F12-3: Crease line (خط اتو / grainline) sits at geometric midpoint of front hip + extension', () => {
    const res = draftBasicTrouser(stdProfile.measurements, { method: 'MULLER' });
    // WfrontHip = (94 + 2)/4 - 1.0 = 23cm. ExtFront = 4.7cm. xCrease = (23 + 4.7)/2 = 13.85cm
    assertCloseTo(res.xCrease, 13.85, 1e-2, 'Crease line center');
  });

  test('F12-4: Knee level is raised 5cm above geometric midpoint of inseam', () => {
    const res = draftBasicTrouser(stdProfile.measurements, { method: 'MULLER' });
    // TL = 102, CD = 26 -> Inseam = 76cm. yKnee = 26 + 76/2 - 5 = 26 + 38 - 5 = 59cm
    assertCloseTo(res.yKnee, 59.0, 1e-2, 'Knee level position');
  });

  test('F12-5: Back inseam is drafted 12mm shorter than front inseam to allow bias-stretch molding', () => {
    const res = draftBasicTrouser(stdProfile.measurements, { method: 'MULLER' });
    assertCloseTo(res.backInseamTarget, res.frontInseamUpper - 12.0, 1e-3, 'Back inseam target is 12mm shorter');
  });
});
