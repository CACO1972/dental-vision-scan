import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Eye, AlertTriangle } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-overlay flex flex-col">
      <header className="relative z-10 flex items-center justify-between px-5 py-4 border-b-[3px] border-[#C9A86C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A86C] flex items-center justify-center">
            <span className="font-display text-[#0A0A0A] text-lg leading-none">S</span>
          </div>
          <div>
            <span className="font-display text-white text-lg tracking-wider">SCANDENT</span>
            <span className="block text-[9px] font-mono text-[#C9A86C] tracking-[0.3em] uppercase -mt-0.5">by HUMANA.AI</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#0AE448] animate-pulse"></div>
          <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Online</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4 animate-fade-in-up">
            <span className="section-tag text-[#C9A86C]">Orientación Visual Dental IA</span>
            <h1 className="font-display text-5xl md:text-6xl text-white uppercase leading-[0.9] tracking-tight">
              ESCANEA<br/><span className="text-[#C9A86C]">TU SONRISA</span>
            </h1>
            <p className="font-mono text-[11px] text-white/50 leading-relaxed max-w-xs mx-auto tracking-wide">
              Observación visual orientativa de tu salud dental con inteligencia artificial. Resultados en 2 minutos.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-0 border-[3px] border-[#C9A86C] animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="p-3 text-center border-r-[3px] border-[#C9A86C]">
              <span className="font-display text-2xl text-[#C9A86C]">2</span>
              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Minutos</span>
            </div>
            <div className="p-3 text-center border-r-[3px] border-[#C9A86C]">
              <span className="font-display text-2xl text-[#C9A86C]">3</span>
              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Ángulos</span>
            </div>
            <div className="p-3 text-center">
              <span className="font-display text-2xl text-[#0AE448]">IA</span>
              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-[0.2em] mt-1">Gemini Pro</span>
            </div>
          </div>

          <div className="border-[3px] border-[#C9A86C] p-5 bg-[#0A0A0A] animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="font-mono text-[10px] font-bold text-[#C9A86C] uppercase tracking-[0.3em] mb-4">¿Qué observa?</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🦷', label: 'Posibles caries' },
                { icon: '🔴', label: 'Inflamación gingival' },
                { icon: '⚡', label: 'Desgaste dental' },
                { icon: '📐', label: 'Sarro visible' },
                { icon: '🔍', label: 'Piezas ausentes' },
                { icon: '💎', label: 'Estado general' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-mono text-[10px] text-white/70 tracking-wide">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <button className="btn-brutal w-full flex items-center justify-center gap-3" onClick={() => navigate('/intro-captura')}>
              <Eye className="w-4 h-4" />
              Iniciar Observación Gratuita
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-[#0AE448]" />
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Privado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#C9A86C]" />
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider">Sin registro</span>
              </div>
            </div>
          </div>

          <div className="border-t-[3px] border-[#C9A86C]/20 pt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 text-[#C9A86C]/50 shrink-0 mt-0.5" />
              <p className="font-mono text-[8px] text-white/25 leading-relaxed tracking-wide">
                Herramienta de orientación visual educativa. No constituye diagnóstico odontológico (DFL 725, Art. 113). 
                Requiere validación presencial por cirujano-dentista habilitado. Ley 20.584 — Ley 21.541.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t-[3px] border-[#C9A86C]/20 py-3 px-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-[0.2em]">© 2026 Clínica Miró · HUMANA.AI</span>
          <span className="font-mono text-[8px] text-white/20 uppercase tracking-[0.2em]">v2.0</span>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
