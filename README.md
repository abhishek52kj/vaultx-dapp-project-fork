# VaultX Protocol

VaultX is a local-first Web3 demo for tokenized real estate. The current checkpoint covers:

- SC-01: VTX vesting contract for team/advisor allocations.
- FE-01: VTX staking dashboard with live pool, wallet, reward, claim, and activity state.
- SC-02: ETH rental-yield distribution contract for property NFTs.
- FE-02: NFT property gallery with filters, detail view, ownership state, and yield claiming.

The app runs locally with Ganache, Truffle, Vite, React 17, ethers v5, and MetaMask.

## Quick Start

Use three terminals.

### 1. Install Dependencies

```bash
npm install
```

The repo has `legacy-peer-deps=true` configured because several packages are pinned around React 17 and Moralis v1.

### 2. Create Local Environment

```bash
cp .env.default .env.local
```

At first, it is fine for the contract addresses to be empty. After migration you will copy the deployed addresses into `.env.local`.

Expected local variables:

```env
VITE_TOKEN_ADDRESS=
VITE_PRESALE_ADDRESS=
VITE_NFT_ADDRESS=
VITE_STAKING_ADDRESS=
VITE_RENTAL_YIELD_ADDRESS=
VITE_RPC_URL=http://127.0.0.1:7545
VITE_CHAIN_ID=1337
```

### 3. Start Ganache

Terminal 1:

```bash
npx ganache --deterministic --database.dbPath data --chain.chainId 1337 --chain.networkId 1337 --server.port 7545
```

Important details:

- RPC URL: `http://127.0.0.1:7545`
- Chain ID: `1337`
- Network ID: `1337`
- The deterministic first account is `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`.

The `This version of uWS is not compatible... Falling back to a NodeJS implementation` warning is harmless on newer Node versions.

### 4. Deploy Contracts

Terminal 2:

```bash
npx truffle migrate --reset --compile-all --network develop --config Truffle/truffle-config.js
node Truffle/scripts/contractInfo.js
```

The migration deploys:

- `VaultXPresale`
- `VaultXToken`
- `VaultXStaking`
- `VaultXVesting`
- `VaultXPropertyNFT`
- `VaultXRentalYield`

For the local demo, migration 5 also:

- Mints 12 property NFTs to Ganache account 0.
- Mints 12 property NFTs to Ganache account 1.
- Deposits 1 ETH of demo rental yield.
- Grants account 0 the rental-yield property-manager role.

Copy the printed deployment addresses into `.env.local`, for example:

```env
VITE_TOKEN_ADDRESS=0x...
VITE_PRESALE_ADDRESS=0x...
VITE_STAKING_ADDRESS=0x...
VITE_NFT_ADDRESS=0x...
VITE_RENTAL_YIELD_ADDRESS=0x...
VITE_RPC_URL=http://127.0.0.1:7545
VITE_CHAIN_ID=1337
```

Restart Vite any time `.env.local` changes.

### 5. Run The Frontend

Terminal 3:

```bash
npm run dev -- --host 127.0.0.1
```

Open the URL printed by Vite, usually:

```text
http://127.0.0.1:5173
```

If port `5173` is busy, Vite will choose another port such as `5174`.

## MetaMask Setup

Add or edit a local MetaMask network:

```text
Network name: Localhost 8545 or Ganache 1337
RPC URL:      http://127.0.0.1:7545
Chain ID:     1337
Currency:     ETH
```

If MetaMask says chain ID `1337` is already used by `Localhost 8545`, edit that existing network and set its RPC URL to `http://127.0.0.1:7545`.

Useful deterministic accounts:

```text
Account 0
Address:     0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
Private key: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d

Account 1
Address:     0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0
Private key: 0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1
```

Account 0 owns local NFT token IDs `1-12`. Account 1 owns local NFT token IDs `13-24`.

## Automated Verification

Run all smart-contract tests:

```bash
npx truffle test --config Truffle/truffle-config.js
```

Expected result:

```text
23 passing
```

Run the production frontend build:

```bash
npm run build
```

Expected result:

```text
vite build ... built successfully
```

Generated local folders are intentionally ignored:

```bash
git status --ignored --short | grep -E '(^!! \.env\.local|^!! data/|^!! dist/|^!! Truffle/build/)'
```

Expected ignored output includes:

```text
!! .env.local
!! Truffle/build/
!! data/
!! dist/
```

## Task Coverage

### SC-01: Vesting

Contract: `contracts/VaultXVesting.sol`

Implemented behavior:

