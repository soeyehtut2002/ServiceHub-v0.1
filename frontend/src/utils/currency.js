/**
 * ServiceHub — Currency Utility
 * Static exchange rates (update as needed)
 */

export const RATES = {
  USD_TO_THB: 36.5,
  USD_TO_MMK: 2100,
};

/**
 * Format a USD price into all three currencies.
 * @param {number|string} usd  Price in USD
 * @returns {{ usd: string, thb: string, mmk: string }}
 */
export function formatAllCurrencies(usd) {
  const amount = parseFloat(usd) || 0;
  return {
    usd: `$${amount.toFixed(2)}`,
    thb: `฿${(amount * RATES.USD_TO_THB).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`,
    mmk: `K${(amount * RATES.USD_TO_MMK).toLocaleString('my-MM', { maximumFractionDigits: 0 })}`,
  };
}

/**
 * Format just the THB price.
 */
export function toTHB(usd) {
  return `฿${(parseFloat(usd) * RATES.USD_TO_THB).toLocaleString('th-TH', { maximumFractionDigits: 0 })}`;
}

/**
 * Format just the MMK price.
 */
export function toMMK(usd) {
  return `K${(parseFloat(usd) * RATES.USD_TO_MMK).toLocaleString('en', { maximumFractionDigits: 0 })}`;
}
