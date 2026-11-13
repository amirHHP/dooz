"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardStep1, WizardStep1Data, validateWizardStep1 } from "@/components/creator/wizard-step-1";
import { WizardStep2, WizardStep2Data } from "@/components/creator/wizard-step-2";
import { WizardStep3, WizardStep3Data } from "@/components/creator/wizard-step-3";
import { WizardStep4, WizardStep4Data } from "@/components/creator/wizard-step-4";
import { WizardStep5, WizardStep5Data } from "@/components/creator/wizard-step-5";

export interface PatternWizardFormData {
  // Step 1
  title: string;
  slug: string;
  category: string;
  description: string;
  // Step 2
  draftingMethod: "MULLER" | "METRIC" | "GRLAWEIN";
  baseBlock: "BODICE" | "SKIRT" | "SLEEVE" | "TROUSER";
  fitType: "TIGHT" | "CLASSIC" | "LOOSE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  // Step 3
  coverImage: string;
  technicalFlatFront: string;
  technicalFlatBack: string;
  galleryImages: string[];
  // Step 4
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
  // Step 5
  price: number;
  isPublished: boolean;
}

const INITIAL_DATA: PatternWizardFormData = {
  title: "",
  slug: "",
  category: "OUTERWEAR",
  description: "",
  draftingMethod: "MULLER",
  baseBlock: "BODICE",
  fitType: "CLASSIC",
  difficulty: "INTERMEDIATE",
  coverImage: "/images/patterns/casual-raglan-trench-coat.jpg",
  technicalFlatFront: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><path d="M70,30 L130,30 L150,60 L140,280 L60,280 L50,60 Z" stroke="#334155" fill="none" stroke-width="2"/></svg>`,
  technicalFlatBack: `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"><path d="M70,30 L130,30 L150,60 L140,280 L60,280 L50,60 Z" stroke="#334155" fill="none" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="280" stroke="#64748b" stroke-dasharray="4"/></svg>`,
  galleryImages: [],
  attachmentType: "PARAMETRIC_PRESET",
  parametricConfig: {
    baseBlock: "BODICE",
    method: "MULLER",
    easeOffsets: {
      bust: 5.0,
      waist: 4.0,
      hip: 5.0,
    },
    dartModifications: [
      { source: "SHOULDER", target: "SIDE_SEAM", distanceBelowArmhole: 3.5 },
    ],
  },
  blueprintPdfUrl: "https://blob.vercel-storage.com/blueprints/coat-size-36-48.pdf",
  price: 250000,
  isPublished: true,
};

const STEPS = [
  { step: 1, name: "اطلاعات پایه", fields: ["title", "slug", "category", "description"] },
  { step: 2, name: "متد و سایزبندی", fields: ["draftingMethod", "fitType", "difficulty"] },
  { step: 3, name: "تصاویر و نمودارها", fields: ["coverImage", "technicalFlatFront", "technicalFlatBack"] },
  { step: 4, name: "پیوست الگو", fields: ["attachmentType", "parametricConfig", "blueprintPdfUrl"] },
  { step: 5, name: "قیمت‌گذاری و انتشار", fields: ["price", "isPublished"] },
];

export default function NewPatternWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatternWizardFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleUpdate = (fields: Partial<PatternWizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    // Clear errors for modified fields
    setErrors({});
  };

  const validateCurrentStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      const v = validateWizardStep1({
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        description: formData.description,
      });
      if (!v.valid) {
        if (!formData.title.trim()) newErrors.title = v.error || "عنوان الزامی است";
        else if (formData.title.length > 150) newErrors.title = v.error || "عنوان بیش از حد طولانی است";
        else newErrors.slug = v.error || "اسلاگ نامعتبر است";
      }
    } else if (stepNumber === 3) {
      if (!formData.coverImage.trim()) {
        newErrors.coverImage = "تصویر کاور الگو الزامی است";
      }
    } else if (stepNumber === 4) {
      if (formData.attachmentType === "BLUEPRINT_PDF") {
        if (!formData.blueprintPdfUrl.trim() || !formData.blueprintPdfUrl.endsWith(".pdf")) {
          newErrors.blueprintPdfUrl = "فایل پیوست الگو باید با فرمت PDF باشد";
        }
      }
    } else if (stepNumber === 5) {
      if (formData.price < 0) {
        newErrors.price = "قیمت نمی‌تواند منفی باشد";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSuccessBanner(null);
    try {
      // Simulate draft save
      await new Promise((r) => setTimeout(r, 600));
      setSuccessBanner("پیش‌نویس الگو با موفقیت ذخیره شد. می‌توانید بعداً آن را تکمیل کنید.");
      setTimeout(() => {
        router.push("/creator");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    // Validate all 5 steps
    for (let s = 1; s <= 5; s++) {
      if (!validateCurrentStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setSuccessBanner("الگوی شما با موفقیت در مارکت‌پلیس دوز منتشر شد!");
      setTimeout(() => {
        router.push("/creator");
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/creator" className="hover:underline">
            استودیو طراحان
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900 dark:text-white">انتشار الگوی جدید</span>
        </div>

        {/* Stepper Header */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                ویزارد ۵ مرحله‌ای انتشار الگو
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                مرحله {currentStep} از ۵: {STEPS[currentStep - 1].name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              ذخیره پیش‌نویس
            </button>
          </div>

          {/* Stepper progress bars */}
          <div className="grid grid-cols-5 gap-2">
            {STEPS.map((s) => {
              const isActive = s.step === currentStep;
              const isPassed = s.step < currentStep;
              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    if (s.step < currentStep || validateCurrentStep(currentStep)) {
                      setCurrentStep(s.step);
                    }
                  }}
                  className="text-right group"
                >
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? "bg-teal-500"
                        : isPassed
                        ? "bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                  <div className="text-[11px] font-bold mt-2 truncate text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                    {s.step}. {s.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center gap-2">
            <span>✔</span>
            <span>{successBanner}</span>
          </div>
        )}

        {/* Wizard Step Content Box */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          {currentStep === 1 && (
            <WizardStep1
              data={formData}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <WizardStep2
              data={formData}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStep === 3 && (
            <WizardStep3
              data={formData}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStep === 4 && (
            <WizardStep4
              data={formData}
              onChange={handleUpdate}
              errors={errors}
            />
          )}

          {currentStep === 5 && (
            <WizardStep5
              data={formData}
              onChange={handleUpdate}
              errors={errors}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Stepper Bottom Navigation (Steps 1 to 4) */}
          {currentStep < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                ← مرحله قبلی
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ذخیره پیش‌نویس
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition-all"
                >
                  مرحله بعدی →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
