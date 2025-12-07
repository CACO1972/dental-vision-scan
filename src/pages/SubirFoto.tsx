import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage } from '@/context/ImageContext';
import { Scan, Upload, Camera, CheckCircle, ArrowLeft, X } from 'lucide-react';

const SubirFoto = () => {
  const navigate = useNavigate();
  const { selectedImageUrl, setSelectedImageUrl } = useImage();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImageUrl(url);
    }
  }, [setSelectedImageUrl]);

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
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Subir fotografía</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full space-y-6 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Sube una foto de tus dientes
            </h1>
            <p className="text-muted-foreground">
              Usa una foto clara de tus dientes tomada con tu celular
            </p>
          </div>

          {/* Tips */}
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Consejos para una buena foto
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 ml-6 list-disc">
              <li>Buena iluminación natural o artificial</li>
              <li>Mantén la cámara estable para evitar fotos borrosas</li>
              <li>Muestra los dientes claramente, abriendo la boca</li>
              <li>Evita sombras sobre los dientes</li>
            </ul>
          </div>

          {/* Upload area */}
          {!selectedImageUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-accent/50' 
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
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-accent mx-auto flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    o haz clic para seleccionar un archivo
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG o WEBP • Máximo 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-foreground/80 hover:bg-foreground flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-background" />
              </button>
              <img
                src={selectedImageUrl}
                alt="Foto dental seleccionada"
                className="w-full h-auto max-h-80 object-contain bg-muted"
              />
              <div className="p-4 flex items-center gap-3 bg-success/10 border-t border-success/20">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-success">
                  Imagen cargada correctamente
                </span>
              </div>
            </div>
          )}

          {/* Action button */}
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            disabled={!selectedImageUrl}
            onClick={() => navigate('/analisis')}
          >
            Ver análisis simulado
          </Button>

          {selectedImageUrl && (
            <p className="text-center text-sm text-muted-foreground">
              ¿Imagen incorrecta? Haz clic en la X para cambiarla
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubirFoto;
