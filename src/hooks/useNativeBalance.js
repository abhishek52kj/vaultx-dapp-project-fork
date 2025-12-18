import { getNativeByChain } from 'helpers/networks';
import { useMoralisDapp } from 'providers/MoralisDappProvider/MoralisDappProvider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

export const useNativeBalance = (options) => {
  const { chainId, walletAddress } = useMoralisDapp();
  const [balance, setBalance] = useState({ inWei: '0', formatted: '0' });
  const [error, setError]     = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nativeName = useMemo(
    () => getNativeByChain(options?.chain || chainId),
    [options, chainId],
  );

  const getBalance = useCallback(async () => {
    if (!walletAddress || !window.ethereum) return;
    setIsLoading(true);
    setError(null);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const raw = await provider.getBalance(walletAddress);
      setBalance({
        inWei: raw.toString(),
        formatted: parseFloat(ethers.utils.formatEther(raw)).toFixed(4),
      });
    } catch (e) {
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, chainId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { getBalance(); }, [getBalance]);

  return { getBalance, balance, nativeName, error, isLoading };
};
