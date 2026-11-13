"use client";

import React from "react";
import { calculatePurchaseSplit } from "@/lib/ledger";
import { formatToman } from "@/lib/format";

export interface WizardStep5Data {
  price: number;
  isPublished: boolean;
}

interface WizardStep5Props {
  data: WizardStep5Data;
  onChange: (fields: Partial<WizardStep5Data>) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isSubmitting?: boolean;
}

export function WizardStep5({
  data,
  onChange,
  errors,
  onSaveDraft,
  onPublish,
  isSubmitting = false,
}: WizardStep5Props) {
  const isFree = data.price === 0;
  const split = calculatePurchaseSplit(data.price);

  const handlePriceChange = (val: number) => {
    const cleanPrice = Math.max(0, Math.round(Number(val) || 0));
    onChange({ price: cleanPrice });
  };

  const handleToggleFree = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange({ price: 0 });
    } else {
      onChange({ price: 150000 });
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          مرحله ۵: قیمت‌گذاری، درآمدسازنده و انتشار نهایی
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          قیمت فروش الگوی خود را به تومان تعیین کنید. سیستم حسابداری دوز به صورت خودکار سهم ۸۰ درصدی شما را محاسبه می‌کند.
        </p>
      </div>

      {/* Free Toggle */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            عرضه رایگان الگو (جهت جذب مخاطب و پروموشن طراح)
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            الگوهای رایگان بدون پرداخت برای تمام کاربران قابل دانلود و باز شدن در استودیو خواهند بود.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isFree}
            onChange={handleToggleFree}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
        </label>
      </div>

      {/* Price Input (Disabled if free) */}
      {!isFree && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            مبلغ فروش الگو (تومان) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="10000"
              min="0"
              value={data.price}
              onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
              placeholder="مثال: ۳۵۰,۰۰۰"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-base font-bold font-mono text-left"
            />
            <span className="absolute right-4 top-3.5 text-sm text-slate-400 font-medium">تومان</span>
          </div>
          {errors?.price && (
            <p className="text-xs text-rose-500 font-medium">{errors.price}</p>
          )}

          {/* Quick Price Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[100000, 150000, 250000, 390000, 500000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => handlePriceChange(quick)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  data.price === quick
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                }`}
              >
                {formatToman(quick)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 80/20 Real-Time Revenue Calculator Card */}
      <div className="p-6 rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/60 to-emerald-50/30 dark:from-teal-950/20 dark:to-emerald-950/10 space-y-4">
        <div className="flex items-center justify-between border-b border-teal-100 dark:border-teal-900/40 pb-3">
          <span className="font-bold text-sm text-teal-950 dark:text-teal-100">
            محاسبه شفاف درآمد مالی (مدل ۸۰/۲۰ دوز)
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
            تضمین بدون نشت ریال
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-teal-100 dark:border-teal-900/30">
            <div className="text-xs text-slate-500 dark:text-slate-400">مبلغ نهایی خریدار</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {formatToman(split.priceToman)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">پرداخت آنلاین با درگاه شتاب</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              سهم خالص شما (۸۰٪ طراح)
            </div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-200 mt-1">
              {formatToman(split.creatorEarningsToman)}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
              واریز آنی به موجودی کیف پول شما
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">کارمزد پلتفرم دوز (۲۰٪)</div>
            <div className="text-base font-bold text-slate-600 dark:text-slate-300 mt-1">
              {formatToman(split.platformFeeToman)}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">هزینه سرور، میزبانی فایل و درگاه</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          ذخیره به عنوان پیش‌نویس
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-teal-500/25 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "در حال انتشار..." : "انتشار عمومی در مارکت‌پلیس"}
        </button>
      </div>
    </div>
  );
}
