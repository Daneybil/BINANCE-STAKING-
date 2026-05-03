import React from 'react';
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4 space-y-12">
      <div className="text-center space-y-4">
        <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Security First</Badge>
        <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">Privacy Policy</h1>
        <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-sm">Last updated: May 2024</p>
      </div>

      <div className="grid gap-8">
        <Section 
          icon={<Shield className="w-6 h-6 text-primary" />}
          title="Data Self-Sovereignty"
          content="Binance Staking Protocol operates as a decentralized interface. We do not require, collect, or store personal identifiable information (PII) such as names, email addresses, or physical locations. Your identity is represented solely by your public wallet address on the BNB Smart Chain."
        />

        <Section 
          icon={<Lock className="w-6 h-6 text-primary" />}
          title="Information We Access"
          content="To provide the staking interface, our application reads public data from the blockchain including your wallet balance, existing stakes, and transaction history related to our smart contracts. This data is public and accessible via any BSC explorer."
        />

        <Section 
          icon={<Eye className="w-6 h-6 text-primary" />}
          title="Cookies and Tracking"
          content="We may use essential session cookies to remember your wallet connection state during a session. We do not use third-party tracking pixels or marketing analytics that compromise your financial privacy."
        />

        <Section 
          icon={<FileText className="w-6 h-6 text-primary" />}
          title="Third-Party Nodes"
          content="When you interact with the protocol, your requests are routed through RPC (Remote Procedure Call) nodes such as the official BNB Smart Chain endpoints. These nodes may see your IP address and transaction data as necessary to broadcast your interactions to the network."
        />
      </div>

      <Card className="glass-panel p-8 border-white/5 rounded-[2rem] text-center">
        <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest leading-loose">
          By using this protocol, you acknowledge the transparent and immutable nature of blockchain technology. 
          Your privacy is protected by the pseudonymity of the decentralized web.
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
