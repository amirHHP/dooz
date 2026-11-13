import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatToman } from "@/lib/format";

export const metadata = {
  title: "استودیو طراحان | دوز (Dooz)",
  description: "مدیریت الگوهای تجاری، انتشار کدهای پارامتریک و نظارت بر فروش و درآمد",
};

export default async function CreatorDashboardPage() {
  const session = await auth();
  let userId = session?.user?.id;

  // Fallback to seeded creator for testing/development
  if (!userId) {
    const creatorUser = await prisma.user.findFirst({
      where: { role: "CREATOR" },
    });
    if (creatorUser) userId = creatorUser.id;
  }

  const creator = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        include: {
          createdPatterns: {
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : null;

  const patterns = creator?.createdPatterns || [];
  const totalSales = patterns.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const grossSales = patterns.reduce((sum, p) => sum + (p.price || 0) * (p.salesCount || 0), 0);
  const netEarnings = Math.floor(grossSales * 0.8);
  const walletBalance = creator?.walletBalance || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Creator Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-500/20">
              {creator?.name?.slice(0, 1) || "ط"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {creator?.name || "استودیو طراح دوز"}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-800">
                  طراح تایید شده
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {creator?.bio || "طراح تخصصی الگوهای پارامتریک و متدهای استاندارد بین‌المللی"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/creator/earnings"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-colors"
            >
              مدیریت درآمد و تسویه
            </Link>
            <Link
              href="/creator/new"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-md shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <span>+</span>
              <span>طراحی و انتشار الگوی جدید</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">تعداد الگوهای فعال</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {patterns.length} <span className="text-xs font-normal text-slate-400">الگو</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              آماده فروش در مارکت‌پلیس
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">تعداد دانلود و خرید موفق</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalSales} <span className="text-xs font-normal text-slate-400">سفارش</span>
            </div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-2 font-medium">
              تراکنش‌های تایید شده شتاب
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">کل فروش ناخالص</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatToman(grossSales)}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              سهم خالص شما: {formatToman(netEarnings)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              موجودی قابل برداشت کیف پول
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {formatToman(walletBalance)}
            </div>
            <Link
              href="/creator/earnings"
              className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
            >
              درخواست تسویه به شبا ←
            </Link>
          </div>
        </div>

        {/* Patterns List Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                فهرست الگوهای طراحی شده
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                الگوهای منتشر شده و پیش‌نویس‌های ذخیره شده در مارکت‌پلیس
              </p>
            </div>
            <Link
              href="/creator/new"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              + افزودن الگوی جدید
            </Link>
          </div>

          {patterns.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                هنوز هیچ الگویی منتشر نکرده‌اید
              </p>
              <p className="text-xs text-slate-400 mt-1">
                با استفاده از ویزارد ۵ مرحله‌ای اولین الگوی خود را به همراه کد پارامتریک منتشر کنید.
              </p>
              <Link
                href="/creator/new"
                className="inline-block mt-4 px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                شروع ویزارد انتشار الگو
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {patterns.map((p) => (
                <div
                  key={p.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                      {p.coverImage ? (
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          بدون کاور
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.title}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            p.isPublished
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {p.isPublished ? "منتشر شده" : "پیش‌نویس"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5">
                        <span>متد: {p.draftingMethod}</span>
                        <span>•</span>
                        <span>فروش: {p.salesCount} عدد</span>
                        <span>•</span>
                        <span>قیمت: {p.price === 0 ? "رایگان" : formatToman(p.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/marketplace/${p.slug}`}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      مشاهده در مارکت‌پلیس
                    </Link>
                    <Link
                      href={`/studio?baseBlock=${p.baseBlock || "BODICE"}&method=${p.draftingMethod}&preset=${p.slug}`}
                      className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors"
                    >
                      باز کردن در استودیو
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
