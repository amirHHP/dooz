/**
 * Dooz Drafting Engine - Basic Skirt Block
 */

import { Point2D, CubicBezier } from './geometry';
import { getFitEase } from './posture';
import { ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

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
