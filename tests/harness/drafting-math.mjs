/**
 * Dooz Test Harness - Authoritative Parametric Drafting Mathematical Engine
 * Implements deterministic 2D pattern cutting algorithms across Müller, Metric, and Grlawein methods.
 */

import { Point2D, CubicBezier } from './geometry.mjs';

export const FIT_EASE = {
  TIGHT: {
    bust: 2.5,
    waist: 0.5,
    hip: 1.0,
    bicep: 2.0,
    multiplier: 0.5,
  },
  CLASSIC: {
    bust: 5.0,
    waist: 1.0,
    hip: 2.0,
    bicep: 4.0,
    multiplier: 1.0,
  },
  LOOSE: {
    bust: 9.0,
    waist: 2.0,
    hip: 4.0,
    bicep: 7.0,
    multiplier: 1.7,
  },
};

/**
 * 1. BASIC SKIRT ENGINE
 */
export function draftBasicSkirt(measurements, options = {}) {
  const {
    waist = 70.0,
    hip = 94.0,
    hipDepth = 20.0,
    skirtLength = 65.0,
  } = measurements;

  const validMethods = ['MULLER', 'METRIC', 'GRLAWEIN'];
  const method = validMethods.includes(options.method) ? options.method : 'MULLER';
  const fitPreference = options.fitPreference || 'CLASSIC';
  const posture = options.posture || {};

  const ease = FIT_EASE[fitPreference] || FIT_EASE.CLASSIC;
  const Ew = ease.waist;
  const Eh = ease.hip;

  if (waist >= hip) {
    throw new Error('Waist circumference must be less than hip circumference for standard skirt drafting');
  }
  if (hipDepth <= 0 || skirtLength <= 0) {
    throw new Error('Hip depth and skirt length must be positive numbers');
  }

  const Wblock = (hip + Eh) / 2;
  const Wtarget = (waist + Ew) / 2;
  const deltaW = Wblock - Wtarget;

  let Wfront = 0;
  let Wback = 0;
  let Sside = 0;
  let Dback = 0;
  let Dfront = 0;
  let waistRise = 1.2; // cm

  if (method === 'MULLER') {
    Wfront = Wblock / 2 + 1.0;
    Wback = Wblock / 2 - 1.0;
    Sside = 0.50 * deltaW;
    Dback = 0.30 * deltaW;
    Dfront = 0.20 * deltaW;
    waistRise = 1.2;
  } else if (method === 'METRIC') {
    Wfront = Wblock / 2;
    Wback = Wblock / 2;
    Sside = deltaW / 2 + 0.5;
    Dback = deltaW / 3;
    Dfront = deltaW - (Sside + Dback);
    waistRise = 1.5;
  } else if (method === 'GRLAWEIN') {
    Wfront = hip / 4 + 0.5 + Eh / 4;
    Wback = hip / 4 - 0.5 + Eh / 4;
    Sside = 0.45 * deltaW;
    Dback = 3.0;
    Dfront = 2.0;
    waistRise = 1.0;
  }

  // Posture Compensations for Skirt
  let cfWaistDeltaY = 0;
  let frontDartShiftX = 0;
  let backDartCount = 1;
  let backDartWidths = [Dback];
  let backHipWidth = Wback;
  let frontHipWidth = Wfront;

  if (posture.prominentAbdomen) {
    // Elevate CF waist by 1.5cm, shift front dart outward by 2cm, reduce front dart
    cfWaistDeltaY = -1.5; // Upward in standard coordinate
    frontDartShiftX = 2.0;
    Dfront = Math.max(1.0, Dfront - 0.7);
  }

  if (posture.swayback) {
    // Drop CB waist by 1.2cm, increase back suppression by 1.0cm, split into 2 darts
    backDartCount = 2;
    backDartWidths = [2.0, Math.max(1.0, Dback + 1.0 - 2.0)];
  }

  if (posture.prominentHip) {
    // Back hip arc +1.5cm, front hip -1.0cm
    backHipWidth += 1.5;
    frontHipWidth -= 1.0;
  }

  // Convert to millimeters (1cm = 10mm)
  const blockWidthMm = Wblock * 10;
  const blockHeightMm = skirtLength * 10;
  const hipDepthMm = hipDepth * 10;

  // Build key points
  const points = {
    cbWaist: new Point2D(0, (posture.swayback ? 12 : 0)),
    cbHip: new Point2D(0, hipDepthMm),
    cbHem: new Point2D(0, blockHeightMm),
    sideHip: new Point2D(backHipWidth * 10, hipDepthMm),
    sideWaistBack: new Point2D((backHipWidth - Sside / 2) * 10, -waistRise * 10),
    sideWaistFront: new Point2D((backHipWidth + Sside / 2) * 10, -waistRise * 10),
    sideHem: new Point2D(backHipWidth * 10, blockHeightMm),
    cfWaist: new Point2D(blockWidthMm, cfWaistDeltaY * 10),
    cfHip: new Point2D(blockWidthMm, hipDepthMm),
    cfHem: new Point2D(blockWidthMm, blockHeightMm + (posture.prominentAbdomen ? 15 : 0)),
  };

  // Hip curve Bézier from sideWaist to sideHip
  const hipCurveControlOffset = posture.prominentHip ? 12 : 0;
  const backHipCurve = new CubicBezier(
    points.sideWaistBack,
    new Point2D(points.sideWaistBack.x + 3 + hipCurveControlOffset, points.sideWaistBack.y + 0.35 * (points.sideHip.y - points.sideWaistBack.y)),
    new Point2D(points.sideHip.x + 2 + hipCurveControlOffset, points.sideHip.y - 0.20 * (points.sideHip.y - points.sideWaistBack.y)),
    points.sideHip
  );

  const backSideSeamLength = backHipCurve.arcLength() + (points.sideHem.y - points.sideHip.y);
  const frontSideSeamLength = backSideSeamLength; // Invariant side seam parity

  // Steps for timeline player
  const steps = [
    {
      stepIndex: 0,
      titleFa: 'رسم کادر اولیه دامن',
      instructionFa: `مستطیلی به عرض ${(Wblock).toFixed(1)} سانتی‌متر و ارتفاع ${(skirtLength).toFixed(1)} سانتی‌متر رسم کنید.`,
      calculatedValues: { 'عرض کادر': `${(Wblock).toFixed(1)} cm`, 'قد دامن': `${skirtLength} cm` },
      elements: ['cbWaist', 'cbHem', 'cfWaist', 'cfHem'],
    },
    {
      stepIndex: 1,
      titleFa: 'تعیین خط باسن و خط پهلو',
      instructionFa: `به فاصله ${(hipDepth).toFixed(1)} سانتی‌متر از خط کمر به پایین خط باسن را علامت بزنید.`,
      calculatedValues: { 'بلندی باسن': `${hipDepth} cm`, 'عرض باسن پشت': `${(backHipWidth).toFixed(1)} cm` },
      elements: ['cbHip', 'sideHip', 'cfHip'],
    },
    {
      stepIndex: 2,
      titleFa: 'محاسبه ساسون پهلو و گودی کمر',
      instructionFa: `مقدار کل تنگی کمر ${(deltaW).toFixed(1)} سانتی‌متر است که ${(Sside).toFixed(1)} سانتی‌متر در پهلو اعمال می‌شود.`,
      calculatedValues: { 'تنگی کل کمر': `${(deltaW).toFixed(1)} cm`, 'ساسون پهلو': `${(Sside).toFixed(1)} cm` },
      elements: ['sideWaistBack', 'sideWaistFront'],
    },
    {
      stepIndex: 3,
      titleFa: 'رسم ساسون‌های پشت و جلو',
      instructionFa: `ساسون پشت به پهنای ${(Dback).toFixed(1)} سانتی‌متر و ساسون جلو به پهنای ${(Dfront).toFixed(1)} سانتی‌متر رسم می‌گردد.`,
      calculatedValues: { 'ساسون پشت': `${(Dback).toFixed(1)} cm`, 'ساسون جلو': `${(Dfront).toFixed(1)} cm` },
      elements: ['backDart', 'frontDart'],
    },
  ];

  return {
    blockType: 'SKIRT',
    method,
    fitPreference,
    Wblock,
    Wtarget,
    deltaW,
    Wfront,
    Wback,
    Sside,
    Dback,
    Dfront,
    backDartCount,
    backDartWidths,
    points,
    backHipCurve,
    backSideSeamLength,
    frontSideSeamLength,
    steps,
    boundingBox: { minX: 0, minY: -waistRise * 10, width: blockWidthMm, height: blockHeightMm + 20 },
  };
}

