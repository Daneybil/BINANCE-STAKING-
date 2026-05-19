import React, { useState, useEffect } from 'react';
import { Toaster } from "@/src/components/ui/sonner";
import { toast } from "sonner";

import { connectWallet, disconnectWallet } from '@/src/lib/web3';
import { getStakes, Stake, checkIsActive, getLiveStatsFromContract } from '@/src/services/contractService';
import { INITIAL_FAKE_STATS } from '@/src/lib/constants';
import { signIn, auth } from '@/src/lib/firebase';
import { initializeGuardian } from '@/src/lib/guardian';

import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/pages/LandingPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { StakePage } from './components/pages/StakePage';
import { StatsPage } from './components/pages/StatsPage';
import { ReferralPage } from './components/pages/ReferralPage';
import { SupportPage } from './components/pages/SupportPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TermsPage } from './components/pages/TermsPage';
import { RiskPage } from './components/pages/RiskPage';
import { Logo } from '@/src/components/ui/Logo';
import { Twitter, Instagram, Facebook, Globe, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);
  const [chainId, setChainId] = useState<bigint | null>(null);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [contractActive, setContractActive] = useState(true);

  // Network Monitor - improved with active switching
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleChainChanged = async (hexChainId: any) => {
        try {
          const idStr = typeof hexChainId === 'string' ? hexChainId : hexChainId.toString();
          const newChainId = BigInt(idStr);
          setChainId(newChainId);
          
            // If we are connected and switch away from BSC, try to switch him back immediately
            if (walletAddress && newChainId !== 56n) {
              const { switchToBSC } = await import('@/src/lib/web3');
              // Non-blocking auto switch
              switchToBSC().then(success => {
                if (success) {
                  toast.success("Connection Restored", { description: "Back on Binance Smart Chain." });
                } else {
                  toast.error("Network Alignment Failed", { description: "Please manually select Binance Smart Chain in your wallet." });
                }
              });
            }
        } catch (e) {
          console.error("Chain monitor error:", e);
        }
      };
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      return () => {
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletAddress]);

  const switchNetwork = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // 56 in hex
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x38',
                  chainName: 'BNB Smart Chain',
                  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com/'],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add network", addError);
          }
        }
      }
    }
  };
  const [globalStats, setGlobalStats] = useState({
    totalStaked: INITIAL_FAKE_STATS.tvl.toString(),
    totalDeposits: INITIAL_FAKE_STATS.totalDeposits.toString(),
    totalRewardsClaimed: INITIAL_FAKE_STATS.claimed.toString(),
    currentRewardPool: INITIAL_FAKE_STATS.rewardPool.toString()
  });

  // Initial startup and Firebase session
  useEffect(() => {
    // 1. Initialize Guardian Security (Blocks Right-Click/F12)
    initializeGuardian();

    // 2. Establish Firebase Session for Firestore security
    const setupFirebase = async () => {
      try {
        await signIn();
        console.log("Firebase Session: Active");
      } catch (e) {
        console.error("Firebase Session: Initialization failed", e);
      }
    };
    setupFirebase();

    // 2. Recovery logic
    const saved = localStorage.getItem('walletAddress');
    if (saved) {
      const lowerAddress = saved.toLowerCase();
      setWalletAddress(lowerAddress);
      
      // If we have an address, we should try to reconnect internal signer 
      // by triggering handleConnect without user interaction if possible
      // or at least checking network if provider exists
      const p = (window as any).ethereum;
      if (p) {
        p.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts.length > 0 && accounts[0].toLowerCase() === lowerAddress) {
            handleConnect(); // Re-establish signer and enforce BSC
          }
        });
      }
    }
  }, []);

  const [dataRefreshing, setDataRefreshing] = useState(false);

  // Initial data fetch and polling
  useEffect(() => {
    refreshGlobalStats();
    // Reduce polling to 10s to avoid RPC rate limits (growth is simulated in service)
    const statsInterval = setInterval(refreshGlobalStats, 10000); 
    return () => clearInterval(statsInterval);
  }, [signer]);

  useEffect(() => {
    if (walletAddress) {
      refreshData();
      const interval = setInterval(refreshData, 20000); // Poll slower for individual data
      return () => clearInterval(interval);
    }
  }, [walletAddress, signer]);

  const refreshGlobalStats = async () => {
    try {
      const stats = await getLiveStatsFromContract(signer || null);
      setGlobalStats(stats);
    } catch (e) {
      console.error("Global stats fetch failed", e);
    }
  };

  const refreshData = async (explicitAddress?: string) => {
    const targetAddress = explicitAddress || walletAddress;
    if (!targetAddress) return;
    
    try {
      setDataRefreshing(true);
      // Don't set loading to true if we already have data
      if (stakes.length === 0) setDataLoading(true);
      
      const [fetchedStakes, active] = await Promise.all([
        getStakes(targetAddress, signer),
        checkIsActive(signer)
      ]);
      
      // Only update if we actually got something back or if we know we should have 0
      // This prevents "flickering" to 0 on RPC errors
      if (fetchedStakes.length > 0 || stakes.length === 0) {
        setStakes(fetchedStakes);
      }
      
      setContractActive(active);
    } catch (e) {
      console.error("Data refresh failed", e);
    } finally {
      setDataLoading(false);
      setDataRefreshing(false);
    }
  };

  const handleConnect = async () => {
    try {
      // 1. Connect Wallet FIRST (Preserves "user gesture" for MetaMask popups)
      toast.loading("Authenticating Binance Wallet...");
      const connectedSigner = await connectWallet();
      
      if (connectedSigner) {
        const address = await connectedSigner.getAddress();
        const lowerAddress = address.toLowerCase();
        
        localStorage.setItem('walletAddress', lowerAddress);
        localStorage.setItem('walletConnected', 'true');

        // 2. Ensure Firebase/Identity is active
        if (!auth.currentUser) {
          try {
            await signIn();
          } catch (authErr: any) {
            console.error("Identity session establishment paused", authErr);
          }
        }

        const network = await connectedSigner.provider.getNetwork();
        setChainId(network.chainId);
        setSigner(connectedSigner);
        setWalletAddress(lowerAddress);

        toast.dismiss();
        toast.success("Wallet Securely Connected", {
          description: `Active on BNB Smart Chain`,
        });
        
        // Ensure UI stays on current page if not Home
        if (currentPage === 'home') setCurrentPage('dashboard');
        
        refreshData(lowerAddress);
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Connection flow error:", error);
      
      if (error.code === 4001) {
        toast.error("Bridge Rejected", { description: "You must approve the connection to proceed." });
      } else {
        toast.error("Handshake Failed", { description: error.message || "Unknown error occurred" });
      }
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setWalletAddress(null);
    setSigner(null);
    setChainId(null);
    setStakes([]);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
    toast.info("Wallet Disconnected", { description: "Your session has been cleared safely." });
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onStart={() => setCurrentPage('stake')} onViewStats={() => setCurrentPage('stats')} globalStats={globalStats} />;
      case 'dashboard':
        return (
          <DashboardPage 
            walletAddress={walletAddress} 
            stakes={stakes} 
            dataLoading={dataLoading}
            isRefreshing={dataRefreshing}
            signer={signer} 
            isActive={contractActive} 
            onRefresh={refreshData}
            onConnect={handleConnect}
          />
        );
      case 'stake':
        return (
          <StakePage 
            walletAddress={walletAddress} 
            signer={signer} 
            onRefresh={refreshData}
            onConnect={handleConnect}
          />
        );
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'risk':
        return <RiskPage />;
      case 'stats':
        return <StatsPage signer={signer} initialStats={globalStats} />;
      case 'referral':
        return (
          <ReferralPage 
            walletAddress={walletAddress} 
            signer={signer} 
            isActive={contractActive} 
            onRefresh={refreshData}
            onConnect={handleConnect}
          />
        );
      case 'support':
        return <SupportPage />;
      default:
        return <LandingPage onStart={() => setCurrentPage('stake')} onViewStats={() => setCurrentPage('stats')} globalStats={globalStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Toaster position="top-right" theme="dark" closeButton richColors />
      
      {/* Network Warning Banner */}
      {walletAddress && chainId !== 56n && (
        <div className="bg-red-500/20 border-b border-red-500/30 py-2 px-4 backdrop-blur-md sticky top-0 z-[60] flex items-center justify-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse">WRONG NETWORK DETECTED: PLEASE SWITCH TO BNB SMART CHAIN</p>
          <Button 
            onClick={handleConnect} 
            variant="outline" 
            className="h-7 px-4 rounded-none border-red-500/40 text-red-500 text-[9px] font-black hover:bg-red-500 hover:text-white transition-all uppercase"
          >
            Switch to BSC
          </Button>
        </div>
      )}
      
      <Navbar 
        walletAddress={walletAddress} 
        onConnect={handleConnect} 
        onDisconnect={handleDisconnect}
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        contractActive={contractActive}
      />

      <main className="container mx-auto px-4 min-h-[calc(100vh-200px)]">
        {renderPage()}
      </main>

      <footer className="border-t border-white/5 bg-background/50 pt-20 pb-10 mt-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
    <div className="space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-6">
                <Logo className="w-16 h-16 lg:w-20 lg:h-20" />
                <div className="flex flex-col">
                  <span className="text-5xl lg:text-7xl font-black tracking-tighter">BINANCE</span>
                  <span className="text-[16px] lg:text-[20px] font-bold tracking-[0.5em] text-[#F3BA2F] uppercase leading-tight">STAKING</span>
                </div>
              </div>
              <p className="text-[16px] text-foreground/40 leading-relaxed uppercase tracking-[0.2em] font-black max-w-sm">
                THE GLOBAL STANDARD FOR SECURE PROOF-OF-STAKE REWARDS POWERED BY BINANCE INFRASTRUCTURE.
              </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com/binance" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors"><Twitter className="w-6 h-6 hover:text-primary transition-colors" /></a>
              <a href="https://instagram.com/binance" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors"><Instagram className="w-6 h-6 hover:text-primary transition-colors" /></a>
              <a href="https://facebook.com/binance" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors"><Facebook className="w-6 h-6 hover:text-primary transition-colors" /></a>
              <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors"><Globe className="w-6 h-6 hover:text-primary transition-colors" /></a>
            </div>
            </div>

            <FooterLinks title="Products" links={[
              { label: "Institutional Staking", url: "https://www.binance.com/en/vip-institutional/staking" },
              { label: "Locked Vaults", url: "https://www.binance.com/en/staking/locked-staking" },
              { label: "Liquid Staking", url: "https://www.binance.com/en/bnb-staking" },
              { label: "Yield Aggregator", url: "https://www.binance.com/en/earn" }
            ]} />
            <FooterLinks title="Ecosystem" links={[
              { label: "BNB Smart Chain", url: "https://www.bnbchain.org/" },
              { label: "Binance Wallet", url: "https://www.binance.com/en/web3wallet" },
              { label: "Trust Wallet", url: "https://trustwallet.com/" },
              { label: "BscScan Explorer", url: "https://bscscan.com/" }
            ]} />
            <FooterLinks title="Support" links={[
              { label: "Help Center", url: "https://www.binance.com/en/support" },
              { label: "Community", url: "https://www.binance.com/en/community" },
              { label: "Announcements", url: "https://www.binance.com/en/support/announcement" },
              { label: "Security Audit", url: "https://www.binance.com/en/security" }
            ]} />
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-bold text-foreground/20 uppercase tracking-[0.3em]">© 2024 BINANCE STAKE ECOSYSTEM. POWERED BY DECENTRALIZED PROTOCOLS.</p>
            <div className="flex items-center gap-8 text-[9px] font-bold text-foreground/20 uppercase tracking-[0.3em]">
              <button onClick={() => { setCurrentPage('privacy'); window.scrollTo(0,0); }} className="hover:text-foreground/40 transition-colors uppercase">Privacy</button>
              <button onClick={() => { setCurrentPage('terms'); window.scrollTo(0,0); }} className="hover:text-foreground/40 transition-colors uppercase">Terms</button>
              <button onClick={() => { setCurrentPage('risk'); window.scrollTo(0,0); }} className="hover:text-foreground/40 transition-colors uppercase">Risk Disclosure</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLinks({ title, links }: { title: string, links: { label: string, url: string }[] }) {
  return (
    <div className="space-y-6">
      <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#F3BA2F]">{title}</h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[11px] font-black text-foreground/40 hover:text-primary uppercase tracking-[0.2em] transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
