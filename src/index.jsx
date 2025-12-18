import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { MoralisDappProvider } from './providers/MoralisDappProvider/MoralisDappProvider';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { MoralisProvider } from 'react-moralis';

const APP_ID = import.meta.env.VITE_MORALIS_APP_ID || '';
const SERVER_URL = import.meta.env.VITE_MORALIS_SERVER_URL || '';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#020309', paper: '#060B14' },
    primary:    { main: '#00D4FF' },
    secondary:  { main: '#7B61FF' },
    success:    { main: '#00FF88' },
    error:      { main: '#FF4444' },
    text:       { primary: '#E8F4FF', secondary: '#4A7A9B' },
    divider:    'rgba(0,212,255,0.08)',
  },
  typography: {
    fontFamily: "'Rajdhani', sans-serif",
  },
  shape: { borderRadius: 0 },
  components: {
    MuiCssBaseline: { styleOverrides: '' },
    MuiButton: {
      styleOverrides: {
        root: { fontFamily: "'Orbitron', monospace", fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', borderRadius: 0 },
      },
    },
  },
});

const getLibrary = (provider) => {
  const lib = new ethers.providers.Web3Provider(provider);
  lib.pollingInterval = 12000;
  return lib;
};

const Application = () => (
  <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL} initializeOnMount={!!(APP_ID && SERVER_URL)}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <MoralisDappProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline/>
          <App/>
        </ThemeProvider>
      </MoralisDappProvider>
    </Web3ReactProvider>
  </MoralisProvider>
);

ReactDOM.render(<Application/>, document.getElementById('root'));