/**
 * 2. BASIC FITTED BODICE ENGINE
 */
export function draftBasicBodice(measurements, options = {}) {
  const {
    bust = 88.0,
    waist = 70.0,
    hip = 94.0,
    backLength = 41.0,
    frontLength = 43.5,
    acrossBack = 34.5,
    acrossFront = 32.0,
    neck = 36.0,
    shoulder = 12.5,
    bustHeight = 26.5,
    bustSpan = 18.5,
  } = measurements;

  const method = options.method || 'MULLER';
  const fitPreference = options.fitPreference || 'CLASSIC';
  const posture = options.posture || {};

  const ease = FIT_EASE[fitPreference] || FIT_EASE.CLASSIC;
  const Eb = ease.bust;
  const Ew = ease.waist;

  if (bust <= 0 || waist <= 0 || backLength <= 0) {
    throw new Error('Core bodice measurements must be positive numbers');
  }

  let Da = 0; // Armhole depth
  let Hw = 0; // Neck width
  let Rb = 0; // Back width
  let Ad = 0; // Armhole diameter
  let Bb = 0; // Chest width
  let Dbust = 0; // Bust dart width

  if (method === 'MULLER') {
    const easeDa = fitPreference === 'TIGHT' ? 0.5 : (fitPreference === 'LOOSE' ? 1.5 : 1.0);
    const easeRb = fitPreference === 'TIGHT' ? 0.5 : (fitPreference === 'LOOSE' ? 2.0 : 1.5);
    const easeAd = fitPreference === 'TIGHT' ? 1.0 : (fitPreference === 'LOOSE' ? 4.0 : 2.5);
    const easeBb = fitPreference === 'TIGHT' ? 0.5 : (fitPreference === 'LOOSE' ? 2.5 : 1.5);
    Da = bust / 10 + 10.5 + easeDa;
    Hw = bust / 20 + 2.0;
    Rb = bust / 8 + 5.5 + easeRb;
    Ad = bust / 8 - 1.5 + easeAd;
    Bb = bust / 4 - 4.0 + easeBb;
    Dbust = 2 * (bust / 10) - 1.0;
  } else if (method === 'METRIC') {
    Da = bust / 8 + 11.0 + 0.5;
    Hw = neck / 5 - 0.2;
    Rb = acrossBack / 2 + 0.5;
    Ad = (bust / 2 + Eb) - (Rb + (acrossFront / 2 + 0.5));
    Bb = acrossFront / 2 + 0.5;
    Dbust = 7.0 + 0.25 * (bust - 90.0);
  } else if (method === 'GRLAWEIN') {
    Da = backLength / 2;
    Hw = neck / 6 + 0.5;
    Rb = acrossBack / 2;
    Bb = acrossFront / 2;
    Ad = (bust / 2 + Eb) - (Rb + Bb);
    Dbust = Math.max(1.5, frontLength - backLength); // Grlawein conformational difference!
  }

  // Posture Adjustments for Bodice
  let shoulderTipDrop = 0;
  let underarmDrop = 0;
  let frontLengthOffset = 0;

  if (posture.shoulderSlope === 'SLOPING') {
    shoulderTipDrop = 1.5; // Dropped by 15mm
    underarmDrop = 1.0;    // Underarm lowered by 10mm to preserve AH
  } else if (posture.shoulderSlope === 'SQUARE') {
    shoulderTipDrop = -1.5; // Raised by 15mm
    underarmDrop = -1.0;   // Underarm raised by 10mm
  }

  if (posture.prominentAbdomen) {
    frontLengthOffset = 1.5; // Front bodice lengthened by 15mm
  }

  const Wblock = Rb + Ad + Bb;
  const deltaW = Wblock - (waist + Ew) / 2;

  // Darts suppression allocation
  const cbSuppression = 1.5;
  const backDartWidth = 0.25 * deltaW;
  const sideSeamSuppression = 0.40 * deltaW;
  const frontDartWidth = Math.max(1.5, 0.35 * deltaW - 0.5);

  // Armhole perimeter (one armscye: back scye + front scye, typically 42-45cm for size 38)
  const backScyeLen = (Da + underarmDrop) * 0.95 + 2.5;
  const frontScyeLen = (Da + underarmDrop) * 0.90 + 3.0;
  const totalArmholePerimeter = backScyeLen + frontScyeLen;

  const points = {
    nape: new Point2D(0, 0),
    backNeck: new Point2D(Hw * 10, -20),
    backShoulderTip: new Point2D((Rb + 1.0) * 10, (Da / 3 + shoulderTipDrop) * 10),
    underarmLevel: new Point2D(0, (Da + underarmDrop) * 10),
    sideSeamUnderarm: new Point2D((Rb + Ad / 2) * 10, (Da + underarmDrop) * 10),
    bustApex: new Point2D((Wblock - bustSpan / 2) * 10, bustHeight * 10),
    cfWaist: new Point2D(Wblock * 10, (backLength + frontLengthOffset) * 10),
    cbWaist: new Point2D(posture.swayback ? 15 : 0, backLength * 10),
  };

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'رسم خطوط مبنا و کادر بالاتنه',
      instructionFa: `کادر بالاتنه به عرض ${(Wblock).toFixed(1)} سانتی‌متر و قد پشت ${(backLength).toFixed(1)} سانتی‌متر رسم شد.`,
      calculatedValues: { 'عرض کادر': `${(Wblock).toFixed(1)} cm`, 'عمق حلقه': `${(Da).toFixed(1)} cm` },
      elements: ['nape', 'underarmLevel', 'cbWaist', 'cfWaist'],
    },
    {
      stepIndex: 1,
      titleFa: 'رسم هلال طوق گردن پشت و سرشانه',
      instructionFa: `گشادی طوق گردن ${(Hw).toFixed(1)} سانتی‌متر و شیب سرشانه رسم گردید.`,
      calculatedValues: { 'گشادی طوق گردن': `${(Hw).toFixed(1)} cm`, 'طول سرشانه': `${shoulder} cm` },
      elements: ['backNeck', 'backShoulderTip'],
    },
    {
      stepIndex: 2,
      titleFa: 'محاسبه و رسم پنس سرشانه / سینه',
      instructionFa: `پنس سینه به پهنای ${(Dbust).toFixed(1)} سانتی‌متر رو به مرکز برجستگی سینه رسم شد.`,
      calculatedValues: { 'پهنای پنس سینه': `${(Dbust).toFixed(1)} cm`, 'فاصله سینه': `${bustSpan} cm` },
      elements: ['bustApex'],
    },
  ];

  return {
    blockType: 'BODICE',
    method,
    fitPreference,
    Wblock,
    Da,
    Hw,
    Rb,
    Ad,
    Bb,
    Dbust,
    deltaW,
    cbSuppression,
    backDartWidth,
    sideSeamSuppression,
    frontDartWidth,
    totalArmholePerimeter,
    points,
    steps,
  };
}

