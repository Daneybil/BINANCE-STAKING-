import { BrowserProvider, JsonRpcSigner } from 'ethers';

export const BSC_CHAIN_ID = '0x38'; // 56 in hex
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

let cachedProvider: BrowserProvider | null = null;
let cachedSigner: JsonRpcSigner | null = null;

export const disconnectWallet = () => {
  cachedProvider = null;
  cachedSigner = null;
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    // Note: EIP-1193 doesn't have a standard "disconnect" method for the provider itself
    // but clearing our local state is the standard way to handle sessions.
  }
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    if (!cachedProvider) {
      cachedProvider = new BrowserProvider((window as any).ethereum, 56);
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
    let chainIdHex = await ethereum.request({ method: 'eth_chainId' });
    
    // Check if we need to switch (BNB Smart Chain is 0x38 or 56)
    if (chainIdHex?.toLowerCase() !== BSC_CHAIN_ID.toLowerCase()) {
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
        if (switchError.code === 4902 || switchError.code === -32603) {
          try {
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
          } catch (addError) {
             console.error("Critical: Could not add BSC network.", addError);
          }
        } else {
          throw switchError;
        }
      }
      
      // Re-verify after switch attempt
      const verifiedChainId = await ethereum.request({ method: 'eth_chainId' });
      if (!verifiedChainId || verifiedChainId.toLowerCase() !== BSC_CHAIN_ID.toLowerCase()) {
        throw new Error("Action Denied: You must switch to Binance Smart Chain to use this platform.");
      }
    }
    
    // 3. Final Signer Setup - Force fresh provider for chain 56
    const provider = new BrowserProvider(ethereum, 56);
    const signer = await provider.getSigner();
    
    // Final hard verification
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
      throw new Error(`Connection Blocked: Detected Chain ID ${network.chainId}. This platform only supports BSC (Chain 56).`);
    }
    
    cachedSigner = signer;
    return signer;
  } catch (error: any) {
    console.error('Wallet connection sequence failed:', error);
    throw error;
  }
};
