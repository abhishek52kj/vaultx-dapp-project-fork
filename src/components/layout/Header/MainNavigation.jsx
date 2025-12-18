import { Fragment, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Account from '../../account';
import SideDrawer from './SideDrawer';
import Contracts from '../../shared/Contracts';

const NAV = [
  { label:'Home',     href:'/', end:true },
  { label:'Pre-Sale', href:'/pre-sale'  },
  { label:'Stake',    href:'/stake'     },
  { label:'Swap',     href:'/swap'      },
  { label:'Gallery',  href:'/gallery'   },
  { label:'About',    href:'/about'     },
];

function Logo() {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0, cursor:'pointer' }}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect x="1" y="1" width="28" height="28" stroke="var(--lime)" strokeWidth="2" fill="none"/>
        <rect x="7" y="7" width="16" height="16" fill="var(--lime)" opacity=".08"/>
        <path d="M15 5L25 15L15 25L5 15Z" fill="var(--lime)" opacity=".7"/>
        <circle cx="15" cy="15" r="3" fill="var(--lime)"/>
      </svg>
      <div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:'#F2EFE8', lineHeight:1, letterSpacing:'.04em' }}>
          VAULT<span style={{ color:'var(--lime)' }}>X</span>
        </div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:'rgba(200,230,58,.35)', letterSpacing:'.3em', textTransform:'uppercase', marginTop:1 }}>PROTOCOL</div>
      </div>
    </div>
  );
}

export default function MainNavigation() {
  const [mob, setMob] = useState(false);
  const [contracts, setContracts] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vis, setVis] = useState(true);
  const lastY = useRef(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setVis(y < lastY.current || y < 100);
      lastY.current = y;
    };
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(href);
  };

  return (
    <Fragment>
      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, transform: vis?'translateY(0)':'translateY(-110%)', transition:'transform .38s cubic-bezier(.2,1,.4,1)' }}>
        <div style={{ height:2, background:'var(--lime)', opacity: scrolled ? 1 : 0, transition:'opacity .3s' }}/>
        <div style={{ background: scrolled ? 'rgba(6,5,4,.97)' : 'rgba(6,5,4,.6)', backdropFilter:'blur(32px) saturate(1.6)', borderBottom:`1px solid ${scrolled?'rgba(200,230,58,.12)':'rgba(242,239,232,.04)'}`, transition:'background .35s, border .35s', boxShadow: scrolled?'0 4px 40px rgba(0,0,0,.7)':'none' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 48px', height:68, display:'flex', alignItems:'center', gap:0 }}>

            <button onClick={() => setMob(p=>!p)} style={{ display:'none', alignItems:'center', justifyContent:'center', width:36, height:36, background:'rgba(242,239,232,.05)', border:'1px solid rgba(242,239,232,.07)', cursor:'pointer', color:'var(--stone)', fontSize:14, marginRight:14 }} className="vx-mob-btn">☰</button>

            <Logo/>

            <nav className="vx-nav" style={{ flex:1, display:'flex', justifyContent:'center', gap:0 }}>
              {NAV.map(l => {
                const isActive = l.end ? pathname === l.href : pathname.startsWith(l.href);
                return (
                  <a key={l.href} href={l.href} onClick={(e) => handleNav(e, l.href)}
                    style={{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:400, letterSpacing:'.14em', textTransform:'uppercase', textDecoration:'none', padding:'8px 16px', cursor:'pointer', color: isActive ? 'var(--lime)' : 'var(--stone)', transition:'color .18s', borderBottom: isActive ? '2px solid var(--lime)' : '2px solid transparent' }}>
                    {l.label}
                  </a>
                );
              })}
              <button onClick={() => setContracts(p=>!p)}
                style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:'.14em', textTransform:'uppercase', padding:'8px 16px', background:'none', border:'none', borderBottom:'2px solid transparent', color:'var(--stone)', cursor:'pointer', transition:'color .18s' }}
                onMouseOver={e => e.currentTarget.style.color='#F2EFE8'} onMouseOut={e => e.currentTarget.style.color='var(--stone)'}>
                Contracts
              </button>
            </nav>

            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="vx-live" style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 12px 5px 8px', border:'1px solid rgba(91,156,120,.25)', background:'rgba(91,156,120,.06)' }}>
                <div className="live-dot"/>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#5B9C78', letterSpacing:'.18em', textTransform:'uppercase' }}>Live</span>
              </div>
              <Account/>
            </div>
          </div>
        </div>
      </header>

      <SideDrawer mainLinks={NAV} presaleLink={{ label:'Pre-Sale', href:'/pre-sale' }} moreMenuLinks={[{ label:'Gallery', href:'/gallery' }]} comingSoonLink={[]} onClose={() => setMob(false)} open={mob} handleClickContracts={() => { setContracts(p=>!p); setMob(false); }}/>
      <Contracts open={contracts} handleClose={() => setContracts(false)}/>

      <style>{`
        @media(max-width:900px){
          .vx-mob-btn{display:flex!important}
          .vx-nav,.vx-live{display:none!important}
        }
      `}</style>
    </Fragment>
  );
}
