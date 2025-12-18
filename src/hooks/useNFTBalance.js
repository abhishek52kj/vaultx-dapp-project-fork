/**
 * useNFTBalance
 * Fetches ERC-721 NFTs held by the connected wallet via the block-explorer API.
 * Parses on-chain tokenURI metadata and resolves IPFS links.
 */
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useIPFS } from './useIPFS';

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

const ERC721_ABI = [
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
];

export const useNFTBalance = (options) => {
  const { chainId, walletAddress } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTBalance, setNFTBalance] = useState([]);
  const [error, setError]           = useState(null);
  const [isLoading, setIsLoading]   = useState(false);

  const getNFTBalance = useCallback(async () => {
    if (!walletAddress || !chainId) return;

    const apiBase = getApiBase(options?.chain || chainId);
    if (!apiBase) {
      console.warn(`useNFTBalance: no explorer API configured for chain ${chainId}`);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url =
        `${apiBase}?module=account&action=tokennfttx` +
        `&address=${walletAddress}&startblock=0&endblock=99999999` +
        `&sort=desc&apikey=${EXPLORER_API_KEY}`;

      const res  = await fetch(url);
      const json = await res.json();
      if (json.status !== '1') { setNFTBalance([]); return; }

      // Determine currently held tokens (last transfer per tokenId where to === wallet)
      const held = new Map();
      for (const tx of json.result) {
        const key = `${tx.contractAddress}-${tx.tokenID}`;
        if (!held.has(key)) held.set(key, tx);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const settled = await Promise.allSettled(
        [...held.values()]
          .filter((tx) => tx.to.toLowerCase() === walletAddress.toLowerCase())
          .slice(0, 50) // cap at 50 to avoid RPC flooding
          .map(async (tx) => {
            const contract = new ethers.Contract(tx.contractAddress, ERC721_ABI, provider);
            let metadata = null;
            let image    = null;
            try {
              const uri = await contract.tokenURI(tx.tokenID);
              const resolved = resolveLink(uri);
              const metaRes  = await fetch(resolved);
              metadata       = await metaRes.json();
              image          = resolveLink(metadata?.image);
            } catch { /* tokenURI optional */ }
            return {
              token_address: tx.contractAddress,
              token_id: tx.tokenID,
              name: tx.tokenName,
              symbol: tx.tokenSymbol,
              metadata,
              image,
            };
          }),
      );

      setNFTBalance(settled.filter((r) => r.status === 'fulfilled').map((r) => r.value));
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, chainId, options?.chain]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { getNFTBalance(); }, [getNFTBalance]);

  return { getNFTBalance, NFTBalance, error, isLoading };
};
