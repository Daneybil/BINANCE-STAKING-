import React from 'react';
import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingDown, Zap, ShieldAlert } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const RiskPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 space-y-12">
      <div className="text-center space-y-4">
        <Badge className="bg-red-500/10 text-red-500 border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">High Volatility Warning</Badge>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Risk Disclosure</h1>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-sm">Official Protocol Notice</p>
      </div>

      <div className="grid gap-8">
        <RiskSection 
          icon={<TrendingDown className="w-6 h-6 text-red-500" />}
          title="Market Risk"
          content="Digital asset prices are subject to extreme volatility. The value of your staked assets (BNB/USDT) may fluctuate significantly. Binance Staking does not guarantee the dollar-equivalent value of your principal upon maturity."
        />

        <RiskSection 
          icon={<Zap className="w-6 h-6 text-red-500" />}
          title="Smart Contract Risk"
          content="While our smart contracts are built on audited Binance infrastructure, all code is subject to potential vulnerabilities. By staking, you accept the technical risks associated with blockchain-based protocols."
        />

        <RiskSection 
          icon={<AlertCircle className="w-6 h-6 text-red-500" />}
          title="Liquidity Risk"
          content="Staked assets are locked for the duration of the chosen term. You will not be able to trade, transfer, or liquidate your staked position until the lock-up period expires. Ensure you have sufficient liquidity outside the protocol."
        />

        <RiskSection 
          icon={<ShieldAlert className="w-6 h-6 text-red-500" />}
          title="De-Pegging Risk"
          content="For stablecoin staking (USDT), there is a theoretical risk of the asset losing its 1:1 peg with the US Dollar. The protocol is not responsible for losses caused by the failure of underlying stablecoin assets."
        />
      </div>

      <Card className="glass-panel p-8 border-red-500/20 bg-red-500/5 rounded-[2rem] text-center">
        <p className="text-xs font-black text-red-500 uppercase tracking-widest leading-loose">
          DO NOT STAKE FUNDS YOU CANNOT AFFORD TO LOSE. STAKING INVOLVES THE RISK OF TOTAL CAPITAL LOSS.
        </p>
      </Card>
    </div>
  );
};

const RiskSection = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
  <div className="glass-panel p-8 border-white/5 rounded-[2rem] space-y-4 hover:border-red-500/20 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-red-500/10 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase italic tracking-tight">{title}</h3>
    </div>
    <p className="text-foreground/50 leading-relaxed font-medium">
      {content}
    </p>
  </div>
);
