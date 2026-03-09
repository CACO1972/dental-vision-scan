import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '@/context/ImageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const T = {
  base:'#080808',surface:'#0E0C1A',border:'rgba(255,255,255,0.08)',
  primary:'#FFFFFF',accent:'#9D95FF',accentSoft:'#C4BFFF',
  muted:'rgba(255,255,255,0.35)',green:'#0AE448',
};

const ScanCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t=0,raf:number;
    const draw=()=>{
      const W=canvas.width=canvas.offsetWidth,H=canvas.height=canvas.offsetHeight;
      ctx.fillStyle='rgba(8,8,8,0.2)';ctx.fillRect(0,0,W,H);
      // rings
      [0.25,0.5,0.75,1].forEach(f=>{
        ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)/2*f,0,Math.PI*2);
        ctx.strokeStyle=`rgba(157,149,255,${0.05+Math.sin(t*0.03+f)*0.03})`;ctx.lineWidth=1;ctx.stroke();
      });
      // rotating line
      ctx.save();ctx.translate(W/2,H/2);ctx.rotate(t*0.025);
      const R=Math.min(W,H)/2;
      ctx.strokeStyle='rgba(157,149,255,0.7)';ctx.lineWidth=1.5;ctx.shadowBlur=10;ctx.shadowColor=T.accent;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(R,0);ctx.stroke();ctx.shadowBlur=0;
      for(let da=0;da<Math.PI*.5;da+=0.04){
        ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,t*0.025-da,t*0.025-da+0.05);
        ctx.fillStyle=`rgba(157,149,255,${0.02*(1-da/(Math.PI*.5))})`;ctx.fill();
      }
      ctx.restore();
      // horizontal scan line
      const scanY=((t*2)%H);
      const scanGrad=ctx.createLinearGradient(0,scanY-20,0,scanY+20);
      scanGrad.addColorStop(0,'transparent');scanGrad.addColorStop(.5,`rgba(157,149,255,0.4)`);scanGrad.addColorStop(1,'transparent');
      ctx.fillStyle=scanGrad;ctx.fillRect(0,scanY-20,W,40);
      t++;raf=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>;
};

