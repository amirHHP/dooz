/**
 * Empirical Adversarial Stress Test Suite for Project Dooz (دوز)
 * Author: Challenger 1 (critic/specialist)
 *
 * Exercises:
 * 1. Drafting Engine Stress:
 *    - Extreme anthropometric ratios (waist/hip, heights, bust, etc.) across Müller, Metric, Grlawein
 *    - Side seam parity: |L_front - L_back| <= 0.01mm across all blocks and methods
 *    - PDF calibration square: exactly 50.0mm x 50.0mm (141.732pt) in A4 tiled PDF output
 *    - DXF output format: starts with '0\nSECTION\n2\nHEADER', ends with '0\nEOF'
 * 2. Sheba & Double-Entry Ledger:
 *    - Invalid lengths, country codes, checksum corruption (single-digit & transposition), Persian digits
 *    - Zero penny leakage on odd amounts (1, 3, 99999, 350000) and 10,000 random inputs
 * 3. Fabric Consumption:
 *    - Extreme sizes (28 to 70), narrow vs wide bolts (70cm to 300cm), pattern multipliers
 */

import { draftBasicSkirt } from '../src/lib/drafting/skirt.ts';
import { draftBasicBodice } from '../src/lib/drafting/bodice.ts';
import { draftBasicSleeve } from '../src/lib/drafting/sleeve.ts';
import { draftBasicTrouser } from '../src/lib/drafting/trouser.ts';
import { draftPattern } from '../src/lib/drafting/index.ts';
import { calculateA4Tiling, exportA4TiledPdf, exportA0PlotterPdf } from '../src/lib/drafting/export-pdf.ts';
import { generateAAMADxf } from '../src/lib/drafting/export-dxf.ts';
import { generatePatternSvg } from '../src/lib/drafting/export-svg.ts';
import { validateSheba, generateValidSheba, calculatePurchaseSplit, MockWalletLedger, IRANIAN_BANKS } from '../src/lib/ledger.ts';
import { calculateFabricConsumption } from '../src/types/marketplace.ts';

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const YELLOW = '\x1b[33m';

let passedCount = 0;
let failedCount = 0;
const failureDetails = [];

function check(desc, condition, details = '') {
  if (condition) {
    passedCount++;
    console.log(`  ${GREEN}✓${RESET} ${desc}`);
  } else {
    failedCount++;
    console.error(`  ${RED}✗ FAIL:${RESET} ${desc} ${details ? '(' + details + ')' : ''}`);
    failureDetails.push({ desc, details });
  }
}

