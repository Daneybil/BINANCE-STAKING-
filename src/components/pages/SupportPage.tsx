import React from 'react';
import { Mail, MessageSquare, ShieldAlert, FileText, ExternalLink, Activity } from 'lucide-react';
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@binance-staking.active';

export const SupportPage: React.FC = () => {
  return (
    <div className="space-y-16 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-none text-[12px] uppercase font-bold tracking-[0.4em] px-4 py-1.5 mb-2">Support Center</Badge>
          <h2 className="text-7xl font-black font-heading tracking-tighter uppercase leading-[0.8]">Ticketing <span className="text-primary italic">& Support</span></h2>
          <p className="text-foreground/40 text-sm font-bold tracking-wide max-w-2xl">Official communication gateway for Binance Staking protocol inquiries and transaction assistance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
          <Card className="glass-panel border-white/5 rounded-[3rem] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-4xl font-black font-heading uppercase italic tracking-tighter">Submit a Ticket</h3>
                  <p className="text-foreground/50 font-bold leading-relaxed">
                    If you encounter any issues with yield distribution, principal withdrawal, or network connectivity, our automated ticketing system is here to help.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-6 bg-secondary/30 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Official Support Email</p>
                      <p className="text-lg font-black font-heading italic">{SUPPORT_EMAIL}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-6 bg-secondary/30 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Average Response Time</p>
                      <p className="text-lg font-black font-heading italic">Under 2 Hours</p>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild
                  className="binance-button h-20 px-12 rounded-2xl text-xl font-black italic tracking-tighter group shadow-2xl shadow-primary/20"
                >
                  <a href={`mailto:${SUPPORT_EMAIL}`}>
                    OPEN OFFICIAL TICKET
                    <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </Button>
              </div>

              <div className="space-y-10">
                <h3 className="text-2xl font-black font-heading uppercase italic tracking-tighter text-foreground/40">Knowledge Base</h3>
                
                <div className="space-y-6">
                  <SupportItem 
                    icon={<ShieldAlert className="w-5 h-5" />}
                    title="Transaction Pending?"
                    desc="Transactions on the Binance Smart Chain typically index within 30-60 seconds. Please refresh your dashboard after this period."
                  />
                  <SupportItem 
                    icon={<FileText className="w-5 h-5" />}
                    title="Withdrawal Failures"
                    desc="Ensure you have a small amount of BNB for gas fees and that you are connected to the correct BSC Mainnet network."
                  />
                  <SupportItem 
                    icon={<Activity className="w-5 h-5" />}
                    title="Real-time Syncing"
                    desc="Our protocol uses decentralized indexing. If statistics appear stale, use the 'Force Sync' button in your dashboard."
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

function SupportItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-3">
        <div className="text-primary group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="font-black text-sm uppercase tracking-tight">{title}</h4>
      </div>
      <p className="text-[11px] text-foreground/40 font-bold leading-relaxed tracking-wider ml-8">{desc}</p>
    </div>
  );
}
