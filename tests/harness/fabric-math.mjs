/**
 * Dooz Test Harness - Smart Fabric Consumption & Cutting Layout Calculator
 * Mathematical model for fabric yardage estimation across 110cm and 150cm rolls.
 */

export function calculateFabricConsumption(params) {
  const {
    bodiceLength = 42,
    skirtLength = 65,
    sleeveLength = 60,
    size = 40,
    fabricWidth = 150, // 110 or 150
    fabricPattern = 'SOLID', // 'SOLID' | 'ONE_WAY' | 'PLAID'
    allowanceCm = 20,
  } = params;

  // Determine nap / pattern multiplier
  let patternMultiplier = 1.0;
  if (fabricPattern === 'ONE_WAY' || fabricPattern === 'VELVET') {
    patternMultiplier = 1.15; // +15%
  } else if (fabricPattern === 'PLAID' || fabricPattern === 'STRIPES') {
    patternMultiplier = 1.20; // +20%
  }

  // Base lengths in cm
  const isWide = fabricWidth >= 140;
  const isLargeSize = size >= 48;

  let baseLengthCm = 0;
  let layoutType = 'PARALLEL';
  let warning = null;

  if (isWide) {
    // 150cm roll: front and back panels can generally nest side-by-side
    baseLengthCm = bodiceLength + skirtLength + sleeveLength + allowanceCm;
    if (isLargeSize) {
      // For size 48+, side-by-side nesting requires slightly more margin
      baseLengthCm += 15;
    }
  } else {
    // 110cm roll: narrow bolt cannot nest side-by-side
    if (isLargeSize) {
      layoutType = 'STACKED';
      // Front and back panels must be stacked completely vertically
      baseLengthCm = (bodiceLength * 2) + (skirtLength * 2) + sleeveLength + allowanceCm + 15;
      warning = 'نیاز به چیدمان متوالی (Stacked Layout) به دلیل عرض کم پارچه و سایز بالا';
    } else {
      // Moderate size on 110cm: Ratio ~1.55x compared to 150cm roll
      const wideBase = bodiceLength + skirtLength + sleeveLength + allowanceCm;
      baseLengthCm = wideBase * 1.55;
    }
  }

  const finalLengthCm = Math.round(baseLengthCm * patternMultiplier);
  const finalMeters = Number((finalLengthCm / 100).toFixed(2));

  return {
    fabricWidth,
    fabricPattern,
    size,
    baseLengthCm,
    patternMultiplier,
    finalLengthCm,
    finalMeters,
    layoutType,
    warning,
    wastagePercentage: isWide ? 12 : 18,
  };
}
