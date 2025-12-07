import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertCircle, Info } from 'lucide-react';

interface Deteccion {
  label: string;
  descripcion: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  colorClass: string;
}

const deteccionesSimuladas: Deteccion[] = [
  { 
    label: "Posible caries", 
    descripcion: "Zona posterior izquierda con posible lesión cariosa",
    x: 0.15, 
    y: 0.20, 
    width: 0.15, 
    height: 0.12, 
    color: "#ef4444",
    colorClass: "bg-destructive"
  },
  { 
    label: "Posible cálculo", 
    descripcion: "Acumulación de sarro en zona de encía anterior",
    x: 0.40, 
    y: 0.55, 
    width: 0.20, 
    height: 0.10, 
    color: "#22c55e",
    colorClass: "bg-success"
  },
  { 
    label: "Desgaste dental", 
    descripcion: "Desgaste visible en borde incisivo",
    x: 0.65, 
    y: 0.30, 
    width: 0.20, 
    height: 0.15, 
    color: "#f59e0b",
    colorClass: "bg-warning"
  }
];

const Analisis = () => {
  const navigate = useNavigate();
  const { selectedImageUrl } = useImage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!selectedImageUrl) {
      navigate('/subir-foto');
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Calculate dimensions to fit container while maintaining aspect ratio
      const containerWidth = container.clientWidth;
      const maxHeight = 400;
      
      const aspectRatio = img.width / img.height;
      let canvasWidth = containerWidth;
      let canvasHeight = containerWidth / aspectRatio;
      
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Draw detection rectangles
      deteccionesSimuladas.forEach(det => {
        const rectX = det.x * canvasWidth;
        const rectY = det.y * canvasHeight;
        const rectWidth = det.width * canvasWidth;
        const rectHeight = det.height * canvasHeight;

        // Draw semi-transparent fill
        ctx.fillStyle = det.color + '20';
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        // Draw border
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        // Draw label background
        ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
        const textWidth = ctx.measureText(det.label).width;
        ctx.fillStyle = det.color;
        ctx.fillRect(rectX, rectY - 20, textWidth + 10, 18);

        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(det.label, rectX + 5, rectY - 6);
      });

      setIsLoaded(true);
    };

    img.src = selectedImageUrl;
  }, [selectedImageUrl, navigate]);

  if (!selectedImageUrl) return null;

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
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Zonas marcadas</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Zonas marcadas en tu foto
            </h1>
            <p className="text-muted-foreground">
              Hemos identificado las siguientes áreas de interés
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Canvas */}
            <div 
              ref={containerRef}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-auto block"
              />
              {!isLoaded && (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse-gentle text-muted-foreground">
                    Cargando imagen...
                  </div>
                </div>
              )}
            </div>

            {/* Detections list */}
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Hallazgos detectados
              </h2>
              
              <div className="space-y-3">
                {deteccionesSimuladas.map((det, index) => (
                  <div 
                    key={index}
                    className="bg-card rounded-xl p-4 border border-border flex items-start gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full ${det.colorClass} shrink-0 mt-0.5`} />
                    <div>
                      <h3 className="font-semibold text-foreground">{det.label}</h3>
                      <p className="text-sm text-muted-foreground">{det.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info note */}
              <div className="bg-accent/50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-accent-foreground">
                  Estos hallazgos son simulados con fines demostrativos. Un análisis real requiere evaluación profesional.
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate('/explicacion')}
            >
              Ver explicación para el paciente
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analisis;
