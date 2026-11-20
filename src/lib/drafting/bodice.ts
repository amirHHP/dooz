/**
 * Dooz Drafting Engine - Basic Fitted Bodice Block (Müller Method)
 */

import { Point2D } from './geometry';
import { getFitEase } from './posture';
import { ConstructionLine, ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

export interface BodiceMeasurements {
  bust?: number;
  waist?: number;
  hip?: number;
  hipDepth?: number;
  backLength?: number;
  frontLength?: number;
  acrossBack?: number;
  acrossFront?: number;
  neck?: number;
  shoulder?: number;
  bustHeight?: number;
  bustSpan?: number;
  [key: string]: number | undefined;
}

export interface BodiceDraftOptions {
  method?: DraftingMethod;
  fitPreference?: FitPreference;
  posture?: PostureAdjustments;
  frontLength?: number;
  backLength?: number;
}

export interface BodiceDraftResult {
  blockType: 'BODICE';
  method: DraftingMethod;
  fitPreference: FitPreference;
  Wblock: number;
  Da: number;
  Hw: number;
  Rb: number;
  Ad: number;
  Bb: number;
  Dbust: number;
  deltaW: number;
  cbSuppression: number;
  backDartWidth: number;
  sideSeamSuppression: number;
  frontDartWidth: number;
  totalArmholePerimeter: number;
  points: Record<string, Point2D>;
  steps: ConstructionStep[];
  boundingBox?: { minX: number; minY: number; width: number; height: number };
  constructionLines: ConstructionLine[];
  contours: string[];
  grainlines?: Array<{ from: Point2D; to: Point2D }>;
  darts?: Array<Array<Point2D>>;
}

export function draftBasicBodice(
  measurements: BodiceMeasurements,
  options: BodiceDraftOptions = {}
): BodiceDraftResult {
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

  const method: DraftingMethod = options.method || 'MULLER';
  const fitPreference: FitPreference = options.fitPreference || 'CLASSIC';
  const posture: PostureAdjustments = options.posture || {};

  const ease = getFitEase(fitPreference);
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
  const points: Record<string, Point2D> = {
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

  const steps: ConstructionStep[] = [
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
  const constructionLines: ConstructionLine[] = [
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
