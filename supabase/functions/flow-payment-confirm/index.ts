import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FLOW_API_URL = "https://www.flow.cl/api";
const FLOW_API_KEY = Deno.env.get("FLOW_API_KEY")!;
const FLOW_SECRET_KEY = Deno.env.get("FLOW_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function generateSignatureAsync(params: Record<string, string>): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((key) => `${key}${params[key]}`).join("");
  const encoder = new TextEncoder();
  const keyData = encoder.encode(FLOW_SECRET_KEY);
  const data = encoder.encode(toSign);
  const key = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const token = formData.get("token") as string;

    if (!token) {
      console.error("No token received in confirmation");
      return new Response("Token required", { status: 400 });
    }

    console.log("Payment confirmation received, token:", token);

    // Verify with Flow
    const params: Record<string, string> = { apiKey: FLOW_API_KEY, token };
    const signature = await generateSignatureAsync(params);
    params.s = signature;

    const statusFormData = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => statusFormData.append(k, v));

    const response = await fetch(`${FLOW_API_URL}/payment/getStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: statusFormData.toString(),
    });

    const result = await response.json();
    console.log("Flow status:", result.status, "order:", result.commerceOrder);

    // Determine status label
    const statusMap: Record<number, string> = { 1: "pending", 2: "paid", 3: "rejected", 4: "canceled" };
    const statusLabel = statusMap[result.status] ?? "unknown";

    // Save to DB (both success and failure — for audit trail)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: dbError } = await supabase
      .from("scandent_payments")
      .upsert(
        {
          commerce_order: result.commerceOrder,
          flow_order: String(result.flowOrder ?? ""),
          amount: result.amount,
          email: result.payer,
          status: statusLabel,
          token: token,
          flow_raw: result,
          paid_at: new Date().toISOString(),
        },
        { onConflict: "commerce_order" }
      );

    if (dbError) {
      console.error("DB upsert error:", dbError.message);
    } else {
      console.log("Payment record saved:", result.commerceOrder, statusLabel);
    }

    // Flow requires HTTP 200
    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error: unknown) {
    console.error("Payment confirmation error:", error);
    return new Response(String(error), { status: 500 });
  }
});
