import React from 'react';
import { Wallet, Coins, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { Logo } from '@/src/components/ui/Logo';

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  contractActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  walletAddress, 
  onConnect, 
  currentPage, 
  setCurrentPage,
  contractActive
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'stake', label: 'Stake' },
    { id: 'stats', label: 'Stats' },
    { id: 'referral', label: 'Referral' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      {!contractActive && (
        <div className="bg-destructive/10 border-b border-destructive/20 py-2 animate-pulse">
          <div className="container mx-auto px-4 flex justify-center items-center gap-2 text-[10px] font-bold text-destructive uppercase tracking-widest">
            <span>Withdrawals and Claims are currently locked by the protocol administrator</span>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-2 md:gap-4 group cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <Logo className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-110 duration-300" />
            <div className="flex flex-col">
              <span className="text-2xl md:text-5xl font-black tracking-tighter font-heading leading-none">BINANCE</span>
              <span className="text-[10px] md:text-[16px] font-bold tracking-[0.4em] md:tracking-[0.6em] text-[#F3BA2F] uppercase leading-tight">STAKING</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 font-medium text-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`transition-colors uppercase text-[10px] font-bold tracking-widest ${
                  currentPage === item.id ? 'text-primary' : 'text-foreground/60 hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-full pl-2 pr-4 py-1.5 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-mono font-medium">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            </div>
          ) : (
            <Button onClick={onConnect} className="binance-button rounded-full px-6 flex gap-2 h-10 text-[10px] font-bold uppercase tracking-wider">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </Button>
          )}

          <button 
            className="lg:hidden p-2 text-foreground/60"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-background p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`p-4 rounded-xl text-left text-xs font-bold uppercase tracking-widest ${
                currentPage === item.id ? 'bg-primary/10 text-primary' : 'text-foreground/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
