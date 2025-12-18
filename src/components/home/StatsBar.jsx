const STATS = [
  { label: 'Total Value Locked', value: '$284M', sub: '+18.4% this month' },
  { label: 'Properties Tokenized', value: '1,847', sub: '42 new this week' },
  { label: 'Active Holders', value: '28,491', sub: 'Across 94 countries' },
  { label: 'Avg. Annual Yield', value: '9.4%', sub: 'Paid monthly in ETH' },
  { label: 'Total Transactions', value: '4.2M+', sub: 'Since genesis block' },
];

export default function StatsBar() {
  return (
    <div style={{ background: 'rgba(0,212,255,0.03)', borderTop: '1px solid rgba(0,212,255,0.08)', borderBottom: '1px solid rgba(0,212,255,0.08)', padding: '28px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--ink), transparent 10%, transparent 90%, var(--ink))', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(0,212,255,0.1)' }}/>}
            <div>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 20, fontWeight: 800, color: 'var(--cyan)', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 11, color: 'rgba(0,255,136,0.6)', marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
