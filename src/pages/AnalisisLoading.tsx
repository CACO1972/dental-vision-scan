import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImage } from '@/context/ImageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ScannerAnimation from '@/components/ScannerAnimation';

const AnalisisLoading = () => {
  const navigate = useNavigate();
  const { 
    selectedImageBase64, 
    selectedImageUrl, 
    capturedImages, 
    setAnalysisResult 
  } = useImage();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const hasMultipleImages = capturedImages.length > 0;

  useEffect(() => {
    // Validate we have image data before proceeding
    if (!hasMultipleImages && !selectedImageBase64) {
      toast.error('No se encontró imagen para analizar');
      navigate('/subir-foto');
      return;
    }

    const analyzeImages = async () => {
      try {
        if (hasMultipleImages) {
          // Multi-view analysis
          const allHallazgos: any[] = [];
          let combinedResult: any = null;

          for (const img of capturedImages) {
            if (!img.imageBase64) {
              console.warn('Skipping image without base64:', img.view);
              continue;
            }
            
            const { data, error } = await supabase.functions.invoke('analyze-dental', {
              body: { imageBase64: img.imageBase64 }
            });

            if (error) {
              console.error('Analysis error for view', img.view, error);
              continue;
            }

            if (data.hallazgos) {
              const hallazgosWithView = data.hallazgos.map((h: any) => ({
                ...h,
                vista: img.view
              }));
              allHallazgos.push(...hallazgosWithView);
            }

            if (!combinedResult) {
              combinedResult = { ...data };
            } else {
              // Merge results
              if (data.estadoGeneral === 'urgente' || 
                  (data.estadoGeneral === 'requiere_atencion' && combinedResult.estadoGeneral !== 'urgente')) {
                combinedResult.estadoGeneral = data.estadoGeneral;
              }
              if (data.proximosPasos) {
                combinedResult.proximosPasos = [
                  ...new Set([...combinedResult.proximosPasos, ...data.proximosPasos])
                ];
              }
              if (data.areasNoVisibles) {
                combinedResult.areasNoVisibles = [
                  ...new Set([...combinedResult.areasNoVisibles, ...data.areasNoVisibles])
                ];
              }
            }
          }

          if (combinedResult) {
            combinedResult.hallazgos = allHallazgos;
            combinedResult.mensajeGeneral = `Análisis completado de ${capturedImages.length} vistas dentales. ${combinedResult.mensajeGeneral || ''}`;
            setAnalysisResult(combinedResult);
            navigate('/analisis');
          } else {
            toast.error('No se pudo completar el análisis');
            navigate('/revisar-fotos');
          }
        } else {
          // Single image analysis - validate again
          if (!selectedImageBase64) {
            toast.error('No se encontró imagen para analizar');
            navigate('/subir-foto');
            return;
          }
          
          const { data, error } = await supabase.functions.invoke('analyze-dental', {
            body: { imageBase64: selectedImageBase64 }
          });

          if (error) {
            console.error('Analysis error:', error);
            toast.error('Error al analizar la imagen. Intenta de nuevo.');
            navigate('/subir-foto');
            return;
          }

          if (data.error) {
            toast.error(data.error);
            navigate('/subir-foto');
            return;
          }

          setAnalysisResult(data);
          navigate('/analisis');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error de conexión. Verifica tu internet e intenta de nuevo.');
        navigate('/subir-foto');
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeImages();
  }, [hasMultipleImages, selectedImageBase64, capturedImages, navigate, setAnalysisResult]);

  // Get display image
  const displayImage = hasMultipleImages 
    ? capturedImages[0]?.imageUrl 
    : selectedImageUrl;

  if (!displayImage) {
    navigate('/subir-foto');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
            Analizando
          </h1>
          <p className="text-muted-foreground">
            {hasMultipleImages 
              ? `Procesando ${capturedImages.length} imágenes dentales` 
              : 'Procesando tu imagen dental'}
          </p>
        </div>

        {/* Scanner Animation */}
        <ScannerAnimation 
          isScanning={isAnalyzing}
          imageUrl={displayImage}
          estimatedDuration={hasMultipleImages ? 25 : 12}
        />

        {/* Info text */}
        <p className="text-center text-sm text-muted-foreground">
          Nuestra IA está examinando cada detalle de tus dientes...
        </p>
      </div>
    </div>
  );
};

export default AnalisisLoading;
