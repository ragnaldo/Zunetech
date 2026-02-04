
import { GoogleGenAI, Type } from "@google/genai";
import { PersonaProfile, ScriptContent, VideoDuration, CtaPlacement, TrendingTopic } from "../types.ts";

// Verificação segura da API KEY
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined") {
    return "";
  }
  return key;
};

const apiKey = getApiKey();

// Função para validar se a chave funciona na prática
export const validateApiKey = async (): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";
    // Tenta uma geração mínima apenas para validar a conexão
    await ai.models.generateContent({
      model,
      contents: "ping",
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (error) {
    console.error("Zunetech: Falha crítica na validação da API Key:", error);
    return false;
  }
};

const getAI = () => new GoogleGenAI({ apiKey: getApiKey() });

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
  const key = getApiKey();
  if (!key) return [
    { title: "Libertar Memória WhatsApp", reason: "Sempre em alta no Brasil" },
    { title: "IA Grátis para Fotos", reason: "Tendência de produtividade" }
  ];

  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-3-flash-preview"; 
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
      { title: "Limpar Cache do Android", reason: "Solução para travamentos" },
      { title: "Novas Vozes do TikTok", reason: "Engajamento visual" }
    ];
  }
};

export const generateScriptFromIdea = async (
  idea: string, 
  persona: PersonaProfile,
  duration: VideoDuration,
  ctaPlacement: CtaPlacement
): Promise<ScriptContent> => {
  const key = getApiKey();
  if (!key) throw new Error("API Key não configurada.");

  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-3-flash-preview";
  const systemInstruction = `${persona.system_instruction}
  
  CONTEXTO ZUNETECH:
  ${JSON.stringify(persona.context_memory)}

  REGRAS:
  - Duração: ${duration}.
  - CTA em: ${ctaPlacement}.
  - Idioma: Português (Brasil).
  - Use ganchos de curiosidade agressivos.
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
    console.error("Erro na geração do roteiro:", error);
    throw error;
  }
};

export const generateHookImage = async (prompt: string): Promise<string> => {
  const key = getApiKey();
  if (!key) return "";
  const ai = new GoogleGenAI({ apiKey: key });
  const model = "gemini-2.5-flash-image"; 
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `Social media impact image: ${prompt}. Aspect Ratio 9:16.` }] },
      config: { imageConfig: { aspectRatio: "9:16" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return "";
  } catch (e) { return ""; }
};
