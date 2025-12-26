import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ViewType = 'frontal' | 'superior' | 'inferior';

const viewRequirements: Record<ViewType, { description: string; minTeeth: number }> = {
  frontal: {
    description: 'Vista frontal: se deben ver al menos parcialmente las caras vestibulares de algunos dientes anteriores. Aceptable con 4-6 dientes visibles.',
    minTeeth: 4
  },
  superior: {
    description: 'Vista oclusal superior: cualquier porción visible de las superficies de masticación de dientes superiores. Puede ser parcial.',
    minTeeth: 2
  },
  inferior: {
    description: 'Vista oclusal inferior: cualquier porción visible de las superficies de masticación de dientes inferiores. Puede ser parcial.',
    minTeeth: 2
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

    const isOcclusal = viewType === 'superior' || viewType === 'inferior';
    
    const systemPrompt = `Eres un asistente dental MUY PERMISIVO que valida fotos caseras de dientes.

CONTEXTO IMPORTANTE:
- Son fotos tomadas por la misma persona (selfies dentales)
- Las vistas oclusales son MUY DIFÍCILES de capturar
- Después se usará IA para mejorar y reconstruir las imágenes
- Tu rol es ACEPTAR imágenes que tengan CUALQUIER utilidad

REQUISITO MÍNIMO:
${requirement.description}

Responde ÚNICAMENTE con JSON válido (sin markdown):
{
  "esValida": boolean,
  "dientesVisibles": number,
  "mensaje": "string corto y amigable",
  "sugerencia": "string o null"
}

CRITERIOS ULTRA-PERMISIVOS:
${isOcclusal ? `
- Para vistas oclusales: ACEPTA si hay AL MENOS 1-2 dientes visibles desde arriba/abajo
- ACEPTA aunque esté borrosa, oscura o parcial
- ACEPTA aunque se vea solo una pequeña porción del arco dental
- ACEPTA aunque la perspectiva no sea perfectamente perpendicular
- Solo rechaza si NO hay NINGÚN diente visible o es foto de otra cosa
` : `
- ACEPTA si se ven algunos dientes frontales, aunque sean pocos
- ACEPTA aunque esté parcialmente borrosa o con poca luz
`}
- El mensaje debe ser ALENTADOR y positivo
- Si rechazas, da una sugerencia MUY SIMPLE`;

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
