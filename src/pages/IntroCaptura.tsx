import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smile, ArrowUp, ArrowDown, Camera, ChevronRight } from 'lucide-react';

const views = [
  {
    id: 'frontal',
    icon: Smile,
    title: 'Vista Frontal',
    description: 'Sonríe mostrando los dientes frontales, mirando de frente a la cámara.',
  },
  {
    id: 'superior',
    icon: ArrowUp,
    title: 'Maxilar Superior',
    description: 'Inclina la cabeza hacia atrás y abre la boca para mostrar los dientes superiores.',
  },
  {
    id: 'inferior',
    icon: ArrowDown,
    title: 'Maxilar Inferior',
    description: 'Mira hacia abajo, abre la boca y baja la lengua para mostrar los dientes inferiores.',
  },
];

const IntroCaptura = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Captura Dental</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Vamos a tomar 3 fotos
          </h2>
          <p className="text-muted-foreground">
            Sigue las instrucciones en pantalla. La cámara capturará automáticamente cuando detecte la posición correcta.
          </p>
        </div>

        {/* Views list */}
        <div className="space-y-4 flex-1">
          {views.map((view, index) => (
            <div
              key={view.id}
              className="bg-card border border-border rounded-xl p-4 flex items-start gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <view.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{view.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {view.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-2">💡 Consejos</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Busca un lugar con buena iluminación</li>
            <li>• Mantén el dispositivo estable</li>
            <li>• La captura es automática, solo posiciónate</li>
          </ul>
        </div>

        {/* Start button */}
        <Button
          onClick={() => navigate('/auto-capture')}
          size="lg"
          className="w-full mt-6 h-14 text-lg font-semibold"
        >
          Comenzar captura
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </main>
    </div>
  );
};

export default IntroCaptura;
