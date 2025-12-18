import ParticleCanvas from '../../components/ui/ParticleCanvas';
import kevin from 'assets/images/team/kevin.png';
import derek from 'assets/images/team/derek.png';
import ajay from 'assets/images/team/ajay.png';
import vladimir from 'assets/images/team/vladimir.png';
import bhumish from 'assets/images/team/bhumish.png';
import gow from 'assets/images/team/gow.png';
import PartnersSection from '../../components/home/PartnersSection';
import { useEffect, useRef } from 'react';

const TEAM=[
  {n:'Kevin Smith',t:'CEO & Co-Founder',img:kevin,bio:'Co-founder of VaultX Protocol, driving the vision of democratized real estate investment through blockchain.'},
  {n:'Derek Smith',t:'Dev & Testing Lead',img:derek,bio:'6+ years in blockchain development and smart contract testing. Ensures protocol integrity.'},
  {n:'Ajay Jain',t:'Web Development',img:ajay,bio:'Full-stack web architect building the interfaces that connect users to on-chain real estate.'},
  {n:'Vladimir Urosevic',t:'Operations',img:vladimir,bio:'Operations and support specialist managing day-to-day protocol infrastructure.'},
  {n:'Bhumish Shaw',t:'Infrastructure Lead',img:bhumish,bio:'Server architecture and DevOps ensuring 99.9% uptime across all protocol systems.'},
  {n:'Gow Patel',t:'Mobile Dev',img:gow,bio:'Mobile engineer building the iOS and Android apps for on-the-go portfolio management.'},
];

const STATS=[{v:'$48M+',l:'Tokenized Assets'},{v:'9.4%',l:'Avg. APY'},{v:'340+',l:'Token Holders'},{v:'6',l:'Team Members'}];

function useRV() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.querySelectorAll('.rv,.rv-l').forEach(r => r.classList.add('in')); obs.unobserve(el); } }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}

const TeamCard=({m,i})=>{
  const ref=useRef(null);
  useEffect(()=>{ const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting){el.classList.add('in');obs.unobserve(el);} },{threshold:.1});
    obs.observe(el); return()=>obs.disconnect();
  },[]);
  return (
    <div ref={ref} className="rv glass-card" style={{ transitionDelay:`${i*.07}s`, overflow:'hidden' }}>
      <div style={{ height:200, overflow:'hidden', position:'relative', background:'var(--surface2)' }}>
        <img src={m.img} alt={m.n} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top', transition:'transform .5s cubic-bezier(.22,1,.36,1)', filter:'grayscale(.2)' }}
          onMouseOver={e=>{e.currentTarget.style.transform='scale(1.06)';}}
          onMouseOut={e=>{e.currentTarget.style.transform='scale(1)';}}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,5,16,.8),transparent 50%)' }}/>
      </div>
      <div style={{ padding:'20px 22px' }}>
        <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:16, fontWeight:700, color:'#E8E8F0', marginBottom:3 }}>{m.n}</div>
        <div style={{ fontFamily:'Fira Code,monospace', fontSize:9, color:'var(--cyan)', letterSpacing:'.14em', textTransform:'uppercase', marginBottom:12 }}>{m.t}</div>
        <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>{m.bio}</div>
      </div>
    </div>
  );
};

