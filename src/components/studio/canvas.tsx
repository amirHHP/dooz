'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { toPersianDigits } from '@/lib/format';

export interface StudioCanvasProps {
  draftResult: {
    boundingBox: { minX: number; minY: number; width: number; height: number };
    points: Record<string, { x: number; y: number; label?: string }>;
    curves?: Record<string, { p0: any; c1: any; c2: any; p3: any }>;
    contours?: string[];
    grainlines?: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
    notches?: Array<{ x: number; y: number }>;
    darts?: Array<Array<{ x: number; y: number }>>;
    [key: string]: any;
  };
  currentStepIndex: number;
  showAll: boolean;
  activeElements?: string[];
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

        {/* Layer 1: Construction Lines */}
        <g id="layer-construction-lines" stroke="#94A3B8" strokeDasharray="3,3" strokeWidth="0.4">
          {Object.entries(points).map(([key, pt], idx, arr) => {
            if (idx === 0) return null;
            const prev = arr[idx - 1][1];
            return (
              <line
                key={`line-${key}`}
                x1={prev.x}
                y1={prev.y}
                x2={pt.x}
                y2={pt.y}
              />
            );
          })}
        </g>

        {/* Layer 2: Contours / Pattern Outline */}
        <g id="layer-pattern-cut-outline" stroke="#0F172A" strokeWidth="1.2" fill="none">
          {draftResult.contours?.map((cmd, i) => (
            <path key={i} d={cmd} />
          ))}
          {/* Default contour polygon from points if no explicit contours */}
          {(!draftResult.contours || draftResult.contours.length === 0) && (
            <polygon
              points={Object.values(points).map((p) => `${p.x},${p.y}`).join(' ')}
              fill="rgba(241, 245, 249, 0.3)"
            />
          )}
        </g>

        {/* Layer 3: Darts */}
        <g id="layer-darts" stroke="#2563EB" strokeWidth="0.8" fill="rgba(37, 99, 235, 0.05)">
          {draftResult.darts?.map((dartPts, idx) => (
            <polygon key={idx} points={dartPts.map((p) => `${p.x},${p.y}`).join(' ')} />
          ))}
        </g>

        {/* Layer 4: Grainlines */}
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

        {/* Layer 5: Notches */}
        <g id="layer-notches" stroke="#DC2626" strokeWidth="1.0">
          {draftResult.notches?.map((n, idx) => (
            <circle key={idx} cx={n.x} cy={n.y} r="2" fill="#DC2626" />
          ))}
        </g>

        {/* Layer 6: Points and Dimension Labels in Persian */}
        <g id="layer-labels-persian" fontFamily="Vazirmatn" fontSize="3.8" fill="#1E293B">
          {Object.entries(points).map(([id, pt]) => (
            <g key={id}>
              <circle cx={pt.x} cy={pt.y} r="1.5" fill="#475569" />
              <text x={pt.x + 3} y={pt.y - 3} className="select-none">
                {pt.label || id}
              </text>
            </g>
          ))}
        </g>

        {/* Layer 7: Active Elements Pulse Highlight */}
        {activeElements.map((elId) => {
          const pt = points[elId];
          if (!pt) return null;
          return (
            <g key={`pulse-${elId}`} className="animate-pulse">
              <circle cx={pt.x} cy={pt.y} r="7" fill="#8B5CF6" fillOpacity="0.4" />
              <circle cx={pt.x} cy={pt.y} r="3" fill="#7C3AED" />
              <text
                x={pt.x}
                y={pt.y - 10}
                fontFamily="Vazirmatn"
                fontSize="4.5"
                fontWeight="bold"
                fill="#7C3AED"
                textAnchor="middle"
              >
                {pt.label || elId}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
