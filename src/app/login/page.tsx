"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Scissors,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Palette,
  Briefcase,
  KeyRound,
  RotateCw,
  Edit2,
  Clock,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/creator";

  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [loginMode, setLoginMode] = useState<"OTP" | "PASSWORD">("OTP");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Login states
  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState<"ENTER_EMAIL" | "ENTER_CODE">("ENTER_EMAIL");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Password Login form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"CREATOR" | "USER">("CREATOR");

  // Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, countdown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 1. Send OTP Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDevCodeHint(null);

    const cleanEmail = otpEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("لطفاً یک آدرس ایمیل معتبر وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "خطا در ارسال کد تایید");
        setLoading(false);
        return;
      }

      setOtpStep("ENTER_CODE");
      setCountdown(data.expiresInSeconds || 180);
      setIsTimerRunning(true);
      setSuccessMsg(data.message || "کد تایید با موفقیت ارسال شد.");

      if (data.devCode) {
        setDevCodeHint(data.devCode);
      }
    } catch (err) {
      console.error("OTP send error:", err);
      setErrorMsg("خطا در برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP and Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 5) {
      setErrorMsg("لطفاً کد تایید ۵ یا ۶ رقمی را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: otpEmail.trim().toLowerCase(),
        password: cleanCode,
        authType: "otp",
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("کد تایید وارد شده نادرست است یا منقضی شده است.");
        setLoading(false);
      } else {
        setSuccessMsg("احراز هویت موفق! در حال انتقال به داشبورد...");
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 700);
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setErrorMsg("خطایی در ورود رخ داد. لطفاً مجدداً امتحان کنید.");
      setLoading(false);
    }
  };

  // 3. Handle Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginIdentifier || !loginPassword) {
      setErrorMsg("لطفاً ایمیل/شماره موبایل و رمز عبور را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: loginIdentifier,
        password: loginPassword,
        authType: "password",
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("شناسه کاربری یا رمز عبور اشتباه است");
        setLoading(false);
      } else {
        setSuccessMsg("با موفقیت وارد شدید! در حال انتقال...");
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 700);
      }
    } catch (err) {
      console.error("Password sign in error:", err);
      setErrorMsg("خطایی رخ داد، لطفاً مجدداً امتحان کنید");
      setLoading(false);
    }
  };

  // 4. Quick Demo Login Helper
  const handleQuickLogin = async (identifier: string, pass: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        identifier,
        password: pass,
        authType: "password",
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("خطا در ورود به حساب آزمایشی");
        setLoading(false);
      } else {
        setSuccessMsg("ورود آزمایشی موفق! در حال هدایت...");
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 600);
      }
    } catch {
      setErrorMsg("خطا در برقراری ارتباط");
      setLoading(false);
    }
  };

  // 5. Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg("نام، ایمیل و رمز عبور الزامی هستند");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone || undefined,
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "خطا در ثبت‌نام");
        setLoading(false);
        return;
      }

      setSuccessMsg("ثبت‌نام با موفقیت انجام شد! در حال ورود خودکار...");

      const loginRes = await signIn("credentials", {
        identifier: regEmail,
        password: regPassword,
        authType: "password",
        redirect: false,
      });

      if (!loginRes?.error) {
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 800);
      } else {
        setActiveTab("LOGIN");
        setLoginMode("PASSWORD");
        setLoginIdentifier(regEmail);
        setLoading(false);
      }
    } catch (err) {
      console.error("Register request error:", err);
      setErrorMsg("خطا در ارسال اطلاعات به سرور");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/20 group-hover:scale-105 transition-transform">
              <Scissors className="h-6 w-6 transform -rotate-45" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 dark:text-white">دوز</div>
              <div className="text-xs text-slate-500 font-medium">استودیو الگوسازی پارامتریک</div>
            </div>
          </Link>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
            {activeTab === "LOGIN" ? "ورود به حساب کاربری" : "ثبت‌نام در سامانه دوز"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === "LOGIN"
              ? "ورود آنی با کد یکبار مصرف ایمیل یا رمز عبور"
              : "به جمع طراحان و شخصی‌دوزان تخصصی الگوسازی بپیوندید"}
          </p>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("LOGIN");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "LOGIN"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("REGISTER");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "REGISTER"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev Mode Code Hint */}
        {devCodeHint && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 font-mono">
            <span>کد آزمایشی سرور:</span>
            <span className="text-base font-black tracking-widest bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-lg text-amber-900 dark:text-amber-100">
              {devCodeHint}
            </span>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {activeTab === "LOGIN" ? (
            <div className="space-y-5">
              {/* Login Method Toggle: OTP vs Password */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("OTP");
                    setErrorMsg(null);
                  }}
                  className={`text-xs font-bold pb-1.5 flex items-center gap-1.5 transition-colors relative ${
                    loginMode === "OTP"
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>کد یکبار مصرف ایمیل (OTP)</span>
                  {loginMode === "OTP" && (
                    <span className="absolute bottom-[-13px] right-0 left-0 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode("PASSWORD");
                    setErrorMsg(null);
                  }}
                  className={`text-xs font-bold pb-1.5 flex items-center gap-1.5 transition-colors relative ${
                    loginMode === "PASSWORD"
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>رمز عبور</span>
                  {loginMode === "PASSWORD" && (
                    <span className="absolute bottom-[-13px] right-0 left-0 h-0.5 bg-teal-600 rounded-full" />
                  )}
                </button>
              </div>

              {/* MODE 1: OTP FLOW */}
              {loginMode === "OTP" && (
                <div>
                  {otpStep === "ENTER_EMAIL" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          آدرس ایمیل شما
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            dir="ltr"
                            value={otpEmail}
                            onChange={(e) => setOtpEmail(e.target.value)}
                            placeholder="your-name@example.com"
                            className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                            required
                            autoFocus
                          />
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                          یک کد ۶ رقمی امن جهت تایید و ورود به این آدرس ارسال خواهد شد.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "در حال ارسال کد..." : "ارسال کد تایید به ایمیل"}
                        {!loading && <ArrowRight className="h-4 w-4 transform rotate-180" />}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-teal-600" />
                          <span className="font-mono text-slate-700 dark:text-slate-300">{otpEmail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpStep("ENTER_EMAIL");
                            setOtpCode("");
                            setErrorMsg(null);
                          }}
                          className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>تغییر</span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          کد تایید ۶ رقمی
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="______"
                          className="w-full py-3 px-4 rounded-xl border-2 border-teal-500/50 bg-teal-50/20 dark:bg-slate-950 text-slate-900 dark:text-white text-center font-mono text-2xl font-black tracking-[0.5em] focus:outline-none focus:border-teal-600"
                          autoFocus
                          required
                        />
                      </div>

                      {/* Resend Timer */}
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>زمان اعتبار:</span>
                          <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                            {formatTimer(countdown)}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isTimerRunning || loading}
                          onClick={() => handleSendOtp()}
                          className="font-bold text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                        >
                          <RotateCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                          <span>ارسال مجدد کد</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 5}
                        className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? "در حال اعتبارسنجی..." : "تایید و ورود به دوز"}
                        {!loading && <ArrowRight className="h-4 w-4 transform rotate-180" />}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* MODE 2: PASSWORD FLOW */}
              {loginMode === "PASSWORD" && (
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      ایمیل یا شماره موبایل
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="creator@dooz.ir یا 09122222222"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                        required
                      />
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رمز عبور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        dir="ltr"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                      />
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "در حال پردازش..." : "ورود با رمز عبور"}
                    {!loading && <ArrowRight className="h-4 w-4 transform rotate-180" />}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TAB 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: سارا محمدی"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  آدرس ایمیل
                </label>
                <div className="relative">
                  <input
                    type="email"
                    dir="ltr"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  شماره موبایل (اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    dir="ltr"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="09120000000"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رمز عبور (حداقل ۶ نویسه)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    dir="ltr"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نوع فعالیت شما در دوز
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("CREATOR")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      regRole === "CREATOR"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Palette className="h-4 w-4" />
                    <span>طراح الگو و فروشنده</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("USER")}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      regRole === "USER"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>خیاط شخصی‌دوز / مزون</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "در حال ایجاد حساب..." : "تکمیل ثبت‌نام و ورود"}
                {!loading && <Sparkles className="h-4 w-4" />}
              </button>
            </form>
          )}

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 text-center">
              ورود سریع با حساب‌های آزمایشی دمو:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("creator@dooz.ir", "Creator123!")}
                className="p-2.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-100 text-teal-800 dark:text-teal-200 text-center transition-all"
              >
                <div className="text-xs font-black">مهسا رادمنش</div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">طراح الگو (CREATOR)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("tailor@dooz.ir", "Tailor123!")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-center transition-all"
              >
                <div className="text-xs font-black">استاد علی محمدی</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">خیاط شخصی‌دوز (USER)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("admin@dooz.ir", "Admin123!")}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-center transition-all"
              >
                <div className="text-xs font-black">مدیریت دوز</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">مدیر سامانه (ADMIN)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-sm font-bold text-slate-500">در حال بارگذاری فرم ورود...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
