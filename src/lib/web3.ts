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
      // Use "any" for network - Ethers 6 handles this and skips aggressive pre-validation
      cachedProvider = new BrowserProvider((window as any).ethereum, "any");
    }
    return cachedProvider;
  }
  return null;
};

const BSC_MAINNET = {
  chainId: "0x38",
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

export async function switchToBSC() {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error("Wallet not detected");
  }
  const ethereum = (window as any).ethereum;

  try {
    // Try switching first
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_MAINNET.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Chain not added
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_MAINNET],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add BSC network:", addError);
        return false;
      }
    }
    console.error("Failed to switch network:", switchError);
    return false;
  }
}

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
    
    // 2. Immediate Network Switch
    const switched = await switchToBSC();
    if (!switched) {
      throw new Error("Action Denied: You must switch to Binance Smart Chain to use this platform.");
    }
    
    // 3. Final Signer Setup - Force fresh provider with "any" to prevent sync hangs
    const provider = new BrowserProvider(ethereum, "any");
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
