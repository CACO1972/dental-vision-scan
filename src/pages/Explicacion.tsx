import { useNavigate } from 'react-router-dom';
import { useImages } from '@/context/ImageContext';
import { ArrowRight, AlertTriangle, Info } from 'lucide-react';

const explanations: Record<string, { title: string; desc: string; urgency: string }> = {
  posible_caries: { title: 'Posible Caries', desc: 'Zona con cambio de coloración sugerente de desmineralización o cavitación. Requiere evaluación presencial con explorador dental y posible radiografía.', urgency: 'moderado' },
  calculo_aparente: { title: 'Cálculo Aparente (Sarro)', desc: 'Acumulación mineralizada compatible con cálculo dental. Se sugiere limpieza profesional (profilaxis) para prevenir enfermedad periodontal.', urgency: 'moderado' },
  desgaste_visible: { title: 'Desgaste Dental', desc: 'Pérdida de estructura dental compatible con atrición, erosión o abrasión. Puede estar asociado a bruxismo u otros factores.', urgency: 'leve' },
  inflamacion_gingival: { title: 'Inflamación Gingival', desc: 'Signos visuales compatibles con gingivitis: enrojecimiento, pérdida de puntillado, posible sangrado. Requiere evaluación periodontal.', urgency: 'moderado' },
  placa_visible: { title: 'Placa Bacteriana', desc: 'Película visible compatible con acumulación de biofilm. Mejorar técnica de higiene oral y considerar profilaxis profesional.', urgency: 'leve' },
  restauracion: { title: 'Restauración', desc: 'Material restaurador visible (resina, amalgama o corona). Verificar integridad de márgenes en evaluación presencial.', urgency: 'leve' },
  posible_fractura: { title: 'Posible Fractura', desc: 'Irregularidad compatible con fractura o fisura dental. Requiere evaluación urgente para determinar extensión y plan de acción.', urgency: 'severo' },
  manchas: { title: 'Manchas', desc: 'Pigmentaciones extrínsecas probablemente asociadas a café, té o tabaco. Removibles con limpieza profesional.', urgency: 'leve' },
  recesion_aparente: { title: 'Recesión Gingival Aparente', desc: 'Signos de retracción del tejido gingival exponiendo superficie radicular. Evaluación periodontal recomendada.', urgency: 'moderado' },
  pieza_ausente: { title: 'Pieza Aparentemente Ausente', desc: 'Se observa espacio compatible con ausencia de pieza dental. Considerar evaluación para opciones de rehabilitación.', urgency: 'moderado' },
};

const Explicacion = () => {
  const navigate = useNavigate();
  const { analysisResults } = useImages();
  const allFindings = analysisResults?.flatMap((r: any) => r.hallazgos || []) || [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-overlay flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-5 py-4 border-b-[3px] border-[#C9A86C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A86C] flex items-center justify-center">
            <span className="font-display text-[#0A0A0A] text-lg leading-none">S</span>
          </div>
          <span className="font-display text-white text-lg tracking-wider">SCANDENT</span>
        </div>
        <span className="section-tag text-[#C9A86C] text-[8px]">Educación</span>
      </header>

      <main className="relative z-10 flex-1 px-5 py-6">
        <div className="max-w-md mx-auto space-y-5">
          <h1 className="font-display text-3xl text-white uppercase">Guía <span className="text-[#C9A86C]">Educativa</span></h1>
          <p className="font-mono text-[10px] text-white/40 tracking-wide">
            Información orientativa sobre los hallazgos observados en tu evaluación visual.
          </p>

          <div className="space-y-3">
            {allFindings.length > 0 ? allFindings.map((f: any, i: number) => {
              const exp = explanations[f.tipo] || { title: f.tipo, desc: f.descripcion, urgency: 'leve' };
              const urgencyColor = exp.urgency === 'severo' ? '#FF2D78' : exp.urgency === 'moderado' ? '#FFE500' : '#0AE448';
              return (
                <div key={i} className="border-[3px] border-[#C9A86C]/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.1em]">{exp.title}</span>
                    <span className="font-mono text-[8px] uppercase tracking-[0.2em] px-2 py-1 border-[2px]" style={{ borderColor: urgencyColor, color: urgencyColor }}>{exp.urgency}</span>
                  </div>
                  <p className="font-mono text-[10px] text-white/50 leading-relaxed">{exp.desc}</p>
                  {f.ubicacion && <p className="font-mono text-[9px] text-[#C9A86C]/60">📍 {f.ubicacion}</p>}
                </div>
              );
            }) : (
              <div className="border-[3px] border-[#0AE448]/30 p-4 text-center">
                <Info className="w-5 h-5 text-[#0AE448] mx-auto mb-2" />
                <p className="font-mono text-[10px] text-white/50">No se detectaron hallazgos significativos en la observación visual.</p>
              </div>
            )}
          </div>

          <div className="border-t-[3px] border-[#C9A86C]/20 pt-4 flex items-start gap-2">
            <AlertTriangle className="w-3 h-3 text-[#C9A86C]/50 shrink-0 mt-0.5" />
            <p className="font-mono text-[8px] text-white/25 leading-relaxed tracking-wide">
              Esta información es orientativa y educativa. Consulte a un cirujano-dentista habilitado para evaluación presencial.
            </p>
          </div>

          <button className="btn-brutal w-full flex items-center justify-center gap-3" onClick={() => navigate('/analisis')}>
            Volver a Resultados <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Explicacion;
