import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLOW_API_URL = "https://www.flow.cl/api";
const FLOW_API_KEY = Deno.env.get("FLOW_API_KEY")!;
const FLOW_SECRET_KEY = Deno.env.get("FLOW_SECRET_KEY")!;

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
    // Flow sends confirmation as POST with form data
    const formData = await req.formData();
    const token = formData.get("token") as string;

    if (!token) {
      console.error("No token received in confirmation");
      return new Response("Token required", { status: 400 });
    }

    console.log("Received payment confirmation for token:", token);

    // Get payment status from Flow
    const params: Record<string, string> = {
      apiKey: FLOW_API_KEY,
      token: token,
    };

    const signature = await generateSignatureAsync(params);
    params.s = signature;

    const statusFormData = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      statusFormData.append(key, value);
    });

    const response = await fetch(`${FLOW_API_URL}/payment/getStatus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: statusFormData.toString(),
    });

    const result = await response.json();
    console.log("Payment status result:", result);

    // Flow status: 1 = pending, 2 = paid, 3 = rejected, 4 = canceled
    if (result.status === 2) {
      console.log("Payment confirmed successfully:", {
        flowOrder: result.flowOrder,
        commerceOrder: result.commerceOrder,
        amount: result.amount,
        email: result.payer,
      });
      
      // Here you could store the payment in database
      // For now we just acknowledge the payment
    } else {
      console.log("Payment not completed, status:", result.status);
    }

    // Flow expects a 200 response
    return new Response("OK", { 
      status: 200,
      headers: corsHeaders,
    });

  } catch (error: unknown) {
    console.error("Payment confirmation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(errorMessage, { status: 500 });
  }
});
