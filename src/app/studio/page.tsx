'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BlockType,
  DraftingMethod,
  FitPreference,
  PostureAdjustments,
} from '@/types/drafting';
import { draftPattern } from '@/lib/drafting';
import { StudioCanvas } from '@/components/studio/canvas';
import { StudioTimelinePlayer } from '@/components/studio/timeline-player';
import { StudioSidebar } from '@/components/studio/sidebar';
import { toPersianDigits } from '@/lib/format';
import { Scissors, UserCheck, ArrowRight, X, AlertCircle } from 'lucide-react';

// Default Size 38 benchmark measurements for instant zero-lag studio load
const DEFAULT_STUDIO_MEASUREMENTS: Record<string, number> = {
  bust: 88.0,
  waist: 70.0,
  hip: 94.0,
  hipDepth: 20.0,
  skirtLength: 65.0,
  backLength: 41.0,
  frontLength: 43.5,
  acrossBack: 34.5,
  acrossFront: 32.0,
  neck: 36.0,
  shoulder: 12.5,
  bustHeight: 26.5,
  bustSpan: 18.5,
  sleeveLength: 58.0,
  armCirc: 27.5,
  wristCirc: 16.0,
  trouserLength: 102.0,
  crotchDepth: 26.0,
  kneeWidth: 22.0,
  hemWidth: 20.0,
};

function StudioContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');
  const paramBlock = searchParams.get('block') as BlockType | null;
  const paramMethod = searchParams.get('method') as DraftingMethod | null;

  // Studio Configuration State
  const [blockType, setBlockType] = useState<BlockType>(paramBlock || 'SKIRT');
  const [method, setMethod] = useState<DraftingMethod>(paramMethod || 'MULLER');
  const [fitPreference, setFitPreference] = useState<FitPreference>('CLASSIC');
  const [posture, setPosture] = useState<PostureAdjustments>({});
  const [measurements, setMeasurements] = useState<Record<string, number>>(DEFAULT_STUDIO_MEASUREMENTS);

  // Active Client Bridge State
  const [activeClient, setActiveClient] = useState<{ id: string; name: string } | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  // Timeline Player State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Hydrate from Client CRM bridge if clientId is in query params
  useEffect(() => {
    if (!clientId) {
      setActiveClient(null);
      return;
    }

    let isMounted = true;
    setClientLoading(true);
    setClientError(null);

    fetch(`/api/clients/${clientId}`)
      .then((res) => {
        if (!res.ok) throw new Error('مشتری مورد نظر یافت نشد');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const c = data.client;
        if (!c) throw new Error('اطلاعات مشتری خالی است');

        setActiveClient({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
        });

        const m = (c.measurements as Record<string, number>) || {};
        // Map 26 measurements to studio keys
        setMeasurements((prev) => ({
          ...prev,
          bust: m.bustCircumference ?? prev.bust,
          waist: m.waistCircumference ?? prev.waist,
          hip: m.hipCircumference ?? prev.hip,
          hipDepth: m.hipHeight ?? prev.hipDepth,
          skirtLength: m.skirtLength ?? prev.skirtLength,
          backLength: m.backWaistLength ?? prev.backLength,
          frontLength: m.frontWaistLength ?? prev.frontLength,
          acrossBack: m.acrossBack ?? prev.acrossBack,
          acrossFront: m.acrossFront ?? prev.acrossFront,
          neck: m.neckCircumference ?? prev.neck,
          shoulder: m.shoulderLength ?? prev.shoulder,
          bustHeight: m.bustHeight ?? prev.bustHeight,
          bustSpan: m.bustDistance ?? prev.bustSpan,
          sleeveLength: m.sleeveLength ?? prev.sleeveLength,
          armCirc: m.bicepCircumference ?? prev.armCirc,
          wristCirc: m.wristCircumference ?? prev.wristCirc,
          trouserLength: m.trouserOutseam ?? prev.trouserLength,
          crotchDepth: m.crotchDepth ?? prev.crotchDepth,
          kneeWidth: m.kneeCircumference ? m.kneeCircumference / 1.7 : prev.kneeWidth,
          hemWidth: m.ankleCircumference ? m.ankleCircumference / 1.2 : prev.hemWidth,
        }));

        // Hydrate posture tags
        const tags: string[] = Array.isArray(c.postureTags) ? c.postureTags : [];
        setPosture({
          prominentAbdomen: tags.includes('PROMINENT_ABDOMEN'),
          swayback: tags.includes('SWAYBACK'),
          prominentHip: tags.includes('PROMINENT_HIP'),
          shoulderSlope: tags.includes('SLOPING_SHOULDERS')
            ? 'SLOPING'
            : tags.includes('SQUARE_SHOULDERS')
            ? 'SQUARE'
            : 'NORMAL',
        });

        if (c.fitPreference) {
          setFitPreference(c.fitPreference);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setClientError(err.message || 'خطا در بارگذاری پرونده مشتری');
      })
      .finally(() => {
        if (isMounted) setClientLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  // Recalculate pattern deterministically on every parameter change
  const draftResult = useMemo(() => {
    try {
      return draftPattern({
        blockType,
        method,
        fitPreference,
        measurements,
        postureAdjustments: posture,
      });
    } catch (e: any) {
      console.error('Drafting calculation error:', e);
      // Fallback safe calculation with skirt
      return draftPattern({
        blockType: 'SKIRT',
        method: 'MULLER',
        fitPreference: 'CLASSIC',
        measurements: DEFAULT_STUDIO_MEASUREMENTS,
      });
    }
  }, [blockType, method, fitPreference, measurements, posture]);

  const steps = draftResult?.steps || [];
  const currentStep = steps[currentIndex] || steps[0];
  const activeElements = currentStep?.elements || [];

  const handleMeasurementChange = (key: string, val: number) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleExport = async (format: 'A4_PDF' | 'A0_PDF' | 'SVG' | 'DXF') => {
    setIsExporting(true);
    try {
      let content: string | Uint8Array;
      let filename = `pattern-${blockType.toLowerCase()}-${method.toLowerCase()}`;
      let mimeType = 'text/plain';

      switch (format) {
        case 'A4_PDF': {
          content = await draftResult.exportA4Pdf();
          filename += '-a4-tiled.pdf';
          mimeType = 'application/pdf';
          break;
        }
        case 'A0_PDF': {
          content = await draftResult.exportA0Pdf();
          filename += '-a0-plotter.pdf';
          mimeType = 'application/pdf';
          break;
        }
        case 'SVG': {
          content = draftResult.exportSvg();
          filename += '.svg';
          mimeType = 'image/svg+xml';
          break;
        }
        case 'DXF': {
          content = draftResult.exportDxf();
          filename += '.dxf';
          mimeType = 'application/dxf';
          break;
        }
      }

      const blob = new Blob([content as any], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Active Client Bridge Banner */}
      {activeClient && (
        <div className="flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 px-5 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <Scissors className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                در حال طراحی الگو برای{' '}
                <span className="text-primary font-black">{activeClient.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                اندازه‌های آنتروپومتریک و ویژگی‌های وضعیتی مشتری به صورت خودکار اعمال شدند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${activeClient.id}`}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-background hover:bg-muted text-foreground transition-colors"
            >
              مشاهده پرونده
            </Link>
            <button
              type="button"
              onClick={() => setActiveClient(null)}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="بستن حالت مشتری"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {clientError && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-800 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{clientError}</span>
        </div>
      )}

      {/* Main CAD Studio Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Area: Canvas & Timeline Player (Right in RTL) */}
        <div className="flex-1 w-full space-y-4">
          <StudioCanvas
            draftResult={draftResult}
            currentStepIndex={currentIndex}
            showAll={showAll}
            activeElements={activeElements}
          />

          <StudioTimelinePlayer
            steps={steps}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            showAll={showAll}
            setShowAll={setShowAll}
          />
        </div>

        {/* Right Area: Real-Time Sidebar Controls (Left in RTL) */}
        <StudioSidebar
          blockType={blockType}
          setBlockType={setBlockType}
          method={method}
          setMethod={setMethod}
          fitPreference={fitPreference}
          setFitPreference={setFitPreference}
          posture={posture}
          setPosture={setPosture}
          measurements={measurements}
          onMeasurementChange={handleMeasurementChange}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground">
          <div className="animate-pulse">در حال بارگذاری استودیو الگوسازی دوز...</div>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}
