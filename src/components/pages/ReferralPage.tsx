import React, { useState, useEffect } from 'react';
import { Users, History, Link as LinkIcon, Gift, TrendingUp, AlertCircle, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getReferralData, withdrawReferral } from '@/src/services/contractService';
import { USDT_ADDRESS } from '@/src/lib/constants';

interface ReferralPageProps {
  walletAddress: string | null;
  signer: any;
  isActive: boolean;
  onRefresh: () => void;
  onConnect: () => void;
}

export const ReferralPage: React.FC<ReferralPageProps> = ({ 
  walletAddress, 
  signer, 
  isActive, 
  onRefresh,
  onConnect
}) => {
  const [data, setData] = useState({ bnbRewards: '0.00', usdtRewards: '0.00' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress && signer) {
      fetchReferralData();
    }
  }, [walletAddress, signer]);

  const fetchReferralData = async () => {
    const res = await getReferralData(signer, walletAddress!);
    setData(res);
  };

  const handleWithdraw = async (token: string) => {
    if (!signer || !walletAddress || loading) return;
    setLoading(true);
    try {
      const tokenAddr = token === 'USDT' ? USDT_ADDRESS : '0x0000000000000000000000000000000000000000';
      const tx = await withdrawReferral(signer, tokenAddr);
      toast.promise(tx.wait(), {
        loading: `Withdrawal of ${token} rewards requested...`,
        success: 'Referral commission distributed!',
        error: 'Execution failed.'
      });
      await tx.wait();
      fetchReferralData();
      onRefresh();
    } catch (e: any) {
      toast.error('Withdrawal failed', { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const copyRefLink = () => {
    if (!walletAddress) return onConnect();
    const link = `${window.location.origin}/?ref=${walletAddress}`;
    navigator.clipboard.writeText(link);
    toast.success("Link Copied", { description: "Your Binance referral link is ready to share." });
  };

  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Binance Growth Program</Badge>
          <h2 className="text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8]">Referral <span className="text-primary italic">Incentives</span></h2>
          <p className="text-foreground/40 text-sm font-bold tracking-wide max-w-2xl">Earn direct 10% Binance commission by expanding the official BNB cross-chain liquidity network.</p>
        </div>
      </div>

      {!walletAddress ? (
        <div className="glass-panel border-dashed border-white/10 rounded-[3rem] p-24 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-foreground/20">
            <Users className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Referral Access Required</h3>
            <p className="text-foreground/40 max-w-sm mx-auto text-sm leading-relaxed tracking-wider font-bold">Connect your institutional wallet to generate your unique partner link and track commissions.</p>
          </div>
          <Button onClick={onConnect} className="binance-button rounded-xl px-12 h-14 text-xs">Connect Wallet To Begin</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Earnings */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground/40 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Commissions Ledger
            </h3>
            <div className="space-y-4">
              <CommissionCard 
                token="BNB / WBNB" 
                amount={data.bnbRewards} 
                onWithdraw={() => handleWithdraw('BNB')}
                loading={loading}
                active={isActive}
              />
              <CommissionCard 
                token="USDT" 
                amount={data.usdtRewards} 
                onWithdraw={() => handleWithdraw('USDT')}
                loading={loading}
                active={isActive}
              />
            </div>

            <Card className="glass-panel border-white/5 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-tight">Performance Boost</h4>
                </div>
                <p className="text-[11px] text-foreground/50 leading-relaxed font-bold tracking-wider">
                    Our multi-tier referral system is built for scale. Unlike other protocols, we settle commissions instantly in the base asset using smart contract logic.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                    <AlertCircle className="w-3 h-3" /> Payouts require active protocol status
                </div>
            </Card>
          </div>

          {/* Invitation Link */}
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-xl font-bold uppercase tracking-widest italic text-foreground/40 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" /> Partnership Invitation
            </h3>
            
            <Card className="glass-panel border-white/10 rounded-[3rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 -z-10" />
                
                <div className="space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Unique Referral Key</label>
                             <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-tighter uppercase px-2 py-0.5">Verified Partner</Badge>
                        </div>
                        <div className="flex gap-4">
                            <Input 
                                readOnly 
                                value={`${window.location.origin}/?ref=${walletAddress}`} 
                                className="bg-secondary/50 border-white/5 h-20 rounded-2xl font-mono text-xs pl-8 border-dashed focus-visible:ring-0"
                            />
                            <Button 
                                onClick={copyRefLink}
                                className="binance-button h-20 px-10 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:scale-105 transition-transform"
                            >
                                Copy Key
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <PartnerMetric label="Total Referrals" value="0" />
                        <PartnerMetric label="Active Stakes" value="0" />
                        <PartnerMetric label="Total Earned" value="$0.00" />
                        <PartnerMetric label="Global Rank" value="#--" />
                    </div>

                    <div className="pt-10 border-t border-white/5 space-y-6">
                        <h5 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">How it works</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Step index={1} text="Invite institutional or retail stakers via your key." />
                            <Step index={2} text="Partner provisions capital to any staking vault." />
                            <Step index={3} text="10% instant commission settling in your ledger." />
                        </div>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

function CommissionCard({ token, amount, onWithdraw, loading, active }: { token: string, amount: string, onWithdraw: () => void, loading: boolean, active: boolean }) {
  const canWithdraw = parseFloat(amount) > 0 && active;
  return (
    <div className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-secondary border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">{token} REWARDS</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black font-heading leading-none">{amount}</p>
            <span className="text-[10px] font-black text-primary uppercase">{token.split(' ')[0]}</span>
          </div>
        </div>
      </div>
      <Button 
        onClick={onWithdraw} 
        disabled={!canWithdraw || loading}
        size="sm" 
        className={`rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest ${canWithdraw ? 'binance-button' : 'bg-secondary/50 opacity-40 grayscale cursor-not-allowed border-white/5 border'}`}
      >
        {loading ? 'Processing...' : 'Withdraw'}
      </Button>
    </div>
  );
}

function PartnerMetric({ label, value }: { label: string, value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4 text-center space-y-1">
        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-tighter leading-none">{label}</p>
        <p className="text-lg font-black font-heading tracking-tight">{value}</p>
    </div>
  );
}

function Step({ index, text }: { index: number, text: string }) {
  return (
    <div className="flex items-start gap-3">
        <span className="text-primary font-black font-heading text-lg italic opacity-50">0{index}</span>
        <p className="text-[10px] text-foreground/50 font-bold tracking-wider leading-relaxed">{text}</p>
    </div>
  );
}
