import { BrowserProvider, JsonRpcSigner } from 'ethers';

export const BSC_CHAIN_ID = '0x38'; // 56 in hex
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

let cachedProvider: BrowserProvider | null = null;
let cachedSigner: JsonRpcSigner | null = null;

export const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    if (!cachedProvider) {
      cachedProvider = new BrowserProvider((window as any).ethereum, "any");
    }
    return cachedProvider;
  }
  return null;
};

export const connectWallet = async (): Promise<JsonRpcSigner | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Please install MetaMask or Trust Wallet.');
  }

  const ethereum = (window as any).ethereum;

  try {
    // 1. Request accounts
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }
    
    // 2. Resolve Chain ID
    let currentChainId = await ethereum.request({ method: 'eth_chainId' });
    let isBSC = currentChainId && (currentChainId.toLowerCase() === BSC_CHAIN_ID || parseInt(currentChainId, 16) === 56);
    
    if (!isBSC) {
      console.log("Switching to Binance Smart Chain...");
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
        // Important: wait for the wallet to actually process the switch
        await new Promise(r => setTimeout(r, 2000));
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BSC_CHAIN_ID,
              chainName: 'Binance Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: [BSC_RPC_URL],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
          await new Promise(r => setTimeout(r, 2000));
        } else {
          throw switchError;
        }
      }
      
      // Re-verify after switch
      currentChainId = await ethereum.request({ method: 'eth_chainId' });
      isBSC = currentChainId && (currentChainId.toLowerCase() === BSC_CHAIN_ID || parseInt(currentChainId, 16) === 56);
      if (!isBSC) {
        throw new Error("Network switch rejected by user or wallet.");
      }
    }
    
    // 3. Create fresh provider and signer after possible network change
    const provider = new BrowserProvider(ethereum, "any");
    const signer = await provider.getSigner();
    
    // Double check network on the final signer's provider
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
      console.warn("Final network check failed. Chain ID:", network.chainId);
      // We still return it but the UI should handle the discrepancy if needed
    }
    
    return signer;
  } catch (error: any) {
    console.error('Wallet connection sequence failed:', error);
    throw error;
  }
};
