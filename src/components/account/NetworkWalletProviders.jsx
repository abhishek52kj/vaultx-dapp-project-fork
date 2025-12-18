import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useWalletConnector } from './WalletConnector.jsx';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/* ── Inline wallet SVGs (no broken image imports) ─────────────────────── */
const MetaMaskIcon = () => (
  <svg width="38" height="36" viewBox="0 0 35 33" fill="none">
    <path d="M32.958 1L19.48 10.836l2.454-5.802L32.958 1z" fill="#E17726" stroke="#E17726" strokeWidth=".25"/>
    <path d="M2.04 1l13.357 9.927-2.333-5.893L2.04 1z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M28.21 23.535l-3.59 5.498 7.683 2.116 2.207-7.496-6.3-.118z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M.49 23.653l2.195 7.496 7.671-2.116-3.579-5.498-6.287.118z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M9.97 14.465l-2.148 3.25 7.648.35-.26-8.227-5.24 4.627z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M25.03 14.465l-5.31-4.717-.175 8.317 7.636-.35-2.15-3.25z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M10.36 29.033l4.583-2.218-3.953-3.086-.63 5.304z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M21.056 26.815l4.572 2.218-.617-5.304-3.955 3.086z" fill="#E27625" stroke="#E27625" strokeWidth=".25"/>
    <path d="M14.692 22.22l-3.811-1.118 2.69-1.236 1.121 2.354z" fill="#233447" stroke="#233447" strokeWidth=".25"/>
    <path d="M20.306 22.22l1.122-2.354 2.702 1.236-3.824 1.118z" fill="#233447" stroke="#233447" strokeWidth=".25"/>
    <path d="M10.881 21.103l2.691-1.236 1.12 2.354.713-3.956-7.648-.35 3.124 3.188z" fill="#CC6116" stroke="#CC6116" strokeWidth=".25"/>
    <path d="M24.086 20.903l-.128 3.066 3.222-6.254-3.094 3.188z" fill="#E27525" stroke="#E27525" strokeWidth=".25"/>
    <path d="M15.47 18.065l-.713 3.956.893 4.613.201-6.079-.381-2.49z" fill="#E27525" stroke="#E27525" strokeWidth=".25"/>
    <path d="M19.528 18.065l-.369 2.479.176 6.09.904-4.613-.711-3.956z" fill="#E27525" stroke="#E27525" strokeWidth=".25"/>
    <path d="M20.306 22.22l-.904 4.613.641.444 3.955-3.086.128-3.066-3.82 1.095z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25"/>
    <path d="M10.881 21.103l.104 3.066 3.955 3.086.64-.444-.892-4.613-3.807-1.095z" fill="#F5841F" stroke="#F5841F" strokeWidth=".25"/>
    <path d="M25.628 29.033l-4.572-2.218.373 3.021-.041 1.28 4.24-2.083z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25"/>
    <path d="M10.36 29.033l4.252 2.083-.03-1.28.36-3.021-4.582 2.218z" fill="#D5BFB2" stroke="#D5BFB2" strokeWidth=".25"/>
  </svg>
);

const CoinbaseIcon = () => (
  <svg width="38" height="38" viewBox="0 0 1024 1024" fill="none">
    <rect width="1024" height="1024" rx="200" fill="#0052FF"/>
    <path d="M512 140C305 140 140 305 140 512s165 372 372 372 372-165 372-372S719 140 512 140zm0 88c156.8 0 284 127.2 284 284s-127.2 284-284 284-284-127.2-284-284 127.2-284 284-284z" fill="white"/>
    <path d="M440 392h144c13.3 0 24 10.7 24 24v192c0 13.3-10.7 24-24 24H440c-13.3 0-24-10.7-24-24V416c0-13.3 10.7-24 24-24z" fill="white"/>
  </svg>
);

