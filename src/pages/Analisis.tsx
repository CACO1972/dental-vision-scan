import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage, Hallazgo, ViewType } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertCircle, CheckCircle2, AlertTriangle, ImageOff, Activity, ListChecks, EyeOff, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaymentUpgrade from '@/components/PaymentUpgrade';
import { useToast } from '@/hooks/use-toast';
const tipoConfig: Record<string, { color: string; colorClass: string; label: string }> = {
  caries: { color: '#ef4444', colorClass: 'bg-destructive', label: 'Posible caries' },
  calculo: { color: '#22c55e', colorClass: 'bg-success', label: 'Posible cálculo/sarro' },
  desgaste: { color: '#f59e0b', colorClass: 'bg-warning', label: 'Desgaste dental' },
  gingivitis: { color: '#8b5cf6', colorClass: 'bg-purple-500', label: 'Posible gingivitis' },
  placa: { color: '#eab308', colorClass: 'bg-yellow-500', label: 'Placa dental' },
  restauracion: { color: '#3b82f6', colorClass: 'bg-blue-500', label: 'Restauración' },
  fractura: { color: '#dc2626', colorClass: 'bg-red-600', label: 'Fractura' },
  manchas: { color: '#a16207', colorClass: 'bg-amber-700', label: 'Manchas' },
  recesion: { color: '#7c3aed', colorClass: 'bg-violet-600', label: 'Recesión gingival' },
  otro: { color: '#6b7280', colorClass: 'bg-gray-500', label: 'Observación' },
};

const confianzaLabel: Record<string, string> = {
  alta: 'Alta confianza',
  media: 'Confianza media',
  baja: 'Baja confianza',
};

const severidadConfig: Record<string, { colorClass: string; label: string }> = {
  leve: { colorClass: 'bg-success/20 text-success', label: 'Leve' },
  moderado: { colorClass: 'bg-warning/20 text-warning', label: 'Moderado' },
  severo: { colorClass: 'bg-destructive/20 text-destructive', label: 'Severo' },
};

const estadoGeneralConfig: Record<string, { icon: string; colorClass: string; bgClass: string; label: string }> = {
  bueno: { icon: '✓', colorClass: 'text-success', bgClass: 'bg-success/10 border-success/20', label: 'Estado general bueno' },
  aceptable: { icon: '○', colorClass: 'text-primary', bgClass: 'bg-primary/10 border-primary/20', label: 'Estado general aceptable' },
  requiere_atencion: { icon: '!', colorClass: 'text-warning', bgClass: 'bg-warning/10 border-warning/20', label: 'Requiere atención' },
  urgente: { icon: '⚠', colorClass: 'text-destructive', bgClass: 'bg-destructive/10 border-destructive/20', label: 'Atención urgente recomendada' },
};

const viewLabels: Record<ViewType, string> = {
  frontal: 'Frontal',
  superior: 'Superior',
  inferior: 'Inferior',
};

const Analisis = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { selectedImageUrl, analysisResult, capturedImages } = useImage();
  const [selectedView, setSelectedView] = useState<ViewType | 'all'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

  // Check for successful payment return
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        setIsPremiumUnlocked(true);
        localStorage.removeItem('pendingPayment');
        toast({
          title: '¡Pago exitoso!',
          description: 'Tu informe completo ya está disponible.',
        });
      }
    }
  }, [searchParams, toast]);

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

            {/* Detections and info list */}
            <div className="space-y-4">
              {/* Estado General */}
              {analysisResult.estadoGeneral && (
                <div className={cn(
                  'rounded-xl p-4 border flex items-center gap-3',
                  estadoGeneralConfig[analysisResult.estadoGeneral]?.bgClass || 'bg-muted'
                )}>
                  <Activity className={cn(
                    'w-6 h-6',
                    estadoGeneralConfig[analysisResult.estadoGeneral]?.colorClass || 'text-foreground'
                  )} />
                  <div>
                    <h3 className={cn(
                      'font-semibold',
                      estadoGeneralConfig[analysisResult.estadoGeneral]?.colorClass || 'text-foreground'
                    )}>
                      {estadoGeneralConfig[analysisResult.estadoGeneral]?.label || 'Estado general'}
                    </h3>
                  </div>
                </div>
              )}

              {/* Hallazgos */}
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
                  {filteredFindings.slice(0, isPremiumUnlocked ? undefined : 2).map((hallazgo: Hallazgo, index: number) => {
                    const config = tipoConfig[hallazgo.tipo] || tipoConfig.otro;
                    const severidadCfg = hallazgo.severidad ? severidadConfig[hallazgo.severidad] : null;
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
                              <div className="flex items-center gap-2 flex-wrap">
                                {severidadCfg && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severidadCfg.colorClass}`}>
                                    {severidadCfg.label}
                                  </span>
                                )}
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
                            {isPremiumUnlocked && hallazgo.recomendacionEspecifica && (
                              <p className="text-xs text-primary mt-2 bg-primary/5 rounded-lg p-2">
                                💡 {hallazgo.recomendacionEspecifica}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Premium locked content indicator */}
                  {!isPremiumUnlocked && filteredFindings.length > 2 && (
                    <div 
                      className="bg-gradient-to-b from-card to-muted/50 rounded-xl p-6 border border-border text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-semibold text-foreground mb-1">
                        +{filteredFindings.length - 2} hallazgos más
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Desbloquea el informe completo para ver todos los hallazgos y recomendaciones personalizadas
                      </p>
                      <Button variant="hero" size="sm" onClick={() => setShowPaymentModal(true)}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Desbloquear por $4.990
                      </Button>
                    </div>
                  )}
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

              {/* Próximos Pasos */}
              {analysisResult.proximosPasos && analysisResult.proximosPasos.length > 0 && (
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-primary" />
                    Próximos pasos recomendados
                  </h3>
                  <ol className="space-y-2">
                    {analysisResult.proximosPasos.map((paso, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                          {index + 1}
                        </span>
                        {paso}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Áreas no visibles */}
              {analysisResult.areasNoVisibles && analysisResult.areasNoVisibles.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Áreas no evaluadas
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {analysisResult.areasNoVisibles.map((area, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendation */}
              {analysisResult.recomendacion && (
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <h3 className="font-semibold text-sm text-primary mb-2">💡 Recomendación general</h3>
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

          {/* Upsell CTA for free users */}
          {!isPremiumUnlocked && hasFindings && (
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-bold text-lg text-foreground mb-1">
                    ¿Quieres el informe completo?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Incluye todos los hallazgos, recomendaciones personalizadas y simulación de sonrisa
                  </p>
                </div>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => setShowPaymentModal(true)}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Desbloquear por $4.990
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            {isPremiumUnlocked && hasFindings && (
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-md w-full animate-fade-in">
            <PaymentUpgrade 
              onClose={() => setShowPaymentModal(false)}
              onSuccess={() => {
                setIsPremiumUnlocked(true);
                setShowPaymentModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;
