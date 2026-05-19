import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

const InfoRow = ({ label, value }) => (
  <Box sx={{ borderBottom: '1px solid var(--border2)', py: 1.5 }}>
    <Typography sx={{
      color: 'var(--muted)',
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      mb: 0.5,
    }}>
      {label}
    </Typography>
    <Typography sx={{ color: 'var(--text)', fontSize: 18, fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
);

export default function GalleryDetailModal({
  item,
  open,
  onClose,
  yieldRow,
  yieldLoading,
  ownership,
  hasWallet,
  hasAddresses,
  walletNetworkMismatch,
  pending,
  onConnect,
  onClaim,
  formatEthAmount,
}) {
  if (!item) return null;

  const claimable = yieldRow?.value;
  const hasClaimable = Boolean(claimable?.gt?.(0));
  const isOwned = Boolean(ownership?.owned);
  const canClaim = hasWallet && hasAddresses && !walletNetworkMismatch && isOwned && hasClaimable && !pending;
  const canConnect = !hasWallet && hasAddresses && !pending;
  const actionDisabled = pending || (!canConnect && !canClaim);
  let claimLabel = 'Claim Yield';
  if (!hasAddresses) claimLabel = 'Configure Contracts';
  else if (!hasWallet) claimLabel = 'Connect Wallet';
  else if (walletNetworkMismatch) claimLabel = 'Switch Network';
  else if (!isOwned) claimLabel = 'Owner Wallet Required';
  else if (!hasClaimable) claimLabel = 'No Yield To Claim';

  const handlePrimaryAction = () => {
    if (canConnect) {
      onConnect?.();
      return;
    }
    if (canClaim) {
      onClaim(item.tokenId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? undefined : onClose}
      fullScreen
      PaperProps={{ sx: { background: 'var(--ink)', color: 'var(--text)' } }}
    >
      <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr .85fr' } }}>
        <Box sx={{ position: 'relative', minHeight: { xs: 360, md: '100vh' }, overflow: 'hidden' }}>
          <Box
            component="img"
            src={item.fullImageUrl}
            alt={item.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ink), transparent)' }} />
          <IconButton
            onClick={onClose}
            disabled={pending}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'var(--text)',
              border: '1px solid var(--border)',
              background: 'var(--panel)',
              '&:hover': { background: 'var(--panel-strong)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {isOwned && (
            <Box sx={{
              position: 'absolute',
              top: 24,
              left: 24,
              border: '1px solid var(--success)',
              color: 'var(--success)',
              background: 'var(--panel)',
              px: 1.4,
              py: 0.6,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
            }}>
              You own this
            </Box>
          )}
          <Box sx={{ position: 'absolute', left: { xs: 24, md: 42 }, bottom: { xs: 28, md: 44 }, right: 24 }}>
            <Typography sx={{
              color: 'var(--cyan)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              mb: 1,
            }}>
              {item.location} - Token #{item.tokenId}
            </Typography>
            <Typography sx={{
              color: 'var(--text)',
              fontFamily: "'Orbitron', monospace",
              fontSize: { xs: 36, md: 54 },
              lineHeight: 1,
            }}>
              {item.title}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 }, background: 'var(--ink2)', borderLeft: { md: '1px solid var(--border)' } }}>
          <Stack spacing={3}>
            <Box>
              <Typography sx={{
                color: 'var(--cyan)',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                mb: 1,
              }}>
                Property Overview
              </Typography>
              <Typography sx={{ color: 'var(--muted)', fontSize: 18, lineHeight: 1.7 }}>
                {item.description}
              </Typography>
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}>
              <InfoRow label="Valuation" value={`$${item.valuation.toLocaleString()}M`} />
              <InfoRow label="Projected APY" value={`${item.apy.toFixed(2)}%`} />
              <InfoRow label="Edition" value={item.edition} />
              <InfoRow label="Yield Status" value={yieldLoading ? 'Loading' : yieldRow?.status === 'ready' ? `${formatEthAmount(claimable)} ETH` : '-'} />
            </Box>

            <Box sx={{ p: 2, border: '1px solid var(--border)', background: 'var(--glass2)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography sx={{ color: 'var(--muted)', fontSize: 14 }}>Unclaimed rental yield</Typography>
                  <Typography sx={{ color: 'var(--cyan)', fontFamily: "'Orbitron', monospace", fontSize: 28 }}>
                    {yieldLoading ? '...' : yieldRow?.status === 'ready' ? `${formatEthAmount(claimable)} ETH` : '-'}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  disabled={actionDisabled}
                  onClick={handlePrimaryAction}
                  sx={{
                    minWidth: 190,
                    background: 'var(--cyan)',
                    color: 'var(--ink)',
                    '&:hover': { background: 'var(--cyan2)' },
                    '&.Mui-disabled': { background: 'var(--glass)', color: 'var(--muted)' },
                  }}
                >
                  {pending ? <CircularProgress size={18} sx={{ color: 'var(--cyan)' }} /> : claimLabel}
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{
                color: 'var(--cyan)',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}>
                Metadata Traits
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {item.attributes.map((attribute) => (
                  <Chip
                    key={`${attribute.trait_type}-${attribute.value}`}
                    label={`${attribute.trait_type}: ${attribute.value}`}
                    sx={{
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      background: 'var(--glass2)',
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
