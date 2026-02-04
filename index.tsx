import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Layout, History, BrainCircuit, Send, Loader2, Download, 
  Flame, FileSpreadsheet, Save, ShieldAlert, Wifi, 
  Zap, Copy, Check, Share2, Monitor, Mic, Clock, ChevronRight
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & CONSTANTS ---
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
  cta_placement: string;
  script_scenes: ScriptScene[];
  caption_seo: string;
  timestamp: string;
  duration: string;
  generated_image_url?: string;
}

const INITIAL_PERSONA = {
  project: "Zunetech - Social GOD",
  system_instruction: `Você é o 'Social GOD', estrategista de elite para o perfil Zunetech.
  FOCO: Tecnologia, Android, WhatsApp e Hacks para brasileiros classe C/D.
  TOM: Autoritário, direto, focado em 'vantagem' e 'segredos'.
  REGRAS: Nunca 'Oi gente'. Comece com o problema ou promessa agressiva.`
};

// --- SERVICES ---
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const generateScript = async (idea: string, duration: VideoDuration, cta: CtaPlacement): Promise<ScriptContent> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const prompt = `Gere um roteiro viral Zunetech sobre: ${idea}. 
  Duração: ${duration}. CTA no ${cta}.
  Retorne um JSON seguindo estritamente este esquema:
  {
    "title": "título curto",
    "hook_visual_desc": "descrição da cena inicial de impacto",
    "script_scenes": [{"time_segment": "0-3s", "visual_cue": "...", "audio_narration": "..."}],
    "caption_seo": "legenda com hashtags"
  }`;

  const response = await ai.models.generateContent({
    model,
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
    cta_placement: cta,
    timestamp: new Date().toISOString()
  };
};

const fetchTrends = async () => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Quais são as 4 maiores dores ou curiosidades atuais de usuários de Android e WhatsApp no Brasil hoje? Retorne apenas um array JSON: [{'title': '...', 'reason': '...'}]",
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [
      { title: "Bateria Descarregando Rápido", reason: "Dor universal Android" },
      { title: "WhatsApp Travando no Moto G", reason: "Problema comum classe C" },
      { title: "Como ver mensagem apagada", reason: "Curiosidade alta" },
      { title: "Memória Cheia: O Vilão", reason: "Falta de espaço" }
    ];
  }
};

// --- COMPONENTS ---
const NavBtn = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full group ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'}`}>
    <div className={`${active ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'}`}>{icon}</div>
    <span className="text-sm font-bold tracking-tight uppercase">{label}</span>
  </button>
);

