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
  const provider = getProvider();
  if (!provider) {
    throw new Error('Please install MetaMask or Trust Wallet.');
  }

  try {
    // Request accounts
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    
    // Check network
    const network = await provider.getNetwork();
    if (network.chainId !== 56n) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID }],
        });
        // Give it a moment to finalize the switch
        await new Promise(r => setTimeout(r, 1500));
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BSC_CHAIN_ID,
              chainName: 'Binance Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: [BSC_RPC_URL],
              blockExplorerUrls: ['https://bscscan.com/'],
            }],
          });
          await new Promise(r => setTimeout(r, 1500));
        } else {
          throw switchError;
        }
      }
    }
    
    // Force a fresh signer fetch from the underlying injected provider
    cachedSigner = await provider.getSigner();
    return cachedSigner;
  } catch (error) {
    console.error('Handshake error:', error);
    return null;
  }
};
