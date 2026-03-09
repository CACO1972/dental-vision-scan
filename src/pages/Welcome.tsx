import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Scan, Shield, Zap, Users } from 'lucide-react';

const T = {
  base: '#080808', surface: '#0E0C1A', surface2: '#1A1826',
  border: 'rgba(255,255,255,0.08)', primary: '#FFFFFF',
  accent: '#9D95FF', accentSoft: '#C4BFFF',
  muted: 'rgba(255,255,255,0.38)', green: '#0AE448',
};

const Noise = () => (
  <div style={{
    position:'fixed',inset:0,pointerEvents:'none',zIndex:1,opacity:.022,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize:'256px',
  }}/>
);

const RadarBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let angle = 0, raf: number;
    const dots = Array.from({length:6},()=>({a:Math.random()*Math.PI*2,r:60+Math.random()*120,birth:Math.random()*360}));
    const draw = () => {
      const W = canvas.width = canvas.offsetWidth;
      const H = canvas.height = canvas.offsetHeight;
      const cx = W/2, cy = H/2, R = Math.max(W,H)*.55;
      ctx.fillStyle='rgba(8,8,8,0.25)'; ctx.fillRect(0,0,W,H);
      [0.2,0.4,0.6,0.8,1].forEach(f=>{
        ctx.beginPath();ctx.arc(cx,cy,R*f,0,Math.PI*2);
        ctx.strokeStyle=`rgba(157,149,255,0.06)`;ctx.lineWidth=1;ctx.stroke();
      });
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
      ctx.strokeStyle='rgba(157,149,255,0.5)';ctx.lineWidth=1.5;ctx.shadowBlur=12;ctx.shadowColor=T.accent;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(R,0);ctx.stroke();ctx.shadowBlur=0;
      for(let da=0;da<Math.PI*.6;da+=0.04){
        ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,angle-da,angle-da+0.05);
        ctx.fillStyle=`rgba(157,149,255,${0.025*(1-da/(Math.PI*.6))})`;ctx.fill();
      }
      ctx.restore();
      dots.forEach(d=>{
        const diff=(angle-d.birth+Math.PI*4)%(Math.PI*2);
        const alpha=diff<0.15?0.7:Math.max(0,0.7-diff/(Math.PI*2)*2);
        if(alpha>0){
          const x=cx+Math.cos(d.a)*d.r,y=cy+Math.sin(d.a)*d.r;
          ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);
          ctx.fillStyle=`rgba(157,149,255,${alpha})`;ctx.shadowBlur=8;ctx.shadowColor=T.accent;ctx.fill();ctx.shadowBlur=0;
        }
      });
      angle=(angle+0.008)%(Math.PI*2);raf=requestAnimationFrame(draw);
    };
    draw(); return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.7}}/>;
};

