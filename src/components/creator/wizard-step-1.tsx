"use client";

import React from "react";

export interface WizardStep1Data {
  title: string;
  slug: string;
  category: string;
  description: string;
}

interface WizardStep1Props {
  data: WizardStep1Data;
  onChange: (fields: Partial<WizardStep1Data>) => void;
  errors?: Record<string, string>;
}

export const CATEGORIES = [
  { id: "OUTERWEAR", label: "مانتو، پالتو و بارانی", desc: "انواع پوشش‌های بیرونی، ترنچ کت و بارانی" },
  { id: "DRESSES", label: "پیراهن و سارافون", desc: "پیراهن‌های مجلسی، ماکسی، کژوال و عصرانه" },
  { id: "TOPS_BLOUSES", label: "شومیز، بلوز و تاپ", desc: "شومیزهای اداری، تاپ‌های مجلسی و بلوزهای راحتی" },
  { id: "SKIRTS", label: "دامن", desc: "دامن‌های فون، کلوش، مدادی و پیلی‌دار" },
  { id: "TROUSERS", label: "شلوار", desc: "شلوارهای راسته، بوت‌کات، بگ و کلاسیک اتوخورده" },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateWizardStep1(data: WizardStep1Data): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { valid: false, error: "عنوان الگو الزامی است" };
  }
  if (data.title.length > 150) {
    return { valid: false, error: "عنوان الگو نمی‌تواند بیشتر از ۱۵۰ کاراکتر باشد" };
  }
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) {
    return {
      valid: false,
      error: "اسلاگ الگو باید فقط شامل حروف کوچک انگلیسی، اعداد و خط تیره باشد",
    };
  }
  return { valid: true };
}

export function WizardStep1({ data, onChange, errors }: WizardStep1Props) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const updates: Partial<WizardStep1Data> = { title: newTitle };
    // If slug is empty or was auto-generated from title previously, suggest new slug
    if (!data.slug || data.slug === slugify(data.title)) {
      const generated = slugify(newTitle);
      if (generated) updates.slug = generated;
    }
    onChange(updates);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          مرحله ۱: اطلاعات پایه الگو
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          عنوان تجاری، اسلاگ یکتا برای آدرس اینترنتی و دسته‌بندی لباس را مشخص کنید.
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="pattern-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          عنوان الگو <span className="text-rose-500">*</span>
        </label>
        <input
          id="pattern-title"
          type="text"
          value={data.title}
          onChange={handleTitleChange}
          placeholder="مثال: بارانی ترنچ کژوال با آستین رگلان و کمربند"
          maxLength={150}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
        />
        <div className="flex justify-between items-center text-xs text-slate-400">
          {errors?.title ? (
            <span className="text-rose-500 font-medium">{errors.title}</span>
          ) : (
            <span>عنوانی جذاب و توصیف‌کننده برای خریداران انتخاب کنید.</span>
          )}
          <span>{data.title.length} / ۱۵۰ کاراکتر</span>
        </div>
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <label htmlFor="pattern-slug" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          اسلاگ آدرس اینترنتی (Slug) <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="pattern-slug"
            type="text"
            dir="ltr"
            value={data.slug}
            onChange={(e) => onChange({ slug: e.target.value.toLowerCase().trim() })}
            placeholder="casual-raglan-trench-coat"
            className="w-full pl-4 pr-32 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-mono"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono select-none" dir="ltr">
            dooz.ir/p/
          </span>
        </div>
        {errors?.slug ? (
          <p className="text-xs text-rose-500 font-medium">{errors.slug}</p>
        ) : (
          <p className="text-xs text-slate-400">
            فقط حروف کوچک انگلیسی (a-z)، اعداد (0-9) و خط تیره (-) مجاز است.
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          دسته‌بندی الگو <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = data.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id })}
                className={`text-right p-3.5 rounded-xl border transition-all text-sm ${
                  isSelected
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>{cat.label}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="pattern-desc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          توضیحات و ویژگی‌های طراحی
        </label>
        <textarea
          id="pattern-desc"
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="نکات خیاطی، متد طراحی، میزان آزادی، نوع پارچه پیشنهادی و ویژگی‌های آستین و یقه..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm resize-y"
        />
      </div>
    </div>
  );
}
