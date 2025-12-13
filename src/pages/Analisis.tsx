import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage, Hallazgo, ViewType } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertCircle, CheckCircle2, AlertTriangle, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const viewLabels: Record<ViewType, string> = {
  frontal: 'Frontal',
  superior: 'Superior',
  inferior: 'Inferior',
};

const Analisis = () => {
  const navigate = useNavigate();
  const { selectedImageUrl, analysisResult, capturedImages } = useImage();
  const [selectedView, setSelectedView] = useState<ViewType | 'all'>('all');

  useEffect(() => {
    // Check if we have either single image or multiple captured images
    const hasSingleImage = selectedImageUrl && analysisResult;
    const hasMultipleImages = capturedImages.length > 0 && analysisResult;
    
    if (!hasSingleImage && !hasMultipleImages) {
      navigate('/subir-foto');
    }
  }, [selectedImageUrl, analysisResult, capturedImages, navigate]);

  if (!analysisResult) return null;

  const hasMultipleImages = capturedImages.length > 0;
  const hasFindings = analysisResult.hallazgos && analysisResult.hallazgos.length > 0;

  // Filter findings by view
  const filteredFindings = selectedView === 'all' 
    ? analysisResult.hallazgos 
    : analysisResult.hallazgos.filter((h: Hallazgo) => h.vista === selectedView);

  // Get current display image
  const getCurrentImage = () => {
    if (hasMultipleImages) {
      if (selectedView === 'all') {
        return capturedImages[0]?.imageUrl;
      }
      return capturedImages.find(img => img.view === selectedView)?.imageUrl;
    }
    return selectedImageUrl;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate(hasMultipleImages ? '/revisar-fotos' : '/subir-foto')}
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
            {hasMultipleImages && (
              <p className="text-sm text-primary font-medium">
                {capturedImages.length} vistas analizadas
              </p>
            )}
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

          {/* View selector for multiple images */}
          {hasMultipleImages && (
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => setSelectedView('all')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  selectedView === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                Todos ({analysisResult.hallazgos.length})
              </button>
              {capturedImages.map(img => {
                const viewFindings = analysisResult.hallazgos.filter((h: Hallazgo) => h.vista === img.view);
                return (
                  <button
                    key={img.view}
                    onClick={() => setSelectedView(img.view)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedView === img.view
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {viewLabels[img.view]} ({viewFindings.length})
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Image display */}
            <div className="space-y-4">
              {hasMultipleImages ? (
                <div className="grid grid-cols-3 gap-2">
                  {capturedImages.map(img => (
                    <button
                      key={img.view}
                      onClick={() => setSelectedView(img.view)}
                      className={cn(
                        'aspect-square rounded-xl overflow-hidden border-2 transition-all',
                        selectedView === img.view || selectedView === 'all'
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border opacity-60 hover:opacity-100'
                      )}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`Vista ${viewLabels[img.view]}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <img
                    src={selectedImageUrl || ''}
                    alt="Imagen dental"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              )}

              {/* General message */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {analysisResult.mensajeGeneral}
                </p>
              </div>
            </div>

            {/* Detections list */}
            <div className="space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                {filteredFindings.length > 0 ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-primary" />
                    Hallazgos detectados ({filteredFindings.length})
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Sin hallazgos evidentes
                  </>
                )}
              </h2>
              
              {filteredFindings.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {filteredFindings.map((hallazgo: Hallazgo, index: number) => {
                    const config = tipoConfig[hallazgo.tipo] || tipoConfig.otro;
                    return (
                      <div 
                        key={index}
                        className="bg-card rounded-xl p-4 border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-4 h-4 rounded-full ${config.colorClass} shrink-0 mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{config.label}</h3>
                              <div className="flex items-center gap-2">
                                {hallazgo.vista && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {viewLabels[hallazgo.vista]}
                                  </span>
                                )}
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
                    No se detectaron problemas evidentes en {selectedView === 'all' ? 'las imágenes' : 'esta vista'}. 
                    Sin embargo, esto <strong>no garantiza</strong> que no existan problemas dentales. 
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
              Analizar otras fotos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analisis;
