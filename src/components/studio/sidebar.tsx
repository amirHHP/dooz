'use client';

import React, { useState } from 'react';
import {
  BlockType,
  DraftingMethod,
  FitPreference,
  ShoulderSlope,
  PostureAdjustments,
} from '@/types/drafting';
import { toPersianDigits } from '@/lib/format';
import {
  FileDown,
  Layers,
  Printer,
  FileCode,
  Sliders,
  CheckCircle2,
  Download,
  Sparkles,
} from 'lucide-react';

export interface StudioSidebarProps {
  blockType: BlockType;
  setBlockType: (b: BlockType) => void;
  method: DraftingMethod;
  setMethod: (m: DraftingMethod) => void;
  fitPreference: FitPreference;
  setFitPreference: (f: FitPreference) => void;
  posture: PostureAdjustments;
  setPosture: React.Dispatch<React.SetStateAction<PostureAdjustments>>;
  measurements: Record<string, number>;
  onMeasurementChange: (key: string, val: number) => void;
  onExport: (format: 'A4_PDF' | 'A0_PDF' | 'SVG' | 'DXF') => Promise<void>;
  isExporting?: boolean;
}

const DEFAULT_FALLBACKS: Record<string, number> = {
  sleeveLength: 58.0,
  armCirc: 27.5,
  wristCirc: 16.0,
  bust: 88.0,
  waist: 70.0,
  hip: 94.0,
  hipDepth: 20.0,
  skirtLength: 65.0,
  backLength: 41.0,
  frontLength: 43.5,
  acrossBack: 34.5,
  acrossFront: 32.0,
  neck: 36.0,
  shoulder: 12.5,
  bustHeight: 26.5,
  bustSpan: 18.5,
  trouserLength: 102.0,
  crotchDepth: 26.0,
  kneeWidth: 22.0,
  hemWidth: 20.0,
};

