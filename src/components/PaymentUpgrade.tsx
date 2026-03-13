import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Crown, Check, Loader2, Smile, FileText, Lock, Video, Star, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentUpgradeProps {
  email?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PaymentUpgrade = ({ email: initialEmail, onSuccess, onClose }: PaymentUpgradeProps) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Email requerido',
        description: 'Por favor ingresa un email válido para continuar.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const orderId = `dental_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const amount = selectedPlan === 'premium' ? 14990 : 6990;
      const subject = selectedPlan === 'premium' 
        ? 'Análisis Dental + Telemedicina con Especialista' 
        : 'Análisis Dental Completo + Simulación de Sonrisa';
      const returnUrl = `${window.location.origin}/analisis?payment=success&plan=${selectedPlan}&order=${encodeURIComponent(orderId)}`;

      const { data, error } = await supabase.functions.invoke('flow-payment', {
        body: {
          action: 'create_payment',
          email,
          amount,
          commerceOrder: orderId,
          subject,
          urlReturn: returnUrl,
          urlConfirmation: `https://jipldlklzobiytkvxokf.supabase.co/functions/v1/flow-payment-confirm`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.paymentUrl) {
        localStorage.setItem('pendingPayment', JSON.stringify({
          orderId,
          email,
          plan: selectedPlan,
          timestamp: Date.now(),
        }));
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data?.error || 'Error al crear el pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error en el pago',
        description: 'No se pudo procesar el pago. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Desbloquea el Análisis Completo
        </h2>
      </div>

      {/* Social proof mini */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-3 h-3 fill-warning text-warning" />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">+2.847 análisis esta semana</span>
      </div>

      {/* Plan Selection */}
      <div className="space-y-3">
        {/* Basic Plan */}
        <button
          onClick={() => setSelectedPlan('basic')}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
            selectedPlan === 'basic' 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm">Análisis Completo</p>
              <p className="text-xs text-muted-foreground mt-0.5">Informe + Simulación de sonrisa</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">$6.990</p>
              <p className="text-xs text-muted-foreground line-through">$25.000</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown className="w-3 h-3 text-success" />
            <span className="text-xs text-success font-medium">Ahorras $20.010</span>
          </div>
        </button>

        {/* Premium Plan with Telemedicine */}
        <button
          onClick={() => setSelectedPlan('premium')}
          className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
            selectedPlan === 'premium' 
              ? 'border-accent bg-accent/5' 
              : 'border-border hover:border-accent/50'
          }`}
        >
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-bl-lg font-medium">
            Popular
          </div>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Video className="w-4 h-4 text-accent" />
                Análisis + Telemedicina
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Todo + Videollamada con dentista</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">$14.990</p>
              <p className="text-xs text-muted-foreground line-through">$65.000</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <TrendingDown className="w-3 h-3 text-success" />
            <span className="text-xs text-success font-medium">Ahorras $54.010</span>
          </div>
        </button>
      </div>

      {/* Features */}
      <div className="space-y-2">
        {[
          { icon: FileText, text: 'Informe clínico detallado', included: true },
          { icon: Smile, text: 'Simulación de sonrisa con IA', included: true },
          { icon: Crown, text: 'Recomendaciones personalizadas', included: true },
          { icon: Video, text: 'Videollamada con especialista', included: selectedPlan === 'premium' },
        ].map(({ icon: Icon, text, included }, index) => (
          <div key={index} className={`flex items-center gap-2 ${!included ? 'opacity-40' : ''}`}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
              included ? 'bg-success/10' : 'bg-muted'
            }`}>
              <Check className={`w-3 h-3 ${included ? 'text-success' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-xs text-foreground">{text}</span>
          </div>
        ))}
      </div>

      {/* Email input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          Tu email para recibir el informe
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
      </div>

      {/* Payment button */}
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pagar ${selectedPlan === 'premium' ? '14.990' : '6.990'}
          </>
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" /> Pago seguro
        </span>
        <span>•</span>
        <span>Flow.cl</span>
      </div>

      {/* Cancel option */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Continuar con el mini-informe gratuito
        </button>
      )}
    </div>
  );
};

export default PaymentUpgrade;
