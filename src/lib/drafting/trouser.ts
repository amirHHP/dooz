/**
 * Dooz Drafting Engine - Basic Trouser Block
 */

import { Point2D } from './geometry';
import { getFitEase } from './posture';
import { ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

export interface TrouserMeasurements {
  waist?: number;
  hip?: number;
  trouserLength?: number;
  crotchDepth?: number;
  kneeWidth?: number;
  hemWidth?: number;
  [key: string]: number | undefined;
}

export interface TrouserDraftOptions {
  method?: DraftingMethod;
  fitPreference?: FitPreference;
  posture?: PostureAdjustments;
}

export interface TrouserDraftResult {
  blockType: 'TROUSER';
  method: DraftingMethod;
  WfrontHip: number;
  ExtFront: number;
  ExtBack: number;
  xCrease: number;
  inseam: number;
  yKnee: number;
  frontInseamUpper: number;
  backInseamUpper: number;
  backInseamTarget: number;
  points: Record<string, Point2D>;
  steps: ConstructionStep[];
  boundingBox?: { minX: number; minY: number; width: number; height: number };
}

export function draftBasicTrouser(
  measurements: TrouserMeasurements,
  options: TrouserDraftOptions = {}
): TrouserDraftResult {
  const {
    waist = 70.0,
    hip = 94.0,
    trouserLength = 102.0,
    crotchDepth = 26.0,
    kneeWidth = 22.0,
    hemWidth = 20.0,
  } = measurements;

  const method: DraftingMethod = options.method || 'MULLER';
  const fitPreference: FitPreference = options.fitPreference || 'CLASSIC';
  const ease = getFitEase(fitPreference);
  const Eh = ease.hip;

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

  const points: Record<string, Point2D> = {
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

  const steps: ConstructionStep[] = [
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
    boundingBox: { minX: -ExtBack * 10, minY: 0, width: (WfrontHip + ExtFront + ExtBack) * 10 + 20, height: yHemMm + 20 },
  };
}