const Welcome = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setTimeout(()=>setMounted(true),80); },[]);

  const stats = [
    { n:'+2.847', l:'análisis esta semana' },
    { n:'98.4%', l:'precisión caries' },
    { n:'2 min', l:'resultado' },
  ];

  return (
    <div style={{minHeight:'100vh',background:T.base,color:T.primary,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
      <Noise/>

      {/* BG canvas */}
      <div style={{position:'absolute',inset:0,zIndex:0}}>
        <RadarBg/>
      </div>

      {/* Top bar */}
      <header style={{position:'relative',zIndex:10,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,border:`2px solid ${T.accent}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Scan size={14} color={T.accent}/>
          </div>
          <span style={{fontFamily:'Anton',fontSize:16,letterSpacing:'0.06em',color:T.primary}}>SCANDENT</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,fontFamily:'Space Mono',fontSize:8,color:T.green,letterSpacing:'0.2em'}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:T.green,boxShadow:`0 0 8px ${T.green}`,animation:'pulse 2s infinite'}}/>
          ONLINE
        </div>
      </header>

      {/* Main */}
      <main style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'32px 24px 24px',position:'relative',zIndex:10,maxWidth:480,margin:'0 auto',width:'100%'}}>

        {/* Badge */}
        <div style={{
          display:'inline-flex',alignItems:'center',gap:8,
          border:`1px solid ${T.accent}40`,padding:'5px 14px',
          marginBottom:28,alignSelf:'flex-start',
          opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(12px)',
          transition:'all 0.5s',
        }}>
          <div style={{width:5,height:5,borderRadius:'50%',background:T.green,boxShadow:`0 0 6px ${T.green}`}}/>
          <span style={{fontFamily:'Space Mono',fontSize:8,color:T.accent,letterSpacing:'0.2em',textTransform:'uppercase'}}>IA Dental · HUMANA.AI</span>
        </div>

        {/* Headline */}
        <div style={{opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(20px)',transition:'all 0.6s 0.1s',marginBottom:20}}>
          <h1 style={{fontFamily:'Anton',fontSize:'clamp(52px,14vw,80px)',lineHeight:.88,letterSpacing:'-0.01em',textTransform:'uppercase',marginBottom:12}}>
            TUS DIENTES.<br/>
            <span style={{color:T.accent}}>LA VERDAD.</span>
          </h1>
          <p style={{fontFamily:'DM Sans',fontSize:16,color:T.muted,lineHeight:1.7,maxWidth:360}}>
            Orientación visual dental desde tu teléfono. Sin esperas. Sin costo inicial. Resultado en 2 minutos.
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:2,
          marginBottom:28,
          opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(16px)',transition:'all 0.6s 0.2s',
        }}>
          {stats.map((s,i)=>(
            <div key={i} style={{padding:'14px 12px',background:T.surface,border:`1px solid ${T.border}`,textAlign:'center'}}>
              <div style={{fontFamily:'Anton',fontSize:22,color:i===0?T.primary:T.accent,letterSpacing:'-0.01em',lineHeight:1}}>{s.n}</div>
              <div style={{fontFamily:'Space Mono',fontSize:7,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:4,lineHeight:1.4}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          display:'flex',flexDirection:'column',gap:8,marginBottom:28,
          opacity:mounted?1:0,transition:'all 0.6s 0.3s',
        }}>
          {[
            {icon:<Zap size={14}/>, text:'Resultado orientativo en menos de 2 minutos'},
            {icon:<Shield size={14}/>, text:'100% privado · Sin registro requerido'},
            {icon:<Users size={14}/>, text:'+2.847 personas analizadas esta semana'},
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:'rgba(157,149,255,0.04)',border:`1px solid ${T.border}`}}>
              <span style={{color:T.accent,flexShrink:0}}>{f.icon}</span>
              <span style={{fontFamily:'DM Sans',fontSize:13,color:'rgba(255,255,255,0.55)'}}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(12px)',transition:'all 0.5s 0.4s',
          display:'flex',flexDirection:'column',gap:10,
        }}>
          <button
            onClick={()=>navigate('/intro-captura')}
            style={{
              width:'100%',padding:'18px 0',background:T.accent,color:T.base,
              fontFamily:'Anton',fontSize:18,letterSpacing:'0.08em',textTransform:'uppercase',
              border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,
              boxShadow:`0 0 40px ${T.accent}30`,
              transition:'transform 0.15s,box-shadow 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 40px ${T.accent}50`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 40px ${T.accent}30`;}}
          >
            ANALIZAR GRATIS <ArrowRight size={20}/>
          </button>

          <button
            onClick={()=>navigate('/subir-foto')}
            style={{
              width:'100%',padding:'14px 0',background:'transparent',color:'rgba(255,255,255,0.4)',
              fontFamily:'Space Mono',fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',
              border:`1px solid ${T.border}`,cursor:'pointer',
              transition:'color 0.15s,border-color 0.15s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.color=T.primary;e.currentTarget.style.borderColor='rgba(255,255,255,0.3)';}}
            onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.4)';e.currentTarget.style.borderColor=T.border;}}
          >
            Subir foto existente
          </button>
        </div>

        {/* Disclaimer */}
        <p style={{fontFamily:'Space Mono',fontSize:8,color:'rgba(255,255,255,0.15)',letterSpacing:'0.05em',textAlign:'center',marginTop:20,lineHeight:1.8}}>
          ORIENTATIVO · NO REEMPLAZA EVALUACIÓN DE CIRUJANO-DENTISTA HABILITADO
        </p>
      </main>

      {/* Footer */}
      <footer style={{position:'relative',zIndex:10,padding:'12px 24px',borderTop:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontFamily:'Space Mono',fontSize:7,color:'rgba(255,255,255,0.15)',letterSpacing:'0.15em'}}>POWERED BY HUMANA.AI</span>
        <span style={{fontFamily:'Space Mono',fontSize:7,color:'rgba(255,255,255,0.15)',letterSpacing:'0.15em'}}>clinicamiro.cl</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Welcome;
