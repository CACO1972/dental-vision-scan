import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0A0A0A] noise-overlay flex flex-col items-center justify-center px-5">
      <div className="relative z-10 text-center space-y-4">
        <span className="font-display text-8xl text-[#C9A86C]">404</span>
        <p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.3em]">Página no encontrada</p>
        <button className="btn-brutal" onClick={() => navigate('/')}>Volver al Inicio</button>
      </div>
    </div>
  );
};

export default NotFound;