const RabbyIcon = () => (
  <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="20" fill="#7B4DC4"/>
    <ellipse cx="50" cy="46" rx="26" ry="20" fill="#D3BBFF"/>
    <ellipse cx="36" cy="32" rx="8" ry="12" fill="#C4A0FF" transform="rotate(-15 36 32)"/>
    <ellipse cx="64" cy="32" rx="8" ry="12" fill="#C4A0FF" transform="rotate(15 64 32)"/>
    <circle cx="42" cy="47" r="4" fill="#1A0533"/>
    <circle cx="58" cy="47" r="4" fill="#1A0533"/>
    <path d="M44 56 Q50 62 56 56" stroke="#7B4DC4" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const WalletConnectIcon = () => (
  <svg width="38" height="24" viewBox="0 0 300 185" fill="none">
    <path d="M61.4 36.3C114.2-12.1 198-12.1 250.7 36.3l5.9 5.6c2.7 2.5 2.7 6.6 0 9.1l-20.8 19.3c-1.3 1.3-3.5 1.3-4.8 0l-8.2-7.8c-36.7-34.7-109.7-34.7-146.5 0l-8.7 8.3c-1.3 1.3-3.5 1.3-4.8 0L41.9 42.4c-2.7-2.5-2.7-6.6 0-9.1l19.5-7zm234 41.3l18.6 17.7c2.7 2.5 2.7 6.6 0 9.1L229 184.4c-2.7 2.5-7 2.5-9.6 0l-60.3-56.8c-.7-.6-1.7-.6-2.4 0l-60.3 56.8c-2.7 2.5-7 2.5-9.6 0L1.8 104.4c-2.7-2.5-2.7-6.6 0-9.1l18.6-17.7c2.7-2.5 7-2.5 9.6 0l60.3 56.8c.7.6 1.7.6 2.4 0l60.3-56.8c2.7-2.5 7-2.5 9.6 0l60.3 56.8c.7.6 1.7.6 2.4 0l60.3-56.8c2.6-2.5 6.9-2.5 9.6 0z" fill="#3B99FC"/>
  </svg>
);

const wallets = [
  { id: 'metamask',      label: 'MetaMask',        desc: 'Most popular',      icon: <MetaMaskIcon />,      available: true  },
  { id: 'coinbase',      label: 'Coinbase Wallet',  desc: 'Self-custody',      icon: <CoinbaseIcon />,      available: true  },
  { id: 'rabby',         label: 'Rabby',            desc: 'Multi-chain',       icon: <RabbyIcon />,         available: true  },
  { id: 'walletconnect', label: 'WalletConnect',    desc: 'v2 — coming soon',  icon: <WalletConnectIcon />, available: false },
];

const S = {
  overlay: { backgroundColor:'rgba(6,6,10,0.88)', backdropFilter:'blur(14px)' },
  paper: {
    background:'#0D0C10',
    border:'1px solid rgba(184,135,75,0.14)',
    borderRadius:'16px',
    boxShadow:'0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(184,135,75,0.06)',
    overflow:'hidden',
    maxWidth:'420px', width:'100%',
  },
};

const NetworkWalletProviders = ({ walletProvidersDialogOpen, handleWalletProvidersDialogToggle }) => {
  const { library, account } = useWeb3React();
  const { loginMetamask, connError } = useWalletConnector();
  const [selected, setSelected] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (library) handleWalletProvidersDialogToggle();
  }, [library, account]);

  useEffect(() => {
    if (walletProvidersDialogOpen) {
      setSelected(null); setConnecting(false); setLocalError(null);
    }
  }, [walletProvidersDialogOpen]);

  const handleConnect = async () => {
    if (!selected) return;
    const wallet = wallets.find(w => w.id === selected);
    if (!wallet?.available) {
      setLocalError('WalletConnect v2 integration is coming soon. Use MetaMask, Coinbase Wallet, or Rabby in the meantime.');
      return;
    }
    setConnecting(true);
    setLocalError(null);
    try {
      await loginMetamask();
    } catch (e) {
      setLocalError(e?.message ?? 'Connection failed');
    }
    setConnecting(false);
  };

  const displayError = localError || connError;

  return (
    <Dialog
      open={walletProvidersDialogOpen}
      onClose={handleWalletProvidersDialogToggle}
      BackdropProps={{ style: S.overlay }}
      PaperProps={{ style: S.paper }}
      fullWidth maxWidth="xs"
    >
      {/* Top gold accent bar */}
      <div style={{ height:2, background:'linear-gradient(90deg,transparent,var(--bronze) 30%,var(--bronze-lt) 50%,var(--bronze) 70%,transparent)' }}/>

      {/* Header */}
      <div style={{ padding:'28px 28px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, fontWeight:600, color:'#F0EBE0', lineHeight:1, marginBottom:6 }}>
            Connect Wallet
          </div>
          <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#4A4855', letterSpacing:'.14em', textTransform:'uppercase' }}>
            Choose your wallet provider
          </div>
        </div>
        <IconButton onClick={handleWalletProvidersDialogToggle}
          sx={{ color:'#4A4855', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', width:32, height:32, mt:.3,
            '&:hover': { color:'#F0EBE0', borderColor:'rgba(255,255,255,0.16)' } }}>
          <CloseIcon sx={{ fontSize:14 }}/>
        </IconButton>
      </div>

      {/* Wallet grid */}
      <div style={{ padding:'0 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {wallets.map(w => (
          <button key={w.id} onClick={() => { setSelected(w.id); setLocalError(null); }}
            style={{
              background: selected === w.id ? 'rgba(184,135,75,0.1)' : 'rgba(255,255,255,0.025)',
              border: `1px solid ${selected === w.id ? 'rgba(184,135,75,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius:10, padding:'16px 14px', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:10,
              transition:'all .18s', position:'relative', opacity: w.available ? 1 : 0.5,
            }}
            onMouseEnter={e => { if(selected !== w.id) e.currentTarget.style.borderColor='rgba(184,135,75,0.22)'; }}
            onMouseLeave={e => { if(selected !== w.id) e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
          >
            {selected === w.id && (
              <div style={{ position:'absolute', top:8, right:8, width:8, height:8, borderRadius:'50%', background:'var(--sage)', boxShadow:'0 0 8px var(--sage)' }}/>
            )}
            {!w.available && (
              <div style={{ position:'absolute', top:7, right:8, fontFamily:'IBM Plex Mono,monospace', fontSize:7, color:'#6B6875', letterSpacing:'.12em', textTransform:'uppercase' }}>
                SOON
              </div>
            )}
            <div style={{ width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {w.icon}
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontSize:12, fontWeight:600, color: selected === w.id ? 'var(--bronze)' : '#C0BBC8', marginBottom:2 }}>{w.label}</div>
              <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:8, color:'#4A4855', letterSpacing:'.1em', textTransform:'uppercase' }}>{w.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Error */}
      {displayError && (
        <div style={{ margin:'14px 28px 0', padding:'10px 14px', borderRadius:8, background:'rgba(196,112,106,0.08)', border:'1px solid rgba(196,112,106,0.25)', fontFamily:'Outfit,sans-serif', fontSize:12, color:'#C4706A', lineHeight:1.5 }}>
          {displayError}
        </div>
      )}

      {/* Connect button */}
      <div style={{ padding:'20px 28px 28px' }}>
        <button onClick={handleConnect}
          disabled={!selected || connecting}
          style={{
            width:'100%', padding:'13px', borderRadius:8, border:'none', cursor: selected && !connecting ? 'pointer' : 'not-allowed',
            background: selected && !connecting ? 'linear-gradient(135deg,var(--bronze),var(--bronze-lt))' : 'rgba(255,255,255,0.04)',
            color: selected && !connecting ? '#08070A' : '#2E2C38',
            fontFamily:'Outfit,sans-serif', fontSize:13, fontWeight:700, letterSpacing:'.04em',
            transition:'all .2s',
          }}>
          {connecting ? '⏳  Connecting…' : selected ? `Connect ${wallets.find(w=>w.id===selected)?.label}` : 'Select a wallet above'}
        </button>

        <div style={{ marginTop:14, textAlign:'center', fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:'#4A4855', letterSpacing:'.1em', lineHeight:1.7 }}>
          By connecting you agree to our{' '}
          <a href="#" style={{ color:'var(--bronze)', textDecoration:'none' }}>Terms of Service</a>.
          <br/>We never store your private keys.
        </div>
      </div>
    </Dialog>
  );
};

export default NetworkWalletProviders;
