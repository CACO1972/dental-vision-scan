import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useImage, Hallazgo, ViewType } from '@/context/ImageContext';
import { ArrowLeft, AlertCircle, CheckCircle2, AlertTriangle, ImageOff, Activity, ListChecks, EyeOff, Lock, Sparkles, Scan } from 'lucide-react';
import PaymentUpgrade from '@/components/PaymentUpgrade';
import SmileSimulation from '@/components/SmileSimulation';
import { useToast } from '@/hooks/use-toast';

const T = {
  base:'#080808',surface:'#0E0C1A',surface2:'#1A1826',
  border:'rgba(255,255,255,0.08)',primary:'#FFFFFF',
  accent:'#9D95FF',accentSoft:'#C4BFFF',muted:'rgba(255,255,255,0.38)',
  green:'#0AE448',red:'#E63946',orange:'#FF8709',yellow:'#FFE500',
};

const tipoConfig: Record<string,{color:string;label:string}> = {
  caries:       {color:'#E63946',label:'Posible caries'},
  calculo:      {color:'#0AE448',label:'Posible cálculo/sarro'},
  desgaste:     {color:'#FF8709',label:'Desgaste dental'},
  gingivitis:   {color:'#9D95FF',label:'Posible gingivitis'},
  placa:        {color:'#FFE500',label:'Placa dental'},
  restauracion: {color:'#3b82f6',label:'Restauración'},
  fractura:     {color:'#dc2626',label:'Fractura'},
  manchas:      {color:'#a16207',label:'Manchas'},
  recesion:     {color:'#7c3aed',label:'Recesión gingival'},
  otro:         {color:'#6b7280',label:'Observación'},
};

const confianzaLabel: Record<string,string> = {alta:'Alta confianza',media:'Confianza media',baja:'Baja confianza'};
const severidadLabel: Record<string,{color:string;label:string}> = {
  leve:     {color:'#0AE448',label:'Leve'},
  moderado: {color:'#FF8709',label:'Moderado'},
  severo:   {color:'#E63946',label:'Severo'},
};
const estadoConfig: Record<string,{color:string;label:string}> = {
  bueno:             {color:'#0AE448',label:'Estado general bueno'},
  aceptable:         {color:'#9D95FF',label:'Estado general aceptable'},
  requiere_atencion: {color:'#FF8709',label:'Requiere atención'},
  urgente:           {color:'#E63946',label:'Atención urgente recomendada'},
};
const viewLabels: Record<ViewType,string> = {frontal:'Frontal',superior:'Superior',inferior:'Inferior'};

const Tag = ({label,color}:{label:string,color:string}) => (
  <span style={{fontFamily:'Space Mono',fontSize:7,letterSpacing:'0.1em',textTransform:'uppercase',padding:'2px 8px',border:`1px solid ${color}40`,color,background:`${color}10`}}>{label}</span>
);

