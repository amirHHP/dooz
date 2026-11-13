'use client';

import React, { useState } from 'react';
import { PatternStepData } from '@/types/marketplace';
import { toPersianDigits } from '@/lib/format';
import { ChevronDown, ChevronUp, Scissors, Sparkles, Check } from 'lucide-react';

export interface TransformationAccordionProps {
  steps?: PatternStepData[];
}

export function TransformationAccordion({ steps }: TransformationAccordionProps) {
  const defaultSteps: PatternStepData[] = [
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
  ];

  const displaySteps = steps && steps.length > 0 ? steps : defaultSteps;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleStep = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2.5">
          <Scissors className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">مراحل تبدیل و مدلسازی الگو</h3>
        </div>
        <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-mono">
          {toPersianDigits(displaySteps.length)} مرحله مدلسازی
        </span>
      </div>

      <div className="space-y-3">
        {displaySteps.map((step, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={step.id || idx}
              className={`rounded-xl border transition-all ${
                isOpen ? 'bg-muted/30 border-primary/40' : 'bg-background hover:bg-muted/40'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleStep(idx)}
                className="w-full flex items-center justify-between p-4 text-right"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isOpen
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {toPersianDigits(step.stepOrder || idx + 1)}
                  </div>
                  <h4 className="text-sm font-bold text-foreground">{step.title}</h4>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 text-xs leading-relaxed text-muted-foreground border-t border-muted/50">
                  <p>{step.description}</p>

                  {/* Special standard seam allowance table on the 4th step */}
                  {step.title.includes('حق درز') && (
                    <div className="rounded-xl border bg-background p-3 grid grid-cols-3 gap-2 text-center font-bold text-foreground mt-2">
                      <div className="bg-muted/30 p-2 rounded-lg">
                        <span className="block text-[10px] text-muted-foreground">دور گردن و یقه</span>
                        <span className="font-mono text-primary">۱٫۰ cm</span>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg">
                        <span className="block text-[10px] text-muted-foreground">درزهای پهلو و آستین</span>
                        <span className="font-mono text-primary">۲٫۰ cm</span>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg">
                        <span className="block text-[10px] text-muted-foreground">لبه پایین دامن / مچ</span>
                        <span className="font-mono text-primary">۳٫۵ cm</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
