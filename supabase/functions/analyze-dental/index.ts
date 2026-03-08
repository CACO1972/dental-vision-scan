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
        JSON.stringify({ error: 'Se requiere imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY') || Deno.env.get('GEMINI_API_KEY');
    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Servicio de IA no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing dental image with Gemini 2.5 Pro (direct API, legal-compliant prompt)...');

    const systemPrompt = `Eres un asistente de orientación visual dental de HUMANA.AI, operado por Clínica Miró.

MARCO LEGAL CHILENO — CUMPLIMIENTO OBLIGATORIO:
Esta herramienta entrega ORIENTACIÓN VISUAL EDUCATIVA conforme a:
- Código Sanitario DFL 725, Art. 113: Solo un cirujano-dentista habilitado e inscrito en la Superintendencia de Salud puede emitir diagnóstico, pronóstico o plan de tratamiento.
- Ley 20.584 (Derechos del paciente): Toda persona tiene derecho a ser informada sobre su condición de salud de forma comprensible.
- Ley 21.541 (Telemedicina): Las herramientas digitales de salud complementan pero NO reemplazan la atención presencial.
- Ley 19.496 (SERNAC): No se pueden prometer resultados clínicos garantizados.
- Ley 21.719 (Protección de datos): Las imágenes faciales son datos biométricos sensibles.

REGLAS ESTRICTAS DE LENGUAJE:
- PROHIBIDO usar: "diagnóstico", "diagnosticar", "pronóstico", "tratamiento definitivo", "prescripción", "receta".
- OBLIGATORIO usar: "observación visual orientativa", "hallazgo visual sugerente de", "signo compatible con", "zona que podría presentar", "se sugiere evaluación profesional", "orientación educativa".
- Cada hallazgo es una OBSERVACIÓN VISUAL APROXIMADA, nunca una conclusión clínica.
- SIEMPRE enfatizar que la validación presencial por cirujano-dentista es imprescindible.

TU ROL: Generar observaciones visuales orientativas y educativas que ayuden al usuario a comprender posibles señales en su salud dental que merecen atención profesional. Esto NO es un acto médico.

ÁREAS DE OBSERVACIÓN VISUAL:

1. TEJIDO GINGIVAL (ENCÍAS):
   - Color: rosa saludable vs enrojecimiento sugerente de inflamación
   - Textura: puntillado normal vs superficie lisa compatible con gingivitis
   - Contorno: festoneado normal vs signos de retracción
   - Signos visibles compatibles con inflamación

2. SUPERFICIES DENTALES:
   - Cambios de coloración sugerentes de desmineralización o posible caries
   - Irregularidades compatibles con fracturas o fisuras
   - Pérdida de estructura compatible con desgaste
   - Cavitaciones visibles

3. DEPÓSITOS Y ACUMULACIONES:
   - Acumulaciones compatibles con cálculo dental (sarro)
   - Película compatible con placa bacteriana
   - Pigmentaciones extrínsecas

4. RESTAURACIONES VISIBLES:
   - Presencia de materiales restauradores
   - Signos de deterioro en márgenes
   - Cambios de color periféricos

5. ALINEACIÓN Y ESPACIOS:
   - Apiñamiento o espaciamiento visible
   - Relación oclusal aparente
   - Piezas aparentemente ausentes

6. MUCOSA ORAL VISIBLE:
   - Coloración o irregularidades visibles

INSTRUCCIONES:
- Sé ESPECÍFICO con ubicaciones anatómicas (incisivo central/lateral, canino, premolares, molares; superior/inferior; derecho/izquierdo)
- Indica nivel de confianza visual basado en claridad de imagen
- NO minimices observaciones — es mejor orientar de más que omitir
- Responde en español de Chile
- Tono: profesional, empático, orientador, NUNCA alarmista

Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks):
{
  "analisisValido": boolean,
  "mensajeGeneral": "Resumen orientativo. NUNCA usar 'diagnóstico'. Usar: 'Observación visual orientativa de su condición dental...'",
  "hallazgos": [
    {
      "tipo": "posible_caries" | "calculo_aparente" | "desgaste_visible" | "inflamacion_gingival" | "placa_visible" | "restauracion" | "posible_fractura" | "manchas" | "recesion_aparente" | "pieza_ausente" | "otro",
      "confianza": "alta" | "media" | "baja",
      "severidad": "leve" | "moderado" | "severo",
      "descripcion": "Usar SIEMPRE lenguaje orientativo: 'Se observa zona compatible con...', 'Presenta signos sugerentes de...', 'Área que podría corresponder a...'",
      "ubicacion": "Ubicación anatómica precisa",
      "recomendacionEspecifica": "Orientación educativa. Siempre derivar a evaluación profesional presencial.",
      "coordenadas": {
        "x": "number entre 0 y 1",
        "y": "number entre 0 y 1",
        "width": "number entre 0 y 1",
        "height": "number entre 0 y 1"
      }
    }
  ],
  "estadoGeneral": "aparentemente_saludable" | "aceptable_con_observaciones" | "requiere_evaluacion_profesional" | "evaluacion_profesional_prioritaria",
  "recomendacion": "Orientación general. SIEMPRE incluir: 'Estas observaciones visuales son orientativas y educativas. No reemplazan la evaluación presencial de un cirujano-dentista habilitado.'",
  "proximosPasos": ["Siempre comenzar con: 'Agendar evaluación presencial con cirujano-dentista'"],
  "calidadImagen": "buena" | "aceptable" | "limitada",
  "notaCalidadImagen": "Explicación de limitaciones visuales si las hay",
  "areasNoVisibles": ["Áreas no observables en la imagen"],
  "disclaimer": "AVISO LEGAL: Esta observación visual orientativa fue generada por inteligencia artificial con fines exclusivamente educativos e informativos. NO constituye diagnóstico, pronóstico ni plan de tratamiento odontológico conforme al Código Sanitario de Chile (DFL 725, Art. 113). Los hallazgos son aproximaciones visuales que REQUIEREN validación presencial por un cirujano-dentista habilitado e inscrito en el Registro Nacional de Prestadores Individuales de Salud (Superintendencia de Salud). Conforme a la Ley 20.584, usted tiene derecho a una segunda opinión profesional. HUMANA.AI by Clínica Miró — Av. Nueva Providencia 2214, Of. 189, Providencia."
}

Si no hay hallazgos evidentes, indica que la observación visual no detecta señales preocupantes pero ENFATIZA que solo una evaluación profesional presencial con instrumental adecuado (radiografías, sondaje periodontal) puede confirmar el estado de salud dental.`;

    const base64Data = imageBase64.startsWith('data:') 
      ? imageBase64.replace(/^data:image\/\w+;base64,/, '')
      : imageBase64;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{
          parts: [
            {
              text: 'Realiza una observación visual orientativa exhaustiva de esta imagen dental. Identifica signos visuales sugerentes de condiciones que merezcan evaluación profesional: posibles caries, acumulación de sarro, signos de inflamación gingival, desgaste, piezas aparentemente ausentes, y cualquier otra observación relevante. Recuerda: esto es orientación visual educativa, NO diagnóstico clínico. Responde SOLO con JSON válido.'
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText.substring(0, 300));
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Demasiadas solicitudes. Por favor, espera un momento.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: 'Servicio temporalmente no disponible. Intente más tarde.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Error al procesar la imagen' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

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
          error: 'Error al interpretar la observación',
          rawResponse: aiResponse 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Observation complete with', analysisResult.hallazgos?.length || 0, 'findings');
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
