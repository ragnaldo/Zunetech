
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Layout, History, BrainCircuit, Send, Loader2, ShieldAlert, Wifi, 
  RefreshCw, AlertTriangle, Clock, Monitor, Zap, Share2, Check, Flame, 
  FileSpreadsheet, KeyRound, Globe
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- 1. TYPES ---
type VideoDuration = '10s' | '30s' | '60s';
type CtaPlacement = 'Inicio' | 'Meio' | 'Fim';

interface ScriptScene {
  time_segment: string;
  visual_cue: string;
  audio_narration: string;
}

interface ScriptContent {
  id: string;
  topic: string;
  title: string;
  hook_visual_desc: string;
  script_scenes: ScriptScene[];
  caption_seo: string;
  timestamp: string;
  duration: string;
}

interface PersonaProfile {
  project: string;
  system_instruction: string;
  context_memory: any;
}

// --- 2. CONSTANTS ---
const INITIAL_PERSONA: PersonaProfile = {
  project: "Zunetech - Social GOD",
  system_instruction: "Você é o 'Social GOD', estrategista de elite para o perfil Zunetech. FOCO: Tecnologia, Android, WhatsApp. TOM: Autoritário, focado em segredos e hacks.",
  context_memory: {
    avatar: "Lucas, 18-34 anos, classe C/D, busca hacks de bateria e WhatsApp.",
    rules: ["Nunca 'Oi gente'", "Ganchos agressivos", "Cortes rápidos"]
  }
};

// --- 3. SERVICES (DYNAMIC INITIALIZATION) ---

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

