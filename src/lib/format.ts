const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Latin digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] || digit);
}

/**
 * Converts Persian and Arabic digits to standard Latin digits (0-9).
 * Crucial for parsing form inputs, Sheba codes, and measurement numbers.
 */
export function toLatinDigits(input: string): string {
  if (!input) return "";
  let result = String(input);
  for (let i = 0; i < 10; i++) {
    result = result.split(PERSIAN_DIGITS[i]).join(String(i));
    result = result.split(ARABIC_DIGITS[i]).join(String(i));
  }
  return result;
}

/**
 * Formats an integer amount in Iranian Toman with thousands separator.
 * Example: 150000 -> "۱۵۰٬۰۰۰ تومان"
 */
export function formatToman(
  amount: number,
  options: { showUnit?: boolean; persianDigits?: boolean } = {}
): string {
  const { showUnit = true, persianDigits = true } = options;
  const num = Math.round(Number(amount) || 0);

  if (!persianDigits) {
    const formatted = new Intl.NumberFormat("en-US").format(num);
    return showUnit ? `${formatted} تومان` : formatted;
  }

  const formatted = new Intl.NumberFormat("fa-IR").format(num);
  return showUnit ? `${formatted} تومان` : formatted;
}

/**
 * Formats arbitrary numbers (e.g. measurements in cm, ease values, coordinates).
 */
export function formatNumber(
  value: number,
  options: { decimals?: number; persianDigits?: boolean } = {}
): string {
  const { decimals = 1, persianDigits = true } = options;
  const num = Number(value) || 0;

  if (!persianDigits) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  return new Intl.NumberFormat("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formats a Date object or ISO string into Jalali (Persian) calendar representation.
 * Example: "۲۲ آبان ۱۴۰۵"
 */
export function formatJalaliDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return "";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-persian", {
    ...defaultOptions,
    ...options,
  }).format(d);
}
