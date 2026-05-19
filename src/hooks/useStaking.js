import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { CONTRACT_ADDRESS } from '../helpers/ContractAddress';

const ZERO = ethers.BigNumber.from(0);
const POOL_IDS = [0, 1, 2];
const DEFAULT_DECIMALS = 18;
const DEFAULT_FROM_BLOCK_SPAN = 50000;

const POOL_META = [
  { id: 0, name: '7-Day Lock' },
  { id: 1, name: '30-Day Lock' },
  { id: 2, name: '90-Day Lock' },
];

const STAKING_ABI = [
  'function getPoolInfo(uint256 poolId) view returns (uint256 totalStaked, uint256 rewardReserve, uint256 apy, uint256 lockPeriod, uint256 penaltyBps, bool active)',
  'function getStakerInfo(uint256 poolId, address wallet) view returns (uint256 stakedAmount, uint256 rewardDebt, uint256 lockExpiresAt, uint256 lastStakeTime)',
  'function pendingRewards(uint256 poolId, address wallet) view returns (uint256)',
  'function stake(uint256 poolId, uint256 amount)',
  'function unstake(uint256 poolId, uint256 amount)',
  'function claimRewards(uint256 poolId)',
  'event Staked(address indexed user, uint256 indexed poolId, uint256 amount)',
  'event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 penalty)',
  'event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount)',
];

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

const emptyPool = (id) => ({
  id,
  name: POOL_META[id]?.name || `Pool ${id + 1}`,
  totalStaked: ZERO,
  rewardReserve: ZERO,
  apy: 0,
  lockPeriod: 0,
  penaltyBps: 0,
  active: false,
});

const emptyStakerInfo = {
  stakedAmount: ZERO,
  rewardDebt: ZERO,
  lockExpiresAt: 0,
  lastStakeTime: 0,
};

const toNumber = (value, fallback = 0) => {
  if (value == null) return fallback;
  if (ethers.BigNumber.isBigNumber(value)) return value.toNumber();
  return Number(value);
};

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

const explorerBaseUrl = (chainId) => {
  if (chainId === 56) return 'https://bscscan.com/tx/';
  if (chainId === 97) return 'https://testnet.bscscan.com/tx/';
  if (chainId === 11155111) return 'https://sepolia.etherscan.io/tx/';
  if ([1337, 31337, 5777].includes(Number(chainId))) return '';
  return 'https://etherscan.io/tx/';
};

