/**
 * Dooz (دوز) — Double-Entry Financial Ledger & Sheba Validator
 * 80% Creator / 20% Platform Commission Accounting Model.
 * Iranian Sheba (IBAN) ISO 7064 Mod 97-10 Validator & Bank Catalog.
 */

import { toLatinDigits } from "./format";

export const IRANIAN_BANKS: Record<string, string> = {
  "010": "بانک مرکزی",
  "011": "بانک صنعت و معدن",
  "012": "بانک ملت",
  "013": "بانک رفاه کارگران",
  "014": "بانک مسکن",
  "015": "بانک سپه",
  "016": "بانک کشاورزی",
  "017": "بانک ملی ایران",
  "018": "بانک تجارت",
  "019": "بانک صادرات ایران",
  "020": "بانک توسعه صادرات",
  "021": "پست بانک ایران",
  "022": "بانک توسعه تعاون",
  "051": "موسسه اعتباری غیربانکی توسعه",
  "053": "بانک کارآفرین",
  "054": "بانک پارسیان",
  "055": "بانک اقتصاد نوین",
  "056": "بانک سامان",
  "057": "بانک پاسارگاد",
  "058": "بانک سرمایه",
  "059": "بانک سینا",
  "060": "بانک قرض‌الحسنه مهر ایران",
  "061": "بانک شهر",
  "062": "بانک آینده",
  "063": "بانک انصار",
  "064": "بانک گردشگری",
  "065": "بانک حکمت ایرانیان",
  "066": "بانک دی",
  "069": "بانک ایران زمین",
  "070": "بانک قرض‌الحسنه رسالت",
  "078": "بانک خاورمیانه",
};

export interface ShebaValidationResult {
  valid: boolean;
  bankCode?: string;
  bankName?: string;
  accountNumber?: string;
  sheba?: string;
  error?: string;
}

/**
 * Validates an Iranian Sheba number according to ISO 7064 Mod 97-10.
 * Expected format: IR + 24 digits (total 26 chars).
 */
export function validateSheba(sheba: string): ShebaValidationResult {
  if (typeof sheba !== "string") {
    return { valid: false, error: "Sheba must be a string" };
  }

  // Clean whitespace, convert Persian/Arabic digits, and normalize to uppercase
  const clean = toLatinDigits(sheba).trim().toUpperCase().replace(/\s+/g, "");

  if (clean.length !== 26) {
    return { valid: false, error: `Invalid length: expected 26 characters, got ${clean.length}` };
  }

  if (!clean.startsWith("IR")) {
    return { valid: false, error: "Sheba must begin with IR country code" };
  }

  const digitsPart = clean.slice(2);
  if (!/^\d{24}$/.test(digitsPart)) {
    return { valid: false, error: "Characters after IR must be exactly 24 digits" };
  }

  // Rearrange: move first 4 characters (IR + 2 checksum digits) to the end
  // IR + CD + 22 BBAN digits -> 22 BBAN digits + IR + CD
  const bban = clean.slice(4);
  const cd = clean.slice(2, 4);
  const rearranged = bban + "1827" + cd; // I = 18, R = 27

  // Calculate BigInt modulo 97
  try {
    const bigNum = BigInt(rearranged);
    const remainder = Number(bigNum % 97n);
    if (remainder !== 1) {
      return { valid: false, error: `Checksum failure: ISO 7064 Mod 97-10 remainder is ${remainder}, expected 1` };
    }
  } catch (err: any) {
    return { valid: false, error: `Calculation error: ${err.message}` };
  }

  // Extract bank code (digits 5 to 7 in full string, indices 4..7 in clean)
  const bankCode = clean.slice(4, 7);
  const bankName = IRANIAN_BANKS[bankCode] || "بانک نامشخص";

  return {
    valid: true,
    bankCode,
    bankName,
    accountNumber: clean.slice(7),
    sheba: clean,
  };
}

/**
 * Calculates correct 2-digit checksum for BBAN and produces a valid Sheba.
 * Useful for test fixtures and mock generators.
 */
export function generateValidSheba(
  bankCode = "056",
  accountNumber = "1234567890123456789"
): string {
  const paddedAccount = accountNumber.padStart(19, "0").slice(-19);
  const bban = bankCode + paddedAccount; // 22 digits
  // Form number to check: bban + 1827 + '00'
  const tempStr = bban + "182700";
  const remainder = Number(BigInt(tempStr) % 97n);
  const checkDigits = (98 - remainder) % 97;
  const cdStr = String(checkDigits).padStart(2, "0");
  return `IR${cdStr}${bban}`;
}

export interface PurchaseSplit {
  priceToman: number;
  creatorEarningsToman: number;
  platformFeeToman: number;
  isFree: boolean;
}

/**
 * Calculates 80/20 purchase revenue split with zero penny/Toman leakage.
 */
export function calculatePurchaseSplit(priceToman: number): PurchaseSplit {
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

export interface LedgerTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  timestamp: Date;
}

export class MockWalletLedger {
  balance: number;
  transactions: LedgerTransaction[];

  constructor(initialBalanceToman = 0) {
    this.balance = initialBalanceToman;
    this.transactions = [];
  }

  recordSale(purchaseId: string, priceToman: number, creatorId: string) {
    const split = calculatePurchaseSplit(priceToman);
    if (split.isFree) {
      return { success: true, balanceAfter: this.balance, split };
    }

    this.balance += split.creatorEarningsToman;
    const tx: LedgerTransaction = {
      id: `tx-sale-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: creatorId,
      amount: split.creatorEarningsToman,
      type: "CREDIT_SALE",
      balanceAfter: this.balance,
      referenceId: purchaseId,
      description: "فروش الگو (۸۰٪ سهم سازنده)",
      timestamp: new Date(),
    };
    this.transactions.push(tx);
    return { success: true, balanceAfter: this.balance, split, transaction: tx };
  }

  requestPayout(
    payoutId: string,
    amountToman: number,
    creatorId: string,
    shebaValidation: ShebaValidationResult
  ) {
    const amount = Math.round(Number(amountToman) || 0);
    if (amount < 100000) {
      return { success: false, error: "حداقل مبلغ تسویه ۱۰۰,۰۰۰ تومان می‌باشد" };
    }
    if (amount > this.balance) {
      return { success: false, error: "مبلغ درخواستی بیشتر از موجودی قابل تسویه است" };
    }
    if (!shebaValidation || !shebaValidation.valid) {
      return { success: false, error: "شماره شبا نامعتبر است" };
    }

    this.balance -= amount;
    const tx: LedgerTransaction = {
      id: `tx-payout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: creatorId,
      amount: -amount,
      type: "DEBIT_PAYOUT",
      balanceAfter: this.balance,
      referenceId: payoutId,
      description: `درخواست تسویه به شماره شبا ${shebaValidation.sheba || ""} (${shebaValidation.bankName || ""})`,
      timestamp: new Date(),
    };
    this.transactions.push(tx);
    return { success: true, balanceAfter: this.balance, transaction: tx };
  }
}
