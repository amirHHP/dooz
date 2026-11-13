/**
 * Dooz Test Harness - Double-Entry Financial Ledger Math
 * 80% Creator / 20% Platform Commission Accounting Model.
 */

export function calculatePurchaseSplit(priceToman) {
  const price = Math.max(0, Math.round(Number(priceToman) || 0));
  if (price === 0) {
    return {
      priceToman: 0,
      creatorEarningsToman: 0,
      platformFeeToman: 0,
      isFree: true,
    };
  }

  // 80% creator net, 20% platform fee
  const creatorEarningsToman = Math.floor(price * 0.8);
  const platformFeeToman = price - creatorEarningsToman; // Guaranteed zero penny/Toman leakage

  return {
    priceToman: price,
    creatorEarningsToman,
    platformFeeToman,
    isFree: false,
  };
}

export class MockWalletLedger {
  constructor(initialBalanceToman = 0) {
    this.balance = initialBalanceToman;
    this.transactions = [];
  }

  recordSale(purchaseId, priceToman, creatorId) {
    const split = calculatePurchaseSplit(priceToman);
    if (split.isFree) {
      return { success: true, balanceAfter: this.balance, split };
    }

    this.balance += split.creatorEarningsToman;
    const tx = {
      id: `tx-sale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: creatorId,
      amount: split.creatorEarningsToman,
      type: 'CREDIT_SALE',
      balanceAfter: this.balance,
      referenceId: purchaseId,
      description: `فروش الگو (۸۰٪ سهم سازنده)`,
      timestamp: new Date(),
    };
    this.transactions.push(tx);
    return { success: true, balanceAfter: this.balance, split, transaction: tx };
  }

  requestPayout(payoutId, amountToman, creatorId, shebaValidation) {
    const amount = Math.round(Number(amountToman) || 0);
    if (amount < 100000) {
      return { success: false, error: 'حداقل مبلغ تسویه ۱۰۰,۰۰۰ تومان می‌باشد' };
    }
    if (amount > this.balance) {
      return { success: false, error: 'مبلغ درخواستی بیشتر از موجودی قابل تسویه است' };
    }
    if (!shebaValidation || !shebaValidation.valid) {
      return { success: false, error: 'شماره شبا نامعتبر است' };
    }

    this.balance -= amount;
    const tx = {
      id: `tx-payout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: creatorId,
      amount: -amount,
      type: 'DEBIT_PAYOUT',
      balanceAfter: this.balance,
      referenceId: payoutId,
      description: `درخواست تسویه به شماره شبا ${shebaValidation.sheba || ''} (${shebaValidation.bankName || ''})`,
      timestamp: new Date(),
    };
    this.transactions.push(tx);
    return { success: true, balanceAfter: this.balance, transaction: tx };
  }
}