async function runAdversarialSuite() {
  console.log(`\n${BOLD}${CYAN}========================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}       DOOZ CHALLENGER 1 EMPIRICAL ADVERSARIAL STRESS SUITE             ${RESET}`);
  console.log(`${BOLD}${CYAN}========================================================================${RESET}\n`);

  // ==========================================================================
  // SECTION 1: Drafting Anthropometric Extremes & Mathematical Invariants
  // ==========================================================================
  console.log(`${BOLD}--- 1. ANTHROPOMETRIC EXTREMES & RATIOS ---${RESET}`);

  // 1.1 Extreme Waist-to-Hip Ratios in Skirt
  const extremeRatios = [
    { name: 'Ultra-hourglass (W=45, H=140)', waist: 45, hip: 140, hipDepth: 22, skirtLength: 70 },
    { name: 'Plus-size hourglass (W=110, H=160)', waist: 110, hip: 160, hipDepth: 25, skirtLength: 85 },
    { name: 'Athletic narrow hip diff (W=69.9, H=70.0)', waist: 69.9, hip: 70.0, hipDepth: 18, skirtLength: 60 },
    { name: 'Micro mini skirt (L=15cm)', waist: 65, hip: 90, hipDepth: 18, skirtLength: 15 },
    { name: 'Cathedral bridal train (L=250cm)', waist: 68, hip: 96, hipDepth: 20, skirtLength: 250 },
  ];

  for (const tc of extremeRatios) {
    for (const method of ['MULLER', 'METRIC', 'GRLAWEIN']) {
      for (const fit of ['TIGHT', 'CLASSIC', 'LOOSE']) {
        try {
          const res = draftBasicSkirt(
            { waist: tc.waist, hip: tc.hip, hipDepth: tc.hipDepth, skirtLength: tc.skirtLength },
            { method, fitPreference: fit, posture: { prominentAbdomen: true, swayback: true, prominentHip: true } }
          );
          const hasNaN = Object.values(res.points).some((p) => Number.isNaN(p.x) || Number.isNaN(p.y));
          const hasInf = Object.values(res.points).some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y));
          check(`Skirt ${tc.name} [${method}/${fit}] calculates finite coordinates`, !hasNaN && !hasInf);
        } catch (err) {
          check(`Skirt ${tc.name} [${method}/${fit}] unexpected throw: ${err.message}`, false);
        }
      }
    }
  }

  // 1.2 Invalid Anthropometrics should throw
  const invalidSkirtInputs = [
    { name: 'Inverted ratio (waist > hip)', waist: 100, hip: 90 },
    { name: 'Equal ratio (waist === hip)', waist: 90, hip: 90 },
    { name: 'Negative hip depth', waist: 70, hip: 94, hipDepth: -5 },
    { name: 'Zero skirt length', waist: 70, hip: 94, skirtLength: 0 },
  ];

  for (const inv of invalidSkirtInputs) {
    let threw = false;
    try {
      draftBasicSkirt(inv);
    } catch (e) {
      threw = true;
    }
    check(`Invalid input rejection: ${inv.name}`, threw);
  }

  // 1.3 Bodice Anthropometric Extremes
  const extremeBodices = [
    { name: 'Petite 32 (B=74, W=56)', bust: 74, waist: 56, backLength: 36, frontLength: 38 },
    { name: 'Plus-size 56 (B=136, W=118)', bust: 136, waist: 118, backLength: 46, frontLength: 50 },
    { name: 'Extreme bust difference (B=120, W=60)', bust: 120, waist: 60, backLength: 42, frontLength: 48 },
  ];

  for (const tc of extremeBodices) {
    for (const method of ['MULLER', 'METRIC', 'GRLAWEIN']) {
      try {
        const res = draftBasicBodice(tc, {
          method,
          posture: { shoulderSlope: 'SLOPING', prominentAbdomen: true, swayback: true },
        });
        const validAh = res.totalArmholePerimeter > 30 && Number.isFinite(res.totalArmholePerimeter);
        const validDart = res.Dbust > 0 && Number.isFinite(res.Dbust);
        check(`Bodice ${tc.name} [${method}] positive armhole and dart`, validAh && validDart);
      } catch (e) {
        check(`Bodice ${tc.name} [${method}] failed: ${e.message}`, false);
      }
    }
  }

  // ==========================================================================
  // SECTION 2: Mathematical Invariant: Side Seam Parity (|L_front - L_back| <= 0.01mm)
  // ==========================================================================
  console.log(`\n${BOLD}--- 2. SIDE SEAM PARITY INVARIANT (|L_front - L_back| <= 0.01mm) ---${RESET}`);

  let maxSeamDiscrepancy = 0;
  const methods = ['MULLER', 'METRIC', 'GRLAWEIN'];
  const fits = ['TIGHT', 'CLASSIC', 'LOOSE'];

  for (const method of methods) {
    for (const fit of fits) {
      for (let w = 60; w <= 100; w += 10) {
        for (let h = w + 10; h <= w + 40; h += 10) {
          const res = draftBasicSkirt(
            { waist: w, hip: h, hipDepth: 20, skirtLength: 65 },
            { method, fitPreference: fit, posture: { prominentHip: true } }
          );
          const diff = Math.abs(res.frontSideSeamLength - res.backSideSeamLength);
          if (diff > maxSeamDiscrepancy) maxSeamDiscrepancy = diff;
        }
      }
    }
  }

  check(
    `Skirt side seam parity across all methods/fits: max diff = ${maxSeamDiscrepancy.toFixed(6)}mm <= 0.01mm`,
    maxSeamDiscrepancy <= 0.01,
    `actual max discrepancy: ${maxSeamDiscrepancy}`
  );

  // ==========================================================================
  // SECTION 3: Calibration Square Size in A4 Tiled PDF Output
  // ==========================================================================
  console.log(`\n${BOLD}--- 3. PDF CALIBRATION SQUARE VERIFICATION ---${RESET}`);

  const tiling = calculateA4Tiling(800, 1000);
  const sq = tiling.calibrationSquare;

  check('Calibration square widthMm is exactly 50.0mm', sq.widthMm === 50.0);
  check('Calibration square heightMm is exactly 50.0mm', sq.heightMm === 50.0);
  
  // 50mm in PostScript points: 50 * 72 / 25.4 = 50 * 2.834645669... = 141.73228...
  const expectedPt = 50.0 * 2.834645669;
  check(
    `Calibration square widthPt matches 141.732pt (actual: ${sq.widthPt.toFixed(3)}pt)`,
    Math.abs(sq.widthPt - expectedPt) < 1e-4 && Math.abs(sq.widthPt - 141.732) < 0.001
  );
  check(
    `Calibration square heightPt matches 141.732pt (actual: ${sq.heightPt.toFixed(3)}pt)`,
    Math.abs(sq.heightPt - expectedPt) < 1e-4 && Math.abs(sq.heightPt - 141.732) < 0.001
  );

  // Verify diagonal: sqrt(50^2 + 50^2) = 70.710678...
  const expectedDiag = Math.sqrt(50 * 50 + 50 * 50);
  check(
    `Calibration square diagonal matches ${expectedDiag.toFixed(3)}mm`,
    Math.abs(sq.diagonalMm - expectedDiag) < 1e-4
  );

  // Check actual rendered PDF binary stream contains 141.73 pt rectangle
  const mockDraft = { blockType: 'SKIRT', method: 'MULLER', boundingBox: { width: 800, height: 1000 } };
  const pdfBytes = await exportA4TiledPdf(mockDraft);
  const pdfString = Buffer.from(pdfBytes).toString('latin1');

  check('Exported A4 PDF starts with %PDF-1.4', pdfString.startsWith('%PDF-1.4'));
  check('Exported A4 PDF ends with %%EOF', pdfString.trim().endsWith('%%EOF'));
  check(
    'Exported A4 PDF stream contains 141.73 141.73 re S (5cm calibration square)',
    pdfString.includes('141.73 141.73 re S')
  );
  check(
    'Exported A4 PDF stream contains calibration square label',
    pdfString.includes('5cm x 5cm Calibration Square')
  );

  // ==========================================================================
  // SECTION 4: DXF Output Format Verification
  // ==========================================================================
  console.log(`\n${BOLD}--- 4. DXF CAD OUTPUT FORMAT VERIFICATION ---${RESET}`);

  const blocks = [
    draftBasicSkirt({ waist: 70, hip: 94 }),
    draftBasicBodice({ bust: 88, waist: 70 }),
    draftBasicTrouser({ waist: 70, hip: 94 }),
  ];

  for (const block of blocks) {
    const dxf = generateAAMADxf(block);
    check(
      `DXF for ${block.blockType} starts with '0\\nSECTION\\n2\\nHEADER'`,
      dxf.startsWith('0\nSECTION\n2\nHEADER')
    );
    check(
      `DXF for ${block.blockType} ends with '0\\nEOF'`,
      dxf.trim().endsWith('0\nEOF')
    );
    check(`DXF contains ENTITIES section`, dxf.includes('SECTION\n2\nENTITIES'));
    check(`DXF contains TABLES and LAYER definitions`, dxf.includes('TABLE\n2\nLAYER'));
  }

  // ==========================================================================
  // SECTION 5: Iranian Sheba & Double-Entry Ledger Validation
  // ==========================================================================
  console.log(`\n${BOLD}--- 5. SHEBA & DOUBLE-ENTRY LEDGER ADVERSARIAL TESTS ---${RESET}`);

  // 5.1 Valid Sheba generation and validation across multiple Iranian banks
  const testBankCodes = ['056', '017', '012', '018', '054', '057', '061', '062'];
  for (const bankCode of testBankCodes) {
    const validSheba = generateValidSheba(bankCode, '9876543210123456789');
    const valRes = validateSheba(validSheba);
    check(`Valid Sheba generated for bank ${bankCode} (${IRANIAN_BANKS[bankCode]})`, valRes.valid && valRes.bankCode === bankCode);
  }

  // 5.2 Persian digits input to Sheba
  const validAscii = generateValidSheba('056', '1234567890123456789');
  const persianDigitsMap = { '0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹' };
  const persianSheba = validAscii.replace(/[0-9]/g, (d) => persianDigitsMap[d]);
  const valPersian = validateSheba(persianSheba);
  check(`Sheba with Persian digits converts and validates successfully`, valPersian.valid);

  // 5.3 Sheba length edge cases
  check('Reject Sheba length 25 (short)', !validateSheba(validAscii.slice(0, 25)).valid);
  check('Reject Sheba length 27 (long)', !validateSheba(validAscii + '0').valid);
  check('Reject empty string', !validateSheba('').valid);
  check('Reject null/undefined', !validateSheba(null).valid && !validateSheba(undefined).valid);

  // 5.4 Invalid country codes
  check('Reject non-IR country code US', !validateSheba('US' + validAscii.slice(2)).valid);
  check('Reject numeric country code 99', !validateSheba('99' + validAscii.slice(2)).valid);
  check('Reject symbol country code @@', !validateSheba('@@' + validAscii.slice(2)).valid);

  // 5.5 Single-digit Checksum Corruption
  let corruptionDetectedCount = 0;
  for (let idx = 2; idx < 26; idx++) {
    const origChar = validAscii[idx];
    const corruptedChar = origChar === '9' ? '0' : String(Number(origChar) + 1);
    const corruptedSheba = validAscii.slice(0, idx) + corruptedChar + validAscii.slice(idx + 1);
    const res = validateSheba(corruptedSheba);
    if (!res.valid) corruptionDetectedCount++;
  }
  check(
    `Single-digit corruption detected for all 24 numeric positions (24/24)`,
    corruptionDetectedCount === 24
  );

  // 5.6 Adjacent digit transposition corruption
  let transpositionDetectedCount = 0;
  for (let idx = 2; idx < 25; idx++) {
    if (validAscii[idx] !== validAscii[idx + 1]) {
      const chars = validAscii.split('');
      const tmp = chars[idx];
      chars[idx] = chars[idx + 1];
      chars[idx + 1] = tmp;
      const transposed = chars.join('');
      if (!validateSheba(transposed).valid) transpositionDetectedCount++;
    }
  }
  check(
    `Transposition corruption detected across positions (${transpositionDetectedCount} tests)`,
    transpositionDetectedCount > 0
  );

  // 5.7 Double-Entry Ledger: Zero Penny/Toman Leakage on Odd Amounts
  const oddPurchaseAmounts = [1, 3, 7, 9, 13, 99, 999, 99999, 350000, 1234567, 987654321];
  for (const amt of oddPurchaseAmounts) {
    const split = calculatePurchaseSplit(amt);
    const leak = amt - (split.creatorEarningsToman + split.platformFeeToman);
    check(
      `Zero penny leakage for ${amt} Toman: creator=${split.creatorEarningsToman}, fee=${split.platformFeeToman}, leak=${leak}`,
      leak === 0 && split.creatorEarningsToman === Math.floor(amt * 0.8) && split.platformFeeToman === amt - split.creatorEarningsToman
    );
  }

  // Stress property test: 10,000 random Toman amounts
  let zeroLeakCount = 0;
  for (let i = 0; i < 10000; i++) {
    const randomPrice = Math.floor(Math.random() * 50000000) + 1;
    const split = calculatePurchaseSplit(randomPrice);
    if (split.creatorEarningsToman + split.platformFeeToman === randomPrice) {
      zeroLeakCount++;
    }
  }
  check(`Property test: 10,000 random Toman amounts exhibit exactly 0 leakage (10000/10000)`, zeroLeakCount === 10000);

  // 5.8 MockWalletLedger Payout Invariants
  const ledger = new MockWalletLedger(500000); // 500k Toman balance
  const belowMinRes = ledger.requestPayout('p1', 50000, 'creator_1', { valid: true, sheba: validAscii });
  check('Payout rejects amount below 100,000 Toman', !belowMinRes.success);

  const exceedBalRes = ledger.requestPayout('p2', 600000, 'creator_1', { valid: true, sheba: validAscii });
  check('Payout rejects amount exceeding available balance', !exceedBalRes.success);

  const invalidShebaPayout = ledger.requestPayout('p3', 200000, 'creator_1', { valid: false });
  check('Payout rejects invalid Sheba', !invalidShebaPayout.success);

  const validPayout = ledger.requestPayout('p4', 200000, 'creator_1', { valid: true, sheba: validAscii, bankName: 'بانک سامان' });
  check('Valid payout succeeds and debits wallet balance to 300,000', validPayout.success && ledger.balance === 300000);

  // ==========================================================================
  // SECTION 6: Fabric Consumption Stress Testing
  // ==========================================================================
  console.log(`\n${BOLD}--- 6. FABRIC CONSUMPTION STRESS TESTING ---${RESET}`);

  // Test extreme sizes from petite (28) to plus (70)
  for (const sz of [28, 34, 40, 48, 56, 70]) {
    const wideRes = calculateFabricConsumption({ size: sz, fabricWidth: 150 });
    const narrowRes = calculateFabricConsumption({ size: sz, fabricWidth: 110 });

    check(`Fabric consumption for size ${sz} wide roll is positive and >= 0.5m`, wideRes.finalMeters >= 0.5);
    check(`Fabric consumption for size ${sz} narrow roll is positive and >= 0.5m`, narrowRes.finalMeters >= 0.5);

    if (sz >= 48) {
      check(`Size ${sz} on narrow 110cm roll triggers STACKED layout and warning`, narrowRes.layoutType === 'STACKED' && narrowRes.warning !== null);
    } else {
      check(`Size ${sz} on narrow 110cm roll remains PARALLEL layout`, narrowRes.layoutType === 'PARALLEL');
    }
  }

  // Extreme fabric roll widths
  const narrowBolt = calculateFabricConsumption({ fabricWidth: 90, size: 40 });
  const standardBolt = calculateFabricConsumption({ fabricWidth: 150, size: 40 });
  const wideBolt = calculateFabricConsumption({ fabricWidth: 280, size: 40 });

  check('Narrow roll requires more fabric than standard roll', narrowBolt.finalMeters >= standardBolt.finalMeters);
  check('Wide roll (280cm) computes valid yardage', wideBolt.finalMeters >= 0.5);

  // Fabric patterns multipliers
  const solid = calculateFabricConsumption({ fabricPattern: 'SOLID' });
  const velvet = calculateFabricConsumption({ fabricPattern: 'VELVET' });
  const plaid = calculateFabricConsumption({ fabricPattern: 'PLAID' });

  check('Velvet adds +15% multiplier', Math.abs(velvet.patternMultiplier - 1.15) < 1e-4);
  check('Plaid adds +20% multiplier', Math.abs(plaid.patternMultiplier - 1.20) < 1e-4);
  check('Plaid yardage > Velvet yardage > Solid yardage', plaid.finalLengthCm > velvet.finalLengthCm && velvet.finalLengthCm > solid.finalLengthCm);

  // Summary
  console.log(`\n${BOLD}========================================================================${RESET}`);
  console.log(`${BOLD}CHALLENGER 1 ADVERSARIAL STRESS TEST SUMMARY:${RESET}`);
  console.log(`Total Invariant Checks: ${passedCount + failedCount}`);
  console.log(`Passed: ${GREEN}${passedCount}${RESET}`);
  console.log(`Failed: ${failedCount > 0 ? RED : GREEN}${failedCount}${RESET}`);
  console.log(`${BOLD}========================================================================${RESET}\n`);

  if (failedCount > 0) {
    console.error(`${RED}${BOLD}CRITICAL: ${failedCount} ADVERSARIAL STRESS CHECKS FAILED!${RESET}`);
    process.exit(1);
  } else {
    console.log(`${GREEN}${BOLD}✔ ALL ADVERSARIAL STRESS CHECKS PASSED EMPIRICALLY!${RESET}\n`);
    process.exit(0);
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
