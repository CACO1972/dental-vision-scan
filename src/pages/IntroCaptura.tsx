import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Camera, Upload, ArrowRight, Check } from 'lucide-react';
import { useImages } from '@/context/ImageContext';

const views = [
  { id: 'frontal', label: 'FRONTAL', instruction: 'Sonríe ampliamente mirando al frente', icon: '👄' },
  { id: 'superior', label: 'OCLUSAL SUP.', instruction: 'Abre la boca, cámara hacia arriba', icon: '⬆️' },
  { id: 'inferior', label: 'OCLUSAL INF.', instruction: 'Abre la boca, cámara hacia abajo', icon: '⬇️' },
];

const IntroCaptura = () => {
  const navigate = useNavigate();
  const { images, setImages } = useImages();
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeView, setActiveView] = useState<string | null>(null);

  const handleFileUpload = (viewId: string) => {
    setActiveView(viewId);
    fileRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeView) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImages((prev: any) => ({ ...prev, [activeView]: { imageBase64: base64, view: activeView } }));
      setUploaded(prev => ({ ...prev, [activeView]: true }));
      setActiveView(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const hasAnyImage = Object.keys(uploaded).length > 0 || Object.keys(images || {}).length > 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-overlay flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-5 py-4 border-b-[3px] border-[#C9A86C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A86C] flex items-center justify-center">
            <span className="font-display text-[#0A0A0A] text-lg leading-none">S</span>
          </div>
          <span className="font-display text-white text-lg tracking-wider">SCANDENT</span>
        </div>
        <span className="section-tag text-[#C9A86C] text-[8px]">Paso 1/3</span>
      </header>

      <main className="relative z-10 flex-1 px-5 py-6">
        <div className="max-w-md mx-auto space-y-5">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl text-white uppercase">Captura tus<br/><span className="text-[#C9A86C]">Ángulos</span></h1>
            <p className="font-mono text-[10px] text-white/40 tracking-wide">Sube fotos o usa la cámara automática para cada vista</p>
          </div>

          <div className="space-y-3">
            {views.map((view) => {
              const isUploaded = uploaded[view.id] || (images as any)?.[view.id];
              return (
                <div key={view.id} className={`border-[3px] p-4 flex items-center gap-4 transition-all ${isUploaded ? 'border-[#0AE448] bg-[#0AE448]/5' : 'border-[#C9A86C]/30 hover:border-[#C9A86C]'}`}>
                  <span className="text-2xl">{view.icon}</span>
                  <div className="flex-1">
                    <span className="font-mono text-[11px] font-bold text-white uppercase tracking-[0.15em]">{view.label}</span>
                    <span className="block font-mono text-[9px] text-white/40 mt-0.5">{view.instruction}</span>
                  </div>
                  {isUploaded ? (
                    <div className="w-8 h-8 bg-[#0AE448] flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#0A0A0A]" />
                    </div>
                  ) : (
                    <button onClick={() => handleFileUpload(view.id)} className="w-8 h-8 border-[2px] border-[#C9A86C] flex items-center justify-center hover:bg-[#C9A86C] hover:text-[#0A0A0A] text-[#C9A86C] transition-all">
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onFileChange} />

          <div className="space-y-3 pt-2">
            <button className="btn-brutal w-full flex items-center justify-center gap-3" onClick={() => navigate('/auto-capture')}>
              <Camera className="w-4 h-4" />
              Cámara Automática
            </button>

            {hasAnyImage && (
              <button className="btn-brutal-pink w-full flex items-center justify-center gap-3" onClick={() => navigate('/analizando')}>
                Analizar Ahora
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <p className="font-mono text-[8px] text-white/20 text-center tracking-wide">
              Mínimo 1 foto · Recomendado 3 vistas para mejor observación
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntroCaptura;
