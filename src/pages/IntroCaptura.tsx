import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Smile, ArrowUp, ArrowDown, Camera, ChevronRight, Volume2, VolumeX, Users, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import dentalFrontalView from '@/assets/dental-frontal-view.png';
import dentalSuperiorView from '@/assets/dental-superior-view.png';
import dentalInferiorView from '@/assets/dental-inferior-view.png';

const views = [
  {
    id: 'frontal',
    icon: Smile,
    title: 'Vista Frontal',
    description: 'Sonríe mostrando los dientes frontales, mirando de frente a la cámara.',
    image: dentalFrontalView,
    voiceText: 'Para la primera foto, sonríe naturalmente mostrando tus dientes frontales. Mira directamente a la cámara. La captura será automática cuando detecte la posición correcta.',
  },
  {
    id: 'superior',
    icon: ArrowUp,
    title: 'Maxilar Superior',
    description: 'Voltea el celular para que la cámara apunte desde abajo. Inclina la cabeza hacia atrás y abre la boca.',
    image: dentalSuperiorView,
    voiceText: 'Para la segunda foto del maxilar superior, voltea el celular de manera que la cámara quede mirando hacia arriba, desde abajo de tu mentón. Inclina tu cabeza hacia atrás y abre bien la boca. La cámara capturará automáticamente.',
    tip: 'Voltea el celular para que la cámara apunte hacia arriba',
  },
  {
    id: 'inferior',
    icon: ArrowDown,
    title: 'Maxilar Inferior',
    description: 'Mantén el celular arriba mirando hacia abajo. Abre la boca y baja la lengua.',
    image: dentalInferiorView,
    voiceText: 'Para la tercera foto del maxilar inferior, sostén el celular por encima de tu boca con la cámara apuntando hacia abajo. Abre la boca y baja la lengua para mostrar los dientes inferiores.',
  },
];

const fullIntroText = `¡Hola! Vamos a tomar tres fotos de tus dientes. 

Lo ideal es que otra persona te ayude a tomar las fotos para obtener mejores resultados. Si estás solo o sola, no te preocupes, te guiaré paso a paso.

Primero tomaremos una foto frontal sonriendo. Luego, para el maxilar superior, te recomiendo voltear el celular para que la cámara quede apuntando desde abajo hacia arriba. Finalmente, tomaremos una foto del maxilar inferior con el celular desde arriba.

La captura es automática, solo tienes que posicionarte correctamente y mantener la posición por unos segundos. ¡Busca un lugar con buena luz y comencemos!`;

const IntroCaptura = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playVoiceGuide = async (text: string, viewIndex?: number) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setActiveView(null);
      return;
    }

    setIsLoading(true);
    setActiveView(viewIndex ?? null);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'nova' },
      });

      if (error) throw error;

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setActiveView(null);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setActiveView(null);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing voice guide:', error);
      setActiveView(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Captura Dental</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => playVoiceGuide(fullIntroText)}
            disabled={isLoading}
            className="relative"
          >
            {isPlaying && activeView === null ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
            {isLoading && activeView === null && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="animate-ping absolute h-3 w-3 rounded-full bg-primary opacity-75"></span>
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 flex flex-col overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Vamos a tomar 3 fotos
          </h2>
          <p className="text-muted-foreground text-sm">
            La cámara capturará automáticamente cuando detecte la posición correcta.
          </p>
        </div>

        {/* Recommendation: Have someone help */}
        <div className="mb-4 bg-accent/50 border border-accent rounded-xl p-3 flex items-start gap-3">
          <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Recomendación</p>
            <p className="text-xs text-muted-foreground">
              Idealmente, pide a otra persona que te ayude a tomar las fotos para mejores resultados.
            </p>
          </div>
        </div>

        {/* Views list */}
        <div className="space-y-4 flex-1">
          {views.map((view, index) => (
            <div
              key={view.id}
              className={`bg-card border rounded-xl p-4 transition-all ${
                activeView === index ? 'border-primary ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <view.icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">{view.title}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playVoiceGuide(view.voiceText, index)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {isPlaying && activeView === index ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    {view.description}
                  </p>
                  
                  {/* Illustration */}
                  <div className="relative rounded-lg overflow-hidden bg-muted/30 aspect-square max-w-[140px] mx-auto">
                    <img 
                      src={view.image} 
                      alt={`Posición para ${view.title}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Special tip for superior view */}
                  {view.tip && (
                    <div className="mt-3 flex items-center gap-2 bg-primary/10 rounded-lg p-2">
                      <RotateCcw className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-xs text-primary font-medium">{view.tip}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3">
          <h4 className="font-semibold text-foreground mb-2 text-sm">🥄 Separador casero</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Usa <strong>2 cucharas limpias</strong> como separadores de mejillas</li>
            <li>• Coloca la parte trasera de la cuchara hacia afuera</li>
            <li>• También puedes usar tus dedos para separar los labios</li>
            <li>• Aplica bálsamo labial para mayor comodidad</li>
          </ul>
        </div>
        
        <div className="mt-3 bg-muted/50 border border-border rounded-xl p-3">
          <h4 className="font-semibold text-foreground mb-2 text-sm">💡 Consejos generales</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Busca un lugar con buena iluminación natural</li>
            <li>• Si puedes, pide ayuda a alguien para las fotos</li>
            <li>• Mantén el dispositivo estable durante la captura</li>
          </ul>
        </div>

        {/* Start button */}
        <Button
          onClick={() => navigate('/auto-capture')}
          size="lg"
          className="w-full mt-4 h-14 text-lg font-semibold"
        >
          Comenzar captura
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </main>
    </div>
  );
};

export default IntroCaptura;
