import React from 'react';
import { Card } from "@/components/ui/card";
import { Gavel, AlertTriangle, Clock, Scale } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 space-y-12">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Legal Framework</Badge>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Terms of Service</h1>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-sm">Last updated: May 2024</p>
      </div>

      <div className="grid gap-8">
        <Section 
          icon={<AlertTriangle className="w-6 h-6 text-primary" />}
          title="Risk Acknowledgment"
          content="Staking digital assets involves significant risk. You understand that digital asset prices are highly volatile and that the Binance Staking protocol is a decentralized tool. You assume all responsibility for any losses incurred through market movements or technical failures."
        />

        <Section 
          icon={<Clock className="w-6 h-6 text-primary" />}
          title="Lock-up Periods"
          content="By executing a staking transaction, you agree to lock your principal assets for the duration of the selected term (e.g., 60, 90, 180, or 360 days). Assets cannot be withdrawn before the maturity date except as permitted by the smart contract's emergency functions if available."
        />

        <Section 
          icon={<Gavel className="w-6 h-6 text-primary" />}
          title="No Financial Advice"
          content="The content on this website and the protocol interface do not constitute financial, investment, or legal advice. All calculations, including estimated rewards, are for informational purposes only and are based on the current protocol parameters which may change."
        />

        <Section 
          icon={<Scale className="w-6 h-6 text-primary" />}
          title="User Responsibility"
          content="You are responsible for complying with all applicable laws in your jurisdiction regarding digital asset ownership and staking. We do not provide services to users in restricted territories where such activities are prohibited."
        />
      </div>

      <Card className="glass-panel p-8 border-white/5 rounded-[2rem] text-center border-primary/20">
        <p className="text-xs font-bold text-primary uppercase tracking-widest leading-loose">
          BY CONNECTING YOUR WALLET AND EXECUTING A TRANSACTION, YOU FULLY ACCEPT THESE TERMS. 
          THE PROTOCOL OPERATES 'AS IS' WITHOUT ANY WARRANTIES OR GUARANTEES OF PROFIT.
        </p>
      </Card>
    </div>
  );
};

const Section = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) => (
  <div className="glass-panel p-8 border-white/5 rounded-[2rem] space-y-4 hover:border-primary/20 transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase italic tracking-tight">{title}</h3>
    </div>
    <p className="text-foreground/50 leading-relaxed font-medium">
      {content}
    </p>
  </div>
);
