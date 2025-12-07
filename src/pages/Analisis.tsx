import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage, Hallazgo } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertCircle, Info, CheckCircle2, AlertTriangle, ImageOff } from 'lucide-react';

const tipoConfig: Record<string, { color: string; colorClass: string; label: string }> = {
  caries: { color: '#ef4444', colorClass: 'bg-destructive', label: 'Posible caries' },
  calculo: { color: '#22c55e', colorClass: 'bg-success', label: 'Posible cálculo/sarro' },
  desgaste: { color: '#f59e0b', colorClass: 'bg-warning', label: 'Desgaste dental' },
  gingivitis: { color: '#8b5cf6', colorClass: 'bg-purple-500', label: 'Posible gingivitis' },
  otro: { color: '#6b7280', colorClass: 'bg-gray-500', label: 'Observación' },
};

const confianzaLabel: Record<string, string> = {
  alta: 'Alta confianza',
  media: 'Confianza media',
  baja: 'Baja confianza',
};

const Analisis = () => {
  const navigate = useNavigate();
  const { selectedImageUrl, analysisResult } = useImage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!selectedImageUrl || !analysisResult) {
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

      // Draw detection rectangles from AI analysis
      if (analysisResult.hallazgos && analysisResult.hallazgos.length > 0) {
        analysisResult.hallazgos.forEach((hallazgo: Hallazgo) => {
          const config = tipoConfig[hallazgo.tipo] || tipoConfig.otro;
          const coords = hallazgo.coordenadas;
          
          if (coords) {
            const rectX = coords.x * canvasWidth;
            const rectY = coords.y * canvasHeight;
            const rectWidth = coords.width * canvasWidth;
            const rectHeight = coords.height * canvasHeight;

            // Draw semi-transparent fill
            ctx.fillStyle = config.color + '25';
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

            // Draw border
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

            // Draw label background
            ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
            const textWidth = ctx.measureText(config.label).width;
            ctx.fillStyle = config.color;
            ctx.fillRect(rectX, rectY - 20, textWidth + 10, 18);

            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(config.label, rectX + 5, rectY - 6);
          }
        });
      }

      setIsLoaded(true);
    };

    img.src = selectedImageUrl;
  }, [selectedImageUrl, analysisResult, navigate]);

  if (!selectedImageUrl || !analysisResult) return null;

  const hasFindings = analysisResult.hallazgos && analysisResult.hallazgos.length > 0;

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
          <span className="font-semibold text-lg text-foreground">Resultados del análisis</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {analysisResult.analisisValido 
                ? 'Análisis completado' 
                : 'No se pudo analizar la imagen'}
            </h1>
            <p className="text-muted-foreground">
              {analysisResult.mensajeGeneral}
            </p>
          </div>

          {/* Image quality warning */}
          {analysisResult.calidadImagen !== 'buena' && (
            <div className={`rounded-xl p-4 flex items-start gap-3 ${
              analysisResult.calidadImagen === 'mala' 
                ? 'bg-destructive/10 border border-destructive/20' 
                : 'bg-warning/10 border border-warning/20'
            }`}>
              <ImageOff className={`w-5 h-5 shrink-0 mt-0.5 ${
                analysisResult.calidadImagen === 'mala' ? 'text-destructive' : 'text-warning'
              }`} />
              <div>
                <h3 className={`font-semibold text-sm ${
                  analysisResult.calidadImagen === 'mala' ? 'text-destructive' : 'text-warning'
                }`}>
                  Calidad de imagen: {analysisResult.calidadImagen}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysisResult.notaCalidadImagen}
                </p>
              </div>
            </div>
          )}

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
                {hasFindings ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Hallazgos detectados ({analysisResult.hallazgos.length})
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Sin hallazgos evidentes
                  </>
                )}
              </h2>
              
              {hasFindings ? (
                <div className="space-y-3">
                  {analysisResult.hallazgos.map((hallazgo: Hallazgo, index: number) => {
                    const config = tipoConfig[hallazgo.tipo] || tipoConfig.otro;
                    return (
                      <div 
                        key={index}
                        className="bg-card rounded-xl p-4 border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full ${config.colorClass} shrink-0 mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-foreground">{config.label}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                hallazgo.confianza === 'alta' 
                                  ? 'bg-success/20 text-success' 
                                  : hallazgo.confianza === 'media'
                                    ? 'bg-warning/20 text-warning'
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {confianzaLabel[hallazgo.confianza]}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{hallazgo.descripcion}</p>
                            {hallazgo.ubicacion && (
                              <p className="text-xs text-muted-foreground mt-1">
                                📍 {hallazgo.ubicacion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-success/10 rounded-xl p-4 border border-success/20">
                  <p className="text-sm text-foreground">
                    No se detectaron problemas evidentes en la imagen. Sin embargo, esto <strong>no garantiza</strong> que no existan problemas dentales. 
                    Una evaluación profesional presencial es necesaria para un diagnóstico completo.
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {analysisResult.recomendacion && (
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h3 className="font-semibold text-sm text-primary mb-2">💡 Recomendación</h3>
                  <p className="text-sm text-foreground">{analysisResult.recomendacion}</p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-accent/50 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-accent-foreground">
                  <strong>Importante:</strong> Este análisis es orientativo y fue realizado por inteligencia artificial. 
                  NO reemplaza la evaluación de un profesional odontólogo. 
                  Consulta con tu dentista para un diagnóstico definitivo.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            {hasFindings && (
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => navigate('/explicacion')}
              >
                Ver explicación detallada
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/subir-foto')}
            >
              Analizar otra foto
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analisis;
