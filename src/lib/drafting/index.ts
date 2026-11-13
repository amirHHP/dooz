/**
 * Dooz Parametric Pattern Drafting Core Engine
 * Central Re-Export Hub & Pattern Dispatcher
 */

export * from './geometry';
export * from './posture';
export * from './skirt';
export * from './bodice';
export * from './sleeve';
export * from './trouser';
export * from './export-pdf';
export * from './export-svg';
export * from './export-dxf';

import { ParametricInput, PatternGeometry } from '@/types/drafting';
import { draftBasicSkirt } from './skirt';
import { draftBasicBodice } from './bodice';
import { draftBasicSleeve } from './sleeve';
import { draftBasicTrouser } from './trouser';
import { calculateA4Tiling, exportA4TiledPdf, exportA0PlotterPdf } from './export-pdf';
import { generatePatternSvg } from './export-svg';
import { generateAAMADxf } from './export-dxf';

export function draftPattern(input: ParametricInput): PatternGeometry {
  const { blockType, method, measurements, postureAdjustments, fitPreference } = input;

  let baseResult: any;

  switch (blockType) {
    case 'SKIRT':
      baseResult = draftBasicSkirt(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    case 'BODICE':
      baseResult = draftBasicBodice(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    case 'SLEEVE': {
      const bodiceRef = draftBasicBodice(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      baseResult = draftBasicSleeve(bodiceRef, measurements);
      break;
    }

    case 'TROUSER':
      baseResult = draftBasicTrouser(measurements, {
        method,
        fitPreference,
        posture: postureAdjustments,
      });
      break;

    default:
      throw new Error(`Unsupported pattern block type: ${blockType}`);
  }

  // Ensure standard boundingBox is populated
  const boundingBox = baseResult.boundingBox || {
    minX: 0,
    minY: 0,
    width: 800,
    height: 1000,
  };

  return {
    ...baseResult,
    boundingBox,
    exportA4Pdf: () => exportA4TiledPdf(baseResult),
    exportA0Pdf: () => exportA0PlotterPdf(baseResult),
    exportSvg: () => generatePatternSvg(baseResult),
    exportDxf: () => generateAAMADxf(baseResult),
  };
}
