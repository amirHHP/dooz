import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizeDigits } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "نام، ایمیل و رمز عبور الزامی هستند" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeDigits(email).toLowerCase().trim();
    const normalizedPhone = phone ? normalizeDigits(phone).trim() : null;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === "CREATOR" ? "CREATOR" : "USER";

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        role: assignedRole,
        walletBalance: 0,
        bio: assignedRole === "CREATOR" ? "طراح جدید در استودیو دوز" : "خیاط و کاربر دوز",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "حساب کاربری با موفقیت ایجاد شد", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "خطایی در ثبت‌نام رخ داد. لطفاً مجدداً تلاش کنید." },
      { status: 500 }
    );
  }
}
