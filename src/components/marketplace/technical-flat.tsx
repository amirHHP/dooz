'use client';

import React, { useState } from 'react';
import { Eye } from 'lucide-react';

export interface TechnicalFlatProps {
  frontSvg?: string | null;
  backSvg?: string | null;
  title?: string;
}

export function TechnicalFlat({
  frontSvg,
  backSvg,
  title = 'طرح فنی برداری (Technical Flat)',
}: TechnicalFlatProps) {
  const [activeView, setActiveView] = useState<'FRONT' | 'BACK'>('FRONT');

  const defaultFrontFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <path d="M120,80 L160,85 L200,105 L240,85 L280,80 L290,140 L260,160 L265,360 L135,360 L140,160 L110,140 Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
    <path d="M200,105 L200,360" stroke="#0F172A" stroke-width="1.5" stroke-dasharray="4,4"/>
    <path d="M160,85 L180,180" stroke="#0F172A" stroke-width="1.2"/>
    <path d="M240,85 L220,180" stroke="#0F172A" stroke-width="1.2"/>
    <circle cx="200" cy="140" r="3" fill="#0F172A"/>
    <circle cx="200" cy="180" r="3" fill="#0F172A"/>
    <circle cx="200" cy="220" r="3" fill="#0F172A"/>
    <circle cx="200" cy="260" r="3" fill="#0F172A"/>
  </svg>`;

  const defaultBackFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
    <path d="M120,80 L160,85 L200,95 L240,85 L280,80 L290,140 L260,160 L265,360 L135,360 L140,160 L110,140 Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>
    <path d="M200,95 L200,360" stroke="#0F172A" stroke-width="2"/>
    <path d="M165,160 L170,260" stroke="#0F172A" stroke-width="1.2"/>
    <path d="M235,160 L230,260" stroke="#0F172A" stroke-width="1.2"/>
    <path d="M185,320 L215,320" stroke="#0F172A" stroke-width="1.5" stroke-dasharray="3,3"/>
  </svg>`;

  const currentSvg = activeView === 'FRONT' ? frontSvg || defaultFrontFallback : backSvg || defaultBackFallback;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {/* Front / Back View Switcher */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('FRONT')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeView === 'FRONT'
                ? 'bg-background shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            نمای جلو (Front)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('BACK')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeView === 'BACK'
                ? 'bg-background shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            نمای پشت (Back)
          </button>
        </div>
      </div>

      {/* Vector Canvas Container */}
      <div className="relative aspect-[4/5] max-h-[460px] w-full rounded-xl border bg-slate-50 dark:bg-slate-950/50 p-4 flex items-center justify-center overflow-hidden">
        <div
          className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full"
          dangerouslySetInnerHTML={{ __html: currentSvg }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>خطوط ممتد: برش و درز اصلی</span>
        <span>خطوط چین‌چین (Dash): مغزی‌دوزی، فیلتاب و زیپ</span>
      </div>
    </div>
  );
}
