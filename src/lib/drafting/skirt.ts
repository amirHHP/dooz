/**
 * Dooz Drafting Engine - Basic Skirt Block
 */

import { Point2D, CubicBezier } from './geometry';
import { getFitEase } from './posture';
import { ConstructionLine, ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

export interface SkirtMeasurements {
  waist?: number;
  hip?: number;
  hipDepth?: number;
  skirtLength?: number;
  [key: string]: number | undefined;
}

export interface SkirtDraftOptions {
  method?: DraftingMethod;
  fitPreference?: FitPreference;
  posture?: PostureAdjustments;
}

export interface SkirtDraftResult {
  blockType: 'SKIRT';
  method: DraftingMethod;
  fitPreference: FitPreference;
  Wblock: number;
  Wtarget: number;
  deltaW: number;
  Wfront: number;
  Wback: number;
  Sside: number;
  Dback: number;
  Dfront: number;
  backDartCount: number;
  backDartWidths: number[];
  points: Record<string, Point2D>;
  backHipCurve: CubicBezier;
  backSideSeamLength: number;
  frontSideSeamLength: number;
  steps: ConstructionStep[];
  boundingBox: { minX: number; minY: number; width: number; height: number };
  constructionLines: ConstructionLine[];
  contours: string[];
  grainlines?: Array<{ from: Point2D; to: Point2D }>;
  darts?: Array<Array<Point2D>>;
}

export function draftBasicSkirt(
  measurements: SkirtMeasurements,
  options: SkirtDraftOptions = {}
): SkirtDraftResult {
  const {
    waist = 70.0,
    hip = 94.0,
    hipDepth = 20.0,
    skirtLength = 65.0,
  } = measurements;

  const validMethods: DraftingMethod[] = ['MULLER', 'METRIC', 'GRLAWEIN'];
  const method: DraftingMethod = validMethods.includes(options.method as DraftingMethod)
    ? (options.method as DraftingMethod)
    : 'MULLER';
  const fitPreference: FitPreference = options.fitPreference || 'CLASSIC';
  const posture: PostureAdjustments = options.posture || {};

  const ease = getFitEase(fitPreference);
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
  const points: Record<string, Point2D> = {
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
  const steps: ConstructionStep[] = [
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

  let backDartElements: Array<Array<Point2D>> = [];
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

  const frontDartElements: Array<Point2D> = [
    new Point2D(frontDartCenterX - frontDartHalfWidth, cfWaistDeltaY * 10),
    new Point2D(frontDartCenterX, dartTipYFront),
    new Point2D(frontDartCenterX + frontDartHalfWidth, cfWaistDeltaY * 10),
  ];

  // Construction lines
  const constructionLines: ConstructionLine[] = [
    // Initial bounding frame (کادر مستطیل اولیه)
    { from: new Point2D(0, 0), to: new Point2D(blockWidthMm, 0), label: 'خط کمر کادر اولیه', type: 'frame' },
    { from: new Point2D(0, blockHeightMm), to: new Point2D(blockWidthMm, blockHeightMm), label: 'خط لبه دامن (پای دامن)', type: 'frame' },
    { from: new Point2D(0, 0), to: new Point2D(0, blockHeightMm), label: 'خط راستای وسط پشت (CB)', type: 'frame' },
    { from: new Point2D(blockWidthMm, 0), to: new Point2D(blockWidthMm, blockHeightMm), label: 'خط راستای وسط جلو (CF)', type: 'frame' },
    // Horizontal guide level
    { from: new Point2D(0, hipDepthMm), to: new Point2D(blockWidthMm, hipDepthMm), label: 'خط باسن بزرگ', type: 'guide' },
    // Vertical balance / division axis
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
