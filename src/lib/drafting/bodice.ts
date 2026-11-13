/**
 * Dooz Drafting Engine - Basic Fitted Bodice Block
 */

import { Point2D } from './geometry';
import { getFitEase } from './posture';
import { ConstructionStep, DraftingMethod, FitPreference, PostureAdjustments } from '@/types/drafting';

export interface BodiceMeasurements {
  bust?: number;
  waist?: number;
  hip?: number;
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
}

export function draftBasicBodice(
  measurements: BodiceMeasurements,
  options: BodiceDraftOptions = {}
): BodiceDraftResult {
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

  const effectiveFL = options.frontLength ?? frontLength;
  const effectiveBL = options.backLength ?? backLength;

  const method: DraftingMethod = options.method || 'MULLER';
  const fitPreference: FitPreference = options.fitPreference || 'CLASSIC';
  const posture: PostureAdjustments = options.posture || {};

  const ease = getFitEase(fitPreference);
  const Eb = ease.bust;
  const Ew = ease.waist;

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

  const points: Record<string, Point2D> = {
    nape: new Point2D(0, 0),
    backNeck: new Point2D(Hw * 10, -20),
    backShoulderTip: new Point2D((Rb + 1.0) * 10, (Da / 3 + shoulderTipDrop) * 10),
    underarmLevel: new Point2D(0, (Da + underarmDrop) * 10),
    sideSeamUnderarm: new Point2D((Rb + Ad / 2) * 10, (Da + underarmDrop) * 10),
    bustApex: new Point2D((Wblock - bustSpan / 2) * 10, bustHeight * 10),
    cfWaist: new Point2D(Wblock * 10, (effectiveBL + frontLengthOffset) * 10),
    cbWaist: new Point2D(posture.swayback ? 15 : 0, effectiveBL * 10),
  };

  const steps: ConstructionStep[] = [
    {
      stepIndex: 0,
      titleFa: 'رسم خطوط مبنا و کادر بالاتنه',
      instructionFa: `کادر بالاتنه به عرض ${(Wblock).toFixed(1)} سانتی‌متر و قد پشت ${(effectiveBL).toFixed(1)} سانتی‌متر رسم شد.`,
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
    boundingBox: { minX: 0, minY: -20, width: Wblock * 10, height: (effectiveBL + frontLengthOffset) * 10 + 20 },
  };
}