const Analisis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {toast} = useToast();
  const {selectedImageUrl,selectedImageBase64,analysisResult,capturedImages} = useImage();
  const [selectedView, setSelectedView] = useState<ViewType|'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),100); },[]);

  useEffect(()=>{
    const paymentStatus = searchParams.get('payment');
    if(paymentStatus==='success'){
      const pending = localStorage.getItem('pendingPayment');
      if(pending){ setIsPremiumUnlocked(true); localStorage.removeItem('pendingPayment'); toast({title:'¡Pago exitoso!',description:'Tu informe completo ya está disponible.'}); }
    }
  },[searchParams,toast]);

  useEffect(()=>{
    const hasSingle = selectedImageUrl&&analysisResult;
    const hasMulti = capturedImages.length>0&&analysisResult;
    if(!hasSingle&&!hasMulti) navigate('/subir-foto');
  },[selectedImageUrl,analysisResult,capturedImages,navigate]);

  if(!analysisResult) return null;

  const hasMultipleImages = capturedImages.length > 0;
  const hasFindings = analysisResult.hallazgos?.length > 0;
  const filteredFindings = selectedView==='all'?analysisResult.hallazgos:analysisResult.hallazgos.filter((h:Hallazgo)=>h.vista===selectedView);
  const getCurrentImage = ()=>{
    if(hasMultipleImages) return selectedView==='all'?capturedImages[0]?.imageUrl:capturedImages.find(i=>i.view===selectedView)?.imageUrl;
    return selectedImageUrl;
  };
  const estadoCfg = estadoConfig[analysisResult.estadoGeneral];

  return (
    <div style={{minHeight:'100vh',background:T.base,color:T.primary,display:'flex',flexDirection:'column'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}@keyframes slideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes pulseD{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* Header */}
      <header style={{padding:'14px 20px',borderBottom:`1px solid ${T.border}`,background:T.surface,display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,zIndex:20}}>
        <button onClick={()=>navigate(hasMultipleImages?'/revisar-fotos':'/subir-foto')} style={{width:36,height:36,background:'none',border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.4)'}}>
          <ArrowLeft size={16}/>
        </button>
        <div style={{width:36,height:36,background:T.accent,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Scan size={16} color={T.base}/>
        </div>
        <div>
          <div style={{fontFamily:'Anton',fontSize:15,letterSpacing:'0.04em',color:T.primary}}>RESULTADOS</div>
          <div style={{fontFamily:'Space Mono',fontSize:7,color:T.accent,letterSpacing:'0.2em',textTransform:'uppercase'}}>
            {analysisResult.analisisValido?'Análisis completado':'No se pudo analizar'}
          </div>
        </div>
      </header>

      <main style={{flex:1,padding:'20px',maxWidth:600,margin:'0 auto',width:'100%'}}>

        {/* Image quality warning */}
        {analysisResult.calidadImagen&&analysisResult.calidadImagen!=='buena'&&(
          <div style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',background:`${analysisResult.calidadImagen==='mala'?T.red:T.orange}10`,border:`1px solid ${analysisResult.calidadImagen==='mala'?T.red:T.orange}30`,marginBottom:16}}>
            <ImageOff size={16} color={analysisResult.calidadImagen==='mala'?T.red:T.orange} style={{flexShrink:0}}/>
            <div>
              <div style={{fontFamily:'Anton',fontSize:12,letterSpacing:'0.04em',color:analysisResult.calidadImagen==='mala'?T.red:T.orange,marginBottom:3}}>CALIDAD: {analysisResult.calidadImagen?.toUpperCase()}</div>
              <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,lineHeight:1.6}}>{analysisResult.notaCalidadImagen}</p>
            </div>
          </div>
        )}

        {/* Estado general */}
        {estadoCfg&&(
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:`${estadoCfg.color}0A`,border:`2px solid ${estadoCfg.color}40`,marginBottom:16,animation:mounted?'slideIn 0.4s ease':'none'}}>
            <Activity size={20} color={estadoCfg.color} style={{animation:'pulseD 2s infinite'}}/>
            <div>
              <div style={{fontFamily:'Anton',fontSize:15,letterSpacing:'0.04em',color:estadoCfg.color}}>{estadoCfg.label.toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* View selector */}
        {hasMultipleImages&&(
          <div style={{display:'flex',gap:2,marginBottom:16,flexWrap:'wrap'}}>
            {[{v:'all',label:`TODAS (${analysisResult.hallazgos.length})`},...capturedImages.map(img=>({v:img.view,label:`${viewLabels[img.view].toUpperCase()} (${analysisResult.hallazgos.filter((h:Hallazgo)=>h.vista===img.view).length})`}))].map(({v,label})=>(
              <button key={v} onClick={()=>setSelectedView(v as any)} style={{padding:'7px 14px',background:selectedView===v?T.accent:'transparent',color:selectedView===v?T.base:'rgba(255,255,255,0.4)',fontFamily:'Space Mono',fontSize:7,letterSpacing:'0.15em',border:`1px solid ${selectedView===v?T.accent:T.border}`,cursor:'pointer',textTransform:'uppercase',transition:'all 0.15s'}}>{label}</button>
            ))}
          </div>
        )}

        {/* Image */}
        <div style={{marginBottom:16}}>
          {hasMultipleImages?(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4,marginBottom:12}}>
              {capturedImages.map(img=>(
                <button key={img.view} onClick={()=>setSelectedView(img.view)} style={{aspectRatio:'1',overflow:'hidden',border:`2px solid ${selectedView===img.view||selectedView==='all'?T.accent:T.border}`,cursor:'pointer',background:'none',padding:0,transition:'border-color 0.2s'}}>
                  <img src={img.imageUrl} alt={viewLabels[img.view]} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </button>
              ))}
            </div>
          ):(
            <div style={{border:`1px solid ${T.border}`,overflow:'hidden',marginBottom:12}}>
              <img src={selectedImageUrl||''} alt="Imagen dental" style={{width:'100%',height:'auto',maxHeight:280,objectFit:'contain',display:'block',background:T.surface}}/>
            </div>
          )}

          {/* General message */}
          <div style={{padding:'12px 14px',background:T.surface,border:`1px solid ${T.border}`}}>
            <p style={{fontFamily:'DM Sans',fontSize:13,color:T.muted,lineHeight:1.7}}>{analysisResult.mensajeGeneral}</p>
          </div>
        </div>

        {/* Hallazgos */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            {filteredFindings.length>0
              ?<><AlertCircle size={16} color={T.accent}/><span style={{fontFamily:'Anton',fontSize:14,letterSpacing:'0.04em',color:T.primary}}>OBSERVACIONES ({filteredFindings.length})</span></>
              :<><CheckCircle2 size={16} color={T.green}/><span style={{fontFamily:'Anton',fontSize:14,letterSpacing:'0.04em',color:T.green}}>SIN HALLAZGOS EVIDENTES</span></>
            }
          </div>

          {filteredFindings.length>0?(
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {filteredFindings.slice(0,isPremiumUnlocked?undefined:2).map((h:Hallazgo,i:number)=>{
                const cfg=tipoConfig[h.tipo]||tipoConfig.otro;
                const sevCfg=h.severidad?severidadLabel[h.severidad]:null;
                return (
                  <div key={i} style={{padding:'14px',background:T.surface,border:`1px solid ${T.border}`,borderLeft:`3px solid ${cfg.color}`,animation:mounted?`slideIn 0.4s ${i*0.1}s both ease`:'none'}}>
                    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:cfg.color,flexShrink:0,marginTop:3,boxShadow:`0 0 6px ${cfg.color}`,animation:'pulseD 2s infinite'}}/>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:6}}>
                          <span style={{fontFamily:'Anton',fontSize:14,letterSpacing:'0.03em',color:T.primary}}>{cfg.label.toUpperCase()}</span>
                          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                            {sevCfg&&<Tag label={sevCfg.label} color={sevCfg.color}/>}
                            {h.vista&&<Tag label={viewLabels[h.vista]} color={T.accent}/>}
                            {h.confianza&&<Tag label={confianzaLabel[h.confianza]} color={h.confianza==='alta'?T.green:h.confianza==='media'?T.orange:'rgba(255,255,255,0.3)'}/>}
                          </div>
                        </div>
                        <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,lineHeight:1.6,marginBottom:h.ubicacion?4:0}}>{h.descripcion}</p>
                        {h.ubicacion&&<p style={{fontFamily:'Space Mono',fontSize:8,color:'rgba(255,255,255,0.25)',letterSpacing:'0.1em'}}>📍 {h.ubicacion}</p>}
                        {isPremiumUnlocked&&h.recomendacionEspecifica&&(
                          <div style={{marginTop:8,padding:'8px 10px',background:`${T.accent}10`,border:`1px solid ${T.accent}30`}}>
                            <p style={{fontFamily:'DM Sans',fontSize:11,color:T.accent,lineHeight:1.6}}>💡 {h.recomendacionEspecifica}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Lock gate */}
              {!isPremiumUnlocked&&filteredFindings.length>2&&(
                <button onClick={()=>setShowPaymentModal(true)} style={{padding:'24px 16px',background:T.surface,border:`2px dashed ${T.accent}40`,cursor:'pointer',textAlign:'center',width:'100%',transition:'border-color 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor=`${T.accent}80`)}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor=`${T.accent}40`)}>
                  <Lock size={24} color='rgba(255,255,255,0.2)' style={{margin:'0 auto 10px'}}/>
                  <div style={{fontFamily:'Anton',fontSize:16,letterSpacing:'0.04em',color:T.primary,marginBottom:4}}>+{filteredFindings.length-2} OBSERVACIONES MÁS</div>
                  <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,marginBottom:14,lineHeight:1.6}}>Desbloquea el informe completo con todas las observaciones y recomendaciones personalizadas</p>
                  <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 20px',background:T.accent,color:T.base,fontFamily:'Anton',fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase'}}>
                    <Sparkles size={14}/> DESBLOQUEAR POR $6.990
                  </div>
                </button>
              )}
            </div>
          ):(
            <div style={{padding:'16px',background:`${T.green}0A`,border:`1px solid ${T.green}30`}}>
              <p style={{fontFamily:'DM Sans',fontSize:13,color:T.muted,lineHeight:1.7}}>No se detectaron problemas evidentes. Sin embargo, esto <strong style={{color:T.primary}}>no garantiza</strong> ausencia de patologías. Una evaluación presencial es necesaria para un examen completo.</p>
            </div>
          )}
        </div>

        {/* Próximos pasos */}
        {analysisResult.proximosPasos?.length>0&&(
          <div style={{marginBottom:16,padding:'14px',background:T.surface,border:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <ListChecks size={14} color={T.accent}/>
              <span style={{fontFamily:'Anton',fontSize:12,letterSpacing:'0.04em',color:T.primary}}>PRÓXIMOS PASOS</span>
            </div>
            <ol style={{listStyle:'none'}}>
              {analysisResult.proximosPasos.map((paso:string,i:number)=>(
                <li key={i} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                  <div style={{width:20,height:20,border:`1px solid ${T.accent}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{fontFamily:'Anton',fontSize:10,color:T.accent}}>{i+1}</span>
                  </div>
                  <p style={{fontFamily:'DM Sans',fontSize:12,color:T.muted,lineHeight:1.6,marginTop:2}}>{paso}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Áreas no visibles */}
        {analysisResult.areasNoVisibles?.length>0&&(
          <div style={{marginBottom:16,padding:'12px 14px',background:'rgba(255,255,255,0.02)',border:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <EyeOff size={12} color='rgba(255,255,255,0.25)'/>
              <span style={{fontFamily:'Space Mono',fontSize:8,color:'rgba(255,255,255,0.25)',letterSpacing:'0.15em',textTransform:'uppercase'}}>ÁREAS NO EVALUADAS</span>
            </div>
            {analysisResult.areasNoVisibles.map((area:string,i:number)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <div style={{width:3,height:3,background:'rgba(255,255,255,0.2)',borderRadius:'50%',flexShrink:0}}/>
                <span style={{fontFamily:'DM Sans',fontSize:11,color:'rgba(255,255,255,0.3)'}}>{area}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recomendación */}
        {analysisResult.recomendacion&&(
          <div style={{marginBottom:16,padding:'14px',background:`${T.accent}08`,border:`1px solid ${T.accent}25`}}>
            <div style={{fontFamily:'Anton',fontSize:11,letterSpacing:'0.06em',color:T.accent,marginBottom:6}}>💡 RECOMENDACIÓN</div>
            <p style={{fontFamily:'DM Sans',fontSize:13,color:T.muted,lineHeight:1.7}}>{analysisResult.recomendacion}</p>
          </div>
        )}

        {/* Premium upsell */}
        {!isPremiumUnlocked&&hasFindings&&(
          <div style={{marginBottom:16,padding:'20px',background:T.surface,border:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:12,alignItems:'center',textAlign:'center'}}>
            <div style={{fontFamily:'Anton',fontSize:18,letterSpacing:'0.02em',color:T.primary}}>¿QUIERES EL INFORME COMPLETO?</div>
            <p style={{fontFamily:'DM Sans',fontSize:13,color:T.muted,lineHeight:1.6,maxWidth:320}}>Incluye todas las observaciones, recomendaciones personalizadas y simulación de sonrisa</p>
            <button onClick={()=>setShowPaymentModal(true)} style={{padding:'14px 28px',background:T.accent,color:T.base,fontFamily:'Anton',fontSize:14,letterSpacing:'0.06em',textTransform:'uppercase',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
              <Sparkles size={16}/> DESBLOQUEAR POR $6.990
            </button>
          </div>
        )}

        {/* Premium content */}
        {isPremiumUnlocked&&hasFindings&&(
          <SmileSimulation imageBase64={capturedImages[0]?.imageBase64||selectedImageBase64||''} hallazgos={analysisResult.hallazgos}/>
        )}

        {/* Disclaimer */}
        <div style={{padding:'12px 14px',background:`${T.orange}08`,border:`1px solid ${T.orange}20`,marginBottom:16,display:'flex',alignItems:'flex-start',gap:10}}>
          <AlertTriangle size={14} color={T.orange} style={{flexShrink:0,marginTop:2}}/>
          <p style={{fontFamily:'DM Sans',fontSize:11,color:'rgba(255,255,255,0.45)',lineHeight:1.7}}>
            <strong style={{color:'rgba(255,255,255,0.6)'}}>Orientativo:</strong> Este análisis es generado por inteligencia artificial. NO reemplaza la evaluación de un profesional odontólogo habilitado. Consulta con tu dentista para un examen definitivo.
          </p>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {isPremiumUnlocked&&hasFindings&&(
            <button onClick={()=>navigate('/explicacion')} style={{width:'100%',padding:'16px 0',background:T.accent,color:T.base,fontFamily:'Anton',fontSize:15,letterSpacing:'0.06em',textTransform:'uppercase',border:'none',cursor:'pointer'}}>
              VER EXPLICACIÓN DETALLADA
            </button>
          )}
          <button onClick={()=>navigate('/subir-foto')} style={{width:'100%',padding:'14px 0',background:'transparent',color:'rgba(255,255,255,0.4)',fontFamily:'Anton',fontSize:13,letterSpacing:'0.06em',textTransform:'uppercase',border:`1px solid ${T.border}`,cursor:'pointer'}}>
            ANALIZAR OTRAS FOTOS
          </button>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal&&(
        <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{maxWidth:420,width:'100%'}}>
            <PaymentUpgrade onClose={()=>setShowPaymentModal(false)} onSuccess={()=>{setIsPremiumUnlocked(true);setShowPaymentModal(false);}}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;
