"use client";

import React from "react";

export interface WizardStep4Data {
  attachmentType: "PARAMETRIC_PRESET" | "BLUEPRINT_PDF";
  parametricConfig: {
    baseBlock: string;
    method: string;
    easeOffsets: {
      bust: number;
      waist: number;
      hip: number;
    };
    dartModifications: Array<{
      source: string;
      target: string;
      distanceBelowArmhole: number;
    }>;
  };
  blueprintPdfUrl: string;
}

interface WizardStep4Props {
  data: WizardStep4Data;
  onChange: (fields: Partial<WizardStep4Data>) => void;
  errors?: Record<string, string>;
}

export function WizardStep4({ data, onChange, errors }: WizardStep4Props) {
  const isParametric = data.attachmentType === "PARAMETRIC_PRESET";

  const handleEaseChange = (key: "bust" | "waist" | "hip", val: number) => {
    const positiveVal = Math.max(0, val);
    onChange({
      parametricConfig: {
        ...data.parametricConfig,
        easeOffsets: {
          ...data.parametricConfig.easeOffsets,
          [key]: positiveVal,
        },
      },
    });
  };

  const handleAddDartMod = () => {
    onChange({
      parametricConfig: {
        ...data.parametricConfig,
        dartModifications: [
          ...data.parametricConfig.dartModifications,
          { source: "SHOULDER", target: "SIDE_SEAM", distanceBelowArmhole: 3.5 },
        ],
      },
    });
  };

  const handleRemoveDartMod = (index: number) => {
    onChange({
      parametricConfig: {
        ...data.parametricConfig,
        dartModifications: data.parametricConfig.dartModifications.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          مرحله ۴: مدل پیوست الگو (پریست پارامتریک یا باندل PDF)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          مشخص کنید الگوی شما به عنوان فرمول پارامتریک اختصاصی در استودیو باز شود یا فایل چند سایزه PDF برای چاپ.
        </p>
      </div>

      {/* Attachment Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange({ attachmentType: "PARAMETRIC_PRESET" })}
          className={`text-right p-4 rounded-xl border transition-all ${
            isParametric
              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">۱. پریست پارامتریک هوشمند (Dooz CAD)</span>
            {isParametric && <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            الگو مستقیماً بر اساس ۲۶ اندازه اختصاصی خریدار بازتولید می‌شود و به خیاط اجازه شخصی‌سازی کامل در استودیو را می‌دهد.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange({ attachmentType: "BLUEPRINT_PDF" })}
          className={`text-right p-4 rounded-xl border transition-all ${
            !isParametric
              ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">۲. فایل الگو چندسایزه (Multi-Size PDF Bundle)</span>
            {!isParametric && <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            پکیج استاندارد شامل صفحات A4 تایل شده با مربع کالیبراسیون ۵ در ۵ سانتی‌متر و پلاتر A0 یکپارچه.
          </p>
        </button>
      </div>

      {/* Parametric Config Panel */}
      {isParametric ? (
        <div className="p-5 rounded-2xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/10 space-y-5">
          <div className="font-bold text-sm text-teal-900 dark:text-teal-200 flex items-center justify-between">
            <span>تنظیمات تلرانس و آزادی‌های الگو (cm)</span>
            <span className="text-xs text-teal-600 font-normal">اعمال روی خط سینه، کمر و باسن</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                آزادی دور سینه (Bust Ease)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={data.parametricConfig.easeOffsets.bust}
                  onChange={(e) => handleEaseChange("bust", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono text-left"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">سانتی‌متر</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                آزادی دور کمر (Waist Ease)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={data.parametricConfig.easeOffsets.waist}
                  onChange={(e) => handleEaseChange("waist", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono text-left"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">سانتی‌متر</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                آزادی دور باسن (Hip Ease)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={data.parametricConfig.easeOffsets.hip}
                  onChange={(e) => handleEaseChange("hip", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono text-left"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">سانتی‌متر</span>
              </div>
            </div>
          </div>

          {/* Dart Modifications */}
          <div className="space-y-3 pt-3 border-t border-teal-100 dark:border-teal-900/30">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                قوانین انتقال ساسون (Dart Manipulations)
              </label>
              <button
                type="button"
                onClick={handleAddDartMod}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                + افزودن انتقال ساسون
              </button>
            </div>

            {data.parametricConfig.dartModifications.map((mod, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span className="text-slate-400 font-mono">#{idx + 1}</span>
                <span className="text-slate-600 dark:text-slate-400">انتقال از:</span>
                <span className="font-bold">{mod.source}</span>
                <span className="text-slate-600 dark:text-slate-400">به:</span>
                <span className="font-bold">{mod.target}</span>
                <span className="text-slate-600 dark:text-slate-400">فاصله از زیر حلقه:</span>
                <span className="font-mono font-bold">{mod.distanceBelowArmhole} cm</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDartMod(idx)}
                  className="mr-auto text-rose-500 hover:text-rose-600"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* PDF Blueprint Upload Panel */
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            آدرس فایل PDF چند سایزه <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            dir="ltr"
            value={data.blueprintPdfUrl}
            onChange={(e) => onChange({ blueprintPdfUrl: e.target.value })}
            placeholder="https://blob.vercel-storage.com/blueprints/coat-size-36-48.pdf"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange({ blueprintPdfUrl: "https://blob.vercel-storage.com/blueprints/casual-trench-36-48.pdf" })}
              className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
              نمونه: فایل ترنچ ۳۶ تا ۴۸ (.pdf)
            </button>
          </div>
          {errors?.blueprintPdfUrl && (
            <p className="text-xs text-rose-500 font-medium">{errors.blueprintPdfUrl}</p>
          )}
          <p className="text-xs text-slate-400">
            فایل باید حتماً دارای پسوند pdf. باشد و حداکثر حجم مجاز ۵۰ مگابایت است.
          </p>
        </div>
      )}
    </div>
  );
}
