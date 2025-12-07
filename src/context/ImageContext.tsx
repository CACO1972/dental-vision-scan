import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Hallazgo {
  tipo: 'caries' | 'calculo' | 'desgaste' | 'gingivitis' | 'otro';
  confianza: 'alta' | 'media' | 'baja';
  descripcion: string;
  ubicacion: string;
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
  recomendacion: string;
  calidadImagen: 'buena' | 'aceptable' | 'mala';
  notaCalidadImagen: string;
}

interface ImageContextType {
  selectedImageUrl: string | null;
  setSelectedImageUrl: (url: string | null) => void;
  selectedImageBase64: string | null;
  setSelectedImageBase64: (base64: string | null) => void;
  analysisResult: AnalisisResultado | null;
  setAnalysisResult: (result: AnalisisResultado | null) => void;
  clearImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalisisResultado | null>(null);

  const clearImage = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
    setSelectedImageBase64(null);
    setAnalysisResult(null);
  };

  return (
    <ImageContext.Provider value={{ 
      selectedImageUrl, 
      setSelectedImageUrl, 
      selectedImageBase64,
      setSelectedImageBase64,
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
