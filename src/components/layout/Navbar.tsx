import React from 'react';
import { Wallet, Coins, Menu, X } from 'lucide-react';
import { Button } from "@/src/components/ui/button";

import { Logo } from '@/src/components/ui/Logo';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  contractActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  walletAddress, 
  onConnect, 
  onDisconnect,
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
    { id: 'support', label: 'Ticketing' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div 
            className="flex items-center gap-2 md:gap-4 group cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <Logo className="w-8 h-8 md:w-12 md:h-12 transition-transform group-hover:scale-110 duration-300" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl md:text-5xl font-black tracking-tighter font-heading leading-none">BINANCE</span>
              <span className="text-[8px] sm:text-[10px] md:text-[16px] font-bold tracking-[0.3em] md:tracking-[0.6em] text-[#F3BA2F] uppercase leading-tight">STAKING</span>
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

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>
          
          {walletAddress ? (
            <div className="flex items-center gap-2 md:gap-3">
              {/* Desktop address pill */}
              <div className="hidden sm:flex items-center gap-2 bg-secondary/50 rounded-full pl-2 pr-4 py-1.5 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-mono font-medium">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
              {/* Mobile compact connected indicator + Instant Disconnect */}
              <button
                type="button"
                onClick={onDisconnect}
                title="Click to disconnect wallet"
                className="sm:hidden flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 active:scale-95 border border-red-500/20 rounded-full px-2.5 py-1.5 cursor-pointer transition-all focus:outline-none select-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                <span className="text-[10px] font-mono text-foreground/90 font-bold">{walletAddress.slice(0, 4)}...{walletAddress.slice(-2)}</span>
                <span className="text-[8px] text-red-500 font-black ml-0.5">✕</span>
              </button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onDisconnect}
                className="hidden sm:inline-flex h-9 px-3 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={onConnect} className="binance-button rounded-full px-3.5 sm:px-6 flex gap-1.5 sm:gap-2 h-9 sm:h-10 text-[9px] sm:text-[10px] font-black uppercase tracking-wider cursor-pointer">
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect</span>
            </Button>
          )}

          <button 
            type="button"
            className="lg:hidden p-1.5 py-2 text-foreground/80 hover:text-primary transition-colors flex items-center gap-1 focus:outline-none select-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-foreground/60">Menu</span>
            {mobileMenuOpen ? <X className="w-4 h-4 text-primary" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Absolute Mobile Dropdown Menu Panel - Positioned directly below the header bar, completely non-blocking, scrollable and touch-friendly */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 w-full z-50 bg-[#0c0c0c]/98 border-b border-white/10 backdrop-blur-xl p-5 flex flex-col gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-3 duration-200">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#F3BA2F] border-b border-white/5 pb-2 px-1">STAKING SECTIONS</div>
          
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={`p-3.5 rounded-xl text-left text-[10px] font-black uppercase tracking-wider flex items-center justify-between border transition-all ${
                  currentPage === item.id 
                    ? 'bg-[#F3BA2F]/15 border-[#F3BA2F]/30 text-[#F3BA2F]' 
                    : 'bg-secondary/20 border-white/5 text-foreground/70 hover:border-white/10'
                }`}
              >
                <span>{item.label}</span>
                {currentPage === item.id && <span className="w-1.5 h-1.5 rounded-full bg-[#F3BA2F] shadow-[0_0_8px_rgba(243,186,47,0.7)]" />}
              </button>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground/45 px-1">LANGUAGE</span>
              <LanguageSelector />
            </div>

            <div className="p-3 bg-secondary/15 border border-white/5 rounded-xl space-y-3">
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-foreground/35 block mb-1">SECURE CONNECTION STATE</span>
              {walletAddress ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-mono font-bold tracking-tight text-foreground/90 block break-all">{walletAddress}</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] shrink-0" />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    type="button"
                    onClick={() => {
                      onDisconnect();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full h-8.5 text-[9px] font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/15 rounded-lg cursor-pointer"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    onConnect();
                    setMobileMenuOpen(false);
                  }} 
                  type="button"
                  className="w-full binance-button rounded-xl h-10 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Connect Wallet</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
