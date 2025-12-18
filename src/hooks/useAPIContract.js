/**
 * useAPIContract
 * Calls a read-only contract function via ethers.js.
 * Drop-in replacement for the react-moralis useMoralisWeb3ApiCall version.
 *
 * options shape:
 *   { address, functionName, abi, params }
 */
import { useCallback, useState } from 'react';
import { ethers } from 'ethers';

export const useAPIContract = (options) => {
  const [contractResponse, setContractResponse] = useState(null);
  const [error, setError]                       = useState(null);
  const [isLoading, setIsLoading]               = useState(false);

  const runContractFunction = useCallback(
    async (overrides) => {
      const opts = overrides || options;
      if (!opts?.address || !opts?.functionName || !opts?.abi) return;

      setIsLoading(true);
      setError(null);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(opts.address, opts.abi, provider);
        const args     = opts.params ? Object.values(opts.params) : [];
        const result   = await contract[opts.functionName](...args);
        setContractResponse(result);
        return result;
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [options], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { runContractFunction, contractResponse, error, isLoading };
};
