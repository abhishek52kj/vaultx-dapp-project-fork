import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

const formatCountdown = (seconds) => {
  const total = Math.max(Number(seconds || 0), 0);
  if (total === 0) return 'Unlocked';
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const Metric = ({ label, value, accent }) => (
  <Box sx={{ flex: '1 1 170px', p: 2, background: 'var(--glass2)', border: '1px solid var(--border2)' }}>
    <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>{label}</Typography>
    <Typography sx={{ color: accent ? 'var(--cyan)' : 'var(--text)', fontSize: 22, fontWeight: 800 }}>
      {value}
    </Typography>
  </Box>
);

export default function PositionPanel({
  account,
  pool,
  stakerInfo,
  pendingRewards,
  isLoading,
  formatTokenAmount,
  tokenSymbol,
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!account || !pool) return null;

  const remainingLock = Math.max(Number(stakerInfo.lockExpiresAt || 0) - now, 0);

  return (
    <Card sx={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{ color: 'var(--cyan)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Wallet Position
            </Typography>
            <Typography sx={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>
              {pool.name}
            </Typography>
          </Box>

          {isLoading ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Skeleton variant="rectangular" height={86} sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" height={86} sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" height={86} sx={{ flex: 1 }} />
            </Stack>
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap">
              <Metric
                label="Staked"
                value={`${formatTokenAmount(stakerInfo.stakedAmount)} ${tokenSymbol}`}
              />
              <Metric
                label="Pending Rewards"
                value={`${formatTokenAmount(pendingRewards, 8)} ${tokenSymbol}`}
                accent
              />
              <Metric label="Lock Expiry" value={formatCountdown(remainingLock)} />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
