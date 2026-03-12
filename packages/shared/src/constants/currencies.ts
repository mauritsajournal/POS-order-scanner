export const CURRENCIES = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
} as const;

export const DEFAULT_CURRENCY = 'EUR';

export type CurrencyCode = keyof typeof CURRENCIES;
