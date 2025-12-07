import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing dental image with AI...');

    const systemPrompt = `Eres un asistente de análisis dental para pacientes. Tu rol es analizar imágenes dentales y proporcionar observaciones orientativas.

IMPORTANTE: 
- NO eres un dentista ni proporcionas diagnósticos definitivos
- Tus observaciones son ORIENTATIVAS y el paciente DEBE consultar con un profesional
- Sé honesto si la imagen no es clara o no puedes ver bien ciertas áreas
- Si no detectas problemas evidentes, dilo claramente

Analiza la imagen y responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con esta estructura exacta:
{
  "analisisValido": boolean,
  "mensajeGeneral": "string describiendo lo que observas en general",
  "hallazgos": [
    {
      "tipo": "caries" | "calculo" | "desgaste" | "gingivitis" | "otro",
      "confianza": "alta" | "media" | "baja",
      "descripcion": "descripción específica de lo observado",
      "ubicacion": "descripción de la ubicación aproximada",
      "coordenadas": {
        "x": number entre 0 y 1,
        "y": number entre 0 y 1,
        "width": number entre 0 y 1,
        "height": number entre 0 y 1
      }
    }
  ],
  "recomendacion": "string con recomendación general para el paciente",
  "calidadImagen": "buena" | "aceptable" | "mala",
  "notaCalidadImagen": "string explicando si hay problemas con la imagen"
}

Si la imagen no muestra dientes o no es útil para análisis dental, responde:
{
  "analisisValido": false,
  "mensajeGeneral": "explicación de por qué no se puede analizar",
  "hallazgos": [],
  "recomendacion": "Por favor sube una foto clara de tus dientes",
  "calidadImagen": "mala",
  "notaCalidadImagen": "explicación del problema"
}

Si no detectas ningún problema evidente, devuelve hallazgos como array vacío y menciona que no se observan problemas evidentes en la imagen, pero que esto NO significa que no existan y debe consultar con un profesional.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analiza esta imagen dental y proporciona tus observaciones orientativas. Recuerda responder SOLO con JSON válido, sin markdown ni backticks.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Servicio no disponible temporalmente.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error al procesar la imagen' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response from AI');
      return new Response(
        JSON.stringify({ error: 'No se recibió respuesta del análisis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI Response received:', aiResponse.substring(0, 200));

    // Parse the JSON response from AI
    let analysisResult;
    try {
      // Clean the response in case it has markdown formatting
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();
      
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', aiResponse);
      return new Response(
        JSON.stringify({ 
          error: 'Error al interpretar el análisis',
          rawResponse: aiResponse 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete:', JSON.stringify(analysisResult).substring(0, 300));

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-dental function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
