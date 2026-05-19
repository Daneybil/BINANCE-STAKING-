import { useState, useEffect } from 'react';

// Simple price fetcher for BNB
export const getBNBPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
    const data = await response.json();
    return parseFloat(data.price) || 600; // Fallback to 600 if API fails
  } catch (e) {
    console.error("Failed to fetch BNB price:", e);
    return 600; // Fallback
  }
};

export const useBNBPrice = () => {
  const [price, setPrice] = useState<number>(600);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchPrice = async () => {
      const p = await getBNBPrice();
      if (mounted) {
        setPrice(p);
        setLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { price, loading };
};
