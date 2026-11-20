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

  // Darts geometry
  const dartTipYBack = hipDepthMm - 40;
  const dartTipYFront = Math.min(hipDepthMm - 60, 100);
  const frontDartCenterX = (backHipWidth * 10) + ((blockWidthMm - backHipWidth * 10) * 0.5) + frontDartShiftX * 10;
  const frontDartHalfWidth = (Dfront * 10) / 2;

  let backDartElements = [];
  let backWaistPathPart = '';

  if (backDartCount === 2) {
    const w1 = backDartWidths[0] * 10;
    const x1 = (backHipWidth * 10) * 0.35;
    const y1 = hipDepthMm - 30;
    const w2 = backDartWidths[1] * 10;
    const x2 = (backHipWidth * 10) * 0.68;
    const y2 = hipDepthMm - 60;

    backDartElements = [
      [new Point2D(x1 - w1 / 2, 0), new Point2D(x1, y1), new Point2D(x1 + w1 / 2, 0)],
      [new Point2D(x2 - w2 / 2, 0), new Point2D(x2, y2), new Point2D(x2 + w2 / 2, 0)],
    ];

    backWaistPathPart = `L ${(x2 + w2 / 2).toFixed(1)} 0 L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - w2 / 2).toFixed(1)} 0 ` +
      `L ${(x1 + w1 / 2).toFixed(1)} 0 L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${(x1 - w1 / 2).toFixed(1)} 0 `;
  } else {
    const w1 = backDartWidths[0] * 10;
    const x1 = (backHipWidth * 10) * 0.48;
    const y1 = dartTipYBack;

    backDartElements = [
      [new Point2D(x1 - w1 / 2, 0), new Point2D(x1, y1), new Point2D(x1 + w1 / 2, 0)],
    ];

    backWaistPathPart = `L ${(x1 + w1 / 2).toFixed(1)} 0 L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${(x1 - w1 / 2).toFixed(1)} 0 `;
  }

  const frontDartElements = [
    new Point2D(frontDartCenterX - frontDartHalfWidth, cfWaistDeltaY * 10),
    new Point2D(frontDartCenterX, dartTipYFront),
    new Point2D(frontDartCenterX + frontDartHalfWidth, cfWaistDeltaY * 10),
  ];

  // Construction lines
  const constructionLines = [
    { from: new Point2D(0, 0), to: new Point2D(blockWidthMm, 0), label: 'خط کمر کادر اولیه', type: 'frame' },
    { from: new Point2D(0, blockHeightMm), to: new Point2D(blockWidthMm, blockHeightMm), label: 'خط لبه دامن (پای دامن)', type: 'frame' },
    { from: new Point2D(0, 0), to: new Point2D(0, blockHeightMm), label: 'خط راستای وسط پشت (CB)', type: 'frame' },
    { from: new Point2D(blockWidthMm, 0), to: new Point2D(blockWidthMm, blockHeightMm), label: 'خط راستای وسط جلو (CF)', type: 'frame' },
    { from: new Point2D(0, hipDepthMm), to: new Point2D(blockWidthMm, hipDepthMm), label: 'خط باسن بزرگ', type: 'guide' },
    { from: new Point2D(backHipWidth * 10, 0), to: new Point2D(backHipWidth * 10, blockHeightMm), label: 'خط پهلو (محور تقسیم پشت و جلو)', type: 'axis' },
  ];

  // Contours (true cut outline SVG paths)
  const backContour = [
    `M ${points.cbWaist.x.toFixed(1)} ${points.cbWaist.y.toFixed(1)}`,
    `L ${points.cbHip.x.toFixed(1)} ${points.cbHip.y.toFixed(1)}`,
    `L ${points.cbHem.x.toFixed(1)} ${points.cbHem.y.toFixed(1)}`,
    `L ${points.sideHem.x.toFixed(1)} ${points.sideHem.y.toFixed(1)}`,
    `L ${points.sideHip.x.toFixed(1)} ${points.sideHip.y.toFixed(1)}`,
    `C ${backHipCurve.c2.x.toFixed(1)} ${backHipCurve.c2.y.toFixed(1)} ${backHipCurve.c1.x.toFixed(1)} ${backHipCurve.c1.y.toFixed(1)} ${points.sideWaistBack.x.toFixed(1)} ${points.sideWaistBack.y.toFixed(1)}`,
    backWaistPathPart + `L ${points.cbWaist.x.toFixed(1)} ${points.cbWaist.y.toFixed(1)}`,
    'Z',
  ].join(' ');

  const frontHipC1X = points.sideWaistFront.x - 3 - hipCurveControlOffset;
  const frontHipC1Y = points.sideWaistFront.y + 0.35 * (points.sideHip.y - points.sideWaistFront.y);
  const frontHipC2X = points.sideHip.x - 2 - hipCurveControlOffset;
  const frontHipC2Y = points.sideHip.y - 0.20 * (points.sideHip.y - points.sideWaistFront.y);

  const frontContour = [
    `M ${points.cfWaist.x.toFixed(1)} ${points.cfWaist.y.toFixed(1)}`,
    `L ${(frontDartCenterX + frontDartHalfWidth).toFixed(1)} ${(cfWaistDeltaY * 10).toFixed(1)}`,
    `L ${frontDartCenterX.toFixed(1)} ${dartTipYFront.toFixed(1)}`,
    `L ${(frontDartCenterX - frontDartHalfWidth).toFixed(1)} ${(cfWaistDeltaY * 10).toFixed(1)}`,
    `L ${points.sideWaistFront.x.toFixed(1)} ${points.sideWaistFront.y.toFixed(1)}`,
    `C ${frontHipC1X.toFixed(1)} ${frontHipC1Y.toFixed(1)} ${frontHipC2X.toFixed(1)} ${frontHipC2Y.toFixed(1)} ${points.sideHip.x.toFixed(1)} ${points.sideHip.y.toFixed(1)}`,
    `L ${points.sideHem.x.toFixed(1)} ${points.sideHem.y.toFixed(1)}`,
    `L ${points.cfHem.x.toFixed(1)} ${points.cfHem.y.toFixed(1)}`,
    `L ${points.cfHip.x.toFixed(1)} ${points.cfHip.y.toFixed(1)}`,
    `L ${points.cfWaist.x.toFixed(1)} ${points.cfWaist.y.toFixed(1)}`,
    'Z',
  ].join(' ');

  const contours = [backContour, frontContour];
  const darts = [...backDartElements, frontDartElements];
  const grainlines = [
    { from: new Point2D((backHipWidth * 10) / 2, hipDepthMm - 40), to: new Point2D((backHipWidth * 10) / 2, blockHeightMm - 60) },
    { from: new Point2D((backHipWidth * 10 + blockWidthMm) / 2, hipDepthMm - 40), to: new Point2D((backHipWidth * 10 + blockWidthMm) / 2, blockHeightMm - 60) },
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
    constructionLines,
    contours,
    grainlines,
    darts,
  };
}

/**
 * 2. BASIC FITTED BODICE ENGINE (MÜLLER METHOD)
 */
