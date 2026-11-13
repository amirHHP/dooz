'use client';

import React, { useEffect } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, Eye, RotateCcw } from 'lucide-react';
import { toPersianDigits } from '@/lib/format';

export interface ConstructionStepItem {
  stepIndex: number;
  titleFa: string;
  instructionFa: string;
  calculatedValues?: Record<string, string | number>;
  elements?: string[];
}

export interface TimelinePlayerProps {
  steps: ConstructionStepItem[];
  currentIndex: number;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  showAll: boolean;
  setShowAll: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function StudioTimelinePlayer({
  steps = [],
  currentIndex = 0,
  setCurrentIndex,
  isPlaying = false,
  setIsPlaying,
  showAll = false,
  setShowAll,
}: TimelinePlayerProps) {
  const totalSteps = Math.max(1, steps.length);

  // Auto-play interval timer (2000ms per step)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      // In Next.js / React, handle function or direct value
      if (typeof setCurrentIndex === 'function') {
        setCurrentIndex((prev: number) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length, setCurrentIndex, setIsPlaying]);

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      if (typeof setCurrentIndex === 'function') {
        setCurrentIndex((prev: number) => Math.min(steps.length - 1, prev + 1));
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (typeof setCurrentIndex === 'function') {
        setCurrentIndex((prev: number) => Math.max(0, prev - 1));
      }
    }
  };

  const handlePlayToggle = () => {
    // If at final step, rewind to 0 before playing
    if (currentIndex >= steps.length - 1) {
      if (typeof setCurrentIndex === 'function') {
        setCurrentIndex(0);
      }
    }
    setShowAll(false);
    setIsPlaying(!isPlaying);
  };

  const handleToggleShowAll = () => {
    setIsPlaying(false);
    setShowAll(!showAll);
  };

  const activeStep = steps[currentIndex] || steps[0] || {
    stepIndex: 0,
    titleFa: 'مرحله ساخت الگو',
    instructionFa: 'در حال محاسبه نقاط و خطوط مبنای الگو...',
    calculatedValues: {},
    elements: [],
  };

  return (
    <div className="w-full bg-card border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2">
          {/* RTL Prev button (ChevronRight points rightwards to previous in RTL) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-40 transition-colors text-foreground"
            title="مرحله قبلی"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayToggle}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            title={isPlaying ? 'توقف موقت پخش' : 'پخش خودکار مراحل (۲ ثانیه)'}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>

          {/* RTL Next button (ChevronLeft points leftwards to next in RTL) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentIndex >= steps.length - 1}
            className="p-2 rounded-xl border bg-background hover:bg-muted disabled:opacity-40 transition-colors text-foreground"
            title="مرحله بعدی"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Show All Toggle */}
          <button
            type="button"
            onClick={handleToggleShowAll}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
              showAll
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{showAll ? 'مرحله به مرحله' : 'نمایش کامل الگو'}</span>
          </button>
        </div>

        {/* Step Counter Badge */}
        <div className="text-xs font-bold bg-muted px-3.5 py-1.5 rounded-xl text-foreground flex items-center gap-1">
          <span>مرحله</span>
          <span className="text-primary font-mono text-sm">{toPersianDigits(currentIndex + 1)}</span>
          <span>از</span>
          <span className="font-mono text-sm">{toPersianDigits(totalSteps)}</span>
        </div>
      </div>

      {/* Step Instructional Details */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary inline-block" />
          {activeStep.titleFa}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {activeStep.instructionFa}
        </p>

        {/* Calculated Values Chips */}
        {activeStep.calculatedValues && Object.keys(activeStep.calculatedValues).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {Object.entries(activeStep.calculatedValues).map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-xs bg-muted/60 border rounded-lg px-2.5 py-1 text-foreground"
              >
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-mono font-bold text-primary">
                  {typeof val === 'number' ? toPersianDigits(val) : toPersianDigits(String(val))}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
