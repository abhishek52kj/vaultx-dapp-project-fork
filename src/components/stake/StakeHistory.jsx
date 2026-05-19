import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

const labels = {
  Staked: 'Staked',
  Unstaked: 'Unstaked',
  RewardsClaimed: 'Claimed',
};

const formatDate = (timestamp) =>
  new Date(Number(timestamp || 0) * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const shortHash = (hash = '') => (hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : 'Local tx');

export default function StakeHistory({
  account,
  history,
  isLoading,
  formatTokenAmount,
  tokenSymbol,
  onRefresh,
}) {
  return (
    <Card sx={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'var(--cyan)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Audit Trail
            </Typography>
            <Typography sx={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>
              Recent Activity
            </Typography>
          </Box>
          <Button onClick={onRefresh} disabled={!account || isLoading}>
            Refresh
          </Button>
        </Stack>

        {!account && (
          <Typography sx={{ color: 'var(--muted)' }}>
            Connect a wallet to view staking, unstaking, and reward-claim events.
          </Typography>
        )}

        {account && isLoading && (
          <Stack spacing={1.5}>
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} variant="rectangular" height={58} />
            ))}
          </Stack>
        )}

        {account && !isLoading && history.length === 0 && (
          <Typography sx={{ color: 'var(--muted)' }}>
            No staking transactions found for this wallet.
          </Typography>
        )}

        {account && !isLoading && history.length > 0 && (
          <Stack spacing={1.25}>
            {history.map((event) => (
              <Stack
                key={`${event.hash}-${event.type}-${event.poolId}`}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
                sx={{ p: 1.5, background: 'var(--glass2)', border: '1px solid var(--border2)' }}
              >
                <Box>
                  <Typography sx={{ color: 'var(--text)', fontWeight: 800 }}>
                    {labels[event.type] || event.type} · {event.poolName}
                  </Typography>
                  <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>
                    {formatDate(event.timestamp)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Typography sx={{ color: 'var(--cyan)', fontWeight: 800 }}>
                    {formatTokenAmount(event.amount)} {tokenSymbol}
                  </Typography>
                  {event.explorerUrl ? (
                    <Button href={event.explorerUrl} target="_blank" rel="noreferrer" size="small">
                      View
                    </Button>
                  ) : (
                    <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>
                      {shortHash(event.hash)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