export function draftBasicBodice(measurements, options = {}) {
  const {
    bust = 88.0,
    waist = 70.0,
    hip = 94.0,
    hipDepth = 20.0,
    backLength = 41.0,
    frontLength = 43.5,
    acrossBack = 34.5,
    acrossFront = 32.0,
    neck = 36.0,
    shoulder = 12.5,
    bustHeight = 26.5,
    bustSpan = 18.5,
  } = measurements;

  const effectiveFL = options.frontLength ?? frontLength;
  const effectiveBL = options.backLength ?? backLength;

  const method = options.method || 'MULLER';
  const fitPreference = options.fitPreference || 'CLASSIC';
  const posture = options.posture || {};

  const ease = FIT_EASE[fitPreference] || FIT_EASE.CLASSIC;
  const Eb = ease.bust;
  const Ew = ease.waist;
  const Eh = ease.hip;

  if (bust <= 0 || waist <= 0 || effectiveBL <= 0) {
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
    Da = effectiveBL / 2;
    Hw = neck / 6 + 0.5;
    Rb = acrossBack / 2;
    Bb = acrossFront / 2;
    Ad = (bust / 2 + Eb) - (Rb + Bb);
    Dbust = Math.max(1.5, effectiveFL - effectiveBL); // Grlawein conformational difference!
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

  // Vertical guideline levels (in mm)
  const underarmYMm = (Da + underarmDrop) * 10;
  const waistYMm = effectiveBL * 10;
  const frontWaistYMm = (effectiveBL + frontLengthOffset) * 10;
  const actualHipDepth = measurements.hipDepth ?? hipDepth;
  const hipDepthMm = actualHipDepth * 10;
  const backHipYMm = waistYMm + hipDepthMm;
  const frontHipYMm = frontWaistYMm + hipDepthMm;
  const blockWidthMm = Wblock * 10;
  const sideSeamX = (Rb + Ad / 2) * 10;

  // Hip circumference flaring calculation at side seam
  const Whip = (hip + Eh) / 2;
  const deltaHip = Whip - Wblock;
  const hipFlare = Math.max(10, (deltaHip > 0 ? (deltaHip / 2) * 10 : 10));
  const backSideHipX = sideSeamX + hipFlare;
  const frontSideHipX = sideSeamX - hipFlare;

  // Back waist suppression & dart geometry
  const cbIndentMm = posture.swayback ? 20 : 15;
  const backSideWaistX = sideSeamX - (sideSeamSuppression / 2) * 10;
  const backDartCenterX = Rb * 5;
  const backDartApexY = underarmYMm + 20;
  const backDartHalfW = (backDartWidth * 10) / 2;
  const backDartBottomY = backHipYMm - 30;

  // Front waist-to-hip dart geometry (apex below bust apex, widest at waist, ending 3-5cm above hip line)
  const frontSideWaistX = sideSeamX + (sideSeamSuppression / 2) * 10;
  const frontDartCenterX = (Wblock - bustSpan / 2) * 10;
  const frontDartHalfW = (frontDartWidth * 10) / 2;
  const frontDartApexY = bustHeight * 10 + 25;
  const frontDartBottomY = frontHipYMm - 40;

  // Back shoulder dart geometry (1.5cm width, 7.5cm depth placed on shoulder seam)
  const backShoulderTipX = (Rb + 1.0) * 10;
  const backShoulderTipY = (Da / 3 + shoulderTipDrop) * 10;
  const backShoulderDx = backShoulderTipX - Hw * 10;
  const backShoulderDy = backShoulderTipY - (-20);
  const backShoulderLen = Math.hypot(backShoulderDx, backShoulderDy);
  const uBackShoulderX = backShoulderLen > 0 ? backShoulderDx / backShoulderLen : 1;
  const uBackShoulderY = backShoulderLen > 0 ? backShoulderDy / backShoulderLen : 0;
  const nBackShoulderX = -uBackShoulderY;
  const nBackShoulderY = uBackShoulderX;

  const backDartDist = Math.min(50, backShoulderLen * 0.4);
  const backDartCenterOnShoulderX = Hw * 10 + uBackShoulderX * backDartDist;
  const backDartCenterOnShoulderY = -20 + uBackShoulderY * backDartDist;
  const backShoulderDartHalfW = 7.5;
  const backShoulderDartLen = 75.0;

  const backShoulderDart1 = new Point2D(
    backDartCenterOnShoulderX - uBackShoulderX * backShoulderDartHalfW,
    backDartCenterOnShoulderY - uBackShoulderY * backShoulderDartHalfW
  );
  const backShoulderDart2 = new Point2D(
    backDartCenterOnShoulderX + uBackShoulderX * backShoulderDartHalfW,
    backDartCenterOnShoulderY + uBackShoulderY * backShoulderDartHalfW
  );
  const backShoulderDartApex = new Point2D(
    backDartCenterOnShoulderX + nBackShoulderX * backShoulderDartLen,
    backDartCenterOnShoulderY + nBackShoulderY * backShoulderDartLen
  );

  // Front neck & shoulder points
  const frontNeckX = (Wblock - Hw) * 10;
  const frontNeckY = -15;
  const frontNeckPitX = blockWidthMm;
  const frontNeckPitY = (Hw + 0.5) * 10;
  const frontShoulderTipX = (Rb + Ad + 0.5) * 10;
  const frontShoulderTipY = (Da / 3 + shoulderTipDrop + 1.5) * 10;

  // Front concave neckline Bézier control points (dipping smoothly down and in toward CF pit)
  const neckDx = frontNeckPitX - frontNeckX;
  const neckDy = frontNeckPitY - frontNeckY;
  const frontNeckC1X = frontNeckX + neckDx * 0.15;
  const frontNeckC1Y = frontNeckY + neckDy * 0.55;
  const frontNeckC2X = frontNeckPitX - neckDx * 0.45;
  const frontNeckC2Y = frontNeckPitY;

  // Key reference points
  const points = {
    nape: new Point2D(0, 0),
    backNeck: new Point2D(Hw * 10, -20),
    backShoulderTip: new Point2D(backShoulderTipX, backShoulderTipY),
    underarmLevel: new Point2D(0, underarmYMm),
    sideSeamUnderarm: new Point2D(sideSeamX, underarmYMm),
    bustApex: new Point2D(frontDartCenterX, bustHeight * 10),
    cfWaist: new Point2D(blockWidthMm, frontWaistYMm),
    cbWaist: new Point2D(cbIndentMm, waistYMm),
    cbHip: new Point2D(0, backHipYMm),
    cfHip: new Point2D(blockWidthMm, frontHipYMm),
    sideHip: new Point2D(sideSeamX, backHipYMm),
    sideHipBack: new Point2D(backSideHipX, backHipYMm),
    sideHipFront: new Point2D(frontSideHipX, frontHipYMm),
    frontNeck: new Point2D(frontNeckX, frontNeckY),
    frontNeckPit: new Point2D(frontNeckPitX, frontNeckPitY),
    frontShoulderTip: new Point2D(frontShoulderTipX, frontShoulderTipY),
  };

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'رسم خطوط مبنا و کادر بالاتنه تا خط باسن',
      instructionFa: `کادر بالاتنه به عرض ${(Wblock).toFixed(1)} سانتی‌متر، قد بالاتنه ${(effectiveBL).toFixed(1)} سانتی‌متر و بلندی باسن ${actualHipDepth.toFixed(1)} سانتی‌متر رسم شد.`,
      calculatedValues: {
        'عرض کادر': `${(Wblock).toFixed(1)} cm`,
        'عمق حلقه': `${(Da).toFixed(1)} cm`,
        'بلندی باسن': `${actualHipDepth.toFixed(1)} cm`,
      },
      elements: ['nape', 'underarmLevel', 'cbWaist', 'cfWaist', 'cbHip', 'cfHip'],
    },
    {
      stepIndex: 1,
      titleFa: 'رسم هلال طوق گردن پشت و سرشانه',
      instructionFa: `گشادی طوق گردن ${(Hw).toFixed(1)} سانتی‌متر و شیب سرشانه و پنس سرشانه پشت رسم گردید.`,
      calculatedValues: {
        'گشادی طوق گردن': `${(Hw).toFixed(1)} cm`,
        'طول سرشانه': `${shoulder} cm`,
      },
      elements: ['backNeck', 'backShoulderTip'],
    },
    {
      stepIndex: 2,
      titleFa: 'محاسبه و رسم پنس سرشانه / سینه جلو',
      instructionFa: `پنس سینه جلو به پهنای ${(Dbust).toFixed(1)} سانتی‌متر رو به مرکز برجستگی سینه رسم شد.`,
      calculatedValues: {
        'پهنای پنس سینه': `${(Dbust).toFixed(1)} cm`,
        'فاصله سینه': `${bustSpan} cm`,
      },
      elements: ['bustApex'],
    },
    {
      stepIndex: 3,
      titleFa: 'رسم هلال طوق گردن جلو و حلقه آستین',
      instructionFa: `هلال مقعر طوق گردن جلو به عمق ${(Hw + 0.5).toFixed(1)} سانتی‌متر و منحنی حلقه آستین پشت و جلو ترسیم شد.`,
      calculatedValues: {
        'عمق یقه جلو': `${(Hw + 0.5).toFixed(1)} cm`,
        'محیط کل حلقه': `${totalArmholePerimeter.toFixed(1)} cm`,
      },
      elements: ['frontNeck', 'frontNeckPit', 'sideSeamUnderarm', 'frontShoulderTip'],
    },
    {
      stepIndex: 4,
      titleFa: 'محاسبه ساسون‌های کمر، باسن و گودی پهلو',
      instructionFa: `ساسون پشت ${(backDartWidth).toFixed(1)}cm، ساسون بزرگ زیر سینه ${(frontDartWidth).toFixed(1)}cm و گودی پهلو ${(sideSeamSuppression).toFixed(1)}cm تا خط باسن رسم گردید.`,
      calculatedValues: {
        'تنگی کل کمر': `${(deltaW).toFixed(1)} cm`,
        'ساسون زیر سینه': `${(frontDartWidth).toFixed(1)} cm`,
        'گودی پهلو': `${(sideSeamSuppression).toFixed(1)} cm`,
      },
      elements: ['sideHipBack', 'sideHipFront', 'cbWaist'],
    },
  ];

  // Construction lines
  const constructionLines = [
    // Initial bounding frame (کادر مستطیل اولیه)
    { from: new Point2D(0, 0), to: new Point2D(blockWidthMm, 0), label: 'خط گردن / کادر بالایی', type: 'frame' },
    { from: new Point2D(0, waistYMm), to: new Point2D(blockWidthMm, waistYMm), label: 'خط کمر کادر اولیه', type: 'frame' },
    { from: new Point2D(0, backHipYMm), to: new Point2D(blockWidthMm, backHipYMm), label: 'خط باسن کادر اولیه', type: 'frame' },
    { from: new Point2D(0, 0), to: new Point2D(0, backHipYMm), label: 'خط مرکزی پشت (CB)', type: 'frame' },
    { from: new Point2D(blockWidthMm, 0), to: new Point2D(blockWidthMm, frontHipYMm), label: 'خط مرکزی جلو (CF)', type: 'frame' },

    // Distinct horizontal guide levels
    { from: new Point2D(0, underarmYMm), to: new Point2D(blockWidthMm, underarmYMm), label: 'خط کف حلقه آستین', type: 'guide' },
    { from: new Point2D(0, waistYMm), to: new Point2D(blockWidthMm, waistYMm), label: 'خط کمر', type: 'guide' },
    { from: new Point2D(0, backHipYMm), to: new Point2D(blockWidthMm, backHipYMm), label: 'خط باسن', type: 'guide' },
    { from: new Point2D(Rb * 10, bustHeight * 10), to: new Point2D(blockWidthMm, bustHeight * 10), label: 'خط بلندی سینه', type: 'guide' },

    // Vertical lines
    { from: new Point2D(0, 0), to: new Point2D(0, backHipYMm), label: 'خط مرکزی پشت (CB)', type: 'axis' },
    { from: new Point2D(blockWidthMm, 0), to: new Point2D(blockWidthMm, frontHipYMm), label: 'خط مرکزی جلو (CF)', type: 'axis' },
    { from: new Point2D(sideSeamX, underarmYMm), to: new Point2D(sideSeamX, backHipYMm), label: 'خط پهلو', type: 'axis' },
    { from: new Point2D(frontDartCenterX, bustHeight * 10), to: new Point2D(frontDartCenterX, frontHipYMm), label: 'محور پنس بزرگ زیر سینه', type: 'axis' },
    { from: new Point2D(backDartCenterX, underarmYMm), to: new Point2D(backDartCenterX, backHipYMm), label: 'محور پنس کمر پشت', type: 'guide' },
    { from: new Point2D(Rb * 10, 0), to: new Point2D(Rb * 10, underarmYMm), label: 'خط راهنمای کارور پشت', type: 'guide' },
    { from: new Point2D((Rb + Ad) * 10, 0), to: new Point2D((Rb + Ad) * 10, underarmYMm), label: 'خط راهنمای کارور جلو', type: 'guide' },
  ];

  // Contours: closed clean cut outline SVG paths extending from shoulder to hip line
  const backContour = [
    `M ${points.nape.x.toFixed(1)} ${points.nape.y.toFixed(1)}`,
    `Q ${(Hw * 5).toFixed(1)} 0, ${points.backNeck.x.toFixed(1)} ${points.backNeck.y.toFixed(1)}`,
    `L ${backShoulderDart1.x.toFixed(1)} ${backShoulderDart1.y.toFixed(1)}`,
    `L ${backShoulderDartApex.x.toFixed(1)} ${backShoulderDartApex.y.toFixed(1)}`,
    `L ${backShoulderDart2.x.toFixed(1)} ${backShoulderDart2.y.toFixed(1)}`,
    `L ${points.backShoulderTip.x.toFixed(1)} ${points.backShoulderTip.y.toFixed(1)}`,
    `C ${(Rb * 10 + 2).toFixed(1)} ${(points.backShoulderTip.y + 15).toFixed(1)}, ${(Rb * 10).toFixed(1)} ${(points.sideSeamUnderarm.y - 15).toFixed(1)}, ${points.sideSeamUnderarm.x.toFixed(1)} ${points.sideSeamUnderarm.y.toFixed(1)}`,
    `L ${backSideWaistX.toFixed(1)} ${waistYMm.toFixed(1)}`,
    `C ${(backSideWaistX + 3).toFixed(1)} ${(waistYMm + hipDepthMm * 0.35).toFixed(1)}, ${(backSideHipX + 2).toFixed(1)} ${(waistYMm + hipDepthMm * 0.75).toFixed(1)}, ${backSideHipX.toFixed(1)} ${backHipYMm.toFixed(1)}`,
    `L 0.0 ${backHipYMm.toFixed(1)}`,
    `L ${points.cbWaist.x.toFixed(1)} ${points.cbWaist.y.toFixed(1)}`,
    `L ${points.nape.x.toFixed(1)} ${points.nape.y.toFixed(1)}`,
    'Z',
  ].join(' ');

  const frontContour = [
    `M ${frontNeckPitX.toFixed(1)} ${frontNeckPitY.toFixed(1)}`,
    `L ${points.cfWaist.x.toFixed(1)} ${points.cfWaist.y.toFixed(1)}`,
    `L ${points.cfWaist.x.toFixed(1)} ${frontHipYMm.toFixed(1)}`,
    `L ${frontSideHipX.toFixed(1)} ${frontHipYMm.toFixed(1)}`,
    `C ${(frontSideHipX - 2).toFixed(1)} ${(frontHipYMm - hipDepthMm * 0.25).toFixed(1)}, ${(frontSideWaistX - 3).toFixed(1)} ${(waistYMm + hipDepthMm * 0.35).toFixed(1)}, ${frontSideWaistX.toFixed(1)} ${waistYMm.toFixed(1)}`,
    `L ${points.sideSeamUnderarm.x.toFixed(1)} ${points.sideSeamUnderarm.y.toFixed(1)}`,
    `C ${(points.sideSeamUnderarm.x + 10).toFixed(1)} ${(points.sideSeamUnderarm.y - 5).toFixed(1)}, ${((Rb + Ad) * 10).toFixed(1)} ${(points.sideSeamUnderarm.y - 20).toFixed(1)}, ${frontShoulderTipX.toFixed(1)} ${frontShoulderTipY.toFixed(1)}`,
    `L ${(frontShoulderTipX + 15).toFixed(1)} ${(frontShoulderTipY - 5).toFixed(1)}`,
    `L ${points.bustApex.x.toFixed(1)} ${points.bustApex.y.toFixed(1)}`,
    `L ${(frontNeckX - 10).toFixed(1)} ${(frontNeckY + 5).toFixed(1)}`,
    `L ${frontNeckX.toFixed(1)} ${frontNeckY.toFixed(1)}`,
    `C ${frontNeckC1X.toFixed(1)} ${frontNeckC1Y.toFixed(1)}, ${frontNeckC2X.toFixed(1)} ${frontNeckC2Y.toFixed(1)}, ${frontNeckPitX.toFixed(1)} ${frontNeckPitY.toFixed(1)}`,
    'Z',
  ].join(' ');

  const contours = [backContour, frontContour];

  const darts = [
    // Back waist-to-hip dart
    [
      new Point2D(backDartCenterX, backDartApexY),
      new Point2D(backDartCenterX - backDartHalfW, waistYMm),
      new Point2D(backDartCenterX, backDartBottomY),
      new Point2D(backDartCenterX + backDartHalfW, waistYMm),
    ],
    // Front waist-to-hip dart
    [
      new Point2D(frontDartCenterX, frontDartApexY),
      new Point2D(frontDartCenterX - frontDartHalfW, frontWaistYMm),
      new Point2D(frontDartCenterX, frontDartBottomY),
      new Point2D(frontDartCenterX + frontDartHalfW, frontWaistYMm),
    ],
    // Front shoulder bust dart
    [
      new Point2D(frontShoulderTipX + 15, frontShoulderTipY - 5),
      points.bustApex,
      new Point2D(frontNeckX - 10, frontNeckY + 5),
    ],
    // Back shoulder dart
    [
      backShoulderDart1,
      backShoulderDartApex,
      backShoulderDart2,
    ],
  ];

  const grainlines = [
    { from: new Point2D(Rb * 5, 50), to: new Point2D(Rb * 5, backHipYMm - 30) },
    { from: new Point2D(frontDartCenterX, points.bustApex.y + 30), to: new Point2D(frontDartCenterX, frontHipYMm - 30) },
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
    boundingBox: { minX: 0, minY: -20, width: Wblock * 10, height: (effectiveBL + frontLengthOffset + actualHipDepth) * 10 + 20 },
    constructionLines,
    contours,
    grainlines,
    darts,
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
  const wristEase = 4.0;
  const wristWidthMm = (wristCirc + wristEase) * 10;
  const sleeveLengthMm = sleeveLength * 10;

  // Crown apex coordinate
  const xApex = 0.52 * bicepWidthMm;
  const crownApex = new Point2D(xApex, 0, 'قله تاج آستین (نقطه ۱)');
  const uBack = new Point2D(0, capHeightMm, 'کف حلقه پشت (نقطه ۴)');
  const uFront = new Point2D(bicepWidthMm, capHeightMm, 'کف حلقه جلو (نقطه ۵)');

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

  // 1. Initial Rectangular Drafting Frame (کادر مستطیل اولیه)
  const frameTopLeft = new Point2D(0, 0, 'گوشه کادر بالا چپ');
  const frameTopRight = new Point2D(bicepWidthMm, 0, 'گوشه کادر بالا راست');
  const frameBottomLeft = new Point2D(0, sleeveLengthMm, 'گوشه کادر پایین چپ');
  const frameBottomRight = new Point2D(bicepWidthMm, sleeveLengthMm, 'گوشه کادر پایین راست');

  // 2. Wrist and Center Line (خط مچ و محور مرکزی)
  const taperEach = Math.max(0, (bicepWidthMm - wristWidthMm) / 2);
  const wristBack = new Point2D(taperEach, sleeveLengthMm, 'مچ پشت');
  const wristFront = new Point2D(bicepWidthMm - taperEach, sleeveLengthMm, 'مچ جلو');
  const centerWrist = new Point2D(xApex, sleeveLengthMm, 'مرکز مچ (نقطه ۲ و ۷)');
  const centerBicep = new Point2D(xApex, capHeightMm, 'تقاطع کف حلقه و محور مرکزی (نقطه ۳)');

  // 3. Elbow Line (خط آرنج - نصف فاصله کف حلقه تا مچ)
  const elbowYMm = capHeightMm + (sleeveLengthMm - capHeightMm) * 0.5;
  const elbowBackX = taperEach * 0.5;
  const elbowFrontX = bicepWidthMm - taperEach * 0.5;
  const elbowBack = new Point2D(elbowBackX, elbowYMm, 'آرنج پشت');
  const elbowFront = new Point2D(elbowFrontX, elbowYMm, 'آرنج جلو');
  const elbowCenter = new Point2D(xApex, elbowYMm, 'مرکز آرنج (نقطه ۶)');

  // 4. Crown Guide Triangle Division Points (نقاط کمکی تقسیمات مثلث راهنما)
  const dxBack = crownApex.x - uBack.x;
  const dyBack = crownApex.y - uBack.y;
  const lenBack = Math.hypot(dxBack, dyBack);
  const uxBack = lenBack > 0 ? dxBack / lenBack : 0;
  const uyBack = lenBack > 0 ? dyBack / lenBack : 0;
  const nOutBack = new Point2D(uyBack, -uxBack);

  const point8 = new Point2D(uBack.x + 0.25 * dxBack, uBack.y + 0.25 * dyBack, 'نقطه ۸ (۱/۴ هلال پشت)');
  const point9 = new Point2D(uBack.x + 0.50 * dxBack, uBack.y + 0.50 * dyBack, 'نقطه ۹ (وسط شیب پشت)');
  const point10 = new Point2D(uBack.x + 0.75 * dxBack, uBack.y + 0.75 * dyBack, 'نقطه ۱۰ (۳/۴ هلال پشت)');

  const dxFront = uFront.x - crownApex.x;
  const dyFront = uFront.y - crownApex.y;
  const lenFront = Math.hypot(dxFront, dyFront);
  const uxFront = lenFront > 0 ? dxFront / lenFront : 0;
  const uyFront = lenFront > 0 ? dyFront / lenFront : 0;
  const nOutFront = new Point2D(uyFront, -uxFront);

  const point11 = new Point2D(crownApex.x + 0.25 * dxFront, crownApex.y + 0.25 * dyFront, 'نقطه ۱۱ (۱/۴ هلال جلو)');
  const point12 = new Point2D(crownApex.x + 0.50 * dxFront, crownApex.y + 0.50 * dyFront, 'نقطه ۱۲ (وسط شیب جلو)');
  const point13 = new Point2D(crownApex.x + 0.75 * dxFront, crownApex.y + 0.75 * dyFront, 'نقطه ۱۳ (۳/۴ هلال جلو)');

  const point19 = new Point2D(point8.x - 10 * nOutBack.x, point8.y - 10 * nOutBack.y, 'نقطه ۱۹ (گودی هلال پشت)');
  const point20 = new Point2D(point10.x + 18 * nOutBack.x, point10.y + 18 * nOutBack.y, 'نقطه ۲۰ (برجستگی تاج پشت)');
  const point22 = new Point2D(point11.x + 18 * nOutFront.x, point11.y + 18 * nOutFront.y, 'نقطه ۲۲ (برجستگی تاج جلو)');
  const point23 = new Point2D(point13.x - 15 * nOutFront.x, point13.y - 15 * nOutFront.y, 'نقطه ۲۳ (گودی عمیق حلقه جلو)');

  // 5. Wrist Vent / Slit Markings (چاک آستین)
  const backWristSpan = centerWrist.x - wristBack.x;
  const slitX = wristBack.x + 0.25 * backWristSpan;
  const slitLengthMm = 80.0;
  const slitBottom = new Point2D(slitX, sleeveLengthMm, 'پایین چاک آستین');
  const slitTop = new Point2D(slitX, sleeveLengthMm - slitLengthMm, 'بالای چاک آستین');

  const constructionLines = [
    { from: frameTopLeft, to: frameTopRight, label: 'کادر مستطیل اولیه (لبه بالا)', type: 'frame' },
    { from: frameTopRight, to: frameBottomRight, label: 'کادر مستطیل اولیه (راست)', type: 'frame' },
    { from: frameBottomRight, to: frameBottomLeft, label: 'کادر مستطیل اولیه (لبه مچ)', type: 'frame' },
    { from: frameBottomLeft, to: frameTopLeft, label: 'کادر مستطیل اولیه (چپ)', type: 'frame' },
    { from: crownApex, to: centerWrist, label: 'محور مرکزی و راستای پارچه', type: 'axis' },
    { from: uBack, to: uFront, label: 'خط کف حلقه (عرض بازو)', type: 'guide' },
    { from: elbowBack, to: elbowFront, label: 'خط آرنج', type: 'guide' },
    { from: wristBack, to: wristFront, label: 'خط مچ', type: 'guide' },
    { from: uBack, to: crownApex, label: 'راهنمای تاج پشت (شیب پشت)', type: 'guide' },
    { from: crownApex, to: uFront, label: 'راهنمای تاج جلو (شیب جلو)', type: 'guide' },
    { from: point8, to: point19, label: 'عمود گودی پشت (نقطه ۸ به ۱۹)', type: 'guide' },
    { from: point10, to: point20, label: 'عمود برجستگی پشت (نقطه ۱۰ به ۲۰)', type: 'guide' },
    { from: point11, to: point22, label: 'عمود برجستگی جلو (نقطه ۱۱ به ۲۲)', type: 'guide' },
    { from: point13, to: point23, label: 'عمود گودی جلو (نقطه ۱۳ به ۲۳)', type: 'guide' },
    { from: uBack, to: wristBack, label: 'درز زیر دست پشت', type: 'guide' },
    { from: uFront, to: wristFront, label: 'درز زیر دست جلو', type: 'guide' },
    { from: slitBottom, to: slitTop, label: 'خط چاک آستین', type: 'guide' },
  ];

  const sleeveContour = [
    `M ${uBack.x.toFixed(2)},${uBack.y.toFixed(2)}`,
    `C ${backScoop.c1.x.toFixed(2)},${backScoop.c1.y.toFixed(2)} ${backScoop.c2.x.toFixed(2)},${backScoop.c2.y.toFixed(2)} ${backScoop.p3.x.toFixed(2)},${backScoop.p3.y.toFixed(2)}`,
    `C ${backCrown.c1.x.toFixed(2)},${backCrown.c1.y.toFixed(2)} ${backCrown.c2.x.toFixed(2)},${backCrown.c2.y.toFixed(2)} ${crownApex.x.toFixed(2)},${crownApex.y.toFixed(2)}`,
    `C ${frontCrown.c1.x.toFixed(2)},${frontCrown.c1.y.toFixed(2)} ${frontCrown.c2.x.toFixed(2)},${frontCrown.c2.y.toFixed(2)} ${frontCrown.p3.x.toFixed(2)},${frontCrown.p3.y.toFixed(2)}`,
    `C ${frontScoop.c1.x.toFixed(2)},${frontScoop.c1.y.toFixed(2)} ${frontScoop.c2.x.toFixed(2)},${frontScoop.c2.y.toFixed(2)} ${uFront.x.toFixed(2)},${uFront.y.toFixed(2)}`,
    `L ${wristFront.x.toFixed(2)},${wristFront.y.toFixed(2)}`,
    `L ${wristBack.x.toFixed(2)},${wristBack.y.toFixed(2)}`,
    `Z`,
  ].join(' ');
  const contours = [sleeveContour];

  const points = {
    crownApex,
    uBack,
    uFront,
    centerWrist,
    wristBack,
    wristFront,
    elbowBack,
    elbowFront,
    elbowCenter,
    frameTopLeft,
    frameTopRight,
    frameBottomLeft,
    frameBottomRight,
    point1: crownApex,
    point2: centerWrist,
    point3: centerBicep,
    point4: uBack,
    point5: uFront,
    point6: elbowCenter,
    point7: centerWrist,
    point8,
    point9,
    point10,
    point11,
    point12,
    point13,
    point19,
    point20,
    point22,
    point23,
    pt1: crownApex,
    pt2: centerWrist,
    pt3: centerBicep,
    pt4: uBack,
    pt5: uFront,
    pt6: elbowCenter,
    pt7: centerWrist,
    pt8: point8,
    pt9: point9,
    pt10: point10,
    pt11: point11,
    pt12: point12,
    pt13: point13,
    pt19: point19,
    pt20: point20,
    pt22: point22,
    pt23: point23,
    slitBottom,
    slitTop,
  };

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'کادر مستطیل اولیه و خطوط مبنا',
      instructionFa: `کادر مستطیلی به عرض کف حلقه ${(BW).toFixed(1)} سانتی‌متر و ارتفاع قد آستین ${(sleeveLength).toFixed(1)} سانتی‌متر رسم کنید. خط مچ در انتهای کادر و خط کف حلقه در فاصله ${(CapHeight).toFixed(1)} سانتی‌متری از لبه بالا قرار دارد.`,
      calculatedValues: {
        'قد آستین': `${sleeveLength.toFixed(1)} cm`,
        'عرض کف حلقه (دور بازو)': `${BW.toFixed(1)} cm`,
        'بلندی تاج آستین': `${CapHeight.toFixed(1)} cm`,
      },
      elements: ['frameTopLeft', 'frameTopRight', 'frameBottomLeft', 'frameBottomRight', 'uBack', 'uFront'],
    },
    {
      stepIndex: 1,
      titleFa: 'محور مرکزی و خط آرنج',
      instructionFa: `خط تعادل و راستای پارچه از قله تاج آستین به مچ عمود می‌شود. خط آرنج در فاصله ${(elbowYMm / 10).toFixed(1)} سانتی‌متر (نصف فاصله کف حلقه تا مچ) به موازات خط مچ رسم می‌گردد.`,
      calculatedValues: {
        'موقعیت محور مرکزی': `${(xApex / 10).toFixed(1)} cm`,
        'فاصله تا خط آرنج': `${(elbowYMm / 10).toFixed(1)} cm`,
      },
      elements: ['crownApex', 'centerWrist', 'elbowBack', 'elbowFront', 'elbowCenter'],
    },
    {
      stepIndex: 2,
      titleFa: 'مثلث راهنمای تاج و نقاط تقسیم‌بندی',
      instructionFa: `خطوط شیب تاج از کف حلقه پشت و جلو به قله تاج وصل شده و به چهار قسمت مساوی تقسیم می‌شوند (نقاط ۸، ۹، ۱۰ در پشت و ۱۱، ۱۲، ۱۳ در جلو). سپس خطوط عمود راهنمای تحدب و تقعر (نقاط ۱۹، ۲۰، ۲۲، ۲۳) رسم می‌شوند.`,
      calculatedValues: {
        'نقاط کمکی پشت': '۸، ۹، ۱۰',
        'نقاط کمکی جلو': '۱۱، ۱۲، ۱۳',
        'نقاط کنترل انحنا': '۱۹، ۲۰، ۲۲، ۲۳',
      },
      elements: ['point8', 'point9', 'point10', 'point11', 'point12', 'point13', 'point19', 'point20', 'point22', 'point23'],
    },
    {
      stepIndex: 3,
      titleFa: 'رسم منحنی‌های تاج آستین و تطابق خرد',
      instructionFa: `منحنی‌های هلال تاج آستین با عبور نرم از نقاط کمکی رسم می‌شوند. طول کل منحنی تاج ${(LcapCm).toFixed(1)} سانتی‌متر است که با احتساب محیط حلقه ${(AHtot).toFixed(1)} سانتی‌متر، مقدار خرد مجاز ${(capEaseCm).toFixed(1)} سانتی‌متر را تامین می‌کند.`,
      calculatedValues: {
        'محیط حلقه تنه': `${AHtot.toFixed(1)} cm`,
        'طول منحنی تاج': `${LcapCm.toFixed(1)} cm`,
        'خرد تاج آستین': `${capEaseCm.toFixed(1)} cm`,
      },
      elements: ['backScoop', 'backCrown', 'frontCrown', 'frontScoop', 'crownApex'],
    },
    {
      stepIndex: 4,
      titleFa: 'خطوط درز زیر دست، مچ و چاک آستین',
      instructionFa: `خطوط درز زیر دست با اتصال کف حلقه به مچ رسم می‌شوند. پهنای دور مچ ${(wristWidthMm / 10).toFixed(1)} سانتی‌متر است و چاک آستین در یک‌چهارم سمت پشت مچ به طول ${(slitLengthMm / 10).toFixed(1)} سانتی‌متر مشخص می‌گردد. کانتور نهایی برش بسته آستین شکل می‌گیرد.`,
      calculatedValues: {
        'عرض مچ با آزادی': `${(wristWidthMm / 10).toFixed(1)} cm`,
        'طول چاک آستین': `${(slitLengthMm / 10).toFixed(1)} cm`,
      },
      elements: ['wristBack', 'wristFront', 'slitBottom', 'slitTop', 'sleeveContour'],
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
    points,
    backScoop,
    backCrown,
    frontCrown,
    frontScoop,
    constructionLines,
    contours,
    steps,
    boundingBox: { minX: 0, minY: 0, width: bicepWidthMm, height: sleeveLengthMm },
  };
}

