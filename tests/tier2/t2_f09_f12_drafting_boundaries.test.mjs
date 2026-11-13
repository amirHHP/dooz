/**
 * Tier 2 — Boundary & Corner Tests for Features F9 through F12: Parametric Pattern Drafting Core Engine
 * 5 tests per feature = 20 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertThrows,
  draftBasicSkirt,
  draftBasicBodice,
  draftBasicSleeve,
  draftBasicTrouser,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

// ============================================================================
// F9 Boundaries: Basic Skirt Parametric Engine (5 tests)
// ============================================================================
describe('F9 Boundaries: Basic Skirt Parametric Engine', () => {
  test('F9-B1: Inverted waist-to-hip ratio (waist >= hip) throws validation error', () => {
    assertThrows(() => {
      draftBasicSkirt({ waist: 95.0, hip: 90.0 });
    }, /Waist circumference must be less than hip/);
  });

  test('F9-B2: Equal waist and hip (waist === hip) throws validation error', () => {
    assertThrows(() => {
      draftBasicSkirt({ waist: 90.0, hip: 90.0 });
    }, /Waist circumference must be less than hip/);
  });

  test('F9-B3: Non-positive hip depth or skirt length throws error', () => {
    assertThrows(() => {
      draftBasicSkirt({ waist: 70.0, hip: 94.0, hipDepth: 0 });
    }, /positive numbers/);
    assertThrows(() => {
      draftBasicSkirt({ waist: 70.0, hip: 94.0, skirtLength: -10 });
    }, /positive numbers/);
  });

  test('F9-B4: Maxi skirt length (110cm) drafts full length without distortion', () => {
    const res = draftBasicSkirt({ ...stdProfile.measurements, skirtLength: 110.0 });
    assertEqual(res.boundingBox.height >= 1100, true, 'Height accommodates 110cm maxi skirt');
  });

  test('F9-B5: Tight fit preference reduces waist and hip ease to 0.5cm and 1.0cm', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { fitPreference: 'TIGHT' });
    // Hip = 94, Eh = 1.0 -> Wblock = 95 / 2 = 47.5cm
    assertCloseTo(res.Wblock, 47.5, 1e-2, 'Tight fit Wblock');
  });
});

// ============================================================================
// F10 Boundaries: Basic Fitted Bodice Engine (5 tests)
// ============================================================================
describe('F10 Boundaries: Basic Fitted Bodice Engine', () => {
  test('F10-B1: Zero or negative bust circumference throws error', () => {
    assertThrows(() => {
      draftBasicBodice({ bust: 0, waist: 70, backLength: 41 });
    }, /positive numbers/);
  });

  test('F10-B2: Extreme bust-to-waist difference (B - W = 40cm) expands bust dart width significantly', () => {
    const res = draftBasicBodice({
      ...stdProfile.measurements,
      bust: 110.0,
      waist: 70.0,
    }, { method: 'MULLER' });
    // B = 110 -> Dbust = 2 * (110/10) - 1.0 = 21.0cm
    assertCloseTo(res.Dbust, 21.0, 1e-2, 'Expanded bust dart width');
  });

  test('F10-B3: Athletic flat chest build (B ≈ W) maintains minimal positive bust dart', () => {
    const res = draftBasicBodice({
      ...stdProfile.measurements,
      bust: 80.0,
      waist: 76.0,
    }, { method: 'GRLAWEIN', frontLength: 42.0, backLength: 41.0 });
    assert(res.Dbust >= 1.0, 'Maintains minimal positive dart');
  });

  test('F10-B4: High armhole depth in loose fit (loose ease 9.0cm) expands armhole diameter', () => {
    const res = draftBasicBodice(stdProfile.measurements, { method: 'MULLER', fitPreference: 'LOOSE' });
    assert(res.Ad > 12.0, 'Loose fit increases armhole diameter');
  });

  test('F10-B5: Total armhole perimeter scales monotonically with bust circumference', () => {
    const resSmall = draftBasicBodice({ ...stdProfile.measurements, bust: 80.0 });
    const resLarge = draftBasicBodice({ ...stdProfile.measurements, bust: 104.0 });
    assert(resLarge.totalArmholePerimeter > resSmall.totalArmholePerimeter, 'Larger bust has larger armhole');
  });
});

// ============================================================================
// F11 Boundaries: Basic Sleeve Parametric Engine (5 tests)
// ============================================================================
describe('F11 Boundaries: Basic Sleeve Parametric Engine', () => {
  const bodice = draftBasicBodice(stdProfile.measurements);

  test('F11-B1: Muscular athletic bicep (38cm) drafts wider sleeve width BW', () => {
    const res = draftBasicSleeve(bodice, { ...stdProfile.measurements, armCirc: 38.0 });
    // BW = 38.0 + 4.0 = 42.0cm
    assertCloseTo(res.BW, 42.0, 1e-2, 'Expanded bicep width');
  });

  test('F11-B2: Slender arm (22cm) maintains positive sleeve cap curvature', () => {
    const res = draftBasicSleeve(bodice, { ...stdProfile.measurements, armCirc: 22.0 });
    assert(res.backCrown.arcLength() > 0, 'Back crown curve remains valid');
    assert(res.frontCrown.arcLength() > 0, 'Front crown curve remains valid');
  });

  test('F11-B3: Short sleeve length (20cm) preserves crown cap height intact', () => {
    const resStandard = draftBasicSleeve(bodice, { sleeveLength: 58.0 });
    const resShort = draftBasicSleeve(bodice, { sleeveLength: 20.0 });
    assertCloseTo(resShort.CapHeight, resStandard.CapHeight, 1e-2, 'Cap height independent of sleeve length');
  });

  test('F11-B4: Tight sleeve fit reduces bicep ease to 2.0cm', () => {
    const tightBodice = draftBasicBodice(stdProfile.measurements, { fitPreference: 'TIGHT' });
    const res = draftBasicSleeve(tightBodice, stdProfile.measurements);
    // ArmCirc = 27.5, tight ease = 2.0 -> BW = 29.5cm
    assertCloseTo(res.BW, 29.5, 1e-2, 'Tight bicep ease');
  });

  test('F11-B5: Loose sleeve fit expands bicep ease to 7.0cm', () => {
    const looseBodice = draftBasicBodice(stdProfile.measurements, { fitPreference: 'LOOSE' });
    const res = draftBasicSleeve(looseBodice, stdProfile.measurements);
    // ArmCirc = 27.5, loose ease = 7.0 -> BW = 34.5cm
    assertCloseTo(res.BW, 34.5, 1e-2, 'Loose bicep ease');
  });
});

// ============================================================================
// F12 Boundaries: Basic Trouser Parametric Engine (5 tests)
// ============================================================================
describe('F12 Boundaries: Basic Trouser Parametric Engine', () => {
  test('F12-B1: Low crotch depth (high waist rise CD = 32cm) places knee line correctly', () => {
    const res = draftBasicTrouser({ ...stdProfile.measurements, crotchDepth: 32.0 });
    assert(res.yKnee > res.points.frontCrotchTip.y / 10, 'Knee sits below crotch level');
  });

  test('F12-B2: Short crotch depth (petite CD = 22cm) maintains positive inseam length', () => {
    const res = draftBasicTrouser({ ...stdProfile.measurements, crotchDepth: 22.0 });
    assert(res.inseam > 70.0, 'Inseam length remains positive and wearable');
  });

  test('F12-B3: Extra wide hips (120cm) proportionally expands both front and back crotch extensions', () => {
    const res = draftBasicTrouser({ ...stdProfile.measurements, hip: 120.0 });
    // ExtFront = 120 / 20 = 6.0cm
    assertCloseTo(res.ExtFront, 6.0, 1e-2, 'Expanded front crotch extension');
    // ExtBack = 120 / 10 - 1.0 = 11.0cm
    assertCloseTo(res.ExtBack, 11.0, 1e-2, 'Expanded back crotch extension');
  });

  test('F12-B4: Wide-leg flare (kneeWidth 28cm, hemWidth 30cm) maintains leg symmetry', () => {
    const res = draftBasicTrouser({ ...stdProfile.measurements, kneeWidth: 28.0, hemWidth: 30.0 });
    const distLeft = res.points.frontCreaseWaist.x - res.points.frontHemLeft.x;
    const distRight = res.points.frontHemRight.x - res.points.frontCreaseWaist.x;
    assertCloseTo(distLeft, distRight, 1e-2, 'Hem remains perfectly balanced around crease line');
  });

  test('F12-B5: Skinny tapered hem (hemWidth 16cm) keeps hem narrower than knee width', () => {
    const res = draftBasicTrouser({ ...stdProfile.measurements, kneeWidth: 22.0, hemWidth: 16.0 });
    assert(res.points.frontHemRight.x < res.points.frontKneeRight.x, 'Hem tapered narrower than knee');
  });
});
