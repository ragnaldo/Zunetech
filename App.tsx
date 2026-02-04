import React, { useState, useEffect } from 'react';
import { Layout, History, Scan, BrainCircuit, Send, Loader2, Download, Flame, FileSpreadsheet, Save, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('zunetech_scripts');
    if (saved) setScripts(JSON.parse(saved));
    loadTrends();
  }, []);

  useEffect(() => {
    localStorage.setItem('zunetech_scripts', JSON.stringify(scripts));
  }, [scripts]);

  const loadTrends = async () => {
    setLoadingTrends(true);
    try {
      const result = await GeminiService.fetchTrendingTopics();
      setTrends(result);
    } catch (e) {
      console.error("Erro ao carregar tendências");
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleGenerate = async () => {
    if (!ideaInput.trim()) return;
    setIsGenerating(true);
    try {
      const script = await GeminiService.generateScriptFromIdea(ideaInput, persona, duration, ctaPlacement);
      setScripts(prev => [script, ...prev]);
      setIdeaInput('');
    } catch (e) {
      alert("Falha na geração. Verifique sua conexão ou API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    const headers = "ID,Título,Tópico,Duração,CTA,Data\n";
    const rows = scripts.map(s => `${s.id},"${s.title}","${s.topic}",${s.duration},${s.cta_placement},${s.timestamp}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zunetech_planilha.csv";
    link.click();
  };

  const downloadJSON = () => {
    const data = JSON.stringify(scripts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zunetech_brain_backup.json";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row">
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
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === AppTab.GENERATOR && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white">War Room</h2>
              <p className="text-slate-400 text-sm">Estratégia viral para o público brasileiro.</p>
            </header>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select value={duration} onChange={(e) => setDuration(e.target.value as VideoDuration)} className="bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none">
                  <option value="10s">10 Segundos (Ultra Viral)</option>
                  <option value="30s">30 Segundos (Equilibrado)</option>
                  <option value="60s">60 Segundos (Explicativo)</option>
                </select>
                <select value={ctaPlacement} onChange={(e) => setCtaPlacement(e.target.value as CtaPlacement)} className="bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none">
                  <option value="Inicio">CTA no Início (Direto)</option>
                  <option value="Meio">CTA no Meio (Retenção)</option>
                  <option value="Fim">CTA no Fim (Tradicional)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input value={ideaInput} onChange={(e) => setIdeaInput(e.target.value)} placeholder="Digite o tema do vídeo (ex: Bug do Whats...)" className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-green-500 transition-colors"/>
                <button onClick={handleGenerate} disabled={isGenerating || !ideaInput} className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all">
                  {isGenerating ? <Loader2 className="animate-spin"/> : <Send size={18}/>} GERAR
                </button>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1 mb-2">
                  <Flame size={12}/> Sugestões de Dores & IA (Trending) {loadingTrends && "..."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trends.map((t, i) => (
                    <button key={i} onClick={() => setIdeaInput(t.title)} className="text-left p-3 bg-slate-900/40 border border-slate-700 hover:border-orange-500/50 rounded text-xs transition-all">
                      <div className="font-bold text-slate-100">{t.title}</div>
                      <div className="text-slate-500 mt-1">{t.reason}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {scripts.slice(0,1).map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => [upd, ...prev.slice(1)])}/>)}
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">Arquivos</h2>
              <button onClick={downloadCSV} className="bg-green-900/30 text-green-400 border border-green-800 px-4 py-2 rounded text-xs flex items-center gap-2 hover:bg-green-900/50 transition-colors">
                <FileSpreadsheet size={16}/> Exportar para Sheets
              </button>
            </header>
            {scripts.map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => prev.map(old => old.id === upd.id ? upd : old))}/>)}
          </div>
        )}

        {activeTab === AppTab.BRAIN && (
          <div className="max-w-4xl mx-auto">
             <header className="mb-8 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">O Cérebro</h2>
              <button onClick={downloadJSON} className="text-blue-400 text-xs flex items-center gap-2 hover:text-blue-300 transition-colors"><Download size={14}/> Backup da Alma (.json)</button>
            </header>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <textarea value={JSON.stringify(persona, null, 2)} className="w-full h-96 bg-slate-950 font-mono text-[10px] text-green-500 p-4 rounded outline-none border border-slate-800" readOnly />
               <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
                 <Save size={14}/> Dados sincronizados com o armazenamento local.
               </div>
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