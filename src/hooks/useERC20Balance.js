/**
 * useERC20Balance
 * Fetches ERC-20 token balances for the connected wallet via the block-explorer
 * API (Etherscan-compatible).  Set VITE_EXPLORER_API_KEY in .env for higher
 * rate limits; the hook works without a key but may be throttled.
 */
import { useCallback, useEffect, useState } from 'react';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { networkConfigs } from 'helpers/networks';
import { ethers } from 'ethers';

const EXPLORER_API_KEY = import.meta.env.VITE_EXPLORER_API_KEY || '';

/** Return the Etherscan-compatible API base URL for a given chainId hex string */
const getApiBase = (chainId) => {
  const explorers = {
    '0x1':    'https://api.etherscan.io/api',
    '0x5':    'https://api-goerli.etherscan.io/api',
    '0xaa36a7': 'https://api-sepolia.etherscan.io/api',
    '0x38':   'https://api.bscscan.com/api',
    '0x61':   'https://api-testnet.bscscan.com/api',
    '0x89':   'https://api.polygonscan.com/api',
    '0x13881':'https://api-testnet.polygonscan.com/api',
  };
  return explorers[chainId] || null;
};

export const useERC20Balance = (params) => {
  const { walletAddress, chainId } = useMoralisDapp();
  const [assets, setAssets] = useState([]);

  const fetchERC20Balance = useCallback(async () => {
    const targetChain = params?.chain || chainId;
    if (!walletAddress || !targetChain) return [];

    const apiBase = getApiBase(targetChain);
    if (!apiBase) {
      console.warn(`useERC20Balance: no explorer API configured for chain ${targetChain}`);
      return [];
    }

    try {
      const url =
        `${apiBase}?module=account&action=tokentx` +
        `&address=${walletAddress}&startblock=0&endblock=99999999` +
        `&sort=asc&apikey=${EXPLORER_API_KEY}`;

      const res  = await fetch(url);
      const json = await res.json();

      if (json.status !== '1') return [];

      // Deduplicate by contract address and fetch current balance via RPC
      const seen     = new Set();
      const unique   = json.result.filter((tx) => {
        if (seen.has(tx.contractAddress)) return false;
        seen.add(tx.contractAddress);
        return true;
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const erc20Abi = ['function balanceOf(address) view returns (uint256)',
                        'function decimals() view returns (uint8)',
                        'function symbol() view returns (string)',
                        'function name() view returns (string)'];

      const settled = await Promise.allSettled(
        unique.map(async (token) => {
          const contract = new ethers.Contract(token.contractAddress, erc20Abi, provider);
          const [balance, decimals, symbol, name] = await Promise.all([
            contract.balanceOf(walletAddress),
            contract.decimals().catch(() => 18),
            contract.symbol().catch(() => token.tokenSymbol),
            contract.name().catch(() => token.tokenName),
          ]);
          return { token_address: token.contractAddress, symbol, name, decimals, balance: balance.toString() };
        }),
      );

      const balances = settled
        .filter((r) => r.status === 'fulfilled' && r.value.balance !== '0')
        .map((r) => r.value);

      setAssets(balances);
      return balances;
    } catch (e) {
      console.error('useERC20Balance error:', e);
      return [];
    }
  }, [walletAddress, chainId, params?.chain]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchERC20Balance(); }, [fetchERC20Balance]);

  return { fetchERC20Balance, assets };
};
