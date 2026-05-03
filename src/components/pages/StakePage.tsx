import React, { useState, useMemo } from 'react';
import { Coins, ChevronRight, Info, Users, BarChart3, AlertCircle, TrendingUp, Activity, ShieldCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ASSETS, REWARD_MULTIPLIERS } from '@/src/lib/constants';
import { stakeAsset } from '@/src/services/contractService';
import { toast } from "sonner";

interface StakePageProps {
  walletAddress: string | null;
  signer: any;
  onRefresh: () => void;
  onConnect: () => void;
}

export const StakePage: React.FC<StakePageProps> = ({ 
  walletAddress, 
  signer, 
  onRefresh,
  onConnect
}) => {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0].id);
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockDays, setLockDays] = useState(60);
  const [refAddress, setRefAddress] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-detect referral from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.startsWith('0x') && ref.length === 42) {
      setRefAddress(ref);
    }
  }, []);

  const estimatedRewards = useMemo(() => {
    try {
      const amount = parseFloat(stakeAmount) || 0;
      // 15% daily reward calculation (flat rate, no multiplier)
      return (amount * 0.15 * lockDays);
    } catch (e) {
      return 0;
    }
  }, [stakeAmount, lockDays]);

  const handleStakeClick = () => {
    if (!walletAddress) return onConnect();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return toast.error("Invalid Amount", { description: "Please enter a valid amount to stake." });
    }
    setShowConfirm(true);
  };

  const executeStake = async () => {
    setShowConfirm(false);
    setIsStaking(true);
    try {
      const tx = await stakeAsset(signer, selectedAsset, stakeAmount, lockDays, refAddress || undefined);
      
      const promise = tx.wait().then((receipt: any) => {
        onRefresh();
        return receipt;
      });

      toast.promise(promise, {
        loading: `Sending ${stakeAmount} ${selectedAsset} to Binance Vault...`,
        success: 'Staking successful! Your portfolio is updating.',
        error: 'Failed to confirm staking transaction.'
      });

      await promise;
      setStakeAmount('');
    } catch (error: any) {
      toast.error("Staking Failed", { description: error.message });
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="space-y-16 py-12">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="glass-panel w-full max-w-lg rounded-[2.5rem] border-white/10 shadow-[0_0_100px_rgba(243,186,47,0.1)] overflow-hidden">
            <div className="p-10 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black font-heading uppercase italic tracking-tighter">Confirm Execution</h3>
                <p className="text-sm font-bold text-foreground/50 leading-relaxed tracking-wide">
                  Please acknowledge that your <span className="text-primary font-black">{stakeAmount} {selectedAsset}</span> will be locked in the Binance protocol for <span className="text-primary font-black">{lockDays} Days</span>.
                </p>
              </div>

              <div className="bg-secondary/40 rounded-2xl p-6 space-y-4 border border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <span>Vault Lock-up</span>
                  <span className="text-foreground">{lockDays} Days</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <span>Daily Yield</span>
                  <span className="text-primary">Flat 15%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  <span>Maturity Rewards</span>
                  <span className="text-primary">{estimatedRewards.toFixed(2)} {selectedAsset}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={executeStake}
                  className="binance-button h-16 rounded-2xl text-md font-black italic tracking-tighter w-full shadow-lg shadow-primary/20"
                >
                  FULLY ACKNOWLEDGE & CONFIRM
                </Button>
                <Button 
                  onClick={() => setShowConfirm(false)}
                  variant="ghost"
                  className="h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 hover:text-foreground transition-colors"
                >
                  Cancel Operation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Binance Network Interface</Badge>
          <h2 className="text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8]">Binance <span className="text-primary italic">Staking</span></h2>
          <p className="text-foreground/40 text-sm font-bold tracking-wide italic">Reinvesting BSC network fees to community participants via secured autonomous audit-verified logic.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-7">
          <Card className="glass-panel border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
            
            <div className="p-10 space-y-10">
              {/* Asset Selection */}
              <div className="space-y-6">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 block ml-1">Asset To Provision</label>
                <div className="grid grid-cols-3 gap-3">
                  {ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset.id)}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all duration-300 gap-3 relative overflow-hidden group ${
                        selectedAsset === asset.id 
                          ? "bg-primary/10 border-primary shadow-[0_0_25px_rgba(252,213,53,0.1)]" 
                          : "bg-secondary/40 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <img src={asset.icon} alt={asset.title} className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <div className="text-center">
                        <span className="text-xs font-black block uppercase tracking-tight">{asset.title}</span>
                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest leading-none">BEP-20 Network</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Referral Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 relative">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 block ml-1">STAKE COMMITMENT</label>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="h-20 bg-secondary/50 border-white/10 rounded-2xl pl-14 pr-24 text-2xl font-black font-mono focus-visible:ring-primary/20 transition-all" 
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm border border-white/5 rounded-lg px-3 py-1">
                      <span className="text-[11px] font-black text-primary uppercase font-mono tracking-tighter">{selectedAsset}</span>
                    </div>
                  </div>
                  <div className="flex justify-between px-2">
                    <span className="text-[9px] font-bold text-foreground/30 tracking-widest italic">No minimum limit — Liquidity freedom</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40 block ml-1">Partner Address</label>
                  <div className="relative">
                    <Input 
                      placeholder="0x..." 
                      value={refAddress}
                      onChange={(e) => setRefAddress(e.target.value)}
                      className="h-20 bg-secondary/50 border-white/10 rounded-2xl pl-14 text-xs font-mono focus-visible:ring-primary/20" 
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-foreground/30 tracking-widest px-2 italic">10% commission distributed to this wallet</p>
                </div>
              </div>

              {/* Duration Slider/Buttons */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/40">Vault Lock-up Period</label>
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase h-6 px-3">
                    Fixed 15% Daily Rate
                  </Badge>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
                  {LOCK_PERIOD_CONFIG.map((days) => (
                    <button
                      key={days}
                      onClick={() => setLockDays(days)}
                      className={`h-11 rounded-xl border text-[11px] font-black transition-all duration-300 flex flex-col items-center justify-center ${
                        lockDays === days 
                          ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                          : "bg-secondary/40 border-white/5 hover:border-white/20 text-foreground/60"
                      }`}
                    >
                      <span>{days}</span>
                      <span className="text-[8px] opacity-70">DAYS</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                  <Activity className="w-32 h-32" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] text-foreground/40 mb-1 uppercase">Projected total yield</p>
                    <h3 className="text-5xl font-black font-heading text-primary flex items-baseline gap-3">
                      {estimatedRewards.toFixed(4)}
                      <span className="text-sm uppercase font-black tracking-widest text-primary/40 italic">{selectedAsset}</span>
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> AUDIT VERIFIED</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> INSTANT SETTLE</span>
                  </div>
                </div>
                <Button 
                  onClick={handleStakeClick} 
                  disabled={isStaking}
                  className="binance-button h-20 px-12 rounded-[2rem] w-full md:w-auto text-xl font-black tracking-tighter group italic shadow-2xl shadow-primary/20"
                >
                  {isStaking ? "INITIALIZING..." : "EXECUTE STAKE"}
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground/40 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Protocol Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ParameterInfo 
                    title="Reward Frequency" 
                    value="Index-based (Daily)" 
                    description="Yields are indexed every 24 hours based on system TVL status." 
                />
                <ParameterInfo 
                    title="Min Stake Amount" 
                    value="ANY AMOUNT" 
                    description="No minimum entry barrier. Participants can provision any volume of liquidity." 
                />
                <ParameterInfo 
                    title="Protocol Fee" 
                    value="0%" 
                    description="Infrastructure maintenance is covered by system spread, no user fees." 
                />
                <ParameterInfo 
                    title="Security Level" 
                    value="Binance Grade" 
                    description="Assets protected by BSC-governed official Binance multi-sig vaults." 
                />
            </div>

            <div className="glass-panel rounded-[2rem] p-8 border-white/5 space-y-6">
                <h4 className="font-bold text-sm tracking-[0.2em] uppercase text-[#F3BA2F]">Permanent Protection</h4>
                <p className="text-xs text-foreground/50 leading-relaxed font-bold tracking-wide">
                    Staked assets are secured by the Binance Foundation protocols and official multi-sig infrastructure.
                </p>
                <div className="flex -space-x-3">
                    {ASSETS.map(a => (
                        <div key={a.id} className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center p-2">
                            <img src={a.icon} alt={a.title} className="w-6 h-6" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-black text-primary">
                        +3
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="pt-24 space-y-12">
        <div className="space-y-4 text-center">
            <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-black tracking-[0.4em] px-4 py-1">Binance Staking Support</Badge>
            <h2 className="text-5xl font-black font-heading tracking-tighter uppercase italic text-glow">FAQs & Staking Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <FAQCard 
                question="HOW TO BUY ASSETS?"
                answer="To participate, you first need BNB or USDT in your wallet. You can acquire these directly on Binance.com and transfer them to your decentralized wallet (Trust Wallet or MetaMask) via the BNB Smart Chain (BEP-20) network."
            />
            <FAQCard 
                question="HOW TO START STAKING?"
                answer="Connect your wallet using the 'Connect Wallet' button. Navigate to the Stake section, select your preferred asset (BNB or USDT), enter your STAKMENT COMMITMENT amount, choose your Vault Lock-up duration, and click 'EXECUTE STAKE'. Confirm the transaction in your wallet."
            />
            <FAQCard 
                question="WHO OWNS THIS PLATFORM?"
                answer="This is an official decentralized yield distribution protocol powered by the Binance Staking Infrastructure. All assets are managed by autonomous smart contracts verified by the Binance ecosystem audit standards."
            />
            <FAQCard 
                question="WHERE CAN I SEE MY STAKES?"
                answer="Once you execute a stake, head over to your PERSONAL DASHBOARD. There you can track your active vaults, accumulated rewards, and maturity dates in real-time. Everything is updated live from the BSC Ledger."
            />
            <FAQCard 
                question="IS THERE A MINIMUM STAKE?"
                answer="We have removed all entry barriers. Any amount, small or large, can be provisioned into the staking vaults to start receiving 15% daily rewards instantly."
            />
            <FAQCard 
                question="HOW ARE REWARDS DISTRIBUTED?"
                answer="Rewards are calculated at a flat 15% daily rate. Upon lock-up maturity, you can claim your rewards and withdraw your principal directly from your dashboard."
            />
        </div>
      </section>
    </div>
  );
};

const LOCK_PERIOD_CONFIG = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

function FAQCard({ question, answer }: { question: string, answer: string }) {
  return (
    <Card className="glass-panel p-8 rounded-3xl border-white/5 hover:border-primary/20 transition-all space-y-4">
      <h4 className="text-lg font-black text-primary uppercase tracking-tighter italic">{question}</h4>
      <p className="text-sm text-foreground/50 leading-relaxed font-bold tracking-normal">{answer}</p>
    </Card>
  );
}

function ParameterInfo({ title, value, description }: { title: string, value: string, description: string }) {
  return (
    <div className="glass-panel p-6 rounded-3xl space-y-3 border-white/5">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{title}</p>
        <p className="text-lg font-black">{value}</p>
      </div>
      <p className="text-[10px] text-foreground/40 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
