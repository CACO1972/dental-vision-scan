import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ViewType = 'frontal' | 'superior' | 'inferior';

const viewRequirements: Record<ViewType, { description: string; minTeeth: number }> = {
  frontal: {
    description: 'Vista frontal: se deben ver las caras vestibulares de los 6 dientes anteriores superiores (de canino a canino) y al menos parte de los 6 dientes anteriores inferiores',
    minTeeth: 8
  },
  superior: {
    description: 'Vista oclusal superior: se deben ver las caras oclusales de al menos 10 dientes superiores, desde los incisivos hasta el primer molar de cada lado',
    minTeeth: 10
  },
  inferior: {
    description: 'Vista oclusal inferior: se deben ver las caras oclusales de al menos 10 dientes inferiores, desde los incisivos hasta el primer molar de cada lado',
    minTeeth: 10
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, viewType } = await req.json();

    if (!imageBase64 || !viewType) {
      return new Response(
        JSON.stringify({ error: 'Se requiere imagen y tipo de vista' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Servicio de IA no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requirement = viewRequirements[viewType as ViewType];
    if (!requirement) {
      return new Response(
        JSON.stringify({ error: 'Tipo de vista no válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validating ${viewType} view...`);

    const systemPrompt = `Eres un asistente de validación de imágenes dentales. Tu único trabajo es verificar si una imagen dental cumple con requisitos específicos de visibilidad de dientes.

REQUISITO PARA ESTA IMAGEN:
${requirement.description}

Analiza la imagen y responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks):
{
  "esValida": boolean,
  "dientesVisibles": number (cantidad aproximada de dientes claramente visibles),
  "mensaje": "string explicando qué se ve y si cumple el requisito",
  "sugerencia": "string con sugerencia de cómo mejorar si no es válida (o null si es válida)"
}

CRITERIOS:
- esValida = true solo si se ven claramente al menos ${requirement.minTeeth} dientes según el requisito
- Sé estricto: los dientes deben verse claramente, no parcialmente ocultos
- Si no es una imagen dental o está muy borrosa, esValida = false
- El mensaje debe ser breve y claro para el paciente`;

    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: `Valida esta imagen para la vista ${viewType}. Responde solo con JSON.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error al validar la imagen' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No se recibió respuesta de validación' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validation response:', aiResponse.substring(0, 200));

    let validationResult;
    try {
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
      
      validationResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse validation response:', parseError);
      return new Response(
        JSON.stringify({ 
          esValida: false,
          mensaje: 'No se pudo procesar la validación',
          sugerencia: 'Intenta tomar otra foto'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Validation complete for ${viewType}: valid=${validationResult.esValida}`);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-dental-view function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Error desconocido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
