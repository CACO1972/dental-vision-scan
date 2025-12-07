import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '@/context/ImageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Sun, SunDim } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'frontal' | 'superior' | 'inferior';

const viewInstructions: Record<ViewType, string> = {
  frontal: 'Sonríe y separa ligeramente los labios. Coloca los dientes dentro del recuadro frontal.',
  superior: 'Gira el teléfono, mantén la cámara abajo, abre bien la boca mirando al techo y coloca los dientes superiores dentro del recuadro.',
  inferior: 'Mira hacia el piso, abre bien la boca y baja la lengua. Coloca los dientes inferiores dentro del recuadro.',
};

const STABILITY_THRESHOLD = 15;
const STABILITY_TIME_MS = 1500;
const BRIGHTNESS_MIN = 60;
const SAMPLE_SIZE = 50;

// Play shutter sound using Web Audio API
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

const AutoCapture = () => {
  const navigate = useNavigate();
  const { setSelectedImageUrl, setSelectedImageBase64 } = useImage();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const stableStartRef = useRef<number | null>(null);
  const hasCapturedRef = useRef(false);

  const [selectedView, setSelectedView] = useState<ViewType>('frontal');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stabilityProgress, setStabilityProgress] = useState(0);
  const [isLightAdequate, setIsLightAdequate] = useState(false);
  const [statusText, setStatusText] = useState('Iniciando cámara...');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleCancel = () => {
    stopCamera();
    navigate('/subir-foto');
  };

  const getGuidePosition = () => {
    switch (selectedView) {
      case 'superior':
        return 'top-[15%]';
      case 'inferior':
        return 'top-[45%]';
      default:
        return 'top-[30%]';
    }
  };

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        setStatusText('Iniciando cámara...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
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
          setCameraError('No se pudo acceder a la cámara. Revisa los permisos de tu navegador o carga una foto desde la galería.');
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  // Analysis loop
  useEffect(() => {
    if (!isCameraReady || isCapturing) return;

    const analyzeFrame = () => {
      if (!canvasRef.current || !videoRef.current || hasCapturedRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx || video.readyState < 2) {
        animationRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Sample pixels for analysis
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Calculate brightness
      let totalBrightness = 0;
      const step = Math.floor(currentFrame.data.length / 4 / SAMPLE_SIZE);
      for (let i = 0; i < currentFrame.data.length; i += step * 4) {
        const r = currentFrame.data[i];
        const g = currentFrame.data[i + 1];
        const b = currentFrame.data[i + 2];
        totalBrightness += (r + g + b) / 3;
      }
      const avgBrightness = totalBrightness / SAMPLE_SIZE;
      const lightOk = avgBrightness >= BRIGHTNESS_MIN;
      setIsLightAdequate(lightOk);

      // Calculate stability (frame difference)
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
        
        if (avgDiff < STABILITY_THRESHOLD) {
          if (!stableStartRef.current) {
            stableStartRef.current = Date.now();
          }
          const elapsed = Date.now() - stableStartRef.current;
          stability = Math.min(100, (elapsed / STABILITY_TIME_MS) * 100);
          
          if (stability < 50) {
            setStatusText('Mantén la posición...');
          } else if (stability < 100) {
            setStatusText('Casi listo...');
          }
        } else {
          stableStartRef.current = null;
          stability = 0;
          setStatusText('Moviendo...');
        }
      }
      
      setStabilityProgress(stability);
      prevFrameRef.current = currentFrame;

      // Check capture conditions
      if (stability >= 100 && lightOk && !hasCapturedRef.current) {
        hasCapturedRef.current = true;
        setIsCapturing(true);
        setStatusText('Listo, capturando...');
        
        // Play shutter sound
        playShutterSound();

        // Get image data
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64 = dataUrl.split(',')[1];
        
        // Store in context
        setSelectedImageUrl(dataUrl);
        setSelectedImageBase64(base64);
        
        // Stop camera and navigate
        stopCamera();
        
        setTimeout(() => {
          navigate('/analisis');
        }, 500);
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
  }, [isCameraReady, isCapturing, navigate, setSelectedImageUrl, setSelectedImageBase64]);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Toma automática de foto</h1>
        </div>
        <p className="text-sm text-muted-foreground px-2">
          La app tomará la foto sola cuando la imagen esté clara y estable.
        </p>
      </div>

      {/* View selector */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 bg-muted/50 rounded-lg p-1">
          {(['frontal', 'superior', 'inferior'] as ViewType[]).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors',
                selectedView === view
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {view === 'frontal' ? 'Frontal' : view === 'superior' ? 'Superior' : 'Inferior'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          {viewInstructions[selectedView]}
        </p>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative mx-4 mb-4 rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Guide overlay */}
        <div className={cn(
          'absolute left-1/2 -translate-x-1/2 w-[80%] aspect-[4/3] border-2 rounded-xl transition-all duration-300',
          getGuidePosition(),
          isCapturing 
            ? 'border-green-500 bg-green-500/10' 
            : stabilityProgress > 50 
              ? 'border-primary bg-primary/5' 
              : 'border-white/50 bg-white/5'
        )}>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className={cn(
              'text-sm font-medium px-3 py-1 rounded-full',
              isCapturing 
                ? 'bg-green-500 text-white'
                : stabilityProgress > 50 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-black/50 text-white'
            )}>
              {statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom indicators */}
      <div className="p-4 space-y-4 bg-card border-t">
        {/* Light indicator */}
        <div className="flex items-center justify-center gap-2">
          {isLightAdequate ? (
            <>
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-foreground">Luz adecuada</span>
            </>
          ) : (
            <>
              <SunDim className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Luz insuficiente</span>
            </>
          )}
        </div>

        {/* Stability progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Estabilidad</span>
            <span>{Math.round(stabilityProgress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-200 rounded-full',
                stabilityProgress >= 100 ? 'bg-green-500' : 'bg-primary'
              )}
              style={{ width: `${stabilityProgress}%` }}
            />
          </div>
        </div>

        {/* Cancel button */}
        <Button variant="outline" className="w-full" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default AutoCapture;
