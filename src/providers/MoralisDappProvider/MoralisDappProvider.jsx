/**
 * MoralisDappProvider — Moralis-free replacement
 *
 * ROOT CAUSE OF BOTH ERRORS:
 *   1. "Unable to connect to Parse API" — Moralis shut down all v1 self-hosted
 *      Parse servers in 2022. The URL https://gq7x7ofh7pyg.usemoralis.com:2053/server
 *      no longer exists.
 *   2. "TypeError: q is not a function" — When the Parse connection fails on mount,
 *      react-moralis's internal state machine tries to invoke an uninitialized
 *      callback, crashing React's render loop (intermittent because it's race-dependent).
 *
 * FIX: Drop react-moralis entirely. Read wallet address + chainId directly from
 * window.ethereum, which is what the provider was doing anyway via web3.givenProvider.
 * The context shape is identical so all consumers work unchanged.
 */

import React, { useEffect, useState } from 'react';
import MoralisDappContext from './context';

function MoralisDappProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(
    () => window.ethereum?.selectedAddress ?? null
  );
  const [chainId, setChainId] = useState(
    () => window.ethereum?.chainId ?? null
  );

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccounts = (accounts) => setWalletAddress(accounts[0] ?? null);
    const onChain    = (chain)    => setChainId(chain);

    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged',    onChain);

    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts);
      window.ethereum.removeListener('chainChanged',    onChain);
    };
  }, []);

  return (
    <MoralisDappContext.Provider value={{ walletAddress, chainId }}>
      {children}
    </MoralisDappContext.Provider>
  );
}

function useMoralisDapp() {
  const context = React.useContext(MoralisDappContext);
  if (context === undefined) {
    throw new Error('useMoralisDapp must be used within a MoralisDappProvider');
  }
  return context;
}

export { MoralisDappProvider, useMoralisDapp };
