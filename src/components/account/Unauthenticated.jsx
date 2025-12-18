import { Fragment, useState } from 'react';
import WalletProviders from './NetworkWalletProviders';

export default function Unauthenticated() {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <Fragment>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'9px 20px',
          background: hov ? 'var(--lime)' : 'transparent',
          border: `2px solid ${hov ? 'var(--lime)' : 'rgba(200,230,58,.45)'}`,
          color: hov ? 'var(--noir)' : 'var(--lime)',
          fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:400,
          letterSpacing:'.14em', textTransform:'uppercase', cursor:'pointer',
          transition:'all .18s', transform: hov ? 'translateY(-1px)' : 'none',
          boxShadow: hov ? '0 6px 22px rgba(200,230,58,.2)' : 'none',
        }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 12h.01"/><path d="M2 9h20"/>
        </svg>
        Connect
      </button>
      <WalletProviders walletProvidersDialogOpen={open} handleWalletProvidersDialogToggle={() => setOpen(false)}/>
    </Fragment>
  );
}
