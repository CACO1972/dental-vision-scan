import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, viewType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Se requiere imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Servicio de IA no configurado', originalImage: imageBase64 }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Enhancing ${viewType || 'dental'} image...`);

    const viewDescription = viewType === 'superior' 
      ? 'vista oclusal superior (arco maxilar desde arriba)'
      : viewType === 'inferior'
      ? 'vista oclusal inferior (arco mandibular desde abajo)'
      : 'imagen dental';

    const enhancementPrompt = `Mejora esta ${viewDescription} dental para análisis clínico:
- Aumenta la nitidez y claridad de los dientes
- Mejora el contraste para ver mejor los detalles
- Corrige la iluminación si es necesario
- Mantén los colores naturales de los dientes y encías
- NO agregues elementos artificiales, solo mejora lo que existe
- Mantén la perspectiva y ángulo original
- Si la imagen está muy oscura o borrosa, aclárala y enfócala
La imagen resultante debe ser útil para un análisis dental profesional.`;

    const base64Data = imageBase64.startsWith('data:') 
      ? imageBase64.replace(/^data:image\/\w+;base64,/, '')
      : imageBase64;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: enhancementPrompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
          ]
        }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Límite de solicitudes excedido',
            originalImage: imageBase64,
            enhanced: false
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Créditos insuficientes',
            originalImage: imageBase64,
            enhanced: false
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return original image if enhancement fails
      return new Response(
        JSON.stringify({ 
          enhancedImage: imageBase64,
          enhanced: false,
          message: 'No se pudo mejorar la imagen, usando original'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let enhancedImageUrl = null;
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        enhancedImageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!enhancedImageUrl) {
      console.log('No enhanced image returned, using original');
      return new Response(
        JSON.stringify({ 
          enhancedImage: imageBase64,
          enhanced: false,
          message: 'No se generó imagen mejorada, usando original'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully enhanced ${viewType || 'dental'} image`);

    return new Response(
      JSON.stringify({ 
        enhancedImage: enhancedImageUrl,
        enhanced: true,
        message: 'Imagen mejorada exitosamente'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhance-dental-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        enhanced: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
