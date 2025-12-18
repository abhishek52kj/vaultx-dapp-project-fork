import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PROPERTIES = [
  {
    id: 1,
    name: 'SKY PENTHOUSE #001',
    location: 'Manhattan, New York',
    price: '847.5 ETH',
    usd: '$2,847,000',
    bids: 12,
    img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=90',
    tags: ['PENTHOUSE', 'NFT #4821'],
    specs: { beds: 5, baths: 4, sqft: '8,200' },
    yield: '9.4%',
    change: '+24.7%',
  },
  {
    id: 2,
    name: 'OCEAN VILLA #007',
    location: 'Malibu, California',
    price: '612.0 ETH',
    usd: '$2,058,000',
    bids: 8,
    img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=90',
    tags: ['VILLA', 'NFT #2204'],
    specs: { beds: 6, baths: 5, sqft: '11,400' },
    yield: '7.8%',
    change: '+18.2%',
  },
  {
    id: 3,
    name: 'ALPINE ESTATE #012',
    location: 'Aspen, Colorado',
    price: '490.0 ETH',
    usd: '$1,646,000',
    bids: 5,
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=90',
    tags: ['ESTATE', 'NFT #0931'],
    specs: { beds: 7, baths: 6, sqft: '14,800' },
    yield: '11.2%',
    change: '+31.5%',
  },
];

function Stat({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, fontWeight: 800, color: accent || 'var(--cyan)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Rajdhani,sans-serif', fontSize: 10, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function HeroSection() {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const prop = PROPERTIES[active];

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % PROPERTIES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 88 }}>

      {/* BG image */}
      {PROPERTIES.map((p, i) => (
        <div key={p.id} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === active ? 0.18 : 0, transition: 'opacity 1.5s ease', zIndex: 0 }}/>
      ))}

      {/* Gradient overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(2,3,9,0.97) 0%, rgba(6,11,20,0.85) 50%, rgba(2,3,9,0.97) 100%)', zIndex: 1 }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--ink), transparent)', zIndex: 2 }}/>

      {/* Cyan glow orb */}
      <div style={{ position: 'absolute', top: '20%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 70%)', zIndex: 1, pointerEvents: 'none' }}/>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: 1400, margin: '0 auto', padding: '0 60px', display: 'grid', gridTemplateColumns: '1fr 480px', gap: 60, alignItems: 'center' }}>

        {/* Left: Hero text */}
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}>

          {/* Tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)', marginBottom: 28 }}>
            <div className="live-dot"/>
            <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--cyan)', letterSpacing: '.22em', textTransform: 'uppercase' }}>Featured Asset · Live Bidding</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(32px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 8, letterSpacing: '-0.02em' }}>
            <span style={{ color: '#E8F4FF' }}>THE FUTURE OF</span><br/>
            <span className="holo-text">REAL ESTATE</span><br/>
            <span style={{ color: '#E8F4FF' }}>IS ON-CHAIN</span>
          </h1>

          <p style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 16, color: 'rgba(232,244,255,0.55)', lineHeight: 1.7, maxWidth: 520, marginBottom: 36, marginTop: 20 }}>
            Fractional ownership of premium global properties as NFTs. Buy, trade, and earn yield on tokenized real estate with full on-chain transparency.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <button className="btn-cyber" onClick={() => navigate('/gallery')} style={{ fontSize: 11, padding: '14px 32px' }}>
              Explore Assets
            </button>
            <button className="btn-cyber btn-cyber-violet" onClick={() => navigate('/pre-sale')}>
              Join Pre-Sale
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 48 }}>
            <Stat label="Total Volume" value="$284M+" accent="var(--cyan)"/>
            <div style={{ width: 1, background: 'rgba(0,212,255,0.1)' }}/>
            <Stat label="Properties" value="1,847" accent="var(--violet)"/>
            <div style={{ width: 1, background: 'rgba(0,212,255,0.1)' }}/>
            <Stat label="Avg. Yield" value="9.4%" accent="#00FF88"/>
          </div>
        </div>

        {/* Right: Featured property card */}
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(40px)', transition: 'all 0.8s 0.2s cubic-bezier(0.4,0,0.2,1)' }}>
          <FeaturedCard prop={prop} onSelect={setActive} active={active}/>
        </div>
      </div>

      {/* Property selector dots */}
      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 4 }}>
        {PROPERTIES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? 'var(--cyan)' : 'rgba(0,212,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: i === active ? '0 0 12px rgba(0,212,255,0.6)' : 'none' }}/>
        ))}
      </div>
    </section>
  );
}

function FeaturedCard({ prop, onSelect, active }) {
  return (
    <div style={{ position: 'relative', background: 'rgba(6,16,32,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,212,255,0.2)', overflow: 'hidden', animation: 'glowPulse 4s ease-in-out infinite' }}>

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)', zIndex: 2 }}/>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTop: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)', zIndex: 2 }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottom: '2px solid var(--cyan)', borderLeft: '2px solid var(--cyan)', zIndex: 2 }}/>
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '2px solid var(--cyan)', borderRight: '2px solid var(--cyan)', zIndex: 2 }}/>

      {/* Image */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <img src={prop.img} alt={prop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 6s ease', transform: 'scale(1.05)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(6,16,32,0.9))' }}/>

        {/* Tags */}
        <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6 }}>
          {prop.tags.map(t => (
            <span key={t} style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, color: 'var(--cyan)', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', padding: '3px 8px', letterSpacing: '.1em' }}>{t}</span>
          ))}
        </div>

        {/* Yield badge */}
        <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', padding: '4px 10px' }}>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, fontWeight: 700, color: '#00FF88' }}>{prop.yield}</div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 7, color: 'rgba(0,255,136,0.6)', letterSpacing: '.1em' }}>YIELD</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '.04em', marginBottom: 4 }}>{prop.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="4" r="2.5" stroke="var(--cyan)" strokeWidth="1"/><path d="M5 10 C5 10, 1 6 1 4a4 4 0 0 1 8 0c0 2-4 6-4 6z" stroke="var(--cyan)" strokeWidth="1" fill="none"/></svg>
              <span style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 11, color: 'var(--muted)' }}>{prop.location}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, fontWeight: 800, color: 'var(--cyan)' }}>{prop.price}</div>
            <div style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 11, color: 'var(--muted)' }}>{prop.usd}</div>
          </div>
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[{ icon: '🛏', val: prop.specs.beds, label: 'Beds' }, { icon: '🚿', val: prop.specs.baths, label: 'Baths' }, { icon: '📐', val: prop.specs.sqft, label: 'sqft' }].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)', padding: '7px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, fontWeight: 700, color: '#E8F4FF' }}>{s.val}</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 7, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bids + Change */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{prop.bids} active bids</span>
          </div>
          <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: '#00FF88', background: 'rgba(0,255,136,0.08)', padding: '3px 8px', border: '1px solid rgba(0,255,136,0.15)' }}>{prop.change}</div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-cyber" style={{ flex: 1, fontSize: 10, padding: '11px 0', textAlign: 'center', clipPath: 'none' }} onClick={() => navigate && navigate('/pre-sale')}>Buy Now</button>
          <button className="btn-cyber btn-cyber-violet" style={{ flex: 1, fontSize: 10, padding: '11px 0', textAlign: 'center', clipPath: 'none' }}>Details</button>
        </div>
      </div>
    </div>
  );
}