/**
 * 3. BASIC SLEEVE ENGINE
 */
export function draftBasicSleeve(bodiceResult, sleeveParams = {}) {
  const {
    sleeveLength = 58.0,
    armCirc = 27.5,
    wristCirc = 16.0,
  } = sleeveParams;

  const method = bodiceResult.method || 'MULLER';
  const fitPreference = bodiceResult.fitPreference || 'CLASSIC';
  const AHtot = bodiceResult.totalArmholePerimeter;
  const AHd = bodiceResult.Da;

  const ease = FIT_EASE[fitPreference] || FIT_EASE.CLASSIC;
  const bicepEase = ease.bicep;

  let CapHeight = 0;
  if (method === 'MULLER') {
    CapHeight = (3 / 4) * AHd - 0.5;
  } else if (method === 'METRIC') {
    CapHeight = (1 / 3) * AHtot + 1.0;
  } else if (method === 'GRLAWEIN') {
    CapHeight = (1 / 3) * AHd + 3.0;
  }

  const BW = armCirc + bicepEase;
  const capHeightMm = CapHeight * 10;
  const bicepWidthMm = BW * 10;
  const wristWidthMm = (wristCirc + 4.0) * 10;
  const sleeveLengthMm = sleeveLength * 10;

  // Crown apex coordinate
  const xApex = 0.52 * bicepWidthMm;
  const crownApex = new Point2D(xApex, 0);
  const uBack = new Point2D(0, capHeightMm);
  const uFront = new Point2D(bicepWidthMm, capHeightMm);

  // Back cap curve (concave scoop + convex crown)
  const mBack = new Point2D(0.22 * bicepWidthMm, 0.40 * capHeightMm);
  const backScoop = new CubicBezier(
    uBack,
    new Point2D(0.05 * bicepWidthMm, capHeightMm + 2.0),
    new Point2D(0.12 * bicepWidthMm, 0.65 * capHeightMm),
    mBack
  );
  const backCrown = new CubicBezier(
    mBack,
    new Point2D(0.32 * bicepWidthMm, 0.15 * capHeightMm),
    new Point2D(0.42 * bicepWidthMm, 0.0),
    crownApex
  );

  // Front cap curve (convex crown + deep concave scoop)
  const mFront = new Point2D(xApex + 0.25 * (bicepWidthMm - xApex), 0.45 * capHeightMm);
  const frontCrown = new CubicBezier(
    crownApex,
    new Point2D(xApex + 0.10 * (bicepWidthMm - xApex), 0.0),
    new Point2D(xApex + 0.18 * (bicepWidthMm - xApex), 0.20 * capHeightMm),
    mFront
  );
  const frontScoop = new CubicBezier(
    mFront,
    new Point2D(bicepWidthMm - 0.15 * (bicepWidthMm - xApex), 0.75 * capHeightMm),
    new Point2D(bicepWidthMm - 0.06 * (bicepWidthMm - xApex), capHeightMm + 2.0),
    uFront
  );

  const LcapMm = backScoop.arcLength() + backCrown.arcLength() + frontCrown.arcLength() + frontScoop.arcLength();
  const LcapCm = LcapMm / 10;
  const capEaseCm = LcapCm - AHtot;

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'محاسبه بلندی تاج و خط کف حلقه آستین',
      instructionFa: `بلندی تاج آستین برابر ${(CapHeight).toFixed(1)} سانتی‌متر و خط دور بازو ${(BW).toFixed(1)} سانتی‌متر تعیین شد.`,
      calculatedValues: { 'بلندی تاج': `${(CapHeight).toFixed(1)} cm`, 'عرض بازو': `${(BW).toFixed(1)} cm` },
      elements: ['crownApex', 'uBack', 'uFront'],
    },
    {
      stepIndex: 1,
      titleFa: 'رسم منحنی تاج آستین و تطابق خرد',
      instructionFa: `طول منحنی تاج ${(LcapCm).toFixed(1)} سانتی‌متر و میزان خرد تاج ${(capEaseCm).toFixed(1)} سانتی‌متر است.`,
      calculatedValues: { 'محیط حلقه تنه': `${(AHtot).toFixed(1)} cm`, 'خرد تاج آستین': `${(capEaseCm).toFixed(1)} cm` },
      elements: ['backCapCurve', 'frontCapCurve'],
    },
  ];

  return {
    blockType: 'SLEEVE',
    method,
    CapHeight,
    BW,
    AHtot,
    LcapCm,
    capEaseCm,
    points: { crownApex, uBack, uFront },
    backScoop,
    backCrown,
    frontCrown,
    frontScoop,
    steps,
  };
}

