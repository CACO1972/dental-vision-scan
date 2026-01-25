import { useNavigate } from 'react-router-dom';
import { useImage, ViewType } from '@/context/ImageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Check, RefreshCw, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const viewLabels: Record<ViewType, string> = {
  frontal: 'Frontal',
  superior: 'Superior',
  inferior: 'Inferior',
};

const VIEW_ORDER: ViewType[] = ['frontal', 'superior', 'inferior'];

const RevisarFotos = () => {
  const navigate = useNavigate();
  const { capturedImages, clearCapturedImages } = useImage();

  useEffect(() => {
    if (capturedImages.length === 0) {
      navigate('/subir-foto');
    }
  }, [capturedImages, navigate]);

  const handleRetake = () => {
    clearCapturedImages();
    navigate('/auto-capture');
  };

  const handleAnalyze = async () => {
    if (capturedImages.length === 0) return;
    navigate('/analizando');
  };

  const getCapturedImage = (view: ViewType) => {
    return capturedImages.find(img => img.view === view);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate('/subir-foto')}
            className="w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Revisar fotos</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Fotos capturadas
            </h1>
            <p className="text-muted-foreground">
              Revisa las fotos antes de analizar
            </p>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {VIEW_ORDER.map((view) => {
              const image = getCapturedImage(view);
              
              return (
                <div key={view} className="space-y-2">
                  <div className={cn(
                    'aspect-square rounded-xl overflow-hidden border-2',
                    image ? 'border-green-500' : 'border-border bg-muted'
                  )}>
                    {image ? (
                      <img
                        src={image.imageUrl}
                        alt={`Vista ${viewLabels[view]}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {image && <Check className="w-4 h-4 text-green-500" />}
                    <span className={cn(
                      'text-sm font-medium',
                      image ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {viewLabels[view]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {capturedImages.length} de 3 fotos capturadas
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={handleAnalyze}
              disabled={capturedImages.length === 0}
            >
              <Scan className="w-5 h-5 mr-2" />
              Analizar con IA
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleRetake}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Volver a tomar fotos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RevisarFotos;
