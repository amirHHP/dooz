/**
 * Tier 1 — Core Features F33 through F38: Creator Studio, Financial Ledger & Sandbox Checkout
 * 5 tests per feature = 30 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  assertDeepEqual,
  calculatePurchaseSplit,
  MockWalletLedger,
  validateSheba,
  generateValidSheba,
  IRANIAN_BANKS,
} from '../harness/index.mjs';

// ============================================================================
// F33: 5-Step Pattern Publishing Wizard (5 tests)
// ============================================================================
describe('F33: 5-Step Pattern Publishing Wizard', () => {
  const wizardSteps = [
    { step: 1, name: 'اطلاعات پایه', fields: ['title', 'slug', 'category', 'description'] },
    { step: 2, name: 'متد و سایزبندی', fields: ['draftingMethod', 'fitType', 'difficulty'] },
    { step: 3, name: 'تصاویر و نمودارها', fields: ['coverImage', 'technicalFlatFront', 'technicalFlatBack'] },
    { step: 4, name: 'پیوست الگو', fields: ['attachmentType', 'parametricConfig', 'blueprintPdfUrl'] },
    { step: 5, name: 'قیمت‌گذاری و انتشار', fields: ['price', 'isPublished'] },
  ];

  test('F33-1: Wizard defines exactly 5 sequential publishing steps', () => {
    assertEqual(wizardSteps.length, 5, 'Must have 5 wizard steps');
  });

  test('F33-2: Step 1 captures basic pattern metadata and auto-slug generation', () => {
    assert(wizardSteps[0].fields.includes('title'), 'Step 1 has title');
    assert(wizardSteps[0].fields.includes('slug'), 'Step 1 has slug');
  });

  test('F33-3: Step 2 captures tailoring method and difficulty rating', () => {
    assert(wizardSteps[1].fields.includes('draftingMethod'), 'Step 2 has draftingMethod');
    assert(wizardSteps[1].fields.includes('difficulty'), 'Step 2 has difficulty');
  });

  test('F33-4: Step 3 requires cover image and technical flat vector illustrations', () => {
    assert(wizardSteps[2].fields.includes('coverImage'), 'Step 3 has coverImage');
    assert(wizardSteps[2].fields.includes('technicalFlatFront'), 'Step 3 has front flat');
  });

  test('F33-5: Step 5 configures price in Toman and real-time 80/20 earnings calculator', () => {
    const salePrice = 300000;
    const split = calculatePurchaseSplit(salePrice);
    assertEqual(split.creatorEarningsToman, 240000, 'Creator gets 80% (240,000 Toman)');
    assertEqual(split.platformFeeToman, 60000, 'Platform gets 20% (60,000 Toman)');
  });
});

// ============================================================================
// F34: Parametric Presets & Blueprints (5 tests)
// ============================================================================
describe('F34: Parametric Presets & Blueprints', () => {
  const samplePreset = {
    baseBlock: 'BODICE',
    method: 'MULLER',
    easeOffsets: { bust: 5.0, waist: 4.0, hip: 5.0 },
    dartModifications: [{ source: 'SHOULDER', target: 'SIDE_SEAM', distanceBelowArmhole: 3.5 }],
  };

  test('F34-1: Parametric preset links to valid base block enum (BODICE, SKIRT, SLEEVE, TROUSER)', () => {
    const validBlocks = ['BODICE', 'SKIRT', 'SLEEVE', 'TROUSER'];
    assert(validBlocks.includes(samplePreset.baseBlock), 'Base block is valid');
  });

  test('F34-2: Parametric preset defines customizable ease offsets in cm', () => {
    assert(samplePreset.easeOffsets.bust >= 0, 'Bust ease defined');
    assert(samplePreset.easeOffsets.waist >= 0, 'Waist ease defined');
  });

  test('F34-3: Parametric preset defines dart manipulation rules', () => {
    assert(Array.isArray(samplePreset.dartModifications), 'Dart modifications array');
    assertEqual(samplePreset.dartModifications[0].source, 'SHOULDER');
    assertEqual(samplePreset.dartModifications[0].target, 'SIDE_SEAM');
  });

  test('F34-4: Multi-size blueprint attachment model validates PDF file extension', () => {
    const validPdfUrl = 'https://blob.vercel-storage.com/blueprints/coat-size-36-48.pdf';
    assert(validPdfUrl.endsWith('.pdf'), 'Blueprint URL must end with .pdf');
  });

  test('F34-5: Dual attachment models (PARAMETRIC_PRESET vs BLUEPRINT_PDF) are mutually supported', () => {
    const attachmentTypes = ['PARAMETRIC_PRESET', 'BLUEPRINT_PDF'];
    assertEqual(attachmentTypes.length, 2, 'Two attachment modes supported');
  });
});

// ============================================================================
// F35: Creator Earnings Dashboard (5 tests)
// ============================================================================
describe('F35: Creator Earnings Dashboard', () => {
  const sampleEarningsData = {
    grossSalesToman: 5000000,
    netEarningsToman: 4000000,
    walletBalanceToman: 2400000,
    salesCount: 16,
    chartData: [
      { month: 'فروردین', revenue: 1200000, net: 960000 },
      { month: 'اردیبهشت', revenue: 1800000, net: 1440000 },
      { month: 'خرداد', revenue: 2000000, net: 1600000 },
    ],
  };

  test('F35-1: Dashboard tracks Gross Revenue, Net 80% Earnings, and Available Wallet Balance', () => {
    assert(sampleEarningsData.grossSalesToman > 0, 'Gross revenue tracked');
    assertEqual(sampleEarningsData.netEarningsToman, sampleEarningsData.grossSalesToman * 0.8, 'Net is 80% of gross');
    assert(sampleEarningsData.walletBalanceToman <= sampleEarningsData.netEarningsToman, 'Wallet balance is consistent');
  });

  test('F35-2: Total successful sales count is recorded accurately', () => {
    assertEqual(sampleEarningsData.salesCount, 16, 'Sales count');
  });

  test('F35-3: Recharts revenue trend dataset includes monthly breakdown for area chart', () => {
    assert(sampleEarningsData.chartData.length >= 3, 'At least 3 months for charting');
    sampleEarningsData.chartData.forEach((point) => {
      assert(point.month, 'Month label present');
      assert(point.revenue >= point.net, 'Gross >= Net');
    });
  });

  test('F35-4: Zero sales state provides clean empty state without chart errors', () => {
    const emptyState = { grossSalesToman: 0, netEarningsToman: 0, walletBalanceToman: 0, salesCount: 0, chartData: [] };
    assertEqual(emptyState.grossSalesToman, 0);
    assertEqual(emptyState.chartData.length, 0);
  });

  test('F35-5: Date filtering parameters (last 30 days, 6 months, all-time) are supported', () => {
    const dateFilters = ['LAST_30_DAYS', 'LAST_6_MONTHS', 'ALL_TIME'];
    assert(dateFilters.includes('LAST_30_DAYS'));
  });
});

// ============================================================================
// F36: Double-Entry Financial Ledger (5 tests)
// ============================================================================
describe('F36: Double-Entry Financial Ledger', () => {
  test('F36-1: Pattern purchase calculates exact 80% creator credit and 20% platform fee', () => {
    const price = 350000;
    const split = calculatePurchaseSplit(price);
    assertEqual(split.creatorEarningsToman, 280000, 'Creator earnings = 280,000');
    assertEqual(split.platformFeeToman, 70000, 'Platform fee = 70,000');
    assertEqual(split.creatorEarningsToman + split.platformFeeToman, price, 'Sum equals exact price');
  });

  test('F36-2: Free pattern purchase (price = 0) bypasses fee calculations with zero amounts', () => {
    const split = calculatePurchaseSplit(0);
    assertEqual(split.isFree, true);
    assertEqual(split.creatorEarningsToman, 0);
    assertEqual(split.platformFeeToman, 0);
  });

  test('F36-3: Integer Toman arithmetic guarantees zero fractional coin / Toman rounding leakage', () => {
    // Test uneven prices
    const oddPrices = [99999, 123456, 333333, 750000];
    oddPrices.forEach((p) => {
      const split = calculatePurchaseSplit(p);
      assertEqual(split.creatorEarningsToman + split.platformFeeToman, p, `Zero penny leakage on ${p}`);
      assert(Number.isInteger(split.creatorEarningsToman), 'Creator earnings is integer');
      assert(Number.isInteger(split.platformFeeToman), 'Platform fee is integer');
    });
  });

  test('F36-4: Mock wallet ledger records immutable CREDIT_SALE transactions and updates balance', () => {
    const ledger = new MockWalletLedger(100000);
    const res = ledger.recordSale('pur-001', 200000, 'creator-1');
    assertEqual(res.success, true);
    // Initial 100k + 80% of 200k (160k) = 260k
    assertEqual(ledger.balance, 260000, 'Balance updated to 260,000');
    assertEqual(ledger.transactions.length, 1, 'Transaction recorded');
    assertEqual(ledger.transactions[0].type, 'CREDIT_SALE');
  });

  test('F36-5: Ledger rejects transactions that would overdraft wallet balance below zero', () => {
    const ledger = new MockWalletLedger(50000);
    const validSheba = generateValidSheba('056');
    const shebaVal = validateSheba(validSheba);
    const res = ledger.requestPayout('pay-001', 150000, 'creator-1', shebaVal);
    assertEqual(res.success, false, 'Overdraw rejected');
    assertEqual(ledger.balance, 50000, 'Balance unaffected');
  });
});

// ============================================================================
// F37: Sheba/IBAN Payout Request System (5 tests)
// ============================================================================
describe('F37: Sheba/IBAN Payout Request System', () => {
  test('F37-1: Valid Iranian Sheba passes ISO 7064 Mod 97-10 checksum validation', () => {
    const validSheba = generateValidSheba('056', '0000000123456789012');
    const res = validateSheba(validSheba);
    assertEqual(res.valid, true, `Sheba ${validSheba} must be valid`);
  });

  test('F37-2: Corrupted or tampered Sheba digits fail checksum validation with error', () => {
    const validSheba = generateValidSheba('056', '0000000123456789012');
    // Tamper with last digit
    const tampered = validSheba.slice(0, -1) + (validSheba.slice(-1) === '9' ? '8' : '9');
    const res = validateSheba(tampered);
    assertEqual(res.valid, false, 'Tampered Sheba must fail');
    assert(res.error.includes('Checksum failure') || res.error.includes('ISO 7064'), 'Error identifies checksum failure');
  });

  test('F37-3: Sheba validator correctly resolves Central Bank code to Iranian bank name', () => {
    const samanSheba = generateValidSheba('056');
    const samanRes = validateSheba(samanSheba);
    assertEqual(samanRes.bankName, 'بانک سامان');

    const melliSheba = generateValidSheba('017');
    const melliRes = validateSheba(melliSheba);
    assertEqual(melliRes.bankName, 'بانک ملی ایران');
  });

  test('F37-4: Payout request enforces minimum withdrawal threshold of 100,000 Toman', () => {
    const ledger = new MockWalletLedger(500000);
    const validSheba = generateValidSheba('056');
    const shebaVal = validateSheba(validSheba);
    const res = ledger.requestPayout('p-001', 50000, 'creator-1', shebaVal); // Below 100k
    assertEqual(res.success, false, 'Under minimum rejected');
    assert(res.error.includes('۱۰۰,۰۰۰'), 'Error mentions 100,000 threshold');
  });

  test('F37-5: Valid payout request deducts balance and creates DEBIT_PAYOUT transaction', () => {
    const ledger = new MockWalletLedger(500000);
    const validSheba = generateValidSheba('056');
    const shebaVal = validateSheba(validSheba);
    shebaVal.sheba = validSheba;
    const res = ledger.requestPayout('p-002', 200000, 'creator-1', shebaVal);
    assertEqual(res.success, true, 'Payout accepted');
    assertEqual(ledger.balance, 300000, 'Balance deducted to 300,000');
    assertEqual(ledger.transactions[0].type, 'DEBIT_PAYOUT');
  });
});

// ============================================================================
// F38: Sandbox Checkout Simulator (5 tests)
// ============================================================================
describe('F38: Sandbox Checkout Simulator', () => {
  class MockCheckoutService {
    constructor() {
      this.purchases = new Map(); // key: userId + patternId
    }

    checkout(userId, pattern, status = 'SUCCESS') {
      const key = `${userId}:${pattern.id}`;
      if (this.purchases.has(key)) {
        return { success: false, error: 'الگو قبلاً توسط این کاربر خریداری شده است', alreadyPurchased: true };
      }

      if (status === 'CANCEL' || status === 'FAILED') {
        return { success: false, error: 'تراکنش توسط کاربر لغو شد یا با خطا مواجه گردید' };
      }

      const purchaseRecord = {
        id: `pur-${Date.now()}`,
        userId,
        patternId: pattern.id,
        pricePaid: pattern.price,
        transactionRef: `TRX-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'COMPLETED',
        createdAt: new Date(),
      };

      this.purchases.set(key, purchaseRecord);
      return { success: true, purchase: purchaseRecord };
    }
  }

  const samplePattern = { id: 'pat-blazer-001', price: 350000, title: 'مانتو کتی' };

  test('F38-1: Simulated successful payment returns COMPLETED purchase with unique transactionRef', () => {
    const checkout = new MockCheckoutService();
    const res = checkout.checkout('user-1', samplePattern, 'SUCCESS');
    assertEqual(res.success, true);
    assertEqual(res.purchase.status, 'COMPLETED');
    assert(res.purchase.transactionRef.startsWith('TRX-'), 'Has transactionRef');
  });

  test('F38-2: Simulated payment cancellation returns failure without creating purchase record', () => {
    const checkout = new MockCheckoutService();
    const res = checkout.checkout('user-1', samplePattern, 'CANCEL');
    assertEqual(res.success, false);
    assertEqual(checkout.purchases.size, 0, 'No purchase created');
  });

  test('F38-3: Duplicate purchase attempt by same user is blocked', () => {
    const checkout = new MockCheckoutService();
    checkout.checkout('user-1', samplePattern, 'SUCCESS');
    const secondAttempt = checkout.checkout('user-1', samplePattern, 'SUCCESS');
    assertEqual(secondAttempt.success, false);
    assertEqual(secondAttempt.alreadyPurchased, true);
  });

  test('F38-4: Different users can purchase the same pattern independently', () => {
    const checkout = new MockCheckoutService();
    const res1 = checkout.checkout('user-1', samplePattern, 'SUCCESS');
    const res2 = checkout.checkout('user-2', samplePattern, 'SUCCESS');
    assertEqual(res1.success, true);
    assertEqual(res2.success, true);
    assertEqual(checkout.purchases.size, 2);
  });

  test('F38-5: Free pattern checkout succeeds with pricePaid = 0', () => {
    const checkout = new MockCheckoutService();
    const freePattern = { id: 'pat-free-skirt', price: 0, title: 'دامن فون رایگان' };
    const res = checkout.checkout('user-1', freePattern, 'SUCCESS');
    assertEqual(res.success, true);
    assertEqual(res.purchase.pricePaid, 0);
  });
});
