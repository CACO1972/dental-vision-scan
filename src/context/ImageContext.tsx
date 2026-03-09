import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 'frontal' | 'superior' | 'inferior';

export interface CapturedImage {
  view: ViewType;
  imageUrl: string;
  imageBase64: string;
}

export interface Hallazgo {
  tipo: 'caries' | 'calculo' | 'desgaste' | 'gingivitis' | 'placa' | 'restauracion' | 'fractura' | 'manchas' | 'recesion' | 'otro';
  confianza: 'alta' | 'media' | 'baja';
  severidad: 'leve' | 'moderado' | 'severo';
  descripcion: string;
  ubicacion: string;
  recomendacionEspecifica?: string;
  vista?: ViewType;
  coordenadas: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AnalisisResultado {
  analisisValido: boolean;
  mensajeGeneral: string;
  hallazgos: Hallazgo[];
  estadoGeneral: 'bueno' | 'aceptable' | 'requiere_atencion' | 'urgente';
  recomendacion: string;
  proximosPasos: string[];
  calidadImagen: 'buena' | 'aceptable' | 'mala';
  notaCalidadImagen: string;
  areasNoVisibles: string[];
}

interface ImageContextType {
  // Legacy single image support
  selectedImageUrl: string | null;
  setSelectedImageUrl: (url: string | null) => void;
  selectedImageBase64: string | null;
  setSelectedImageBase64: (base64: string | null) => void;
  
  // Multi-image capture support
  capturedImages: CapturedImage[];
  addCapturedImage: (image: CapturedImage) => void;
  clearCapturedImages: () => void;
  getCapturedImage: (view: ViewType) => CapturedImage | undefined;
  
  // Analysis result
  analysisResult: AnalisisResultado | null;
  setAnalysisResult: (result: AnalisisResultado | null) => void;
  
  // Clear all
  clearImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalisisResultado | null>(null);

  const addCapturedImage = (image: CapturedImage) => {
    setCapturedImages(prev => {
      // Replace if same view exists
      const filtered = prev.filter(img => img.view !== image.view);
      return [...filtered, image];
    });
  };

  const clearCapturedImages = () => {
    capturedImages.forEach(img => {
      if (img.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.imageUrl);
      }
    });
    setCapturedImages([]);
  };

  const getCapturedImage = (view: ViewType) => {
    return capturedImages.find(img => img.view === view);
  };

  const clearImage = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
    setSelectedImageBase64(null);
    clearCapturedImages();
    setAnalysisResult(null);
  };

  return (
    <ImageContext.Provider value={{ 
      selectedImageUrl, 
      setSelectedImageUrl, 
      selectedImageBase64,
      setSelectedImageBase64,
      capturedImages,
      addCapturedImage,
      clearCapturedImages,
      getCapturedImage,
      analysisResult,
      setAnalysisResult,
      clearImage 
    }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImage must be used within an ImageProvider');
  }
  return context;
};
