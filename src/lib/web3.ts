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
    
    // 2. Network Check & Auto-Switch
    // Force a fresh chainId check from the provider
    let chainIdHex = await ethereum.request({ method: 'eth_chainId' });
    chainIdHex = chainIdHex ? chainIdHex.toLowerCase() : '';
    
    if (chainIdHex !== BSC_CHAIN_ID.toLowerCase()) {
      console.log("Network mismatch. Current:", chainIdHex, "Target:", BSC_CHAIN_ID);
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
        // Important: wait for the wallet to actually process the switch before verifying
        await new Promise(r => setTimeout(r, 2000));
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
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
      
      // Re-verify after switch attempt
      const verifiedChainId = await ethereum.request({ method: 'eth_chainId' });
      if (!verifiedChainId || verifiedChainId.toLowerCase() !== BSC_CHAIN_ID.toLowerCase()) {
        throw new Error("Automatic network switch failed. Please manually select Binance Smart Chain in your wallet.");
      }
    }
    
    // 3. Final Signer Setup
    const provider = new BrowserProvider(ethereum, "any");
    const signer = await provider.getSigner();
    
    // Ensure we are actually on 56 (BNB Smart Chain)
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
      throw new Error(`Critical Network Failure: Connected to Chain ID ${network.chainId} instead of BSC (56).`);
    }
    
    return signer;
  } catch (error: any) {
    console.error('Wallet connection sequence failed:', error);
    throw error;
  }
};
