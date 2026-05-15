import { BrowserProvider, JsonRpcSigner } from 'ethers';

export const BSC_CHAIN_ID = '0x38'; // 56 in hex
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

export const getProvider = () => {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return null;
};

export const connectWallet = async (): Promise<JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask or Trust Wallet not detected');
  }

  try {
    await provider.send('eth_requestAccounts', []);
    
    // Switch to BSC first
    try {
      const network = await provider.getNetwork();
      if (network.chainId !== 56n) {
        await provider.send('wallet_switchEthereumChain', [{ chainId: BSC_CHAIN_ID }]);
        // Delay to allow provider to update internal state
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [{
            chainId: BSC_CHAIN_ID,
            chainName: 'Binance Smart Chain',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: [BSC_RPC_URL],
            blockExplorerUrls: ['https://bscscan.com/'],
          }]);
          await new Promise(r => setTimeout(r, 1000));
        } catch (addError) {
          console.error('Failed to add BSC chain:', addError);
          throw new Error('Please manually add Binance Smart Chain to your wallet settings.');
        }
      } else {
        throw switchError;
      }
    }
    
    // Refresh provider and signer after network changes
    const finalProvider = new BrowserProvider((window as any).ethereum);
    return await finalProvider.getSigner();
  } catch (error) {
    console.error('Connection error:', error);
    return null;
  }
};
