'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  ProductCategory,
  PatternDifficulty,
  CATEGORY_LABELS_FA,
  DIFFICULTY_LABELS_FA,
  MarketplaceFilterQuery,
} from '@/types/marketplace';
import { Search, RotateCcw } from 'lucide-react';

export interface FilterBarProps {
  filters?: MarketplaceFilterQuery;
  onFilterChange?: (newFilters: MarketplaceFilterQuery) => void;
  onReset?: () => void;
}

export function MarketplaceFilterBar({
  filters = {},
  onFilterChange,
  onReset,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'OUTERWEAR', label: CATEGORY_LABELS_FA.OUTERWEAR },
    { id: 'DRESSES', label: CATEGORY_LABELS_FA.DRESSES },
    { id: 'TOPS_BLOUSES', label: CATEGORY_LABELS_FA.TOPS_BLOUSES },
    { id: 'SKIRTS', label: CATEGORY_LABELS_FA.SKIRTS },
    { id: 'TROUSERS', label: CATEGORY_LABELS_FA.TROUSERS },
  ];

  const methods = [
    { id: 'MULLER', label: 'مولر (آلمان)' },
    { id: 'METRIC', label: 'متریک (الدریچ)' },
    { id: 'GRLAWEIN', label: 'گرلاوین' },
  ];

  const difficulties: { id: PatternDifficulty; label: string }[] = [
    { id: 'BEGINNER', label: DIFFICULTY_LABELS_FA.BEGINNER },
    { id: 'INTERMEDIATE', label: DIFFICULTY_LABELS_FA.INTERMEDIATE },
    { id: 'ADVANCED', label: DIFFICULTY_LABELS_FA.ADVANCED },
    { id: 'MASTER', label: DIFFICULTY_LABELS_FA.MASTER },
  ];

  const activeCategory = filters.category ?? searchParams.get('category') ?? undefined;
  const activeMethod = filters.method ?? searchParams.get('method') ?? undefined;
  const activeDifficulty = filters.difficulty ?? searchParams.get('difficulty') ?? undefined;
  const activeIsFree =
    filters.isFree !== undefined
      ? filters.isFree
      : searchParams.get('isFree') === 'true'
      ? true
      : searchParams.get('isFree') === 'false'
      ? false
      : undefined;
  const activeQ = filters.q ?? searchParams.get('q') ?? '';

  const [searchTerm, setSearchTerm] = useState(activeQ);

  useEffect(() => {
    setSearchTerm(activeQ);
  }, [activeQ]);

  const updateFilters = (next: MarketplaceFilterQuery) => {
    if (onFilterChange) {
      onFilterChange(next);
      return;
    }

    const params = new URLSearchParams();
    if (next.category) params.set('category', next.category);
    if (next.method) params.set('method', next.method);
    if (next.difficulty) params.set('difficulty', next.difficulty);
    if (next.isFree !== undefined) params.set('isFree', String(next.isFree));
    if (next.maxPrice !== undefined) params.set('maxPrice', String(next.maxPrice));
    if (next.q) params.set('q', next.q);

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    if (onReset) {
      onReset();
      return;
    }
    startTransition(() => {
      router.push(pathname);
    });
  };

  // Debounce search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== activeQ.trim()) {
        updateFilters({
          category: activeCategory,
          method: activeMethod,
          difficulty: activeDifficulty,
          isFree: activeIsFree,
          q: searchTerm.trim() || undefined,
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCategoryToggle = (cat: string) => {
    updateFilters({
      category: activeCategory === cat ? undefined : cat,
      method: activeMethod,
      difficulty: activeDifficulty,
      isFree: activeIsFree,
      q: searchTerm.trim() || undefined,
    });
  };

  const handleMethodToggle = (m: string) => {
    updateFilters({
      category: activeCategory,
      method: activeMethod === m ? undefined : m,
      difficulty: activeDifficulty,
      isFree: activeIsFree,
      q: searchTerm.trim() || undefined,
    });
  };

  const handleDifficultyToggle = (d: string) => {
    updateFilters({
      category: activeCategory,
      method: activeMethod,
      difficulty: activeDifficulty === d ? undefined : d,
      isFree: activeIsFree,
      q: searchTerm.trim() || undefined,
    });
  };

  const handlePriceTypeToggle = (type: 'ALL' | 'FREE' | 'PAID') => {
    updateFilters({
      category: activeCategory,
      method: activeMethod,
      difficulty: activeDifficulty,
      isFree: type === 'FREE' ? true : type === 'PAID' ? false : undefined,
      q: searchTerm.trim() || undefined,
    });
  };

  const hasActiveFilters =
    Boolean(activeCategory) ||
    Boolean(activeMethod) ||
    Boolean(activeDifficulty) ||
    activeIsFree !== undefined ||
    Boolean(searchTerm.trim());

  return (
    <div className="w-full bg-card border rounded-2xl p-5 shadow-sm space-y-5">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                updateFilters({
                  category: activeCategory,
                  method: activeMethod,
                  difficulty: activeDifficulty,
                  isFree: activeIsFree,
                  q: searchTerm.trim() || undefined,
                });
              }
            }}
            placeholder="جستجوی عنوان الگو، سبک یا طراح..."
            className="w-full rounded-xl border bg-background pr-10 pl-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 p-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>پاک کردن فیلترها</span>
          </button>
        )}
      </div>

      {/* Categories Filter Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground block">دسته‌بندی لباس:</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleCategoryToggle(cat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background hover:bg-muted text-foreground'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Methods and Difficulty Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 border-t">
        {/* Method */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground block">متد الگوسازی:</span>
          <div className="flex flex-wrap gap-1.5">
            {methods.map((m) => {
              const active = activeMethod === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => handleMethodToggle(m.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground block">درجه سختی دوخت:</span>
          <div className="flex flex-wrap gap-1.5">
            {difficulties.map((d) => {
              const active = activeDifficulty === d.id;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => handleDifficultyToggle(d.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price (All / Free / Paid) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-muted-foreground block">قیمت الگو:</span>
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => handlePriceTypeToggle('ALL')}
              className={`py-1 rounded-lg transition-colors ${
                activeIsFree === undefined
                  ? 'bg-background shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => handlePriceTypeToggle('FREE')}
              className={`py-1 rounded-lg transition-colors ${
                activeIsFree === true
                  ? 'bg-background shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              رایگان
            </button>
            <button
              type="button"
              onClick={() => handlePriceTypeToggle('PAID')}
              className={`py-1 rounded-lg transition-colors ${
                activeIsFree === false
                  ? 'bg-background shadow-sm text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              غیررایگان
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
