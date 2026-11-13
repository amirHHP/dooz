"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EarningsChart, MonthlyEarningsPoint } from "@/components/creator/earnings-chart";
import { formatToman, formatJalaliDate, toLatinDigits } from "@/lib/format";
import { validateSheba, ShebaValidationResult } from "@/lib/ledger";

interface TransactionRow {
  id: string;
  amount: number;
  type: string;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export default function CreatorEarningsPage() {
  const [timeFilter, setTimeFilter] = useState<"LAST_30_DAYS" | "LAST_6_MONTHS" | "ALL_TIME">("LAST_6_MONTHS");
  const [walletBalance, setWalletBalance] = useState(2400000);
  const [grossSales, setGrossSales] = useState(5000000);
  const [netEarnings, setNetEarnings] = useState(4000000);
  const [salesCount, setSalesCount] = useState(16);

  const [chartData, setChartData] = useState<MonthlyEarningsPoint[]>([
    { month: "فروردین", revenue: 1200000, net: 960000 },
    { month: "اردیبهشت", revenue: 1800000, net: 1440000 },
    { month: "خرداد", revenue: 2000000, net: 1600000 },
  ]);

  const [transactions, setTransactions] = useState<TransactionRow[]>([
    {
      id: "tx-sale-001",
      amount: 312000,
      type: "CREDIT",
      balanceAfter: 2400000,
      description: "فروش الگوی بارانی ترنچ کژوال با آستین رگلان (سهم ۸۰٪ سازنده)",
      createdAt: new Date().toISOString(),
    },
    {
      id: "tx-sale-002",
      amount: 280000,
      type: "CREDIT",
      balanceAfter: 2088000,
      description: "فروش الگوی مانتو کتی کلاسیک (سهم ۸۰٪ سازنده)",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "tx-payout-001",
      amount: -1000000,
      type: "PAYOUT",
      balanceAfter: 1808000,
      description: "درخواست تسویه حساب به شماره شبا IR060560000000012345678901 (بانک سامان)",
      createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
  ]);

  // Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<string>("250000");
  const [shebaInput, setShebaInput] = useState<string>("IR470569876543210123456789");
  const [accountHolder, setAccountHolder] = useState<string>("مهسا رادمنش");
  const [shebaValidation, setShebaValidation] = useState<ShebaValidationResult>({ valid: true, bankName: "بانک سامان" });
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Validate Sheba on change
  useEffect(() => {
    if (shebaInput) {
      const clean = toLatinDigits(shebaInput);
      const res = validateSheba(clean);
      setShebaValidation(res);
    }
  }, [shebaInput]);

  const handleOpenPayout = () => {
    setPayoutError(null);
    setPayoutSuccess(null);
    setIsPayoutModalOpen(true);
  };

  const handleClosePayout = () => {
    setIsPayoutModalOpen(false);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError(null);
    setPayoutSuccess(null);

    const amountNum = Math.round(Number(toLatinDigits(payoutAmount)) || 0);

    if (amountNum < 100000) {
      setPayoutError("حداقل مبلغ تسویه ۱۰۰,۰۰۰ تومان می‌باشد");
      return;
    }

    if (amountNum > walletBalance) {
      setPayoutError("مبلغ درخواستی بیشتر از موجودی قابل تسویه است");
      return;
    }

    if (!shebaValidation.valid) {
      setPayoutError(shebaValidation.error || "شماره شبا نامعتبر است");
      return;
    }

    setIsSubmittingPayout(true);
    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNum,
          shebaNumber: shebaValidation.sheba || shebaInput,
          accountHolderName: accountHolder,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setPayoutError(json.error || "خطا در ثبت درخواست تسویه");
        return;
      }

      // Update local state
      const newBal = json.walletBalance ?? walletBalance - amountNum;
      setWalletBalance(newBal);

      setTransactions((prev) => [
        {
          id: json.payout?.id || `tx-payout-${Date.now()}`,
          amount: -amountNum,
          type: "PAYOUT",
          balanceAfter: newBal,
          description: `درخواست تسویه به شماره شبا ${shebaValidation.sheba || shebaInput} (${shebaValidation.bankName || "بانک"})`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setPayoutSuccess(`درخواست تسویه به مبلغ ${formatToman(amountNum)} با موفقیت ثبت گردید و طی ۲۴ ساعت پایا خواهد شد.`);
      setTimeout(() => {
        setIsPayoutModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setPayoutError("خطای اتصال به سرور: " + err.message);
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/creator" className="hover:underline">
            استودیو طراحان
          </Link>
          <span>/</span>
          <span className="font-bold text-slate-900 dark:text-white">امور مالی و تسویه حساب</span>
        </div>

        {/* Dashboard Title & Payout Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              داشبورد مالی و درآمد طراح (مدل ۸۰/۲۰)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              شفافیت کامل درآمد ناخالص، کارمزد ۲۰ درصدی پلتفرم و تسویه خودکار به شماره شبا
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenPayout}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>درخواست تسویه حساب بانکی</span>
            <span>←</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">مجموع فروش ناخالص</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {formatToman(grossSales)}
            </div>
            <div className="text-xs text-slate-400 mt-2">کل پرداخت‌های خریداران در مارکت‌پلیس</div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">درآمد خالص طراح (۸۰٪)</div>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {formatToman(netEarnings)}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
              تضمین بدون نشت ریال
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              موجودی قابل تسویه کیف پول
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {formatToman(walletBalance)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              حداقل تسویه: {formatToman(100000)}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-400">تعداد فروش موفق</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {salesCount} <span className="text-xs font-normal text-slate-400">تراکنش</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">فروش آنلاین با تاییدیه شتاب</div>
          </div>
        </div>

        {/* Telemetry Chart Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                روند ماهانه فروش و درآمد خالص
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                نمودار تحلیلی تفکیک فروش ناخالص و سهم ۸۰ درصدی واریز شده به کیف پول
              </p>
            </div>

            {/* Time range filter */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTimeFilter("LAST_30_DAYS")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === "LAST_30_DAYS"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                ۳۰ روز گذشته
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("LAST_6_MONTHS")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === "LAST_6_MONTHS"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                ۶ ماه اخیر
              </button>
              <button
                type="button"
                onClick={() => setTimeFilter("ALL_TIME")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === "ALL_TIME"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-teal-600 dark:text-teal-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                تمام دوران
              </button>
            </div>
          </div>

          {/* SVG Area/Line Chart */}
          <EarningsChart data={chartData} height={320} />
        </div>

        {/* Transaction Audit Trail Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              دفتر کل تراکنش‌های مالی (Audit Trail)
            </h2>
            <span className="text-xs text-slate-400">ثبت تغییرناپذیر در لجر دوز</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                  <th className="py-3 px-3">نوع تراکنش</th>
                  <th className="py-3 px-3">مبلغ (تومان)</th>
                  <th className="py-3 px-3">موجودی پس از تراکنش</th>
                  <th className="py-3 px-3">شرح تراکنش</th>
                  <th className="py-3 px-3">تاریخ و زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            isCredit
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isCredit ? "واریز فروش (۸۰٪)" : "تسویه حساب"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span className={isCredit ? "text-emerald-600" : "text-rose-600"}>
                          {isCredit ? "+" : ""}
                          {formatToman(tx.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {formatToman(tx.balanceAfter)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 max-w-md truncate">
                        {tx.description}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono">
                        {formatJalaliDate(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  درخواست تسویه موجودی کیف پول
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  موجودی قابل تسویه: {formatToman(walletBalance)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePayout}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {payoutError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                {payoutError}
              </div>
            )}

            {payoutSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                {payoutSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitPayout} className="space-y-4">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  مبلغ تسویه (تومان) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10000"
                    min="100000"
                    max={walletBalance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold text-sm text-left focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-4 top-3 text-xs text-slate-400">تومان</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>حداقل مبلغ: {formatToman(100000)}</span>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(walletBalance))}
                    className="text-teal-600 hover:underline font-bold"
                  >
                    تسویه کل موجودی
                  </button>
                </div>
              </div>

              {/* Sheba Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  شماره شبا مقصد (ISO 7064 Mod 97-10) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={shebaInput}
                  onChange={(e) => setShebaInput(e.target.value.toUpperCase())}
                  placeholder="IR060560000000012345678901"
                  maxLength={26}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                {/* Real-Time Bank Badge & Validation */}
                <div className="flex items-center justify-between text-xs pt-1">
                  {shebaValidation.valid ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                      <span>✔ تایید شبا:</span>
                      <span>{shebaValidation.bankName}</span>
                    </span>
                  ) : (
                    <span className="text-rose-500 text-[11px] font-medium">
                      {shebaValidation.error || "فرمت شبا نامعتبر است"}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">
                    {shebaInput.length} / ۲۶ کاراکتر
                  </span>
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  نام و نام خانوادگی صاحب حساب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleClosePayout}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout || !shebaValidation.valid || Number(payoutAmount) < 100000}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  {isSubmittingPayout ? "در حال ثبت درخواست..." : "تایید و ارسال به پایا"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
