export enum AppTab {
  GENERATOR = 'GENERATOR',
  HISTORY = 'HISTORY',
  ANALYSIS = 'ANALYSIS',
  BRAIN = 'BRAIN'
}

export type VideoDuration = '10s' | '30s' | '60s';
export type CtaPlacement = 'Inicio' | 'Meio' | 'Fim';

export interface ScriptScene {
  time_segment: string;
  visual_cue: string; // What appears on screen
  audio_narration: string; // What is spoken
}

export interface ScriptContent {
  id: string;
  topic: string;
  title: string;
  video_start_text: string;
  hook_visual_desc: string;
  veo_prompt: string;
  alternative_hook: string;
  cta_text: string;
  cta_placement: string;
  main_content: string; // Kept for backward compatibility
  script_scenes?: ScriptScene[]; // New structured format
  outro: string;
  caption_seo: string;
  hashtags: string[];
  generated_image_url?: string; 
  timestamp: string;
  duration?: string;
}

export interface PersonaProfile {
  project: string;
  version: string;
  system_instruction: string;
  context_memory: {
    avatar_profile: any;
    performance_history: any;
    content_log_scripts: any[];
    capcut_technical_rules: string[];
  };
}

export interface TrendingTopic {
  title: string;
  reason: string;
}
