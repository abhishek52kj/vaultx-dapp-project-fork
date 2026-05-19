import { useEffect, useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';

const stripGrouping = (value) => String(value).replaceAll(',', '');

const formatPercent = (value) => `${(Number(value || 0) / 100).toFixed(2)}%`;

const hasAmount = (value) => Number(value) > 0;

export default function StakePanel({
  pool,
  account,
  vtxBalance,
  stakerInfo,
  pendingRewards,
  pendingAction,
  approve,
  stake,
  unstake,
  claim,
  needsApproval,
  walletNetworkMismatch,
  formatTokenAmount,
  parseTokenAmount,
  tokenSymbol,
}) {
  const [tab, setTab] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submitting = Boolean(pendingAction);
  const walletReady = Boolean(account) && !walletNetworkMismatch;
  const lockActive = Number(stakerInfo.lockExpiresAt || 0) > Math.floor(Date.now() / 1000);
  const zeroStake = stakerInfo.stakedAmount.isZero();

  const stakeAmountValue = useMemo(() => {
    try {
      return hasAmount(stakeAmount) ? parseTokenAmount(stakeAmount) : null;
    } catch {
      return null;
    }
  }, [parseTokenAmount, stakeAmount]);

  const unstakeAmountValue = useMemo(() => {
    try {
      return hasAmount(unstakeAmount) ? parseTokenAmount(unstakeAmount) : null;
    } catch {
      return null;
    }
  }, [parseTokenAmount, unstakeAmount]);

  const stakeAmountInvalid = Boolean(stakeAmount) && (!stakeAmountValue || stakeAmountValue.gt(vtxBalance));
  const validStakeAmount = Boolean(stakeAmountValue) && !stakeAmountInvalid;
  const approvalRequired = validStakeAmount && needsApproval(stakeAmount);

  const unstakeAmountInvalid = Boolean(unstakeAmount) && (
    !unstakeAmountValue ||
    zeroStake ||
    unstakeAmountValue.gt(stakerInfo.stakedAmount)
  );
  const validUnstakeAmount = Boolean(unstakeAmountValue) && !unstakeAmountInvalid;
  const canSubmitUnstake = walletReady && validUnstakeAmount && !submitting;

  useEffect(() => {
    if (confirmOpen && !validUnstakeAmount) {
      setConfirmOpen(false);
    }
  }, [confirmOpen, validUnstakeAmount]);

  const penaltyPreview = useMemo(() => {
    if (!lockActive || !hasAmount(unstakeAmount)) return '0';
    const value = (Number(unstakeAmount) * Number(pool?.penaltyBps || 0)) / 10000;
    return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  }, [lockActive, pool?.penaltyBps, unstakeAmount]);

  const onStake = async () => {
    if (!validStakeAmount) return;
    const receipt = await stake(pool.id, stakeAmount);
    if (receipt) setStakeAmount('');
  };

  const onUnstake = async () => {
    if (!canSubmitUnstake) return;
    setConfirmOpen(false);
    const receipt = await unstake(pool.id, unstakeAmount);
    if (receipt) setUnstakeAmount('');
  };

  const submitUnstake = () => {
    if (!canSubmitUnstake) return;
    if (lockActive && Number(pool?.penaltyBps || 0) > 0) {
      setConfirmOpen(true);
      return;
    }
    onUnstake();
  };

  return (
    <Card sx={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography sx={{ color: 'var(--cyan)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Execute
            </Typography>
            <Typography sx={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>
              {pool?.name || 'Select a pool'}
            </Typography>
          </Box>

          <Tabs value={tab} onChange={(_, next) => setTab(next)} variant="fullWidth">
            <Tab label="Stake" />
            <Tab label="Unstake" />
            <Tab label="Claim" />
          </Tabs>

          {!account && (
            <Box sx={{ p: 2, background: 'var(--glass2)', border: '1px solid var(--border2)' }}>
              <Typography sx={{ color: 'var(--muted)' }}>
                Connect a wallet to stake, unstake, or claim rewards.
              </Typography>
            </Box>
          )}

          {account && walletNetworkMismatch && (
            <Box sx={{ p: 2, background: 'var(--glass2)', border: '1px solid var(--border2)' }}>
              <Typography sx={{ color: 'var(--gold)' }}>
                Switch MetaMask to the configured local chain before submitting transactions.
              </Typography>
            </Box>
          )}

          {tab === 0 && (
            <Stack spacing={2}>
              <TextField
                value={stakeAmount}
                onChange={(event) => setStakeAmount(event.target.value)}
                type="number"
                label="Amount to stake"
                disabled={!walletReady || submitting}
                error={stakeAmountInvalid}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>{tokenSymbol}</Typography>
                        <Button
                          size="small"
                          onClick={() => setStakeAmount(stripGrouping(formatTokenAmount(vtxBalance, 6)))}
                          disabled={!walletReady || submitting}
                        >
                          MAX
                        </Button>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  stakeAmountInvalid
                    ? `Enter up to ${formatTokenAmount(vtxBalance)} ${tokenSymbol}.`
                    : `Wallet balance: ${formatTokenAmount(vtxBalance)} ${tokenSymbol}`
                }
              />

              {approvalRequired && (
                <Button
                  variant="outlined"
                  onClick={() => approve(stakeAmount)}
                  disabled={!walletReady || !validStakeAmount || submitting}
                  startIcon={pendingAction === 'Approval' ? <CircularProgress size={16} /> : null}
                >
                  Approve {tokenSymbol}
                </Button>
              )}

              <Button
                variant="contained"
                onClick={onStake}
                disabled={!walletReady || !validStakeAmount || approvalRequired || submitting}
                startIcon={pendingAction === 'Stake' ? <CircularProgress size={16} /> : null}
              >
                Stake
              </Button>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2}>
              <TextField
                value={unstakeAmount}
                onChange={(event) => setUnstakeAmount(event.target.value)}
                type="number"
                label="Amount to unstake"
                disabled={!walletReady || submitting}
                error={unstakeAmountInvalid}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>{tokenSymbol}</Typography>
                        <Button
                          size="small"
                          onClick={() => setUnstakeAmount(stripGrouping(formatTokenAmount(stakerInfo.stakedAmount, 6)))}
                          disabled={!walletReady || submitting}
                        >
                          MAX
                        </Button>
                      </Stack>
                    </InputAdornment>
                  ),
                }}
                helperText={
                  unstakeAmountInvalid
                    ? `Enter up to ${formatTokenAmount(stakerInfo.stakedAmount)} ${tokenSymbol}.`
                    : `Currently staked: ${formatTokenAmount(stakerInfo.stakedAmount)} ${tokenSymbol}`
                }
              />

              <Box sx={{ p: 2, background: 'var(--glass2)', border: '1px solid var(--border2)' }}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography sx={{ color: 'var(--muted)' }}>Early exit penalty</Typography>
                  <Typography sx={{ color: lockActive ? 'var(--gold)' : 'var(--lime)', fontWeight: 800 }}>
                    {lockActive ? `${penaltyPreview} ${tokenSymbol}` : 'No penalty'}
                  </Typography>
                </Stack>
                <Typography sx={{ color: 'var(--muted)', fontSize: 12, mt: 1 }}>
                  Pool penalty rate: {formatPercent(pool?.penaltyBps)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={submitUnstake}
                disabled={!canSubmitUnstake}
                startIcon={pendingAction === 'Unstake' ? <CircularProgress size={16} /> : null}
              >
                Unstake
              </Button>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              <Box sx={{ p: 2, background: 'var(--glass2)', border: '1px solid var(--border2)' }}>
                <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>Claimable rewards</Typography>
                <Typography sx={{ color: 'var(--cyan)', fontSize: 30, fontWeight: 900 }}>
                  {formatTokenAmount(pendingRewards, 8)} {tokenSymbol}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => claim(pool.id)}
                disabled={!walletReady || pendingRewards.isZero() || submitting}
                startIcon={pendingAction === 'Claim rewards' ? <CircularProgress size={16} /> : null}
              >
                Claim Rewards
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Early Unstake</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'var(--muted)' }}>
            This pool is still locked. Unstaking now applies an estimated penalty of{' '}
            <Box component="span" sx={{ color: 'var(--gold)', fontWeight: 800 }}>
              {penaltyPreview} {tokenSymbol}
            </Box>
            .
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onUnstake}
            disabled={!canSubmitUnstake}
            startIcon={pendingAction === 'Unstake' ? <CircularProgress size={16} /> : null}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
