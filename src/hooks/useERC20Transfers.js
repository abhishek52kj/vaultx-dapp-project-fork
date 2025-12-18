/**
 * useERC20Transfers
 * Fetches ERC-20 transfer history for the connected wallet via the
 * Etherscan-compatible block-explorer API.
 */
import { useCallback, useEffect, useState } from 'react';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';

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

export const useERC20Transfers = () => {
  const { walletAddress, chainId } = useMoralisDapp();
  const [ERC20Transfers, setERC20Transfers] = useState([]);

  const fetchERC20Transfers = useCallback(async () => {
    if (!walletAddress || !chainId) return [];

    const apiBase = getApiBase(chainId);
    if (!apiBase) {
      console.warn(`useERC20Transfers: no explorer API configured for chain ${chainId}`);
      return [];
    }

    try {
      const url =
        `${apiBase}?module=account&action=tokentx` +
        `&address=${walletAddress}&startblock=0&endblock=99999999` +
        `&sort=desc&apikey=${EXPLORER_API_KEY}`;

      const res  = await fetch(url);
      const json = await res.json();

      if (json.status !== '1') return [];
      setERC20Transfers(json.result);
      return json.result;
    } catch (e) {
      console.error('useERC20Transfers error:', e);
      return [];
    }
  }, [walletAddress, chainId]);

  useEffect(() => { fetchERC20Transfers(); }, [fetchERC20Transfers]);

  return { fetchERC20Transfers, ERC20Transfers, chainId };
};
