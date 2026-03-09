import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Camera, ChevronRight, Volume2, VolumeX, Users, RotateCcw, ImagePlus, ArrowLeft, Smile, ArrowUp, ArrowDown } from 'lucide-react';
import { useImage, ViewType, CapturedImage } from '@/context/ImageContext';
import { supabase } from '@/integrations/supabase/client';

import guideFrontal from '@/assets/guide-frontal.png';
import guideSuperior from '@/assets/guide-superior.png';
import guideInferior from '@/assets/guide-inferior.png';

const T = {
  base:'#080808',surface:'#0E0C1A',surface2:'#1A1826',
  border:'rgba(255,255,255,0.08)',primary:'#FFFFFF',
  accent:'#9D95FF',accentSoft:'#C4BFFF',muted:'rgba(255,255,255,0.38)',
  green:'#0AE448',orange:'#FF8709',
};

const views = [
  { id:'frontal', Icon:Smile, title:'Vista Frontal', description:'Sonríe mostrando los dientes. Mira directo a la cámara. Usa separadores si tienes.', image:guideFrontal, voiceText:'Para la primera foto, sonríe mostrando tus dientes frontales. Mira directamente a la cámara.' },
  { id:'superior', Icon:ArrowUp, title:'Maxilar Superior', description:'Inclina la cabeza atrás. La cámara apunta desde abajo hacia arriba.', image:guideSuperior, voiceText:'Para la segunda foto, voltea el celular con la cámara apuntando hacia arriba.', tip:'Voltea el celular · Cámara apunta hacia arriba' },
  { id:'inferior', Icon:ArrowDown, title:'Maxilar Inferior', description:'Mira hacia abajo. La cámara apunta desde arriba hacia la boca abierta.', image:guideInferior, voiceText:'Para la tercera foto, sostén el celular desde arriba con la cámara apuntando hacia abajo.' },
];

const VIEW_ORDER: ViewType[] = ['frontal','superior','inferior'];

const fullIntroText = `¡Hola! Vamos a tomar tres fotos de tus dientes. Lo ideal es que otra persona te ayude. Primero frontal sonriendo, luego el maxilar superior con el celular al revés, y finalmente el inferior desde arriba. ¡Busca buena luz y comencemos!`;

