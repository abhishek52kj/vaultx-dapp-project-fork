import { useNavigate } from 'react-router-dom';

const LINKS = {
  Protocol: ['Buy Property', 'Sell NFT', 'Stake VTX', 'Governance'],
  Resources: ['Whitepaper', 'Documentation', 'Smart Contracts', 'Bug Bounty'],
  Company: ['About', 'Team', 'Press', 'Careers'],
};

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{ borderTop: '1px solid rgba(0,212,255,0.08)', background: 'rgba(6,11,20,0.95)', paddingTop: 60, paddingBottom: 32 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 60, marginBottom: 52 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 22, fontWeight: 900, color: '#E8F4FF', letterSpacing: '.08em', marginBottom: 6 }}>
              VAULT<span style={{ color: 'var(--cyan)', textShadow: '0 0 20px rgba(0,212,255,0.6)' }}>X</span>
            </div>
            <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 8, color: 'var(--muted)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 20 }}>REAL ESTATE PROTOCOL</div>
            <p style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 13, color: 'rgba(232,244,255,0.35)', lineHeight: 1.8, maxWidth: 260 }}>The on-chain real estate protocol powering the future of property ownership.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['𝕏', '◎', '⬡'].map(icon => (
                <button key={icon} style={{ width: 34, height: 34, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', color: 'var(--muted)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)'; e.currentTarget.style.color = 'var(--muted)'; }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>{group}</div>
              {items.map(item => (
                <div key={item} style={{ fontFamily: 'Exo 2,sans-serif', fontSize: 13, color: 'rgba(232,244,255,0.35)', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = '#E8F4FF'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(232,244,255,0.35)'}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(0,212,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--muted)', letterSpacing: '.1em' }}>© 2025 VAULTX PROTOCOL. ALL RIGHTS RESERVED.</div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Risk Disclosure'].map(l => (
              <span key={l} style={{ fontFamily: 'Space Mono,monospace', fontSize: 9, color: 'var(--muted)', cursor: 'pointer', letterSpacing: '.08em' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--muted)'}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