export default function useStaking(activePoolId = 0) {
  const { account, library, chainId } = useWeb3React();
  const stakingAddress = CONTRACT_ADDRESS.STAKING_ADDRESS;
  const tokenAddress = CONTRACT_ADDRESS.ERC_20;
  const rpcUrl = import.meta.env.VITE_RPC_URL;
  const configuredChainId = Number(import.meta.env.VITE_CHAIN_ID || 0);

  const [pools, setPools] = useState(POOL_IDS.map(emptyPool));
  const [stakerInfo, setStakerInfo] = useState(emptyStakerInfo);
  const [pendingRewards, setPendingRewards] = useState(ZERO);
  const [vtxBalance, setVtxBalance] = useState(ZERO);
  const [allowance, setAllowance] = useState(ZERO);
  const [tokenDecimals, setTokenDecimals] = useState(DEFAULT_DECIMALS);
  const [tokenSymbol, setTokenSymbol] = useState('VTX');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
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

  const hasAddresses = Boolean(stakingAddress && tokenAddress);
  const hasWallet = Boolean(account && library);
  const walletNetworkMismatch = Boolean(
    hasWallet && configuredChainId && chainId && Number(chainId) !== configuredChainId
  );

  const getStakingContract = useCallback(
    (signerOrProvider = readProvider) => {
      if (!stakingAddress) throw new Error('Staking contract address is not configured.');
      if (!signerOrProvider) throw new Error('Connect a wallet or configure VITE_RPC_URL.');
      return new ethers.Contract(stakingAddress, STAKING_ABI, signerOrProvider);
    },
    [readProvider, stakingAddress]
  );

  const getTokenContract = useCallback(
    (signerOrProvider = readProvider) => {
      if (!tokenAddress) throw new Error('VTX token address is not configured.');
      if (!signerOrProvider) throw new Error('Connect a wallet or configure VITE_RPC_URL.');
      return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
    },
    [readProvider, tokenAddress]
  );

  const formatTokenAmount = useCallback(
    (value, maximumFractionDigits = 4) => {
      const formatted = ethers.utils.formatUnits(toBigNumber(value), tokenDecimals);
      return Number(formatted).toLocaleString('en-US', {
        maximumFractionDigits,
      });
    },
    [tokenDecimals]
  );

  const parseTokenAmount = useCallback(
    (value) => ethers.utils.parseUnits(String(value || '0'), tokenDecimals),
    [tokenDecimals]
  );

  const normalizePool = useCallback((poolId, raw) => {
    const meta = POOL_META[poolId] || { id: poolId, name: `Pool ${poolId + 1}` };
    return {
      id: poolId,
      name: meta.name,
      totalStaked: toBigNumber(raw.totalStaked ?? raw[0]),
      rewardReserve: toBigNumber(raw.rewardReserve ?? raw[1]),
      apy: toNumber(raw.apy ?? raw[2]),
      lockPeriod: toNumber(raw.lockPeriod ?? raw[3]),
      penaltyBps: toNumber(raw.penaltyBps ?? raw[4]),
      active: raw.active ?? raw[5] ?? true,
    };
  }, []);

  const normalizeStakerInfo = useCallback((raw) => ({
    stakedAmount: toBigNumber(raw.stakedAmount ?? raw[0]),
    rewardDebt: toBigNumber(raw.rewardDebt ?? raw[1]),
    lockExpiresAt: toNumber(raw.lockExpiresAt ?? raw[2]),
    lastStakeTime: toNumber(raw.lastStakeTime ?? raw[3]),
  }), []);

  const getPoolInfo = useCallback(
    async (poolId) => {
      const contract = getStakingContract();
      const raw = await contract.getPoolInfo(poolId);
      return normalizePool(poolId, raw);
    },
    [getStakingContract, normalizePool]
  );

  const getStakerInfo = useCallback(
    async (poolId = activePoolId) => {
      if (!account) return emptyStakerInfo;
      const contract = getStakingContract();
      const raw = await contract.getStakerInfo(poolId, account);
      return normalizeStakerInfo(raw);
    },
    [account, activePoolId, getStakingContract, normalizeStakerInfo]
  );

  const fetchPendingRewards = useCallback(
    async (poolId = activePoolId) => {
      if (!account) return ZERO;
      const contract = getStakingContract();
      return toBigNumber(await contract.pendingRewards(poolId, account));
    },
    [account, activePoolId, getStakingContract]
  );

  const refetchHistory = useCallback(async () => {
    if (!account || !readProvider || !stakingAddress) {
      setHistory([]);
      return;
    }

    setIsHistoryLoading(true);
    try {
      const contract = getStakingContract(readProvider);
      const latestBlock = await readProvider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - DEFAULT_FROM_BLOCK_SPAN, 0);
      const filters = [
        { type: 'Staked', filter: contract.filters.Staked(account, null) },
        { type: 'Unstaked', filter: contract.filters.Unstaked(account, null) },
        { type: 'RewardsClaimed', filter: contract.filters.RewardsClaimed(account, null) },
      ];

      const results = await Promise.allSettled(
        filters.map(({ filter }) => contract.queryFilter(filter, fromBlock, latestBlock))
      );

      const logs = results.flatMap((result, index) =>
        result.status === 'fulfilled'
          ? result.value.map((event) => ({ ...event, type: filters[index].type }))
          : []
      );

      const sorted = logs
        .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
        .slice(0, 20);

      const blockCache = new Map();
      const rows = await Promise.all(
        sorted.map(async (event) => {
          if (!blockCache.has(event.blockNumber)) {
            blockCache.set(event.blockNumber, readProvider.getBlock(event.blockNumber));
          }
          const block = await blockCache.get(event.blockNumber);
          const poolId = toNumber(event.args?.poolId ?? event.args?.[1]);
          const amount = toBigNumber(event.args?.amount ?? event.args?.[2]);
          const explorerUrl = explorerBaseUrl(chainId);
          return {
            type: event.type,
            poolId,
            poolName: POOL_META[poolId]?.name || `Pool ${poolId + 1}`,
            amount,
            timestamp: block.timestamp,
            hash: event.transactionHash,
            explorerUrl: explorerUrl ? `${explorerUrl}${event.transactionHash}` : '',
          };
        })
      );

      setHistory(rows);
    } catch (caught) {
      setError(extractContractError(caught));
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [account, chainId, getStakingContract, readProvider, stakingAddress]);

  const refetch = useCallback(async () => {
    if (!hasAddresses || !readProvider) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const tokenContract = getTokenContract();
      const [decimals, symbol, nextPools] = await Promise.all([
        tokenContract.decimals().catch(() => DEFAULT_DECIMALS),
        tokenContract.symbol().catch(() => 'VTX'),
        Promise.all(POOL_IDS.map((poolId) => getPoolInfo(poolId))),
      ]);

      setTokenDecimals(Number(decimals));
      setTokenSymbol(symbol);
      setPools(nextPools);

      if (account) {
        const signerlessToken = getTokenContract(readProvider);
        const [balance, approved, position, rewards] = await Promise.all([
          signerlessToken.balanceOf(account),
          signerlessToken.allowance(account, stakingAddress),
          getStakerInfo(activePoolId),
          fetchPendingRewards(activePoolId),
        ]);
        setVtxBalance(toBigNumber(balance));
        setAllowance(toBigNumber(approved));
        setStakerInfo(position);
        setPendingRewards(rewards);
      } else {
        setVtxBalance(ZERO);
        setAllowance(ZERO);
        setStakerInfo(emptyStakerInfo);
        setPendingRewards(ZERO);
      }
    } catch (caught) {
      setError(extractContractError(caught));
    } finally {
      setIsLoading(false);
    }
  }, [
    account,
    activePoolId,
    fetchPendingRewards,
    getPoolInfo,
    getStakerInfo,
    getTokenContract,
    hasAddresses,
    readProvider,
    stakingAddress,
  ]);

  const runWrite = useCallback(
    async (label, action) => {
      if (!hasWallet) {
        setError('Connect a wallet before submitting a staking transaction.');
        return null;
      }
      if (walletNetworkMismatch) {
        setError(`Switch MetaMask to chain ${configuredChainId} before submitting staking transactions.`);
        return null;
      }
      setPendingAction(label);
      setError('');
      setSuccess('');
      try {
        const signer = library.getSigner();
        const tx = await action(signer);
        const receipt = await tx.wait();
        setSuccess(`${label} confirmed: ${receipt.transactionHash}`);
        await refetch();
        await refetchHistory();
        return receipt;
      } catch (caught) {
        setError(extractContractError(caught));
        return null;
      } finally {
        setPendingAction('');
      }
    },
    [configuredChainId, hasWallet, library, refetch, refetchHistory, walletNetworkMismatch]
  );

  const approve = useCallback(
    async (amount) => {
      const parsed = parseTokenAmount(amount);
      return runWrite('Approval', async (signer) => {
        const tokenContract = getTokenContract(signer).connect(signer);
        return tokenContract.approve(stakingAddress, parsed);
      });
    },
    [getTokenContract, parseTokenAmount, runWrite, stakingAddress]
  );

  const stake = useCallback(
    async (poolId, amount) => {
      const parsed = parseTokenAmount(amount);
      return runWrite('Stake', async (signer) => {
        const tokenContract = getTokenContract(signer).connect(signer);
        const stakingContract = getStakingContract(signer).connect(signer);
        const approved = await tokenContract.allowance(account, stakingAddress);
        if (approved.lt(parsed)) {
          const approvalTx = await tokenContract.approve(stakingAddress, parsed);
          await approvalTx.wait();
        }
        return stakingContract.stake(poolId, parsed);
      });
    },
    [account, getStakingContract, getTokenContract, parseTokenAmount, runWrite, stakingAddress]
  );

  const unstake = useCallback(
    async (poolId, amount) => {
      const parsed = parseTokenAmount(amount);
      return runWrite('Unstake', async (signer) => {
        const stakingContract = getStakingContract(signer).connect(signer);
        return stakingContract.unstake(poolId, parsed);
      });
    },
    [getStakingContract, parseTokenAmount, runWrite]
  );

  const claim = useCallback(
    async (poolId) =>
      runWrite('Claim rewards', async (signer) => {
        const stakingContract = getStakingContract(signer).connect(signer);
        return stakingContract.claimRewards(poolId);
      }),
    [getStakingContract, runWrite]
  );

  const needsApproval = useCallback(
    (amount) => {
      if (!amount || Number(amount) <= 0) return false;
      try {
        return allowance.lt(parseTokenAmount(amount));
      } catch {
        return false;
      }
    },
    [allowance, parseTokenAmount]
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!hasAddresses || !readProvider) return undefined;
    const timer = window.setInterval(refetch, 20000);
    return () => window.clearInterval(timer);
  }, [hasAddresses, readProvider, refetch]);

  useEffect(() => {
    if (!account || !hasAddresses || !readProvider) return undefined;
    const fetchRewards = async () => {
      try {
        setPendingRewards(await fetchPendingRewards(activePoolId));
      } catch (caught) {
        setError(extractContractError(caught));
      }
    };
    fetchRewards();
    const timer = window.setInterval(fetchRewards, 10000);
    return () => window.clearInterval(timer);
  }, [account, activePoolId, fetchPendingRewards, hasAddresses, readProvider]);

  useEffect(() => {
    refetchHistory();
  }, [refetchHistory]);

  return {
    pools,
    stakerInfo,
    pendingRewards,
    vtxBalance,
    isLoading,
    isHistoryLoading,
    history,
    allowance,
    tokenDecimals,
    tokenSymbol,
    pendingAction,
    error,
    success,
    hasWallet,
    hasAddresses,
    configuredChainId,
    walletNetworkMismatch,
    stakingAddress,
    tokenAddress,
    getPoolInfo,
    getStakerInfo,
    pendingRewardsForPool: fetchPendingRewards,
    stake,
    approve,
    unstake,
    claim,
    refetch,
    refetchHistory,
    needsApproval,
    formatTokenAmount,
    parseTokenAmount,
    clearError: () => setError(''),
    clearSuccess: () => setSuccess(''),
  };
}
