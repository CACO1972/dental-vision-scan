import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImages } from '@/context/ImageContext';
import { supabase } from '@/integrations/supabase/client';

const messages = [
  'INICIANDO ESCANEO VISUAL...',
  'MAPEANDO SUPERFICIES DENTALES...',
  'ANALIZANDO TEJIDO GINGIVAL...',
  'BUSCANDO SIGNOS DE CARIES...',
  'EVALUANDO DEPÓSITOS Y SARRO...',
  'VERIFICANDO ALINEACIÓN...',
  'GENERANDO OBSERVACIONES...',
];

const AnalisisLoading = () => {
  const navigate = useNavigate();
  const { images, setAnalysisResults } = useImages();
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => Math.min(p + 0.8, 95));
    }, 100);
    const msgTimer = setInterval(() => {
      setMsgIdx(i => (i + 1) % messages.length);
    }, 2200);
    return () => { clearInterval(timer); clearInterval(msgTimer); };
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const analyze = async () => {
      try {
        const imageEntries = Object.entries(images || {});
        if (imageEntries.length === 0) {
          navigate('/intro-captura');
          return;
        }
        const results: any[] = [];
        for (const [view, data] of imageEntries) {
          if (!(data as any)?.imageBase64) continue;
          const { data: result, error } = await supabase.functions.invoke('analyze-dental', {
            body: { imageBase64: (data as any).imageBase64 }
          });
          if (!error && result?.hallazgos) {
            results.push({ view, ...result });
          }
        }
        if (results.length > 0) {
          setAnalysisResults(results);
          setProgress(100);
          setTimeout(() => navigate('/analisis'), 600);
        } else {
          const firstImg = (imageEntries[0]?.[1] as any)?.imageBase64;
          if (firstImg) {
            const { data: result, error } = await supabase.functions.invoke('analyze-dental', {
              body: { imageBase64: firstImg }
            });
            if (!error && result) {
              setAnalysisResults([{ view: 'frontal', ...result }]);
              setProgress(100);
              setTimeout(() => navigate('/analisis'), 600);
              return;
            }
          }
          navigate('/intro-captura');
        }
      } catch (err) {
        console.error('Analysis error:', err);
        navigate('/intro-captura');
      }
    };
    analyze();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-overlay flex flex-col items-center justify-center px-5">
      <div className="max-w-sm w-full text-center space-y-8 relative z-10">
        {/* Hexagon scanner icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-[3px] border-[#C9A86C] rotate-45 animate-pulse-gold"></div>
          <div className="absolute inset-3 border-[2px] border-[#C9A86C]/50 rotate-45"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl text-[#C9A86C]">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-mono text-[11px] font-bold text-[#C9A86C] uppercase tracking-[0.3em] animate-blink">
            {messages[msgIdx]}
          </h2>
          
          {/* Progress bar */}
          <div className="w-full h-[3px] bg-white/10">
            <div className="h-full bg-[#C9A86C] transition-all duration-200 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          
          <p className="font-mono text-[9px] text-white/30 tracking-wide">
            PROCESANDO DATOS BIOMÉTRICOS: {Math.round(progress)}%
          </p>
        </div>

        {/* Fake data stream */}
        <div className="font-mono text-[8px] text-[#C9A86C]/30 space-y-1 text-left overflow-hidden max-h-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ opacity: 0.3 + (i * 0.1) }}>
              {`0x${Math.random().toString(16).substr(2, 8).toUpperCase()} → SCAN_LAYER_${i + 1}`}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalisisLoading;
