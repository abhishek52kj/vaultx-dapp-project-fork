const STEPS = [
  { n: '01', t: 'Connect Wallet', d: 'Link MetaMask, WalletConnect, or any Web3 wallet. Supports 40+ providers across all major chains.' },
  { n: '02', t: 'Browse Properties', d: 'Explore our curated gallery of tokenized real estate from over 30 countries worldwide.' },
  { n: '03', t: 'Purchase NFT', d: 'Buy fractional or whole property tokens using ETH, BNB, or USDC. Instant settlement.' },
  { n: '04', t: 'Earn & Trade', d: 'Receive monthly rental yield directly to your wallet. Trade your tokens anytime on our marketplace.' },
];

export default function HowToSection() {
  return (
    <section style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--cyan)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 16 }}>// HOW IT WORKS</div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, color: '#E8F4FF', letterSpacing: '-0.02em' }}>
            Four Steps to <span style={{ color: 'var(--cyan)', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>Ownership</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ position: 'relative', padding: '40px 28px', background: 'rgba(6,11,20,0.7)', border: '1px solid rgba(0,212,255,0.07)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
              {/* Connector line */}
              {i < 3 && <div style={{ position: 'absolute', top: 52, right: -1, width: 2, height: 24, background: 'linear-gradient(to bottom, var(--cyan), transparent)', zIndex: 2 }}/>}

              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 48, fontWeight: 900, color: 'rgba(0,212,255,0.06)', position: 'absolute', top: 12, right: 18, lineHeight: 1 }}>{s.n}</div>

              <div style={{ width: 40, height: 40, border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: 'rgba(0,212,255,0.05)' }}>
                <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 800, color: 'var(--cyan)' }}>{s.n}</span>
              </div>

              <h3 style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: '#E8F4FF', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 12 }}>{s.t}</h3>
              <p style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 13, color: 'rgba(232,244,255,0.45)', lineHeight: 1.7 }}>{s.d}</p>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, var(--cyan)${i % 2 === 0 ? '' : '80'}, transparent)` }}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
