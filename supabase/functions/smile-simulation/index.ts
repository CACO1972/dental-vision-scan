import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, hallazgos } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Se requiere una imagen" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Starting smile simulation with", hallazgos?.length || 0, "findings to address");

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    // Build improvement description based on findings
    const improvements: string[] = [];
    if (hallazgos && hallazgos.length > 0) {
      hallazgos.forEach((h: { tipo: string }) => {
        switch (h.tipo) {
          case 'caries':
            improvements.push("restore any cavities with natural-looking fillings");
            break;
          case 'manchas':
            improvements.push("remove stains and whiten teeth");
            break;
          case 'calculo':
            improvements.push("remove tartar buildup, clean teeth");
            break;
          case 'gingivitis':
            improvements.push("show healthy pink gums");
            break;
          case 'desgaste':
            improvements.push("restore worn tooth edges");
            break;
          case 'fractura':
            improvements.push("repair any chipped or fractured teeth");
            break;
          case 'placa':
            improvements.push("remove plaque, show clean teeth surfaces");
            break;
          case 'recesion':
            improvements.push("show healthy gum line coverage");
            break;
        }
      });
    }

    const improvementText = improvements.length > 0 
      ? improvements.join(", ") 
      : "whiten teeth slightly, enhance smile";

    const prompt = `This is a dental photo. Create a realistic smile simulation showing how this person's smile would look after professional dental treatment. Apply these improvements: ${improvementText}. 

IMPORTANT: 
- Keep the SAME face, same person, same angle, same lighting
- Only modify the teeth and gums area
- Make improvements look natural and realistic, not artificial
- Maintain realistic tooth proportions and colors
- The result should look like a real photo, not digitally altered`;

    console.log("Sending request to Lovable AI for smile simulation");

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!generatedImage) {
      console.error("No image generated, response:", JSON.stringify(data).slice(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "No se pudo generar la simulación de sonrisa",
          details: textResponse || "Sin respuesta del modelo"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Smile simulation generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        simulatedImage: generatedImage,
        improvements: improvements,
        message: textResponse || "Simulación de sonrisa generada exitosamente"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Smile simulation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
