import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scan, Shield, AlertTriangle } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Miro Dental Scan</span>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">
            Beta
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full space-y-8 animate-fade-in">
          {/* Hero section */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-accent mx-auto flex items-center justify-center mb-6">
              <Scan className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
              Revisión dental digital
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Obtén una revisión orientativa de tu salud dental subiendo una foto de tus dientes
            </p>
          </div>

          {/* Features */}
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Scan className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Análisis visual</h3>
                <p className="text-sm text-muted-foreground">
                  Sube una foto clara de tus dientes y recibe una revisión orientativa con zonas marcadas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Privado y seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Tus fotos se procesan localmente en tu dispositivo
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-warning/10 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning-foreground">
              <strong>Importante:</strong> Esta herramienta es orientativa y <strong>no reemplaza</strong> una consulta presencial con un dentista profesional.
            </p>
          </div>

          {/* CTA */}
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            onClick={() => navigate('/subir-foto')}
          >
            Comenzar revisión
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border bg-card">
        <p className="text-center text-sm text-muted-foreground">
          Versión Beta • Solo con fines educativos
        </p>
      </footer>
    </div>
  );
};

export default Welcome;
