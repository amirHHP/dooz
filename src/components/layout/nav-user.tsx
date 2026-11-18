"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Palette,
  Briefcase,
  ChevronDown,
  Coins,
} from "lucide-react";

export function NavUser() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-9 w-24 rounded-lg bg-muted/60 animate-pulse hidden sm:block" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-teal-600/30 hover:border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-bold text-xs transition-all shadow-sm hover:shadow"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>ورود / ثبت‌نام</span>
      </Link>
    );
  }

  const user = session.user;
  const role = user.role || "USER";
  const initial = user.name?.slice(0, 1) || "ک";

  const roleLabel =
    role === "CREATOR"
      ? "طراح"
      : role === "ADMIN"
      ? "مدیر"
      : "خیاط";

  const roleBadgeColor =
    role === "CREATOR"
      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
      : role === "ADMIN"
      ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      : "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-black text-xs flex items-center justify-center shadow-sm">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-bold text-foreground leading-tight">
            {user.name || "کاربر دوز"}
          </span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full border self-start font-medium ${roleBadgeColor}`}>
            {roleLabel}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Links */}
          <div className="py-1">
            {role === "CREATOR" && (
              <>
                <Link
                  href="/creator"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Palette className="h-4 w-4 text-teal-600" />
                  <span>استودیو طراحان</span>
                </Link>
                <Link
                  href="/creator/earnings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span>مدیریت درآمد و تسویه</span>
                </Link>
              </>
            )}

            <Link
              href="/clients"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-primary" />
              <span>پرونده مشتریان</span>
            </Link>

            <Link
              href="/studio"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-primary" />
              <span>میز کار الگو</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-right"
            >
              <LogOut className="h-4 w-4" />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
