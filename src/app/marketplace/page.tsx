import React from 'react';
import { prisma } from '@/lib/db';
import { MarketplacePattern, SEEDED_PATTERNS } from '@/types/marketplace';
import { MarketplaceFilterBar } from '@/components/marketplace/filter-bar';
import { PatternCard } from '@/components/marketplace/pattern-card';
import { ShoppingBag, Sparkles, SlidersHorizontal } from 'lucide-react';

interface MarketplacePageProps {
  searchParams: Promise<{
    category?: string;
    method?: string;
    difficulty?: string;
    isFree?: string;
    maxPrice?: string;
    q?: string;
  }>;
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const { category, method, difficulty, isFree, maxPrice, q } = params;

  let patterns: MarketplacePattern[] = [];

  try {
    const isFreeBool = isFree === 'true' ? true : isFree === 'false' ? false : undefined;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : undefined;

    const dbPatterns = await prisma.patternProduct.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...(method ? { draftingMethod: method as any } : {}),
        ...(difficulty ? { difficulty: difficulty as any } : {}),
        ...(isFreeBool !== undefined
          ? isFreeBool
            ? { price: 0 }
            : { price: { gt: 0 } }
          : {}),
        ...(maxPriceNum !== undefined ? { price: { lte: maxPriceNum } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, bio: true },
        },
        reviews: {
          select: { id: true, rating: true, fitFeedback: true, title: true, comment: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbPatterns && dbPatterns.length > 0) {
      patterns = dbPatterns as unknown as MarketplacePattern[];
    }
  } catch (error) {
    console.warn('Prisma query failed, falling back to SEEDED_PATTERNS catalog:', error);
  }

  // Fallback to seeded patterns if database returned 0 items
  if (patterns.length === 0) {
    const isFreeBool = isFree === 'true' ? true : isFree === 'false' ? false : undefined;
    const maxPriceNum = maxPrice ? parseInt(maxPrice, 10) : undefined;

    patterns = (SEEDED_PATTERNS as any[]).filter((p) => {
      if (category && p.category !== category) return false;
      if (method && p.draftingMethod !== method) return false;
      if (difficulty && p.difficulty !== difficulty) return false;
      if (isFreeBool !== undefined && (p.price === 0) !== isFreeBool) return false;
      if (maxPriceNum !== undefined && p.price > maxPriceNum) return false;
      if (q) {
        const query = q.toLowerCase();
        if (!p.title.toLowerCase().includes(query) && !p.slug.includes(query)) return false;
      }
      return true;
    }).map((p) => ({
      ...p,
      coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      galleryImages: [],
      description: 'الگوی استاندارد خیاطی صنعتی با دستورالعمل‌های گام‌به‌گام و جدول راهنمای متراژ پارچه.',
      creator: { name: 'استودیو طراحی دوز' },
      reviews: [{ id: 'rev-default', rating: 5, fitFeedback: 'TRUE_TO_SIZE', comment: 'تنخور عالی', createdAt: new Date() }],
    }));
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-l from-primary/10 via-background to-secondary/10 border p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>مارکت‌پلیس دوسویه الگوهای لباس</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground">
          بازار الگوهای خیاطی و مدلسازی صنعتی
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          جدیدترین الگوهای طراحی شده توسط اساتید خیاطی به روش‌های مولر، متریک و گرلاوین. همراه با راهنمای برش، محاسبه متراژ پارچه و فایل‌های آماده چاپ.
        </p>
      </div>

      {/* Filter Bar Component */}
      <MarketplaceFilterBar
        filters={{
          category,
          method,
          difficulty,
          isFree: isFree === 'true' ? true : isFree === 'false' ? false : undefined,
          q,
        }}
        onFilterChange={() => {}}
        onReset={() => {}}
      />

      {/* Patterns Grid */}
      {patterns.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center bg-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-bold text-foreground mt-4">هیچ الگویی با این فیلترها یافت نشد</h3>
          <p className="text-xs text-muted-foreground mt-1">
            لطفاً فیلترها را تغییر داده یا از دکمه پاک کردن فیلترها استفاده فرمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      )}
    </div>
  );
}
