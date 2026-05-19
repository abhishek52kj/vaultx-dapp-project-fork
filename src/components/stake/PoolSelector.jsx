import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const formatPercent = (value) => `${(Number(value || 0) / 100).toFixed(2)}%`;

const formatDuration = (seconds) => {
  const value = Number(seconds || 0);
  if (value <= 0) return 'Flexible';
  const days = Math.round(value / 86400);
  if (days < 1) return '< 1 day';
  return `${days} day${days === 1 ? '' : 's'}`;
};

const Stat = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2}>
    <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>{label}</Typography>
    <Typography sx={{ color: 'var(--text)', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
      {value}
    </Typography>
  </Stack>
);

export default function PoolSelector({
  pools,
  activePoolId,
  onSelect,
  isLoading,
  formatTokenAmount,
  tokenSymbol,
}) {
  return (
    <Grid container spacing={2}>
      {(isLoading ? [0, 1, 2] : pools).map((pool, index) => {
        const poolId = isLoading ? index : pool.id;
        const isActive = poolId === activePoolId;

        return (
          <Grid item xs={12} md={4} key={poolId}>
            <Card
              sx={{
                height: '100%',
                background: 'var(--glass)',
                border: isActive ? '1px solid var(--cyan)' : '1px solid var(--border)',
                borderRadius: 1,
              }}
            >
              <CardActionArea
                onClick={() => onSelect(poolId)}
                sx={{ height: '100%', alignItems: 'stretch' }}
              >
                <CardContent sx={{ minHeight: 230 }}>
                  {isLoading ? (
                    <Stack spacing={2}>
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="rectangular" height={52} />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                    </Stack>
                  ) : (
                    <Stack spacing={2.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                          <Typography sx={{ color: 'var(--text)', fontSize: 18, fontWeight: 800 }}>
                            {pool.name}
                          </Typography>
                          <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>
                            Pool #{pool.id + 1}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={pool.active ? 'Active' : 'Paused'}
                          sx={{
                            color: pool.active ? 'var(--lime)' : 'var(--gold)',
                            borderColor: pool.active ? 'var(--lime)' : 'var(--gold)',
                          }}
                          variant="outlined"
                        />
                      </Stack>

                      <Box>
                        <Typography sx={{ color: 'var(--cyan)', fontSize: 40, fontWeight: 900, lineHeight: 1 }}>
                          {formatPercent(pool.apy)}
                        </Typography>
                        <Typography sx={{ color: 'var(--muted)', fontSize: 12, letterSpacing: '.08em' }}>
                          APY
                        </Typography>
                      </Box>

                      <Stack spacing={1}>
                        <Stat label="Total staked" value={`${formatTokenAmount(pool.totalStaked)} ${tokenSymbol}`} />
                        <Stat label="Reward reserve" value={`${formatTokenAmount(pool.rewardReserve)} ${tokenSymbol}`} />
                        <Stat label="Lock period" value={formatDuration(pool.lockPeriod)} />
                        <Stat label="Early exit penalty" value={formatPercent(pool.penaltyBps)} />
                      </Stack>
                    </Stack>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
