/**
 * Dooz Drafting Engine - Basic Sleeve Block
 * Standard Müller & Sohn Tailoring Method (Points 1..23)
 */

import { Point2D, CubicBezier } from './geometry';
import { getFitEase } from './posture';
import { BodiceDraftResult } from './bodice';
import { ConstructionStep, DraftingMethod, FitPreference } from '@/types/drafting';

export interface ConstructionLine {
  from: Point2D;
  to: Point2D;
  label?: string;
  type?: 'frame' | 'guide' | 'axis';
}

export interface SleeveMeasurements {
  sleeveLength?: number;
  armCirc?: number;
  wristCirc?: number;
  [key: string]: number | undefined;
}

export interface SleeveDraftResult {
  blockType: 'SLEEVE';
  method: DraftingMethod;
  CapHeight: number;
  BW: number;
  AHtot: number;
  LcapCm: number;
  capEaseCm: number;
  points: {
    crownApex: Point2D;
    uBack: Point2D;
    uFront: Point2D;
    centerWrist: Point2D;
    wristBack: Point2D;
    wristFront: Point2D;
    elbowBack: Point2D;
    elbowFront: Point2D;
    elbowCenter: Point2D;
    frameTopLeft: Point2D;
    frameTopRight: Point2D;
    frameBottomLeft: Point2D;
    frameBottomRight: Point2D;
    point8: Point2D;
    point9: Point2D;
    point10: Point2D;
    point11: Point2D;
    point12: Point2D;
    point13: Point2D;
    point19: Point2D;
    point20: Point2D;
    point22: Point2D;
    point23: Point2D;
    slitBottom: Point2D;
    slitTop: Point2D;
    [key: string]: Point2D;
  };
  backScoop: CubicBezier;
  backCrown: CubicBezier;
  frontCrown: CubicBezier;
  frontScoop: CubicBezier;
  constructionLines: ConstructionLine[];
  contours: string[];
  steps: ConstructionStep[];
  boundingBox: { minX: number; minY: number; width: number; height: number };
}

