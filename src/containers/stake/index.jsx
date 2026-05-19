import { useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ParticleCanvas from '../../components/ui/ParticleCanvas';
import PoolSelector from '../../components/stake/PoolSelector';
import PositionPanel from '../../components/stake/PositionPanel';
import StakePanel from '../../components/stake/StakePanel';
import StakeHistory from '../../components/stake/StakeHistory';
import useStaking from '../../hooks/useStaking';
import { useWalletConnector } from '../../components/account/WalletConnector';

export default function Stake() {
  const { account } = useWeb3React();
  const { loginMetamask } = useWalletConnector();
  const [activePoolId, setActivePoolId] = useState(0);
  const staking = useStaking(activePoolId);

  const activePool = useMemo(
    () => staking.pools.find((pool) => pool.id === activePoolId) || staking.pools[0],
    [activePoolId, staking.pools]
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'var(--ink)' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border2)' }}>
        <Box className="grid-overlay" sx={{ position: 'absolute', inset: 0 }} />
        <ParticleCanvas style={{ opacity: 0.35 }} />

        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 6 },
            pt: { xs: 14, md: 17 },
            pb: { xs: 4, md: 7 },
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-end' }}
            spacing={3}
          >
            <Box>
              <Typography sx={{ color: 'var(--cyan)', fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase' }}>
                VaultX Protocol
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: 'var(--text)',
                  fontFamily: 'Orbitron, monospace',
                  fontSize: { xs: 38, sm: 50, md: 66 },
                  fontWeight: 900,
                  lineHeight: 1,
                  mt: 1,
                }}
              >
                VTX Staking
              </Typography>
              <Typography sx={{ color: 'var(--muted)', maxWidth: 620, mt: 2, fontSize: 16, lineHeight: 1.7 }}>
                Live pool state, wallet position, reward accrual, and contract-backed staking actions.
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {!account && (
                <Button variant="contained" onClick={loginMetamask}>
                  Connect Wallet
                </Button>
              )}
              <Button variant="outlined" onClick={staking.refetch} disabled={staking.isLoading}>
                Refresh
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, md: 6 }, py: { xs: 3, md: 6 } }}>
        <Stack spacing={3}>
          {!staking.hasAddresses && (
            <MuiAlert severity="warning" variant="outlined">
              Configure VITE_TOKEN_ADDRESS and VITE_STAKING_ADDRESS to enable live staking reads and writes.
            </MuiAlert>
          )}

          {staking.walletNetworkMismatch && (
            <MuiAlert severity="warning" variant="outlined">
              MetaMask is connected to a different chain. Switch to chain {staking.configuredChainId} before staking,
              unstaking, or claiming rewards.
            </MuiAlert>
          )}

          <PoolSelector
            pools={staking.pools}
            activePoolId={activePoolId}
            onSelect={setActivePoolId}
            isLoading={staking.isLoading}
            formatTokenAmount={staking.formatTokenAmount}
            tokenSymbol={staking.tokenSymbol}
          />

          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <PositionPanel
                  account={account}
                  pool={activePool}
                  stakerInfo={staking.stakerInfo}
                  pendingRewards={staking.pendingRewards}
                  isLoading={staking.isLoading}
                  formatTokenAmount={staking.formatTokenAmount}
                  tokenSymbol={staking.tokenSymbol}
                />
                <StakeHistory
                  account={account}
                  history={staking.history}
                  isLoading={staking.isHistoryLoading}
                  formatTokenAmount={staking.formatTokenAmount}
                  tokenSymbol={staking.tokenSymbol}
                  onRefresh={staking.refetchHistory}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} lg={4}>
              <StakePanel
                pool={activePool}
                account={account}
                vtxBalance={staking.vtxBalance}
                stakerInfo={staking.stakerInfo}
                pendingRewards={staking.pendingRewards}
                pendingAction={staking.pendingAction}
                approve={staking.approve}
                stake={staking.stake}
                unstake={staking.unstake}
                claim={staking.claim}
                needsApproval={staking.needsApproval}
                walletNetworkMismatch={staking.walletNetworkMismatch}
                formatTokenAmount={staking.formatTokenAmount}
                parseTokenAmount={staking.parseTokenAmount}
                tokenSymbol={staking.tokenSymbol}
              />
            </Grid>
          </Grid>
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(staking.error)}
        autoHideDuration={7000}
        onClose={staking.clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert severity="error" variant="filled" onClose={staking.clearError}>
          {staking.error}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={Boolean(staking.success)}
        autoHideDuration={7000}
        onClose={staking.clearSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MuiAlert severity="success" variant="filled" onClose={staking.clearSuccess}>
          {staking.success}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
