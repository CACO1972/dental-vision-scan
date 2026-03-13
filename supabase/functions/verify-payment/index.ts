import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { commerceOrder } = await req.json();

    if (!commerceOrder) {
      return new Response(
        JSON.stringify({ verified: false, error: "commerceOrder required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("scandent_payments")
      .select("status, amount, email, plan, paid_at")
      .eq("commerce_order", commerceOrder)
      .eq("status", "paid")
      .single();

    if (error || !data) {
      console.log("Payment not found or not paid:", commerceOrder, error?.message);
      return new Response(
        JSON.stringify({ verified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment verified:", commerceOrder, data.amount);
    return new Response(
      JSON.stringify({
        verified: true,
        plan: data.amount >= 14990 ? "premium" : "basic",
        amount: data.amount,
        paid_at: data.paid_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("verify-payment error:", error);
    return new Response(
      JSON.stringify({ verified: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
