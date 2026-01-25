import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ImageProvider } from "@/context/ImageContext";
import Welcome from "./pages/Welcome";
import SubirFoto from "./pages/SubirFoto";
import IntroCaptura from "./pages/IntroCaptura";
import AutoCapture from "./pages/AutoCapture";
import RevisarFotos from "./pages/RevisarFotos";
import AnalisisLoading from "./pages/AnalisisLoading";
import Analisis from "./pages/Analisis";
import Explicacion from "./pages/Explicacion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ImageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/subir-foto" element={<SubirFoto />} />
            <Route path="/intro-captura" element={<IntroCaptura />} />
            <Route path="/auto-capture" element={<AutoCapture />} />
            <Route path="/revisar-fotos" element={<RevisarFotos />} />
            <Route path="/analizando" element={<AnalisisLoading />} />
            <Route path="/analisis" element={<Analisis />} />
            <Route path="/explicacion" element={<Explicacion />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ImageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
