import { GoogleGenAI, Type } from "@google/genai";
import { PersonaProfile, ScriptContent, VideoDuration, CtaPlacement, TrendingTopic } from "../types.ts";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    video_start_text: { type: Type.STRING },
    hook_visual_desc: { type: Type.STRING },
    veo_prompt: { type: Type.STRING },
    alternative_hook: { type: Type.STRING },
    cta_text: { type: Type.STRING },
    cta_placement: { type: Type.STRING },
    script_scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time_segment: { type: Type.STRING },
          visual_cue: { type: Type.STRING },
          audio_narration: { type: Type.STRING }
        },
        required: ["time_segment", "visual_cue", "audio_narration"]
      }
    },
    main_content: { type: Type.STRING },
    outro: { type: Type.STRING },
    caption_seo: { type: Type.STRING },
    hashtags: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: [
    "title", "video_start_text", "hook_visual_desc", "veo_prompt", 
    "alternative_hook", "cta_text", "cta_placement", "script_scenes", 
    "outro", "caption_seo", "hashtags"
  ]
};

export const fetchTrendingTopics = async (): Promise<TrendingTopic[]> => {
  if (!apiKey) return [];
  const model = "gemini-3-pro-preview"; 
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Pesquise na web em português Brasil por: 1. Problemas ou bugs recentes no WhatsApp, Instagram ou Android. 2. Novas ferramentas de IA gratuitas úteis. 3. Dores de quem tem celular lento ou bateria ruim. Extraia 4 temas para vídeos curtos e virais.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Erro ao buscar tendências:", error);
    return [
      { title: "Limpar Memória do WhatsApp", reason: "Problema comum de espaço" },
      { title: "IA de Fotos Gratuitas", reason: "Tendência de produtividade" },
      { title: "Bug na atualização do Instagram", reason: "Assunto do momento" },
      { title: "Economia de Bateria Real", reason: "Desejo universal" }
    ];
  }
};

export const generateScriptFromIdea = async (
  idea: string, 
  persona: PersonaProfile,
  duration: VideoDuration,
  ctaPlacement: CtaPlacement
): Promise<ScriptContent> => {
  const model = "gemini-3-pro-preview";
  const systemInstruction = `${persona.system_instruction}
  
  CONTEXTO ZUNETECH:
  ${JSON.stringify(persona.context_memory)}

  REGRAS DO ROTEIRO:
  - Duração: ${duration}.
  - Posição do CTA: ${ctaPlacement}.
  - Linguagem: Português do Brasil.
  - O campo 'script_scenes' deve detalhar o que APARECE na tela e o que é FALADO quadro a quadro.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Gere um roteiro épico sobre: ${idea}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      id: crypto.randomUUID(),
      topic: idea,
      duration,
      cta_placement: ctaPlacement,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Falha na geração:", error);
    throw error;
  }
};

export const generateHookImage = async (prompt: string): Promise<string> => {
  const model = "gemini-2.5-flash-image"; 
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `High impact social media visual: ${prompt}. Aspect Ratio 9:16.` }] },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Imagem não gerada");
  } catch (error) {
    console.error("Erro na imagem:", error);
    throw error;
  }
};

export const analyzeMediaContent = async (fileBase64: string, mimeType: string, persona: PersonaProfile): Promise<string> => {
  const model = "gemini-3-pro-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ inlineData: { data: fileBase64, mimeType } }, { text: "Analise o potencial viral deste conteúdo." }]
      },
      config: { systemInstruction: persona.system_instruction }
    });
    return response.text || "Sem análise.";
  } catch (error) {
    console.error("Erro na análise:", error);
    throw error;
  }
};