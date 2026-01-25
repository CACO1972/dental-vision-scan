import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Crown, Check, Loader2, Smile, FileText, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentUpgradeProps {
  email?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const PaymentUpgrade = ({ email: initialEmail, onSuccess, onClose }: PaymentUpgradeProps) => {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
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
      const returnUrl = `${window.location.origin}/analisis?payment=success`;
      const confirmUrl = `${window.location.origin}/api/flow-confirm`;

      const { data, error } = await supabase.functions.invoke('flow-payment', {
        body: {
          action: 'create_payment',
          email,
          amount: 4990,
          commerceOrder: orderId,
          subject: 'Análisis Dental Completo + Simulación de Sonrisa',
          urlReturn: returnUrl,
          urlConfirmation: `https://tqidweeyjqimxljutgut.supabase.co/functions/v1/flow-payment-confirm`,
        },
      });

      if (error) throw error;

      if (data?.success && data?.paymentUrl) {
        // Store order info for later verification
        localStorage.setItem('pendingPayment', JSON.stringify({
          orderId,
          email,
          timestamp: Date.now(),
        }));
        // Redirect to Flow payment page
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

  const features = [
    { icon: FileText, text: 'Informe clínico completo y detallado' },
    { icon: Smile, text: 'Simulación de sonrisa con IA' },
    { icon: Crown, text: 'Recomendaciones personalizadas' },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Desbloquea el Análisis Completo
        </h2>
        <p className="text-sm text-muted-foreground">
          Obtén un informe profesional detallado y una simulación de tu sonrisa ideal
        </p>
      </div>

      {/* Price */}
      <div className="text-center py-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-foreground">$4.990</span>
          <span className="text-muted-foreground">CLP</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Pago único por análisis</p>
      </div>

      {/* Features */}
      <div className="space-y-3">
        {features.map(({ icon: Icon, text }, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-foreground">{text}</span>
          </div>
        ))}
      </div>

      {/* Email input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Tu email para recibir el informe
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            Pagar con Flow
          </>
        )}
      </Button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" /> Pago seguro
        </span>
        <span>•</span>
        <span>Procesado por Flow.cl</span>
      </div>

      {/* Cancel option */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Continuar con el mini-informe gratuito
        </button>
      )}
    </div>
  );
};

export default PaymentUpgrade;
