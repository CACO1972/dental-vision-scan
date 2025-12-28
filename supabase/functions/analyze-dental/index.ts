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

    console.log('Analyzing dental image with Gemini 2.5 Pro...');

    const systemPrompt = `Eres un experto en análisis dental con formación en odontología clínica. Tu rol es realizar un análisis EXHAUSTIVO y DETALLADO de imágenes dentales para orientar al paciente.

INSTRUCCIONES DE ANÁLISIS PROFUNDO:

1. INSPECCIÓN VISUAL METICULOSA:
   - Examina CADA diente visible individualmente
   - Identifica cambios de coloración (manchas blancas, marrones, negras, grises)
   - Busca líneas de fractura, chips, erosión del esmalte
   - Detecta áreas de desmineralización (manchas blancas opacas)
   - Observa la forma y contorno de cada diente

2. ANÁLISIS DE ENCÍAS (TEJIDO GINGIVAL):
   - Color: rosa saludable vs rojo inflamado vs pálido
   - Textura: puntillado normal vs lisa inflamada
   - Contorno: festoneado normal vs retraído vs inflamado
   - Sangrado visible o signos de inflamación
   - Recesión gingival (raíces expuestas)

3. EVALUACIÓN DE CARIES:
   - Caries incipientes (manchas blancas/marrones superficiales)
   - Caries activas (cavitación visible)
   - Caries interproximales (entre dientes)
   - Caries radiculares (en raíces expuestas)
   - Caries secundarias (alrededor de restauraciones)

4. ANÁLISIS DE ACUMULACIÓN:
   - Placa dental (película suave amarillenta)
   - Cálculo/sarro supragingival (depósitos duros amarillentos/marrones)
   - Manchas extrínsecas (té, café, tabaco)
   - Distribución y severidad

5. EVALUACIÓN DE RESTAURACIONES:
   - Amalgamas, resinas, coronas visibles
   - Integridad de márgenes
   - Cambios de color alrededor
   - Fracturas o defectos

6. OTROS HALLAZGOS:
   - Desgaste dental (atrición, abrasión, erosión)
   - Maloclusión visible
   - Espacios o apiñamiento
   - Dientes ausentes
   - Lesiones en mucosa oral visible

IMPORTANTE:
- Sé ESPECÍFICO con las ubicaciones (usa terminología: incisivo central/lateral, canino, premolares, molares; superior/inferior; derecho/izquierdo; vestibular/palatino/lingual/oclusal)
- Indica nivel de confianza basado en la claridad de la imagen
- Si algo no es claro, indícalo pero intenta hacer tu mejor evaluación
- NO minimices hallazgos - es mejor alertar y que el dentista descarte que pasar algo por alto

Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks):
{
  "analisisValido": boolean,
  "mensajeGeneral": "Resumen ejecutivo del estado dental observado (2-3 oraciones)",
  "hallazgos": [
    {
      "tipo": "caries" | "calculo" | "desgaste" | "gingivitis" | "placa" | "restauracion" | "fractura" | "manchas" | "recesion" | "otro",
      "confianza": "alta" | "media" | "baja",
      "severidad": "leve" | "moderado" | "severo",
      "descripcion": "Descripción detallada y específica del hallazgo",
      "ubicacion": "Ubicación anatómica precisa",
      "recomendacionEspecifica": "Qué debería hacer el paciente respecto a este hallazgo",
      "coordenadas": {
        "x": number entre 0 y 1,
        "y": number entre 0 y 1,
        "width": number entre 0 y 1,
        "height": number entre 0 y 1
      }
    }
  ],
  "estadoGeneral": "bueno" | "aceptable" | "requiere_atencion" | "urgente",
  "recomendacion": "Recomendación general priorizada para el paciente",
  "proximosPasos": ["Lista de acciones recomendadas en orden de prioridad"],
  "calidadImagen": "buena" | "aceptable" | "mala",
  "notaCalidadImagen": "Explicación de limitaciones si las hay",
  "areasNoVisibles": ["Lista de áreas que no se pudieron evaluar por la imagen"]
}

Si no hay problemas evidentes, indica que el estado VISIBLE parece saludable pero enfatiza la importancia de revisión profesional para áreas no visibles (interproximales, radiografías, etc.).`;

    const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

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
                text: 'Realiza un análisis dental EXHAUSTIVO y DETALLADO de esta imagen. Examina cada diente visible, las encías, busca signos de caries, acumulación de sarro, inflamación gingival, desgaste, y cualquier otro hallazgo clínico relevante. Sé minucioso y específico. Responde SOLO con JSON válido.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos de IA agotados. Contacta soporte.' }),
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

    console.log('AI Response received:', aiResponse.substring(0, 500));

    let analysisResult;
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

    console.log('Analysis complete with', analysisResult.hallazgos?.length || 0, 'findings');
    console.log('Estado general:', analysisResult.estadoGeneral);

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