const IntroCaptura = () => {
  const navigate = useNavigate();
  const { addCapturedImage } = useImage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<number|null>(null);
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const [uploadingViewIndex, setUploadingViewIndex] = useState<number|null>(null);
  const fileInputRefs = useRef<(HTMLInputElement|null)[]>([null,null,null]);
  const [uploadedViews, setUploadedViews] = useState<Set<ViewType>>(new Set());

  useEffect(()=>()=>{ if(audioRef.current){ audioRef.current.pause(); audioRef.current=null; } },[]);

  const playVoiceGuide = async (text: string, viewIndex?: number) => {
    if (isPlaying) {
      audioRef.current?.pause(); audioRef.current=null;
      setIsPlaying(false); setActiveView(null); return;
    }
    setIsLoading(true); setActiveView(viewIndex??null);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech',{ body:{ text, voice:'nova' } });
      if (error) throw error;
      const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent),c=>c.charCodeAt(0))],{ type:'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = ()=>{ setIsPlaying(false); setActiveView(null); URL.revokeObjectURL(url); };
      audioRef.current.onerror = ()=>{ setIsPlaying(false); setActiveView(null); };
      await audioRef.current.play(); setIsPlaying(true);
    } catch(e){ setActiveView(null); } finally{ setIsLoading(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]; if(!file) return;
    e.target.value=''; setUploadingViewIndex(index);
    const reader = new FileReader();
    reader.onload = ()=>{
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      const viewType = VIEW_ORDER[index];
      addCapturedImage({ view:viewType, imageUrl:dataUrl, imageBase64:base64 });
      setUploadedViews(prev=>new Set([...prev,viewType]));
      setUploadingViewIndex(null);
    };
    reader.onerror=()=>setUploadingViewIndex(null);
    reader.readAsDataURL(file);
  };

  const hasAnyUploads = uploadedViews.size > 0;
  const allUploaded = uploadedViews.size === 3;

  return (
    <div style={{minHeight:'100vh',background:T.base,color:T.primary,display:'flex',flexDirection:'column'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <header style={{padding:'16px 20px',borderBottom:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:T.surface}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={()=>navigate('/')} style={{width:36,height:36,background:'none',border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.4)'}}>
            <ArrowLeft size={16}/>
          </button>
          <div>
            <div style={{fontFamily:'Anton',fontSize:16,letterSpacing:'0.06em',color:T.primary}}>CAPTURA DENTAL</div>
            <div style={{fontFamily:'Space Mono',fontSize:7,color:T.accent,letterSpacing:'0.2em',textTransform:'uppercase'}}>3 vistas · Análisis completo</div>
          </div>
        </div>
        <button onClick={()=>playVoiceGuide(fullIntroText)} disabled={isLoading} style={{width:36,height:36,background:'none',border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:isPlaying&&activeView===null?T.accent:'rgba(255,255,255,0.4)'}}>
          {isPlaying&&activeView===null?<VolumeX size={16}/>:<Volume2 size={16}/>}
        </button>
      </header>

      <main style={{flex:1,padding:'20px',overflowY:'auto'}}>
        {/* Recommendation */}
        <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',background:`${T.accent}0A`,border:`1px solid ${T.accent}30`,marginBottom:20}}>
          <Users size={16} color={T.accent} style={{flexShrink:0,marginTop:1}}/>
          <div>
            <div style={{fontFamily:'Anton',fontSize:13,letterSpacing:'0.04em',color:T.primary,marginBottom:2}}>PIDE AYUDA SI PUEDES</div>
            <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,lineHeight:1.6}}>Un asistente mejora significativamente la calidad de las fotos y el análisis.</p>
          </div>
        </div>

        {/* Views */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {views.map((view,index)=>{
            const isUploaded = uploadedViews.has(view.id as ViewType);
            const isActive = activeView===index;
            return (
              <div key={view.id} style={{background:T.surface,border:`2px solid ${isActive?T.accent:isUploaded?T.green:T.border}`,transition:'border-color 0.2s',padding:'16px'}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                  {/* Number */}
                  <div style={{width:36,height:36,border:`2px solid ${isUploaded?T.green:T.accent}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {isUploaded
                      ? <span style={{fontFamily:'Anton',fontSize:14,color:T.green}}>✓</span>
                      : <span style={{fontFamily:'Anton',fontSize:16,color:T.accent}}>{index+1}</span>
                    }
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <view.Icon size={14} color={T.accent}/>
                        <span style={{fontFamily:'Anton',fontSize:14,letterSpacing:'0.04em',color:T.primary}}>{view.title.toUpperCase()}</span>
                      </div>
                      <button onClick={()=>playVoiceGuide(view.voiceText,index)} disabled={isLoading} style={{width:28,height:28,background:'none',border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:isActive?T.accent:'rgba(255,255,255,0.3)'}}>
                        {isPlaying&&isActive?<VolumeX size={12}/>:<Volume2 size={12}/>}
                      </button>
                    </div>
                    <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:10}}>{view.description}</p>

                    {/* Guide image */}
                    <div style={{width:100,height:100,background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10,overflow:'hidden'}}>
                      <img src={view.image} alt={view.title} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
                    </div>

                    {view.tip && (
                      <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:`${T.orange}10`,border:`1px solid ${T.orange}30`,marginBottom:10}}>
                        <RotateCcw size={12} color={T.orange}/>
                        <span style={{fontFamily:'Space Mono',fontSize:8,color:T.orange,letterSpacing:'0.1em',textTransform:'uppercase'}}>{view.tip}</span>
                      </div>
                    )}

                    {/* Upload button */}
                    <input ref={el=>fileInputRefs.current[index]=el} type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleFileChange(e,index)}/>
                    <button
                      onClick={()=>fileInputRefs.current[index]?.click()}
                      disabled={uploadingViewIndex===index}
                      style={{
                        width:'100%',padding:'10px 0',fontFamily:'Anton',fontSize:12,letterSpacing:'0.06em',textTransform:'uppercase',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                        background:isUploaded?`${T.green}15`:'transparent',
                        color:isUploaded?T.green:'rgba(255,255,255,0.5)',
                        border:`1px solid ${isUploaded?T.green:T.border}`,
                        transition:'all 0.2s',
                      }}>
                      <ImagePlus size={14}/>
                      {uploadingViewIndex===index?'CARGANDO...':isUploaded?'IMAGEN CARGADA ✓':'SUBIR IMAGEN'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div style={{marginTop:16,padding:'14px',background:T.surface,border:`1px solid ${T.border}`}}>
          <div style={{fontFamily:'Anton',fontSize:11,letterSpacing:'0.06em',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',marginBottom:8}}>TIPS DE CAPTURA</div>
          {['Usa 2 cucharas como separadores de mejillas','Busca luz natural · Sin flash','Mantén el dispositivo estable'].map((tip,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <div style={{width:3,height:3,background:T.accent,flexShrink:0}}/>
              <span style={{fontFamily:'DM Sans',fontSize:11,color:'rgba(255,255,255,0.35)'}}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:8}}>
          {hasAnyUploads && (
            <button
              onClick={()=>navigate(allUploaded?'/revisar-fotos':'/analizando')}
              style={{width:'100%',padding:'16px 0',background:T.accent,color:T.base,fontFamily:'Anton',fontSize:16,letterSpacing:'0.06em',textTransform:'uppercase',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              {allUploaded?'REVISAR Y ANALIZAR':`ANALIZAR ${uploadedViews.size} IMAGEN${uploadedViews.size>1?'ES':''}`}
              <ChevronRight size={18}/>
            </button>
          )}
          <button
            onClick={()=>navigate('/auto-capture')}
            style={{width:'100%',padding:'14px 0',background:hasAnyUploads?'transparent':T.accent,color:hasAnyUploads?'rgba(255,255,255,0.5)':T.base,fontFamily:'Anton',fontSize:14,letterSpacing:'0.06em',textTransform:'uppercase',border:hasAnyUploads?`1px solid ${T.border}`:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
            <Camera size={16}/> CAPTURA AUTOMÁTICA <ChevronRight size={16}/>
          </button>
        </div>

        {/* Disclaimer */}
        <p style={{fontFamily:'Space Mono',fontSize:7,color:'rgba(255,255,255,0.12)',letterSpacing:'0.05em',textAlign:'center',marginTop:16,lineHeight:1.8}}>
          ORIENTATIVO · NO REEMPLAZA EVALUACIÓN DE CIRUJANO-DENTISTA HABILITADO · DFL 725 ART. 113
        </p>
      </main>
    </div>
  );
};

export default IntroCaptura;
