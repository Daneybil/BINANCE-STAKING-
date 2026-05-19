/**
 * Utility functions for numeric formatting and USD display
 */

export const formatUSD = (value: string | number) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6, // Support high precision for small amounts
  }).format(numericValue);
};

export const formatNumber = (value: string | number, decimals: number = 2) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
};

export const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getYieldFontSize = (value: string | number) => {
  const length = value.toString().length;
  if (length > 15) return 'text-2xl md:text-3xl';
  if (length > 10) return 'text-3xl md:text-4xl';
  return 'text-4xl md:text-5xl';
};
