import { Fragment, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import items from './nft.json';
import useScroll from '../../hooks/useScroll';

const rowsPerPage = 24;

// Real property images mapped by modulo so every card has a photo
const PROP_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=75',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=75',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=75',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=75',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&q=75',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&q=75',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=75',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=75',
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400&q=75',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=75',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=75',
  'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=400&q=75',
];

const LOCATIONS = [
  'Malibu, CA','Manhattan, NY','Miami, FL','Verbier, CH',
  'Aspen, CO','Chelsea, London','Côte d\'Azur','Pacific Heights',
  'Hamptons, NY','Scottsdale, AZ','Portofino, IT','Monaco',
];

// NFT Detail Dialog
const NftDetailDialog = ({ item, index, open, onClose }) => {
  if (!item) return null;
  const img = PROP_IMAGES[index % PROP_IMAGES.length];
  const loc = LOCATIONS[index % LOCATIONS.length];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
      BackdropProps={{ style: { backgroundColor:'rgba(8,8,16,0.85)', backdropFilter:'blur(10px)' } }}>
      <Box sx={{ height:2, background:'linear-gradient(90deg,transparent,#C9A84C,transparent)' }} />

      {/* Hero image */}
      <Box sx={{ position:'relative', height:260, overflow:'hidden' }}>
        <Box component="img" src={img} alt={item.name}
          sx={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <Box sx={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,16,0.9) 0%, transparent 60%)' }} />
        <IconButton onClick={onClose}
          sx={{ position:'absolute', top:14, right:14, color:'#EDE9DF', background:'rgba(8,8,16,0.6)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', width:32, height:32,
            '&:hover': { background:'rgba(8,8,16,0.9)' } }}>
          <CloseIcon sx={{ fontSize:15 }} />
        </IconButton>
        <Box sx={{ position:'absolute', bottom:18, left:22 }}>
          <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'9px', color:'#C9A84C', letterSpacing:'0.16em', textTransform:'uppercase', mb:0.5 }}>{loc}</Typography>
          <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'28px', fontWeight:600, color:'#EDE9DF', lineHeight:1 }}>{item.name}</Typography>
        </Box>
      </Box>

      <Box sx={{ p:'24px 28px 28px' }}>
        <Typography sx={{ fontFamily:'"DM Sans",sans-serif', fontSize:'13px', color:'#555062', lineHeight:1.75, mb:3 }}>
          {item.description?.trim() || 'A premium tokenized real estate NFT on the VaultX protocol. Each NFT represents fractional ownership in a verified, legally-structured property.'}
        </Typography>

        <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'9px', letterSpacing:'0.16em', textTransform:'uppercase', color:'#C9A84C', mb:1.5 }}>
          Traits
        </Typography>
        <Box sx={{ display:'flex', flexWrap:'wrap', gap:1 }}>
          {item.attributes?.map((attr, i) => (
            <Box key={i} sx={{
              px:1.5, py:0.75, borderRadius:'6px',
              border:'1px solid rgba(201,168,76,0.2)',
              background:'rgba(201,168,76,0.05)',
            }}>
              <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'8px', color:'#555062', textTransform:'uppercase', letterSpacing:'0.1em' }}>{attr.trait_type}</Typography>
              <Typography sx={{ fontFamily:'"DM Sans",sans-serif', fontSize:'12px', color:'#EDE9DF', fontWeight:500 }}>{attr.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Dialog>
  );
};

const GalleryItems = () => {
  const [executeScroll, scrollRef] = useScroll();
  const [page, setPage]             = useState(0);
  const [selected, setSelected]     = useState(null);
  const [selIndex, setSelIndex]     = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleChangePage = (_, newPage) => { setPage(newPage); executeScroll(); };

  const handleClick = (item, idx) => {
    setSelected(item);
    setSelIndex(page * rowsPerPage + idx);
    setDialogOpen(true);
  };

  const pageItems = items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Fragment>
      {/* Pagination top */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', mb:3 }}>
        <Pagination component="div" count={items.length} rowsPerPage={rowsPerPage}
          page={page} onPageChange={handleChangePage} rowsPerPageOptions={[]}
          sx={{ '& .MuiTablePagination-toolbar': { color:'#555062', fontFamily:'"DM Mono",monospace', fontSize:'11px' },
               '& .MuiTablePagination-actions button': { color:'#C9A84C' } }} />
      </Box>

      {/* Grid */}
      <Grid container spacing={2} ref={scrollRef}>
        {pageItems.map((item, idx) => {
          const absIdx = page * rowsPerPage + idx;
          const img = PROP_IMAGES[absIdx % PROP_IMAGES.length];
          const loc = LOCATIONS[absIdx % LOCATIONS.length];
          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={item.name}>
              <Box onClick={() => handleClick(item, idx)}
                sx={{
                  position:'relative', overflow:'hidden', borderRadius:'8px',
                  border:'1px solid rgba(255,255,255,0.06)',
                  background:'#0F0F18', cursor:'pointer',
                  transition:'all 0.3s ease',
                  '&:hover': { borderColor:'rgba(201,168,76,0.3)', transform:'translateY(-4px)', boxShadow:'0 16px 40px rgba(0,0,0,0.5)' },
                  '&:hover .nft-overlay': { opacity:1 },
                  '&:hover .nft-img': { transform:'scale(1.06)' },
                }}>
                {/* Photo */}
                <Box sx={{ height:180, overflow:'hidden' }}>
                  <Box className="nft-img" component="img" src={img} alt={item.name}
                    sx={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.6s ease' }} />
                </Box>
                {/* Hover overlay */}
                <Box className="nft-overlay" sx={{
                  position:'absolute', inset:0, background:'rgba(201,168,76,0.08)',
                  opacity:0, transition:'opacity 0.3s',
                }} />
                {/* Edition badge */}
                <Box sx={{
                  position:'absolute', top:10, left:10,
                  background:'rgba(8,8,16,0.75)', backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255,255,255,0.1)', borderRadius:'100px',
                  px:1.2, py:0.4,
                }}>
                  <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'8px', color:'rgba(255,255,255,0.45)', letterSpacing:'0.1em' }}>
                    {item.name}
                  </Typography>
                </Box>
                {/* Bottom info */}
                <Box sx={{ p:'12px 14px' }}>
                  <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'8px', color:'#C9A84C', letterSpacing:'0.12em', textTransform:'uppercase', mb:0.5 }}>{loc}</Typography>
                  <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'16px', fontWeight:600, color:'#EDE9DF' }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'9px', color:'#4eca8b', background:'rgba(78,202,139,0.1)', border:'1px solid rgba(78,202,139,0.2)', borderRadius:'100px', px:1, py:0.3 }}>
                      NFT
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination bottom */}
      <Box sx={{ display:'flex', justifyContent:'flex-end', mt:4 }}>
        <Pagination component="div" count={items.length} rowsPerPage={rowsPerPage}
          page={page} onPageChange={handleChangePage} rowsPerPageOptions={[]}
          sx={{ '& .MuiTablePagination-toolbar': { color:'#555062', fontFamily:'"DM Mono",monospace', fontSize:'11px' },
               '& .MuiTablePagination-actions button': { color:'#C9A84C' } }} />
      </Box>

      <NftDetailDialog item={selected} index={selIndex} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Fragment>
  );
};

export default GalleryItems;
