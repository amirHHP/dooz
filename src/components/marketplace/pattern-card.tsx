'use client';

import React from 'react';
import Link from 'next/link';
import {
  MarketplacePattern,
  CATEGORY_LABELS_FA,
  DIFFICULTY_LABELS_FA,
  ProductCategory,
  PatternDifficulty,
} from '@/types/marketplace';
import { formatToman, toPersianDigits } from '@/lib/format';
import { Star, Scissors, UserCheck } from 'lucide-react';

export interface PatternCardProps {
  pattern: MarketplacePattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const methodLabel =
    pattern.draftingMethod === 'MULLER'
      ? 'متد مولر'
      : pattern.draftingMethod === 'METRIC'
      ? 'متد متریک'
      : 'متد گرلاوین';

  const categoryLabel =
    CATEGORY_LABELS_FA[pattern.category as ProductCategory] || pattern.category;

  const difficultyLabel =
    DIFFICULTY_LABELS_FA[pattern.difficulty as PatternDifficulty] || pattern.difficulty;

  // Compute average rating from reviews if present
  const reviews = pattern.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 4.8; // Default benchmark rating if not reviewed yet

  return (
    <Link
      href={`/marketplace/${pattern.slug}`}
      className="group rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div className="space-y-3">
        {/* Cover Image Container (4:3) */}
        <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
          <img
            src={pattern.coverImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800'}
            alt={pattern.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
            <span className="text-[11px] font-bold bg-background/90 backdrop-blur px-2.5 py-1 rounded-lg text-foreground shadow-sm">
              {methodLabel}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <span className="text-[11px] font-bold bg-primary text-primary-foreground px-2.5 py-1 rounded-lg shadow-sm">
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-2">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {pattern.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>{pattern.creator?.name || 'طراح دوز'}</span>
            <div className="flex items-center gap-1 font-mono text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{toPersianDigits(avgRating.toFixed(1))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Price & Difficulty */}
      <div className="p-4 pt-0 border-t mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          درجه سختی: <span className="font-bold text-foreground">{difficultyLabel}</span>
        </span>

        {pattern.price === 0 ? (
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
            رایگان
          </span>
        ) : (
          <span className="text-sm font-black text-primary font-mono">
            {formatToman(pattern.price)}
          </span>
        )}
      </div>
    </Link>
  );
}
