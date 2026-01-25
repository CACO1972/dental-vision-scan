import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage } from '@/context/ImageContext';
import { Scan, Upload, Camera, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';

const SubirFoto = () => {
  const navigate = useNavigate();
  const { selectedImageUrl, setSelectedImageUrl, selectedImageBase64, setSelectedImageBase64, setAnalysisResult } = useImage();
  const [isDragging, setIsDragging] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImageUrl(url);
      
      try {
        const base64 = await convertToBase64(file);
        setSelectedImageBase64(base64);
      } catch (error) {
        console.error('Error converting to base64:', error);
        toast.error('Error al procesar la imagen');
      }
    }
  }, [setSelectedImageUrl, setSelectedImageBase64]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearImage = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
    setSelectedImageBase64(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = () => {
    if (!selectedImageBase64) return;
    navigate('/analizando');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Mobile optimized */}
      <header className="w-full py-3 px-4 md:py-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Scan className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-base md:text-lg text-foreground">Subir fotografía</span>
        </div>
      </header>

      {/* Main content - Mobile optimized */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 md:px-6 py-6 md:py-12">
        <div className="max-w-xl w-full space-y-5 md:space-y-6 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-1.5 md:space-y-2">
            <h1 className="text-xl md:text-3xl font-bold text-foreground">
              Sube una foto de tus dientes
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Usa una foto clara tomada con tu celular
            </p>
          </div>

          {/* Tips - Collapsible on mobile */}
          <div className="bg-card rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/50 shadow-sm space-y-2 md:space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Consejos para una buena foto
            </h3>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-1.5 ml-6 list-disc">
              <li>Buena iluminación natural o artificial</li>
              <li>Mantén la cámara estable</li>
              <li>Muestra los dientes claramente</li>
              <li>Evita sombras sobre los dientes</li>
            </ul>
          </div>

          {/* Upload options */}
          {!selectedImageUrl ? (
            <div className="space-y-3 md:space-y-4">
              {/* Auto capture button */}
              <Button
                variant="outline"
                size="lg"
                className="w-full py-5 md:py-6 border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl md:rounded-2xl"
                onClick={() => navigate('/intro-captura')}
              >
                <Camera className="w-5 h-5 mr-2 md:mr-3 text-primary" />
                <div className="text-left">
                  <span className="font-semibold text-foreground text-sm md:text-base">Captura guiada (3 vistas)</span>
                  <p className="text-xs text-muted-foreground hidden md:block">Análisis más completo con múltiples ángulos</p>
                </div>
              </Button>

              {/* Manual upload area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-8 text-center transition-all duration-200 cursor-pointer
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-3 md:space-y-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm md:text-base">
                      Subir imagen única
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      Toca para seleccionar una foto
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG o WEBP • Máximo 10MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden shadow-sm">
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 md:top-3 md:right-3 z-10 w-8 h-8 rounded-full bg-foreground/80 hover:bg-foreground flex items-center justify-center transition-colors active:scale-95"
              >
                <X className="w-4 h-4 text-background" />
              </button>
              <img
                src={selectedImageUrl}
                alt="Foto dental seleccionada"
                className="w-full h-auto max-h-64 md:max-h-80 object-contain bg-muted"
              />
              <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3 bg-success/10 border-t border-success/20">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-success" />
                <span className="text-xs md:text-sm font-medium text-success">
                  Imagen cargada correctamente
                </span>
              </div>
            </div>
          )}

          {/* Action button - Fixed on mobile */}
          <div className="pt-2 md:pt-0">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full rounded-xl md:rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
              disabled={!selectedImageUrl}
              onClick={handleAnalyze}
            >
              Analizar con IA
            </Button>
          </div>

          {selectedImageUrl && (
            <p className="text-center text-xs md:text-sm text-muted-foreground pb-4">
              ¿Imagen incorrecta? Toca la X para cambiarla
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubirFoto;
