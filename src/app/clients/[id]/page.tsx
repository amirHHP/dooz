import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { toPersianDigits, formatJalaliDate } from '@/lib/format';
import {
  POSTURE_TAG_LABELS_FA,
  PostureTag,
  MEASUREMENT_FIELDS_METADATA,
} from '@/types/crm';
import {
  Scissors,
  ArrowRight,
  User,
  Calendar,
  Phone,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    include: {
      savedDrafts: {
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const measurements = (client.measurements as Record<string, number>) || {};

  const categories = [
    { id: 'CORE', label: 'اندازه‌های اصلی و محوری' },
    { id: 'UPPER_BODY', label: 'اندازه‌های بالاتنه و سینه' },
    { id: 'SLEEVE', label: 'اندازه‌های آستین و دست' },
    { id: 'TROUSER', label: 'اندازه‌های شلوار و اندام تحتانی' },
    { id: 'SKIRT', label: 'اندازه‌های دامن' },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Top Back Nav */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به فهرست مشتریان</span>
        </Link>
        <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-mono">
          شناسه: {client.id}
        </span>
      </div>

      {/* Hero Header & Quick Actions */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">
                {client.firstName} {client.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                {client.phone && (
                  <span className="flex items-center gap-1 font-mono" dir="ltr">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{toPersianDigits(client.phone)}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>ثبت: {formatJalaliDate(client.createdAt)}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-muted font-bold text-foreground">
                  فیت: {client.fitPreference === 'TIGHT' ? 'جذب' : client.fitPreference === 'LOOSE' ? 'آزاد' : 'کلاسیک'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Studio Action */}
        <div className="flex items-center gap-3">
          <Link
            href={`/studio?clientId=${client.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
          >
            <Scissors className="h-4 w-4" />
            <span>الگوسازی برای این مشتری</span>
          </Link>
        </div>
      </div>

      {/* Posture Tags & Defect Flags */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b pb-3">
          <Activity className="h-4 w-4 text-amber-500" />
          <span>ویژگی‌های وضعیتی بدن و عیوب اندامی (Posture Adjustments)</span>
        </div>

        {client.postureTags && client.postureTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {client.postureTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800/40 px-3 py-1.5 rounded-xl font-bold"
              >
                <Sparkles className="h-3 w-3 text-amber-600" />
                <span>{POSTURE_TAG_LABELS_FA[tag as PostureTag] || tag}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            اندام استاندارد و متعادل بدون عیوب وضعیتی ثبت شده است.
          </p>
        )}
      </div>

      {/* 26 Measurements Detailed Grid */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-foreground">
            اندازه‌گیری‌های ۲۶گانه آنتروپومتریک
          </h2>
          <span className="text-xs text-muted-foreground">تمام ابعاد به سانتی‌متر (cm)</span>
        </div>

        <div className="space-y-6">
          {categories.map((cat) => {
            const fields = MEASUREMENT_FIELDS_METADATA.filter((f) => f.category === cat.id);
            if (fields.length === 0) return null;
            return (
              <div key={cat.id} className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground border-r-2 border-primary pr-2">
                  {cat.label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {fields.map((f) => {
                    const val = measurements[f.key];
                    return (
                      <div
                        key={f.key}
                        className="rounded-xl border bg-muted/20 p-3 space-y-1 text-center"
                      >
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {f.labelFa}
                        </span>
                        <p className="text-base font-black font-mono text-foreground">
                          {val !== undefined ? toPersianDigits(val) : '—'}
                          <span className="text-[10px] font-normal text-muted-foreground mr-1">
                            cm
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tailor Private Notes */}
      {client.notes && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm border-b pb-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>یادداشت‌های اختصاصی خیاط</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pt-2">
            {client.notes}
          </p>
        </div>
      )}

      {/* Saved Drafts History */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Layers className="h-4 w-4 text-primary" />
            <span>تاریخچه الگوهای پیش‌نویس شده برای این مشتری</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {toPersianDigits(client.savedDrafts.length)} الگو
          </span>
        </div>

        {client.savedDrafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">
              هنوز هیچ الگویی برای این مشتری ذخیره نشده است. با کلیک بر روی «الگوسازی برای این مشتری» شروع نمایید.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {client.savedDrafts.map((draft) => (
              <div key={draft.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{draft.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    پایه: {draft.baseBlock} | متد: {draft.method} | به‌روزرسانی: {formatJalaliDate(draft.updatedAt)}
                  </p>
                </div>
                <Link
                  href={`/studio?draftId=${draft.id}&clientId=${client.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-muted text-foreground transition-colors"
                >
                  <Scissors className="h-3.5 w-3.5" />
                  <span>باز کردن در استودیو</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
