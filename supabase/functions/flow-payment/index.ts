import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLOW_API_URL = "https://www.flow.cl/api";
const FLOW_API_KEY = Deno.env.get("FLOW_API_KEY")!;
const FLOW_SECRET_KEY = Deno.env.get("FLOW_SECRET_KEY")!;

// Generate Flow signature for API requests using HMAC-SHA256

async function generateSignatureAsync(params: Record<string, string>): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map(key => `${key}${params[key]}`).join("");
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(FLOW_SECRET_KEY);
  const data = encoder.encode(toSign);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();
    console.log("Flow payment action:", action, data);

    if (action === "create_payment") {
      // Create a new payment order in Flow
      const { email, amount, commerceOrder, subject, urlReturn, urlConfirmation } = data;
      
      const params: Record<string, string> = {
        apiKey: FLOW_API_KEY,
        commerceOrder: commerceOrder,
        subject: subject || "Análisis Dental Completo",
        currency: "CLP",
        amount: String(amount || 4990),
        email: email,
        urlConfirmation: urlConfirmation,
        urlReturn: urlReturn,
      };

      const signature = await generateSignatureAsync(params);
      params.s = signature;

      console.log("Creating Flow payment with params:", { ...params, apiKey: "[REDACTED]" });

      // Make request to Flow API
      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`${FLOW_API_URL}/payment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const result = await response.json();
      console.log("Flow API response:", result);

      if (result.url && result.token) {
        return new Response(
          JSON.stringify({
            success: true,
            paymentUrl: `${result.url}?token=${result.token}`,
            flowOrder: result.flowOrder,
            token: result.token,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("Flow API error:", result);
        return new Response(
          JSON.stringify({ success: false, error: result.message || "Error creating payment" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    if (action === "get_payment_status") {
      // Get payment status by token
      const { token } = data;
      
      const params: Record<string, string> = {
        apiKey: FLOW_API_KEY,
        token: token,
      };

      const signature = await generateSignatureAsync(params);
      params.s = signature;

      const formData = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(`${FLOW_API_URL}/payment/getStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const result = await response.json();
      console.log("Flow payment status:", result);

      // Flow status: 1 = pending, 2 = paid, 3 = rejected, 4 = canceled
      return new Response(
        JSON.stringify({
          success: true,
          status: result.status,
          statusText: getStatusText(result.status),
          flowOrder: result.flowOrder,
          commerceOrder: result.commerceOrder,
          amount: result.amount,
          payer: result.payer,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error: unknown) {
    console.error("Flow payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function getStatusText(status: number): string {
  switch (status) {
    case 1: return "pendiente";
    case 2: return "pagado";
    case 3: return "rechazado";
    case 4: return "anulado";
    default: return "desconocido";
  }
}
