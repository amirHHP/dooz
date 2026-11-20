/**
 * Dooz Drafting Engine - Basic Trouser Block
 * Standard Müller & Sohn Tailoring Method (Front & Back Panels Side-by-Side)
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
  boundingBox: { minX: number; minY: number; width: number; height: number };
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
  const points: Record<string, Point2D> = {
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
  const constructionLines: ConstructionLine[] = [
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

  const steps: ConstructionStep[] = [
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
