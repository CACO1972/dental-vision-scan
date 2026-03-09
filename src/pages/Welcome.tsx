import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, TrendingDown, Video, Shield, Zap } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(225,95%,8%)]">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-[100px] animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-screen px-5 md:px-6 py-10 md:py-12">
        <div className="max-w-md w-full space-y-5 animate-fade-in">
          {/* Hero */}
          <div className="text-center space-y-3">
            {/* Logo - glassmorphic */}
            <div className="w-16 h-16 md:w-18 md:h-18 mx-auto rounded-2xl bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center shadow-[0_8px_32px_-4px_hsl(195,100%,39%,0.4)] backdrop-blur-sm border border-white/10 mb-5">
              <span className="text-3xl font-display font-bold text-white">M</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-white tracking-tight">
              Miro
            </h1>
            <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-xs mx-auto">
              Revisión dental con IA · Ahorra hasta <span className="text-accent font-semibold">$45.000</span> en diagnósticos
            </p>
          </div>

          {/* Social Proof - Glassmorphic card */}
          <div className="backdrop-blur-xl bg-white/[0.06] rounded-2xl p-4 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-center gap-3 mb-2.5">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white/10 flex items-center justify-center shadow-sm">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-white/80 font-medium">
              +2.847 análisis realizados esta semana
            </p>
            <p className="text-xs text-center text-white/40 mt-1">
              "Me ahorré una visita innecesaria" — María G.
            </p>
          </div>

          {/* Savings - Glassmorphic */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Ahorra en promedio $45.000</p>
                <p className="text-xs text-white/40">vs. consulta presencial inicial</p>
              </div>
            </div>
          </div>

          {/* Features - Mini glassmorphic chips */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="backdrop-blur-lg bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-accent shrink-0" />
              <p className="text-xs font-medium text-white/70">Resultado en 2 min</p>
            </div>
            <div className="backdrop-blur-lg bg-white/[0.04] rounded-xl p-3 border border-white/[0.06] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
              <p className="text-xs font-medium text-white/70">100% privado</p>
            </div>
          </div>

          {/* CTA */}
          <Button 
            size="lg" 
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:shadow-[0_8px_32px_-4px_hsl(195,100%,39%,0.5)] transition-all duration-300 active:scale-[0.97] border border-white/10"
            onClick={() => navigate('/intro-captura')}
          >
            Analizar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Telemedicine upsell - Glassmorphic */}
          <div className="backdrop-blur-xl bg-white/[0.04] rounded-2xl p-4 border border-accent/15">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0 border border-accent/20">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/90">¿Necesitas hablar con un dentista?</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Por <span className="text-accent font-semibold">$10.990</span> te conectamos con un especialista vía videollamada
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 text-xs border-white/10 text-white/60 hover:bg-white/[0.06] hover:text-white/80 bg-transparent"
              onClick={() => navigate('/intro-captura')}
            >
              Primero ver mi análisis gratis
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-white/25 text-center leading-relaxed px-4">
            Orientativo · No reemplaza consulta profesional
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 px-6">
        <p className="text-center text-[11px] text-white/20">
          Beta · Usado por +15.000 personas en Chile
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
