import React, { useState, useEffect } from 'react';
import { Layout, History, Scan, BrainCircuit, Send, Loader2, Download, Flame, FileSpreadsheet, Save, ShieldAlert, Wifi } from 'lucide-react';
import { AppTab, ScriptContent, PersonaProfile, VideoDuration, CtaPlacement, TrendingTopic } from './types.ts';
import { INITIAL_PERSONA } from './constants.ts';
import * as GeminiService from './services/geminiService.ts';
import ScriptCard from './components/ScriptCard.tsx';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  const [persona, setPersona] = useState<PersonaProfile>(INITIAL_PERSONA);
  const [scripts, setScripts] = useState<ScriptContent[]>([]);
  const [ideaInput, setIdeaInput] = useState('');
  const [duration, setDuration] = useState<VideoDuration>('30s');
  const [ctaPlacement, setCtaPlacement] = useState<CtaPlacement>('Meio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('zunetech_scripts');
    if (saved) setScripts(JSON.parse(saved));
    
    // Verifica se a API está disponível
    if (!process.env.API_KEY || process.env.API_KEY === "undefined") {
      setHasApiKey(false);
    }
    
    loadTrends();
  }, []);

  const loadTrends = async () => {
    setLoadingTrends(true);
    try {
      const result = await GeminiService.fetchTrendingTopics();
      setTrends(result);
    } catch (e) {
      console.error("Falha ao buscar tendências");
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleGenerate = async () => {
    if (!ideaInput.trim() || !hasApiKey) return;
    setIsGenerating(true);
    try {
      const script = await GeminiService.generateScriptFromIdea(ideaInput, persona, duration, ctaPlacement);
      setScripts(prev => [script, ...prev]);
      setIdeaInput('');
      localStorage.setItem('zunetech_scripts', JSON.stringify([script, ...scripts]));
    } catch (e) {
      alert("Erro na conexão com o Social GOD. Verifique sua chave de API.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">ZUNETECH</h1>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Dominação Digital v2.5</p>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <NavBtn active={activeTab === AppTab.GENERATOR} label="War Room" icon={<Layout size={18}/>} onClick={() => setActiveTab(AppTab.GENERATOR)} />
          <NavBtn active={activeTab === AppTab.HISTORY} label="Arquivos" icon={<History size={18}/>} onClick={() => setActiveTab(AppTab.HISTORY)} />
          <NavBtn active={activeTab === AppTab.BRAIN} label="O Cérebro" icon={<BrainCircuit size={18}/>} onClick={() => setActiveTab(AppTab.BRAIN)} />
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-4">
          <div className={`flex items-center gap-2 text-[10px] uppercase font-bold ${hasApiKey ? 'text-green-500' : 'text-red-500'}`}>
            {hasApiKey ? <Wifi size={12}/> : <ShieldAlert size={12}/>}
            {hasApiKey ? "Sistema Online" : "Chave de API Ausente"}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {!hasApiKey && activeTab === AppTab.GENERATOR && (
          <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg mb-8 text-red-200 text-sm">
            <strong>Aviso de Segurança:</strong> Nenhuma chave de API detectada. Para gerar roteiros reais, o sistema precisa da API_KEY configurada no ambiente.
          </div>
        )}

        {activeTab === AppTab.GENERATOR && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white">War Room</h2>
              <p className="text-slate-400 text-sm">Crie conteúdo que domina a atenção em segundos.</p>
            </header>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duração</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value as VideoDuration)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none">
                    <option value="10s">10s (Viral Rápido)</option>
                    <option value="30s">30s (Padrão)</option>
                    <option value="60s">60s (Tutorial)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Chamada (CTA)</label>
                  <select value={ctaPlacement} onChange={(e) => setCtaPlacement(e.target.value as CtaPlacement)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none">
                    <option value="Inicio">No Início</option>
                    <option value="Meio">No Meio</option>
                    <option value="Fim">No Final</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input value={ideaInput} onChange={(e) => setIdeaInput(e.target.value)} placeholder="Tópico (ex: Segredo da bateria do Samsung...)" className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-green-500 transition-colors"/>
                <button onClick={handleGenerate} disabled={isGenerating || !ideaInput || !hasApiKey} className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all">
                  {isGenerating ? <Loader2 className="animate-spin"/> : <Send size={18}/>} GERAR
                </button>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1 mb-3">
                  <Flame size={12}/> Sugestões do Social GOD (Tendências)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trends.map((t, i) => (
                    <button key={i} onClick={() => setIdeaInput(t.title)} className="text-left p-3 bg-slate-900/40 border border-slate-700 hover:border-orange-500/50 rounded text-xs transition-all group">
                      <div className="font-bold text-slate-100 group-hover:text-orange-400">{t.title}</div>
                      <div className="text-slate-500 mt-1">{t.reason}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {scripts.slice(0, 1).map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => [upd, ...prev.slice(1)])}/>)}
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="max-w-4xl mx-auto text-center py-10">
             <h2 className="text-2xl font-bold mb-4">Arquivos de Inteligência</h2>
             <div className="grid grid-cols-1 gap-4 text-left">
                {scripts.length === 0 ? <p className="text-slate-500 italic">Nenhum roteiro gerado ainda.</p> : 
                  scripts.map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => prev.map(o => o.id === upd.id ? upd : o))}/>)}
             </div>
          </div>
        )}

        {activeTab === AppTab.BRAIN && (
          <div className="max-w-4xl mx-auto">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-white">Memória Central</h2>
              <p className="text-slate-400 text-sm">Configuração da alma do bot (Persona).</p>
            </header>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <textarea value={JSON.stringify(persona, null, 2)} className="w-full h-96 bg-slate-950 font-mono text-[10px] text-green-500 p-4 rounded outline-none border border-slate-800" readOnly />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavBtn: React.FC<{active:boolean, label:string, icon:any, onClick:()=>void}> = ({active, label, icon, onClick}) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full ${active ? 'bg-green-600/10 text-green-400 border-l-4 border-green-500' : 'text-slate-500 hover:text-white hover:bg-slate-900'}`}>
    {icon} <span className="text-sm font-medium">{label}</span>
  </button>
);

export default App;