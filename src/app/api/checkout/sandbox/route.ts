import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutRequestSchema = z.object({
  patternId: z.string().min(1, "شناسه الگو الزامی است"),
  action: z.enum(["PAY", "CANCEL"]).default("PAY"),
  cardNumber: z.string().optional(),
});

/**
 * Generates simulated Iranian banking reference numbers (Shaparak / Saman Electronic Payment).
 */
function generateMockGatewayMetadata() {
  const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();
  const refNumber = `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
  const transactionRef = `SHP-${Date.now().toString(36).toUpperCase()}-${trackingCode}`;
  return { trackingCode, refNumber, transactionRef };
}

/**
 * POST /api/checkout/sandbox
 * Simulates Iranian payment gateway transaction callback.
 * Atomically creates Purchase and double-entry WalletTransactions (80% creator / 20% platform).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "لطفاً ابتدا وارد حساب کاربری خود شوید." },
        { status: 401 }
      );
    }
    const buyerId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const parseResult = checkoutRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || "داده‌های ورودی نامعتبر است" },
        { status: 400 }
      );
    }

    const { patternId, action } = parseResult.data;

    // Retrieve pattern and creator details
    const pattern = await prisma.patternProduct.findUnique({
      where: { id: patternId },
      include: { creator: true },
    });

    if (!pattern) {
      return NextResponse.json(
        { success: false, error: "الگوی مورد نظر یافت نشد." },
        { status: 404 }
      );
    }

    // Check if buyer already owns this pattern
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: buyerId,
        patternId: pattern.id,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        alreadyOwned: true,
        message: "این الگو قبلاً توسط شما خریداری شده است.",
        purchaseId: existingPurchase.id,
        transactionRef: existingPurchase.transactionRef,
      });
    }

    // Handle payment simulation cancellation
    if (action === "CANCEL") {
      return NextResponse.json(
        {
          success: false,
          status: "FAILED",
          error: "عملیات پرداخت توسط کاربر لغو گردید.",
          transactionRef: `SHP-CANCEL-${Date.now()}`,
        },
        { status: 400 }
      );
    }

    const totalPrice = pattern.price;

    // Handle Free Pattern (0 Toman)
    if (totalPrice === 0) {
      const freeTransactionRef = `FREE-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const purchase = await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.create({
          data: {
            userId: buyerId,
            patternId: pattern.id,
            pricePaid: 0,
            transactionRef: freeTransactionRef,
            status: "COMPLETED",
          },
        });

        await tx.patternProduct.update({
          where: { id: pattern.id },
          data: { salesCount: { increment: 1 } },
        });

        return p;
      });

      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        purchaseId: purchase.id,
        patternId: pattern.id,
        buyerId,
        totalPriceToman: 0,
        creatorEarningsToman: 0,
        platformFeeToman: 0,
        transactionRef: freeTransactionRef,
        message: "الگوی رایگان با موفقیت به کتابخانه شما افزوده شد.",
      });
    }

    // Double-entry accounting split: 80% creator / 20% platform commission
    const creatorEarnings = Math.round(totalPrice * 0.80);
    const platformFee = totalPrice - creatorEarnings;
    const { trackingCode, refNumber, transactionRef } = generateMockGatewayMetadata();

    // Execute atomic financial transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase record
      const purchase = await tx.purchase.create({
        data: {
          userId: buyerId,
          patternId: pattern.id,
          pricePaid: totalPrice,
          transactionRef,
          status: "COMPLETED",
        },
      });

      // 2. Fetch and update creator wallet balance
      const creator = await tx.user.findUnique({
        where: { id: pattern.creatorId },
        select: { id: true, walletBalance: true },
      });
      const creatorCurrentBalance = creator?.walletBalance ?? 0;
      const creatorNewBalance = creatorCurrentBalance + creatorEarnings;

      await tx.user.update({
        where: { id: pattern.creatorId },
        data: { walletBalance: creatorNewBalance },
      });

      // 3. Record Creator Ledger Credit (80%)
      const creatorLedger = await tx.walletTransaction.create({
        data: {
          userId: pattern.creatorId,
          amount: creatorEarnings,
          type: "CREDIT",
          balanceAfter: creatorNewBalance,
          referenceId: purchase.id,
          description: `سهم فروش ۸۰٪ الگوی «${pattern.title}» (کد پیگیری: ${trackingCode})`,
        },
      });

      // 4. Record Platform Commission Ledger Entry (20%)
      const adminUser = await tx.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true, walletBalance: true },
      });

      let platformLedger;
      if (adminUser) {
        const adminNewBalance = adminUser.walletBalance + platformFee;
        await tx.user.update({
          where: { id: adminUser.id },
          data: { walletBalance: adminNewBalance },
        });

        platformLedger = await tx.walletTransaction.create({
          data: {
            userId: adminUser.id,
            amount: platformFee,
            type: "COMMISSION",
            balanceAfter: adminNewBalance,
            referenceId: purchase.id,
            description: `کارمزد پلتفرم ۲۰٪ از فروش الگوی «${pattern.title}» (پیگیری: ${trackingCode})`,
          },
        });
      } else {
        // Fallback audit record associated with creator when admin not yet seeded
        platformLedger = await tx.walletTransaction.create({
          data: {
            userId: pattern.creatorId,
            amount: platformFee,
            type: "COMMISSION",
            balanceAfter: creatorNewBalance,
            referenceId: purchase.id,
            description: `کارمزد پلتفرم ۲۰٪ کسر شده از فروش الگوی «${pattern.title}»`,
          },
        });
      }

      // 5. Increment pattern sales count
      await tx.patternProduct.update({
        where: { id: pattern.id },
        data: { salesCount: { increment: 1 } },
      });

      return {
        purchase,
        creatorLedger,
        platformLedger,
      };
    });

    return NextResponse.json({
      success: true,
      status: "COMPLETED",
      purchaseId: transactionResult.purchase.id,
      patternId: pattern.id,
      buyerId,
      totalPriceToman: totalPrice,
      creatorEarningsToman: creatorEarnings,
      platformFeeToman: platformFee,
      transactionRef,
      trackingCode,
      gatewayRefNumber: refNumber,
      gateway: "SAMAN_ELECTRONIC_PAYMENT_SIMULATOR",
      message: "پرداخت تستی با موفقیت انجام شد و الگو در کتابخانه شما فعال گردید.",
    });
  } catch (error) {
    console.error("Sandbox checkout transaction error:", error);
    return NextResponse.json(
      { success: false, error: "خطای سرور در انجام تراکنش مالی شبیه‌ساز پرداخت." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkout/sandbox?transactionRef=...
 * Inspects transaction status for client confirmation.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transactionRef = searchParams.get("transactionRef");

  if (!transactionRef) {
    return NextResponse.json(
      { success: false, error: "کد پیگیری تراکنش الزامی است." },
      { status: 400 }
    );
  }

  const purchase = await prisma.purchase.findUnique({
    where: { transactionRef },
    include: {
      pattern: {
        select: { id: true, title: true, slug: true, price: true, coverImage: true },
      },
    },
  });

  if (!purchase) {
    return NextResponse.json(
      { success: false, error: "تراکنش یافت نشد." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    purchase,
  });
}
