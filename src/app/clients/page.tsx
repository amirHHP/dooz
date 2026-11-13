import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { toPersianDigits } from '@/lib/format';
import { POSTURE_TAG_LABELS_FA, PostureTag } from '@/types/crm';
import {
  UserPlus,
  Scissors,
  Search,
  UserCheck,
  ChevronLeft,
  Filter,
  Ruler,
  FolderHeart,
} from 'lucide-react';

interface ClientsPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { q, tag } = await searchParams;
  const session = await auth();
  let tailorId = session?.user?.id;

  if (!tailorId) {
    const demoTailor = await prisma.user.findFirst({
      where: { email: 'tailor@dooz.ir' },
    });
    if (demoTailor) {
      tailorId = demoTailor.id;
    }
  }

  const clients = await prisma.clientProfile.findMany({
    where: {
      ...(tailorId ? { tailorId } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q } },
            ],
          }
        : {}),
      ...(tag ? { postureTags: { has: tag } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { savedDrafts: true },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <FolderHeart className="h-7 w-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              مدیریت و پرونده مشتریان خیاطی
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            ثبت اندازه‌های آنتروپومتریک ۲۶گانه، ایرادهای اندامی، و اجرای مستقیم الگوسازی
          </p>
        </div>

        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          <span>افزودن پرونده مشتری جدید</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border rounded-2xl p-4 shadow-sm">
        <form method="GET" className="relative w-full md:w-96">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q || ''}
            placeholder="جستجوی نام مشتری یا شماره تماس..."
            className="w-full rounded-xl border bg-background pr-10 pl-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">فیلتر عیوب اندامی:</span>
          <Link
            href="/clients"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              !tag ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            همه
          </Link>
          {Object.entries(POSTURE_TAG_LABELS_FA).slice(0, 4).map(([tagKey, label]) => (
            <Link
              key={tagKey}
              href={`/clients?tag=${tagKey}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                tag === tagKey
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-lg font-bold text-foreground mt-4">پرونده‌ای یافت نشد</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            مشتری جدیدی با این مشخصات یافت نشد یا هنوز مشتری ثبت نکرده‌اید. با کلیک بر روی دکمه زیر پرونده جدید ایجاد نمایید.
          </p>
          <div className="mt-6">
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <UserPlus className="h-4 w-4" />
              <span>ثبت اولین مشتری</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => {
            const m = (client.measurements as Record<string, number>) || {};
            return (
              <div
                key={client.id}
                className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {client.firstName} {client.lastName}
                      </h3>
                      {client.phone && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5" dir="ltr">
                          {toPersianDigits(client.phone)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted font-bold text-foreground">
                      {client.gender === 'FEMALE' ? 'بانو' : 'آقا'}
                    </span>
                  </div>

                  {/* Posture defect tags */}
                  {client.postureTags && client.postureTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {client.postureTags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-md font-medium"
                        >
                          {POSTURE_TAG_LABELS_FA[t as PostureTag] || t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Measurements Summary Table */}
                  <div className="grid grid-cols-4 gap-2 bg-muted/40 rounded-xl p-2.5 text-center text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">قد</span>
                      <span className="font-mono font-bold text-foreground">
                        {toPersianDigits(m.totalHeight || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">سینه</span>
                      <span className="font-mono font-bold text-foreground">
                        {toPersianDigits(m.bustCircumference || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">کمر</span>
                      <span className="font-mono font-bold text-foreground">
                        {toPersianDigits(m.waistCircumference || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">باسن</span>
                      <span className="font-mono font-bold text-foreground">
                        {toPersianDigits(m.hipCircumference || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Private notes excerpt */}
                  {client.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      {client.notes}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t">
                  <Link
                    href={`/studio?clientId=${client.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    <span>الگوسازی برای این مشتری</span>
                  </Link>

                  <Link
                    href={`/clients/${client.id}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="مشاهده پرونده کامل"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
