import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  MarketplacePattern,
  CATEGORY_LABELS_FA,
  DIFFICULTY_LABELS_FA,
  ProductCategory,
  PatternDifficulty,
  SEEDED_PATTERNS,
} from '@/types/marketplace';
import { formatToman, toPersianDigits } from '@/lib/format';
import { TechnicalFlat } from '@/components/marketplace/technical-flat';
import { FabricCalculator } from '@/components/marketplace/fabric-calculator';
import { TransformationAccordion } from '@/components/marketplace/transformation-accordion';
import { ReviewsSection } from '@/components/marketplace/reviews-section';
import {
  Scissors,
  ArrowRight,
  ShieldCheck,
  Download,
  ShoppingBag,
  User,
} from 'lucide-react';

interface PatternDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatternDetailPage({ params }: PatternDetailPageProps) {
  const { slug } = await params;

  let pattern: MarketplacePattern | null = null;

  try {
    const dbPattern = await prisma.patternProduct.findUnique({
      where: { slug },
      include: {
        creator: {
          select: { id: true, name: true, email: true, bio: true },
        },
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        reviews: {
          select: {
            id: true,
            userId: true,
            patternId: true,
            rating: true,
            fitFeedback: true,
            title: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (dbPattern) {
      pattern = dbPattern as unknown as MarketplacePattern;
    }
  } catch (error) {
    console.warn('Prisma lookup failed, falling back to SEEDED_PATTERNS:', error);
  }

  // Fallback to seeded patterns
  if (!pattern) {
    const seeded = SEEDED_PATTERNS.find((p) => p.slug === slug);
    if (!seeded) {
      notFound();
      return null;
    }

    pattern = {
      ...seeded,
      description:
        'الگوی کامل صنعتی و مزونی طراحی شده با در نظر گرفتن تناسبات اندام استاندارد. شامل راهنمای برش، نحوه انتقال پنس‌ها و فایل‌های آماده چاپ.',
      coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000',
      galleryImages: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
      ],
      creator: {
        id: 'creator-mahsa',
        name: 'مهسا رادمنش',
        bio: 'مدرس طراحی الگو و مدلسازی به روش مولر آلمان با ۱۰ سال سابقه تدریس',
      },
      steps: [
        {
          id: 'step-1',
          stepOrder: 1,
          title: 'انتقال پنس سرشانه به زیر بغل (برش فرانسوی)',
          description:
            'پنس بزرگ سرشانه با رسم خط زاویه‌دار به نوک سینه متصل شده، برش خورده و به زیر بغل (پنس پهلو) انتقال یافته تا تنخور جلو بدون چین و جذب بماند.',
        },
        {
          id: 'step-2',
          stepOrder: 2,
          title: 'اوزمان دادن دامن برای فون ملایم (Slash-and-Spread)',
          description:
            'خطوط عمودی از لبه پایینی دامن به نوک پنس‌های کمر رسم شده و با بستن پنس کمر، اوزمان طبیعی ۴ سانتی‌متری در لبه پایین ایجاد گردیده است.',
        },
        {
          id: 'step-3',
          stepOrder: 3,
          title: 'طراحی یقه انگلیسی و سجاف سرخود',
          description:
            'پایه یقه با زاویه شکست ۲ سانتی‌متر از گودی گردن و برگشت دال یقه به پهنای ۸ سانتی‌متر به همراه جادکمه ۲ سانتی‌متری و سجاف سرخود ۶ سانتی‌متری طراحی شده است.',
        },
        {
          id: 'step-4',
          stepOrder: 4,
          title: 'تعیین حق درزها و زاپاس دوخت (Seam Allowances)',
          description:
            'حق درزهای استاندارد به این ترتیب محاسبه شده‌اند: دور گردن و یقه ۱٫۰ سانتی‌متر، درزهای پهلو و برش ۲٫۰ سانتی‌متر، و لبه پایینی دامن و مچ ۳٫۵ سانتی‌متر.',
        },
      ],
      reviews: [
        {
          id: 'rev-01',
          userId: 'user-01',
          patternId: seeded.id,
          rating: 5,
          fitFeedback: 'TRUE_TO_SIZE',
          title: 'الگوی بسیار خوش‌دوخت و استاندارد',
          comment: 'بدون هیچ تغییری روی تن نشست. خط اتو و فاق عالی بود.',
          isVerifiedPurchase: true,
          createdAt: new Date().toISOString(),
          user: { name: 'فاطمه حسینی' },
        },
        {
          id: 'rev-02',
          userId: 'user-02',
          patternId: seeded.id,
          rating: 5,
          fitFeedback: 'TRUE_TO_SIZE',
          title: 'کیفیت عالی فایل‌های PDF و DXF',
          comment: 'به راحتی در پلاتر چاپ شد و برای برش پارچه کرپ باربی عالی بود.',
          isVerifiedPurchase: true,
          createdAt: new Date().toISOString(),
          user: { name: 'مریم کمالی' },
        },
      ],
    };
  }

  if (!pattern) {
    notFound();
    return null;
  }

  const currentPattern: MarketplacePattern = pattern;

  const categoryLabel =
    CATEGORY_LABELS_FA[currentPattern.category as ProductCategory] || currentPattern.category;

  const difficultyLabel =
    DIFFICULTY_LABELS_FA[currentPattern.difficulty as PatternDifficulty] || currentPattern.difficulty;

  const methodLabel =
    currentPattern.draftingMethod === 'MULLER'
      ? 'متد مولر آلمان'
      : currentPattern.draftingMethod === 'METRIC'
      ? 'متد متریک'
      : 'متد گرلاوین';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به بازار الگوها</span>
        </Link>
        <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-mono">
          شناسه الگو: {currentPattern.slug}
        </span>
      </div>

      {/* Garment Hero & Buy Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Gallery / Cover Image */}
        <div className="space-y-3">
          <div className="aspect-[4/3] rounded-3xl bg-muted overflow-hidden border shadow-sm">
            <img
              src={currentPattern.coverImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000'}
              alt={currentPattern.title}
              className="w-full h-full object-cover"
            />
          </div>

          {currentPattern.galleryImages && currentPattern.galleryImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {currentPattern.galleryImages.map((img, i) => (
                <div
                  key={i}
                  className="h-20 w-24 rounded-xl border overflow-hidden shrink-0 bg-muted cursor-pointer hover:border-primary transition-colors"
                >
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details & CTA */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                {categoryLabel}
              </span>
              <span className="text-xs font-bold bg-muted text-foreground px-3 py-1 rounded-full border">
                {methodLabel}
              </span>
              <span className="text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800/40 px-3 py-1 rounded-full">
                سطح: {difficultyLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground pt-1">
              {currentPattern.title}
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentPattern.description}
            </p>
          </div>

          {/* Price & Checkout Card */}
          <div className="rounded-2xl border bg-muted/30 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">قیمت الگو:</span>
              {currentPattern.price === 0 ? (
                <span className="text-xl font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                  رایگان
                </span>
              ) : (
                <span className="text-2xl font-black text-primary font-mono">
                  {formatToman(currentPattern.price)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                href={`/studio?block=${currentPattern.baseBlock || 'BODICE'}&method=${currentPattern.draftingMethod}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <Scissors className="h-4 w-4" />
                <span>شخصی‌سازی و باز کردن در استودیو</span>
              </Link>

              {currentPattern.price > 0 && (
                <Link
                  href={`/checkout?patternId=${currentPattern.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border bg-background hover:bg-muted px-5 py-2.5 text-xs font-bold text-foreground transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>خرید مستقیم و دریافت فایل‌ها (درگاه آزمایشی)</span>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                ضمانت تطابق تناسبات اندام
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5 text-primary" />
                دانلود آنی فایل‌های PDF و DXF
              </span>
            </div>
          </div>

          {/* Creator Profile Card */}
          {currentPattern.creator && (
            <div className="rounded-2xl border bg-card p-4 flex items-center gap-4 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground">طراح و مدرس الگو:</span>
                <h4 className="text-sm font-bold text-foreground">{currentPattern.creator.name}</h4>
                {currentPattern.creator.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{currentPattern.creator.bio}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technical Flat Sketches */}
      <TechnicalFlat
        frontSvg={currentPattern.technicalFlatFront}
        backSvg={currentPattern.technicalFlatBack}
        title={`طرح فنی برداری: ${currentPattern.title}`}
      />

      {/* Smart Fabric Consumption Calculator */}
      <FabricCalculator
        bodiceLength={42}
        skirtLength={currentPattern.category === 'DRESSES' ? 95 : 65}
        sleeveLength={60}
      />

      {/* Pattern Transformation Steps Accordion */}
      <TransformationAccordion steps={currentPattern.steps} />

      {/* Verified Reviews Section */}
      <ReviewsSection patternId={currentPattern.id} reviews={currentPattern.reviews} hasPurchased={true} />
    </div>
  );
}