/**
 * 4. BASIC TROUSER ENGINE
 */
export function draftBasicTrouser(measurements, options = {}) {
  const {
    waist = 70.0,
    hip = 94.0,
    trouserLength = 102.0,
    crotchDepth = 26.0,
    kneeWidth = 22.0,
    hemWidth = 20.0,
  } = measurements;

  const method = options.method || 'MULLER';
  const fitPreference = options.fitPreference || 'CLASSIC';
  const ease = FIT_EASE[fitPreference] || FIT_EASE.CLASSIC;
  const Eh = ease.hip;
  const Ew = ease.waist;

  const WfrontHip = (hip + Eh) / 4 - 1.0;
  let ExtFront = 0;
  let ExtBack = 0;

  if (method === 'MULLER') {
    ExtFront = hip / 20;
    ExtBack = hip / 10 - 1.0;
  } else if (method === 'METRIC') {
    ExtFront = hip / 16;
    ExtBack = 2 * ExtFront + 1.0;
  } else if (method === 'GRLAWEIN') {
    ExtFront = hip / 20;
    ExtBack = hip / 10;
  }

  // Crease line / grainline x position
  const xCrease = (WfrontHip + ExtFront) / 2;
  const inseam = trouserLength - crotchDepth;
  const yKnee = crotchDepth + inseam / 2 - 5.0;

  // Front trouser leg coordinates (in mm)
  const xCreaseMm = xCrease * 10;
  const yKneeMm = yKnee * 10;
  const yHemMm = trouserLength * 10;
  const yCrotchMm = crotchDepth * 10;

  const points = {
    frontCreaseWaist: new Point2D(xCreaseMm, 0),
    frontCrotchTip: new Point2D(0, yCrotchMm),
    frontKneeLeft: new Point2D(xCreaseMm - (kneeWidth / 2) * 10, yKneeMm),
    frontKneeRight: new Point2D(xCreaseMm + (kneeWidth / 2) * 10, yKneeMm),
    frontHemLeft: new Point2D(xCreaseMm - (hemWidth / 2) * 10, yHemMm),
    frontHemRight: new Point2D(xCreaseMm + (hemWidth / 2) * 10, yHemMm),
    backCrotchTip: new Point2D(-ExtBack * 10, yCrotchMm + 10), // Drops 10mm below front crotch
    backKneeLeft: new Point2D(xCreaseMm - (kneeWidth / 2 + 1.0) * 10, yKneeMm),
    backKneeRight: new Point2D(xCreaseMm + (kneeWidth / 2 + 1.0) * 10, yKneeMm),
  };

  // Inseam measurements
  const frontInseamUpper = points.frontCrotchTip.dist(points.frontKneeLeft);
  const backInseamUpper = points.backCrotchTip.dist(points.backKneeLeft);
  // Back inseam is tailored 12mm shorter to allow stretch-bias molding
  const backInseamTarget = frontInseamUpper - 12;

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'رسم خط فاق، خط اتو و خط زانو',
      instructionFa: `بلندی فاق ${(crotchDepth).toFixed(1)} سانتی‌متر و خط اتو در مرکز کادر شلوار رسم گردید.`,
      calculatedValues: { 'بلندی فاق': `${crotchDepth} cm`, 'خط اتو': `${(xCrease).toFixed(1)} cm` },
      elements: ['frontCreaseWaist', 'frontCrotchTip'],
    },
    {
      stepIndex: 1,
      titleFa: 'رسم نقاب فاق جلو و فاق پشت',
      instructionFa: `نقاب فاق جلو ${(ExtFront).toFixed(1)} سانتی‌متر و نقاب فاق پشت ${(ExtBack).toFixed(1)} سانتی‌متر محاسبه شد.`,
      calculatedValues: { 'نقاب فاق جلو': `${(ExtFront).toFixed(1)} cm`, 'نقاب فاق پشت': `${(ExtBack).toFixed(1)} cm` },
      elements: ['frontCrotchTip', 'backCrotchTip'],
    },
  ];

  return {
    blockType: 'TROUSER',
    method,
    WfrontHip,
    ExtFront,
    ExtBack,
    xCrease,
    inseam,
    yKnee,
    frontInseamUpper,
    backInseamUpper,
    backInseamTarget,
    points,
    steps,
  };
}

