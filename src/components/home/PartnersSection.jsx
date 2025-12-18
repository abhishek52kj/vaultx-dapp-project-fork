const PARTNERS = ['Chainlink', 'OpenSea', 'Certik', 'Polygon', 'Uniswap', 'Binance', '1inch', 'CoinGecko'];

export default function PartnersSection() {
  return (
    <section style={{ padding: '80px 0', borderTop: '1px solid rgba(0,212,255,0.05)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.25em', textTransform: 'uppercase', marginBottom: 40 }}>Trusted Partners & Auditors</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {PARTNERS.map(p => (
            <div key={p} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 600, color: 'rgba(232,244,255,0.25)', letterSpacing: '.1em', transition: 'all 0.3s ease', cursor: 'default' }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'rgba(0,212,255,0.04)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'rgba(232,244,255,0.25)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
