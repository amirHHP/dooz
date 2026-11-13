"use client";

import React from "react";

export interface WizardStep2Data {
  draftingMethod: "MULLER" | "METRIC" | "GRLAWEIN";
  baseBlock: "BODICE" | "SKIRT" | "SLEEVE" | "TROUSER";
  fitType: "TIGHT" | "CLASSIC" | "LOOSE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

interface WizardStep2Props {
  data: WizardStep2Data;
  onChange: (fields: Partial<WizardStep2Data>) => void;
  errors?: Record<string, string>;
}

export const DRAFTING_METHODS = [
  {
    id: "MULLER" as const,
    name: "متد مولر آلمان (Müller & Sohn)",
    badge: "دقت بالا و صنعتی",
    desc: "دقیق‌ترین متد الگوکشی برای کت، مانتو، پالتو و لباس‌های اندامی با فرمول‌های دقیق آناتومیک کارور و کف حلقه.",
  },
  {
    id: "METRIC" as const,
    name: "متد متریک انگلیس (Aldrich Metric)",
    badge: "مدرن و سریع",
    desc: "محاسبات ساده و تقارن متوازن جلو و پشت، استاندارد در طراحی صنعتی و تولید انبوه شومیز و پیراهن‌های روزمره.",
  },
  {
    id: "GRLAWEIN" as const,
    name: "متد گرلاوین فرانسه (Grlawein)",
    badge: "قالب تن بدون پرو",
    desc: "اندازه‌گیری دقیق بلندی بالاتنه جلو و پشت، بی‌نقص برای پیراهن‌های شب، برش‌های پرنسسی و لباس‌های بدون آستین.",
  },
];

export const BASE_BLOCKS = [
  { id: "BODICE" as const, label: "بالاتنه و پیراهن (Bodice)", desc: "پایه اصلی انواع مانتو، کت، بلوز و پیراهن" },
  { id: "SKIRT" as const, label: "دامن (Skirt)", desc: "پایه انواع دامن‌های فون، ترک و راسته" },
  { id: "SLEEVE" as const, label: "آستین (Sleeve)", desc: "آستین رگلان، کلوش، پاکتی و کتی" },
  { id: "TROUSER" as const, label: "شلوار (Trouser)", desc: "شلوار فاستونی، راسته و دم‌پا" },
];

export const FIT_TYPES = [
  { id: "TIGHT" as const, label: "اندامی (Tight)", desc: "آزادی حداقل (۰ تا ۲ سانتی‌متر)، قالب اندام" },
  { id: "CLASSIC" as const, label: "استاندارد (Classic)", desc: "آزادی متوسط (۴ تا ۶ سانتی‌متر)، راحتی استاندارد" },
  { id: "LOOSE" as const, label: "آزاد و اورسایز (Loose)", desc: "آزادی بالا (۸ تا ۱۲ سانتی‌متر)، کژوال" },
];

export const DIFFICULTIES = [
  { id: "BEGINNER" as const, label: "مبتدی (آسان)", badge: "سطح ۱", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { id: "INTERMEDIATE" as const, label: "متوسط (نیازمند تجربه خیاطی)", badge: "سطح ۲", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { id: "ADVANCED" as const, label: "پیشرفته (تخصصی و حرفه‌ای)", badge: "سطح ۳", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40" },
];

export function WizardStep2({ data, onChange }: WizardStep2Props) {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          مرحله ۲: متد الگوکشی، کادر پایه و سطح سختی
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          روش رسم فنی الگو و خصوصیات کالبدی آن را مشخص کنید تا در موتور CAD اعمال شود.
        </p>
      </div>

      {/* Drafting Method */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          متد الگوکشی <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3">
          {DRAFTING_METHODS.map((method) => {
            const isSelected = data.draftingMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onChange({ draftingMethod: method.id })}
                className={`text-right p-4 rounded-xl border transition-all text-sm ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-100 ring-2 ring-teal-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-2">
                    <span>{method.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                      {method.badge}
                    </span>
                  </div>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {method.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Base Block */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          کادر پایه الگو (Base Block) <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {BASE_BLOCKS.map((block) => {
            const isSelected = data.baseBlock === block.id;
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => onChange({ baseBlock: block.id })}
                className={`text-right p-3 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="truncate">{block.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fit Type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          نوع تن‌خور و میزان آزادی (Fit Ease)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {FIT_TYPES.map((fit) => {
            const isSelected = data.fitType === fit.id;
            return (
              <button
                key={fit.id}
                type="button"
                onClick={() => onChange({ fitType: fit.id })}
                className={`text-right p-3.5 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="text-sm font-bold">{fit.label}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-1">{fit.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          سطح دشواری دوخت و الگو
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {DIFFICULTIES.map((diff) => {
            const isSelected = data.difficulty === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => onChange({ difficulty: diff.id })}
                className={`text-right p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <span>{diff.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${diff.color}`}>
                  {diff.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
