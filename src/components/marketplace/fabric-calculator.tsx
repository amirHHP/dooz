'use client';

import React, { useState, useMemo } from 'react';
import { calculateFabricConsumption, FabricPatternType } from '@/types/marketplace';
import { toPersianDigits } from '@/lib/format';
import { AlertCircle, Ruler, CheckCircle2 } from 'lucide-react';

export interface FabricCalculatorProps {
  bodiceLength?: number;
  skirtLength?: number;
  sleeveLength?: number;
  recommendedFabrics?: string[];
}

export function FabricCalculator({
  bodiceLength = 42,
  skirtLength = 65,
  sleeveLength = 60,
  recommendedFabrics = ['کرپ باربی', 'فاستونی پشمی', 'کتان ترک'],
}: FabricCalculatorProps) {
  const [size, setSize] = useState<number>(40);
  const [fabricWidth, setFabricWidth] = useState<110 | 150>(150);
  const [fabricPattern, setFabricPattern] = useState<FabricPatternType>('SOLID');

  const calculation = useMemo(() => {
    return calculateFabricConsumption({
      bodiceLength,
      skirtLength,
      sleeveLength,
      size,
      fabricWidth,
      fabricPattern,
      allowanceCm: 20,
    });
  }, [bodiceLength, skirtLength, sleeveLength, size, fabricWidth, fabricPattern]);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <Ruler className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">محاسبه‌گر هوشمند متراژ پارچه</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">
          دقت الگوسازی صنعتی
        </span>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Size Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">سایز لباس</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
          >
            {[36, 38, 40, 42, 44, 46, 48, 50, 52, 54].map((s) => (
              <option key={s} value={s}>
                سایز {toPersianDigits(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Fabric Width Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">عرض طاقه پارچه</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFabricWidth(150)}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                fabricWidth === 150
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-foreground'
              }`}
            >
              عرض ۱۵۰ cm
            </button>
            <button
              type="button"
              onClick={() => setFabricWidth(110)}
              className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                fabricWidth === 110
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted text-foreground'
              }`}
            >
              عرض ۱۱۰ cm
            </button>
          </div>
        </div>

        {/* Fabric Pattern / Nap Toggle */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">طرح و خواب پارچه</label>
          <select
            value={fabricPattern}
            onChange={(e) => setFabricPattern(e.target.value as FabricPatternType)}
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
          >
            <option value="SOLID">ساده بدون خواب (ضریب ۱٫۰)</option>
            <option value="VELVET">مخمل / خواب‌دار (+۱۵٪)</option>
            <option value="PLAID">چهارخانه / راه‌راه (+۲۰٪)</option>
          </select>
        </div>
      </div>

      {/* Warning Box for Narrow roll & Large size */}
      {calculation.warning && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
          <span>{calculation.warning}</span>
        </div>
      )}

      {/* Results Summary Box */}
      <div className="rounded-2xl bg-muted/40 border p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div>
          <span className="text-xs text-muted-foreground">متراژ پارچه مورد نیاز:</span>
          <p className="text-2xl font-black text-primary mt-1 font-mono">
            {toPersianDigits(calculation.finalMeters)} <span className="text-sm font-normal">متر</span>
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">نوع چیدمان الگو:</span>
          <p className="text-base font-bold text-foreground mt-1">
            {calculation.layoutType === 'PARALLEL' ? 'چیدمان موازی (کنار هم)' : 'چیدمان متوالی (پشت سر هم)'}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">پرت برش تخمینی:</span>
          <p className="text-base font-bold text-foreground mt-1 font-mono">
            {toPersianDigits(calculation.wastagePercentage)}٪
          </p>
        </div>
      </div>

      {/* Layout Schematic SVG */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground">طرحواره شبیه‌ساز برش روی طاقه:</span>
        <div className="relative h-28 rounded-xl border bg-background p-3 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 500 100">
            {/* Fabric Roll Outline */}
            <rect x="10" y="10" width="480" height="80" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" rx="4" />
            {calculation.layoutType === 'PARALLEL' ? (
              <>
                {/* Parallel Panels */}
                <rect x="25" y="18" width="130" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="90" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پیش بالاتنه</text>

                <rect x="165" y="18" width="130" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="230" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پشت بالاتنه</text>

                <rect x="305" y="18" width="110" height="64" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="360" y="55" fontSize="10" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">آستین</text>
              </>
            ) : (
              <>
                {/* Stacked Panels */}
                <rect x="20" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="72" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پیش</text>

                <rect x="135" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="187" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">پشت</text>

                <rect x="250" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="302" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">دامن</text>

                <rect x="365" y="20" width="105" height="60" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" rx="2" />
                <text x="417" y="55" fontSize="9" fontFamily="Vazirmatn" textAnchor="middle" fill="#0F172A">آستین</text>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Recommended Fabrics List */}
      <div className="pt-2">
        <span className="text-xs font-semibold text-muted-foreground">پارچه‌های پیشنهادی طراح:</span>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {recommendedFabrics.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-xs bg-muted border px-2.5 py-1 rounded-lg text-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>{f}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