export function draftBasicSleeve(
  bodiceResult: BodiceDraftResult,
  sleeveParams: SleeveMeasurements = {}
): SleeveDraftResult {
  const {
    sleeveLength = 58.0,
    armCirc = 27.5,
    wristCirc = 16.0,
  } = sleeveParams;

  const method: DraftingMethod = bodiceResult.method || 'MULLER';
  const fitPreference: FitPreference = bodiceResult.fitPreference || 'CLASSIC';
  const AHtot = bodiceResult.totalArmholePerimeter;
  const AHd = bodiceResult.Da;

  const ease = getFitEase(fitPreference);
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

  // Crown apex coordinate (slanted toward back by 0.52 for natural pitch)
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
  // Back cap diagonal from uBack to crownApex
  const dxBack = crownApex.x - uBack.x;
  const dyBack = crownApex.y - uBack.y;
  const lenBack = Math.hypot(dxBack, dyBack);
  const uxBack = lenBack > 0 ? dxBack / lenBack : 0;
  const uyBack = lenBack > 0 ? dyBack / lenBack : 0;
  // Outward normal for back crown (up and left)
  const nOutBack = new Point2D(uyBack, -uxBack);

  const point8 = new Point2D(uBack.x + 0.25 * dxBack, uBack.y + 0.25 * dyBack, 'نقطه ۸ (۱/۴ هلال پشت)');
  const point9 = new Point2D(uBack.x + 0.50 * dxBack, uBack.y + 0.50 * dyBack, 'نقطه ۹ (وسط شیب پشت)');
  const point10 = new Point2D(uBack.x + 0.75 * dxBack, uBack.y + 0.75 * dyBack, 'نقطه ۱۰ (۳/۴ هلال پشت)');

  // Front cap diagonal from crownApex to uFront
  const dxFront = uFront.x - crownApex.x;
  const dyFront = uFront.y - crownApex.y;
  const lenFront = Math.hypot(dxFront, dyFront);
  const uxFront = lenFront > 0 ? dxFront / lenFront : 0;
  const uyFront = lenFront > 0 ? dyFront / lenFront : 0;
  // Outward normal for front crown (up and right)
  const nOutFront = new Point2D(uyFront, -uxFront);

  const point11 = new Point2D(crownApex.x + 0.25 * dxFront, crownApex.y + 0.25 * dyFront, 'نقطه ۱۱ (۱/۴ هلال جلو)');
  const point12 = new Point2D(crownApex.x + 0.50 * dxFront, crownApex.y + 0.50 * dyFront, 'نقطه ۱۲ (وسط شیب جلو)');
  const point13 = new Point2D(crownApex.x + 0.75 * dxFront, crownApex.y + 0.75 * dyFront, 'نقطه ۱۳ (۳/۴ هلال جلو)');

  // Curve control perpendicular offsets (نقاط کنترل تحدب و تقعر بر اساس متد مولر)
  // Point 19: scoop back inward (~10mm)
  const point19 = new Point2D(point8.x - 10 * nOutBack.x, point8.y - 10 * nOutBack.y, 'نقطه ۱۹ (گودی هلال پشت)');
  // Point 20: crown back outward (~18mm)
  const point20 = new Point2D(point10.x + 18 * nOutBack.x, point10.y + 18 * nOutBack.y, 'نقطه ۲۰ (برجستگی تاج پشت)');
  // Point 22: crown front outward (~18mm)
  const point22 = new Point2D(point11.x + 18 * nOutFront.x, point11.y + 18 * nOutFront.y, 'نقطه ۲۲ (برجستگی تاج جلو)');
  // Point 23: scoop front inward (~15mm deep scoop)
  const point23 = new Point2D(point13.x - 15 * nOutFront.x, point13.y - 15 * nOutFront.y, 'نقطه ۲۳ (گودی عمیق حلقه جلو)');

  // 5. Wrist Vent / Slit Markings (چاک آستین)
  // Standard tailoring vent on back panel at 1/4 distance from back side seam towards center
  const backWristSpan = centerWrist.x - wristBack.x;
  const slitX = wristBack.x + 0.25 * backWristSpan;
  const slitLengthMm = 80.0; // 8cm
  const slitBottom = new Point2D(slitX, sleeveLengthMm, 'پایین چاک آستین');
  const slitTop = new Point2D(slitX, sleeveLengthMm - slitLengthMm, 'بالای چاک آستین');

  // Construction lines
  const constructionLines: ConstructionLine[] = [
    // Initial Bounding Frame (کادر مستطیل اولیه)
    { from: frameTopLeft, to: frameTopRight, label: 'کادر مستطیل اولیه (لبه بالا)', type: 'frame' },
    { from: frameTopRight, to: frameBottomRight, label: 'کادر مستطیل اولیه (راست)', type: 'frame' },
    { from: frameBottomRight, to: frameBottomLeft, label: 'کادر مستطیل اولیه (لبه مچ)', type: 'frame' },
    { from: frameBottomLeft, to: frameTopLeft, label: 'کادر مستطیل اولیه (چپ)', type: 'frame' },

    // Center Balance & Grainline Axis (محور مرکزی و راستای پارچه)
    { from: crownApex, to: centerWrist, label: 'محور مرکزی و راستای پارچه', type: 'axis' },

    // Horizontal Guideline Levels (خطوط مبنا)
    { from: uBack, to: uFront, label: 'خط کف حلقه (عرض بازو)', type: 'guide' },
    { from: elbowBack, to: elbowFront, label: 'خط آرنج', type: 'guide' },
    { from: wristBack, to: wristFront, label: 'خط مچ', type: 'guide' },

    // Crown Guide Triangle Lines (مثلث راهنمای تاج)
    { from: uBack, to: crownApex, label: 'راهنمای تاج پشت (شیب پشت)', type: 'guide' },
    { from: crownApex, to: uFront, label: 'راهنمای تاج جلو (شیب جلو)', type: 'guide' },

    // Crown Division Perpendicular Guides (عمودهای راهنمای انحنا)
    { from: point8, to: point19, label: 'عمود گودی پشت (نقطه ۸ به ۱۹)', type: 'guide' },
    { from: point10, to: point20, label: 'عمود برجستگی پشت (نقطه ۱۰ به ۲۰)', type: 'guide' },
    { from: point11, to: point22, label: 'عمود برجستگی جلو (نقطه ۱۱ به ۲۲)', type: 'guide' },
    { from: point13, to: point23, label: 'عمود گودی جلو (نقطه ۱۳ به ۲۳)', type: 'guide' },

    // Underarm Seam Lines (خطوط درز زیر دست)
    { from: uBack, to: wristBack, label: 'درز زیر دست پشت', type: 'guide' },
    { from: uFront, to: wristFront, label: 'درز زیر دست جلو', type: 'guide' },

    // Wrist Slit Line (خط چاک آستین)
    { from: slitBottom, to: slitTop, label: 'خط چاک آستین', type: 'guide' },
  ];

  // Closed cut outline of the sleeve block:
  // Starts at uBack -> backScoop -> backCrown -> apex -> frontCrown -> frontScoop -> uFront
  // -> straight front underarm seam to wristFront -> straight hem to wristBack -> back underarm seam to uBack -> close.
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
    // Existing base points (strictly preserved)
    crownApex,
    uBack,
    uFront,

    // Sleeve body and lines
    centerWrist,
    wristBack,
    wristFront,
    elbowBack,
    elbowFront,
    elbowCenter,

    // Initial frame corners
    frameTopLeft,
    frameTopRight,
    frameBottomLeft,
    frameBottomRight,

    // Textbook points (1..23)
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

    // Shorthand aliases for convenience
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

    // Vent / slit
    slitBottom,
    slitTop,
  };

  const steps: ConstructionStep[] = [
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