const AnalisisLoading = () => {
  const navigate = useNavigate();
  const { selectedImageBase64, selectedImageUrl, capturedImages, setAnalysisResult } = useImage();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    'Procesando imágenes...',
    'Detectando estructuras dentales...',
    'Analizando tejidos y superficies...',
    'Identificando observaciones...',
    'Generando orientación clínica...',
    'Finalizando informe...',
  ];

  const hasMultipleImages = capturedImages.length > 0;

  useEffect(()=>{
    const pi = setInterval(()=>setPhase(p=>Math.min(p+1,phases.length-1)),2200);
    const pr = setInterval(()=>setProgress(p=>Math.min(p+Math.random()*3+1,95)),180);
    return()=>{ clearInterval(pi); clearInterval(pr); };
  },[]);

  useEffect(()=>{
    if(!hasMultipleImages&&!selectedImageBase64){ toast.error('No se encontró imagen para analizar'); navigate('/subir-foto'); return; }
    const analyzeImages = async ()=>{
      try {
        if(hasMultipleImages){
          const allHallazgos:any[]=[];
          let combinedResult:any=null;
          for(const img of capturedImages){
            if(!img.imageBase64) continue;
            const{data,error}=await supabase.functions.invoke('analyze-dental',{body:{imageBase64:img.imageBase64}});
            if(error){ console.error('Error for view',img.view,error); continue; }
            if(data.hallazgos){ allHallazgos.push(...data.hallazgos.map((h:any)=>({...h,vista:img.view}))); }
            if(!combinedResult) combinedResult={...data};
            else{
              if(data.estadoGeneral==='urgente'||combinedResult.estadoGeneral!=='urgente')
                if(['urgente','requiere_atencion'].includes(data.estadoGeneral)) combinedResult.estadoGeneral=data.estadoGeneral;
            }
          }
          if(combinedResult){ combinedResult.hallazgos=allHallazgos; setAnalysisResult(combinedResult); setProgress(100); setTimeout(()=>navigate('/analisis'),500); }
          else{ toast.error('No se pudieron analizar las imágenes'); navigate('/intro-captura'); }
        } else {
          const{data,error}=await supabase.functions.invoke('analyze-dental',{body:{imageBase64:selectedImageBase64}});
          if(error) throw error;
          setAnalysisResult(data); setProgress(100); setTimeout(()=>navigate('/analisis'),500);
        }
      } catch(err){ console.error(err); toast.error('Error al analizar. Intente nuevamente.'); navigate('/subir-foto'); }
    };
    analyzeImages();
  },[]);

  return (
    <div style={{minHeight:'100vh',background:T.base,color:T.primary,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Full background canvas */}
      <div style={{position:'absolute',inset:0,opacity:.6}}>
        <ScanCanvas/>
      </div>

      {/* Content */}
      <div style={{position:'relative',zIndex:10,textAlign:'center',padding:'40px 24px',maxWidth:380,width:'100%'}}>

        {/* Scanning orb */}
        <div style={{width:120,height:120,border:`3px solid ${T.accent}`,borderRadius:'50%',margin:'0 auto 32px',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',boxShadow:`0 0 60px ${T.accent}30`}}>
          <div style={{width:80,height:80,border:`1px solid ${T.accent}40`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:40,height:40,background:`${T.accent}20`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:12,height:12,background:T.accent,borderRadius:'50%',animation:'pulseBig 1.5s ease-in-out infinite'}}/>
            </div>
          </div>
          {/* Orbit line */}
          <div style={{position:'absolute',inset:-3,borderRadius:'50%',border:`1px solid ${T.accent}30`,animation:'spinOrbit 3s linear infinite'}}/>
        </div>

        <div style={{fontFamily:'Space Mono',fontSize:8,color:T.accent,letterSpacing:'0.4em',textTransform:'uppercase',marginBottom:12}}>
          SCANDENT · ANALIZANDO
        </div>
        <h1 style={{fontFamily:'Anton',fontSize:36,letterSpacing:'-0.01em',textTransform:'uppercase',marginBottom:8,lineHeight:1}}>
          IA EN<br/>PROCESO
        </h1>
        <p style={{fontFamily:'DM Sans',fontSize:14,color:T.muted,marginBottom:32,lineHeight:1.6,minHeight:42}}>
          {phases[phase]}
        </p>

        {/* Progress */}
        <div style={{marginBottom:12}}>
          <div style={{height:2,background:'rgba(255,255,255,0.06)',position:'relative',marginBottom:8}}>
            <div style={{position:'absolute',top:0,left:0,height:'100%',background:T.accent,width:`${progress}%`,boxShadow:`0 0 10px ${T.accent}`,transition:'width 0.2s'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontFamily:'Space Mono',fontSize:8,color:'rgba(255,255,255,0.25)',letterSpacing:'0.2em'}}>
            <span>PROCESANDO</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Views indicator */}
        {hasMultipleImages && (
          <div style={{display:'flex',justifyContent:'center',gap:6,marginTop:16}}>
            {capturedImages.map((img,i)=>(
              <div key={i} style={{padding:'4px 12px',border:`1px solid ${T.accent}40`,fontFamily:'Space Mono',fontSize:7,color:T.accent,letterSpacing:'0.15em',textTransform:'uppercase'}}>
                {img.view}
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <p style={{fontFamily:'Space Mono',fontSize:7,color:'rgba(255,255,255,0.1)',letterSpacing:'0.05em',textAlign:'center',marginTop:24,lineHeight:1.8}}>
          ORIENTATIVO · NO REEMPLAZA EVALUACIÓN PRESENCIAL
        </p>
      </div>

      <style>{`
        @keyframes pulseBig{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        @keyframes spinOrbit{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
};

export default AnalisisLoading;