const generateAIContent = async (idea: string, duration: VideoDuration, cta: CtaPlacement): Promise<ScriptContent> => {
  const ai = getAIInstance();
  const prompt = `Gere um roteiro viral Zunetech sobre: ${idea}. Duração: ${duration}. CTA: ${cta}.
  Retorne APENAS um JSON:
  {
    "title": "título",
    "hook_visual_desc": "gancho",
    "script_scenes": [{"time_segment": "0-3s", "visual_cue": "...", "audio_narration": "..."}],
    "caption_seo": "legenda"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      systemInstruction: INITIAL_PERSONA.system_instruction
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    ...data,
    id: crypto.randomUUID(),
    topic: idea,
    duration,
    timestamp: new Date().toISOString()
  };
};

const getTrends = async () => {
  try {
    const ai = getAIInstance();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "4 tendências de Android/WhatsApp Brasil agora. JSON: [{'title': '...', 'reason': '...'}]",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [
      { title: "Bateria do Android", reason: "Sempre em alta" },
      { title: "WhatsApp 2025", reason: "Curiosidade" }
    ];
  }
};

// --- 4. COMPONENTS ---

// Fix: Explicitly use React.FC to include standard React props like 'key'
const ScriptCard: React.FC<{ script: ScriptContent }> = ({ script }) => {
  const [copied, setCopied] = useState(false);
  
  const copyCaption = () => {
    navigator.clipboard.writeText(script.caption_seo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-8 shadow-2xl hover:border-emerald-500/30 transition-all">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div>
          <h3 className="text-emerald-400 font-mono font-bold uppercase tracking-wider">{script.title}</h3>
          <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase">
            <span className="flex items-center gap-1"><Clock size={12}/> {script.duration}</span>
          </div>
        </div>
        <button onClick={copyCaption} className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
          {copied ? <Check size={18}/> : <Share2 size={18}/>}
        </button>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-black/40 p-5 rounded-2xl border-l-4 border-emerald-500">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-2">Hook Visual</p>
            <p className="text-sm italic text-slate-300">"{script.hook_visual_desc}"</p>
          </div>
          
          <div className="space-y-3">
            <p className="text-[10px] text-slate-500 font-black uppercase">Roteiro</p>
            {script.script_scenes?.map((s, i) => (
              <div key={i} className="flex gap-4 text-xs">
                <span className="text-slate-600 font-mono w-10 shrink-0 mt-1">{s.time_segment}</span>
                <div className="flex-1 pb-4 border-l border-slate-800 pl-4 relative">
                  <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-slate-800"></div>
                  <p className="text-blue-400 font-bold mb-1 uppercase tracking-tighter">[TELA] {s.visual_cue}</p>
                  <p className="text-slate-300 italic">"{s.audio_narration}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:flex flex-col gap-4">
           <div className="aspect-[9/16] bg-black rounded-3xl border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
              <p className="text-slate-800 font-mono text-[10px] uppercase tracking-[0.5em] text-center px-8">Preview Mobile</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. MAIN APP ---

const App = () => {
  const [tab, setTab] = useState('WAR');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<ScriptContent[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const ok = await window.aistudio.hasSelectedApiKey();
      setHasKey(ok);
      if (ok) {
        const saved = localStorage.getItem('zune_v25');
        if (saved) setScripts(JSON.parse(saved));
        getTrends().then(setTrends);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setHasKey(true);
    // Recarrega tendências após conexão
    getTrends().then(setTrends);
  };

  const handleGenerate = async () => {
    if (!idea) return;
    setLoading(true);
    try {
      const res = await generateAIContent(idea, '30s', 'Meio');
      const newScripts = [res, ...scripts];
      setScripts(newScripts);
      localStorage.setItem('zune_v25', JSON.stringify(newScripts));
      setIdea('');
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("Chave inválida ou expirada. Reconecte o sistema.");
      } else {
        alert("Erro na matriz Zunetech. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Tela de Conexão Inicial (Previne o erro de flash)
  if (hasKey === false) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98122_0,transparent_70%)]"></div>
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/20 rounded-[3rem] p-10 text-center shadow-[0_0_80px_-20px_rgba(16,185,129,0.2)] relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
            <KeyRound size={32} className="text-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Acesso à Matriz</h2>
          <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">
            Para ativar o <strong>Social GOD</strong> e as funções de pesquisa do Google, você precisa conectar uma chave de API válida.
          </p>
          <button 
            onClick={handleConnect} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group"
          >
            CONECTAR AO SOCIAL GOD
            <Zap size={18} className="group-hover:fill-current"/>
          </button>
          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <Globe size={12}/> Conexão Segura SSL/ZUNE
          </div>
        </div>
      </div>
    );
  }

  // Tela de Carregamento Silencioso
  if (hasKey === null) return null;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-900 p-8 flex flex-col gap-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-emerald-500 fill-emerald-500" size={24}/>
            <h1 className="text-2xl font-black tracking-tighter text-white">ZUNETECH</h1>
          </div>
          <p className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase">Intelligence HQ</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setTab('WAR')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'WAR' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
            <Layout size={20}/> <span className="text-xs font-black uppercase tracking-widest">War Room</span>
          </button>
          <button onClick={() => setTab('ARC')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'ARC' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
            <History size={20}/> <span className="text-xs font-black uppercase tracking-widest">Arquivos</span>
          </button>
          <button onClick={() => setTab('BRN')} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${tab === 'BRN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
            <BrainCircuit size={20}/> <span className="text-xs font-black uppercase tracking-widest">The Brain</span>
          </button>
        </nav>

        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
          <Wifi size={14} className="text-emerald-500"/>
          <div className="text-[9px] font-bold uppercase leading-tight text-emerald-500/70">
            Link: Estabelecido <br/>
            Matriz: Online
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {tab === 'WAR' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">War Room</h2>
              <p className="text-slate-500 font-medium">Comando central para criação de conteúdo.</p>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none"><Zap size={200}/></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Frequência de Ideia</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Tema do vídeo..."
                      className="flex-1 bg-black/50 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !idea}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 px-10 py-5 rounded-2xl text-black font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20}/> : "Gerar"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">
                    <Flame size={14}/> Radar de Tendências
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trends.map((t, i) => (
                      <button key={i} onClick={() => setIdea(t.title)} className="text-left p-5 rounded-2xl bg-black/30 border border-slate-800 hover:border-orange-500/30 transition-all group">
                        <p className="text-xs font-bold text-slate-300 group-hover:text-white">{t.title}</p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">{t.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {scripts.length > 0 && <ScriptCard script={scripts[0]} />}
          </div>
        )}

        {tab === 'ARC' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Arquivos</h2>
                <p className="text-slate-500 font-medium">Repositório de inteligência.</p>
              </div>
            </header>
            <div className="space-y-4">
              {scripts.map(s => <ScriptCard key={s.id} script={s} />)}
            </div>
          </div>
        )}

        {tab === 'BRN' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">The Brain</h2>
            </header>
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 font-mono text-[11px] leading-relaxed text-emerald-500/70 overflow-x-auto shadow-2xl">
              <pre>{JSON.stringify(INITIAL_PERSONA, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Render
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    rootElement.innerHTML = `<div style="padding:40px; color:red; font-family:monospace;">Fatal Boot Error: ${err.message}</div>`;
  }
}
