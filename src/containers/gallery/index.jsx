import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GalleryItems from '../../components/gallery/GalleryItems';

const PageHero = ({ img, eyebrow, title, sub }) => (
  <Box sx={{ position:'relative', overflow:'hidden', pt:{ xs:12, md:16 }, pb:{ xs:6, md:10 }, borderBottom:'1px solid var(--border2)' }}>
    <Box component="img" src={img} alt="" sx={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.12, pointerEvents:'none' }} />
    <Box sx={{ position:'absolute', inset:0, background:'linear-gradient(to right, var(--ink) 40%, var(--overlay) 100%)', pointerEvents:'none' }} />
    <Container maxWidth="xl" sx={{ position:'relative' }}>
      <Typography sx={{ fontFamily:'"Space Mono",monospace', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--cyan)', mb:1.5 }}>{eyebrow}</Typography>
      <Typography sx={{ fontFamily:'"Orbitron",monospace', fontSize:{ xs:'38px', md:'58px' }, fontWeight:700, color:'var(--text)', lineHeight:1.1, mb:2 }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily:'"Rajdhani",sans-serif', fontSize:'17px', color:'var(--muted)', maxWidth:620, lineHeight:1.8 }}>{sub}</Typography>
    </Container>
  </Box>
);

export default function Gallery() {
  return (
    <Box sx={{ minHeight:'100vh', background:'var(--ink)' }}>
      <PageHero
        img="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=70"
        eyebrow="VaultX - NFT Gallery"
        title={<>Live property<br /><Box component="span" sx={{ color:'var(--cyan)' }}>yield gallery.</Box></>}
        sub="Browse tokenized real estate NFTs, filter by market and projected yield, inspect ownership metadata, and claim rental-yield distributions from the connected wallet."
      />
      <Box id="gallery-assets" sx={{ py:{ xs:6, md:10 } }}>
        <Container maxWidth="xl">
          <GalleryItems />
        </Container>
      </Box>
    </Box>
  );
}
