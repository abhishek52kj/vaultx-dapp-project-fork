import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('VaultX render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--ink)',
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 520, textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{ color: 'var(--text)', fontFamily: 'Orbitron, monospace', fontSize: 30, fontWeight: 900 }}
          >
            VaultX needs a refresh
          </Typography>
          <Typography sx={{ color: 'var(--muted)', mt: 1.5, lineHeight: 1.7 }}>
            The interface hit a temporary wallet state issue. Refreshing will restore the app without changing any
            on-chain transactions.
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Box>
      </Box>
    );
  }
}
