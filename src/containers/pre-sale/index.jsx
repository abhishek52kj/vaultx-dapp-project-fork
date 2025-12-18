import PhaseI from '../../components/pre-sale/PhaseI/Renderer';
import ParticleCanvas from '../../components/ui/ParticleCanvas';
import { Link } from 'react-router-dom';

const STEPS=[{n:'01',t:'Connect Wallet',d:'MetaMask or WalletConnect — no KYC required'},{n:'02',t:'Select Network',d:'Ethereum mainnet or supported testnet'},{n:'03',t:'Enter Amount',d:'Minimum 0.01 ETH · 2,000,000 VTX per ETH'},{n:'04',t:'Confirm Buy',d:'Non-custodial · smart contract enforced'}];

export default function PreSale() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)' }}>
      {/* Hero */}
      <div style={{ position:'relative', paddingTop:140, paddingBottom:80, overflow:'hidden' }}>
        <div className="grid-bg" style={{ position:'absolute', inset:0 }}/>
        <ParticleCanvas style={{ opacity:.5 }}/>
        {/* Glow orbs */}
        <div style={{ position:'absolute', left:'-10%', top:'30%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,255,.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:2 }}/>
        <div style={{ position:'absolute', right:'-5%', bottom:'-20%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(123,97,255,.06) 0%,transparent 70%)', pointerEvents:'none', zIndex:2 }}/>

        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px', position:'relative', zIndex:3 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
            <div className="live-dot"/>
            <span style={{ fontFamily:'Fira Code,monospace', fontSize:9, color:'var(--green)', letterSpacing:'.16em', textTransform:'uppercase' }}>Round One · Public Presale Now Live</span>
          </div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(56px,8vw,100px)', lineHeight:.9, color:'#E8E8F0', letterSpacing:'.02em', marginBottom:20 }}>
            ACQUIRE VTX<br/><span style={{ color:'var(--cyan)', textShadow:'0 0 30px rgba(0,212,255,.45)' }}>BEFORE LISTING</span>
          </h1>
          <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:15, color:'var(--muted)', lineHeight:1.8, maxWidth:520, marginBottom:48 }}>
            Fixed-rate presale. 100,000,000 VTX available. If the soft cap is not reached, every depositor is refunded 100% — guaranteed by the contract.
          </p>

          {/* Steps */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:0 }}>
            {STEPS.map((s,i)=>(
              <div key={s.n} style={{
                flex:'1 1 180px', padding:'18px 20px', borderRadius:10,
                background:'rgba(0,212,255,.04)', border:'1px solid rgba(0,212,255,.12)',
                animation:`fadeUp .5s ${i*.1}s both`,
              }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:'var(--cyan)', letterSpacing:'.06em', lineHeight:1, marginBottom:8 }}>{s.n}</div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:14, fontWeight:700, color:'#E8E8F0', marginBottom:5 }}>{s.t}</div>
                <div style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:11.5, color:'var(--muted)', lineHeight:1.6 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'60px 60px 100px', display:'flex', flexWrap:'wrap', gap:48, alignItems:'flex-start' }}>
        {/* Left info */}
        <div style={{ flex:'1 1 400px' }}>
          <div className="tag" style={{ marginBottom:18 }}><span>Phase I · Active</span></div>
          <h2 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(36px,4vw,54px)', color:'#E8E8F0', letterSpacing:'.04em', lineHeight:1, marginBottom:16 }}>
            PUBLIC <span className="neon">TOKEN SALE</span>
          </h2>
          <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:13.5, color:'var(--muted)', lineHeight:1.85, maxWidth:460, marginBottom:32 }}>
            2,000,000 VTX per ETH. 100 ETH hard cap. All transactions are non-custodial and enforced by the presale smart contract on Ethereum.
          </p>

          {/* Property showcase */}
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(0,212,255,.12)' }}>
            <div style={{ position:'relative', height:220, overflow:'hidden' }}>
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85" alt="Property" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,5,16,.9),transparent)' }}/>
              <div style={{ position:'absolute', bottom:16, left:20 }}>
                <div style={{ fontFamily:'Fira Code,monospace', fontSize:8, color:'var(--cyan)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:5 }}>Featured Property</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'#E8E8F0', letterSpacing:'.04em' }}>Malibu Oceanfront Villa #001</div>
              </div>
            </div>
            <div style={{ padding:'16px 20px', background:'var(--surface)' }}>
              {[['Valuation','$4,200,000'],['Rental Yield','9.4% APY'],['Token Allocation','42,000 VTX'],['Location','Malibu, CA']].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                  <span style={{ fontFamily:'Fira Code,monospace', fontSize:9, color:'var(--dim)', letterSpacing:'.12em', textTransform:'uppercase' }}>{k}</span>
                  <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:12, color:'var(--cyan)', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk disclaimer */}
          <div style={{ marginTop:20, padding:'14px 18px', borderRadius:8, background:'rgba(255,69,96,.05)', border:'1px solid rgba(255,69,96,.15)' }}>
            <div style={{ fontFamily:'Fira Code,monospace', fontSize:8, color:'var(--red)', letterSpacing:'.15em', textTransform:'uppercase', marginBottom:5 }}>Risk Disclaimer</div>
            <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:11, color:'rgba(255,69,96,.7)', lineHeight:1.7 }}>
              Cryptocurrency investments carry significant risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
            </p>
          </div>
        </div>

        {/* Right: Presale card */}
        <div style={{ flex:'0 1 440px' }}>
          <PhaseI />
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
