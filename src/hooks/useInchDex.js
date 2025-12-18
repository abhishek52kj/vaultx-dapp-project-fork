/**
 * useInchDex
 * Wraps the 1inch Swap API v5.2 directly — no Moralis plugin required.
 * Docs: https://docs.1inch.io/docs/aggregation-protocol/api/swagger
 */
import { useCallback, useEffect, useState } from 'react';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { ethers } from 'ethers';

/** Map hex chainId → 1inch numeric chain id */
const INCH_CHAIN = {
  '0x1':  1,    // Ethereum
  '0x38': 56,   // BSC
  '0x89': 137,  // Polygon
};

const BASE_URL = (chainId) => `https://api.1inch.dev/swap/v5.2/${INCH_CHAIN[chainId]}`;

const INCH_API_KEY = import.meta.env.VITE_ONEINCH_API_KEY || '';

const headers = () => ({
  'Content-Type': 'application/json',
  ...(INCH_API_KEY ? { Authorization: `Bearer ${INCH_API_KEY}` } : {}),
});

const useInchDex = (chain) => {
  const { walletAddress, chainId: ctxChainId } = useMoralisDapp();
  const chainId  = chain || ctxChainId;
  const [tokenList, setTokenlist] = useState(null);

  // Load supported tokens for this chain
  useEffect(() => {
    if (!INCH_CHAIN[chainId]) return;
    fetch(`${BASE_URL(chainId)}/tokens`, { headers: headers() })
      .then((r) => r.json())
      .then((json) => setTokenlist(json.tokens ?? null))
      .catch((e) => console.error('useInchDex/tokens error:', e));
  }, [chainId]);

  const getQuote = useCallback(
    async (params) => {
      const amount = ethers.utils
        .parseUnits(String(params.fromAmount), params.fromToken.decimals)
        .toString();

      const url =
        `${BASE_URL(params.chain || chainId)}/quote` +
        `?fromTokenAddress=${params.fromToken.address}` +
        `&toTokenAddress=${params.toToken.address}` +
        `&amount=${amount}`;

      const res  = await fetch(url, { headers: headers() });
      return res.json();
    },
    [chainId],
  );

  const trySwap = useCallback(
    async (params) => {
      if (!walletAddress) throw new Error('Wallet not connected');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer   = provider.getSigner();
      const { fromToken, fromAmount, chain: paramChain } = params;
      const activeChain = paramChain || chainId;

      const amount = ethers.utils
        .parseUnits(String(fromAmount), fromToken.decimals)
        .toString();

      // Approve if not native
      if (fromToken.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        const approveAbi = ['function approve(address spender, uint256 amount) returns (bool)'];
        const tokenContract = new ethers.Contract(fromToken.address, approveAbi, signer);

        const spenderRes  = await fetch(
          `${BASE_URL(activeChain)}/approve/spender`,
          { headers: headers() },
        );
        const { address: spender } = await spenderRes.json();
        const approveTx = await tokenContract.approve(spender, amount);
        await approveTx.wait();
      }

      // Build swap tx
      const swapUrl =
        `${BASE_URL(activeChain)}/swap` +
        `?fromTokenAddress=${fromToken.address}` +
        `&toTokenAddress=${params.toToken.address}` +
        `&amount=${amount}` +
        `&fromAddress=${walletAddress}` +
        `&slippage=1`;

      const swapRes  = await fetch(swapUrl, { headers: headers() });
      const swapData = await swapRes.json();
      if (swapData.statusCode === 400) throw new Error(swapData.description);

      const tx = await signer.sendTransaction({
        to:    swapData.tx.to,
        data:  swapData.tx.data,
        value: ethers.BigNumber.from(swapData.tx.value),
      });
      const receipt = await tx.wait();
      alert('Swap complete ✅');
      return receipt;
    },
    [walletAddress, chainId],
  );

  return { getQuote, trySwap, tokenList };
};

export default useInchDex;
