import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage, Hallazgo } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertTriangle, Stethoscope, Sparkles, ShieldCheck } from 'lucide-react';

const explicacionesPorTipo: Record<string, {
  queEs: string;
  porQueImporta: string;
  tratamientos: string[];
}> = {
  caries: {
    queEs: 'La caries dental es una enfermedad causada por bacterias que producen ácidos al alimentarse de azúcares. Estos ácidos destruyen gradualmente el esmalte dental, formando cavidades.',
    porQueImporta: 'Si no se trata a tiempo, la caries puede profundizarse hasta llegar al nervio del diente, causando dolor intenso, infecciones e incluso la pérdida del diente.',
    tratamientos: [
      'Empaste (obturación) para caries superficiales',
      'Incrustación para caries más extensas',
      'Corona dental si hay daño significativo',
      'Tratamiento de conducto si afecta el nervio',
    ],
  },
  calculo: {
    queEs: 'El cálculo dental (sarro) es placa bacteriana mineralizada que se adhiere fuertemente a los dientes. Tiene un color amarillento o marrón y no puede removerse con el cepillado.',
    porQueImporta: 'El sarro acumulado irrita las encías, causando inflamación (gingivitis) y sangrado. Si avanza, puede provocar enfermedad periodontal y pérdida de hueso dental.',
    tratamientos: [
      'Limpieza dental profesional (profilaxis)',
      'Raspado y alisado radicular en casos avanzados',
      'Visitas regulares al dentista cada 6 meses',
      'Mejora en técnica de cepillado e hilo dental',
    ],
  },
  desgaste: {
    queEs: 'El desgaste dental es la pérdida progresiva de estructura del diente por fricción, ácidos o hábitos. Puede manifestarse como dientes aplanados, bordes transparentes o sensibilidad.',
    porQueImporta: 'El desgaste excesivo puede causar sensibilidad dental, problemas de mordida, fracturas y cambios estéticos. Identificar la causa es esencial para evitar que progrese.',
    tratamientos: [
      'Férula de descarga nocturna (si hay bruxismo)',
      'Restauraciones protectoras',
      'Ajuste de la mordida (equilibrio oclusal)',
      'Cambios en dieta y hábitos',
    ],
  },
  gingivitis: {
    queEs: 'La gingivitis es la inflamación de las encías causada principalmente por acumulación de placa bacteriana. Se caracteriza por encías rojas, hinchadas y que sangran fácilmente.',
    porQueImporta: 'La gingivitis es reversible, pero si no se trata puede evolucionar a periodontitis, una enfermedad más grave que causa pérdida de hueso y eventualmente de dientes.',
    tratamientos: [
      'Limpieza dental profesional',
      'Mejora en higiene bucal diaria',
      'Uso de enjuague bucal antiséptico',
      'Control regular con el dentista',
    ],
  },
  otro: {
    queEs: 'Se ha observado una condición que requiere evaluación profesional para determinar su naturaleza exacta.',
    porQueImporta: 'Es importante que un profesional examine esta área para determinar si requiere tratamiento o simplemente seguimiento.',
    tratamientos: [
      'Consulta con un odontólogo',
      'Evaluación clínica detallada',
      'Posibles estudios adicionales (radiografías)',
    ],
  },
};

const Explicacion = () => {
  const navigate = useNavigate();
  const { analysisResult, clearImage } = useImage();

  if (!analysisResult) {
    navigate('/subir-foto');
    return null;
  }

  const tiposUnicos = [...new Set(analysisResult.hallazgos.map((h: Hallazgo) => h.tipo))];

  const handleStartOver = () => {
    clearImage();
    navigate('/subir-foto');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-6 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => navigate('/analisis')}
            className="w-10 h-10 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Scan className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Información educativa</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Qué significan estos hallazgos
            </h1>
            <p className="text-muted-foreground">
              Información educativa basada en tu análisis
            </p>
          </div>

          {/* Explanations for each detected issue type */}
          {tiposUnicos.map((tipo, index) => {
            const explicacion = explicacionesPorTipo[tipo] || explicacionesPorTipo.otro;
            const hallazgosDelTipo = analysisResult.hallazgos.filter((h: Hallazgo) => h.tipo === tipo);
            
            return (
              <div 
                key={index}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
                  <h2 className="text-xl font-bold text-foreground capitalize">
                    {tipo === 'calculo' ? 'Cálculo dental (sarro)' : tipo}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detectado en {hallazgosDelTipo.length} {hallazgosDelTipo.length === 1 ? 'zona' : 'zonas'}
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* What is it */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      ¿Qué es?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {explicacion.queEs}
                    </p>
                  </div>

                  {/* Why it matters */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      ¿Por qué es importante tratarlo?
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {explicacion.porQueImporta}
                    </p>
                  </div>

                  {/* Treatments */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-success" />
                      Opciones de tratamiento comunes
                    </h3>
                    <ul className="space-y-2">
                      {explicacion.tratamientos.map((tratamiento, i) => (
                        <li 
                          key={i}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-1" />
                          <span>{tratamiento}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Final disclaimer */}
          <div className="bg-accent rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Aviso importante
            </h3>
            <p className="text-accent-foreground leading-relaxed">
              Esta revisión fue realizada por inteligencia artificial con fines <strong>orientativos y educativos</strong>. 
              Los hallazgos mostrados son observaciones basadas en la imagen y <strong>NO constituyen un diagnóstico médico</strong>.
            </p>
            <p className="text-accent-foreground leading-relaxed">
              Para obtener un diagnóstico preciso y un plan de tratamiento adecuado, 
              es <strong>indispensable</strong> consultar con un odontólogo profesional que pueda 
              realizar una evaluación clínica completa con radiografías y otros estudios si es necesario.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/analisis')}
            >
              Volver a la foto
            </Button>
            <Button 
              variant="hero" 
              size="lg"
              onClick={handleStartOver}
            >
              Empezar de nuevo
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Explicacion;
