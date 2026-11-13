'use client';

import React from 'react';
import {
  ProductCategory,
  PatternDifficulty,
  CATEGORY_LABELS_FA,
  DIFFICULTY_LABELS_FA,
  MarketplaceFilterQuery,
} from '@/types/marketplace';
import { Search, RotateCcw, Filter, Check } from 'lucide-react';

export interface FilterBarProps {
  filters: MarketplaceFilterQuery;
  onFilterChange: (newFilters: MarketplaceFilterQuery) => void;
  onReset: () => void;
}

export function MarketplaceFilterBar({
  filters,
  onFilterChange,
  onReset,
}: FilterBarProps) {
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

  const handleCategoryToggle = (cat: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === cat ? undefined : cat,
    });
  };

  const handleMethodToggle = (m: string) => {
    onFilterChange({
      ...filters,
      method: filters.method === m ? undefined : m,
    });
  };

  const handleDifficultyToggle = (d: string) => {
    onFilterChange({
      ...filters,
      difficulty: filters.difficulty === d ? undefined : d,
    });
  };

  const handlePriceTypeToggle = (type: 'ALL' | 'FREE' | 'PAID') => {
    if (type === 'ALL') {
      const next = { ...filters };
      delete next.isFree;
      onFilterChange(next);
    } else if (type === 'FREE') {
      onFilterChange({ ...filters, isFree: true });
    } else {
      onFilterChange({ ...filters, isFree: false });
    }
  };

  const hasActiveFilters =
    Boolean(filters.category) ||
    Boolean(filters.method) ||
    Boolean(filters.difficulty) ||
    filters.isFree !== undefined ||
    Boolean(filters.q) ||
    Boolean(filters.maxPrice);

  return (
    <div className="w-full bg-card border rounded-2xl p-5 shadow-sm space-y-5">
      {/* Search Input & Reset Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ ...filters, q: e.target.value })}
            placeholder="جستجوی عنوان الگو، سبک یا طراح..."
            className="w-full rounded-xl border bg-background pr-10 pl-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
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
            const active = filters.category === cat.id;
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
              const active = filters.method === m.id;
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
              const active = filters.difficulty === d.id;
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
                filters.isFree === undefined
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
                filters.isFree === true
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
                filters.isFree === false
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