const ScriptCard = ({ script }: { script: ScriptContent }) => {
  const [copied, setCopied] = useState(false);
  
  const copyCaption = () => {
    navigator.clipboard.writeText(script.caption_seo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-6 hover:border-emerald-500/30 transition-all">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
        <div>
          <h3 className="text-emerald-400 font-mono font-bold uppercase tracking-wider">{script.title}</h3>
          <div className="flex gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase">
            <span className="flex items-center gap-1"><Clock size={12}/> {script.duration}</span>
            <span className="flex items-center gap-1"><Monitor size={12}/> {script.cta_placement}</span>
          </div>
        </div>
        <button onClick={copyCaption} className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
          {copied ? <Check size={18}/> : <Share2 size={18}/>}
        </button>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-black/20 p-4 rounded-xl border-l-2 border-emerald-500">
            <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Hook Visual (O Gancho)</p>
            <p className="text-sm italic text-slate-300">"{script.hook_visual_desc}"</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 font-black uppercase">Sequence (Roteiro)</p>
            {script.script_scenes.map((s, i) => (
              <div key={i} className="flex gap-4 text-xs group">
                <span className="text-slate-600 font-mono w-10 shrink-0">{s.time_segment}</span>
                <div className="flex-1 pb-4 border-l border-slate-800 pl-4 relative">
                  <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                  <p className="text-blue-400 font-bold mb-1">[CENA] {s.visual_cue}</p>
                  <p className="text-slate-300">"{s.audio_narration}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-4">
           <div className="aspect-[9/16] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <p className="text-slate-700 font-mono text-xs uppercase tracking-widest text-center px-8">Visualização Proporcional 9:16</p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- APP MAIN ---
const App = () => {
  const [tab, setTab] = useState('WAR');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<ScriptContent[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [apiKeyValid, setApiKeyValid] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('zune_v25');
    if (saved) setScripts(JSON.parse(saved));
    
    if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
      setApiKeyValid(false);
    }
    
    fetchTrends().then(setTrends);
  }, []);

  useEffect(() => {
    localStorage.setItem('zune_v25', JSON.stringify(scripts));
  }, [scripts]);

  const handleGenerate = async () => {
    if (!idea || !apiKeyValid) return;
    setLoading(true);
    try {
      const res = await generateScript(idea, '30s', 'Meio');
      setScripts(prev => [res, ...prev]);
      setIdea('');
    } catch (e) {
      alert("Erro na conexão com o Social GOD.");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = "Data,Título,Tópico\n";
    const body = scripts.map(s => `${new Date(s.timestamp).toLocaleDateString()},"${s.title}","${s.topic}"`).join("\n");
    const blob = new Blob([headers + body], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zunetech_scripts_${new Date().getTime()}.csv`;
    a.click();
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-950 border-r border-slate-800 p-8 flex flex-col gap-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-emerald-500 fill-emerald-500" size={24}/>
            <h1 className="text-2xl font-black tracking-tighter text-white">ZUNETECH</h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Social Intelligence HQ</p>
        </div>

        <nav className="flex-1 space-y-2">
          <NavBtn active={tab === 'WAR'} label="War Room" icon={<Layout size={20}/>} onClick={() => setTab('WAR')} />
          <NavBtn active={tab === 'ARC'} label="Arquivos" icon={<History size={20}/>} onClick={() => setTab('ARC')} />
          <NavBtn active={tab === 'BRN'} label="Brain" icon={<BrainCircuit size={20}/>} onClick={() => setTab('BRN')} />
        </nav>

        <div className={`p-4 rounded-xl border ${apiKeyValid ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'} flex items-center gap-3`}>
          {apiKeyValid ? <Wifi size={18}/> : <ShieldAlert size={18}/>}
          <div className="text-[10px] font-bold uppercase leading-tight">
            {apiKeyValid ? "Sistema Ativo" : "API Offline"} <br/>
            <span className="opacity-60">Status: Operacional</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        {tab === 'WAR' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2">WAR ROOM</h2>
              <p className="text-slate-500 font-medium">Comando central para criação de conteúdo de alta retenção.</p>
            </header>

            {/* Input Station */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl mb-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={120}/></div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nova Estratégia</label>
                  <div className="flex gap-3">
                    <input 
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      placeholder="Tema do vídeo (ex: Bug do WhatsApp que para o celular)"
                      className="flex-1 bg-black border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700"
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !idea || !apiKeyValid}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 px-8 py-4 rounded-2xl text-black font-black uppercase tracking-tighter transition-all flex items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin"/> : "Gerar"}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2">
                    <Flame size={12}/> Sugestões de Dores Atuais
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trends.map((t, i) => (
                      <button 
                        key={i} 
                        onClick={() => setIdea(t.title)}
                        className="text-left p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-orange-500/30 transition-all group"
                      >
                        <p className="text-xs font-bold text-slate-300 group-hover:text-white">{t.title}</p>
                        <p className="text-[10px] text-slate-600 mt-1">{t.reason}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Script */}
            {scripts.length > 0 && <ScriptCard script={scripts[0]} />}
          </div>
        )}

        {tab === 'ARC' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12 flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">ARQUIVOS</h2>
                <p className="text-slate-500 font-medium">Repositório de inteligência estratégica.</p>
              </div>
              <button 
                onClick={exportCSV}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <FileSpreadsheet size={16}/> Exportar Sheets
              </button>
            </header>
            
            <div className="space-y-6">
              {scripts.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-600 font-mono italic">Sem dados registrados.</p>
                </div>
              ) : scripts.map(s => <ScriptCard key={s.id} script={s} />)}
            </div>
          </div>
        )}

        {tab === 'BRN' && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-white mb-2">BRAIN</h2>
              <p className="text-slate-500 font-medium">Matriz de comportamento e persona do Social GOD.</p>
            </header>
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <pre className="text-[10px] font-mono text-emerald-500/70 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(INITIAL_PERSONA, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Renderização Final
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
