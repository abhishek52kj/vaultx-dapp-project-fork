/**
 * WalletConnector.jsx
 * 
 * FIX: WalletConnect v1 bridge was shut down in June 2023.
 * The old @web3-react/walletconnect-connector now throws a critical error.
 * 
 * Solution: Use only InjectedConnector (MetaMask / any EIP-1193 browser wallet).
 * For WalletConnect v2, install @web3-react/walletconnect-v2 separately.
 */

import { useState } from 'react';
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';

const injected = new InjectedConnector({ supportedChainIds: [1, 56] });

async function switchToChain(chainId) {
  const provider = window.ethereum;
  if (!provider) return false;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch { return false; }
}

export function getConnectorError(error) {
  if (error instanceof NoEthereumProviderError)
    return 'No wallet detected. Please install MetaMask or a compatible browser wallet.';
  if (error instanceof UnsupportedChainIdError)
    return 'Unsupported network. Please switch to Ethereum Mainnet or BNB Chain.';
  if (error instanceof UserRejectedRequestErrorInjected)
    return 'Request rejected. Please approve the connection in your wallet.';
  return error?.message ?? 'An unknown error occurred.';
}

export function useWalletConnector() {
  const { activate, deactivate } = useWeb3React();
  const [connError, setConnError] = useState(null);

  const loginMetamask = async () => {
    setConnError(null);
    activate(injected, async (err) => {
      if (err instanceof UnsupportedChainIdError) {
        const switched = await switchToChain(1);
        if (switched) activate(injected);
        else setConnError(getConnectorError(err));
      } else {
        setConnError(getConnectorError(err));
      }
    });
  };

  const loginWalletConnect = () => {
    setConnError('WalletConnect v1 was shut down in June 2023. WalletConnect v2 support coming soon.');
  };

  const loginBSC = loginMetamask;

  const logoutWalletConnector = () => {
    try { deactivate(); } catch {}
    localStorage.removeItem('connected');
    localStorage.removeItem('wallet');
    return true;
  };

  return { loginMetamask, loginWalletConnect, loginBSC, logoutWalletConnector, connError };
}

export function setNet() {}
export default useWalletConnector;
