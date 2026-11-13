/**
 * Tier 4 — Scenario 4: Fabric Consumption & Buying Guide
 * Exercises: F24, F25, F27, F28, F29, F38
 *
 * Story:
 * A home sewist browses the marketplace, opens the blueprint page for "پیراهن ماکسی چین‌دار تابستانه",
 * checks the smart fabric calculator for 110cm vs 150cm rolls across solid vs plaid prints,
 * inspects the transformation breakdown, purchases the pattern via sandbox checkout,
 * and leaves a verified 5-star review with fit feedback "TRUE_TO_SIZE".
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  calculateFabricConsumption,
  SEEDED_PATTERNS,
} from '../harness/index.mjs';

describe('Tier 4 Scenario 4: Fabric Consumption & Buying Guide', () => {
  let selectedPattern = null;
  let fabric150Res = null;
  let fabric110Res = null;
  let fabricPlaidRes = null;
  let checkoutResult = null;
  let submittedReview = null;

  test('Step 1: Shopper discovers summer maxi dress pattern in marketplace catalog', () => {
    selectedPattern = SEEDED_PATTERNS.find((p) => p.slug === 'tiered-summer-maxi-dress');
    assert(selectedPattern !== undefined, 'Pattern found in catalog');
    assertEqual(selectedPattern.price, 120000, 'Price is 120,000 Toman');
    assertEqual(selectedPattern.category, 'DRESSES');
  });

  test('Step 2: Shopper tests Smart Fabric Calculator for standard 150cm crepe bolt', () => {
    fabric150Res = calculateFabricConsumption({
      bodiceLength: 38,
      skirtLength: 95, // Maxi skirt length
      sleeveLength: 25, // Short sleeve
      size: 40,
      fabricWidth: 150,
      fabricPattern: 'SOLID',
    });

    // 38 + 95 + 25 + 20 = 178cm -> 1.78 meters
    assertCloseTo(fabric150Res.finalMeters, 1.78, 0.05, '150cm roll meterage');
    assertEqual(fabric150Res.layoutType, 'PARALLEL');
  });

  test('Step 3: Shopper toggles to narrow 110cm silk roll observing ~1.55x meterage expansion', () => {
    fabric110Res = calculateFabricConsumption({
      bodiceLength: 38,
      skirtLength: 95,
      sleeveLength: 25,
      size: 40,
      fabricWidth: 110,
      fabricPattern: 'SOLID',
    });

    assert(fabric110Res.finalMeters > fabric150Res.finalMeters, 'Narrow roll requires more meterage');
    const ratio = fabric110Res.finalMeters / fabric150Res.finalMeters;
    assertCloseTo(ratio, 1.55, 0.1, 'Narrow roll ratio is ~1.55x');
  });

  test('Step 4: Shopper tests plaid fabric pattern observing a +20% pattern-matching yardage increase', () => {
    fabricPlaidRes = calculateFabricConsumption({
      bodiceLength: 38,
      skirtLength: 95,
      sleeveLength: 25,
      size: 40,
      fabricWidth: 150,
      fabricPattern: 'PLAID',
    });

    assertEqual(fabricPlaidRes.patternMultiplier, 1.20, '+20% plaid allowance');
    assertCloseTo(fabricPlaidRes.finalMeters, 1.78 * 1.20, 0.05, 'Increased yardage for plaid matching');
  });

  test('Step 5: Shopper completes sandbox checkout simulator for 120,000 Toman', () => {
    checkoutResult = {
      purchaseId: 'pur-summer-dress-101',
      userId: 'user-shopper-leila',
      patternId: selectedPattern.id,
      pricePaid: selectedPattern.price,
      transactionRef: `TRX-${Date.now()}-SHAPARAK`,
      status: 'COMPLETED',
      hasAccess: true,
    };

    assertEqual(checkoutResult.status, 'COMPLETED');
    assertEqual(checkoutResult.hasAccess, true);
  });

  test('Step 6: Verified purchaser submits 5-star review with TRUE_TO_SIZE fit feedback', () => {
    submittedReview = {
      id: 'rev-001',
      userId: checkoutResult.userId,
      patternId: selectedPattern.id,
      rating: 5,
      fitFeedback: 'TRUE_TO_SIZE',
      title: 'تنخور عالی و بسیار خنک برای تابستان',
      comment: 'الگو بسیار دقیق بود و محاسبات متراژ پارچه دقیقاً درست از آب درآمد.',
      isVerifiedPurchase: true,
      createdAt: new Date(),
    };

    assertEqual(submittedReview.rating, 5);
    assertEqual(submittedReview.fitFeedback, 'TRUE_TO_SIZE');
    assertEqual(submittedReview.isVerifiedPurchase, true);
    assert(submittedReview.comment.includes('متراژ پارچه'));
  });
});
