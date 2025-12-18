/**
 * ContractAddress.js
 * All deployed contract addresses are loaded from environment variables so
 * the same build can be pointed at any network without code changes.
 *
 * Copy .env.default → .env and fill in the addresses after running:
 *   npm run deploy
 */
export const CONTRACT_ADDRESS = {
  // VaultX ERC-20 token (VTX)
  ERC_20: import.meta.env.VITE_TOKEN_ADDRESS || '',

  // VaultXPresale contract
  PRESALE_ADDRESS: import.meta.env.VITE_PRESALE_ADDRESS || '',

  // VaultX NFT contract — set when the NFT contract is deployed
  ERC_721: import.meta.env.VITE_NFT_ADDRESS || '',

  // Staking contract — set when the staking contract is deployed
  // STAKING_ADDRESS: import.meta.env.VITE_STAKING_ADDRESS || '',
};
