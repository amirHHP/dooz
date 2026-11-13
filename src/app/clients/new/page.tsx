'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  POSTURE_TAG_LABELS_FA,
  PostureTag,
  MEASUREMENT_FIELDS_METADATA,
  AnthropometricMeasurements,
} from '@/types/crm';
import { toPersianDigits } from '@/lib/format';
import {
  UserPlus,
  ArrowRight,
  Save,
  AlertCircle,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [fitPreference, setFitPreference] = useState<'TIGHT' | 'CLASSIC' | 'LOOSE'>('CLASSIC');
  const [postureTags, setPostureTags] = useState<PostureTag[]>([]);
  const [notes, setNotes] = useState('');

  // Pre-fill standard Size 38 default values
  const [measurements, setMeasurements] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const field of MEASUREMENT_FIELDS_METADATA) {
      initial[field.key] = field.defaultVal;
    }
    return initial;
  });

  const handleMeasurementChange = (key: string, val: string) => {
    const num = parseFloat(val);
    setMeasurements((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const handleToggleTag = (tag: PostureTag) => {
    setPostureTags((prev) => {
      let next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      // Resolve mutual exclusion
      if (tag === 'SLOPING_SHOULDERS' && next.includes('SQUARE_SHOULDERS')) {
        next = next.filter((t) => t !== 'SQUARE_SHOULDERS');
      } else if (tag === 'SQUARE_SHOULDERS' && next.includes('SLOPING_SHOULDERS')) {
        next = next.filter((t) => t !== 'SLOPING_SHOULDERS');
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || null,
          gender,
          fitPreference,
          postureTags,
          notes: notes || null,
          measurements,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی در ثبت مشتری رخ داد');
      }

      router.push(`/clients/${data.client.id}`);
    } catch (err: any) {
      setError(err.message || 'خطا در ارتباط با سرور');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: 'CORE', label: 'اندازه‌های اصلی و محوری' },
    { id: 'UPPER_BODY', label: 'اندازه‌های بالاتنه و سینه' },
    { id: 'SLEEVE', label: 'اندازه‌های آستین و دست' },
    { id: 'TROUSER', label: 'اندازه‌های شلوار و اندام تحتانی' },
    { id: 'SKIRT', label: 'اندازه‌های دامن' },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست مشتریان</span>
        </Link>
        <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-mono">
          اندازه‌گیری آنتروپومتریک استاندارد
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <UserPlus className="h-7 w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            ثبت پرونده مشتری جدید
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          مشخصات فردی، اندازه‌گیری‌های ۲۶گانه به سانتی‌متر و عیوب اندامی مشتری را با دقت وارد فرمایید.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-foreground border-b pb-3">
            ۱. مشخصات هویتی و اولویت دوخت
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                نام مشتری <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثال: سارا"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                نام خانوادگی <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثال: محمدی"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">شماره تماس (اختیاری)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary font-mono text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">جنسیت</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="FEMALE">بانوان (پیش‌فرض)</option>
                <option value="MALE">آقایان</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-foreground">آزادی و فیت دلخواه لباس</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'TIGHT', label: 'جذب / چسبان (Tight)', desc: 'آزادی حداقل برای لباس‌های مجلسی' },
                { id: 'CLASSIC', label: 'معمولی / استاندارد (Classic)', desc: 'آزادی نرمال راحتی اندام' },
                { id: 'LOOSE', label: 'آزاد / اورسایز (Loose)', desc: 'آزادی زیاد برای پالتو و مانتو' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFitPreference(opt.id as any)}
                  className={`text-right p-3 rounded-xl border transition-colors ${
                    fitPreference === opt.id
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-background hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Posture Defect Tags */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-foreground">
              ۲. عیوب اندامی و ویژگی‌های وضعیتی بدن (Posture Defect Tags)
            </h3>
            <span className="text-xs text-muted-foreground">تعدیل خودکار فرمول‌های الگو</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(POSTURE_TAG_LABELS_FA).map(([tagKey, label]) => {
              const active = postureTags.includes(tagKey as PostureTag);
              return (
                <button
                  type="button"
                  key={tagKey}
                  onClick={() => handleToggleTag(tagKey as PostureTag)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all text-right ${
                    active
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200 shadow-sm'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{label}</span>
                  {active && <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mr-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: 26 Anthropometric Measurements */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-foreground">
              ۳. اندازه‌های کامل آنتروپومتریک (۲۶ مولفه به سانتی‌متر)
            </h3>
            <span className="text-xs text-primary font-bold">پیش‌فرض استاندارد سایز ۳۸</span>
          </div>

          <div className="space-y-8">
            {categories.map((cat) => {
              const fields = MEASUREMENT_FIELDS_METADATA.filter((f) => f.category === cat.id);
              if (fields.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-3">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    {cat.label}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {fields.map((f) => (
                      <div key={f.key} className="space-y-1 bg-muted/20 border rounded-xl p-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground">
                            {f.labelFa}
                            {f.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {toPersianDigits(f.min)} - {toPersianDigits(f.max)} cm
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            required={f.required}
                            min={f.min}
                            max={f.max}
                            value={measurements[f.key] ?? f.defaultVal}
                            onChange={(e) => handleMeasurementChange(String(f.key), e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-1.5 text-sm font-bold text-foreground font-mono text-left focus:ring-2 focus:ring-primary"
                            dir="ltr"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                            cm
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Tailor Private Notes */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-foreground">
              ۴. یادداشت‌های اختصاصی خیاط
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              {toPersianDigits(notes.length)} / ۵۰۰۰ کاراکتر
            </span>
          </div>

          <textarea
            rows={4}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="نکات خاص الگو، سلیقه مشتری در قد لباس، ترجیح جنس پارچه یا اصلاحات شخصی..."
            className="w-full rounded-xl border bg-background p-3 text-sm text-foreground focus:ring-2 focus:ring-primary leading-relaxed"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/clients"
            className="px-5 py-2.5 rounded-xl border text-sm font-bold hover:bg-muted transition-colors text-foreground"
          >
            انصراف
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'در حال ذخیره‌سازی...' : 'ذخیره پرونده مشتری'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
