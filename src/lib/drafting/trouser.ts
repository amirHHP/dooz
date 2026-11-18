/**
 * Dooz Drafting Engine - Basic Trouser Block
 */

import { Point2D } from './geometry';
import { getFitEase } from './posture';
import { ConstructionLine, ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

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
  constructionLines: ConstructionLine[];
  contours: string[];
  grainlines?: Array<{ from: Point2D; to: Point2D }>;
  darts?: Array<Array<Point2D>>;
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

  const yHipMm = Math.max(0, (crotchDepth - 8.5) * 10);
  const xCF = ExtFront * 10;
  const xSideHip = (ExtFront + WfrontHip) * 10;
  const frontWaistSideX = xCreaseMm + ((WfrontHip - ExtFront) / 2 + 1) * 10;

  // Back trouser reference points
  const backWaistCBX = xCreaseMm - 20;
  const backWaistCBY = -25;
  const backWaistSideX = xCreaseMm + ((WfrontHip - ExtFront) / 2 + 3.5) * 10;
  const backWaistSideY = 0;
  const backHipSideX = (ExtFront + WfrontHip + 2.0) * 10;
  const backHemLeftX = xCreaseMm - (hemWidth / 2 + 1.0) * 10;
  const backHemRightX = xCreaseMm + (hemWidth / 2 + 1.0) * 10;

  // Initial rectangular frame width and bounds
  const frameWidthMm = (ExtFront + WfrontHip) * 10;

  // Construction lines
  const constructionLines: ConstructionLine[] = [
    // Initial bounding frame (کادر مستطیل اولیه)
    { from: new Point2D(0, 0), to: new Point2D(frameWidthMm, 0), label: 'خط کمر کادر اولیه', type: 'frame' },
    { from: new Point2D(0, yHemMm), to: new Point2D(frameWidthMm, yHemMm), label: 'خط لبه دمپا کادر', type: 'frame' },
    { from: new Point2D(0, 0), to: new Point2D(0, yHemMm), label: 'خط مبنای پیش (راستای فاق)', type: 'frame' },
    { from: new Point2D(frameWidthMm, 0), to: new Point2D(frameWidthMm, yHemMm), label: 'خط مبنای پهلو', type: 'frame' },
    // Horizontal guide levels
    { from: new Point2D(-ExtBack * 10, yHipMm), to: new Point2D(backHipSideX, yHipMm), label: 'خط باسن', type: 'guide' },
    { from: new Point2D(-ExtBack * 10, yCrotchMm), to: new Point2D(backHipSideX, yCrotchMm), label: 'خط فاق', type: 'guide' },
    { from: new Point2D(xCreaseMm - (kneeWidth / 2 + 2) * 10, yKneeMm), to: new Point2D(xCreaseMm + (kneeWidth / 2 + 2) * 10, yKneeMm), label: 'خط زانو', type: 'guide' },
    { from: new Point2D(xCreaseMm - (hemWidth / 2 + 2) * 10, yHemMm), to: new Point2D(xCreaseMm + (hemWidth / 2 + 2) * 10, yHemMm), label: 'خط لبه دمپا', type: 'guide' },
    // Vertical balance / crease axes
    { from: new Point2D(xCreaseMm, 0), to: new Point2D(xCreaseMm, yHemMm), label: 'خط اتو و تعادل (راستای پارچه)', type: 'axis' },
    { from: new Point2D(xCF, 0), to: new Point2D(xCF, yCrotchMm), label: 'خط عمود فاق پیش', type: 'guide' },
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
    `C ${(points.backCrotchTip.x + 10).toFixed(1)} ${(yCrotchMm - 10).toFixed(1)}, ${(xCF - 10).toFixed(1)} ${(yHipMm + 10).toFixed(1)}, ${backWaistCBX.toFixed(1)} ${backWaistCBY.toFixed(1)}`,
    'Z',
  ].join(' ');

  const contours = [frontContour, backContour];

  const backDartX = (backWaistCBX + backWaistSideX) / 2;
  const backDartY = (backWaistCBY + backWaistSideY) / 2;
  const darts = [
    [new Point2D(backDartX - 10, backDartY), new Point2D(backDartX, backDartY + 80), new Point2D(backDartX + 10, backDartY)],
  ];

  const grainlines = [
    { from: new Point2D(xCreaseMm, 20), to: new Point2D(xCreaseMm, yHemMm - 20) },
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
    constructionLines,
    contours,
    grainlines,
    darts,
  };
}
