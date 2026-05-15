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
    await ethereum.request({ method: 'eth_requestAccounts' });
    
    // 2. Check and Switch Network
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    if (chainId !== BSC_CHAIN_ID) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
        // Give time for the provider state to stabilize
        await new Promise(r => setTimeout(r, 1000));
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
          await new Promise(r => setTimeout(r, 1000));
        } else {
          throw switchError;
        }
      }
    }
    
    // 3. Create fresh provider and signer after possible network change
    // Using a new provider instance ensures we don't have stale cached network data
    const provider = new BrowserProvider(ethereum, "any");
    return await provider.getSigner();
  } catch (error) {
    console.error('Wallet connection sequence failed:', error);
    throw error;
  }
};
