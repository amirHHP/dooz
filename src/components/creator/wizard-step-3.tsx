"use client";

import React, { useState } from "react";

export interface WizardStep3Data {
  coverImage: string;
  technicalFlatFront: string;
  technicalFlatBack: string;
  galleryImages: string[];
}

interface WizardStep3Props {
  data: WizardStep3Data;
  onChange: (fields: Partial<WizardStep3Data>) => void;
  errors?: Record<string, string>;
}

export function WizardStep3({ data, onChange, errors }: WizardStep3Props) {
  const [activeTab, setActiveTab] = useState<"FRONT" | "BACK">("FRONT");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      onChange({
        galleryImages: [...data.galleryImages, newGalleryUrl.trim()],
      });
      setNewGalleryUrl("");
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    onChange({
      galleryImages: data.galleryImages.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          مرحله ۳: تصویر شاخص و اسکچ‌های وکتور فنی (Technical Flats)
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          تصویر تن‌پوش واقعی و نقشه‌های خطی جلو و پشت لباس را جهت راهنمایی خریداران و خیاطان بارگذاری کنید.
        </p>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          تصویر شاخص کاور (Cover Photograph) <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              dir="ltr"
              value={data.coverImage}
              onChange={(e) => onChange({ coverImage: e.target.value })}
              placeholder="https://... یا /images/patterns/trench.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm font-mono"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ coverImage: "/images/patterns/casual-raglan-trench-coat.jpg" })}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
              >
                نمونه ۱: ترنچ کت
              </button>
              <button
                type="button"
                onClick={() => onChange({ coverImage: "/images/patterns/princess-seam-evening-dress.jpg" })}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
              >
                نمونه ۲: پیراهن شب
              </button>
            </div>
            {errors?.coverImage && (
              <p className="text-xs text-rose-500 font-medium">{errors.coverImage}</p>
            )}
          </div>

          {/* Thumbnail preview */}
          <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
            {data.coverImage ? (
              <img
                src={data.coverImage}
                alt="پیش‌نمایش کاور"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-[10px] text-slate-400 text-center px-1">بدون تصویر</span>
            )}
          </div>
        </div>
      </div>

      {/* Technical Flat Vector Sketches */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            اسکچ‌های فنی خطی (Technical Flat Vector Illustrations) <span className="text-rose-500">*</span>
          </label>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("FRONT")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "FRONT"
                  ? "bg-white dark:bg-slate-900 font-bold shadow-sm text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              نمای روبرو (Front)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("BACK")}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === "BACK"
                  ? "bg-white dark:bg-slate-900 font-bold shadow-sm text-teal-600 dark:text-teal-400"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              نمای پشت (Back)
            </button>
          </div>
        </div>

        {activeTab === "FRONT" ? (
          <div className="space-y-2">
            <textarea
              rows={4}
              dir="ltr"
              value={data.technicalFlatFront}
              onChange={(e) => onChange({ technicalFlatFront: e.target.value })}
              placeholder="کد وکتور SVG یا آدرس تصویر خطی نمای روبرو..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-xs font-mono resize-y"
            />
            <p className="text-xs text-slate-400">
              خطوط درز، ساسون‌های جلو، جادکمه‌ها و یقه در نمای جلو به نمایش درمی‌آیند.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={4}
              dir="ltr"
              value={data.technicalFlatBack}
              onChange={(e) => onChange({ technicalFlatBack: e.target.value })}
              placeholder="کد وکتور SVG یا آدرس تصویر خطی نمای پشت..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-xs font-mono resize-y"
            />
            <p className="text-xs text-slate-400">
              چاک پشت، ساسون‌های گودی کمر و درز میانی پشت در این بخش مشخص می‌شوند.
            </p>
          </div>
        )}
      </div>

      {/* Gallery Images */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          تصاویر گالری تن‌پوش و جزئیات دوخت
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            dir="ltr"
            value={newGalleryUrl}
            onChange={(e) => setNewGalleryUrl(e.target.value)}
            placeholder="آدرس اینترنتی تصویر تکمیلی..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAddGalleryImage}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            افزودن
          </button>
        </div>

        {data.galleryImages.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
              >
                <img src={img} alt={`گالری ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute inset-0 bg-rose-900/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
