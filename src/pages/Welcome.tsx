import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, TrendingDown, Video } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background flex flex-col">
      {/* Main content - Mobile optimized */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-6 py-8 md:py-12">
        <div className="max-w-md w-full space-y-6 md:space-y-8 animate-fade-in">
          {/* Hero section */}
          <div className="text-center space-y-3 md:space-y-4">
            {/* Logo with gradient */}
            <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl mb-4">
              <span className="text-2xl md:text-3xl font-display font-bold text-primary-foreground">M</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground tracking-tight">
              Miro
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Revisión dental con IA · Ahorra hasta <span className="text-primary font-semibold">$45.000</span> en diagnósticos
            </p>
          </div>

          {/* Social Proof Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center">
                    <Users className="w-3 h-3 text-primary-foreground" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-warning text-warning" />
                ))}
              </div>
            </div>
            <p className="text-xs text-center text-foreground font-medium">
              +2.847 análisis realizados esta semana
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              "Me ahorré una visita innecesaria" — María G.
            </p>
          </div>

          {/* Savings highlight */}
          <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Ahorra en promedio $45.000</p>
                <p className="text-xs text-muted-foreground">vs. consulta presencial inicial</p>
              </div>
            </div>
          </div>

          {/* Features - compact */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/60 rounded-xl p-3 border border-border/30">
              <p className="text-xs font-medium text-foreground">⚡ Resultado en 2 min</p>
            </div>
            <div className="bg-card/60 rounded-xl p-3 border border-border/30">
              <p className="text-xs font-medium text-foreground">🔒 100% privado</p>
            </div>
          </div>

          {/* CTA - Gradient button */}
          <Button 
            size="lg" 
            className="w-full h-13 md:h-14 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
            onClick={() => navigate('/intro-captura')}
          >
            Analizar gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Telemedicine upsell */}
          <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl p-4 border border-accent/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">¿Necesitas hablar con un dentista?</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Por <span className="text-primary font-semibold">$10.990</span> te conectamos con un especialista vía videollamada
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 text-xs border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => navigate('/intro-captura')}
            >
              Primero ver mi análisis gratis
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed px-4">
            Orientativo · No reemplaza consulta profesional
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-6">
        <p className="text-center text-xs text-muted-foreground/50">
          Beta · Usado por +15.000 personas en Chile
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
