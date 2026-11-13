/**
 * Dooz Drafting Engine - Basic Sleeve Block
 */

import { Point2D, CubicBezier } from './geometry';
import { getFitEase } from './posture';
import { BodiceDraftResult } from './bodice';
import { ConstructionStep, DraftingMethod, FitPreference } from '@/types/drafting';

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
  points: { crownApex: Point2D; uBack: Point2D; uFront: Point2D; [key: string]: Point2D };
  backScoop: CubicBezier;
  backCrown: CubicBezier;
  frontCrown: CubicBezier;
  frontScoop: CubicBezier;
  steps: ConstructionStep[];
  boundingBox?: { minX: number; minY: number; width: number; height: number };
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
  const wristWidthMm = (wristCirc + 4.0) * 10;
  const sleeveLengthMm = sleeveLength * 10;

  // Crown apex coordinate (slanted toward back by 0.52 for natural pitch)
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

  const steps: ConstructionStep[] = [
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
    boundingBox: { minX: 0, minY: 0, width: bicepWidthMm, height: sleeveLengthMm },
  };
}
