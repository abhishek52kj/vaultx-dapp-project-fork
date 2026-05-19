import { useCallback, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { CONTRACT_ADDRESS } from '../helpers/ContractAddress';

const ZERO = ethers.BigNumber.from(0);

const RENTAL_YIELD_ABI = [
  'function unclaimedYield(uint256 tokenId) view returns (uint256)',
  'function claimYield(uint256[] tokenIds)',
];

const ERC721_OWNER_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
];

const toBigNumber = (value) => {
  if (ethers.BigNumber.isBigNumber(value)) return value;
  if (value == null) return ZERO;
  return ethers.BigNumber.from(value);
};

const extractContractError = (error) =>
  error?.error?.message ||
  error?.data?.message ||
  error?.reason ||
  error?.message ||
  'Transaction failed. Please try again.';

const emptyBatchRow = () => ({
  value: ZERO,
  status: 'unavailable',
});

export default function useRentalYield() {
  const { account, library, chainId } = useWeb3React();
  const rentalYieldAddress = CONTRACT_ADDRESS.RENTAL_YIELD_ADDRESS;
  const nftAddress = CONTRACT_ADDRESS.ERC_721;
  const rpcUrl = import.meta.env.VITE_RPC_URL;
  const configuredChainId = Number(import.meta.env.VITE_CHAIN_ID || 0);

  const [pendingTokenId, setPendingTokenId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const configuredReadProvider = useMemo(
    () => (rpcUrl ? new ethers.providers.JsonRpcProvider(rpcUrl) : null),
    [rpcUrl]
  );

  const readProvider = useMemo(
    () => configuredReadProvider || library || null,
    [configuredReadProvider, library]
  );

  const hasAddresses = Boolean(rentalYieldAddress && nftAddress);
  const hasWallet = Boolean(account && library);
  const walletNetworkMismatch = Boolean(
    hasWallet && configuredChainId && chainId && Number(chainId) !== configuredChainId
  );

  const getRentalContract = useCallback(
    (signerOrProvider = readProvider) => {
      if (!rentalYieldAddress) throw new Error('Rental-yield contract address is not configured.');
      if (!signerOrProvider) throw new Error('Connect a wallet or configure VITE_RPC_URL.');
      return new ethers.Contract(rentalYieldAddress, RENTAL_YIELD_ABI, signerOrProvider);
    },
    [readProvider, rentalYieldAddress]
  );

  const getNftContract = useCallback(
    (signerOrProvider = readProvider) => {
      if (!nftAddress) throw new Error('NFT contract address is not configured.');
      if (!signerOrProvider) throw new Error('Connect a wallet or configure VITE_RPC_URL.');
      return new ethers.Contract(nftAddress, ERC721_OWNER_ABI, signerOrProvider);
    },
    [nftAddress, readProvider]
  );

  const formatEthAmount = useCallback((value, maximumFractionDigits = 5) => {
    const numeric = Number(ethers.utils.formatEther(toBigNumber(value)));
    return numeric.toLocaleString('en-US', {
      maximumFractionDigits,
    });
  }, []);

  const fetchYieldBatch = useCallback(
    async (tokenIds) => {
      if (!tokenIds?.length) return {};

      if (!readProvider || !rentalYieldAddress) {
        return tokenIds.reduce((acc, tokenId) => ({ ...acc, [tokenId]: emptyBatchRow() }), {});
      }

      const rentalContract = getRentalContract(readProvider);
      const results = await Promise.allSettled(
        tokenIds.map((tokenId) => rentalContract.unclaimedYield(tokenId))
      );

      return tokenIds.reduce((acc, tokenId, index) => {
        const result = results[index];
        acc[tokenId] = result.status === 'fulfilled'
          ? { value: toBigNumber(result.value), status: 'ready' }
          : emptyBatchRow();
        return acc;
      }, {});
    },
    [getRentalContract, readProvider, rentalYieldAddress]
  );

  const fetchOwnershipBatch = useCallback(
    async (tokenIds) => {
      if (!tokenIds?.length) return {};

      if (!account || !readProvider || !nftAddress) {
        return tokenIds.reduce(
          (acc, tokenId) => ({ ...acc, [tokenId]: { owned: false, status: 'unavailable' } }),
          {}
        );
      }

      const nftContract = getNftContract(readProvider);
      const results = await Promise.allSettled(tokenIds.map((tokenId) => nftContract.ownerOf(tokenId)));
      const normalizedAccount = account.toLowerCase();

      return tokenIds.reduce((acc, tokenId, index) => {
        const result = results[index];
        acc[tokenId] = result.status === 'fulfilled'
          ? {
              owned: String(result.value).toLowerCase() === normalizedAccount,
              status: 'ready',
            }
          : { owned: false, status: 'unavailable' };
        return acc;
      }, {});
    },
    [account, getNftContract, nftAddress, readProvider]
  );

  const fetchNftSupply = useCallback(async () => {
    if (!readProvider || !nftAddress) return null;
    const nftContract = getNftContract(readProvider);
    const supply = await nftContract.totalSupply();
    return supply.toNumber();
  }, [getNftContract, nftAddress, readProvider]);

  const claimYield = useCallback(
    async (tokenId) => {
      if (!hasWallet) {
        setError('Connect a wallet before claiming rental yield.');
        return null;
      }
      if (!rentalYieldAddress) {
        setError('Rental-yield contract address is not configured.');
        return null;
      }
      if (walletNetworkMismatch) {
        setError(`Switch MetaMask to chain ${configuredChainId} before claiming yield.`);
        return null;
      }

      setPendingTokenId(tokenId);
      setError('');
      setSuccess('');

      try {
        const signer = library.getSigner();
        const rentalContract = getRentalContract(signer).connect(signer);
        const tx = await rentalContract.claimYield([tokenId]);
        const receipt = await tx.wait();
        setSuccess(`Claim yield confirmed: ${receipt.transactionHash}`);
        return receipt;
      } catch (caught) {
        setError(extractContractError(caught));
        return null;
      } finally {
        setPendingTokenId(null);
      }
    },
    [
      configuredChainId,
      getRentalContract,
      hasWallet,
      library,
      rentalYieldAddress,
      walletNetworkMismatch,
    ]
  );

  return {
    account,
    pendingTokenId,
    error,
    success,
    hasWallet,
    hasAddresses,
    rentalYieldAddress,
    nftAddress,
    walletNetworkMismatch,
    fetchYieldBatch,
    fetchOwnershipBatch,
    fetchNftSupply,
    claimYield,
    formatEthAmount,
    clearError: () => setError(''),
    clearSuccess: () => setSuccess(''),
  };
}
