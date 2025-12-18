import TokenPools from '../../components/stake/TokenPools';
import StakeSteps from '../../components/stake/StakeSteps';
import HowToStake from '../../components/stake/HowToStake';
import ParticleCanvas from '../../components/ui/ParticleCanvas';

const APR_DATA=[{l:'7-Day Lock',v:'12.5%',c:'var(--cyan)'},{l:'30-Day Lock',v:'24.8%',c:'var(--violet)'},{l:'90-Day Lock',v:'48.2%',c:'var(--green)'}];

export default function Stake() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--ink)' }}>
      {/* Hero */}
      <div style={{ position:'relative', paddingTop:140, paddingBottom:80, overflow:'hidden' }}>
        <div className="grid-bg" style={{ position:'absolute', inset:0 }}/>
        <ParticleCanvas style={{ opacity:.4 }}/>
        <div style={{ position:'absolute', right:'-8%', top:'20%', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(123,97,255,.07) 0%,transparent 70%)', pointerEvents:'none', zIndex:2 }}/>

        <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px', position:'relative', zIndex:3 }}>
          <div className="tag" style={{ marginBottom:20 }}><span>VaultX Protocol</span></div>
          <h1 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'clamp(56px,8vw,100px)', lineHeight:.9, color:'#E8E8F0', letterSpacing:'.02em', marginBottom:20 }}>
            STAKE $VTX,<br/><span className="neon-v">EARN MORE</span>
          </h1>
          <p style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:15, color:'var(--muted)', lineHeight:1.8, maxWidth:520, marginBottom:48 }}>
            Stake VTX tokens to earn high APR. First approve, then select a lockup period, enter an amount, and stake. 250,000,000 VTX reserved for stakers.
          </p>

          {/* APR cards */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {APR_DATA.map((a,i)=>(
              <div key={a.l} style={{ flex:'1 1 160px', padding:'20px 22px', borderRadius:10, background:`${a.c}10`, border:`1px solid ${a.c}30`, animation:`fadeUp .5s ${i*.1}s both` }}>
                <div style={{ fontFamily:'Fira Code,monospace', fontSize:8, color:a.c, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:8 }}>{a.l}</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:40, color:a.c, letterSpacing:'.04em', lineHeight:1, textShadow:`0 0 20px ${a.c}60` }}>{a.v}</div>
                <div style={{ fontFamily:'Fira Code,monospace', fontSize:8, color:'var(--dim)', letterSpacing:'.1em', marginTop:4 }}>APR</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1440, margin:'0 auto', padding:'0 60px 100px', display:'flex', flexWrap:'wrap', gap:48, alignItems:'flex-start' }}>
        {/* Left */}
        <div style={{ flex:'1 1 420px' }}>
          {/* Property image */}
          <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(123,97,255,.15)', marginBottom:32 }}>
            <div style={{ position:'relative', height:200 }}>
              <img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80" alt="Staking" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,5,16,.9),transparent)' }}/>
              <div style={{ position:'absolute', bottom:16, left:20 }}>
                <div style={{ fontFamily:'Fira Code,monospace', fontSize:8, color:'var(--violet)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:5 }}>Staking Rewards Pool</div>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:22, color:'#E8E8F0', letterSpacing:'.04em' }}>250,000,000 VTX Reserved</div>
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:'var(--violet)', letterSpacing:'.06em', marginBottom:16 }}>HOW TO STAKE</h3>
          <StakeSteps />
          <div style={{ marginTop:28 }}><HowToStake /></div>
        </div>

        {/* Right: Staking pool */}
        <div style={{ flex:'0 1 440px' }}>
          <h3 style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:28, color:'var(--cyan)', letterSpacing:'.06em', marginBottom:16 }}>STAKING POOL</h3>
          <TokenPools />
        </div>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