- One-time owner initialization with VTX token address and future TGE timestamp.
- Owner-only beneficiary registration before TGE.
- Allocation cap based on vesting contract token balance.
- Cliff plus linear vesting after TGE.
- Claim only newly vested tokens.
- Prevent duplicate beneficiary schedules.
- Prevent double-claiming.
- Owner revocation with vested tokens paid to the beneficiary and unvested tokens returned to owner.
- Reentrancy protection and SafeERC20 transfers.

Automated tests cover:

- Pre-cliff claim rejection.
- 50 percent claimable halfway through vesting.
- 100 percent claimable after full vesting duration.
- Mid-schedule revocation split.
- Duplicate beneficiary rejection.
- Allocation exceeding contract balance rejection.
- Claiming only newly vested tokens.

### FE-01: Staking Dashboard

Route: `/stake`

Contracts:

- `contracts/VaultXToken.sol`
- `contracts/VaultXStaking.sol`

Implemented behavior:

- Three live pools: 7-day, 30-day, and 90-day locks.
- Pool APY, total staked, reward reserve, lock period, and early-exit penalty display.
- Wallet connect and persisted reconnect on page refresh.
- VTX balance, allowance, staked amount, pending rewards, and lock expiry display.
- Stake, approve, unstake, and claim reward actions.
- Early-unstake penalty confirmation modal.
- Recent staking activity from on-chain events.
- Form validation for zero amount, over-balance stake, and over-position unstake.

### SC-02: Rental Yield

Contracts:

- `contracts/VaultXPropertyNFT.sol`
- `contracts/VaultXRentalYield.sol`

Implemented behavior:

- Property-manager role controls rental-yield deposits.
- ETH deposits create yield epochs.
- Each epoch snapshots total NFT supply and stores per-token ETH yield.
- Current token owner can claim all unclaimed epochs for one or more token IDs.
- Duplicate token IDs in the same claim are rejected.
- Same token cannot claim the same epoch twice.
- Tokens minted after an epoch cannot claim older yield.
- Claims use checks-effects-interactions and one ETH transfer at the end.
- Seven-day emergency withdrawal timelock.
- Owner can grant and revoke property managers.

Automated tests cover:

- Role enforcement for deposits.
- Epoch creation and ETH accounting.
- Exact per-token distribution.
- Duplicate claim rejection.
- Atomic multi-epoch claim.
- Non-owner claim rejection.
- Minted-after-epoch exclusion.
- Emergency withdrawal timelock.
- Property-manager revocation.

### FE-02: Property Gallery And Yield Claiming

Routes:

- `/gallery`
- `/gallery?nft=1`
- `/gallery?nft=2`

Implemented behavior:

- Gallery grid over local metadata.
- Load more pagination.
- Location filter.
- Yield range filter.
- Sort modes.
- `Minted first` toggle for local testing.
- Live read-only unclaimed yield values through `VITE_RPC_URL`.
- Owned state and owned ribbons after wallet connect.
- Full-screen property detail modal through the `nft` query param.
- Connect wallet from the detail modal.
- Claim rental yield for owned NFTs.
- Yield state refreshes to `0 ETH` after claim.

## Manual Test Checklist

Run this after Ganache, migrations, `.env.local`, and Vite are ready.

### 1. Staking Read State

1. Open `/stake` without a wallet connected.
2. Confirm all three pool cards load.
3. Confirm the action panel asks you to connect a wallet.
4. Connect MetaMask account 0 on chain `1337`.
5. Confirm the header shows the account and ETH balance.
6. Confirm wallet VTX balance is seeded, usually `100,000 VTX`.

### 2. Staking Validation

1. In `/stake`, select the 30-day pool.
2. Enter more than the wallet balance in Stake.
3. Confirm the form shows a validation error and the button stays disabled.
4. Open Unstake with `0 VTX` staked.
5. Enter `100`.
6. Confirm the form shows a validation error and the button stays disabled.

### 3. Stake, Claim, And Unstake

1. Select the 7-day pool.
2. Stake a small amount such as `10` or `100`.
3. Confirm MetaMask prompts for approval if allowance is missing.
4. Confirm the Stake transaction.
5. Confirm recent activity shows the stake.
6. Move local time forward:

```bash
curl -s -X POST http://127.0.0.1:7545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"evm_increaseTime","params":[3600],"id":1}'

curl -s -X POST http://127.0.0.1:7545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":2}'
```

7. Refresh staking data and confirm pending rewards increase.
8. Claim rewards and confirm pending rewards return to `0 VTX`.
9. Try early unstake and confirm the penalty modal appears.
10. Confirm the unstake and verify the activity row and wallet position update.