export default function About() {
  const sec1=useRV(), sec2=useRV(), sec3=useRV();
  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)' }}>
      {/* Hero */}
      <div style={{ position:'relative', paddingTop:140, paddingBottom:100, overflow:'hidden' }}>
        <div className="grid-bg" style={{ position:'absolute', inset:0 }}/>
        <ParticleCanvas style={{ opacity:.5 }}/>
        <div style={{ position:'absolute', left:'40%', top:'50%', transform:'translate(-50%,-50%)', width:800, height:800, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,255,.05) 0%,transparent 70%)', pointerEvents:'none', zIndex:2 }}/>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=60" alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:.05, pointerEvents:'none' }}/>

        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px', position:'relative', zIndex:3 }}>
          <div className="tag" style={{ marginBottom:20 }}><span>About VaultX</span></div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(56px,8vw,100px)', lineHeight:.9, color:'#E8E8F0', letterSpacing:'.02em', marginBottom:24 }}>
            BUILT ON PRINCIPLE.<br/><span className="neon">DESIGNED TO LAST.</span>
          </h1>
          <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:16, color:'var(--muted)', lineHeight:1.85, maxWidth:580 }}>
            VaultX is a blockchain protocol enabling fractional ownership of premium real estate through tokenized NFTs, delivering transparent on-chain rental yield to holders worldwide.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div ref={sec1} style={{ borderTop:'1px solid rgba(0,212,255,.1)', borderBottom:'1px solid rgba(0,212,255,.1)', background:'var(--ink2)' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px', display:'flex', flexWrap:'wrap' }}>
          {STATS.map((s,i)=>(
            <div key={s.l} className="rv" style={{ flex:'1 1 140px', padding:'32px 28px', borderRight:'1px solid rgba(255,255,255,.05)', transitionDelay:`${i*.08}s` }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:42, color:'var(--cyan)', letterSpacing:'.04em', lineHeight:1, marginBottom:5 }}>{s.v}</div>
              <div style={{ fontFamily:'Fira Code,monospace', fontSize:9, color:'var(--dim)', letterSpacing:'.18em', textTransform:'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div ref={sec2} style={{ padding:'100px 0', background:'var(--ink)' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px', display:'flex', flexWrap:'wrap', gap:60, alignItems:'center' }}>
          <div style={{ flex:'1 1 380px' }}>
            <div className="rv">
              <div className="tag" style={{ marginBottom:18 }}><span>Our Mission</span></div>
              <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(40px,5vw,64px)', color:'#E8E8F0', letterSpacing:'.04em', lineHeight:.95, marginBottom:24 }}>
                DEMOCRATIZING <span className="neon-v">REAL ESTATE</span>
              </h2>
              <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, color:'var(--muted)', lineHeight:1.85, marginBottom:20 }}>
                Traditionally, premium real estate was reserved for institutional investors. VaultX breaks this barrier — tokenizing million-dollar properties into affordable NFT fractions anyone can own.
              </p>
              <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, color:'var(--muted)', lineHeight:1.85 }}>
                Each token represents a legally-backed fractional share, with on-chain rental distributions sent directly to holders every 30 days in USDC.
              </p>
            </div>
          </div>
          <div style={{ flex:'1 1 400px' }}>
            <div className="rv-r" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                {icon:'🏛️',t:'Legal Compliance',d:'All properties held by DAO-governed SPVs with quarterly appraisals'},
                {icon:'⛓️',t:'On-Chain Yield',d:'Rental income distributed in USDC every 30 days automatically'},
                {icon:'🔐',t:'Non-Custodial',d:'You control your tokens. No intermediaries, no third-party risk'},
                {icon:'🌍',t:'Global Access',d:'Invest in properties across 8+ international markets from anywhere'},
              ].map(f=>(
                <div key={f.t} className="glass-card" style={{ padding:'20px 18px' }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{f.icon}</div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:13, fontWeight:700, color:'#E8E8F0', marginBottom:7 }}>{f.t}</div>
                  <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:11.5, color:'var(--muted)', lineHeight:1.6 }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div ref={sec3} style={{ padding:'100px 0', background:'var(--ink2)', borderTop:'1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px' }}>
          <div className="rv" style={{ marginBottom:60 }}>
            <div className="tag" style={{ marginBottom:18 }}><span>The Team</span></div>
            <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(40px,5vw,64px)', color:'#E8E8F0', letterSpacing:'.04em', lineHeight:.95 }}>
              MEET THE <span className="neon">BUILDERS</span>
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {TEAM.map((m,i)=><TeamCard key={m.n} m={m} i={i}/>)}
          </div>
        </div>
      </div>

      <PartnersSection />
    </div>
  );
}
