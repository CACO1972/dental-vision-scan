import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-background flex flex-col">
      {/* Main content - Mobile optimized */}
      <main className="flex-1 flex items-center justify-center px-5 md:px-6 py-12 md:py-16">
        <div className="max-w-md w-full space-y-8 md:space-y-12 animate-fade-in">
          {/* Hero section - Apple style minimal with gradient accent */}
          <div className="text-center space-y-4 md:space-y-6">
            {/* Logo with gradient */}
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl mb-6">
              <span className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">M</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground tracking-tight">
              Miro
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-2">
              Revisión dental orientativa mediante inteligencia artificial
            </p>
          </div>

          {/* Features - minimal cards with improved mobile spacing */}
          <div className="space-y-3 md:space-y-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-border/50 shadow-sm">
              <h3 className="font-medium text-foreground mb-1 text-sm md:text-base">Análisis visual</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Sube fotos de tus dientes y recibe observaciones orientativas
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-5 border border-border/50 shadow-sm">
              <h3 className="font-medium text-foreground mb-1 text-sm md:text-base">Privado y seguro</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Tus imágenes se procesan de forma segura y confidencial
              </p>
            </div>
          </div>

          {/* Disclaimer - subtle */}
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed px-4">
            Esta herramienta es orientativa y no reemplaza una consulta profesional.
          </p>

          {/* CTA - Gradient button with shadow */}
          <Button 
            size="lg" 
            className="w-full h-13 md:h-14 text-base font-medium rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
            onClick={() => navigate('/intro-captura')}
          >
            Comenzar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="py-4 md:py-6 px-6">
        <p className="text-center text-xs text-muted-foreground/50">
          Beta · Solo con fines educativos
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
