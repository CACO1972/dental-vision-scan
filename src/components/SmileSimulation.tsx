import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Smile, Loader2, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Hallazgo } from '@/context/ImageContext';

interface SmileSimulationProps {
  imageBase64: string;
  hallazgos: Hallazgo[];
}

const SmileSimulation = ({ imageBase64, hallazgos }: SmileSimulationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const generateSimulation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smile-simulation', {
        body: {
          imageBase64,
          hallazgos: hallazgos.map(h => ({ tipo: h.tipo })),
        },
      });

      if (error) throw error;

      if (data?.success && data?.simulatedImage) {
        setSimulatedImage(data.simulatedImage);
        toast({
          title: '¡Simulación lista!',
          description: 'Tu sonrisa simulada ha sido generada.',
        });
      } else {
        throw new Error(data?.error || 'Error al generar la simulación');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la simulación. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!simulatedImage) {
    return (
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Smile className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              Simulación de Sonrisa
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Descubre cómo lucirá tu sonrisa después de los tratamientos recomendados con nuestra simulación impulsada por IA
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={generateSimulation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generando simulación...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generar simulación
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smile className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Simulación de Sonrisa</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Ver resultado' : 'Comparar'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {showComparison ? (
          <div className="grid grid-cols-2 gap-1">
            <div className="relative">
              <img
                src={imageBase64}
                alt="Antes"
                className="w-full h-auto"
              />
              <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Antes
              </span>
            </div>
            <div className="relative">
              <img
                src={simulatedImage}
                alt="Después (simulación)"
                className="w-full h-auto"
              />
              <span className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                Después
              </span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={simulatedImage}
              alt="Simulación de sonrisa"
              className="w-full h-auto"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white text-xs text-center">
                ✨ Resultado simulado después de los tratamientos recomendados
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Simulación generada por IA • Solo con fines ilustrativos
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSimulation}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Regenerar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SmileSimulation;
