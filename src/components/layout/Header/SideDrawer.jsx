import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import { useLocation, useNavigate } from 'react-router-dom';

const SideDrawer = ({ mainLinks, onClose, open, handleClickContracts }) => {
  const { pathname } = useLocation();
  const [hov, setHov] = useState(null);
  const navigate = useNavigate();

  const handleNav = (e, href) => {
    e.preventDefault();
    navigate(href);
    onClose();
  };

  return (
    <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }}
      sx={{ zIndex:10000, display:{ xs:'block', md:'none' }, '& .MuiDrawer-paper':{ width:280, background:'var(--ink2)', borderRight:'1px solid rgba(0,212,255,.1)', boxShadow:'16px 0 80px rgba(0,0,0,.9)' } }}
      BackdropProps={{ style:{ backgroundColor:'rgba(2,2,10,.8)', backdropFilter:'blur(10px)' } }}>
      <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, background:'radial-gradient(circle,rgba(0,212,255,.06) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 20px 18px', borderBottom:'1px solid rgba(0,212,255,.08)' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:20, color:'#E8E8F0', letterSpacing:'.06em' }}>VAULT<span style={{ color:'var(--cyan)' }}>X</span></div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:6, width:28, height:28, cursor:'pointer', color:'var(--muted)', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>
      <div style={{ padding:'14px 12px' }}>
        {mainLinks.map((l, i) => {
          const active = l.end ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <a key={l.href} href={l.href} onClick={(e) => handleNav(e, l.href)}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, marginBottom:3, textDecoration:'none', fontFamily:'Fira Code,monospace', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:active?'var(--cyan)':hov===i?'#E8E8F0':'var(--muted)', background:active?'rgba(0,212,255,.08)':hov===i?'rgba(255,255,255,.03)':'transparent', border:`1px solid ${active?'rgba(0,212,255,.2)':'transparent'}`, transition:'all .2s' }}>
              {active && <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--cyan)', flexShrink:0 }}/>}
              {l.label}
            </a>
          );
        })}
        <div style={{ height:1, background:'rgba(255,255,255,.05)', margin:'10px 2px' }}/>
        {[{ label:'Whitepaper', fn:onClose }, { label:'Contracts', fn:() => { onClose(); handleClickContracts(); } }].map((item, i) => (
          <button key={item.label} onClick={item.fn} onMouseEnter={() => setHov(`x${i}`)} onMouseLeave={() => setHov(null)}
            style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 14px', borderRadius:8, marginBottom:3, background:hov===`x${i}`?'rgba(255,255,255,.03)':'transparent', border:'1px solid transparent', cursor:'pointer', fontFamily:'Fira Code,monospace', fontSize:10, letterSpacing:'.12em', textTransform:'uppercase', color:hov===`x${i}`?'#E8E8F0':'var(--muted)', transition:'all .2s' }}>
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ padding:'14px 16px 24px', marginTop:'auto' }}>
        <a href="/pre-sale" onClick={(e) => handleNav(e, '/pre-sale')} className="btn-primary" style={{ width:'100%', justifyContent:'center', display:'flex' }}>Join Presale</a>
      </div>
    </Drawer>
  );
};

export default SideDrawer;