export function StudioSidebar({
  blockType,
  setBlockType,
  method,
  setMethod,
  fitPreference,
  setFitPreference,
  posture,
  setPosture,
  measurements,
  onMeasurementChange,
  onExport,
  isExporting = false,
}: StudioSidebarProps) {
  const [activeTab, setActiveTab] = useState<'BLOCKS' | 'MEASUREMENTS' | 'POSTURE' | 'EXPORT'>('BLOCKS');

  const blockOptions: { id: BlockType; label: string; desc: string }[] = [
    { id: 'SKIRT', label: 'دامن پایه', desc: 'مدلسازی دامن فون، راسته و چاک‌دار' },
    { id: 'BODICE', label: 'بالاتنه پیشرفته', desc: 'بالاتنه با پنس‌های سرشانه و کمر' },
    { id: 'SLEEVE', label: 'آستین استاندارد', desc: 'آستین هماهنگ با دور حلقه بالاتنه' },
    { id: 'TROUSER', label: 'شلوار کلاسیک', desc: 'شلوار با خط اتو و فاق متناسب' },
  ];

  const methodOptions: { id: DraftingMethod; label: string; desc: string }[] = [
    { id: 'MULLER', label: 'مولر آلمان', desc: 'دقیق‌ترین متد برای اندام ایرانی و ساسون‌ها' },
    { id: 'METRIC', label: 'متریک (الدریچ)', desc: 'تقسیم متوازن و ساده پانل‌های جلو و پشت' },
    { id: 'GRLAWEIN', label: 'گرلاوین', desc: 'متد بومی‌سازی شده خیاطی با محاسبات سریع' },
  ];

  const fitOptions: {
    id: FitPreference;
    label: string;
    sublabel: string;
    easeCm: string;
    bars: number;
    desc: string;
  }[] = [
    {
      id: 'TIGHT',
      label: 'جذب',
      sublabel: 'بدن‌نما و چسبان',
      easeCm: '۰ تا ۱.۵ cm',
      bars: 1,
      desc: 'حداقل آزادی برای پارچه‌های کشی یا لباس‌های اندامی',
    },
    {
      id: 'CLASSIC',
      label: 'کلاسیک',
      sublabel: 'استاندارد اداری و رسمی',
      easeCm: '۲ تا ۴ cm',
      bars: 2,
      desc: 'آزادی نرمال و متعادل برای پوشاک روزمره و مانتو',
    },
    {
      id: 'LOOSE',
      label: 'آزاد',
      sublabel: 'راحت و گشاد',
      easeCm: '۵ تا ۸ cm',
      bars: 3,
      desc: 'حداکثر آزادی برای لباس‌های راحت، پالتو و مدل‌های آزاد',
    },
  ];

  // Relevant measurements to show depending on block type
  const getRelevantKeys = () => {
    switch (blockType) {
      case 'SKIRT':
        return [
          { key: 'waist', label: 'دور کمر', min: 45, max: 140 },
          { key: 'hip', label: 'دور باسن بزرگ', min: 60, max: 170 },
          { key: 'hipDepth', label: 'بلندی باسن', min: 15, max: 28 },
          { key: 'skirtLength', label: 'قد دامن دلخواه', min: 30, max: 120 },
        ];
      case 'BODICE':
        return [
          { key: 'bust', label: 'دور سینه', min: 60, max: 160 },
          { key: 'waist', label: 'دور کمر', min: 45, max: 140 },
          { key: 'hip', label: 'دور باسن', min: 60, max: 170 },
          { key: 'backLength', label: 'قد بالاتنه پشت', min: 30, max: 55 },
          { key: 'frontLength', label: 'قد بالاتنه جلو', min: 30, max: 60 },
          { key: 'acrossBack', label: 'کارور پشت', min: 25, max: 50 },
          { key: 'acrossFront', label: 'کارور جلو', min: 25, max: 50 },
          { key: 'neck', label: 'دور طوق گردن', min: 25, max: 55 },
          { key: 'shoulder', label: 'طول سرشانه', min: 8, max: 20 },
          { key: 'bustHeight', label: 'بلندی سینه', min: 18, max: 40 },
          { key: 'bustSpan', label: 'فاصله سینه', min: 12, max: 30 },
        ];
      case 'SLEEVE':
        return [
          { key: 'sleeveLength', label: 'قد آستین (سرشانه تا مچ)', min: 35, max: 80 },
          { key: 'armCirc', label: 'دور بازو (برجسته‌ترین قسمت)', min: 18, max: 55 },
          { key: 'wristCirc', label: 'دور مچ دست', min: 12, max: 32 },
          { key: 'bust', label: 'دور سینه مبنای حلقه', min: 60, max: 160 },
        ];
      case 'TROUSER':
        return [
          { key: 'waist', label: 'دور کمر', min: 45, max: 140 },
          { key: 'hip', label: 'دور باسن', min: 60, max: 170 },
          { key: 'trouserLength', label: 'قد شلوار از پهلو', min: 70, max: 130 },
          { key: 'crotchDepth', label: 'بلندی فاق', min: 18, max: 38 },
          { key: 'kneeWidth', label: 'عرض دمپای زانو', min: 18, max: 35 },
          { key: 'hemWidth', label: 'عرض دمپای مچ', min: 16, max: 32 },
        ];
    }
  };

  return (
    <div className="w-full lg:w-96 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
      {/* Instant Fit Preference Selector (Always Visible) */}
      <div className="bg-muted/40 border rounded-2xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-primary" />
            <span>میزان آزادی و فیت الگو</span>
          </label>
          <span className="text-[11px] font-bold text-primary">
            {fitPreference === 'TIGHT'
              ? '۰ تا ۱.۵ cm (جذب)'
              : fitPreference === 'CLASSIC'
              ? '۲ تا ۴ cm (کلاسیک)'
              : '۵ تا ۸ cm (آزاد)'}
          </span>
        </div>

        {/* 3 Fit Options with Visual Ease Meters */}
        <div className="grid grid-cols-3 gap-2">
          {fitOptions.map((f) => {
            const isSelected = fitPreference === f.id;
            return (
              <button
                type="button"
                key={f.id}
                onClick={() => setFitPreference(f.id)}
                className={`flex flex-col items-center justify-between p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]'
                    : 'bg-background hover:bg-muted text-foreground'
                }`}
                title={f.desc}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black">{f.label}</span>
                  {/* Ease Level Indicators */}
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3].map((dot) => (
                      <span
                        key={dot}
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          dot <= f.bars
                            ? isSelected
                              ? 'bg-primary-foreground'
                              : 'bg-primary'
                            : isSelected
                            ? 'bg-primary-foreground/30'
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </span>
                </div>
                <span
                  className={`text-[10px] mt-1 font-mono ${
                    isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {toPersianDigits(f.easeCm)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="grid grid-cols-4 gap-1 bg-muted/60 p-1 rounded-xl text-xs font-bold text-center">
        <button
          type="button"
          onClick={() => setActiveTab('BLOCKS')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'BLOCKS' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          الگو و متد
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MEASUREMENTS')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'MEASUREMENTS' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          اندازه‌ها
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POSTURE')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'POSTURE' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          عیوب اندام
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('EXPORT')}
          className={`py-1.5 rounded-lg transition-colors ${
            activeTab === 'EXPORT' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
          }`}
        >
          خروجی
        </button>
      </div>

      {/* Tab 1: Blocks & Methods */}
      {activeTab === 'BLOCKS' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">نوع پایه الگو (Base Block)</label>
            <div className="grid grid-cols-2 gap-2">
              {blockOptions.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => setBlockType(b.id)}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    blockType === b.id
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-foreground">متد رسم الگو (Drafting Method)</label>
            <div className="space-y-2">
              {methodOptions.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between ${
                    method === m.id
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-foreground">{m.label}</span>
                    <span className="text-[11px] text-muted-foreground block">{m.desc}</span>
                  </div>
                  {method === m.id && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Measurements */}
      {activeTab === 'MEASUREMENTS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-foreground">اندازه‌های فعال (cm)</span>
            <span className="text-[11px] text-muted-foreground">محاسبه آنی هندسه الگو</span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {getRelevantKeys().map((item) => {
              const fallback = DEFAULT_FALLBACKS[item.key] ?? 50;
              const val = measurements[item.key] ?? fallback;
              return (
                <div key={item.key} className="bg-muted/30 border rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{item.label}</span>
                    <span className="font-mono text-primary font-bold">{toPersianDigits(val)} cm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMeasurementChange(item.key, Math.max(item.min, val - 0.5))}
                      className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-bold text-xs"
                      title="کاهش نیم سانتی‌متر"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={0.5}
                      value={val}
                      onChange={(e) => onMeasurementChange(item.key, parseFloat(e.target.value))}
                      className="flex-1 accent-primary cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => onMeasurementChange(item.key, Math.min(item.max, val + 0.5))}
                      className="px-2.5 py-1 rounded-lg border bg-background hover:bg-muted font-bold text-xs"
                      title="افزایش نیم سانتی‌متر"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Posture Adjustments */}
      {activeTab === 'POSTURE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-foreground">تعدیل عیوب اندامی</span>
            <span className="text-[11px] text-muted-foreground">اعمال در خطوط الگو</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted cursor-pointer text-xs font-bold">
              <span>شکم برجسته (Prominent Abdomen)</span>
              <input
                type="checkbox"
                checked={!!posture.prominentAbdomen}
                onChange={(e) =>
                  setPosture((prev) => ({ ...prev, prominentAbdomen: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted cursor-pointer text-xs font-bold">
              <span>گودی کمر (Swayback Lordosis)</span>
              <input
                type="checkbox"
                checked={!!posture.swayback}
                onChange={(e) =>
                  setPosture((prev) => ({ ...prev, swayback: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted cursor-pointer text-xs font-bold">
              <span>باسن برجسته (Prominent Hip)</span>
              <input
                type="checkbox"
                checked={!!posture.prominentHip}
                onChange={(e) =>
                  setPosture((prev) => ({ ...prev, prominentHip: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-primary"
              />
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-foreground">شیب سرشانه (Shoulder Slope)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NORMAL', label: 'طبیعی' },
                { id: 'SLOPING', label: 'افتاده' },
                { id: 'SQUARE', label: 'صاف / مستطیلی' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() =>
                    setPosture((prev) => ({ ...prev, shoulderSlope: opt.id as ShoulderSlope }))
                  }
                  className={`py-2 text-center rounded-xl border text-xs font-bold transition-all ${
                    (posture.shoulderSlope || 'NORMAL') === opt.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Export Actions */}
      {activeTab === 'EXPORT' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-foreground">خروجی‌های مقیاس ۱:۱</span>
            <span className="text-[11px] text-muted-foreground">صنعتی و چاپ خانگی</span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport('A4_PDF')}
              className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted text-right transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Printer className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">چاپ چندصفحه‌ای A4</span>
                  <span className="text-[11px] text-muted-foreground block">
                    مختصات شیت، خط برش و مربع کالیبراسیون ۵×۵cm
                  </span>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport('A0_PDF')}
              className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted text-right transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileDown className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">پلاتر یکپارچه A0</span>
                  <span className="text-[11px] text-muted-foreground block">
                    رول طولی بدون نیاز به چسباندن برگه‌ها
                  </span>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport('SVG')}
              className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted text-right transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">وکتور خام SVG</span>
                  <span className="text-[11px] text-muted-foreground block">
                    لایرها، راستا و مشخصات فارسی
                  </span>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={() => onExport('DXF')}
              className="w-full flex items-center justify-between p-3 rounded-xl border bg-background hover:bg-muted text-right transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-xs font-bold text-foreground block">استاندارد ASTM / AAMA-DXF</span>
                  <span className="text-[11px] text-muted-foreground block">
                    سازگار با دستگاه‌های برش خودکار و نرم‌افزارهای Gerber و Lectra
                  </span>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
