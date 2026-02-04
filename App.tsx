
import React, { useState, useEffect } from 'react';
import { Layout, History, BrainCircuit, Send, Loader2, ShieldAlert, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
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
  
  // Estados de Validação
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('zunetech_scripts');
    if (saved) setScripts(JSON.parse(saved));
    
    performSecurityCheck();
  }, []);

  const performSecurityCheck = async () => {
    setIsCheckingKey(true);
    const isValid = await GeminiService.validateApiKey();
    setIsKeyValid(isValid);
    setIsCheckingKey(false);
    
    if (isValid) {
      loadTrends();
    }
  };

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
    if (!ideaInput.trim() || !isKeyValid) return;
    setIsGenerating(true);
    try {
      const script = await GeminiService.generateScriptFromIdea(ideaInput, persona, duration, ctaPlacement);
      const updatedScripts = [script, ...scripts];
      setScripts(updatedScripts);
      setIdeaInput('');
      localStorage.setItem('zunetech_scripts', JSON.stringify(updatedScripts));
    } catch (e) {
      alert("Erro na conexão com o Social GOD. Chave expirada ou limite atingido.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- SUBCOMPONENT: MODAL DE BLOQUEIO ---
  const ValidationModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] text-center animate-in fade-in zoom-in duration-300">
        <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-6 border border-red-500/20">
          <ShieldAlert size={48} className="text-red-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Conexão Bloqueada</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          O <strong>Social GOD</strong> não conseguiu estabelecer uma conexão segura com o cérebro da inteligência artificial. 
          Certifique-se de que a sua <strong>API_KEY</strong> está configurada corretamente no ambiente Zunetech.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-red-500 hover:bg-red-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/20"
        >
          <RefreshCw size={18} />
          REAUTENTICAR SISTEMA
        </button>
        <p className="mt-6 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
          Erro Code: AUTH_INVALID_TOKEN_01
        </p>
      </div>
    </div>
  );

  if (isCheckingKey) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-green-500" size={48} />
        <p className="text-xs font-mono text-slate-500 animate-pulse uppercase tracking-[0.3em]">Validando Protocolos de Segurança...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row font-sans">
      {/* Modal de bloqueio se a chave for inválida */}
      {isKeyValid === false && <ValidationModal />}

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
          <div className={`flex items-center gap-2 text-[10px] uppercase font-bold ${isKeyValid ? 'text-green-500' : 'text-red-500'}`}>
            {isKeyValid ? <Wifi size={12}/> : <ShieldAlert size={12}/>}
            {isKeyValid ? "Sistema Online" : "Chave de API Inválida"}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === AppTab.GENERATOR && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">War Room</h2>
              <p className="text-slate-400 text-sm">Crie conteúdo que domina a atenção em segundos.</p>
            </header>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Duração</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value as VideoDuration)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none focus:border-green-500">
                    <option value="10s">10s (Viral Rápido)</option>
                    <option value="30s">30s (Padrão)</option>
                    <option value="60s">60s (Tutorial)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Chamada (CTA)</label>
                  <select value={ctaPlacement} onChange={(e) => setCtaPlacement(e.target.value as CtaPlacement)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded text-sm outline-none focus:border-green-500">
                    <option value="Inicio">No Início</option>
                    <option value="Meio">No Meio</option>
                    <option value="Fim">No Final</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  value={ideaInput} 
                  onChange={(e) => setIdeaInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                  placeholder="Tópico (ex: Segredo da bateria do Samsung...)" 
                  className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-green-500 transition-colors"
                />
                <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !ideaInput || !isKeyValid} 
                  className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 px-6 py-3 rounded-lg font-black flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isGenerating ? <Loader2 className="animate-spin"/> : <Send size={18}/>} GERAR
                </button>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1 mb-3">
                  <AlertTriangle size={12}/> Sugestões do Social GOD (Tendências)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {loadingTrends ? (
                    <div className="col-span-full py-4 text-center text-xs text-slate-600 animate-pulse font-mono uppercase">Escaneando Redes Sociais...</div>
                  ) : trends.map((t, i) => (
                    <button key={i} onClick={() => setIdeaInput(t.title)} className="text-left p-3 bg-slate-900/40 border border-slate-700 hover:border-orange-500/50 rounded text-xs transition-all group">
                      <div className="font-bold text-slate-100 group-hover:text-orange-400 uppercase tracking-tighter">{t.title}</div>
                      <div className="text-slate-500 mt-1">{t.reason}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {scripts.slice(0, 1).map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => prev.map(o => o.id === upd.id ? upd : o))}/>)}
          </div>
        )}

        {activeTab === AppTab.HISTORY && (
          <div className="max-w-4xl mx-auto py-4">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Arquivos</h2>
              <p className="text-slate-400 text-sm">Repositório de inteligência estratégica acumulada.</p>
            </header>
             <div className="grid grid-cols-1 gap-4">
                {scripts.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                    <p className="text-slate-600 font-mono italic">Sem dados registrados na memória local.</p>
                  </div>
                ) : (
                  scripts.map(s => <ScriptCard key={s.id} script={s} onUpdate={(upd) => setScripts(prev => prev.map(o => o.id === upd.id ? upd : o))}/>)
                )}
             </div>
          </div>
        )}

        {activeTab === AppTab.BRAIN && (
          <div className="max-w-4xl mx-auto">
             <header className="mb-8">
              <h2 className="text-3xl font-bold text-white uppercase tracking-tighter">Memória Central</h2>
              <p className="text-slate-400 text-sm">Matriz de comportamento e diretrizes da persona.</p>
            </header>
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">
               <div className="flex items-center gap-2 mb-4 text-emerald-500 font-mono text-xs uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Dump de Sistema Ativo
               </div>
               <textarea value={JSON.stringify(persona, null, 2)} className="w-full h-[500px] bg-slate-950 font-mono text-[10px] text-green-500/80 p-6 rounded-2xl outline-none border border-slate-800 custom-scrollbar" readOnly />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavBtn: React.FC<{active:boolean, label:string, icon:any, onClick:()=>void}> = ({active, label, icon, onClick}) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full border ${active ? 'bg-green-600/10 text-green-400 border-green-500/30' : 'text-slate-500 border-transparent hover:text-white hover:bg-slate-900'}`}>
    {icon} <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
