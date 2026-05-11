/**
 * CurrencyContext.jsx
 * Global currency selector — persists to localStorage.
 * Provides useCurrency() hook with formatPrice(usdAmount) helper.
 */
import { createContext, useContext, useState, useCallback } from 'react';

const CURRENCIES = {
  USD: { code: 'USD', symbol: '$',  label: 'USD',  rate: 1,    locale: 'en-US', decimals: 2 },
  THB: { code: 'THB', symbol: '฿',  label: 'THB',  rate: 36.5, locale: 'th-TH', decimals: 0 },
  MMK: { code: 'MMK', symbol: 'K',  label: 'MMK',  rate: 2100, locale: 'en',    decimals: 0 },
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    const saved = localStorage.getItem('sh_currency');
    return CURRENCIES[saved] ? saved : 'USD';
  });

  const setCurrency = useCallback((code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('sh_currency', code);
    }
  }, []);

  const formatPrice = useCallback((usdAmount) => {
    const amt = parseFloat(usdAmount) || 0;
    const cur = CURRENCIES[currency];
    const converted = amt * cur.rate;
    return `${cur.symbol}${converted.toLocaleString(cur.locale, {
      minimumFractionDigits: cur.decimals,
      maximumFractionDigits: cur.decimals,
    })}`;
  }, [currency]);

  const currentCurrency = CURRENCIES[currency];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, CURRENCIES, currentCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