For a no-penalty unstake, move time past the pool lock:

```bash
curl -s -X POST http://127.0.0.1:7545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"evm_increaseTime","params":[604900],"id":3}'

curl -s -X POST http://127.0.0.1:7545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":4}'
```

### 4. Gallery Read State

1. Open `/gallery` without a wallet connected.
2. Confirm property cards load.
3. Confirm unclaimed yield values can still display. This is read-only data from `VITE_RPC_URL`, not wallet-specific state.
4. Toggle `Minted first`.
5. Confirm checked mode prioritizes local token IDs `1-24`.
6. Confirm unchecked mode lets normal filters and sorting drive the result order.
7. Resize the browser or open MetaMask side panel and confirm the filter bar still wraps cleanly.

### 5. Gallery Detail And Claim

1. Open `/gallery?nft=1`.
2. Confirm the detail modal opens directly.
3. Connect MetaMask account 0.
4. Confirm `You own this` appears.
5. Confirm claimable yield is shown.
6. Click Claim Yield and confirm in MetaMask.
7. Confirm the claim succeeds and the yield becomes `0 ETH`.
8. Open `/gallery?nft=2` and repeat.

MetaMask sometimes does not show local custom RPC transactions clearly in Activity. If the app shows a confirmed transaction hash and the yield drops to `0 ETH`, the local transaction succeeded. Ganache terminal logs also show the JSON-RPC activity.

### 6. Second Wallet Ownership

1. Import account 1 into MetaMask.
2. Switch to account 1.
3. Open `/gallery`.
4. Confirm token IDs `13-24` show as owned.
5. Confirm account 1 can claim yield for those NFTs.
6. Confirm account 1 cannot claim yield for account 0 tokens.

## Troubleshooting

### Truffle Network ID Mismatch

If you see:

```text
The network id specified in the truffle config (1337) does not match the one returned by the network
```

Stop Ganache and restart it with both chain ID and network ID:

```bash
npx ganache --deterministic --database.dbPath data --chain.chainId 1337 --chain.networkId 1337 --server.port 7545
```

For a fully clean local chain, stop Ganache first, then remove the local database:

```bash
rm -rf data
```

Then start Ganache and migrate again.

### Invalid Opcode During Migration

Use Ganache v7 instead of deprecated `ganache-cli`:

```bash
npx ganache --deterministic --database.dbPath data --chain.chainId 1337 --chain.networkId 1337 --server.port 7545
```

The Truffle config also uses Solidity `evmVersion: "paris"` to avoid newer opcodes that older local chains may not support.

### Env Changes Do Not Show In The UI

Vite reads `.env.local` at startup. Restart the dev server after changing addresses:

```bash
npm run dev -- --host 127.0.0.1
```

### Etherscan Says Transaction Not Found

Local Ganache transactions do not exist on Ethereum mainnet explorers. Use the app toast, MetaMask local Activity, or Ganache terminal output for local verification.

### MetaMask Cannot Connect

Check:

- MetaMask is on chain `1337`.
- RPC URL is `http://127.0.0.1:7545`.
- Ganache is still running.
- The selected account was imported from the deterministic private key.
- The app was refreshed after switching accounts.

## Git Hygiene

Do not commit local chain state, build output, or local env secrets:

```bash
git diff --cached --name-only | grep -E '^(data/|dist/|Truffle/build/|\.env\.local$)' || echo "safe to commit"
```

Expected:

```text
safe to commit
```

## Project Structure

```text
contracts/
  VaultXToken.sol
  VaultXPresale.sol
  VaultXStaking.sol
  VaultXVesting.sol
  VaultXPropertyNFT.sol
  VaultXRentalYield.sol

Truffle/
  contracts/
  migrations/
  test/
  scripts/contractInfo.js
  truffle-config.js

src/
  components/stake/
  components/gallery/
  containers/stake/
  containers/gallery/
  contracts/
  hooks/useStaking.js
  hooks/useRentalYield.js
  helpers/ContractAddress.js
```

## Useful Commands

```bash
# Start local chain
npx ganache --deterministic --database.dbPath data --chain.chainId 1337 --chain.networkId 1337 --server.port 7545

# Compile and deploy all contracts
npx truffle migrate --reset --compile-all --network develop --config Truffle/truffle-config.js

# Copy ABI artifacts into the frontend
node Truffle/scripts/contractInfo.js

# Run contract tests
npx truffle test --config Truffle/truffle-config.js

# Run frontend
npm run dev -- --host 127.0.0.1

# Build frontend
npm run build
```

## License

MIT
