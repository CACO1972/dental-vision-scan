import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useImage } from '@/context/ImageContext';
import { Scan, ArrowLeft, AlertTriangle, CircleDot, Sparkles, Shield } from 'lucide-react';

interface ExplicacionItem {
  titulo: string;
  color: string;
  colorBg: string;
  icon: React.ReactNode;
  queEs: string;
  importancia: string;
  tratamientos: string[];
}

const explicaciones: ExplicacionItem[] = [
  {
    titulo: "Posible caries",
    color: "text-destructive",
    colorBg: "bg-destructive/10",
    icon: <CircleDot className="w-5 h-5" />,
    queEs: "La caries es una lesión en el esmalte dental causada por bacterias que producen ácidos al consumir azúcares. Puede manifestarse como manchas oscuras o cavidades en los dientes.",
    importancia: "Si no se trata a tiempo, la caries puede profundizarse, afectando la dentina y eventualmente el nervio del diente, causando dolor intenso e infecciones.",
    tratamientos: [
      "Limpieza y aplicación de flúor (caries incipiente)",
      "Restauración con resina o amalgama",
      "Tratamiento de conducto (si afecta el nervio)",
      "Corona dental (daño extenso)"
    ]
  },
  {
    titulo: "Posible cálculo dental",
    color: "text-success",
    colorBg: "bg-success/10",
    icon: <Sparkles className="w-5 h-5" />,
    queEs: "El cálculo dental (sarro) es placa bacteriana endurecida que se acumula en los dientes, especialmente cerca de las encías. Tiene una textura áspera y puede ser de color amarillento o marrón.",
    importancia: "La acumulación de sarro irrita las encías, causando inflamación (gingivitis) y sangrado. Si avanza, puede derivar en periodontitis y pérdida de soporte óseo dental.",
    tratamientos: [
      "Limpieza dental profesional (profilaxis)",
      "Raspado y alisado radicular",
      "Mejora de técnica de cepillado",
      "Uso de hilo dental diario"
    ]
  },
  {
    titulo: "Desgaste dental",
    color: "text-warning",
    colorBg: "bg-warning/10",
    icon: <Shield className="w-5 h-5" />,
    queEs: "El desgaste dental es la pérdida progresiva de estructura dental. Puede deberse a bruxismo (apretar o rechinar los dientes), erosión ácida, o hábitos como morder objetos duros.",
    importancia: "El desgaste expone capas más sensibles del diente, aumentando la sensibilidad al frío y calor. En casos severos, puede afectar la mordida y la estética dental.",
    tratamientos: [
      "Férula de descarga nocturna (bruxismo)",
      "Restauraciones estéticas",
      "Carillas o coronas (casos severos)",
      "Evaluación de hábitos alimenticios"
    ]
  }
];

const Explicacion = () => {
  const navigate = useNavigate();
  const { clearImage } = useImage();

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
          <span className="font-semibold text-lg text-foreground">Explicación</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Qué significan estas marcas
            </h1>
            <p className="text-muted-foreground">
              Información educativa sobre los hallazgos detectados
            </p>
          </div>

          {/* Explanations */}
          <div className="space-y-6">
            {explicaciones.map((item, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Header */}
                <div className={`${item.colorBg} px-6 py-4 flex items-center gap-3`}>
                  <div className={item.color}>
                    {item.icon}
                  </div>
                  <h2 className={`font-bold text-lg ${item.color}`}>
                    {item.titulo}
                  </h2>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Qué es */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">¿Qué es?</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.queEs}
                    </p>
                  </div>

                  {/* Importancia */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">¿Por qué es importante tratarlo?</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.importancia}
                    </p>
                  </div>

                  {/* Tratamientos */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Opciones de tratamiento</h3>
                    <ul className="space-y-2">
                      {item.tratamientos.map((trat, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} mt-2 shrink-0`} />
                          {trat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="bg-warning/10 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-warning-foreground">Aviso importante</h3>
              <p className="text-sm text-warning-foreground/90">
                Esta revisión es <strong>orientativa</strong> y <strong>no reemplaza</strong> una evaluación presencial con un dentista profesional. Los hallazgos mostrados son simulados con fines demostrativos. Para un diagnóstico preciso, consulta siempre a un profesional de la salud dental.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
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

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border bg-card mt-8">
        <p className="text-center text-sm text-muted-foreground">
          Miro Dental Scan • Versión Beta • Solo con fines educativos
        </p>
      </footer>
    </div>
  );
};

export default Explicacion;
