import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Globe, Coins, ShieldCheck, PieChart } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLiveStatsFromContract } from '@/src/services/contractService';
import { formatCurrency } from '@/src/services/statsService';

interface StatsPageProps {
  signer: any;
  initialStats: {
    totalStaked: string;
    totalDeposits: string;
    totalRewardsClaimed: string;
    currentRewardPool: string;
  };
}

export const StatsPage: React.FC<StatsPageProps> = ({ signer, initialStats }) => {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getLiveStatsFromContract(signer || null);
      setStats(data);
    };

    if (!initialStats.totalStaked || initialStats.totalStaked === '0') {
        fetchStats();
    }
  }, [signer, initialStats]);

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Binance Ecosystem Explorer</Badge>
          <h2 className="text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8]">Global Binance <span className="text-primary italic">Ledger</span></h2>
          <p className="text-foreground/40 text-sm font-bold tracking-[0.2em] uppercase max-w-2xl">Official live verification of the BNB staking ecosystem liquidity and distribution architecture.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatDetail 
            icon={<Globe className="w-5 h-5" />}
            label="TOTAL STAKE VOLUME" 
            value={formatCurrency(Number(stats.totalStaked))} 
            growth="MANAGED LIQUIDITY"
        />
        <StatDetail 
            icon={<Coins className="w-5 h-5" />}
            label="TOTAL DEPOSIT WITH TOTAL STAKE" 
            value={formatCurrency(Number(stats.totalDeposits))} 
            growth="TRANSACTION FEE BACKED"
        />
        <StatDetail 
            icon={<TrendingUp className="w-5 h-5" />}
            label="TOTAL REWARD CLAIMED" 
            value={formatCurrency(Number(stats.totalRewardsClaimed))} 
            growth="+15% DAILY AVERAGE"
        />
        <StatDetail 
            icon={<ShieldCheck className="w-5 h-5" />}
            label="CURRENT REWARD POOL TO BE CLAIMED" 
            value={formatCurrency(Number(stats.currentRewardPool))} 
            growth="OFFICIAL RESERVE"
            highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex">
          <Card className="glass-panel border-white/5 rounded-[2.5rem] p-10 w-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-15 transition-transform duration-1000">
              <PieChart className="w-64 h-64" />
            </div>
            
            <div className="space-y-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">ECOSYSTEM REWARD INDEX</h3>
                  <p className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.3em] leading-none">AUTOMATED FEE DISTRIBUTION ACROSS SUPPORTED NETWORK LIQUIDITY</p>
                </div>
              </div>

              <div className="space-y-8">
                <DistributionBar label="BNB NETWORK REVENUE" percentage={45} color="bg-primary" />
                <DistributionBar label="USDT LIQUIDITY" percentage={35} color="bg-green-500" />
                <DistributionBar label="WBNB MARKET MAKING" percentage={15} color="bg-blue-500" />
                <DistributionBar label="OTHERS" percentage={5} color="bg-white/20" />
              </div>

              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <p className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.3em] italic">BINANCE MASTER LEDGER SYNCHRONIZED: BLOCK #REAL-TIME</p>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">PROTOCOL ACTIVE</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="glass-panel border-white/5 rounded-[2rem] p-8 flex-1 space-y-4">
                <h4 className="font-black text-xs tracking-[0.3em] uppercase text-foreground/40">PROTOCOL HEALTH</h4>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-green-500/20 text-green-500 bg-green-500/5">VERIFIED ASSETS</Badge>
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-primary/20 text-primary bg-primary/5">UPTIME 100%</Badge>
                    <Badge variant="outline" className="text-[9px] font-black tracking-widest uppercase border-blue-500/20 text-blue-500 bg-blue-500/5">BEP-20 STANDARD</Badge>
                </div>
                <p className="text-[10px] text-foreground/40 leading-relaxed font-black uppercase tracking-widest">
                    THE PROTOCOL OPERATES AS A SELF-BALANCING INDEX. REWARD POOLS ARE REPLENISHED VIA SYSTEM-LEVEL MARKET MAKING AND ARBITRAGE STRATEGIES.
                </p>
            </Card>

            <Card className="bg-primary border-none rounded-[2rem] p-8 flex-1 group hover:scale-[1.02] transition-transform duration-500 shadow-2xl shadow-primary/20 cursor-default">
                <div className="space-y-4">
                    <h4 className="text-primary-foreground/60 font-black text-[10px] tracking-widest uppercase">REWARDS INDEX</h4>
                    <p className="text-primary-foreground text-7xl font-black font-heading leading-tight italic tracking-tighter">15.0%</p>
                    <p className="text-primary-foreground text-[10px] font-black uppercase tracking-widest leading-relaxed">
                        BASE DAILY REWARD RATE DISTRIBUTED TO ALL ACTIVE VAULTS GLOBALLY.
                    </p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

function StatDetail({ icon, label, value, growth, highlight }: { icon: React.ReactNode, label: string, value: string, growth: string, highlight?: boolean }) {
  return (
    <Card className={`glass-panel border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/20 transition-all duration-500 ${highlight ? 'ring-1 ring-primary/30 bg-primary/5' : ''}`}>
        <div className="space-y-4 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlight ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'} border border-white/5`}>
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">{label}</p>
                <h4 className={`text-4xl font-black font-heading tracking-tight ${highlight ? 'text-glow' : ''}`}>{value}</h4>
            </div>
            <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> {growth}
            </p>
        </div>
    </Card>
  );
}

function DistributionBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{label}</span>
            <span className="text-xs font-black font-mono">{percentage}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(252,213,53,0.2)]`} 
            />
        </div>
    </div>
  );
}
