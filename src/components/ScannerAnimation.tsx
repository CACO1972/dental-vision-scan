import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Scan, Shield, Brain, Sparkles } from 'lucide-react';

interface ScannerAnimationProps {
  isScanning: boolean;
  imageUrl: string;
  onComplete?: () => void;
  estimatedDuration?: number; // seconds
}

const scanStages = [
  { label: 'Analizando estructura dental', icon: Scan, progress: 25 },
  { label: 'Detectando posibles anomalías', icon: Brain, progress: 50 },
  { label: 'Evaluando estado gingival', icon: Shield, progress: 75 },
  { label: 'Generando informe', icon: Sparkles, progress: 100 },
];

const ScannerAnimation = ({ 
  isScanning, 
  imageUrl, 
  onComplete,
  estimatedDuration = 12 
}: ScannerAnimationProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [countdown, setCountdown] = useState(estimatedDuration);
  const [scanLinePosition, setScanLinePosition] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setProgress(0);
      setCurrentStage(0);
      setCountdown(estimatedDuration);
      setScanLinePosition(0);
      return;
    }

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const increment = Math.random() * 3 + 1;
        return Math.min(prev + increment, 98);
      });
    }, 200);

    // Stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev >= scanStages.length - 1) return prev;
        return prev + 1;
      });
    }, estimatedDuration * 250);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Scan line animation
    const scanLineInterval = setInterval(() => {
      setScanLinePosition(prev => (prev + 1) % 100);
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(countdownInterval);
      clearInterval(scanLineInterval);
    };
  }, [isScanning, estimatedDuration]);

  useEffect(() => {
    if (progress >= 98 && onComplete) {
      const timer = setTimeout(() => {
        setProgress(100);
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const CurrentIcon = scanStages[currentStage]?.icon || Scan;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Main scanner container */}
      <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
        {/* Image with scanner overlay */}
        <div className="relative aspect-square">
          <img 
            src={imageUrl} 
            alt="Imagen dental en análisis"
            className="w-full h-full object-cover"
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          
          {/* Scanning line */}
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
            style={{ 
              top: `${scanLinePosition}%`,
              boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)'
            }}
          />
          
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/70 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/70 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/70 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/70 rounded-br-lg" />
          
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" />
              <div 
                className="absolute inset-0 w-24 h-24 rounded-full border-2 border-primary/50 animate-ping"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </div>
          
          {/* Grid overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
        </div>
        
        {/* Scanner info panel */}
        <div className="p-6 space-y-4 bg-gradient-to-b from-card to-muted/30">
          {/* Countdown */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-primary/10 rounded-full px-6 py-3">
              <CurrentIcon className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-3xl font-bold font-display text-foreground tabular-nums">
                {countdown}s
              </span>
            </div>
          </div>
          
          {/* Current stage */}
          <p className="text-center text-sm font-medium text-foreground animate-pulse">
            {scanStages[currentStage]?.label || 'Procesando...'}
          </p>
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 10px hsl(var(--primary) / 0.5)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analizando...</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
          
          {/* Stage indicators */}
          <div className="flex justify-center gap-2">
            {scanStages.map((stage, index) => (
              <div 
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index <= currentStage 
                    ? 'bg-primary scale-110' 
                    : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute -inset-4 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ScannerAnimation;
