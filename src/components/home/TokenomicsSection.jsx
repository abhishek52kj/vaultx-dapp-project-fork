export default function TokenomicsSection() {
  const segments = [
    { label: 'Ecosystem & Rewards', pct: 35, color: 'var(--cyan)' },
    { label: 'Property Reserve', pct: 25, color: 'var(--violet)' },
    { label: 'Team & Advisors', pct: 15, color: '#00FF88' },
    { label: 'Public Sale', pct: 15, color: '#FFD700' },
    { label: 'Marketing', pct: 10, color: '#FF6B6B' },
  ];

  let cumulative = 0;
  const r = 80, cx = 110, cy = 110;
  const circumference = 2 * Math.PI * r;

  return (
    <section style={{ padding: '120px 0', background: 'rgba(6,11,20,0.5)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

        <div>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 10, color: 'var(--violet)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 16 }}>// TOKENOMICS</div>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 800, color: '#E8F4FF', marginBottom: 20, letterSpacing: '-0.02em' }}>
            VTX Token<br/><span style={{ color: 'var(--violet)' }}>Distribution</span>
          </h2>
          <p style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 15, color: 'rgba(232,244,255,0.5)', lineHeight: 1.8, marginBottom: 40 }}>
            Total supply of 100,000,000 VTX. Governance, staking rewards, and fee discounts for holders. Deflationary mechanics with quarterly burns.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {segments.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 8px ${s.color}` }}/>
                <div style={{ flex: 1, fontFamily: 'Exo 2,sans-serif', fontSize: 14, color: 'rgba(232,244,255,0.7)' }}>{s.label}</div>
                <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 700, color: s.color }}>{s.pct}%</div>
                <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct / 35 * 100}%`, background: s.color, borderRadius: 2, boxShadow: `0 0 6px ${s.color}` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <svg width={220} height={220} viewBox="0 0 220 220">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {segments.map((s, i) => {
                const offset = circumference * (1 - cumulative / 100);
                const dash = circumference * s.pct / 100;
                const prevCumulative = cumulative;
                cumulative += s.pct;
                return (
                  <circle key={s.label} cx={cx} cy={cy} r={r}
                    fill="none" stroke={s.color} strokeWidth={20}
                    strokeDasharray={`${dash - 2} ${circumference - dash + 2}`}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    filter="url(#glow)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                );
              })}
              <circle cx={cx} cy={cy} r={60} fill="rgba(6,11,20,0.9)" stroke="rgba(0,212,255,0.1)" strokeWidth={1}/>
              <text x={cx} y={cy - 8} textAnchor="middle" fill="#E8F4FF" fontFamily="Orbitron,monospace" fontSize="18" fontWeight="800">100M</text>
              <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--muted)" fontFamily="Space Mono,monospace" fontSize="8">VTX TOTAL</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
