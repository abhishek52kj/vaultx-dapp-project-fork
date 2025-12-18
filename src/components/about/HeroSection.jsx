import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

const HeroSection = () => (
  <Box sx={{
    position: 'relative', overflow: 'hidden',
    py: { xs: 12, md: 18 },
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  }}>
    {/* Background property image */}
    <Box
      component="img"
      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=75"
      alt=""
      sx={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0.08,
        pointerEvents: 'none',
      }}
    />
    <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 20%, #080810 75%)', pointerEvents: 'none' }} />

    <Container maxWidth="md" sx={{ position: 'relative' }}>
      <Typography sx={{
        fontFamily: '"DM Mono", monospace', fontSize: '10px',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: '#C9A84C', mb: 2,
      }}>
        About VaultX
      </Typography>
      <Typography variant="h2" sx={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: { xs: '38px', md: '60px' },
        fontWeight: 300, color: '#EDE9DF', mb: 3, lineHeight: 1.1,
      }}>
        Built on principle.<br />
        <Box component="em" sx={{ fontStyle: 'italic', color: '#C9A84C' }}>Designed to last.</Box>
      </Typography>
      <Typography sx={{
        fontFamily: '"DM Sans", sans-serif',
        color: '#555062', fontSize: '15px', lineHeight: 1.85,
        maxWidth: 560,
      }}>
        VaultX is a decentralized real estate ecosystem powered by the VTX token.
        We believe in fixed supply, transparent tokenomics, and community-first governance.
        No inflation. No hidden allocations. No surprises.
      </Typography>
    </Container>
  </Box>
);

export default HeroSection;
