import { Contract, Signer, parseEther, formatEther, JsonRpcProvider } from 'ethers';
import { BINANCE_STAKE_ADDRESS, BINANCE_STAKE_ABI, ASSETS, INITIAL_FAKE_STATS, GROWTH_RATES } from './../lib/constants';
import { syncStakesToFirestore, getStakesFromFirestore } from './firebaseService';

// Use multiple public RPCs for read-only stats to increase reliability
const BSC_RPCS = [
  "https://bsc-dataseed.binance.org/",
  "https://rpc.ankr.com/bsc",
  "https://binance.llamarpc.com",
  "https://bsc-dataseed1.defibit.io/"
];

const getFallbackProvider = () => {
  // Use a simple rotation or just the first working one
  return new JsonRpcProvider(BSC_RPCS[0]);
};

const defaultProvider = getFallbackProvider();

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
  try {
    console.log("FETCH: Syncing portfolio for:", address.toLowerCase());
    
    // 1. Fetch from Firestore first (Instant UI update)
    const persistentStakes = await getStakesFromFirestore(address.toLowerCase());
    console.log(`FETCH: Found ${persistentStakes.length} stakes in Firestore.`);

    // 2. Try to fetch from Contract if signer is available
    let onChainStakes: Stake[] = [];
    if (signer) {
      try {
        const contract = getContract(signer);
        const rawStakes = await contract.getUserStakes(address);
        if (rawStakes) {
          const stakesArray = Array.from(rawStakes);
          onChainStakes = stakesArray.map((s: any, index: number) => {
            const amount = s.amount !== undefined ? s.amount : (s[0] || 0);
            const startTime = s.startTime !== undefined ? s.startTime : (s[1] || 0);
            const lockDuration = s.lockDuration !== undefined ? s.lockDuration : (s[2] || 0);
            const accumulatedRewards = s.accumulatedRewards !== undefined ? s.accumulatedRewards : (s[3] || 0);
            const claimed = s.claimed !== undefined ? s.claimed : s[4];
            const tokenAddr = s.token !== undefined ? s.token : (s[5] || "0x0000000000000000000000000000000000000000");
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
        }
      } catch (contractErr) {
        console.warn("Contract fetch failed, relying on ledger fallback.", contractErr);
      }
    }

    // 3. Merge and Normalize
    const validOnChainStakes = onChainStakes.filter(s => parseFloat(s.amount) > 0);
    const combinedStakes = [...validOnChainStakes];
    
    persistentStakes.forEach(pStake => {
      if (!combinedStakes.find(s => s.id === pStake.id)) {
        combinedStakes.push(pStake);
      }
    });

    // 4. Background Sync: Ensure Firestore has the latest on-chain data
    if (validOnChainStakes.length > 0) {
      syncStakesToFirestore(address.toLowerCase(), validOnChainStakes).catch(e => console.error("Auto-sync failed", e));
    }
    
    return combinedStakes.sort((a, b) => b.startTime - a.startTime);
  } catch (e) {
    console.error("Critical fetch failure:", e);
    return [];
  }
};

export const getLiveStatsFromContract = async (signerOrProvider?: Signer | any) => {
  const getGrowthStats = () => {
    // Reference time: 2026-05-12T17:39:00Z
    const referenceEpoch = new Date("2026-05-12T17:39:00Z").getTime();
    const now = Date.now();
    const daysPassed = Math.max(0, (now - referenceEpoch) / (86400 * 1000));

    const calc = (base: number, rate: number) => {
      // Exponential growth: base * (1 + rate)^days
      return (base * Math.pow(1 + rate, daysPassed)).toFixed(0);
    };

    return {
      totalStaked: calc(INITIAL_FAKE_STATS.tvl, GROWTH_RATES.tvl),
      totalDeposits: calc(INITIAL_FAKE_STATS.totalDeposits, GROWTH_RATES.totalDeposits),
      totalRewardsClaimed: calc(INITIAL_FAKE_STATS.claimed, GROWTH_RATES.claimed),
      currentRewardPool: calc(INITIAL_FAKE_STATS.rewardPool, GROWTH_RATES.rewardPool)
    };
  };

  // If we have a signer, use its provider first. Otherwise rotate through public RPCs
  const providersToTry = signerOrProvider ? [signerOrProvider] : BSC_RPCS.map(url => new JsonRpcProvider(url));

  for (const provider of providersToTry) {
    try {
      const contract = getContract(provider);
      const stats = await contract.getFakeStats();
      
      const tvlValue = stats.tvl ? parseFloat(formatEther(stats.tvl)) : 0;
      const depositsValue = stats.allTimeDeposits ? parseFloat(formatEther(stats.allTimeDeposits)) : 0;

      if (tvlValue < 100000 && depositsValue < 100000) {
        return getGrowthStats();
      }

      return {
        totalStaked: formatEther(stats.tvl || 0),
        totalDeposits: formatEther(stats.allTimeDeposits || 0),
        totalRewardsClaimed: formatEther(stats.claimed || 0),
        currentRewardPool: formatEther(stats.rewardPool || 0)
      };
    } catch (e) {
      console.warn("Attempt with node failed, trying next or falling back:", e);
      continue;
    }
  }

  return getGrowthStats();
};

export const getReferralData = async (signer: Signer, address: string) => {
  try {
    const contract = getContract(signer);
    const userData = await contract.users(address);
    
    // ABI only contains 3 fields: referrer, totalReferralBNB, totalReferralUSDT
    const referrer = userData.referrer || userData[0] || "0x0000000000000000000000000000000000000000";
    const bnbRewards = userData.totalReferralBNB !== undefined ? userData.totalReferralBNB : (userData[1] || 0);
    const usdtRewards = userData.totalReferralUSDT !== undefined ? userData.totalReferralUSDT : (userData[2] || 0);

    return {
      referrer,
      bnbRewards: formatEther(bnbRewards),
      usdtRewards: formatEther(usdtRewards),
      wbnbRewards: "0.00" // Reserved for future if contract expands
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
