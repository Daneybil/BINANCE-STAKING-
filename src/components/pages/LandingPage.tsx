import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ShieldCheck, Timer, BarChart3, Users, ChevronRight, Activity, Cpu, Globe2, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/src/services/statsService';
import { Logo } from '@/src/components/ui/Logo';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LandingPageProps {
  onStart: () => void;
  onViewStats: () => void;
  globalStats: {
    totalStaked: string;
    totalDeposits: string;
    totalRewardsClaimed: string;
    currentRewardPool: string;
  };
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewStats, globalStats }) => {
  const stats = globalStats || { totalStaked: '0', totalDeposits: '0', totalRewardsClaimed: '0', currentRewardPool: '0' };

  // Generate professional, steady growth chart data
  const chartData = useMemo(() => {
    const baseValue = 100;
    return Array.from({ length: 30 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      Yield: baseValue + (i * 8.5) + (Math.random() * 5),
    }));
  }, []);

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh] lg:min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 lg:space-y-12"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 lg:gap-6 mb-4">
               <Logo className="w-16 h-16 lg:w-24 lg:h-24" />
               <Badge className="bg-primary/20 text-primary border-none text-[10px] lg:text-[12px] uppercase font-bold tracking-[0.3em] lg:tracking-[0.4em] px-3 lg:px-4 py-1 lg:py-1.5">Official Binance Ecosystem</Badge>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[9.5rem] font-black font-heading leading-[0.8] tracking-tighter">
              BINANCE <br />
              <span className="text-primary text-glow">STAKING</span>
            </h1>
            <div className="space-y-4 lg:space-y-6 pt-2 lg:pt-4">
              <p className="text-xl md:text-3xl lg:text-5xl font-black uppercase tracking-tight leading-[0.9]">
                DISTRIBUTING 15% DAILY REWARDS <br />
                <span className="text-primary italic">POWERED BY BINANCE</span>
              </p>
              <p className="text-foreground/60 max-w-xl text-xs md:text-base leading-relaxed font-black uppercase tracking-widest">
                BINANCE DISTRIBUTES BSC NETWORK TRANSACTION FEES BACK TO THE COMMUNITY VIA THIS OFFICIAL STAKING PROTOCOL. DESIGNED TO ENSURE BNB PRICE STABILITY AND LONG-TERM ECOSYSTEM GROWTH.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            <Button onClick={onStart} className="binance-button h-16 lg:h-20 px-8 lg:px-12 rounded-none text-base lg:text-lg font-black uppercase tracking-widest group">
              Start Staking <ChevronRight className="ml-3 w-5 h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button onClick={onViewStats} variant="outline" className="h-16 lg:h-20 px-8 lg:px-12 rounded-none border-2 border-white/10 hover:bg-white/5 text-base lg:text-lg font-black uppercase tracking-widest">
              Network Stats
            </Button>
          </div>

          <div className="flex items-center gap-6 lg:gap-12 pt-4 lg:pt-8 overflow-x-auto">
            <div className="flex flex-col shrink-0">
              <span className="text-[8px] lg:text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] lg:tracking-[0.3em]">Protocol Yield</span>
              <span className="text-2xl lg:text-4xl font-black text-glow">15% <span className="text-[10px] text-primary font-bold">DAILY</span></span>
            </div>
            <div className="w-px h-8 lg:h-12 bg-white/10 shrink-0" />
            <div className="flex flex-col shrink-0">
              <span className="text-[8px] lg:text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] lg:tracking-[0.3em]">Global TVL Volume</span>
              <span className="text-2xl lg:text-4xl font-black">{formatCurrency(Number(stats.totalStaked))}</span>
            </div>
            <div className="w-px h-8 lg:h-12 bg-white/10 shrink-0" />
            <div className="flex flex-col shrink-0">
              <span className="text-[8px] lg:text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] lg:tracking-[0.3em]">Network Uptime</span>
              <span className="text-2xl lg:text-4xl font-black">100.0%</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] -z-10" />
          
          <div className="glass-panel border-white/10 rounded-[2.5rem] p-0 shadow-2xl relative overflow-hidden bg-black/60 backdrop-blur-3xl">
            {/* Terminal Header */}
            <div className="border-b border-white/5 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tighter text-lg italic">YIELD PROTOCOL INDEX</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#F3BA2F] font-black">LIVE PERFORMANCE RECAP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading View Style Chart Area */}
            <div className="h-64 sm:h-96 w-full relative group bg-[#0c0c0c] p-4">
              <div className="absolute top-8 left-10 z-10">
                 <div className="flex items-center gap-3">
                    <span className="text-xl font-bold font-mono text-primary animate-pulse tracking-tight">STAKING_INDEX_LIVE</span>
                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">DAILY VOLATILITY: 2.4%</Badge>
                 </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 60, right: 10, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    minTickGap={30}
                  />
                  <YAxis 
                    orientation="right" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                    tickFormatter={(val) => `${val.toFixed(0)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 15, 15, 0.95)', 
                      border: '1px solid rgba(243,186,47,0.3)', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                    }}
                    itemStyle={{ color: '#F3BA2F', fontWeight: '900' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Yield" 
                    stroke="#F3BA2F" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={3000}
                  />
                </AreaChart>
              </ResponsiveContainer>

              <div className="absolute top-4 left-6 pointer-events-none space-y-1">
                <div className="flex items-center gap-2">
                   <Badge className="bg-primary text-black font-black text-[9px] px-2 py-0.5 rounded-none italic">PRO VIEW</Badge>
                   <span className="text-[10px] text-foreground/40 font-black tracking-widest">REAL-TIME LIQUIDITY CURVE</span>
                </div>
              </div>

              {/* Data Overlay Grid */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                 {Array.from({ length: 16 }).map((_, i) => (
                   <div key={i} className="border-[0.5px] border-white/5" />
                 ))}
              </div>
            </div>

            {/* Terminal Footer/Grid */}
            <div className="border-t border-white/5 bg-white/2 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                 <TerminalStat label="Current Stake" value={formatCurrency(Number(stats.totalStaked))} sub="Aggregated Pool" />
                 <TerminalStat label="Total Deposits" value={formatCurrency(Number(stats.totalDeposits))} sub="Protocol Wide" />
                 <TerminalStat label="Rewards Paid" value={formatCurrency(Number(stats.totalRewardsClaimed))} sub="Community Yield" />
                 <TerminalStat label="Reserved Pool" value={formatCurrency(Number(stats.currentRewardPool))} sub="Official Liquidity" color="text-primary" />
              </div>

              {/* Network Status Bar */}
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <Cpu className="w-3 h-3 text-foreground/30" />
                       <span className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em]">ENGINE: BINANCE-V2</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Globe2 className="w-3 h-3 text-foreground/30" />
                       <span className="text-[8px] font-black text-foreground/30 uppercase tracking-[0.2em]">NODES: 512 ACTIVE</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-[0.3em] italic">SYSTEM STABLE</span>
                    <Zap className="w-3 h-3 text-green-500 fill-green-500 animate-pulse" />
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 pt-12">
        <FeatureCard 
          icon={<ShieldCheck className="w-12 h-12 lg:w-16 lg:h-16 text-primary" />}
          title="BINANCE SECURITY STANDARDS"
          description="BUILT USING THE HIGHEST BINANCE SECURITY PROTOCOLS, OUR PLATFORM INTEGRATES WITH INSTITUTIONAL-GRADE MULTI-SIGNATURE VAULTS TO PROVIDE A SAFE AND POSITIVE GROWTH ENVIRONMENT FOR YOUR DIGITAL ASSETS ON THE BNB CHAIN."
        />
        <FeatureCard 
          icon={<Timer className="w-12 h-12 lg:w-16 lg:h-16 text-primary" />}
          title="AUTONOMOUS YIELD LOGIC"
          description="THE BINANCE STAKING NETWORK UTILIZES ADVANCED SMART CONTRACT LOGIC TO HANDLE COMPOUND REWARD CALCULATIONS AND INSTANT TOKEN DISTRIBUTIONS AUTOMATICALLY, ENSURING OUR COMMUNITY MEMBERS RECEIVE THEIR YIELDS WITH TOTAL TRANSPARENCY."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-12 h-12 lg:w-16 lg:h-16 text-primary" />}
          title="GLOBAL NETWORK LIQUIDITY"
          description="OUR PROTOCOL IS DIRECTLY BACKED BY THE VAST BINANCE LIQUIDITY NETWORK, LEVERAGING THE POWER OF THE BNB ECOSYSTEM TO ENSURE A STABLE AND CONSISTENT 15% DAILY YIELD FOR ALL PARTICIPANTS."
        />
      </section>

      {/* Trust & Stats Preview */}
      <section className="glass-panel border-white/5 rounded-none p-8 lg:p-16 text-center space-y-12 lg:space-y-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/2 opacity-50 -z-10" />
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
            <h2 className="text-4xl md:text-7xl lg:text-9xl font-black font-heading tracking-tighter uppercase leading-[0.85]">POWERING THE <br /><span className="text-primary italic text-glow">BNB ECOSYSTEM</span></h2>
            <p className="text-foreground/40 text-[10px] lg:text-sm leading-tight uppercase tracking-[0.4em] lg:tracking-[0.6em] font-black max-w-4xl mx-auto">
                TRUSTED BY 50,000+ INSTITUTIONS AND RETAIL STAKERS GLOBALLY FOR SECURE YIELD GENERATION.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="space-y-2 lg:space-y-4">
            <p className="text-4xl lg:text-8xl font-black font-heading text-glow tracking-tighter leading-none">{formatCurrency(Number(stats.totalStaked))}</p>
            <p className="text-[10px] lg:text-[16px] font-black text-foreground/40 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2">Total Stake Volume</p>
          </div>
          <div className="space-y-2 lg:space-y-4">
            <p className="text-4xl lg:text-8xl font-black font-heading text-glow tracking-tighter leading-none">{formatCurrency(Number(stats.totalDeposits))}</p>
            <p className="text-[10px] lg:text-[16px] font-black text-foreground/40 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2">Total Deposit</p>
          </div>
          <div className="space-y-2 lg:space-y-4">
            <p className="text-4xl lg:text-8xl font-black font-heading text-glow tracking-tighter leading-none">{formatCurrency(Number(stats.totalRewardsClaimed))}</p>
            <p className="text-[10px] lg:text-[16px] font-black text-foreground/40 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2">Total Reward Claimed</p>
          </div>
          <div className="space-y-2 lg:space-y-4">
            <p className="text-4xl lg:text-8xl font-black font-heading text-primary italic text-glow tracking-tighter leading-none">{formatCurrency(Number(stats.currentRewardPool))}</p>
            <p className="text-[10px] lg:text-[16px] font-black text-foreground/40 uppercase tracking-[0.2em] lg:tracking-[0.4em] mb-2">Current Rewards to be Claimed</p>
          </div>
        </div>
      </section>
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-8 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] space-y-6 lg:space-y-8 border-white/5 hover:border-primary/20 transition-all group">
      <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-primary/5">
        <div className="scale-125 lg:scale-[1.7]">{icon}</div>
      </div>
      <div className="space-y-4 lg:space-y-6">
        <h3 className="text-2xl lg:text-4xl font-black font-heading tracking-tight text-white leading-tight uppercase">{title}</h3>
        <p className="text-[10px] lg:text-[11px] text-foreground/50 leading-relaxed font-black uppercase tracking-[0.2em]">{description}</p>
      </div>
    </div>
  );
}

function TerminalStat({ label, value, sub, color = "text-white" }: { label: string, value: string, sub: string, color?: string }) {
  return (
    <div className="space-y-1">
      <span className="block text-[8px] font-black text-foreground/20 tracking-widest uppercase">{label}</span>
      <span className={`block text-lg font-bold font-mono tracking-tighter ${color}`}>{value}</span>
      <span className="block text-[8px] font-black text-foreground/20 italic uppercase tracking-wider">{sub}</span>
    </div>
  );
}
