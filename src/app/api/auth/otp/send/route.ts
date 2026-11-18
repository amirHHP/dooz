import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { normalizeDigits } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body?.email;

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "لطفاً یک آدرس ایمیل معتبر وارد کنید." },
        { status: 400 }
      );
    }

    const cleanEmail = normalizeDigits(rawEmail).toLowerCase().trim();

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "فرمت آدرس ایمیل وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    // 1. Generate 6-digit OTP
    const { code, expiresInSeconds } = generateOtp(cleanEmail);

    // 2. Dispatch email
    const emailResult = await sendOtpEmail(cleanEmail, code);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "خطا در ارسال ایمیل. لطفاً دقایقی دیگر تلاش کنید." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `کد تایید ۶ رقمی به آدرس ${cleanEmail} ارسال شد.`,
      expiresInSeconds,
      provider: emailResult.provider,
      // In development mode, provide devCode for easy visual confirmation if email provider is in test mode
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });
  } catch (err: any) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: err.message || "خطایی در پردازش درخواست رخ داد." },
      { status: 400 }
    );
  }
}
