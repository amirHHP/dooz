'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Square, Tag, Layers, Bookmark } from 'lucide-react';
import { toPersianDigits } from '@/lib/format';

export interface ConstructionLineItem {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
  type?: 'frame' | 'guide' | 'axis' | string;
  stepIndex?: number;
}

export interface StudioCanvasProps {
  draftResult: {
    blockType?: string;
    boundingBox: { minX: number; minY: number; width: number; height: number };
    points: Record<string, { x: number; y: number; label?: string }>;
    curves?: Record<string, { p0: any; c1: any; c2: any; p3: any }>;
    constructionLines?: ConstructionLineItem[];
    contours?: string[];
    grainlines?: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
    notches?: Array<{ x: number; y: number }>;
    darts?: Array<Array<{ x: number; y: number }>>;
    steps?: Array<{
      stepIndex: number;
      titleFa: string;
      instructionFa: string;
      calculatedValues?: Record<string, string | number>;
      elements?: string[];
    }>;
    [key: string]: any;
  };
  currentStepIndex: number;
  showAll: boolean;
  activeElements?: string[];
}

const POINT_LABELS_FA: Record<string, string> = {
  // Bodice / Torso / General
  cbWaist: 'کمر پشت (CB)',
  cbHip: 'باسن پشت (CB)',
  cbHem: 'پایین پشت (CB)',
  cbNeck: 'طوق گردن پشت',
  nape: 'مهره هفتم گردن',
  backNeck: 'گوشه گردن پشت',
  backShoulderTip: 'سرشانه پشت',
  shoulderApexBack: 'سرشانه پشت',
  shoulderApexFront: 'سرشانه جلو',
  frontShoulderTip: 'سرشانه جلو',
  frontNeckPit: 'گودی گردن جلو (CF)',
  frontNeck: 'گوشه گردن جلو',
  armpitBack: 'کف حلقه پشت',
  armpitFront: 'کف حلقه جلو',
  sideSeamUnderarm: 'کف حلقه پهلو',
  bustPoint: 'نوک سینه (BP)',
  bustApex: 'مرکز سینه (BP)',
  backDartApex: 'راس ساسون پشت',
  frontDartApex: 'راس ساسون جلو',
  cfWaist: 'کمر جلو (CF)',
  cfHip: 'باسن جلو (CF)',
  cfHem: 'پایین جلو (CF)',
  cfNeck: 'طوق گردن جلو',
  neckSide: 'گوشه گردن',
  sideWaistBack: 'پهلو کمر پشت',
  sideWaistFront: 'پهلو کمر جلو',
  sideHip: 'پهلو باسن',
  sideHem: 'پهلو پایین',

  // Skirt
  backDart: 'ساسون پشت',
  frontDart: 'ساسون جلو',

  // Sleeve
  crownApex: 'تاج آستین',
  uBack: 'زیر حلقه پشت',
  uFront: 'زیر حلقه جلو',
  elbowBack: 'آرنج پشت',
  elbowFront: 'آرنج جلو',
  elbowCenter: 'مرکز آرنج',
  wristBack: 'مچ پشت',
  wristFront: 'مچ جلو',
  centerWrist: 'مرکز مچ',
  bicepCenter: 'مرکز بازو',
  slitPoint: 'چاک آستین',
  slitBottom: 'چاک مچ',
  slitTop: 'انتهای چاک',
  point8: 'نقطه ۸ کمکی',
  point9: 'نقطه ۹ کمکی',
  point10: 'نقطه ۱۰ کمکی',
  point11: 'نقطه ۱۱ کمکی',
  point12: 'نقطه ۱۲ کمکی',
  point13: 'نقطه ۱۳ کمکی',
  pt8: 'نقطه ۸ کمکی',
  pt9: 'نقطه ۹ کمکی',
  pt10: 'نقطه ۱۰ کمکی',
  pt11: 'نقطه ۱۱ کمکی',
  pt12: 'نقطه ۱۲ کمکی',
  pt13: 'نقطه ۱۳ کمکی',
  point19: 'نقطه کنترل گودی پشت',
  point20: 'نقطه کنترل برآمدگی پشت',
  point22: 'نقطه کنترل تاج جلو',
  point23: 'نقطه کنترل گودی جلو',
  frameTopLeft: 'گوشه کادر بالا چپ',
  frameTopRight: 'گوشه کادر بالا راست',
  frameBottomLeft: 'گوشه کادر پایین چپ',
  frameBottomRight: 'گوشه کادر پایین راست',

  // Trouser
  crotchBack: 'فاق پشت',
  crotchFront: 'فاق جلو',
  kneeBack: 'زانو پشت',
  kneeFront: 'زانو جلو',
  hemBack: 'دمپا پشت',
  hemFront: 'دمپا جلو',
  creaseWaist: 'خط اتو کمر',
  creaseHem: 'خط اتو دمپا',
  frontCreaseWaist: 'خط اتو کمر پیش',
  frontCreaseHem: 'خط اتو دمپا پیش',
  frontCrotchTip: 'نقاب فاق پیش',
  frontKneeLeft: 'زانو داخل پیش',
  frontKneeRight: 'زانو پهلو پیش',
  frontHemLeft: 'دمپا داخل پیش',
  frontHemRight: 'دمپا پهلو پیش',
  backCreaseWaist: 'خط اتو کمر پشت',
  backCreaseHem: 'خط اتو دمپا پشت',
  backCrotchTip: 'نقاب فاق پشت',
  backKneeLeft: 'زانو داخل پشت',
  backKneeRight: 'زانو پهلو پشت',
  backHemLeft: 'دمپا داخل پشت',
  backHemRight: 'دمپا پهلو پشت',
  backWaistTip: 'بلندی فاق پشت',
};

