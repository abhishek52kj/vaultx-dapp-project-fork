import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GalleryDetailModal from './GalleryDetailModal';
import GalleryFilterBar from './GalleryFilterBar';
import { useWalletConnector } from '../account/WalletConnector';
import useRentalYield from '../../hooks/useRentalYield';

const PAGE_SIZE = 12;
const OWNERSHIP_DISCOVERY_LIMIT = 500;

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=680&q=78',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=680&q=78',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=680&q=78',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=680&q=78',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=680&q=78',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=680&q=78',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=680&q=78',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=680&q=78',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=680&q=78',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=680&q=78',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=680&q=78',
  'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=680&q=78',
];

const PROPERTY_PROFILES = [
  { location: 'Manhattan, NY', type: 'Sky Residence', market: 'Residential' },
  { location: 'Miami, FL', type: 'Waterfront Villa', market: 'Residential' },
  { location: 'Aspen, CO', type: 'Alpine Lodge', market: 'Hospitality' },
  { location: 'London, UK', type: 'Heritage Flat', market: 'Residential' },
  { location: 'Malibu, CA', type: 'Ocean Estate', market: 'Residential' },
  { location: 'Dubai, UAE', type: 'Marina Tower', market: 'Mixed Use' },
  { location: 'Singapore', type: 'Garden Condo', market: 'Residential' },
  { location: 'Monaco', type: 'Harbor Suite', market: 'Residential' },
  { location: 'Zurich, CH', type: 'Lakefront Asset', market: 'Residential' },
  { location: 'Austin, TX', type: 'Tech Campus', market: 'Commercial' },
  { location: 'Paris, FR', type: 'Boutique Loft', market: 'Residential' },
  { location: 'Tokyo, JP', type: 'Urban Pod', market: 'Residential' },
];

const toTokenId = (item, fallback) => {
  const edition = Number(item?.edition);
  if (Number.isFinite(edition) && edition > 0) return edition;

  const digits = String(item?.name || '').replace(/\D/g, '');
  const fromName = Number(digits);
  return Number.isFinite(fromName) && fromName > 0 ? fromName : fallback + 1;
};

const expandImage = (url) => url.replace('w=680', 'w=1600');

const normalizeItem = (item, index) => {
  const tokenId = toTokenId(item, index);
  const imageUrl = PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
  const profile = PROPERTY_PROFILES[index % PROPERTY_PROFILES.length];
  const apy = Number((4.5 + ((tokenId * 37) % 1050) / 100).toFixed(2));
  const valuation = Number((1.25 + ((tokenId * 31) % 1200) / 100).toFixed(2));
  const edition = `#${String(tokenId).padStart(4, '0')}`;

  return {
    ...item,
    tokenId,
    edition,
    title: `${profile.type} ${edition}`,
    location: profile.location,
    market: profile.market,
    apy,
    valuation,
    imageUrl,
    fullImageUrl: expandImage(imageUrl),
    recentRank: tokenId,
    description: item.description?.trim()
      || `${profile.type} ${edition} is a VaultX tokenized real estate position in ${profile.location}, with rental-yield distribution handled through the VaultX protocol.`,
    attributes: [
      ...(item.attributes || []),
      { trait_type: 'Location', value: profile.location },
      { trait_type: 'Market', value: profile.market },
      { trait_type: 'Projected APY', value: `${apy.toFixed(2)}%` },
    ],
  };
};

const rowOrPending = (row) => row || { status: 'pending', value: null };

const sortItems = (items, sortBy, ownershipMap, nftSupply, mintedFirst) => {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aOwned = ownershipMap[a.tokenId]?.owned ? 1 : 0;
    const bOwned = ownershipMap[b.tokenId]?.owned ? 1 : 0;
    const aMinted = nftSupply ? (a.tokenId <= nftSupply ? 1 : 0) : 0;
    const bMinted = nftSupply ? (b.tokenId <= nftSupply ? 1 : 0) : 0;

    if (mintedFirst) {
      if (aOwned !== bOwned) return bOwned - aOwned;
      if (aMinted !== bMinted) return bMinted - aMinted;
    }

    switch (sortBy) {
      case 'valuation-desc':
        return b.valuation - a.valuation;
      case 'valuation-asc':
        return a.valuation - b.valuation;
      case 'yield-desc':
        return b.apy - a.apy;
      case 'yield-asc':
        return a.apy - b.apy;
      case 'recent':
      default:
        return mintedFirst ? a.recentRank - b.recentRank : b.recentRank - a.recentRank;
    }
  });
  return sorted;
};

