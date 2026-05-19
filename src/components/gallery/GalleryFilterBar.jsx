import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'valuation-desc', label: 'Valuation High' },
  { value: 'valuation-asc', label: 'Valuation Low' },
  { value: 'yield-desc', label: 'Yield High' },
  { value: 'yield-asc', label: 'Yield Low' },
];

const controlSx = {
  minWidth: { xs: '100%', md: 180 },
  '& .MuiInputLabel-root': {
    color: 'var(--muted)',
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
  },
  '& .MuiOutlinedInput-root': {
    color: 'var(--text)',
    borderRadius: 0,
    fontFamily: "'Rajdhani', sans-serif",
    '& fieldset': { borderColor: 'var(--border)' },
    '&:hover fieldset': { borderColor: 'var(--cyan)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--cyan)' },
  },
  '& .MuiSvgIcon-root': { color: 'var(--cyan)' },
};

const FilterControls = ({
  locations,
  location,
  onLocationChange,
  yieldRange,
  onYieldRangeChange,
  sortBy,
  onSortByChange,
  mintedFirst,
  onMintedFirstChange,
  onReset,
}) => (
  <Box sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    flexWrap: { md: 'wrap' },
    gap: 2,
    alignItems: { xs: 'stretch', md: 'center' },
    flex: '1 1 760px',
    minWidth: 0,
  }}>
    <FormControl size="small" sx={{ ...controlSx, flex: { md: '1 1 180px' } }}>
      <InputLabel id="gallery-location-label">Location</InputLabel>
      <Select
        labelId="gallery-location-label"
        label="Location"
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
      >
        <MenuItem value="all">All Locations</MenuItem>
        {locations.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <Box sx={{ minWidth: { xs: '100%', md: 220 }, flex: { md: '1 1 280px' }, px: { xs: 0, md: 1 } }}>
      <Typography sx={{
        color: 'var(--muted)',
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        mb: 1,
      }}>
        Yield Range {yieldRange[0]}% - {yieldRange[1]}%
      </Typography>
      <Slider
        value={yieldRange}
        min={0}
        max={15}
        step={0.5}
        onChange={(_, value) => onYieldRangeChange(value)}
        sx={{
          color: 'var(--cyan)',
          '& .MuiSlider-rail': { color: 'var(--border)' },
          '& .MuiSlider-thumb': { boxShadow: '0 0 14px var(--shadow-cyan)' },
        }}
      />
    </Box>

    <FormControl size="small" sx={{ ...controlSx, flex: { md: '1 1 180px' } }}>
      <InputLabel id="gallery-sort-label">Sort By</InputLabel>
      <Select
        labelId="gallery-sort-label"
        label="Sort By"
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <FormControlLabel
      control={(
        <Checkbox
          checked={mintedFirst}
          onChange={(event) => onMintedFirstChange(event.target.checked)}
          sx={{
            color: 'var(--muted)',
            '&.Mui-checked': { color: 'var(--cyan)' },
          }}
        />
      )}
      label="Minted first"
      sx={{
        minHeight: 40,
        m: 0,
        flex: { md: '0 0 auto' },
        px: 1,
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        '& .MuiFormControlLabel-label': {
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        },
      }}
    />

    <Button
      variant="outlined"
      onClick={onReset}
      sx={{
        flex: { md: '0 0 auto' },
        borderColor: 'var(--border)',
        color: 'var(--muted)',
        minHeight: 40,
        '&:hover': { borderColor: 'var(--cyan)', color: 'var(--cyan)' },
      }}
    >
      Reset
    </Button>
  </Box>
);

export default function GalleryFilterBar({
  locations,
  location,
  onLocationChange,
  yieldRange,
  onYieldRangeChange,
  sortBy,
  onSortByChange,
  mintedFirst,
  onMintedFirstChange,
  onReset,
  resultCount,
  totalCount,
}) {
  const isMobile = useMediaQuery('(max-width:767px)');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const summary = useMemo(
    () => `${resultCount.toLocaleString()} / ${totalCount.toLocaleString()} assets`,
    [resultCount, totalCount]
  );

  if (isMobile) {
    return (
      <Box sx={{
        position: 'sticky',
        top: 78,
        zIndex: 5,
        mb: 3,
        p: 1.5,
        background: 'var(--panel-strong)',
        border: '1px solid var(--border)',
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{
              color: 'var(--cyan)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              letterSpacing: '.16em',
              textTransform: 'uppercase',
            }}>
              Filters
            </Typography>
            <Typography sx={{ color: 'var(--muted)', fontSize: 14 }}>{summary}</Typography>
          </Box>
          <Button
            startIcon={<FilterListIcon />}
            variant="outlined"
            onClick={() => setDrawerOpen(true)}
            sx={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            Filter
          </Button>
        </Stack>
        <Drawer
          anchor="bottom"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { background: 'var(--ink2)', borderTop: '1px solid var(--border)', p: 2 } }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ color: 'var(--text)', fontFamily: "'Orbitron', monospace", fontSize: 16 }}>
              Gallery Filters
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'var(--cyan)' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <FilterControls
            locations={locations}
            location={location}
            onLocationChange={onLocationChange}
            yieldRange={yieldRange}
            onYieldRangeChange={onYieldRangeChange}
            sortBy={sortBy}
            onSortByChange={onSortByChange}
            mintedFirst={mintedFirst}
            onMintedFirstChange={onMintedFirstChange}
            onReset={onReset}
          />
        </Drawer>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'sticky',
      top: 90,
      zIndex: 5,
      mb: 4,
      p: 2,
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      backdropFilter: 'blur(18px)',
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        minWidth: 0,
      }}>
        <FilterControls
          locations={locations}
          location={location}
          onLocationChange={onLocationChange}
          yieldRange={yieldRange}
          onYieldRangeChange={onYieldRangeChange}
          sortBy={sortBy}
          onSortByChange={onSortByChange}
          mintedFirst={mintedFirst}
          onMintedFirstChange={onMintedFirstChange}
          onReset={onReset}
        />
        <Typography sx={{
          color: 'var(--muted)',
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          flex: '0 0 auto',
          ml: 'auto',
          whiteSpace: 'nowrap',
        }}>
          {summary}
        </Typography>
      </Box>
    </Box>
  );
}
