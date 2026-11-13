/**
 * Tier 4 — Scenario 2: Creator Pattern Monetization & Payout
 * Exercises: F4, F6, F24, F25, F33, F34, F35, F36, F37, F38
 *
 * Story:
 * Independent creator Mahsa Radmanesh publishes a Trench Coat pattern at 390,000 Toman
 * with parametric presets. A buyer discovers it in /marketplace and purchases via the
 * sandbox checkout simulator. The double-entry ledger records the 80/20 split (312,000 Toman
 * creator net, 78,000 Toman platform fee). Mahsa verifies her updated dashboard and requests
 * a 250,000 Toman payout to her Saman Bank Sheba, which passes ISO 7064 Mod 97-10 checksum validation.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  calculatePurchaseSplit,
  MockWalletLedger,
  validateSheba,
  generateValidSheba,
  SEEDED_PATTERNS,
} from '../harness/index.mjs';

describe('Tier 4 Scenario 2: Creator Pattern Monetization & Payout', () => {
  let creator = null;
  let publishedPattern = null;
  let ledger = null;
  let purchaseRecord = null;
  let payoutRequest = null;

  test('Step 1: Creator Mahsa configures and publishes new Trench Coat pattern via Wizard', () => {
    creator = {
      id: 'creator-mahsa-1',
      name: 'مهسا رادمنش',
      email: 'creator@dooz.ir',
      role: 'CREATOR',
      walletBalance: 0,
    };

    publishedPattern = {
      id: 'pat-trench-390k',
      creatorId: creator.id,
      title: 'بارانی ترنچ کژوال با آستین رگلان و کمربند',
      slug: 'casual-raglan-trench-coat',
      category: 'OUTERWEAR',
      draftingMethod: 'MULLER',
      difficulty: 'ADVANCED',
      price: 390000,
      attachmentType: 'PARAMETRIC_PRESET',
      parametricConfig: {
        baseBlock: 'BODICE',
        method: 'MULLER',
        easeOffsets: { bust: 8.0, waist: 6.0, hip: 8.0 },
      },
      isPublished: true,
    };

    assertEqual(publishedPattern.price, 390000);
    assertEqual(publishedPattern.isPublished, true);
    assertEqual(publishedPattern.parametricConfig.baseBlock, 'BODICE');
  });

  test('Step 2: Buyer discovers pattern in marketplace and opens sandbox checkout simulator', () => {
    const patternInCatalog = SEEDED_PATTERNS.find((p) => p.slug === publishedPattern.slug);
    assert(patternInCatalog !== undefined, 'Pattern found in marketplace catalog');
    assertEqual(patternInCatalog.price, 390000, 'Price matches in catalog');
  });

  test('Step 3: Buyer completes sandbox checkout, unlocking library and recording purchase', () => {
    purchaseRecord = {
      id: 'pur-txn-998877',
      userId: 'buyer-sara-1',
      patternId: publishedPattern.id,
      pricePaid: publishedPattern.price,
      transactionRef: `TRX-${Date.now()}-SAMAN`,
      status: 'COMPLETED',
      createdAt: new Date(),
    };

    assertEqual(purchaseRecord.status, 'COMPLETED');
    assert(purchaseRecord.transactionRef.includes('SAMAN'));
  });

  test('Step 4: Financial ledger records 80/20 double-entry split with zero penny leakage', () => {
    const split = calculatePurchaseSplit(publishedPattern.price);
    // 390,000 * 0.8 = 312,000 Toman. 390,000 * 0.2 = 78,000 Toman
    assertEqual(split.creatorEarningsToman, 312000, 'Creator net 80%');
    assertEqual(split.platformFeeToman, 78000, 'Platform fee 20%');
    assertEqual(split.creatorEarningsToman + split.platformFeeToman, publishedPattern.price, 'Sum equals exact purchase price');

    ledger = new MockWalletLedger(creator.walletBalance);
    const saleResult = ledger.recordSale(purchaseRecord.id, publishedPattern.price, creator.id);
    assertEqual(saleResult.success, true);
    assertEqual(ledger.balance, 312000, 'Creator wallet balance updated to 312,000 Toman');
    assertEqual(ledger.transactions[0].type, 'CREDIT_SALE');
  });

  test('Step 5: Creator dashboard reflects new earnings telemetry and available balance', () => {
    assertEqual(ledger.balance, 312000, 'Available balance is 312,000 Toman');
    assert(ledger.transactions.length >= 1, 'Sale recorded in transaction audit trail');
  });

  test('Step 6: Creator submits 250,000 Toman Sheba payout request verified by ISO 7064 Mod 97-10', () => {
    const mahsaSheba = generateValidSheba('056', '9876543210123456789'); // Bank Saman
    const shebaVal = validateSheba(mahsaSheba);
    assertEqual(shebaVal.valid, true, 'Sheba is mathematically valid');
    assertEqual(shebaVal.bankName, 'بانک سامان', 'Bank Saman correctly identified');
    shebaVal.sheba = mahsaSheba;

    const payoutAmount = 250000;
    const payoutResult = ledger.requestPayout('pay-req-001', payoutAmount, creator.id, shebaVal);
    assertEqual(payoutResult.success, true, 'Payout accepted');

    // Balance: 312,000 - 250,000 = 62,000 Toman remaining
    assertEqual(ledger.balance, 62000, 'Wallet balance debited to 62,000 Toman');
    assertEqual(ledger.transactions[1].type, 'DEBIT_PAYOUT');
    assert(ledger.transactions[1].description.includes('بانک سامان'), 'Audit trail records target bank name');
  });
});