function resolvePointLabel(id: string, explicitLabel?: string): string {
  if (explicitLabel && explicitLabel.trim()) {
    return explicitLabel;
  }
  return POINT_LABELS_FA[id] || id;
}

export function StudioCanvas({
  draftResult,
  currentStepIndex,
  showAll,
  activeElements = [],
}: StudioCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Floating controls toggles
  const [showInitialFrame, setShowInitialFrame] = useState(true);
  const [showRefLines, setShowRefLines] = useState(true);
  const [showPanelBadges, setShowPanelBadges] = useState(true);
  const [showPointLabels, setShowPointLabels] = useState(true);

  const clampZoom = useCallback((k: number) => {
    if (isNaN(k) || k === null) return 1.0;
    return Math.min(5.0, Math.max(0.2, Number(k)));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0015;
      setZoom((prev) => clampZoom(prev + zoomDelta));
    },
    [clampZoom]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const points = draftResult?.points || {};
  const steps = draftResult?.steps || [];
  const constructionLines = draftResult?.constructionLines || [];
  const hasFrameLinesInResult = constructionLines.some((l) => l.type === 'frame');

  // Detect pattern block type
  const detectedBlockType = useMemo(() => {
    if (draftResult?.blockType) {
      return draftResult.blockType.toUpperCase();
    }
    if (points.crownApex || points.wristBack || points.elbowBack) return 'SLEEVE';
    if (points.crotchFront || points.frontCrotchTip || points.frontCreaseWaist) return 'TROUSER';
    if (points.nape || points.bustApex || points.shoulderApexBack || points.sideSeamUnderarm) return 'BODICE';
    return 'SKIRT';
  }, [draftResult, points]);

  // Robust calculation of effective bounding box covering all points, lines, and hip extension
  const effectiveBB = useMemo(() => {
    let minX = draftResult?.boundingBox?.minX ?? 0;
    let minY = draftResult?.boundingBox?.minY ?? 0;
    let maxX = minX + (draftResult?.boundingBox?.width ?? 600);
    let maxY = minY + (draftResult?.boundingBox?.height ?? 800);

    // Encompass all drafting points
    if (points) {
      Object.values(points).forEach((pt) => {
        if (pt && typeof pt.x === 'number' && !isNaN(pt.x)) {
          minX = Math.min(minX, pt.x);
          maxX = Math.max(maxX, pt.x);
        }
        if (pt && typeof pt.y === 'number' && !isNaN(pt.y)) {
          minY = Math.min(minY, pt.y);
          maxY = Math.max(maxY, pt.y);
        }
      });
    }

    // Encompass construction lines
    if (constructionLines.length > 0) {
      constructionLines.forEach((line) => {
        if (line?.from && line?.to) {
          minX = Math.min(minX, line.from.x, line.to.x);
          maxX = Math.max(maxX, line.from.x, line.to.x);
          minY = Math.min(minY, line.from.y, line.to.y);
          maxY = Math.max(maxY, line.from.y, line.to.y);
        }
      });
    }

    // Encompass grainlines
    if (draftResult?.grainlines) {
      draftResult.grainlines.forEach((gl) => {
        if (gl?.from && gl?.to) {
          minX = Math.min(minX, gl.from.x, gl.to.x);
          maxX = Math.max(maxX, gl.from.x, gl.to.x);
          minY = Math.min(minY, gl.from.y, gl.to.y);
          maxY = Math.max(maxY, gl.from.y, gl.to.y);
        }
      });
    }

    const width = Math.max(100, maxX - minX);
    const height = Math.max(100, maxY - minY);

    return { minX, minY, maxX, maxY, width, height };
  }, [draftResult, points, constructionLines]);

  // SVG Viewport calculations with generous margin so reference line badges are never clipped
  const padX = 85;
  const padY = 55;
  const vbW = (effectiveBB.width + padX * 2) / zoom;
  const vbH = (effectiveBB.height + padY * 2) / zoom;
  const vbX = effectiveBB.minX - padX - pan.x;
  const vbY = effectiveBB.minY - padY - pan.y;

  // Progressive Step Element Calculation
  const { visibleElementSet, currentStepElementSet, isStepActive, isFinalStep } = useMemo(() => {
    if (showAll || !steps.length) {
      return {
        visibleElementSet: new Set<string>(),
        currentStepElementSet: new Set<string>(),
        isStepActive: false,
        isFinalStep: true,
      };
    }

    const vis = new Set<string>();
    const cur = new Set<string>();

    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      const s = steps[i];
      if (s?.elements) {
        s.elements.forEach((el) => {
          vis.add(el);
          if (i === currentStepIndex) {
            cur.add(el);
          }
        });
      }
    }

    activeElements.forEach((el) => cur.add(el));

    return {
      visibleElementSet: vis,
      currentStepElementSet: cur,
      isStepActive: true,
      isFinalStep: currentStepIndex >= steps.length - 1,
    };
  }, [steps, currentStepIndex, showAll, activeElements]);

  // CB and CF detection and geometry
  const cbCfInfo = useMemo(() => {
    const isCbCfApplicable = detectedBlockType === 'BODICE' || detectedBlockType === 'SKIRT';

    // Locate CB line in construction lines
    const cbLine = constructionLines.find(
      (l) => l.label && (l.label.includes('CB') || l.label.includes('مرکزی پشت') || l.label.includes('وسط پشت'))
    );

    // Locate CF line in construction lines
    const cfLine = constructionLines.find(
      (l) => l.label && (l.label.includes('CF') || l.label.includes('مرکزی جلو') || l.label.includes('وسط جلو'))
    );

    let cbX = 0;
    let cbYTop = 0;
    let cbYBottom = effectiveBB.maxY;

    if (cbLine) {
      cbX = cbLine.from.x;
      cbYTop = Math.min(cbLine.from.y, cbLine.to.y);
      cbYBottom = Math.max(cbLine.from.y, cbLine.to.y);
    } else {
      cbX = points.cbWaist?.x ?? points.cbHip?.x ?? points.nape?.x ?? effectiveBB.minX;
      cbYTop = points.nape?.y ?? points.cbNeck?.y ?? effectiveBB.minY;
      cbYBottom = points.cbHem?.y ?? points.cbHip?.y ?? points.cbWaist?.y ?? effectiveBB.maxY;
    }

    let cfX = effectiveBB.maxX;
    let cfYTop = 0;
    let cfYBottom = effectiveBB.maxY;

    if (cfLine) {
      cfX = cfLine.from.x;
      cfYTop = Math.min(cfLine.from.y, cfLine.to.y);
      cfYBottom = Math.max(cfLine.from.y, cfLine.to.y);
    } else {
      cfX = points.cfWaist?.x ?? points.cfHip?.x ?? points.frontNeckPit?.x ?? effectiveBB.maxX;
      cfYTop = points.frontNeckPit?.y ?? points.cfNeck?.y ?? points.cfWaist?.y ?? effectiveBB.minY;
      cfYBottom = points.cfHem?.y ?? points.cfHip?.y ?? points.cfWaist?.y ?? effectiveBB.maxY;
    }

    return {
      active: isCbCfApplicable,
      cb: { x: cbX, yTop: cbYTop, yBottom: cbYBottom },
      cf: { x: cfX, yTop: cfYTop, yBottom: cfYBottom },
    };
  }, [detectedBlockType, constructionLines, points, effectiveBB]);

  // Horizontal Reference Levels: Armhole, Waist, Hip (and Crotch/Knee/Hem for Trouser)
  const horizontalLevels = useMemo(() => {
    const levels: Array<{
      id: string;
      y: number;
      label: string;
      color: string;
      bgColor: string;
    }> = [];

    // 1. Armhole Level (خط کف حلقه آستین)
    const armholeLine = constructionLines.find(
      (l) => l.label && (l.label.includes('کف حلقه') || l.label.includes('حلقه آستین'))
    );
    let armholeY: number | null = null;
    if (armholeLine) {
      armholeY = (armholeLine.from.y + armholeLine.to.y) / 2;
    } else if (points.armpitBack?.y !== undefined) {
      armholeY = points.armpitBack.y;
    } else if (points.armpitFront?.y !== undefined) {
      armholeY = points.armpitFront.y;
    } else if (points.sideSeamUnderarm?.y !== undefined) {
      armholeY = points.sideSeamUnderarm.y;
    } else if (draftResult.Da) {
      armholeY = Number(draftResult.Da) * 10;
    }

    if (armholeY !== null && detectedBlockType === 'BODICE') {
      levels.push({
        id: 'level-armhole',
        y: armholeY,
        label: 'خط کف حلقه آستین',
        color: '#4F46E5', // Indigo
        bgColor: 'rgba(238, 242, 255, 0.95)',
      });
    }

    // 2. Waist Level (خط کمر)
    const waistLine = constructionLines.find(
      (l) => l.label && l.label.includes('خط کمر')
    );
    let waistY: number | null = null;
    if (waistLine) {
      waistY = (waistLine.from.y + waistLine.to.y) / 2;
    } else if (points.cbWaist?.y !== undefined) {
      waistY = points.cbWaist.y;
    } else if (points.cfWaist?.y !== undefined) {
      waistY = points.cfWaist.y;
    } else if (detectedBlockType === 'SKIRT') {
      waistY = 0;
    }

    if (waistY !== null && (detectedBlockType === 'BODICE' || detectedBlockType === 'SKIRT')) {
      levels.push({
        id: 'level-waist',
        y: waistY,
        label: 'خط کمر',
        color: '#0284C7', // Sky Blue
        bgColor: 'rgba(240, 249, 255, 0.95)',
      });
    }

    // 3. Hip Level (خط باسن)
    const hipLine = constructionLines.find(
      (l) => l.label && l.label.includes('خط باسن')
    );
    let hipY: number | null = null;
    if (hipLine) {
      hipY = (hipLine.from.y + hipLine.to.y) / 2;
    } else if (points.sideHip?.y !== undefined) {
      hipY = points.sideHip.y;
    } else if (points.cbHip?.y !== undefined) {
      hipY = points.cbHip.y;
    } else if (points.cfHip?.y !== undefined) {
      hipY = points.cfHip.y;
    } else if (waistY !== null && draftResult.hipDepth) {
      hipY = waistY + Number(draftResult.hipDepth) * 10;
    }

    if (hipY !== null && (detectedBlockType === 'BODICE' || detectedBlockType === 'SKIRT' || detectedBlockType === 'TROUSER')) {
      levels.push({
        id: 'level-hip',
        y: hipY,
        label: 'خط باسن',
        color: '#D97706', // Amber / Ochre
        bgColor: 'rgba(255, 251, 235, 0.95)',
      });
    }

    // 4. Trouser additional levels: Crotch, Knee, Hem
    if (detectedBlockType === 'TROUSER') {
      const crotchLine = constructionLines.find((l) => l.label && l.label.includes('خط فاق'));
      if (crotchLine) {
        levels.push({
          id: 'level-crotch',
          y: (crotchLine.from.y + crotchLine.to.y) / 2,
          label: 'خط فاق',
          color: '#7C3AED',
          bgColor: 'rgba(245, 243, 255, 0.95)',
        });
      }

      const kneeLine = constructionLines.find((l) => l.label && l.label.includes('خط زانو'));
      if (kneeLine) {
        levels.push({
          id: 'level-knee',
          y: (kneeLine.from.y + kneeLine.to.y) / 2,
          label: 'خط زانو',
          color: '#475569',
          bgColor: 'rgba(248, 250, 252, 0.95)',
        });
      }

      const hemLine = constructionLines.find((l) => l.label && l.label.includes('دمپا'));
      if (hemLine) {
        levels.push({
          id: 'level-hem',
          y: (hemLine.from.y + hemLine.to.y) / 2,
          label: 'خط لبه دمپا',
          color: '#475569',
          bgColor: 'rgba(248, 250, 252, 0.95)',
        });
      }
    }

    return levels;
  }, [constructionLines, points, detectedBlockType, draftResult]);

  // Panel Identification Badges (chips for pieces)
  const panelBadges = useMemo(() => {
    const badges: Array<{
      id: string;
      x: number;
      y: number;
      title: string;
      subtitle?: string;
      theme: 'indigo' | 'emerald' | 'purple' | 'sky';
    }> = [];

    if (detectedBlockType === 'BODICE') {
      // Bodice pieces: Back (CB) and Front (CF)
      const backPts = [
        points.nape,
        points.backNeck,
        points.backShoulderTip,
        points.cbWaist,
        points.armpitBack,
        points.sideWaistBack,
      ].filter(Boolean);

      const frontPts = [
        points.frontNeck,
        points.frontNeckPit,
        points.frontShoulderTip,
        points.bustApex,
        points.bustPoint,
        points.cfWaist,
        points.armpitFront,
        points.frontSideWaist,
      ].filter(Boolean);

      let backX = effectiveBB.minX + effectiveBB.width * 0.25;
      let backY = effectiveBB.minY + effectiveBB.height * 0.40;
      if (backPts.length > 0) {
        backX = backPts.reduce((acc, p) => acc + p.x, 0) / backPts.length;
        backY = backPts.reduce((acc, p) => acc + p.y, 0) / backPts.length;
      }

      let frontX = effectiveBB.minX + effectiveBB.width * 0.75;
      let frontY = effectiveBB.minY + effectiveBB.height * 0.40;
      if (frontPts.length > 0) {
        frontX = frontPts.reduce((acc, p) => acc + p.x, 0) / frontPts.length;
        frontY = frontPts.reduce((acc, p) => acc + p.y, 0) / frontPts.length;
      }

      badges.push({
        id: 'bodice-back',
        x: backX,
        y: backY,
        title: 'الگوی بالاتنه پشت (CB)',
        subtitle: 'راستای دولای بسته / درز پشت',
        theme: 'indigo',
      });

      badges.push({
        id: 'bodice-front',
        x: frontX,
        y: frontY,
        title: 'الگوی بالاتنه پیش (جلو / CF)',
        subtitle: 'خط مرکزی پیش و جادکمه',
        theme: 'emerald',
      });
    } else if (detectedBlockType === 'SKIRT') {
      // Skirt pieces: Back (CB) and Front (CF)
      const midHipX = points.sideHip?.x ?? (effectiveBB.minX + effectiveBB.width * 0.5);
      const backX = effectiveBB.minX + (midHipX - effectiveBB.minX) * 0.48;
      const frontX = midHipX + (effectiveBB.maxX - midHipX) * 0.52;
      const badgeY = effectiveBB.minY + effectiveBB.height * 0.38;

      badges.push({
        id: 'skirt-back',
        x: backX,
        y: badgeY,
        title: 'پشت دامن (CB)',
        subtitle: 'راستای دولای بسته پشت',
        theme: 'indigo',
      });

      badges.push({
        id: 'skirt-front',
        x: frontX,
        y: badgeY,
        title: 'پیش دامن (CF)',
        subtitle: 'راستای دولای بسته پیش',
        theme: 'emerald',
      });
    } else if (detectedBlockType === 'TROUSER') {
      // Trouser pieces: Front (پیش) and Back (پشت)
      const frontCreaseX = points.frontCreaseWaist?.x ?? points.frontCreaseHem?.x;
      const backCreaseX = points.backCreaseWaist?.x ?? points.backCreaseHem?.x;

      let frontX = effectiveBB.minX + effectiveBB.width * 0.3;
      let backX = effectiveBB.minX + effectiveBB.width * 0.7;

      if (frontCreaseX !== undefined && backCreaseX !== undefined && Math.abs(frontCreaseX - backCreaseX) > 20) {
        frontX = frontCreaseX;
        backX = backCreaseX;
      } else if (frontCreaseX !== undefined) {
        frontX = frontCreaseX;
        backX = frontCreaseX;
      }

      const badgeY = effectiveBB.minY + effectiveBB.height * 0.32;

      badges.push({
        id: 'trouser-front',
        x: frontX,
        y: badgeY,
        title: 'پیش شلوار (جلو)',
        subtitle: 'خط اتو و تعادل پیش',
        theme: 'emerald',
      });

      badges.push({
        id: 'trouser-back',
        x: backX,
        y: badgeY + (frontX === backX ? 24 : 0),
        title: 'پشت شلوار',
        subtitle: 'بلندی فاق و ساسون پشت',
        theme: 'indigo',
      });
    } else if (detectedBlockType === 'SLEEVE') {
      // Sleeve piece: crown and body
      const sleeveCenterX = points.centerWrist?.x ?? (effectiveBB.minX + effectiveBB.width / 2);
      const crownY = points.crownApex?.y ?? effectiveBB.minY;
      const badgeY = crownY + 110;

      badges.push({
        id: 'sleeve-body',
        x: sleeveCenterX,
        y: badgeY,
        title: 'تاج و بدنه آستین (پشت / جلو)',
        subtitle: 'سمت راست: پیش | سمت چپ: پشت',
        theme: 'purple',
      });
    }

    return badges;
  }, [detectedBlockType, points, effectiveBB]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] bg-slate-50 dark:bg-slate-950 rounded-2xl border overflow-hidden select-none cursor-grab active:cursor-grabbing shadow-inner"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-background/90 backdrop-blur border rounded-xl p-1.5 shadow-md">
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z + 0.25))}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground transition-colors"
          title="بزرگ‌نمایی (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => clampZoom(z - 0.25))}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground transition-colors"
          title="کوچک‌نمایی (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="p-1.5 hover:bg-muted rounded-lg text-foreground transition-colors"
          title="بازنشانی زاویه دید (۱۰۰٪)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono font-bold px-2 text-muted-foreground border-r">
          {toPersianDigits(Math.round(zoom * 100))}%
        </span>

        {/* Separator */}
        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Show/Hide Initial Drafting Frame Toggle */}
        <button
          type="button"
          onClick={() => setShowInitialFrame((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showInitialFrame
              ? 'bg-primary/10 text-primary border border-primary/30 font-bold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title="نمایش / مخفی‌سازی کادر مستطیل اولیه الگو"
        >
          <Square className="h-3.5 w-3.5" />
          <span>کادر اولیه</span>
        </button>

        {/* Show/Hide Reference Levels & CB/CF Toggle */}
        <button
          type="button"
          onClick={() => setShowRefLines((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showRefLines
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title="نمایش / مخفی‌سازی خطوط مبنا و شاخص‌های CB و CF"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>خطوط مبنا (CB/CF)</span>
        </button>

        {/* Show/Hide Panel Identification Badges Toggle */}
        <button
          type="button"
          onClick={() => setShowPanelBadges((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showPanelBadges
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title="نمایش / مخفی‌سازی نام و شناسه قطعات الگو (پیش و پشت)"
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>قطعات الگو</span>
        </button>

        {/* Show/Hide Points & Labels Toggle */}
        <button
          type="button"
          onClick={() => setShowPointLabels((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            showPointLabels
              ? 'bg-primary/10 text-primary border border-primary/30 font-bold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title="نمایش / مخفی‌سازی نام نقاط الگو"
        >
          <Tag className="h-3.5 w-3.5" />
          <span>نقاط</span>
        </button>
      </div>

      {/* SVG Canvas Viewport */}
      <svg
        className="w-full h-full"
        viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="grainline-arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
          </marker>
          <pattern id="grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* 10cm Grid Background */}
        <rect
          x={effectiveBB.minX - 600}
          y={effectiveBB.minY - 600}
          width={effectiveBB.width + 1200}
          height={effectiveBB.height + 1200}
          fill="url(#grid-pattern)"
          opacity="0.6"
        />

        {/* 5cm x 5cm Calibration Square (At top left of workspace) */}
        <g id="calibration-square" transform={`translate(${effectiveBB.minX + 20}, ${effectiveBB.minY + 20})`}>
          <rect
            width="50"
            height="50"
            fill="none"
            stroke="#2563EB"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
          <text
            x="25"
            y="25"
            fontFamily="Vazirmatn"
            fontSize="3.2"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1E293B"
          >
            مربع کالیبراسیون ۵×۵ cm
          </text>
        </g>

        {/* Fallback Initial Drafting Frame (When no explicit frame lines provided) */}
        {showInitialFrame && !hasFrameLinesInResult && (
          <g id="layer-initial-drafting-frame">
            <rect
              x={effectiveBB.minX}
              y={effectiveBB.minY}
              width={effectiveBB.width}
              height={effectiveBB.height}
              fill="none"
              stroke={isStepActive && currentStepIndex === 0 ? '#7C3AED' : '#94A3B8'}
              strokeWidth={isStepActive && currentStepIndex === 0 ? '1.2' : '0.9'}
              strokeDasharray="4,4"
            />
            <text
              x={effectiveBB.minX + 8}
              y={effectiveBB.minY + 14}
              fill={isStepActive && currentStepIndex === 0 ? '#7C3AED' : '#94A3B8'}
              fontSize="3.2"
              fontFamily="Vazirmatn"
              fontWeight="bold"
              className="select-none"
            >
              کادر مستطیل اولیه ({toPersianDigits(Math.round(effectiveBB.width / 10))} × {toPersianDigits(Math.round(effectiveBB.height / 10))} cm)
            </text>
          </g>
        )}

        {/* Layer 1: Structured Construction Lines */}
        <g id="layer-construction-lines">
          {constructionLines.map((line, idx) => {
            const isFrame = line.type === 'frame';
            if (isFrame && !showInitialFrame) return null;

            // Progressive step display: hide lines defined for future steps
            if (isStepActive && line.stepIndex !== undefined && line.stepIndex > currentStepIndex) {
              return null;
            }

            const isCurrentStepLine =
              isStepActive &&
              (line.stepIndex === currentStepIndex ||
                (line.label && currentStepElementSet.has(line.label)) ||
                (isFrame && currentStepIndex === 0));

            let stroke = isFrame ? '#94A3B8' : line.type === 'axis' ? '#94A3B8' : '#CBD5E1';
            let strokeWidth = isFrame ? '0.9' : line.type === 'axis' ? '0.7' : '0.5';
            let strokeDasharray = isFrame ? '4,4' : line.type === 'axis' ? '6,3' : '3,3';

            if (isCurrentStepLine) {
              stroke = '#7C3AED';
              strokeWidth = '1.3';
              strokeDasharray = isFrame ? '4,4' : 'none';
            }

            const mx = (line.from.x + line.to.x) / 2;
            const my = (line.from.y + line.to.y) / 2;
            const textLen = line.label?.length || 0;
            const badgeW = Math.max(18, textLen * 2.2 + 8);
            const badgeH = 5.6;

            return (
              <g key={`cline-${idx}`}>
                <line
                  x1={line.from.x}
                  y1={line.from.y}
                  x2={line.to.x}
                  y2={line.to.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                />
                {line.label && (
                  <g className="pointer-events-none select-none">
                    <rect
                      x={mx - badgeW / 2}
                      y={my - badgeH / 2}
                      width={badgeW}
                      height={badgeH}
                      rx="3"
                      fill="rgba(255,255,255,0.85)"
                      stroke={isCurrentStepLine ? '#C084FC' : '#CBD5E1'}
                      strokeWidth="0.4"
                    />
                    <text
                      x={mx}
                      y={my}
                      fill={isCurrentStepLine ? '#7C3AED' : '#475569'}
                      fontSize="2.9"
                      fontWeight={isCurrentStepLine ? 'bold' : 'normal'}
                      fontFamily="Vazirmatn"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {line.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Layer 2: Contours / True Pattern Cut Outline */}
        <g id="layer-pattern-cut-outline">
          {draftResult.contours?.map((cmd, i) => {
            const shouldRenderFull = showAll || isFinalStep;
            return (
              <path
                key={i}
                d={cmd}
                stroke="#0F172A"
                strokeWidth={shouldRenderFull ? '1.5' : '1.0'}
                strokeDasharray={shouldRenderFull ? 'none' : '4,4'}
                fill={shouldRenderFull ? 'rgba(248, 250, 252, 0.4)' : 'none'}
                opacity={shouldRenderFull ? 1 : 0.3}
              />
            );
          })}
        </g>

        {/* Layer 3: Horizontal Reference Levels (خط کف حلقه، خط کمر، خط باسن) */}
        {showRefLines && (
          <g id="layer-horizontal-reference-levels" className="pointer-events-none select-none">
            {horizontalLevels.map((lvl) => {
              const lineX1 = effectiveBB.minX - 25;
              const lineX2 = effectiveBB.maxX + 25;
              const badgeW = lvl.label.length * 2.3 + 12;

              return (
                <g key={lvl.id}>
                  {/* Full-width dashed level reference line */}
                  <line
                    x1={lineX1}
                    y1={lvl.y}
                    x2={lineX2}
                    y2={lvl.y}
                    stroke={lvl.color}
                    strokeWidth="0.8"
                    strokeDasharray="6,4"
                    opacity="0.85"
                  />

                  {/* Left Margin Badge */}
                  <g transform={`translate(${effectiveBB.minX - 28}, ${lvl.y})`}>
                    <rect
                      x={-badgeW - 2}
                      y="-5"
                      width={badgeW}
                      height="10"
                      rx="3"
                      fill={lvl.bgColor}
                      stroke={lvl.color}
                      strokeWidth="0.6"
                    />
                    <text
                      x={-badgeW / 2 - 2}
                      y="0"
                      fill={lvl.color}
                      fontSize="2.9"
                      fontWeight="bold"
                      fontFamily="Vazirmatn"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {lvl.label}
                    </text>
                  </g>

                  {/* Right Margin Badge */}
                  <g transform={`translate(${effectiveBB.maxX + 28}, ${lvl.y})`}>
                    <rect
                      x="2"
                      y="-5"
                      width={badgeW}
                      height="10"
                      rx="3"
                      fill={lvl.bgColor}
                      stroke={lvl.color}
                      strokeWidth="0.6"
                    />
                    <text
                      x={badgeW / 2 + 2}
                      y="0"
                      fill={lvl.color}
                      fontSize="2.9"
                      fontWeight="bold"
                      fontFamily="Vazirmatn"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {lvl.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        )}

        {/* Layer 4: Prominent Vertical CB and CF Indicators and Badges */}
        {showRefLines && cbCfInfo.active && (
          <g id="layer-cb-cf-indicators" className="pointer-events-none select-none">
            {/* Center Back (CB) */}
            <g id="indicator-cb">
              {/* Highlight line along CB */}
              <line
                x1={cbCfInfo.cb.x}
                y1={cbCfInfo.cb.yTop}
                x2={cbCfInfo.cb.x}
                y2={cbCfInfo.cb.yBottom}
                stroke="#4F46E5"
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity="0.9"
              />

              {/* CB Top Badge */}
              <g transform={`translate(${cbCfInfo.cb.x}, ${cbCfInfo.cb.yTop - 12})`}>
                <rect
                  x="-42"
                  y="-6"
                  width="84"
                  height="12"
                  rx="4"
                  fill="#312E81"
                  stroke="#6366F1"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.4"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی پشت (CB)
                </text>
              </g>

              {/* CB Mid-Vertical Badge (Rotated along edge) */}
              <g transform={`translate(${cbCfInfo.cb.x - 9}, ${(cbCfInfo.cb.yTop + cbCfInfo.cb.yBottom) / 2}) rotate(-90)`}>
                <rect
                  x="-44"
                  y="-6"
                  width="88"
                  height="12"
                  rx="4"
                  fill="rgba(49, 46, 129, 0.95)"
                  stroke="#818CF8"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.3"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی پشت (CB)
                </text>
              </g>

              {/* CB Bottom Badge */}
              <g transform={`translate(${cbCfInfo.cb.x}, ${cbCfInfo.cb.yBottom + 12})`}>
                <rect
                  x="-42"
                  y="-6"
                  width="84"
                  height="12"
                  rx="4"
                  fill="#312E81"
                  stroke="#6366F1"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.4"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی پشت (CB)
                </text>
              </g>
            </g>

            {/* Center Front (CF) */}
            <g id="indicator-cf">
              {/* Highlight line along CF */}
              <line
                x1={cbCfInfo.cf.x}
                y1={cbCfInfo.cf.yTop}
                x2={cbCfInfo.cf.x}
                y2={cbCfInfo.cf.yBottom}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="6,3"
                opacity="0.9"
              />

              {/* CF Top Badge */}
              <g transform={`translate(${cbCfInfo.cf.x}, ${cbCfInfo.cf.yTop - 12})`}>
                <rect
                  x="-42"
                  y="-6"
                  width="84"
                  height="12"
                  rx="4"
                  fill="#065F46"
                  stroke="#10B981"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.4"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی جلو (CF)
                </text>
              </g>

              {/* CF Mid-Vertical Badge (Rotated along edge) */}
              <g transform={`translate(${cbCfInfo.cf.x + 9}, ${(cbCfInfo.cf.yTop + cbCfInfo.cf.yBottom) / 2}) rotate(90)`}>
                <rect
                  x="-44"
                  y="-6"
                  width="88"
                  height="12"
                  rx="4"
                  fill="rgba(6, 95, 70, 0.95)"
                  stroke="#34D399"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.3"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی جلو (CF)
                </text>
              </g>

              {/* CF Bottom Badge */}
              <g transform={`translate(${cbCfInfo.cf.x}, ${cbCfInfo.cf.yBottom + 12})`}>
                <rect
                  x="-42"
                  y="-6"
                  width="84"
                  height="12"
                  rx="4"
                  fill="#065F46"
                  stroke="#10B981"
                  strokeWidth="0.6"
                />
                <text
                  x="0"
                  y="0"
                  fill="#FFFFFF"
                  fontSize="3.4"
                  fontWeight="bold"
                  fontFamily="Vazirmatn"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  خط مرکزی جلو (CF)
                </text>
              </g>
            </g>
          </g>
        )}

        {/* Layer 5: Panel Identification Badges (chips for pieces) */}
        {showPanelBadges && (
          <g id="layer-panel-identification-badges" className="pointer-events-none select-none">
            {panelBadges.map((badge) => {
              const chipW = Math.max(68, badge.title.length * 2.8 + 24);
              const chipH = badge.subtitle ? 14 : 9.5;

              let themeBg = 'rgba(238, 242, 255, 0.94)';
              let themeBorder = '#6366F1';
              let themeText = '#3730A3';
              let themeDot = '#4F46E5';

              if (badge.theme === 'emerald') {
                themeBg = 'rgba(236, 253, 245, 0.94)';
                themeBorder = '#10B981';
                themeText = '#065F46';
                themeDot = '#059669';
              } else if (badge.theme === 'purple') {
                themeBg = 'rgba(245, 243, 255, 0.94)';
                themeBorder = '#8B5CF6';
                themeText = '#5B21B6';
                themeDot = '#7C3AED';
              }

              return (
                <g key={badge.id} transform={`translate(${badge.x}, ${badge.y})`}>
                  <rect
                    x={-chipW / 2}
                    y={-chipH / 2}
                    width={chipW}
                    height={chipH}
                    rx="4.5"
                    fill={themeBg}
                    stroke={themeBorder}
                    strokeWidth="0.8"
                  />
                  <circle
                    cx={-chipW / 2 + 6}
                    cy={badge.subtitle ? -2.2 : 0}
                    r="2.0"
                    fill={themeDot}
                  />
                  <text
                    x={2}
                    y={badge.subtitle ? -2.2 : 0}
                    fontSize="3.3"
                    fontWeight="bold"
                    fontFamily="Vazirmatn"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={themeText}
                  >
                    {badge.title}
                  </text>
                  {badge.subtitle && (
                    <text
                      x={0}
                      y={3.8}
                      fontSize="2.1"
                      fontFamily="Vazirmatn"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#64748B"
                    >
                      {badge.subtitle}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Layer 6: Darts */}
        <g id="layer-darts" stroke="#2563EB" strokeWidth="0.8" fill="rgba(37, 99, 235, 0.05)">
          {draftResult.darts?.map((dartPts, idx) => (
            <polygon key={idx} points={dartPts.map((p) => `${p.x},${p.y}`).join(' ')} />
          ))}
        </g>

        {/* Layer 7: Grainlines */}
        {(showAll || isFinalStep || !isStepActive) && (
          <g id="layer-grainlines" stroke="#059669" strokeWidth="0.8">
            {draftResult.grainlines ? (
              draftResult.grainlines.map((gl, idx) => (
                <line
                  key={idx}
                  x1={gl.from.x}
                  y1={gl.from.y}
                  x2={gl.to.x}
                  y2={gl.to.y}
                  markerStart="url(#grainline-arrow)"
                  markerEnd="url(#grainline-arrow)"
                />
              ))
            ) : (
              <line
                x1={effectiveBB.minX + effectiveBB.width / 2}
                y1={effectiveBB.minY + 40}
                x2={effectiveBB.minX + effectiveBB.width / 2}
                y2={effectiveBB.minY + effectiveBB.height - 40}
                markerStart="url(#grainline-arrow)"
                markerEnd="url(#grainline-arrow)"
              />
            )}
          </g>
        )}

        {/* Layer 8: Notches */}
        {(showAll || isFinalStep || !isStepActive) && (
          <g id="layer-notches" stroke="#DC2626" strokeWidth="1.0">
            {draftResult.notches?.map((n, idx) => (
              <circle key={idx} cx={n.x} cy={n.y} r="2" fill="#DC2626" />
            ))}
          </g>
        )}

        {/* Layer 9: Points and Clean Persian Dimension Badges */}
        {showPointLabels && (
          <g id="layer-labels-persian" fontFamily="Vazirmatn">
            {Object.entries(points).map(([id, pt]) => {
              // Progressive visibility: in step mode, hide points from future steps
              if (isStepActive && !isFinalStep) {
                if (visibleElementSet.size > 0 && !visibleElementSet.has(id)) {
                  return null;
                }
              }

              const isCurrent = isStepActive && currentStepElementSet.has(id);
              const labelText = resolvePointLabel(id, pt.label);

              // Smart offset calculations to prevent overlapping
              const isNearRight = pt.x > effectiveBB.minX + effectiveBB.width * 0.72;
              const isNearBottom = pt.y > effectiveBB.minY + effectiveBB.height * 0.85;
              const isNearTop = pt.y < effectiveBB.minY + 30;

              const badgeWidth = Math.max(14, labelText.length * 2.3 + 4);
              const badgeHeight = 4.8;
              const badgeX = isNearRight ? pt.x - badgeWidth - 3 : pt.x + 3;
              const badgeY = isNearBottom
                ? pt.y - badgeHeight - 2
                : isNearTop
                ? pt.y + 3
                : pt.y - badgeHeight / 2;

              return (
                <g key={id}>
                  {/* Point Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isCurrent ? 2.4 : 1.3}
                    fill={isCurrent ? '#7C3AED' : '#64748B'}
                  />

                  {/* Clean Background Badge */}
                  <rect
                    x={badgeX}
                    y={badgeY}
                    width={badgeWidth}
                    height={badgeHeight}
                    rx="1.2"
                    fill={isCurrent ? 'rgba(243, 232, 255, 0.95)' : 'rgba(255, 255, 255, 0.92)'}
                    stroke={isCurrent ? '#C084FC' : '#E2E8F0'}
                    strokeWidth="0.4"
                  />

                  {/* Persian Label Text */}
                  <text
                    x={badgeX + badgeWidth / 2}
                    y={badgeY + 3.4}
                    fontSize="3.1"
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                    textAnchor="middle"
                    fill={isCurrent ? '#6B21A8' : '#334155'}
                    className="select-none"
                  >
                    {labelText}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Layer 10: Active Elements Pulse Highlight */}
        {activeElements.map((elId) => {
          const pt = points[elId];
          if (!pt) return null;
          const labelText = resolvePointLabel(elId, pt.label);
          return (
            <g key={`pulse-${elId}`} className="animate-pulse">
              <circle cx={pt.x} cy={pt.y} r="7" fill="#8B5CF6" fillOpacity="0.35" />
              <circle cx={pt.x} cy={pt.y} r="3" fill="#7C3AED" />
              <text
                x={pt.x}
                y={pt.y - 8}
                fontFamily="Vazirmatn"
                fontSize="4.2"
                fontWeight="bold"
                fill="#7C3AED"
                textAnchor="middle"
                className="select-none"
              >
                {labelText}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
