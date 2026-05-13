import React from 'react';
import { Wallet, History, Coins, BarChart3, TrendingUp, Inbox, Share2, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stake, withdrawReferral, getReferralData } from '@/src/services/contractService';
import { ASSETS, DAILY_REWARD_RATE } from '@/src/lib/constants';
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DashboardPageProps {
  walletAddress: string | null;
  stakes: Stake[];
  dataLoading: boolean;
  signer: any;
  isActive: boolean;
  onRefresh: () => void;
  onConnect: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  walletAddress, 
  stakes, 
  dataLoading,
  signer, 
  isActive, 
  onRefresh,
  onConnect
}) => {
  const [liveTotalRewards, setLiveTotalRewards] = React.useState(0);
  const [referralData, setReferralData] = React.useState({ bnbRewards: "0", usdtRewards: "0", wbnbRewards: "0", referrer: "" });
  const [loading, setLoading] = React.useState(false);

  const totalStakedValue = stakes.reduce((acc, s) => acc + parseFloat(s.amount), 0);

  const fetchReferral = React.useCallback(async () => {
    if (signer && walletAddress) {
      const data = await getReferralData(signer, walletAddress);
      setReferralData(data as any);
    }
  }, [signer, walletAddress]);

  React.useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  // Expose fetchReferral or trigger it when onRefresh is called
  React.useEffect(() => {
    // When stakes OR isActive changes externally (via onRefresh/App.tsx polling), refresh referral too
    fetchReferral();
  }, [stakes, isActive, fetchReferral]);

  const handleWithdrawReferral = async (assetId: string) => {
    if (!signer || loading) return;
    setLoading(true);
    try {
      const asset = ASSETS.find(a => a.id === assetId);
      if (!asset) return;
      
      const tx = await withdrawReferral(signer, asset.address);
      toast.promise(tx.wait(), {
        loading: `Withdrawal of ${assetId} referral rewards in progress...`,
        success: 'Referral rewards successfully claimed!',
        error: 'Failed to withdraw referral rewards.'
      });
      await tx.wait();
      fetchReferral();
      onRefresh();
    } catch (e: any) {
      toast.error('Withdrawal failed', { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (stakes.length === 0) {
      setLiveTotalRewards(0);
      return;
    }

    const calculateTotal = () => {
      const now = Date.now();
      const dailyRate = DAILY_REWARD_RATE; // 15% Daily Yield
      
      const total = stakes.reduce((acc, stake) => {
        const amount = parseFloat(stake.amount);
        const startTime = stake.startTime; // in ms
        const elapsedSeconds = (now - startTime) / 1000;
        
        // Simple daily yield calculation: amount * 0.15 * (elapsed / 86400)
        const earned = (amount * dailyRate * elapsedSeconds) / 86400;
        
        // Return max of contract reported and our real-time calculation
        return acc + Math.max(parseFloat(stake.accumulatedRewards), earned);
      }, 0);
      
      setLiveTotalRewards(total);
    };

    calculateTotal();
    const interval = setInterval(calculateTotal, 100);
    return () => clearInterval(interval);
  }, [stakes]);

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Binance Network Interface</Badge>
          <h2 className="text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8]">Binance <span className="text-primary italic">Portfolio</span></h2>
          <p className="text-foreground/40 text-sm font-bold tracking-[0.2em] max-w-2xl">Direct Binance Smart Chain explorer and official community reward ledger tracking.</p>
        </div>
        
        {walletAddress && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="border-white/10 bg-secondary/30 rounded-xl h-12 px-6 text-[10px] font-bold tracking-widest hover:bg-secondary">
            <History className="w-4 h-4 mr-2" /> REFRESH PORTFOLIO
          </Button>
        )}
      </div>

      {!walletAddress ? (
        <div className="glass-panel border-dashed border-white/10 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-secondary/50 flex items-center justify-center text-foreground/20 relative">
            <Wallet className="w-12 h-12" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tighter uppercase">Authentication Required</h3>
            <p className="text-foreground/40 max-w-sm mx-auto text-sm leading-relaxed tracking-wider font-bold">Please connect your decentralized wallet to access current staking positions and earnings.</p>
          </div>
          <Button onClick={onConnect} className="binance-button rounded-xl px-12 h-14 text-xs font-black uppercase tracking-widest">Connect Wallet To Access</Button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard 
              label="Total Assets Staked" 
              value={totalStakedValue.toFixed(4)} 
              unit="MIXED"
              icon={<Coins className="w-5 h-5 text-primary" />}
            />
            <SummaryCard 
              label="Real-time Yield" 
              value={liveTotalRewards.toFixed(6)} 
              unit="EST."
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
              success
            />
            <SummaryCard 
              label="Active Positions" 
              value={stakes.length.toString()} 
              unit="STAKES"
              icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
            />
          </div>

          {/* Referral Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" /> Referral Rewards Center
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ReferralCard 
                label="BNB Rewards" 
                balance={referralData.bnbRewards} 
                symbol="BNB"
                onWithdraw={() => handleWithdrawReferral('BNB')}
                loading={loading}
              />
              <ReferralCard 
                label="WBNB Rewards" 
                balance={referralData.wbnbRewards} 
                symbol="WBNB"
                onWithdraw={() => handleWithdrawReferral('WBNB')}
                loading={loading}
              />
              <ReferralCard 
                label="USDT Rewards" 
                balance={referralData.usdtRewards} 
                symbol="USDT"
                onWithdraw={() => handleWithdrawReferral('USDT')}
                loading={loading}
              />
            </div>
            {referralData.referrer !== "0x0000000000000000000000000000000000000000" && (
              <div className="flex items-center gap-2 px-6 text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                <Badge variant="outline" className="border-white/5 text-foreground/30 py-0.5 px-2">Referrer Active</Badge>
                <span>{referralData.referrer}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" /> Active Binance Vault Positions
            </h3>
            
            {dataLoading ? (
              <div className="glass-panel border-white/5 rounded-[3rem] p-32 text-center space-y-8 relative overflow-hidden">
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em]">Synchronizing BSC Ledger Data...</p>
                </div>
              </div>
            ) : stakes.length === 0 ? (
              <div className="glass-panel border-white/5 rounded-[3rem] p-32 text-center space-y-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/2 rounded-full blur-[100px] -z-10" />
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-foreground/20">
                    <Inbox className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold uppercase tracking-widest text-foreground/60">No Active Positions Detected</h4>
                    <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
                      Transactions may take up to 60 seconds to index on the BSC ledger.
                    </p>
                  </div>
                  <Button 
                    onClick={onRefresh} 
                    className="binance-button h-12 px-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Force Sync Ledger
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stakes.map((stake) => (
                  <StakeCard key={stake.id} stake={stake} signer={signer} isActive={isActive} refresh={onRefresh} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function ReferralCard({ label, balance, symbol, onWithdraw, loading }: { label: string, balance: string, symbol: string, onWithdraw: () => void, loading: boolean }) {
  const hasBalance = parseFloat(balance) > 0;
  return (
    <div className="glass-panel rounded-3xl p-8 border-white/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-white/5">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{label}</span>
          </div>
          {hasBalance && (
            <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">Withdrawable</Badge>
          )}
        </div>
        <div>
          <h4 className="text-3xl font-black font-heading text-white">{balance} <span className="text-xs text-foreground/40">{symbol}</span></h4>
        </div>
        <Button 
          disabled={!hasBalance || loading}
          onClick={onWithdraw}
          className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasBalance ? 'binance-button' : 'bg-secondary/50 cursor-not-allowed opacity-30 grayscale'}`}
        >
          {loading ? 'Processing...' : (
            <>
              Withdraw Reward <ArrowUpRight className="w-3 h-3 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, unit, icon, success }: { label: string, value: string, unit: string, icon: React.ReactNode, success?: boolean }) {
  return (
    <div className="glass-panel rounded-3xl p-8 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-white/5">
            {icon}
          </div>
          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <h4 className={`text-4xl font-black font-heading ${success ? 'text-green-500' : 'text-white'}`}>{value}</h4>
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-tighter">{unit}</span>
        </div>
      </div>
    </div>
  );
}

interface StakeCardProps {
  stake: Stake;
  signer: any;
  isActive: boolean;
  refresh: () => void;
  key?: any;
}

function StakeCard({ stake, signer, isActive, refresh }: StakeCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [liveRewards, setLiveRewards] = React.useState(parseFloat(stake.accumulatedRewards));
  const asset = ASSETS.find(a => a.id === stake.tokenSymbol) || ASSETS[0];
  
  React.useEffect(() => {
    const amount = parseFloat(stake.amount);
    const dailyRate = DAILY_REWARD_RATE; // 15% Daily Yield
    
    const ticker = setInterval(() => {
      const now = Date.now();
      const startTime = stake.startTime; // in ms
      const elapsedSeconds = (now - startTime) / 1000;
      
      // Simple daily yield calculation: amount * 0.15 * (elapsed / 86400)
      const earned = (amount * dailyRate * elapsedSeconds) / 86400;
      
      setLiveRewards(Math.max(parseFloat(stake.accumulatedRewards), earned));
    }, 100);

    return () => clearInterval(ticker);
  }, [stake.amount, stake.accumulatedRewards, stake.startTime]);

  const now = Date.now();
  const endTime = stake.startTime + (stake.lockDuration * 1000);
  const timeLeft = Math.max(0, endTime - now);
  const totalDuration = stake.lockDuration * 1000;
  const progress = Math.min(100, ((totalDuration - timeLeft) / totalDuration) * 100);
  
  const isClaimable = timeLeft === 0 && !stake.claimed && isActive;
  const isWithdrawable = stake.claimed && isActive;

  const handleClaim = async () => {
    if (!signer || loading) return;
    setLoading(true);
    try {
      const tx = await import('@/src/services/contractService').then(m => m.claimStakeRewards(signer, stake.id));
      toast.promise(tx.wait(), {
        loading: 'Authorizing claim on blockchain...',
        success: 'Yield successfully distributed!',
        error: 'Contract execution failed.'
      });
      await tx.wait();
      refresh();
    } catch (e: any) {
      toast.error('Transaction failed', { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || loading) return;
    setLoading(true);
    try {
      const tx = await import('@/src/services/contractService').then(m => m.withdrawStakePrincipal(signer, stake.id));
      toast.promise(tx.wait(), {
        loading: 'Processing principal withdrawal...',
        success: 'Capital successfully returned to wallet!',
        error: 'Execution failed.'
      });
      await tx.wait();
      refresh();
    } catch (e: any) {
      toast.error('Transaction failed', { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const daysLeft = Math.ceil(timeLeft / (86400 * 1000));
  const lockDays = Math.round(stake.lockDuration / 86400);
  
  return (
    <div className="glass-panel rounded-3xl p-6 border-white/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-white/10 group-hover:bg-primary/5 transition-colors">
              <img src={asset.icon} alt={asset.title} className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight">{asset.title} Vault (Fixed 15%)</h4>
              <p className="text-[10px] text-foreground/40 uppercase font-black tracking-widest">STAKE ID #{stake.id.toString().padStart(4, '0')}</p>
            </div>
          </div>
          <Badge className={`${stake.claimed ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'} border-none text-[8px] font-black tracking-widest uppercase h-6 px-3`}>
            {stake.claimed ? 'Settled' : timeLeft === 0 ? 'Matured' : 'Mining'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-4 space-y-1">
            <p className="text-[8px] text-foreground/30 uppercase font-black tracking-widest">PRINCIPAL</p>
            <p className="text-lg font-black font-heading leading-none">{stake.amount} <span className="text-[10px] text-primary">{stake.tokenSymbol}</span></p>
          </div>
          <div className="glass-panel rounded-2xl p-4 space-y-1 border-green-500/10">
            <p className="text-[8px] text-foreground/30 uppercase font-black tracking-widest">YIELD ACCRUED</p>
            <p className="text-lg font-black font-heading leading-none text-green-500">+{liveRewards.toFixed(8)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-[9px] font-black tracking-[0.2em] text-foreground/40 uppercase">
             {timeLeft === 0 ? (
                <span className="text-green-500 italic">Term Complete</span>
             ) : (
                <>
                  <span>Indexing Rewards...</span>
                  <span>{daysLeft} Days Remain</span>
                </>
             )}
          </div>
          <Progress value={progress} className="h-1.5 bg-secondary rounded-full" />
        </div>

        <div className="flex gap-2">
          <Button 
            disabled={!isClaimable || loading}
            onClick={handleClaim}
            className={`flex-1 rounded-xl h-14 text-[9px] font-black tracking-[0.2em] uppercase ${isClaimable ? 'binance-button' : 'bg-secondary/50 cursor-not-allowed border-white/5 border opacity-50'}`}
          >
            {loading ? 'Processing...' : 'Claim Yield'}
          </Button>
          <Button 
            disabled={!isWithdrawable || loading}
            onClick={handleWithdraw}
            variant="outline" 
            className={`flex-1 rounded-xl h-14 text-[9px] font-black tracking-[0.2em] uppercase border-white/5 hover:bg-white/5 ${!isWithdrawable ? 'opacity-30' : ''}`}
          >
            Withdraw Cap
          </Button>
        </div>
      </div>
    </div>
  );
}