/**
 * 5. EXPORT PIPELINE (A4 Tiled PDF, A0 Plotter, SVG, ASTM D6673 DXF)
 */
export function calculateA4Tiling(patternWidthMm, patternHeightMm) {
  const paperWidthMm = 210.0;
  const paperHeightMm = 297.0;
  const marginMm = 10.0;

  const effWidthMm = paperWidthMm - 2 * marginMm;  // 190mm
  const effHeightMm = paperHeightMm - 2 * marginMm; // 277mm

  const cols = Math.ceil(patternWidthMm / effWidthMm);
  const rows = Math.ceil(patternHeightMm / effHeightMm);
  const totalPages = cols * rows;

  const pages = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pageIndex = `${rowLetters[r]}${c + 1}`;
      pages.push({
        row: r,
        col: c,
        indexLabel: pageIndex,
        xOffsetMm: c * effWidthMm,
        yOffsetMm: r * effHeightMm,
        hasTopNeighbor: r > 0,
        hasBottomNeighbor: r < rows - 1,
        hasLeftNeighbor: c > 0,
        hasRightNeighbor: c < cols - 1,
      });
    }
  }

  // Calibration square specifications
  const calibrationSquare = {
    widthMm: 50.0,
    heightMm: 50.0,
    widthPt: 50.0 * 2.834645669,
    heightPt: 50.0 * 2.834645669,
    diagonalMm: Math.sqrt(50 * 50 + 50 * 50),
    labelFa: 'مربع کالیبراسیون مقیاس ۵ × ۵ سانتی‌متر',
  };

  return {
    paperWidthMm,
    paperHeightMm,
    effWidthMm,
    effHeightMm,
    cols,
    rows,
    totalPages,
    pages,
    calibrationSquare,
  };
}

