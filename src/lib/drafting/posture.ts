/**
 * Dooz Drafting Engine - Posture & Fit Compensations
 */

import { FitEaseSpec, FitPreference, PostureAdjustments } from '@/types/drafting';

export const FIT_EASE: Record<FitPreference, FitEaseSpec> = {
  TIGHT: {
    bust: 2.5,
    waist: 0.5,
    hip: 1.0,
    bicep: 2.0,
    multiplier: 0.5,
  },
  CLASSIC: {
    bust: 5.0,
    waist: 1.0,
    hip: 2.0,
    bicep: 4.0,
    multiplier: 1.0,
  },
  LOOSE: {
    bust: 9.0,
    waist: 2.0,
    hip: 4.0,
    bicep: 7.0,
    multiplier: 1.7,
  },
};

export function getFitEase(preference: FitPreference = 'CLASSIC'): FitEaseSpec {
  return FIT_EASE[preference] || FIT_EASE.CLASSIC;
}
