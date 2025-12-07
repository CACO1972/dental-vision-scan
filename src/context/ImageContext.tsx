import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ImageContextType {
  selectedImageUrl: string | null;
  setSelectedImageUrl: (url: string | null) => void;
  clearImage: () => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const clearImage = () => {
    if (selectedImageUrl) {
      URL.revokeObjectURL(selectedImageUrl);
    }
    setSelectedImageUrl(null);
  };

  return (
    <ImageContext.Provider value={{ selectedImageUrl, setSelectedImageUrl, clearImage }}>
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
