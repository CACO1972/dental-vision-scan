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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
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

    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancementPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
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
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

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
