import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full space-y-12 animate-fade-in">
          {/* Hero section - Apple style minimal */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground tracking-tight">
              Miro
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Revisión dental orientativa mediante inteligencia artificial
            </p>
          </div>

          {/* Features - minimal cards */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border/50">
              <h3 className="font-medium text-foreground mb-1">Análisis visual</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sube fotos de tus dientes y recibe observaciones orientativas
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border/50">
              <h3 className="font-medium text-foreground mb-1">Privado y seguro</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tus imágenes se procesan de forma segura y confidencial
              </p>
            </div>
          </div>

          {/* Disclaimer - subtle */}
          <p className="text-xs text-muted-foreground/70 text-center leading-relaxed px-4">
            Esta herramienta es orientativa y no reemplaza una consulta con un profesional dental.
          </p>

          {/* CTA - Apple style button */}
          <Button 
            size="lg" 
            className="w-full h-14 text-base font-medium rounded-2xl bg-foreground text-background hover:bg-foreground/90 transition-all"
            onClick={() => navigate('/intro-captura')}
          >
            Comenzar
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="py-6 px-6">
        <p className="text-center text-xs text-muted-foreground/50">
          Beta · Solo con fines educativos
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
