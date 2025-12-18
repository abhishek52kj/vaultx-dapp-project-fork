/**
 * useNativeTransactions
 * Fetches native-currency transaction history for the connected wallet
 * via the Etherscan-compatible block-explorer API.
 */
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { useCallback, useEffect, useState } from 'react';

const EXPLORER_API_KEY = import.meta.env.VITE_EXPLORER_API_KEY || '';

const getApiBase = (chainId) => {
  const explorers = {
    '0x1':     'https://api.etherscan.io/api',
    '0x5':     'https://api-goerli.etherscan.io/api',
    '0xaa36a7':'https://api-sepolia.etherscan.io/api',
    '0x38':    'https://api.bscscan.com/api',
    '0x61':    'https://api-testnet.bscscan.com/api',
    '0x89':    'https://api.polygonscan.com/api',
    '0x13881': 'https://api-testnet.polygonscan.com/api',
  };
  return explorers[chainId] || null;
};

const useNativeTransactions = (options) => {
  const { chainId, walletAddress } = useMoralisDapp();
  const [nativeTransactions, setNativeTransactions] = useState([]);
  const [error, setError]                           = useState(null);
  const [isLoading, setIsLoading]                   = useState(false);

  const getNativeTransations = useCallback(async () => {
    if (!walletAddress || !chainId) return;

    const apiBase = getApiBase(chainId);
    if (!apiBase) {
      console.warn(`useNativeTransactions: no explorer API configured for chain ${chainId}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url =
        `${apiBase}?module=account&action=txlist` +
        `&address=${walletAddress}&startblock=0&endblock=99999999` +
        `&sort=desc&apikey=${EXPLORER_API_KEY}`;

      const res  = await fetch(url);
      const json = await res.json();

      if (json.status !== '1') { setNativeTransactions([]); return; }
      setNativeTransactions(json.result);
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, chainId, options]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { getNativeTransations(); }, [getNativeTransations]);

  return { getNativeTransations, nativeTransactions, chainId, error, isLoading };
};

export default useNativeTransactions;
