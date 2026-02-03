import { GoogleGenAI, Type } from "@google/genai";
import { PersonaProfile, ScriptContent, VideoDuration, CtaPlacement, TrendingTopic } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        }
      }
    },
    main_content: { type: Type.STRING }, // Fallback summary
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
  const model = "gemini-3-pro-preview"; 
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Pesquise na web por: 1. Problemas recentes ou bugs no WhatsApp, Instagram ou Android. 2. Novas IAs gratuitas que lançaram essa semana. 3. Dores comuns de usuários de celular barato (bateria, memória). Liste 4 tópicos quentes para vídeo.",
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

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to fetch trends:", error);
    return [
      { title: "Truques de Bateria Samsung", reason: "Dor constante de usuários" },
      { title: "Função Oculta WhatsApp", reason: "Curiosidade sempre alta" },
      { title: "Site que substitui PC", reason: "Utilidade pública" }
    ];
  }
};

export const generateScriptFromIdea = async (
  idea: string, 
  persona: PersonaProfile,
  duration: VideoDuration,
  ctaPlacement: CtaPlacement
): Promise<ScriptContent> => {
  const model = "gemini-3-pro-preview"; // High reasoning for strategy
  
  const systemInstruction = `${persona.system_instruction}
  
  MEMÓRIA ATUAL:
  ${JSON.stringify(persona.context_memory)}

  TAREFA:
  Gere um roteiro viral para o tema: "${idea}".
  Duração do Vídeo: ${duration}.
  Posição do CTA (Call to Action): ${ctaPlacement}.
  Idioma: Português (Brasil).

  ESTRUTURA OBRIGATÓRIA:
  O campo 'script_scenes' deve conter o roteiro dividido linha a linha com o que aparece na tela (Visual) e o que é falado (Locução).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Gere o roteiro sobre: ${idea}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      ...data,
      id: crypto.randomUUID(),
      topic: idea,
      duration,
      cta_placement: ctaPlacement, // Ensure it matches input
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};

export const generateHookImage = async (prompt: string): Promise<string> => {
  // Using gemini-2.5-flash-image which is generally available and performant
  const model = "gemini-2.5-flash-image"; 

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: `Create a high impact, viral social media hook image. Visual Description: ${prompt}. Aspect Ratio 9:16 (Story/Reels style) or 1:1 if generic.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const analyzeMediaContent = async (
  fileBase64: string, 
  mimeType: string, 
  persona: PersonaProfile
): Promise<string> => {
  const model = "gemini-3-pro-preview"; // Multimodal analysis

  const systemInstruction = `${persona.system_instruction}
  
  TAREFA:
  Analise a mídia anexada (imagem ou frame de vídeo). 
  Critique brutalmente com base nas regras visuais da 'Zunetech' (Regras CapCut, Gancho visual).
  Diga se isso vai viralizar ou falhar. Dê 3 melhorias específicas. Responda em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType
            }
          },
          { text: "Analise este conteúdo para potencial viral." }
        ]
      },
      config: {
        systemInstruction
      }
    });

    return response.text || "Nenhuma análise fornecida.";
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};
