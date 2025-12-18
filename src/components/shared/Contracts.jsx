import { useState } from 'react';
import copy from 'copy-to-clipboard';
import Dialog from '@mui/material/Dialog';

const contracts = [
  { title:'VTX Token Contract',   value:'0xeAfD5b2DCd03f54b12128405D30aC15F89906399', link:'https://testnet.bscscan.com/token/0xeAfD5b2DCd03f54b12128405D30aC15F89906399' },
  { title:'VTX Presale Contract', value:'0xBb569C738f56348B21a84D520f679fe41Fd01cc5', link:'https://testnet.bscscan.com/address/0xBb569C738f56348B21a84D520f679fe41Fd01cc5' },
];

function CopyRow({ contract }) {
  const [copied, setCopied] = useState(false);
  const handle = () => { copy(contract.value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ padding:'20px 0', borderBottom:'1px solid rgba(242,239,232,.06)' }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, color:'var(--lime)', letterSpacing:'.2em', textTransform:'uppercase', marginBottom:10 }}>{contract.title}</div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <a href={contract.link} target="_blank" rel="noreferrer"
          style={{ fontFamily:"'Space Mono',monospace", fontSize:10.5, color:'var(--stone)', wordBreak:'break-all', flex:1, textDecoration:'none', transition:'color .18s', lineHeight:1.6 }}
          onMouseOver={e => e.currentTarget.style.color='#F2EFE8'}
          onMouseOut={e => e.currentTarget.style.color='var(--stone)'}>
          {contract.value}
        </a>
        <button onClick={handle} style={{
          padding:'6px 14px', flexShrink:0, cursor:'pointer',
          fontFamily:"'Space Mono',monospace", fontSize:8.5, letterSpacing:'.16em', textTransform:'uppercase',
          background: copied ? 'rgba(91,156,120,.15)' : 'var(--lime-dim)',
          border: `1px solid ${copied ? 'rgba(91,156,120,.35)' : 'rgba(200,230,58,.3)'}`,
          color: copied ? '#5B9C78' : 'var(--lime)',
          transition:'all .2s',
        }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function Contracts({ open, handleClose }) {
  // Manage close-button hover with React state to avoid MUI inversion bug
  const [hov, setHov] = useState(false);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
      BackdropProps={{ style:{ backgroundColor:'rgba(4,3,5,.85)', backdropFilter:'blur(16px)' } }}
      PaperProps={{ style:{ background:'#0F0D0B', border:'1px solid rgba(242,239,232,.08)', borderRadius:0, boxShadow:'0 40px 90px rgba(0,0,0,.9)', overflow:'hidden' } }}>

      {/* ── Lime accent top bar ── */}
      <div style={{ height:3, background:'var(--lime)' }}/>

      {/* ── Header ── */}
      <div style={{ padding:'26px 30px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#F2EFE8', letterSpacing:'-.01em', marginBottom:6, lineHeight:1 }}>
            Contracts
          </div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, color:'#3A3830', letterSpacing:'.2em', textTransform:'uppercase' }}>
            BSCScan Testnet — Verified
          </div>
        </div>

        {/* ── FIXED CLOSE BUTTON ──
            Uses plain <button> + onMouseEnter/Leave for hover state.
            MUI IconButton with bgcolor="grey.100" caused the inversion bug:
            the grey fill made normal state look "hovered", and actual hover
            produced a lighter/darker MUI ripple that appeared inverted. ── */}
        <button
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          onClick={handleClose}
          style={{
            width: 34, height: 34, flexShrink: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${hov ? 'rgba(200,230,58,.45)' : 'rgba(242,239,232,.1)'}`,
            background: hov ? 'var(--lime-dim)' : 'rgba(242,239,232,.04)',
            color:  hov ? 'var(--lime)' : 'var(--stone)',
            transition: 'all .18s',
          }}>
          {/* Pure SVG × — no MUI icon that can carry conflicting styles */}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ padding:'6px 30px 30px' }}>
        {contracts.map((c,i) => <CopyRow key={i} contract={c}/>)}

        <div style={{ marginTop:22, padding:'14px 16px', background:'rgba(91,156,120,.06)', border:'1px solid rgba(91,156,120,.15)' }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, color:'#5B9C78', letterSpacing:'.16em', textTransform:'uppercase', marginBottom:6 }}>
            ✓ Security Note
          </div>
          <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:12, color:'#5C5850', lineHeight:1.75, fontWeight:300 }}>
            These contracts are audited by CertiK. Always verify the address before interacting with any contract.
          </div>
        </div>
      </div>
    </Dialog>
  );
}
