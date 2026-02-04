import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Layout, History, BrainCircuit, Send, Loader2, ShieldAlert, Wifi, 
  RefreshCw, AlertTriangle, Clock, Megaphone, Monitor, Mic, 
  Zap, FileText, Share2, Check, Copy, Flame, FileSpreadsheet, Image as ImageIcon
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

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
  generated_image_url?: string;
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

// --- 3. SERVICES ---
// Acesso seguro à API Key sem quebrar o script
const API_KEY = (typeof process !== 'undefined' && process.env?.API_KEY) || "";

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const validateConnection = async (): Promise<boolean> => {
  if (!ai) return false;
  try {
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
      config: { maxOutputTokens: 1 }
    });
    return true;
  } catch (e) {
    return false;
  }
};

const generateAIContent = async (idea: string, duration: VideoDuration, cta: CtaPlacement): Promise<ScriptContent> => {
  if (!ai) throw new Error("IA não inicializada");

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
  if (!ai) return [];
  try {
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

const ScriptCard = ({ script }: { script: ScriptContent }) => {
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
            <span className="flex items-center gap-1"><Monitor size={12}/> {script.topic}</span>
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
            <p className="text-[10px] text-slate-500 font-black uppercase">Sequência do Roteiro</p>
            {script.script_scenes?.map((s, i) => (
              <div key={i} className="flex gap-4 text-xs group">
                <span className="text-slate-600 font-mono w-10 shrink-0 mt-1">{s.time_segment}</span>
                <div className="flex-1 pb-4 border-l border-slate-800 pl-4 relative">
                  <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                  <p className="text-blue-400 font-bold mb-1 uppercase tracking-tighter">[TELA] {s.visual_cue}</p>
                  <p className="text-slate-300 leading-relaxed italic">"{s.audio_narration}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-4">
           <div className="aspect-[9/16] bg-black rounded-3xl border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
              <p className="text-slate-800 font-mono text-[10px] uppercase tracking-[0.5em] text-center px-8">Preview Mobile 9:16</p>
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
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('zune_v25');
      if (saved) setScripts(JSON.parse(saved));
      
      const ok = await validateConnection();
      setIsValid(ok);
      if (ok) getTrends().then(setTrends);
    };
    init();
  }, []);

  const handleGenerate = async () => {
    if (!idea || !isValid) return;
    setLoading(true);
    try {
      const res = await generateAIContent(idea, '30s', 'Meio');
      const newScripts = [res, ...scripts];
      setScripts(newScripts);
      localStorage.setItem('zune_v25', JSON.stringify(newScripts));
      setIdea('');
    } catch (e) {
      alert("Erro na matriz Zunetech.");
    } finally {
      setLoading(false);
    }
  };

  if (isValid === false) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Erro de Autenticação</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Nenhuma chave de API válida detectada. Configure o <strong>process.env.API_KEY</strong> no seu ambiente de hospedagem para habilitar o Social GOD.
          </p>
          <button onClick={() => window.location.reload()} className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
            <RefreshCw size={18}/> Tentar Reconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-900 p-8 flex flex-col gap-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-emerald-500 fill-emerald-500" size={24}/>
            <h1 className="text-2xl font-black tracking-tighter text-white">ZUNETECH</h1>
          </div>
          <p className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase">Social Intelligence</p>
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
            Status: Conectado <br/>
            Matriz: Operacional
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        {tab === 'WAR' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">War Room</h2>
              <p className="text-slate-500 font-medium">Comando central para criação de conteúdo de alta retenção.</p>
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
                      placeholder="Ex: Como limpar o WhatsApp sem apagar nada"
                      className="flex-1 bg-black/50 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !idea || !isValid}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 px-10 py-5 rounded-2xl text-black font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20}/> : "Gerar Roteiro"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2 tracking-widest">
                    <Flame size={14}/> Radar de Tendências (Brasil)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trends.length > 0 ? trends.map((t, i) => (
                      <button key={i} onClick={() => setIdea(t.title)} className="text-left p-5 rounded-2xl bg-black/30 border border-slate-800 hover:border-orange-500/30 transition-all group">
                        <p className="text-xs font-bold text-slate-300 group-hover:text-white">{t.title}</p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">{t.reason}</p>
                      </button>
                    )) : (
                      <div className="col-span-full py-6 text-center text-slate-700 font-mono text-[10px] uppercase animate-pulse">
                        Escaneando rede...
                      </div>
                    )}
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
                <p className="text-slate-500 font-medium">Repositório de inteligência estratégica acumulada.</p>
              </div>
              <button className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                <FileSpreadsheet size={16}/> Exportar Lista
              </button>
            </header>
            
            <div className="space-y-4">
              {scripts.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-900 rounded-[3rem]">
                  <p className="text-slate-800 font-mono text-xs uppercase tracking-[0.5em]">Matriz de Memória Vazia</p>
                </div>
              ) : scripts.map(s => <ScriptCard key={s.id} script={s} />)}
            </div>
          </div>
        )}

        {tab === 'BRN' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">The Brain</h2>
              <p className="text-slate-500 font-medium">Análise da persona e diretrizes do Social GOD.</p>
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
