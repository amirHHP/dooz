'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Square, Tag } from 'lucide-react';
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
  cbWaist: 'کمر پشت',
  cbHip: 'باسن پشت',
  cbHem: 'پایین پشت',
  cbNeck: 'طوق گردن پشت',
  shoulderApexBack: 'سرشانه پشت',
  shoulderApexFront: 'سرشانه جلو',
  armpitBack: 'کف حلقه پشت',
  armpitFront: 'کف حلقه جلو',
  bustPoint: 'نوک سینه',
  cfWaist: 'کمر جلو',
  cfHip: 'باسن جلو',
  cfHem: 'پایین جلو',
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
  pt8: 'نقطه ۸ کمکی',
  pt9: 'نقطه ۹ کمکی',
  pt10: 'نقطه ۱۰ کمکی',
  pt11: 'نقطه ۱۱ کمکی',
  pt12: 'نقطه ۱۲ کمکی',
  pt13: 'نقطه ۱۳ کمکی',

  // Trouser
  crotchBack: 'فاق پشت',
  crotchFront: 'فاق جلو',
  kneeBack: 'زانو پشت',
  kneeFront: 'زانو جلو',
  hemBack: 'دمپا پشت',
  hemFront: 'دمپا جلو',
  creaseWaist: 'خط اتو کمر',
  creaseHem: 'خط اتو دمپا',
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
  const [showInitialFrame, setShowInitialFrame] = useState(true);
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

  const bb = draftResult?.boundingBox || { minX: 0, minY: 0, width: 600, height: 800 };
  const vbW = (bb.width + 100) / zoom;
  const vbH = (bb.height + 100) / zoom;
  const vbX = bb.minX - 50 - pan.x;
  const vbY = bb.minY - 50 - pan.y;

  const points = draftResult?.points || {};
  const steps = draftResult?.steps || [];
  const currentStep = steps[currentStepIndex];

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

  // Construction lines inspection
  const constructionLines = draftResult?.constructionLines || [];
  const hasFrameLinesInResult = constructionLines.some((l) => l.type === 'frame');

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
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur border rounded-xl p-1.5 shadow-md">
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
          x={bb.minX - 500}
          y={bb.minY - 500}
          width={bb.width + 1000}
          height={bb.height + 1000}
          fill="url(#grid-pattern)"
          opacity="0.6"
        />

        {/* 5cm x 5cm Calibration Square (At top left) */}
        <g id="calibration-square" transform="translate(20, 20)">
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
              x={bb.minX}
              y={bb.minY}
              width={bb.width}
              height={bb.height}
              fill="none"
              stroke={isStepActive && currentStepIndex === 0 ? '#7C3AED' : '#94A3B8'}
              strokeWidth={isStepActive && currentStepIndex === 0 ? '1.2' : '0.9'}
              strokeDasharray="4,4"
            />
            <text
              x={bb.minX + 8}
              y={bb.minY + 14}
              fill={isStepActive && currentStepIndex === 0 ? '#7C3AED' : '#94A3B8'}
              fontSize="3.2"
              fontFamily="Vazirmatn"
              fontWeight="bold"
              className="select-none"
            >
              کادر مستطیل اولیه ({toPersianDigits(Math.round(bb.width / 10))} × {toPersianDigits(Math.round(bb.height / 10))} cm)
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
                  <text
                    x={(line.from.x + line.to.x) / 2}
                    y={(line.from.y + line.to.y) / 2 - 2}
                    fill={isCurrentStepLine ? '#7C3AED' : '#64748B'}
                    fontSize="3.0"
                    fontFamily="Vazirmatn"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {line.label}
                  </text>
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

        {/* Layer 3: Darts */}
        <g id="layer-darts" stroke="#2563EB" strokeWidth="0.8" fill="rgba(37, 99, 235, 0.05)">
          {draftResult.darts?.map((dartPts, idx) => (
            <polygon key={idx} points={dartPts.map((p) => `${p.x},${p.y}`).join(' ')} />
          ))}
        </g>

        {/* Layer 4: Grainlines */}
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
                x1={bb.minX + bb.width / 2}
                y1={bb.minY + 40}
                x2={bb.minX + bb.width / 2}
                y2={bb.minY + bb.height - 40}
                markerStart="url(#grainline-arrow)"
                markerEnd="url(#grainline-arrow)"
              />
            )}
          </g>
        )}

        {/* Layer 5: Notches */}
        {(showAll || isFinalStep || !isStepActive) && (
          <g id="layer-notches" stroke="#DC2626" strokeWidth="1.0">
            {draftResult.notches?.map((n, idx) => (
              <circle key={idx} cx={n.x} cy={n.y} r="2" fill="#DC2626" />
            ))}
          </g>
        )}

        {/* Layer 6: Points and Clean Persian Dimension Badges */}
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
              const isNearRight = pt.x > bb.minX + bb.width * 0.72;
              const isNearBottom = pt.y > bb.minY + bb.height * 0.85;
              const isNearTop = pt.y < bb.minY + 30;

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

        {/* Layer 7: Active Elements Pulse Highlight */}
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