const YieldBadge = ({ row, loading, formatEthAmount }) => {
  if (loading && row.status === 'pending') {
    return <Skeleton width={76} height={24} sx={{ bgcolor: 'var(--glass)' }} />;
  }

  return (
    <Typography sx={{
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      color: row.status === 'ready' ? 'var(--success)' : 'var(--muted)',
      border: '1px solid var(--border)',
      background: 'var(--glass2)',
      px: 1,
      py: 0.45,
      minWidth: 82,
      textAlign: 'center',
    }}>
      {row.status === 'ready' ? `${formatEthAmount(row.value, 4)} ETH` : '-'}
    </Typography>
  );
};

const GalleryCard = ({
  item,
  onOpen,
  yieldRow,
  yieldLoading,
  ownership,
  formatEthAmount,
}) => {
  const isOwned = Boolean(ownership?.owned);

  return (
    <Box
      onClick={() => onOpen(item.tokenId)}
      sx={{
        position: 'relative',
        minHeight: 390,
        overflow: 'hidden',
        border: `1px solid ${isOwned ? 'var(--success)' : 'var(--border)'}`,
        background: 'var(--panel)',
        cursor: 'pointer',
        transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: 'var(--cyan)',
          boxShadow: '0 18px 50px var(--shadow-strong)',
        },
        '&:hover .gallery-card-image': { transform: 'scale(1.04)' },
      }}
    >
      {isOwned && (
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          color: 'var(--ink)',
          background: 'var(--success)',
          px: 1.1,
          py: 0.45,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
        }}>
          Owned
        </Box>
      )}

      <Box sx={{ height: 220, overflow: 'hidden', position: 'relative' }}>
        <Box
          component="img"
          className="gallery-card-image"
          src={item.imageUrl}
          alt={item.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform .5s ease',
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--ink), transparent)' }} />
        <Box sx={{
          position: 'absolute',
          left: 12,
          top: 12,
          border: '1px solid var(--border)',
          background: 'var(--overlay)',
          color: 'var(--cyan)',
          px: 1,
          py: 0.4,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
        }}>
          TOKEN {item.edition}
        </Box>
      </Box>

      <Stack spacing={1.4} sx={{ p: 2 }}>
        <Box>
          <Typography sx={{
            color: 'var(--muted)',
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            mb: 0.6,
          }}>
            {item.location}
          </Typography>
          <Typography sx={{
            color: 'var(--text)',
            fontFamily: "'Orbitron', monospace",
            fontSize: 17,
            lineHeight: 1.25,
            minHeight: 42,
          }}>
            {item.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Box sx={{ border: '1px solid var(--border2)', p: 1 }}>
            <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>Valuation</Typography>
            <Typography sx={{ color: 'var(--text)', fontWeight: 700 }}>${item.valuation.toLocaleString()}M</Typography>
          </Box>
          <Box sx={{ border: '1px solid var(--border2)', p: 1 }}>
            <Typography sx={{ color: 'var(--muted)', fontSize: 12 }}>APY</Typography>
            <Typography sx={{ color: 'var(--cyan)', fontWeight: 700 }}>{item.apy.toFixed(2)}%</Typography>
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography sx={{ color: 'var(--muted)', fontSize: 13 }}>Unclaimed yield</Typography>
          <YieldBadge row={yieldRow} loading={yieldLoading} formatEthAmount={formatEthAmount} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default function GalleryItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allItems, setAllItems] = useState([]);
  const [assetLoading, setAssetLoading] = useState(true);
  const [assetError, setAssetError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [location, setLocation] = useState('all');
  const [yieldRange, setYieldRange] = useState([0, 15]);
  const [sortBy, setSortBy] = useState('recent');
  const [yieldMap, setYieldMap] = useState({});
  const [ownershipMap, setOwnershipMap] = useState({});
  const [yieldLoading, setYieldLoading] = useState(false);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [nftSupply, setNftSupply] = useState(null);
  const [mintedFirst, setMintedFirst] = useState(true);
  const { loginMetamask, connError, clearConnError } = useWalletConnector();

  const {
    account,
    pendingTokenId,
    error,
    success,
    hasWallet,
    hasAddresses,
    walletNetworkMismatch,
    fetchYieldBatch,
    fetchOwnershipBatch,
    fetchNftSupply,
    claimYield,
    formatEthAmount,
    clearError,
    clearSuccess,
  } = useRentalYield();

  useEffect(() => {
    let active = true;
    setAssetLoading(true);

    import('./nft.json')
      .then((module) => {
        if (!active) return;
        const source = Array.isArray(module.default) ? module.default : [];
        setAllItems(source.map(normalizeItem));
        setAssetError('');
      })
      .catch(() => {
        if (!active) return;
        setAssetError('Gallery metadata could not be loaded.');
      })
      .finally(() => {
        if (active) setAssetLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedTokenId = searchParams.get('nft');
  const selectedItem = useMemo(
    () => allItems.find((item) => String(item.tokenId) === String(selectedTokenId)) || null,
    [allItems, selectedTokenId]
  );

  const locations = useMemo(
    () => Array.from(new Set(allItems.map((item) => item.location))).sort(),
    [allItems]
  );

  const filteredItems = useMemo(
    () => allItems.filter((item) => (
      (location === 'all' || item.location === location)
      && item.apy >= yieldRange[0]
      && item.apy <= yieldRange[1]
    )),
    [allItems, location, yieldRange]
  );

  const sortedItems = useMemo(
    () => sortItems(filteredItems, sortBy, ownershipMap, nftSupply, mintedFirst),
    [filteredItems, mintedFirst, nftSupply, ownershipMap, sortBy]
  );

  const visibleItems = useMemo(
    () => sortedItems.slice(0, visibleCount),
    [sortedItems, visibleCount]
  );

  const tokenIdsToRead = useMemo(() => {
    const ids = new Set(visibleItems.map((item) => item.tokenId));
    if (selectedItem) ids.add(selectedItem.tokenId);
    return Array.from(ids);
  }, [selectedItem, visibleItems]);

  const tokenIdsToReadKey = useMemo(
    () => tokenIdsToRead.join(','),
    [tokenIdsToRead]
  );

  const ownershipDiscoveryKey = useMemo(() => {
    if (!hasWallet || !nftSupply || nftSupply > OWNERSHIP_DISCOVERY_LIMIT) {
      return tokenIdsToReadKey;
    }
    return Array.from({ length: nftSupply }, (_, index) => String(index + 1)).join(',');
  }, [hasWallet, nftSupply, tokenIdsToReadKey]);

  const resetFilters = useCallback(() => {
    setLocation('all');
    setYieldRange([0, 15]);
    setSortBy('recent');
    setMintedFirst(true);
  }, []);

  const openDetail = useCallback((tokenId) => {
    const next = new URLSearchParams(searchParams);
    next.set('nft', String(tokenId));
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const closeDetail = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('nft');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [location, mintedFirst, yieldRange, sortBy]);

  useEffect(() => {
    let active = true;

    fetchNftSupply()
      .then((supply) => {
        if (active) setNftSupply(supply);
      })
      .catch(() => {
        if (active) setNftSupply(null);
      });

    return () => {
      active = false;
    };
  }, [fetchNftSupply]);

  useEffect(() => {
    if (!tokenIdsToReadKey) {
      setYieldMap({});
      return undefined;
    }

    let active = true;
    const tokenIds = tokenIdsToReadKey.split(',').map(Number);
    setYieldLoading(true);

    fetchYieldBatch(tokenIds)
      .then((rows) => {
        if (active) setYieldMap((prev) => ({ ...prev, ...rows }));
      })
      .catch(() => {
        if (active) setLocalError('Unable to read rental-yield data for the visible NFTs.');
      })
      .finally(() => {
        if (active) setYieldLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchYieldBatch, tokenIdsToReadKey]);

  useEffect(() => {
    if (!ownershipDiscoveryKey || !hasWallet) {
      setOwnershipMap({});
      return undefined;
    }

    let active = true;
    const tokenIds = ownershipDiscoveryKey.split(',').map(Number);
    setOwnershipLoading(true);

    fetchOwnershipBatch(tokenIds)
      .then((rows) => {
        if (active) setOwnershipMap((prev) => ({ ...prev, ...rows }));
      })
      .catch(() => {
        if (active) setLocalError('Unable to read wallet ownership for the visible NFTs.');
      })
      .finally(() => {
        if (active) setOwnershipLoading(false);
      });

    return () => {
      active = false;
    };
  }, [account, fetchOwnershipBatch, hasWallet, ownershipDiscoveryKey]);

  const handleClaim = useCallback(
    async (tokenId) => {
      const receipt = await claimYield(tokenId);
      if (!receipt) return;

      const [yieldRows, ownershipRows] = await Promise.all([
        fetchYieldBatch([tokenId]),
        hasWallet ? fetchOwnershipBatch([tokenId]) : Promise.resolve({}),
      ]);
      setYieldMap((prev) => ({ ...prev, ...yieldRows }));
      setOwnershipMap((prev) => ({ ...prev, ...ownershipRows }));
    },
    [claimYield, fetchOwnershipBatch, fetchYieldBatch, hasWallet]
  );

  const loadMore = () => {
    setVisibleCount((current) => Math.min(current + PAGE_SIZE, sortedItems.length));
  };

  const closeError = () => {
    setLocalError('');
    clearError();
    clearConnError();
  };

  const errorMessage = localError || error || assetError;
  const hasMore = visibleCount < sortedItems.length;

  return (
    <Fragment>
      <GalleryFilterBar
        locations={locations}
        location={location}
        onLocationChange={setLocation}
        yieldRange={yieldRange}
        onYieldRangeChange={setYieldRange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        mintedFirst={mintedFirst}
        onMintedFirstChange={setMintedFirst}
        onReset={resetFilters}
        resultCount={sortedItems.length}
        totalCount={allItems.length}
      />

      {walletNetworkMismatch && (
        <Box sx={{
          mb: 3,
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          background: 'var(--panel)',
          p: 2,
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
        }}>
          Wallet network does not match the configured VaultX network. Read-only gallery data may still load, but claiming yield requires switching networks.
        </Box>
      )}

      <Grid container spacing={2.5}>
        {assetLoading && Array.from({ length: PAGE_SIZE }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`gallery-loading-${index}`}>
            <Skeleton variant="rectangular" height={390} sx={{ bgcolor: 'var(--glass)' }} />
          </Grid>
        ))}

        {!assetLoading && visibleItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.tokenId}>
            <GalleryCard
              item={item}
              onOpen={openDetail}
              yieldRow={rowOrPending(yieldMap[item.tokenId])}
              yieldLoading={yieldLoading}
              ownership={ownershipMap[item.tokenId]}
              ownershipLoading={ownershipLoading}
              formatEthAmount={formatEthAmount}
            />
          </Grid>
        ))}
      </Grid>

      {!assetLoading && !visibleItems.length && (
        <Box sx={{
          border: '1px solid var(--border)',
          background: 'var(--panel)',
          py: 8,
          px: 3,
          mt: 3,
          textAlign: 'center',
        }}>
          <Typography sx={{ color: 'var(--text)', fontFamily: "'Orbitron', monospace", fontSize: 24, mb: 1 }}>
            No Matching Assets
          </Typography>
          <Typography sx={{ color: 'var(--muted)', fontSize: 16 }}>
            Adjust the location or yield filters to expand the gallery.
          </Typography>
        </Box>
      )}

      {!assetLoading && hasMore && (
        <Stack alignItems="center" sx={{ mt: 5 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            sx={{
              minWidth: 240,
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              '&:hover': { borderColor: 'var(--cyan2)', color: 'var(--cyan2)' },
            }}
          >
            Load More
          </Button>
        </Stack>
      )}

      <GalleryDetailModal
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={closeDetail}
        yieldRow={selectedItem ? rowOrPending(yieldMap[selectedItem.tokenId]) : null}
        yieldLoading={yieldLoading}
        ownership={selectedItem ? ownershipMap[selectedItem.tokenId] : null}
        hasWallet={hasWallet}
        hasAddresses={hasAddresses}
        walletNetworkMismatch={walletNetworkMismatch}
        pending={pendingTokenId === selectedItem?.tokenId}
        onConnect={loginMetamask}
        onClaim={handleClaim}
        formatEthAmount={formatEthAmount}
      />

      <Snackbar open={Boolean(errorMessage || connError)} autoHideDuration={6500} onClose={closeError}>
        <Alert onClose={closeError} severity="error" variant="filled" sx={{ width: '100%' }}>
          {errorMessage || connError}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(success)} autoHideDuration={6500} onClose={clearSuccess}>
        <Alert onClose={clearSuccess} severity="success" variant="filled" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {pendingTokenId && (
        <Box sx={{
          position: 'fixed',
          right: { xs: 18, md: 32 },
          bottom: { xs: 18, md: 32 },
          zIndex: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: '1px solid var(--border)',
          background: 'var(--panel-strong)',
          color: 'var(--text)',
          px: 2,
          py: 1.5,
        }}>
          <CircularProgress size={18} sx={{ color: 'var(--cyan)' }} />
          <Typography sx={{ color: 'var(--muted)', fontSize: 14 }}>
            Waiting for claim confirmation...
          </Typography>
        </Box>
      )}
    </Fragment>
  );
}
