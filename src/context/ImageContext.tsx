import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewType = 'frontal' | 'superior' | 'inferior';

export interface CapturedImage {
  view: ViewType;
  imageUrl: string;
  imageBase64: string;
}

export interface Hallazgo {
  tipo: string;
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
  estadoGeneral: string;
  recomendacion: string;
  proximosPasos: string[];
  calidadImagen: string;
  notaCalidadImagen: string;
  areasNoVisibles: string[];
  disclaimer?: string;
}

interface ImageContextType {
  selectedImageUrl: string | null;
  setSelectedImageUrl: (url: string | null) => void;
  selectedImageBase64: string | null;
  setSelectedImageBase64: (base64: string | null) => void;
  capturedImages: CapturedImage[];
  addCapturedImage: (image: CapturedImage) => void;
  clearCapturedImages: () => void;
  getCapturedImage: (view: ViewType) => CapturedImage | undefined;
  analysisResult: AnalisisResultado | null;
  setAnalysisResult: (result: AnalisisResultado | null) => void;
  // New multi-result support
  analysisResults: any[] | null;
  setAnalysisResults: (results: any[] | null) => void;
  // Images dict for new flow
  images: Record<string, any>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  clearImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalisisResultado | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any[] | null>(null);
  const [images, setImages] = useState<Record<string, any>>({});

  const addCapturedImage = (image: CapturedImage) => {
    setCapturedImages(prev => {
      const filtered = prev.filter(img => img.view !== image.view);
      return [...filtered, image];
    });
    // Also add to images dict
    setImages(prev => ({ ...prev, [image.view]: { imageBase64: image.imageBase64, view: image.view } }));
  };

  const clearCapturedImages = () => {
    capturedImages.forEach(img => {
      if (img.imageUrl?.startsWith('blob:')) URL.revokeObjectURL(img.imageUrl);
    });
    setCapturedImages([]);
    setImages({});
  };

  const getCapturedImage = (view: ViewType) => capturedImages.find(img => img.view === view);

  // When analysisResults (array) is set, also set analysisResult (merged) for backwards compat
  const setAnalysisResultsWrapper = (results: any[] | null) => {
    setAnalysisResults(results);
    if (results && results.length > 0) {
      // Merge all results into one
      const merged: any = {
        analisisValido: true,
        mensajeGeneral: results[0]?.mensajeGeneral || '',
        hallazgos: results.flatMap((r: any) => (r.hallazgos || []).map((h: any) => ({ ...h, vista: r.view }))),
        estadoGeneral: results[0]?.estadoGeneral || 'aceptable_con_observaciones',
        recomendacion: results[0]?.recomendacion || '',
        proximosPasos: results[0]?.proximosPasos || [],
        calidadImagen: results[0]?.calidadImagen || 'aceptable',
        notaCalidadImagen: results[0]?.notaCalidadImagen || '',
        areasNoVisibles: results[0]?.areasNoVisibles || [],
        disclaimer: results[0]?.disclaimer || '',
      };
      setAnalysisResult(merged);
    }
  };

  const clearImage = () => {
    if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
    setSelectedImageUrl(null);
    setSelectedImageBase64(null);
    clearCapturedImages();
    setAnalysisResult(null);
    setAnalysisResults(null);
    setImages({});
  };

  return (
    <ImageContext.Provider value={{
      selectedImageUrl, setSelectedImageUrl,
      selectedImageBase64, setSelectedImageBase64,
      capturedImages, addCapturedImage, clearCapturedImages, getCapturedImage,
      analysisResult, setAnalysisResult,
      analysisResults, setAnalysisResults: setAnalysisResultsWrapper,
      images, setImages,
      clearImage,
    }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImage = () => {
  const context = useContext(ImageContext);
  if (!context) throw new Error('useImage must be used within an ImageProvider');
  return context;
};

// Alias for new pages
export const useImages = useImage;
