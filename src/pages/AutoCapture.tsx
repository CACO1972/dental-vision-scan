import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage, ViewType, CapturedImage } from '@/context/ImageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Sun, SunDim, Check, Play, RotateCcw, ArrowRight, CircleCheck, CircleX, Contrast, Focus, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

import dentalFrontalView from '@/assets/dental-frontal-view.png';
import dentalSuperiorView from '@/assets/dental-superior-view.png';
import dentalInferiorView from '@/assets/dental-inferior-view.png';

const VIEW_ORDER: ViewType[] = ['frontal', 'superior', 'inferior'];

const viewLabels: Record<ViewType, string> = {
  frontal: 'Frontal',
  superior: 'Superior',
  inferior: 'Inferior',
};

const viewInstructions: Record<ViewType, string> = {
  frontal: 'Sonríe mostrando los 6 dientes frontales superiores e inferiores. Deben verse completos desde canino a canino.',
  superior: 'Inclina la cabeza hacia atrás y abre bien la boca. Deben verse al menos 10 dientes superiores hasta el primer molar.',
  inferior: 'Mira hacia abajo, abre la boca y baja la lengua. Deben verse al menos 10 dientes inferiores hasta el primer molar.',
};

const viewImages: Record<ViewType, string> = {
  frontal: dentalFrontalView,
  superior: dentalSuperiorView,
  inferior: dentalInferiorView,
};

const viewVoiceTexts: Record<ViewType, string> = {
  frontal: 'Vamos a tomar la foto frontal. Sonríe ampliamente mostrando tus dientes. Necesitamos ver los seis dientes anteriores superiores completos, de canino a canino, y al menos parte de los seis dientes anteriores inferiores. Separa los labios para que se vean bien.',
  superior: 'Ahora vamos con la vista superior. Inclina tu cabeza hacia atrás, abre bien la boca mirando hacia el techo. Necesitamos ver las caras oclusales de al menos diez dientes superiores, desde los incisivos hasta el primer molar de cada lado.',
  inferior: 'Por último, la vista inferior. Mira hacia abajo, abre bien la boca y baja la lengua. Necesitamos ver las caras oclusales de al menos diez dientes inferiores, desde los incisivos hasta el primer molar de cada lado.',
};

// Umbral más alto = menos sensible al movimiento (más permisivo)
const STABILITY_THRESHOLD = 30;
// Tiempo para capturar = 5 segundos estable
const STABILITY_TIME_MS = 5000;
// Brillo mínimo más permisivo para capturar en más condiciones
const BRIGHTNESS_MIN = 30;
const SAMPLE_SIZE = 60;

const playShutterSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    console.log('Could not play shutter sound');
  }
};

type CaptureStage = 'instructions' | 'capturing' | 'validating';

// Umbrales de calidad de imagen (permisivos para análisis orientativo)
const QUALITY_BRIGHTNESS_MIN = 25;
const QUALITY_BRIGHTNESS_MAX = 250;
const QUALITY_CONTRAST_MIN = 20;
const QUALITY_SHARPNESS_MIN = 8; // Umbral mínimo de nitidez (varianza Laplaciana)

interface ImageQualityResult {
  isValid: boolean;
  brightness: number;
  contrast: number;
}

// Validación rápida de calidad en tiempo real (usa datos ya calculados del frame)
const checkQualityFromFrameData = (brightness: number, contrast: number, sharpness: number): boolean => {
  return brightness >= QUALITY_BRIGHTNESS_MIN && 
         brightness <= QUALITY_BRIGHTNESS_MAX && 
         contrast >= QUALITY_CONTRAST_MIN &&
         sharpness >= QUALITY_SHARPNESS_MIN;
};

