import crypto from "crypto";
import { normalizeDigits } from "@/lib/auth";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

// Global in-memory store so it survives Next.js dev reloads
declare global {
  // eslint-disable-next-line no-var
  var __dooz_otp_store: Map<string, OtpEntry> | undefined;
}

const otpStore: Map<string, OtpEntry> =
  globalThis.__dooz_otp_store || new Map<string, OtpEntry>();

if (process.env.NODE_ENV !== "production") {
  globalThis.__dooz_otp_store = otpStore;
}

const OTP_EXPIRY_MS = 3 * 60 * 1000; // 3 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds between resends
const MAX_ATTEMPTS = 5;

/**
 * Generates and stores a secure 6-digit numeric OTP code for the given email.
 */
export function generateOtp(email: string): {
  code: string;
  expiresInSeconds: number;
} {
  const cleanEmail = normalizeDigits(email).toLowerCase().trim();
  const now = Date.now();

  const existing = otpStore.get(cleanEmail);
  if (existing && now - existing.createdAt < RATE_LIMIT_WINDOW_MS) {
    const waitSeconds = Math.ceil(
      (RATE_LIMIT_WINDOW_MS - (now - existing.createdAt)) / 1000
    );
    throw new Error(
      `لطفاً پیش از درخواست مجدد کد، ${waitSeconds} ثانیه صبر کنید.`
    );
  }

  // Generate cryptographically secure 6-digit number [100000..999999]
  const code = crypto.randomInt(100000, 1000000).toString();

  otpStore.set(cleanEmail, {
    code,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
  });

  return {
    code,
    expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
  };
}

/**
 * Verifies the OTP code for an email.
 * Consumes the code upon successful verification.
 */
export function verifyOtp(
  email: string,
  inputCode: string
): { valid: boolean; error?: string } {
  const cleanEmail = normalizeDigits(email).toLowerCase().trim();
  const cleanCode = normalizeDigits(inputCode).trim();
  const now = Date.now();

  const entry = otpStore.get(cleanEmail);
  if (!entry) {
    return {
      valid: false,
      error: "کد تاییدی برای این ایمیل ثبت نشده یا منقضی شده است. لطفاً کد جدید دریافت کنید.",
    };
  }

  if (now > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: "کد تایید منقضی شده است. لطفاً کد جدید درخواست کنید.",
    };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: "تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً کد جدید درخواست کنید.",
    };
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1;
    return {
      valid: false,
      error: `کد تایید وارد شده نادرست است. (${MAX_ATTEMPTS - entry.attempts} تلاش باقی مانده)`,
    };
  }

  // Valid: consume code
  otpStore.delete(cleanEmail);
  return { valid: true };
}
