import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SwapCard from '../../components/swap/SwapCard';
import oneInch from 'assets/images/partners/1inch.svg';

export default function Swap() {
  return (
    <Box sx={{ minHeight:'100vh', background:'#080810' }}>
      {/* Hero */}
      <Box sx={{ position:'relative', overflow:'hidden', pt:{ xs:12, md:18 }, pb:{ xs:6, md:10 }, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <Box component="img"
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=70"
          alt=""
          sx={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.1, pointerEvents:'none' }}
        />
        <Box sx={{ position:'absolute', inset:0, background:'linear-gradient(105deg, #080810 45%, rgba(8,8,16,0.65) 100%)', pointerEvents:'none' }} />
        <Container maxWidth="xl" sx={{ position:'relative' }}>
          <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', mb:1.5 }}>VaultX Protocol</Typography>
          <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:{ xs:'38px', md:'66px' }, fontWeight:300, color:'#EDE9DF', lineHeight:1.05, mb:3 }}>
            Swap tokens<br />
            <Box component="em" sx={{ fontStyle:'italic', color:'#C9A84C' }}>across chains.</Box>
          </Typography>
          <Typography sx={{ fontFamily:'"DM Sans",sans-serif', fontSize:'15px', color:'#555062', lineHeight:1.85, maxWidth:480 }}>
            Swap your tokens across ETH and BSC networks, powered by 1inch DEX aggregator for best rates.
          </Typography>
        </Container>
      </Box>

      {/* Swap card */}
      <Box sx={{ py:{ xs:8, md:12 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="start">
            <Grid item xs={12} md={5}>
              <SwapCard chain="eth" />
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt:3, justifyContent:'center' }}>
                <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'10px', color:'#302e3c', letterSpacing:'0.1em', textTransform:'uppercase' }}>Powered by</Typography>
                <a href="https://1inch.exchange/#/" target="_blank" rel="noreferrer">
                  <img src={oneInch} alt="1Inch" width="80" style={{ opacity:0.6, filter:'brightness(2)' }} />
                </a>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Box sx={{ borderRadius:'8px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', mb:4 }}>
                <Box component="img"
                  src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
                  alt="Property"
                  sx={{ width:'100%', height:240, objectFit:'cover', display:'block' }}
                />
                <Box sx={{ p:'18px 22px', background:'#0F0F18', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'9px', color:'#C9A84C', letterSpacing:'0.14em', textTransform:'uppercase', mb:0.4 }}>Trade VTX</Typography>
                  <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'20px', fontWeight:600, color:'#EDE9DF' }}>Best-rate swaps via 1inch aggregation</Typography>
                </Box>
              </Box>
              {/* Info cards */}
              <Grid container spacing={2}>
                {[
                  { label:'Networks', val:'ETH & BSC' },
                  { label:'Aggregator', val:'1inch DEX' },
                  { label:'Slippage', val:'0.5% default' },
                  { label:'Gas', val:'Optimized' },
                ].map(({ label, val }) => (
                  <Grid item xs={6} key={label}>
                    <Box sx={{ p:'16px 18px', background:'#0F0F18', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px' }}>
                      <Typography sx={{ fontFamily:'"DM Mono",monospace', fontSize:'9px', color:'#302e3c', letterSpacing:'0.12em', textTransform:'uppercase', mb:0.5 }}>{label}</Typography>
                      <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontSize:'20px', fontWeight:600, color:'#C9A84C' }}>{val}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