const AutoCapture = () => {
  const navigate = useNavigate();
  const { addCapturedImage, capturedImages, clearCapturedImages, getCapturedImage } = useImage();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const stableStartRef = useRef<number | null>(null);
  const hasCapturedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [stage, setStage] = useState<CaptureStage>('instructions');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [isLightAdequate, setIsLightAdequate] = useState(false);
  const [statusText, setStatusText] = useState('Iniciando cámara...');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCaptureSuccess, setShowCaptureSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isQualityOk, setIsQualityOk] = useState(false);
  const [currentBrightness, setCurrentBrightness] = useState(0);
  const [currentContrast, setCurrentContrast] = useState(0);
  const [currentSharpness, setCurrentSharpness] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuggestion, setValidationSuggestion] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; base64: string } | null>(null);

  const currentView = VIEW_ORDER[currentViewIndex];
  const isLastView = currentViewIndex === VIEW_ORDER.length - 1;

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const handleCancel = () => {
    stopCamera();
    stopAudio();
    clearCapturedImages();
    navigate('/subir-foto');
  };

  const playVoiceGuidance = async () => {
    if (isLoadingAudio || isPlayingAudio) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: viewVoiceTexts[currentView] }
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };

      await audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      console.error('Error playing voice guidance:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const startCapture = () => {
    stopAudio();
    setStage('capturing');
  };


  const captureImage = async () => {
    if (!canvasRef.current) return;
    
    hasCapturedRef.current = true;
    setIsCapturing(true);
    playShutterSound();

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    
    // Guardar imagen pendiente y pasar a validación
    setPendingImage({ dataUrl, base64 });
    setStage('validating');
    setIsValidating(true);
    setValidationError(null);
    setValidationSuggestion(null);
    setStatusText('🔍 Verificando dientes visibles...');
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-dental-view', {
        body: { imageBase64: base64, viewType: currentView }
      });
      
      if (error) throw error;
      
      if (data.esValida) {
        // Imagen válida - guardar y continuar
        const capturedImage: CapturedImage = {
          view: currentView,
          imageUrl: dataUrl,
          imageBase64: base64,
        };
        
        addCapturedImage(capturedImage);
        setShowCaptureSuccess(true);
        setStatusText(`✅ ¡Perfecto! ${data.dientesVisibles || ''} dientes detectados`);
        
        setTimeout(() => {
          if (isLastView) {
            stopCamera();
            stopAudio();
            navigate('/revisar-fotos');
          } else {
            advanceToNextView();
          }
        }, 1200);
      } else {
        // Imagen no válida - mostrar error y permitir reintentar
        setValidationError(data.mensaje || 'No se detectaron suficientes dientes');
        setValidationSuggestion(data.sugerencia || 'Intenta abrir más la boca y mostrar más dientes');
        setStatusText('❌ Imagen no válida');
      }
    } catch (err) {
      console.error('Validation error:', err);
      // En caso de error de validación, aceptar la imagen (fail-open)
      const capturedImage: CapturedImage = {
        view: currentView,
        imageUrl: dataUrl,
        imageBase64: base64,
      };
      addCapturedImage(capturedImage);
      setShowCaptureSuccess(true);
      setStatusText('✅ ¡Capturado!');
      
      setTimeout(() => {
        if (isLastView) {
          stopCamera();
          stopAudio();
          navigate('/revisar-fotos');
        } else {
          advanceToNextView();
        }
      }, 800);
    } finally {
      setIsValidating(false);
      setIsCapturing(false);
    }
  };
  
  const advanceToNextView = () => {
    setCurrentViewIndex(prev => prev + 1);
    hasCapturedRef.current = false;
    stableStartRef.current = null;
    prevFrameRef.current = null;
    setStabilityProgress(0);
    setIsCapturing(false);
    setShowCaptureSuccess(false);
    setIsQualityOk(false);
    setPendingImage(null);
    setValidationError(null);
    setValidationSuggestion(null);
    setStatusText('Coloca los dientes en el recuadro');
    setStage('instructions');
  };
  
  const retryCapture = () => {
    hasCapturedRef.current = false;
    stableStartRef.current = null;
    prevFrameRef.current = null;
    setStabilityProgress(0);
    setIsCapturing(false);
    setShowCaptureSuccess(false);
    setIsQualityOk(false);
    setPendingImage(null);
    setValidationError(null);
    setValidationSuggestion(null);
    setStatusText('Coloca los dientes en el recuadro');
    setStage('capturing');
  };

  // Start camera when entering capture stage
  useEffect(() => {
    if (stage !== 'capturing') return;

    let mounted = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        setStatusText('Iniciando cámara...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (!mounted) return;
            videoRef.current?.play();
            
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
            
            setStatusText('Coloca los dientes en el recuadro');
            setIsCameraReady(true);
          };
        }
      } catch (error) {
        console.error('Camera error:', error);
        if (mounted) {
          setCameraError('No se pudo acceder a la cámara. Revisa los permisos de tu navegador.');
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [stage]);

  // Frame analysis for auto-capture
  useEffect(() => {
    if (stage !== 'capturing' || !isCameraReady || isCapturing) return;

    const analyzeFrame = () => {
      if (!canvasRef.current || !videoRef.current || hasCapturedRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const step = Math.floor(currentFrame.data.length / 4 / SAMPLE_SIZE);
      
      // Calcular brillo, contraste y nitidez en una sola pasada (rápido)
      let totalBrightness = 0;
      let minBrightness = 255;
      let maxBrightness = 0;
      const grayscale: number[] = [];
      
      for (let i = 0; i < currentFrame.data.length; i += step * 4) {
        const r = currentFrame.data[i];
        const g = currentFrame.data[i + 1];
        const b = currentFrame.data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        minBrightness = Math.min(minBrightness, brightness);
        maxBrightness = Math.max(maxBrightness, brightness);
        grayscale.push(brightness);
      }
      
      const avgBrightness = totalBrightness / SAMPLE_SIZE;
      const contrast = maxBrightness - minBrightness;
      
      // Calcular nitidez usando varianza Laplaciana simplificada
      // Mide la diferencia entre píxeles adyacentes (más diferencia = más nítido)
      let sharpnessSum = 0;
      for (let i = 1; i < grayscale.length - 1; i++) {
        const laplacian = Math.abs(grayscale[i - 1] - 2 * grayscale[i] + grayscale[i + 1]);
        sharpnessSum += laplacian;
      }
      const sharpness = sharpnessSum / (grayscale.length - 2);
      
      const lightOk = avgBrightness >= BRIGHTNESS_MIN;
      const qualityOk = checkQualityFromFrameData(avgBrightness, contrast, sharpness);
      
      setIsLightAdequate(lightOk);
      setCurrentBrightness(Math.round(avgBrightness));
      setCurrentContrast(Math.round(contrast));
      setCurrentSharpness(Math.round(sharpness * 10) / 10);
      setIsQualityOk(qualityOk);

      let stability = 0;
      if (prevFrameRef.current) {
        let totalDiff = 0;
        const prevData = prevFrameRef.current.data;
        for (let i = 0; i < currentFrame.data.length; i += step * 4) {
          const rDiff = Math.abs(currentFrame.data[i] - prevData[i]);
          const gDiff = Math.abs(currentFrame.data[i + 1] - prevData[i + 1]);
          const bDiff = Math.abs(currentFrame.data[i + 2] - prevData[i + 2]);
          totalDiff += (rDiff + gDiff + bDiff) / 3;
        }
        const avgDiff = totalDiff / SAMPLE_SIZE;
        
        // Solo contar estabilidad si la calidad es aceptable
        if (avgDiff < STABILITY_THRESHOLD && qualityOk) {
          if (!stableStartRef.current) {
            stableStartRef.current = Date.now();
          }
          const elapsed = Date.now() - stableStartRef.current;
          stability = Math.min(100, (elapsed / STABILITY_TIME_MS) * 100);
          const secondsRemaining = Math.ceil((STABILITY_TIME_MS - elapsed) / 1000);
          
          if (stability < 33) {
            setStatusText(`✅ ¡Perfecto! Mantén así... ${secondsRemaining}s`);
          } else if (stability < 66) {
            setStatusText(`✅ ¡Muy bien! No te muevas... ${secondsRemaining}s`);
          } else if (stability < 100) {
            setStatusText(`✅ ¡Casi listo! ${secondsRemaining}s`);
          }
        } else {
          stableStartRef.current = null;
          stability = 0;
          if (!qualityOk) {
            if (avgBrightness < QUALITY_BRIGHTNESS_MIN) {
              setStatusText('💡 Busca más luz...');
            } else if (avgBrightness > QUALITY_BRIGHTNESS_MAX) {
              setStatusText('🔆 Demasiada luz...');
            } else {
              setStatusText('📷 Ajusta la posición...');
            }
          } else {
            setStatusText('📷 Mantén estable...');
          }
        }
      }
      
      setStabilityProgress(stability);
      prevFrameRef.current = currentFrame;

      // Capturar solo cuando estabilidad completa Y calidad OK
      if (stability >= 100 && qualityOk && !hasCapturedRef.current) {
        captureImage();
        return;
      }

      animationRef.current = requestAnimationFrame(analyzeFrame);
    };

    animationRef.current = requestAnimationFrame(analyzeFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stage, isCameraReady, isCapturing, currentView]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopAudio();
    };
  }, []);

  if (cameraError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-foreground">{cameraError}</p>
          <Button onClick={() => navigate('/subir-foto')} variant="outline">
            Volver a subir foto
          </Button>
        </div>
      </div>
    );
  }

  // INSTRUCTIONS STAGE
  if (stage === 'instructions') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Captura guiada</h1>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-3">
            {VIEW_ORDER.map((view, index) => {
              const isCaptured = capturedImages.some(img => img.view === view);
              const isCurrent = index === currentViewIndex;
              
              return (
                <div key={view} className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                    isCaptured ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {isCaptured ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    'text-sm font-medium hidden sm:inline',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {viewLabels[view]}
                  </span>
                  {index < VIEW_ORDER.length - 1 && (
                    <div className={cn(
                      'w-8 h-0.5 rounded',
                      isCaptured ? 'bg-green-500' : 'bg-muted'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          <div className="bg-card border rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Vista {viewLabels[currentView]}
            </h2>
            
            <div className="w-48 h-48 mx-auto rounded-xl overflow-hidden bg-muted">
              <img 
                src={viewImages[currentView]} 
                alt={`Posición para vista ${viewLabels[currentView]}`}
                className="w-full h-full object-cover"
              />
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              {viewInstructions[currentView]}
            </p>

            {currentView === 'superior' && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <p className="text-xs text-primary">
                  💡 Tip: Voltea el celular para que la cámara quede mirando de abajo hacia arriba
                </p>
              </div>
            )}

            {/* Voice guidance button */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={playVoiceGuidance}
              disabled={isLoadingAudio}
            >
              <Play className={cn('w-4 h-4', isPlayingAudio && 'text-primary')} />
              {isLoadingAudio ? 'Cargando...' : isPlayingAudio ? 'Reproduciendo...' : 'Escuchar instrucciones'}
            </Button>
          </div>
        </div>

        {/* Bottom action */}
        <div className="p-4 space-y-3 bg-card border-t">
          <Button className="w-full gap-2" size="lg" onClick={startCapture}>
            <Camera className="w-5 h-5" />
            Comenzar captura
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }
  // VALIDATION STAGE - mostrar imagen capturada y resultado de validación
  if (stage === 'validating') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Verificando vista {viewLabels[currentView]}
            </h1>
          </div>
        </div>
        
        {/* Imagen capturada */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
          {pendingImage && (
            <div className="relative w-full max-w-md aspect-[4/3] rounded-xl overflow-hidden border-4 border-muted">
              <img 
                src={pendingImage.dataUrl} 
                alt="Imagen capturada"
                className="w-full h-full object-cover"
              />
              {isValidating && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                    <p className="text-foreground font-medium">Analizando dientes visibles...</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Resultado de validación - error */}
          {!isValidating && validationError && (
            <div className="w-full max-w-md space-y-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">{validationError}</p>
                    {validationSuggestion && (
                      <p className="text-sm text-muted-foreground mt-1">{validationSuggestion}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={retryCapture}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Repetir foto
                </Button>
              </div>
            </div>
          )}
          
          {/* Resultado de validación - éxito */}
          {!isValidating && showCaptureSuccess && (
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-green-600 font-medium">{statusText}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CAPTURING STAGE
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Header with progress */}
      <div className="px-3 py-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        {/* Compact progress indicators */}
        <div className="flex items-center gap-2">
          {VIEW_ORDER.map((view, index) => {
            const isCaptured = capturedImages.some(img => img.view === view);
            const isCurrent = index === currentViewIndex;
            
            return (
              <div key={view} className="flex items-center gap-1">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  isCaptured ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {isCaptured ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                {index < VIEW_ORDER.length - 1 && (
                  <div className={cn('w-4 h-0.5', isCaptured ? 'bg-green-500' : 'bg-muted')} />
                )}
              </div>
            );
          })}
        </div>
        
        <span className="text-xs text-muted-foreground w-8 text-right">
          {currentViewIndex + 1}/{VIEW_ORDER.length}
        </span>
      </div>

      {/* Camera view - MAXIMIZED */}
      <div className="flex-1 relative mx-2 rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: isCameraReady ? 'block' : 'none' }}
        />
        
        {/* Success overlay */}
        {showCaptureSuccess && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-20">
            <div className="bg-green-500 text-white rounded-full p-4">
              <Check className="w-12 h-12" />
            </div>
          </div>
        )}
        
        {/* Minimal guide frame - centered, larger */}
        <div className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] aspect-[4/3] border-3 rounded-xl transition-all duration-300',
          showCaptureSuccess
            ? 'border-green-500'
            : isCapturing 
              ? 'border-green-500' 
              : stabilityProgress > 50 
                ? 'border-primary' 
                : 'border-white/70'
        )} />
        
        {/* Countdown timer - bottom center of camera, only when counting */}
        {stabilityProgress > 0 && stabilityProgress < 100 && !showCaptureSuccess && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <span className="text-4xl font-bold text-white drop-shadow-lg">
              {Math.ceil((STABILITY_TIME_MS - (stabilityProgress / 100 * STABILITY_TIME_MS)) / 1000)}s
            </span>
          </div>
        )}
      </div>

      {/* Bottom panel - compact info outside camera */}
      <div className="px-3 py-2 space-y-2 bg-card border-t">
        {/* View title and quality indicators row */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-sm">
            Vista {viewLabels[currentView]}
          </span>
          
          {/* Quality indicators - compact */}
          {isCameraReady && !showCaptureSuccess && (
            <div className="flex gap-1.5">
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                currentBrightness >= QUALITY_BRIGHTNESS_MIN && currentBrightness <= QUALITY_BRIGHTNESS_MAX
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-red-500/20 text-red-600'
              )}>
                <Sun className="w-3 h-3" />
              </div>
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                currentContrast >= QUALITY_CONTRAST_MIN
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-red-500/20 text-red-600'
              )}>
                <Contrast className="w-3 h-3" />
              </div>
              <div className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                currentSharpness >= QUALITY_SHARPNESS_MIN
                  ? 'bg-green-500/20 text-green-600'
                  : 'bg-red-500/20 text-red-600'
              )}>
                <Focus className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
        
        {/* Status text */}
        <p className="text-center text-sm text-muted-foreground">
          {statusText}
        </p>

        {/* Stability progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-200 rounded-full',
              stabilityProgress >= 100 || showCaptureSuccess ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${stabilityProgress}%` }}
          />
        </div>

        {/* Cancel button */}
        <Button variant="outline" size="sm" className="w-full" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default AutoCapture;
