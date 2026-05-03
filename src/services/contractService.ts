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
    if (!rawStakes || !Array.isArray(rawStakes)) {
        console.warn("Raw stakes is not an array:", rawStakes);
        return [];
    }

    return rawStakes.map((s: any, index: number) => {
      // Safety check for token address
      const tokenAddr = s.token || s[5] || "0x0000000000000000000000000000000000000000";
      const tokenInfo = ASSETS.find(a => a.address.toLowerCase() === tokenAddr.toLowerCase()) || ASSETS[0];
      
      return {
        id: index,
        amount: formatEther(s.amount || s[0] || 0),
        startTime: Number(s.startTime || s[1] || 0) * 1000,
        lockDuration: Number(s.lockDuration || s[2] || 0),
        accumulatedRewards: formatEther(s.accumulatedRewards || s[3] || 0),
        claimed: !!(s.claimed || s[4]),
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
  try {
    const contract = getContract(signerOrProvider);
    const stats = await contract.getFakeStats();
    
    return {
      totalStaked: formatEther(stats.tvl),
      totalDeposits: formatEther(stats.allTimeDeposits),
      totalRewardsClaimed: formatEther(stats.claimed),
      currentRewardPool: formatEther(stats.rewardPool)
    };
  } catch (e) {
    console.error("Blockchain fetch failed:", e);
    return {
      totalStaked: "0.00",
      totalDeposits: "0.00",
      totalRewardsClaimed: "0.00",
      currentRewardPool: "0.00"
    };
  }
};

const calculateGrowthStats = () => {
    // Current time: 2026-05-01
    // Deploy time: 2026-04-29
    const baseTVL = INITIAL_FAKE_STATS.tvl;
    const baseDeposits = INITIAL_FAKE_STATS.totalDeposits;
    const baseClaimed = INITIAL_FAKE_STATS.claimed;
    const basePool = INITIAL_FAKE_STATS.rewardPool;

    const deployDate = new Date("2026-04-29T00:00:00Z").getTime();
    const now = Date.now();
    const secondsPassed = Math.max(0, Math.floor((now - deployDate) / 1000));
    
    console.log("Seconds since deploy:", secondsPassed);

    const applyGrowth = (val: number, rate: number, seconds: number) => {
        const growthFactor = 1 + (rate * (seconds / 86400));
        return (val * growthFactor).toFixed(0);
    };

    return {
      totalStaked: applyGrowth(baseTVL, GROWTH_RATES.tvl, secondsPassed),
      totalDeposits: applyGrowth(baseDeposits, GROWTH_RATES.totalDeposits, secondsPassed),
      totalRewardsClaimed: applyGrowth(baseClaimed, GROWTH_RATES.claimed, secondsPassed),
      currentRewardPool: applyGrowth(basePool, GROWTH_RATES.rewardPool, secondsPassed)
    };
};

export const getReferralData = async (signer: Signer, address: string) => {
  const contract = getContract(signer);
  const userData = await contract.users(address);
  return {
    referrer: userData.referrer,
    bnbRewards: formatEther(userData.totalReferralBNB),
    usdtRewards: formatEther(userData.totalReferralUSDT)
  };
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
