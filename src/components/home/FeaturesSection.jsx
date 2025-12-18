const FEATURES = [
  { icon: '◈', title: 'Fractional Ownership', desc: 'Own a share of premium global properties starting from 0.01 ETH. Full on-chain transparency with ERC-721 tokens.', accent: 'var(--cyan)' },
  { icon: '⬡', title: 'Real Yield Generation', desc: 'Earn passive rental income distributed automatically to your wallet every 30 days via smart contracts.', accent: 'var(--violet)' },
  { icon: '◉', title: 'Instant Liquidity', desc: 'Trade your property NFTs 24/7 on our marketplace or any compatible DEX without lockup periods.', accent: '#00FF88' },
  { icon: '▣', title: 'AI Valuation Engine', desc: 'Real-time property valuations powered by our proprietary AI model trained on 50M+ data points.', accent: '#FFD700' },
  { icon: '⬢', title: 'Multi-Chain Support', desc: 'Assets available on Ethereum, BNB Chain, and Polygon. Bridge seamlessly between networks.', accent: 'var(--cyan)' },
  { icon: '◆', title: 'KYC-Free Trading', desc: 'Permissionless trading with optional KYC for premium tiers. Your keys, your assets.', accent: 'var(--violet)' },
];

export default function FeaturesSection() {
  return (
    <section style={{ padding: '120px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--cyan)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 16 }}>// PROTOCOL FEATURES</div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#E8F4FF', letterSpacing: '-0.02em' }}>
            Built for the <span className="holo-text">Next Generation</span>
          </h2>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i}/>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, i }) {
  return (
    <div className="card-lift" style={{ background: 'rgba(6,11,20,0.8)', border: '1px solid rgba(0,212,255,0.07)', padding: '36px 32px', position: 'relative', overflow: 'hidden', cursor: 'default', backdropFilter: 'blur(12px)', animationDelay: `${i * 0.08}s` }}>
      {/* Hover gradient */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 20% 20%, ${f.accent}08 0%, transparent 60%)`, pointerEvents: 'none' }}/>

      {/* Icon */}
      <div style={{ fontSize: 32, color: f.accent, marginBottom: 20, filter: `drop-shadow(0 0 8px ${f.accent})`, display: 'block' }}>{f.icon}</div>

      <h3 style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: '#E8F4FF', letterSpacing: '.06em', marginBottom: 12, textTransform: 'uppercase' }}>{f.title}</h3>
      <p style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 14, color: 'rgba(232,244,255,0.45)', lineHeight: 1.7 }}>{f.desc}</p>

      {/* Bottom accent line */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${f.accent}40, transparent)` }}/>

      {/* Index */}
      <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'Space Mono,monospace', fontSize: 9, color: `${f.accent}30`, letterSpacing: '.1em' }}>0{String(i + 1).padStart(2, '0')}</div>
    </div>
  );
}
