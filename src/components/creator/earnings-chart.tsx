"use client";

import React, { useState } from "react";
import { formatToman } from "@/lib/format";

export interface MonthlyEarningsPoint {
  month: string;
  revenue: number;
  net: number;
}

interface EarningsChartProps {
  data: MonthlyEarningsPoint[];
  height?: number;
}

export function EarningsChart({ data = [], height = 300 }: EarningsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Handle empty state gracefully without SVG or divide-by-zero errors
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center"
        style={{ minHeight: `${height}px` }}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          هنوز داده‌های فروشی برای این بازه زمانی ثبت نشده است
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          پس از انتشار اولین الگو و انجام خریدهای موفق در مارکت‌پلیس، نمودار رشد درآمد شما در این بخش رسم خواهد شد.
        </p>
      </div>
    );
  }

  // Calculate scales and coordinate mappings
  const maxVal = Math.max(
    100000,
    ...data.map((d) => Math.max(d.revenue, d.net))
  );

  const padding = { top: 30, right: 40, bottom: 40, left: 60 };
  const width = 700; // SVG viewBox coordinate width
  const svgHeight = height;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const count = data.length;
  const stepX = count > 1 ? chartWidth / (count - 1) : chartWidth / 2;

  // Build points for revenue (gross) and net area/lines
  // In RTL, index 0 is at right (width - padding.right), but standard left-to-right timeline:
  const getX = (i: number) => {
    if (count === 1) return padding.left + chartWidth / 2;
    return padding.left + i * stepX;
  };

  const getY = (val: number) => {
    return padding.top + chartHeight - (val / maxVal) * chartHeight;
  };

  // Generate SVG path for revenue
  const revenuePoints = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(" ");
  const netPoints = data.map((d, i) => `${getX(i)},${getY(d.net)}`).join(" ");

  // Closed area paths
  const revenueArea = `M ${getX(0)},${padding.top + chartHeight} L ${data
    .map((d, i) => `${getX(i)},${getY(d.revenue)}`)
    .join(" L ")} L ${getX(count - 1)},${padding.top + chartHeight} Z`;

  const netArea = `M ${getX(0)},${padding.top + chartHeight} L ${data
    .map((d, i) => `${getX(i)},${getY(d.net)}`)
    .join(" L ")} L ${getX(count - 1)},${padding.top + chartHeight} Z`;

  const yTicks = [0, maxVal * 0.5, maxVal];

  return (
    <div className="w-full relative select-none" dir="rtl">
      {/* Chart Legend */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-teal-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">فروش ناخالص</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">درآمد خالص طراح (۸۰٪)</span>
          </div>
        </div>
        <div className="text-slate-400">مبالغ به تومان</div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          style={{ minWidth: "500px" }}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y ticks */}
          {yTicks.map((t, idx) => {
            const y = getY(t);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatToman(t, { showUnit: false })}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          <path d={revenueArea} fill="url(#revenueGrad)" />
          <path d={netArea} fill="url(#netGrad)" />

          {/* Lines */}
          <polyline
            points={revenuePoints}
            fill="none"
            stroke="#0d9488"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={netPoints}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data interactive points & X ticks */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cyRev = getY(d.revenue);
            const cyNet = getY(d.net);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover indicator */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={padding.top + chartHeight}
                    stroke="#0d9488"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}

                {/* Circles for revenue */}
                <circle
                  cx={cx}
                  cy={cyRev}
                  r={isHovered ? 6 : 4}
                  fill="#0d9488"
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Circles for net */}
                <circle
                  cx={cx}
                  cy={cyNet}
                  r={isHovered ? 5 : 3.5}
                  fill="#10b981"
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Month labels */}
                <text
                  x={cx}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className={`text-xs fill-slate-500 dark:fill-slate-400 font-medium ${
                    isHovered ? "font-bold fill-teal-600 dark:fill-teal-400" : ""
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Tooltip Card */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-10 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1.5 pointer-events-none transition-all duration-150"
          style={{
            top: "20px",
            right: `${Math.min(85, Math.max(10, ((width - getX(hoveredIndex)) / width) * 100))}%`,
          }}
        >
          <div className="font-bold text-slate-800 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
            ماه {data[hoveredIndex].month}
          </div>
          <div className="flex justify-between gap-4 text-teal-700 dark:text-teal-400">
            <span>فروش ناخالص:</span>
            <span className="font-bold">{formatToman(data[hoveredIndex].revenue)}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400">
            <span>سهم خالص شما:</span>
            <span className="font-extrabold">{formatToman(data[hoveredIndex].net)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
