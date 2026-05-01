import { INITIAL_FAKE_STATS, GROWTH_RATES } from '@/src/lib/constants';

// Start date: April 1st, 2024 (for calculation purposes)
const START_TIMESTAMP = 1711929600000; 

export interface LiveStats {
  tvl: number;
  totalDeposits: number;
  claimed: number;
  rewardPool: number;
}

export const calculateLiveStats = (): LiveStats => {
  const now = Date.now();
  const secondsPassed = Math.floor((now - START_TIMESTAMP) / 1000);
  const daysPassed = secondsPassed / 86400;

  // Simulate continuous growth rather than indexed by whole days
  // Values = Initial * (1 + Rate)^Days
  // But for the sake of the prompt's simplicity in the contract:
  // totalStaked = totalStaked * (100 + 10 * daysPassed) / 100;
  
  return {
    tvl: INITIAL_FAKE_STATS.tvl * (1 + GROWTH_RATES.tvl * daysPassed),
    totalDeposits: INITIAL_FAKE_STATS.totalDeposits * (1 + GROWTH_RATES.totalDeposits * daysPassed),
    claimed: INITIAL_FAKE_STATS.claimed * (1 + GROWTH_RATES.claimed * daysPassed),
    rewardPool: INITIAL_FAKE_STATS.rewardPool * (1 + GROWTH_RATES.rewardPool * daysPassed),
  };
};

export const formatCurrency = (value: number) => {
  if (value >= 1_000_000_000) {
    return '$' + (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (value >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(1) + 'M';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};
