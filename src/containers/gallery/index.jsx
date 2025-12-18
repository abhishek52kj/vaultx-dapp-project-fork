import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import GalleryItems from '../../components/gallery/GalleryItems';

const PageHero = ({ img, eyebrow, title, sub }) => (
  <Box sx={{ position:'relative', overflow:'hidden', pt:{ xs:12, md:16 }, pb:{ xs:6, md:10 }, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
    <Box component="img" src={img} alt="" sx={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.12, pointerEvents:'none' }} />
    <Box sx={{ position:'absolute', inset:0, background:'linear-gradient(to right, #080810 40%, rgba(8,8,16,0.6) 100%)', pointerEvents:'none' }} />
    <Container maxWidth="xl" sx={{ position:'relative' }}>
      <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', mb:1.5 }}>{eyebrow}</Typography>
      <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:{ xs:'38px', md:'58px' }, fontWeight:300, color:'#EDE9DF', lineHeight:1.1, mb:2 }}>
        {title}
      </Typography>
      <Typography sx={{ fontFamily:'"DM Sans",sans-serif', fontSize:'14px', color:'#555062', maxWidth:500, lineHeight:1.8 }}>{sub}</Typography>
    </Container>
  </Box>
);

export default function Gallery() {
  return (
    <Box sx={{ minHeight:'100vh', background:'#080810' }}>
      <PageHero
        img="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=70"
        eyebrow="VaultX — NFT Gallery"
        title={<>10,000 tokenized<br /><Box component="em" sx={{ fontStyle:'italic', color:'#C9A84C' }}>properties.</Box></>}
        sub="Each NFT represents fractional ownership in a verified, legally-structured real estate asset on Ethereum."
      />
      <Box sx={{ py:{ xs:6, md:10 } }}>
        <Container maxWidth="xl">
          <GalleryItems />
        </Container>
      </Box>
    </Box>
  );
}
