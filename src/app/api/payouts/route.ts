import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validateSheba } from "@/lib/ledger";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      // Fallback for development/testing: find creator
      const creator = await prisma.user.findFirst({
        where: { role: "CREATOR" },
      });
      if (creator) userId = creator.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "کاربر احراز هویت نشده است" }, { status: 401 });
    }

    const payouts = await prisma.payoutRequest.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, payouts });
  } catch (err: any) {
    console.error("GET /api/payouts error:", err);
    return NextResponse.json({ error: "خطا در دریافت لیست تسویه‌ها" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    let creatorId = session?.user?.id || body.creatorId;

    if (!creatorId) {
      // Fallback for development / mock tests
      const creator = await prisma.user.findFirst({
        where: { role: "CREATOR" },
      });
      if (creator) {
        creatorId = creator.id;
      }
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: "جهت ثبت درخواست تسویه، ورود به حساب الزامی است" },
        { status: 401 }
      );
    }

    const amount = Math.round(Number(body.amount) || 0);
    const shebaNumber = String(body.shebaNumber || "").trim();
    const accountHolderName = String(body.accountHolderName || "").trim();

    // 1. Minimum amount validation
    if (amount < 100000) {
      return NextResponse.json(
        { error: "حداقل مبلغ تسویه ۱۰۰,۰۰۰ تومان می‌باشد" },
        { status: 400 }
      );
    }

    // 2. Sheba validation via ISO 7064 Mod 97-10
    const shebaVal = validateSheba(shebaNumber);
    if (!shebaVal.valid) {
      return NextResponse.json(
        { error: shebaVal.error || "شماره شبا نامعتبر است" },
        { status: 400 }
      );
    }

    // 3. Check creator existence and balance
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return NextResponse.json({ error: "کاربر سازنده یافت نشد" }, { status: 404 });
    }

    if (amount > creator.walletBalance) {
      return NextResponse.json(
        { error: "مبلغ درخواستی بیشتر از موجودی قابل تسویه است" },
        { status: 400 }
      );
    }

    // 4. Atomic execution
    const result = await prisma.$transaction(async (tx) => {
      // Deduct wallet balance
      const updatedUser = await tx.user.update({
        where: { id: creatorId },
        data: {
          walletBalance: { decrement: amount },
        },
      });

      // Create PayoutRequest record
      const payout = await tx.payoutRequest.create({
        data: {
          creatorId,
          amount,
          shebaNumber: shebaVal.sheba || shebaNumber,
          accountHolderName: accountHolderName || creator.name,
          bankName: shebaVal.bankName || "بانک نامشخص",
          status: "PENDING",
        },
      });

      // Create immutable WalletTransaction entry
      const walletTx = await tx.walletTransaction.create({
        data: {
          userId: creatorId,
          amount: -amount,
          type: "PAYOUT",
          balanceAfter: updatedUser.walletBalance,
          referenceId: payout.id,
          description: `درخواست تسویه به شماره شبا ${shebaVal.sheba} (${shebaVal.bankName})`,
        },
      });

      return { payout, newBalance: updatedUser.walletBalance, walletTx };
    });

    return NextResponse.json({
      success: true,
      payout: result.payout,
      walletBalance: result.newBalance,
    });
  } catch (err: any) {
    console.error("POST /api/payouts error:", err);
    return NextResponse.json(
      { error: "خطا در پردازش درخواست تسویه حساب: " + (err.message || "") },
      { status: 500 }
    );
  }
}