/**
 * 4. BASIC TROUSER ENGINE
 * Standard Müller & Sohn Tailoring Method (Front & Back Panels Side-by-Side)
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
  const yHipMm = Math.max(0, (crotchDepth - 8.5) * 10);

  // Front panel horizontal references
  const xCF = ExtFront * 10;
  const xSideHip = (ExtFront + WfrontHip) * 10;
  const frontWaistSideX = xCreaseMm + ((WfrontHip - ExtFront) / 2 + 1) * 10;
  const frontKneeLeftX = xCreaseMm - (kneeWidth / 2) * 10;
  const frontKneeRightX = xCreaseMm + (kneeWidth / 2) * 10;
  const frontHemLeftX = xCreaseMm - (hemWidth / 2) * 10;
  const frontHemRightX = xCreaseMm + (hemWidth / 2) * 10;
  const frameWidthMm = (ExtFront + WfrontHip) * 10;

  // Horizontal offset for Back Panel (distinct, side-by-side layout)
  // Ensures clean gap between front hip/side seam and back crotch extension
  const panelGap = 80; // 80mm gap
  const frontMaxX = Math.max(xSideHip, frontWaistSideX, frontKneeRightX);
  const backOffsetX = frontMaxX + panelGap + ExtBack * 10;
  const backCreaseMm = xCreaseMm + backOffsetX;

  // Back panel reference coordinates
  const backCrotchTipX = -ExtBack * 10 + backOffsetX;
  const backCrotchTipY = yCrotchMm + 10; // Drops 10mm below crotch level
  const backKneeLeftX = backCreaseMm - (kneeWidth / 2 + 1.0) * 10;
  const backKneeRightX = backCreaseMm + (kneeWidth / 2 + 1.0) * 10;
  const backHemLeftX = backCreaseMm - (hemWidth / 2 + 1.0) * 10;
  const backHemRightX = backCreaseMm + (hemWidth / 2 + 1.0) * 10;

  // CB waist extension (بلندی فاق پشت: point 46 elevated above front waist by 3.5cm)
  const backWaistCBX = backCreaseMm - 25;
  const backWaistCBY = -35; // 3.5cm (35mm) elevated for seating posture
  const backWaistSideX = backCreaseMm + ((WfrontHip - ExtFront) / 2 + 3.5) * 10;
  const backWaistSideY = 0;
  const backHipSideX = (ExtFront + WfrontHip + 2.0) * 10 + backOffsetX;

  // Points dictionary (preserving all existing keys and invariants)
  const points = {
    // Front Panel Points
    frontCreaseWaist: new Point2D(xCreaseMm, 0, 'خط اتو کمر پیش'),
    frontCrotchTip: new Point2D(0, yCrotchMm, 'نقاب فاق پیش'),
    frontKneeLeft: new Point2D(frontKneeLeftX, yKneeMm, 'زانو داخل پیش'),
    frontKneeRight: new Point2D(frontKneeRightX, yKneeMm, 'زانو پهلو پیش'),
    frontHemLeft: new Point2D(frontHemLeftX, yHemMm, 'دمپا داخل پیش'),
    frontHemRight: new Point2D(frontHemRightX, yHemMm, 'دمپا پهلو پیش'),
    frontWaistCF: new Point2D(xCF, 0, 'مرکز جلو کمر (CF)'),
    frontWaistSide: new Point2D(frontWaistSideX, 0, 'پهلو کمر پیش'),
    frontHipSide: new Point2D(xSideHip, yHipMm, 'باسن پهلو پیش'),
    frontCreaseHem: new Point2D(xCreaseMm, yHemMm, 'خط اتو دمپا پیش'),
    frontDartTip: new Point2D(xCreaseMm, 90, 'نوک پنس پیش'),
    flyFacingTop: new Point2D(xCF - 35, 0, 'سجاف زیپ بالا'),
    flyFacingBottom: new Point2D(xCF - 35, 170, 'سجاف زیپ پایین'),

    // Back Panel Points (offset horizontally)
    backCrotchTip: new Point2D(backCrotchTipX, backCrotchTipY, 'نقاب فاق پشت'),
    backKneeLeft: new Point2D(backKneeLeftX, yKneeMm, 'زانو داخل پشت'),
    backKneeRight: new Point2D(backKneeRightX, yKneeMm, 'زانو پهلو پشت'),
    backHemLeft: new Point2D(backHemLeftX, yHemMm, 'دمپا داخل پشت'),
    backHemRight: new Point2D(backHemRightX, yHemMm, 'دمپا پهلو پشت'),
    backCreaseWaist: new Point2D(backCreaseMm, 0, 'خط اتو کمر پشت'),
    backCreaseHem: new Point2D(backCreaseMm, yHemMm, 'خط اتو دمپا پشت'),
    backWaistCB: new Point2D(backWaistCBX, backWaistCBY, 'بلندی فاق پشت (نقطه ۴۶)'),
    backWaistSide: new Point2D(backWaistSideX, backWaistSideY, 'پهلو کمر پشت'),
    backHipSide: new Point2D(backHipSideX, yHipMm, 'باسن پهلو پشت'),
  };

  // Inseam measurements
  const frontInseamUpper = points.frontCrotchTip.dist(points.frontKneeLeft);
  const backInseamUpper = points.backCrotchTip.dist(points.backKneeLeft);
  // Back inseam is tailored 12mm shorter to allow stretch-bias molding
  const backInseamTarget = frontInseamUpper - 12;

  // Darts
  // Front waist dart: centered on crease line
  const frontDart = [
    new Point2D(xCreaseMm - 10, 0),
    new Point2D(xCreaseMm, 90),
    new Point2D(xCreaseMm + 10, 0),
  ];

  // Back waist dart: centered between CB waist and side waist
  const backDartMidX = (backWaistCBX + backWaistSideX) / 2;
  const backDartMidY = (backWaistCBY + backWaistSideY) / 2;
  const backDart = [
    new Point2D(backDartMidX - 12.5, backDartMidY),
    new Point2D(backDartMidX, backDartMidY + 100),
    new Point2D(backDartMidX + 12.5, backDartMidY),
  ];
  points.backDartTip = new Point2D(backDartMidX, backDartMidY + 100, 'نوک پنس پشت');

  const darts = [frontDart, backDart];

  // Grainlines
  const grainlines = [
    { from: new Point2D(xCreaseMm, 20), to: new Point2D(xCreaseMm, yHemMm - 20) },
    { from: new Point2D(backCreaseMm, 20), to: new Point2D(backCreaseMm, yHemMm - 20) },
  ];

  // Construction lines
  const constructionLines = [
    // --- Front Panel Frame (کادر مستطیل پیش شلوار) ---
    { from: new Point2D(0, 0), to: new Point2D(frameWidthMm, 0), label: 'خط کمر کادر اولیه پیش', type: 'frame' },
    { from: new Point2D(0, yHemMm), to: new Point2D(frameWidthMm, yHemMm), label: 'خط لبه دمپا کادر پیش', type: 'frame' },
    { from: new Point2D(0, 0), to: new Point2D(0, yHemMm), label: 'خط مبنای فاق پیش', type: 'frame' },
    { from: new Point2D(frameWidthMm, 0), to: new Point2D(frameWidthMm, yHemMm), label: 'خط مبنای پهلو پیش', type: 'frame' },

    // --- Back Panel Frame (کادر مستطیل پشت شلوار) ---
    { from: new Point2D(backCrotchTipX, 0), to: new Point2D(backHipSideX, 0), label: 'خط کمر کادر اولیه پشت', type: 'frame' },
    { from: new Point2D(backCrotchTipX, yHemMm), to: new Point2D(backHipSideX, yHemMm), label: 'خط لبه دمپا کادر پشت', type: 'frame' },
    { from: new Point2D(backCrotchTipX, 0), to: new Point2D(backCrotchTipX, yHemMm), label: 'خط مبنای فاق پشت', type: 'frame' },
    { from: new Point2D(backHipSideX, 0), to: new Point2D(backHipSideX, yHemMm), label: 'خط مبنای پهلو پشت', type: 'frame' },

    // --- Panel Title Badges / Axes ---
    { from: new Point2D(xCreaseMm, -20), to: new Point2D(xCreaseMm, 0), label: 'پیش شلوار (جلو)', type: 'axis' },
    { from: new Point2D(backCreaseMm, -20), to: new Point2D(backCreaseMm, 0), label: 'پشت شلوار', type: 'axis' },

    // --- Vertical Crease / Balance Axes (خط اتو و راستای پارچه) ---
    { from: new Point2D(xCreaseMm, 0), to: new Point2D(xCreaseMm, yHemMm), label: 'خط اتو و راستای پارچه (پیش)', type: 'axis' },
    { from: new Point2D(backCreaseMm, backWaistCBY), to: new Point2D(backCreaseMm, yHemMm), label: 'خط اتو و راستای پارچه (پشت)', type: 'axis' },

    // --- Vertical CF and CB guides ---
    { from: new Point2D(xCF, 0), to: new Point2D(xCF, yCrotchMm), label: 'خط عمود فاق پیش (CF)', type: 'guide' },
    { from: new Point2D(backWaistCBX, 0), to: new Point2D(backWaistCBX, backWaistCBY), label: 'بلندی فاق پشت (نقطه ۴۶)', type: 'guide' },

    // --- Horizontal Guide Levels: Front Panel ---
    { from: new Point2D(0, yHipMm), to: new Point2D(xSideHip, yHipMm), label: 'خط باسن', type: 'guide' },
    { from: new Point2D(0, yCrotchMm), to: new Point2D(xSideHip, yCrotchMm), label: 'خط فاق', type: 'guide' },
    { from: new Point2D(xCreaseMm - (kneeWidth / 2 + 2) * 10, yKneeMm), to: new Point2D(xCreaseMm + (kneeWidth / 2 + 2) * 10, yKneeMm), label: 'خط زانو', type: 'guide' },
    { from: new Point2D(xCreaseMm - (hemWidth / 2 + 2) * 10, yHemMm), to: new Point2D(xCreaseMm + (hemWidth / 2 + 2) * 10, yHemMm), label: 'خط دمپا', type: 'guide' },

    // --- Horizontal Guide Levels: Back Panel ---
    { from: new Point2D(backCrotchTipX, yHipMm), to: new Point2D(backHipSideX, yHipMm), label: 'خط باسن پشت', type: 'guide' },
    { from: new Point2D(backCrotchTipX, yCrotchMm), to: new Point2D(backHipSideX, yCrotchMm), label: 'خط فاق پشت', type: 'guide' },
    { from: new Point2D(backCreaseMm - (kneeWidth / 2 + 3) * 10, yKneeMm), to: new Point2D(backCreaseMm + (kneeWidth / 2 + 3) * 10, yKneeMm), label: 'خط زانو پشت', type: 'guide' },
    { from: new Point2D(backCreaseMm - (hemWidth / 2 + 3) * 10, yHemMm), to: new Point2D(backCreaseMm + (hemWidth / 2 + 3) * 10, yHemMm), label: 'خط دمپا پشت', type: 'guide' },

    // --- Fly Facing (سجاف و نقاب زیپ) ---
    { from: new Point2D(xCF - 35, 0), to: new Point2D(xCF - 35, 170), label: 'سجاف و نقاب زیپ', type: 'guide' },
    { from: new Point2D(xCF - 35, 0), to: new Point2D(xCF, 0), label: 'نقاب زیپ', type: 'guide' },
    { from: new Point2D(xCF - 35, 170), to: new Point2D(xCF, 200), label: 'انحنای نقاب زیپ', type: 'guide' },

    // --- Front Waist Dart Guides ---
    { from: new Point2D(xCreaseMm - 10, 0), to: new Point2D(xCreaseMm, 90), label: 'پنس کمر پیش', type: 'guide' },
    { from: new Point2D(xCreaseMm + 10, 0), to: new Point2D(xCreaseMm, 90), label: 'پنس کمر پیش', type: 'guide' },

    // --- Back Waist Dart Guides ---
    { from: new Point2D(backDartMidX - 12.5, backDartMidY), to: new Point2D(backDartMidX, backDartMidY + 100), label: 'پنس کمر پشت', type: 'guide' },
    { from: new Point2D(backDartMidX + 12.5, backDartMidY), to: new Point2D(backDartMidX, backDartMidY + 100), label: 'پنس کمر پشت', type: 'guide' },
  ];

  // Contours (true cut outline SVG paths for Front and Back trouser pieces)
  const frontContour = [
    `M ${xCF.toFixed(1)} 0`,
    `L ${frontWaistSideX.toFixed(1)} 0`,
    `Q ${(xSideHip + 2).toFixed(1)} ${(yHipMm / 2).toFixed(1)}, ${xSideHip.toFixed(1)} ${yHipMm.toFixed(1)}`,
    `L ${xSideHip.toFixed(1)} ${yCrotchMm.toFixed(1)}`,
    `L ${points.frontKneeRight.x.toFixed(1)} ${points.frontKneeRight.y.toFixed(1)}`,
    `L ${points.frontHemRight.x.toFixed(1)} ${points.frontHemRight.y.toFixed(1)}`,
    `L ${points.frontHemLeft.x.toFixed(1)} ${points.frontHemLeft.y.toFixed(1)}`,
    `L ${points.frontKneeLeft.x.toFixed(1)} ${points.frontKneeLeft.y.toFixed(1)}`,
    `Q ${(points.frontKneeLeft.x - 4).toFixed(1)} ${(yCrotchMm + (yKneeMm - yCrotchMm) * 0.45).toFixed(1)}, ${points.frontCrotchTip.x.toFixed(1)} ${points.frontCrotchTip.y.toFixed(1)}`,
    `Q ${(xCF * 0.35).toFixed(1)} ${yCrotchMm.toFixed(1)}, ${xCF.toFixed(1)} ${yHipMm.toFixed(1)}`,
    `L ${xCF.toFixed(1)} 0`,
    'Z',
  ].join(' ');

  const backContour = [
    `M ${backWaistCBX.toFixed(1)} ${backWaistCBY.toFixed(1)}`,
    `L ${backWaistSideX.toFixed(1)} ${backWaistSideY.toFixed(1)}`,
    `Q ${(backHipSideX + 2).toFixed(1)} ${(yHipMm / 2).toFixed(1)}, ${backHipSideX.toFixed(1)} ${yHipMm.toFixed(1)}`,
    `L ${backHipSideX.toFixed(1)} ${yCrotchMm.toFixed(1)}`,
    `L ${points.backKneeRight.x.toFixed(1)} ${points.backKneeRight.y.toFixed(1)}`,
    `L ${backHemRightX.toFixed(1)} ${yHemMm.toFixed(1)}`,
    `L ${backHemLeftX.toFixed(1)} ${yHemMm.toFixed(1)}`,
    `L ${points.backKneeLeft.x.toFixed(1)} ${points.backKneeLeft.y.toFixed(1)}`,
    `Q ${(points.backKneeLeft.x - 6).toFixed(1)} ${(yCrotchMm + (yKneeMm - yCrotchMm) * 0.45).toFixed(1)}, ${points.backCrotchTip.x.toFixed(1)} ${points.backCrotchTip.y.toFixed(1)}`,
    `C ${(points.backCrotchTip.x + 40).toFixed(1)} ${(yCrotchMm - 5).toFixed(1)}, ${(backWaistCBX - 15).toFixed(1)} ${(yHipMm + 20).toFixed(1)}, ${backWaistCBX.toFixed(1)} ${backWaistCBY.toFixed(1)}`,
    'Z',
  ].join(' ');

  const contours = [frontContour, backContour];

  const steps = [
    {
      stepIndex: 0,
      titleFa: 'کادربندی مستطیل اولیه و خطوط تراز (فاق، زانو و دمپا)',
      instructionFa: `بلندی فاق ${(crotchDepth).toFixed(1)} سانتی‌متر و خط اتو در مرکز کادر شلوار پیش (${(xCrease).toFixed(1)} سانتی‌متر) تعیین شد.`,
      calculatedValues: { 'بلندی فاق': `${crotchDepth} cm`, 'خط اتو': `${(xCrease).toFixed(1)} cm`, 'خط زانو': `${(yKnee).toFixed(1)} cm` },
      elements: ['frontCreaseWaist', 'frontCrotchTip', 'frontCreaseHem'],
    },
    {
      stepIndex: 1,
      titleFa: 'محاسبه نقاب فاق پیش و نقاب فاق پشت',
      instructionFa: `نقاب فاق جلو ${(ExtFront).toFixed(1)} سانتی‌متر و نقاب فاق پشت ${(ExtBack).toFixed(1)} سانتی‌متر محاسبه گردید.`,
      calculatedValues: { 'نقاب فاق جلو': `${(ExtFront).toFixed(1)} cm`, 'نقاب فاق پشت': `${(ExtBack).toFixed(1)} cm` },
      elements: ['frontCrotchTip', 'backCrotchTip'],
    },
    {
      stepIndex: 2,
      titleFa: 'رسم خطوط پیش شلوار (خط اتو، زانو، دمپا، نقاب زیپ و پنس)',
      instructionFa: `عرض زانو ${(kneeWidth).toFixed(1)} سانتی‌متر و عرض دمپا ${(hemWidth).toFixed(1)} سانتی‌متر متقارن حول خط اتو رسم شده و سجاف زیپ به عرض ۳.۵ سانتی‌متر اضافه شد.`,
      calculatedValues: { 'عرض زانو پیش': `${kneeWidth} cm`, 'عرض دمپا پیش': `${hemWidth} cm`, 'پهنای سجاف زیپ': '3.5 cm' },
      elements: ['frontKneeLeft', 'frontKneeRight', 'frontHemLeft', 'frontHemRight', 'frontDartTip', 'flyFacingTop', 'flyFacingBottom'],
    },
    {
      stepIndex: 3,
      titleFa: 'کادربندی قطعه پشت شلوار و بلندی فاق پشت (نقطه ۴۶)',
      instructionFa: `قطعه پشت شلوار در کنار پیش کادربندی شده و خط کمر پشت به میزان ۳.۵ سانتی‌متر برای فرم نشستن اندام بالا کشیده شد (نقطه ۴۶).`,
      calculatedValues: { 'بلندی فاق پشت': '3.5 cm', 'شیب خط وسط پشت': '2.5 cm' },
      elements: ['backWaistCB', 'backWaistSide', 'backCreaseWaist', 'backCreaseHem'],
    },
    {
      stepIndex: 4,
      titleFa: 'تکمیل انحنای فاق پشت، درز زیر پا، پهلو و پنس کمر پشت',
      instructionFa: `انحنای عمیق فاق پشت با افت ۱۰ میلی‌متری رسم گردید و طول درز داخل پای پشت ۱۲ میلی‌متر کوتاه‌تر جهت خرد و اتوکاری لحاظ شد.`,
      calculatedValues: { 'درز داخل پای پشت': `${(backInseamTarget).toFixed(1)} mm`, 'افت فاق پشت': '10 mm' },
      elements: ['backCrotchTip', 'backKneeLeft', 'backKneeRight', 'backHemLeft', 'backHemRight', 'backDartTip'],
    },
  ];

  const totalWidth = Math.ceil(backHipSideX + 40);

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
    boundingBox: { minX: 0, minY: -40, width: totalWidth, height: yHemMm + 60 },
    constructionLines,
    contours,
    grainlines,
    darts,
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

/**
 * 6. CENTRAL PATTERN DISPATCHER (for test harness parity)
 */
export function draftPattern(input) {
  const { blockType, method = 'MULLER', measurements = {}, postureAdjustments = {}, fitPreference = 'CLASSIC' } = input;

  let baseResult;
  switch (blockType) {
    case 'SKIRT':
      baseResult = draftBasicSkirt(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    case 'BODICE':
      baseResult = draftBasicBodice(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    case 'SLEEVE': {
      const bodiceRef = draftBasicBodice(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      baseResult = draftBasicSleeve(bodiceRef, measurements);
      break;
    }

    case 'TROUSER':
      baseResult = draftBasicTrouser(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    default:
      throw new Error(`Unsupported pattern block type: ${blockType}`);
  }

  const boundingBox = baseResult.boundingBox || {
    minX: 0,
    minY: 0,
    width: 800,
    height: 1000,
  };

  return {
    ...baseResult,
    boundingBox,
    exportA4Pdf: () => exportA4TiledPdf(baseResult),
    exportA0Pdf: () => exportA0PlotterPdf(baseResult),
    exportSvg: () => generatePatternSvg(baseResult),
    exportDxf: () => generateAAMADxf(baseResult),
  };
}
