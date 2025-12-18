const PHASES = [
  { phase: 'Q1 2025', title: 'Genesis', items: ['Smart contract audit', 'NFT minting engine', 'Testnet launch'], done: true },
  { phase: 'Q2 2025', title: 'Alpha', items: ['Mainnet launch', 'First 50 properties', 'Marketplace v1'], done: true },
  { phase: 'Q3 2025', title: 'Expansion', items: ['Multi-chain bridge', 'Mobile app beta', 'DAO governance'], done: false, active: true },
  { phase: 'Q4 2025', title: 'Scale', items: ['500 properties', 'Institutional API', 'Real estate fund'], done: false },
  { phase: 'Q1 2026', title: 'Horizon', items: ['AI valuation v2', 'Metaverse integration', 'Global expansion'], done: false },
];

export default function RoadmapSection() {
  return (
    <section style={{ padding: '120px 0', background: 'rgba(6,11,20,0.3)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--violet)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 16 }}>// ROADMAP</div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: '#E8F4FF', letterSpacing: '-0.02em' }}>
            Building the <span style={{ color: 'var(--violet)', textShadow: '0 0 20px rgba(123,97,255,0.5)' }}>Protocol</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: 2, position: 'relative' }}>
          {/* Timeline bar */}
          <div style={{ position: 'absolute', top: 38, left: 0, right: 0, height: 1, background: 'rgba(0,212,255,0.1)' }}/>

          {PHASES.map((p, i) => (
            <div key={p.phase} style={{ flex: 1, paddingTop: 72, position: 'relative' }}>
              {/* Dot */}
              <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', width: 20, height: 20, border: `2px solid ${p.done ? 'var(--cyan)' : p.active ? 'var(--violet)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '50%', background: p.done ? 'var(--cyan)' : p.active ? 'rgba(123,97,255,0.3)' : 'var(--ink2)', boxShadow: p.active ? '0 0 20px rgba(123,97,255,0.6)' : p.done ? '0 0 10px rgba(0,212,255,0.4)' : 'none', zIndex: 2 }}>
                {p.done && <div style={{ position: 'absolute', inset: 3, background: 'var(--ink)', borderRadius: '50%' }}/>}
                {p.active && <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '1px solid rgba(123,97,255,0.3)', animation: 'pulse-ring 1.5s ease-out infinite' }}/>}
              </div>

              <div style={{ background: p.active ? 'rgba(123,97,255,0.05)' : 'rgba(6,11,20,0.6)', border: `1px solid ${p.active ? 'rgba(123,97,255,0.25)' : 'rgba(0,212,255,0.07)'}`, padding: '20px 18px', backdropFilter: 'blur(12px)' }}>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, color: p.active ? 'var(--violet)' : 'var(--muted)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 6 }}>{p.phase}{p.active && ' · NOW'}</div>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: p.done ? 'var(--cyan)' : p.active ? 'var(--violet)' : '#E8F4FF', marginBottom: 14 }}>{p.title}</div>
                {p.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 4, height: 4, background: p.done ? 'var(--cyan)' : p.active ? 'var(--violet)' : 'var(--muted)', borderRadius: '50%', flexShrink: 0 }}/>
                    <span style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 12, color: p.done ? 'rgba(232,244,255,0.6)' : p.active ? 'rgba(232,244,255,0.8)' : 'rgba(232,244,255,0.35)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