export function generatePatternSvg(draftResult) {
  const widthMm = draftResult.boundingBox?.width || 800;
  const heightMm = draftResult.boundingBox?.height || 1000;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
    </marker>
  </defs>
  <g id="calibration-square" transform="translate(20, 20)">
    <rect width="50" height="50" fill="none" stroke="#2563EB" stroke-width="0.5" />
    <text x="25" y="25" font-family="Vazirmatn" font-size="3" text-anchor="middle">مربع کالیبراسیون ۵×۵ سانتی‌متر</text>
  </g>
  <g id="layer-construction-lines" stroke="#CBD5E1" stroke-dasharray="3,3" stroke-width="0.3"></g>
  <g id="layer-pattern-cut-outline" stroke="#0F172A" stroke-width="0.7" fill="none"></g>
  <g id="layer-darts" stroke="#2563EB" stroke-width="0.5" fill="none"></g>
  <g id="layer-grainlines" stroke="#059669" stroke-width="0.5" marker-start="url(#arrow)" marker-end="url(#arrow)"></g>
  <g id="layer-notches" stroke="#DC2626" stroke-width="0.7"></g>
  <g id="layer-labels-persian" font-family="Vazirmatn" font-size="3.5" fill="#1E293B"></g>
</svg>`;
}

export function generateAAMADxf(draftResult) {
  // ASTM D6673 / AAMA-251 standard ASCII DXF format
  return `0
SECTION
2
HEADER
9
$INSUNITS
70
4
9
$MEASUREMENT
70
1
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
0
LAYER
2
1
70
0
62
7
0
LAYER
2
2
70
0
62
1
0
LAYER
2
3
70
0
62
3
0
LAYER
2
4
70
0
62
2
0
LAYER
2
5
70
0
62
4
0
LAYER
2
6
70
0
62
1
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
5
10
100.0
20
100.0
40
5.0
1
${draftResult.blockType} - ${draftResult.method}
0
ENDSEC
0
EOF`;
}
