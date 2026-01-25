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
    <div className="relative w-full max-w-sm md:max-w-md mx-auto px-4 md:px-0">
      {/* Main scanner container */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-card border border-border shadow-2xl">
        {/* Image with scanner overlay */}
        <div className="relative aspect-square">
          <img 
            src={imageUrl} 
            alt="Imagen dental en análisis"
            className="w-full h-full object-cover"
          />
          
          {/* Dark overlay with ocean gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-accent/30" />
          
          {/* Scanning line - teal glow */}
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-90"
            style={{ 
              top: `${scanLinePosition}%`,
              boxShadow: '0 0 20px hsl(193 72% 59%), 0 0 40px hsl(193 72% 59% / 0.5)'
            }}
          />
          
          {/* Corner brackets - teal accent */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 w-10 h-10 md:w-12 md:h-12 border-l-2 border-t-2 border-accent/80 rounded-tl-lg" />
          <div className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 border-r-2 border-t-2 border-accent/80 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-10 h-10 md:w-12 md:h-12 border-l-2 border-b-2 border-accent/80 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-10 h-10 md:w-12 md:h-12 border-r-2 border-b-2 border-accent/80 rounded-br-lg" />
          
          {/* Pulse rings - ocean color */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent/40 animate-ping" />
              <div 
                className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary/50 animate-ping"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </div>
          
          {/* Grid overlay - subtle teal */}
          <div 
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(hsl(193 72% 59%) 1px, transparent 1px), linear-gradient(90deg, hsl(193 72% 59%) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />
        </div>
        
        {/* Scanner info panel */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4 bg-gradient-to-b from-card to-muted/30">
          {/* Countdown */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 md:gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-5 md:px-6 py-2.5 md:py-3 border border-primary/20">
              <CurrentIcon className="w-4 h-4 md:w-5 md:h-5 text-primary animate-pulse" />
              <span className="text-2xl md:text-3xl font-bold font-display text-foreground tabular-nums">
                {countdown}s
              </span>
            </div>
          </div>
          
          {/* Current stage */}
          <p className="text-center text-xs md:text-sm font-medium text-foreground animate-pulse">
            {scanStages[currentStage]?.label || 'Procesando...'}
          </p>
          
          {/* Progress bar - gradient */}
          <div className="space-y-2">
            <div className="h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-accent to-primary/80 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 10px hsl(193 72% 59% / 0.6)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analizando...</span>
              <span className="font-medium text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          
          {/* Stage indicators */}
          <div className="flex justify-center gap-1.5 md:gap-2">
            {scanStages.map((stage, index) => (
              <div 
                key={index}
                className={cn(
                  'w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300',
                  index <= currentStage 
                    ? 'bg-gradient-to-r from-primary to-accent scale-110' 
                    : 'bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating particles effect - teal colors */}
      <div className="absolute -inset-4 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/70 rounded-full animate-float"
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
