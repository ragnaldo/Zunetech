import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, 
  History, 
  Scan, 
  BrainCircuit, 
  Send, 
  Loader2, 
  Save, 
  Upload, 
  Terminal, 
  ChevronRight,
  Database,
  Video,
  Download,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { AppTab, ScriptContent, PersonaProfile, VideoDuration, CtaPlacement, TrendingTopic } from './types';
import { INITIAL_PERSONA } from './constants';
import * as GeminiService from './services/geminiService';
import ScriptCard from './components/ScriptCard';

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GENERATOR);
  const [persona, setPersona] = useState<PersonaProfile>(INITIAL_PERSONA);
  const [scripts, setScripts] = useState<ScriptContent[]>([]);
  
  // Generator State
  const [ideaInput, setIdeaInput] = useState('');
  const [duration, setDuration] = useState<VideoDuration>('30s');
  const [ctaPlacement, setCtaPlacement] = useState<CtaPlacement>('Meio');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentScript, setCurrentScript] = useState<ScriptContent | null>(null);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Analysis State
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved state
  useEffect(() => {
    const savedScripts = localStorage.getItem('zunetech_scripts');
    const savedPersona = localStorage.getItem('zunetech_persona');
    if (savedScripts) setScripts(JSON.parse(savedScripts));
    if (savedPersona) setPersona(JSON.parse(savedPersona));
    
    // Fetch trends on load
    loadTrends();
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('zunetech_scripts', JSON.stringify(scripts));
  }, [scripts]);

  useEffect(() => {
    localStorage.setItem('zunetech_persona', JSON.stringify(persona));
  }, [persona]);

  const loadTrends = async () => {
    setLoadingTrends(true);
    try {
        const trends = await GeminiService.fetchTrendingTopics();
        setTrendingTopics(trends);
    } catch(e) {
        console.error(e);
    } finally {
        setLoadingTrends(false);
    }
  };

  // Handlers
  const handleGenerateScript = async () => {
    if (!ideaInput.trim()) return;
    setIsGenerating(true);
    setCurrentScript(null);

    try {
      const script = await GeminiService.generateScriptFromIdea(ideaInput, persona, duration, ctaPlacement);
      setCurrentScript(script);
      setScripts(prev => [script, ...prev]);
      
      const updatedPersona = { ...persona };
      updatedPersona.context_memory.content_log_scripts.unshift({
        id: script.id,
        title: script.title,
        status: "Scripted"
      });
      setPersona(updatedPersona);
    } catch (error) {
      alert("Social GOD diz: Falha ao gerar roteiro. Verifique o console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalysisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalysisFile(e.target.files[0]);
      setAnalysisResult('');
    }
  };

  const handleAnalyze = async () => {
    if (!analysisFile) return;
    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const result = await GeminiService.analyzeMediaContent(
          base64String, 
          analysisFile.type, 
          persona
        );
        setAnalysisResult(result);
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(analysisFile);
    } catch (error) {
      alert("Análise falhou.");
      setIsAnalyzing(false);
    }
  };

  const updateScript = (updated: ScriptContent) => {
    setCurrentScript(updated);
    setScripts(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const resetBrain = () => {
    if(confirm("Resetar o Cérebro para o padrão de fábrica? Isso não pode ser desfeito.")) {
      setPersona(INITIAL_PERSONA);
    }
  };

  const downloadHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scripts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "historico_zunetech.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  const downloadCSV = () => {
      const headers = ["ID", "Título", "Tópico", "Duração", "CTA", "Data", "Legenda"];
      const rows = scripts.map(s => [
          s.id, s.title, s.topic, s.duration, s.cta_placement, s.timestamp, `"${s.caption_seo.replace(/"/g, '""')}"`
      ]);
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", "zunetech_planilha_automatica.csv");
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">ZUNETECH</h1>
          <p className="text-xs text-slate-500 tracking-widest mt-1">DOMINATION SYSTEM v2.2</p>
        </div>

        <nav className="space-y-2 flex-1">
          <NavButton 
            active={activeTab === AppTab.GENERATOR} 
            onClick={() => setActiveTab(AppTab.GENERATOR)}
            icon={<Layout size={18} />} 
            label="War Room" 
          />
          <NavButton 
            active={activeTab === AppTab.HISTORY} 
            onClick={() => setActiveTab(AppTab.HISTORY)}
            icon={<History size={18} />} 
            label="Arquivos" 
          />
          <NavButton 
            active={activeTab === AppTab.ANALYSIS} 
            onClick={() => setActiveTab(AppTab.ANALYSIS)}
            icon={<Scan size={18} />} 
            label="Spy Lab" 
          />
          <NavButton 
            active={activeTab === AppTab.BRAIN} 
            onClick={() => setActiveTab(AppTab.BRAIN)}
            icon={<BrainCircuit size={18} />} 
            label="Cérebro" 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Social GOD Online
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 relative">
        
        {/* TAB: GENERATOR */}
        {activeTab === AppTab.GENERATOR && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">War Room <span className="text-slate-500 text-lg font-normal">/ Nova Operação</span></h2>
              <p className="text-slate-400">Emita ordens de batalha. Crie conteúdo que domina.</p>
            </header>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mb-10">
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração</label>
                      <select 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value as VideoDuration)}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                      >
                          <option value="10s">10 Segundos (Short/Reel Rápido)</option>
                          <option value="30s">30 Segundos (Padrão)</option>
                          <option value="60s">60 Segundos (Tutorial)</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Posição do CTA</label>
                      <select 
                        value={ctaPlacement}
                        onChange={(e) => setCtaPlacement(e.target.value as CtaPlacement)}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-green-500 outline-none"
                      >
                          <option value="Inicio">Início (Agressivo)</option>
                          <option value="Meio">Meio (Retenção)</option>
                          <option value="Fim">Fim (Clássico)</option>
                      </select>
                  </div>
              </div>

              <label className="block text-sm font-bold text-green-400 uppercase tracking-wider mb-3">
                Objetivo / Tópico
              </label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateScript()}
                  placeholder="ex: Menu secreto do WhatsApp, Hack de bateria Samsung..."
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                />
                <button 
                  onClick={handleGenerateScript}
                  disabled={isGenerating || !ideaInput}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"
                >
                  {isGenerating ? <Loader2 className="animate-spin"/> : <Send size={18}/>}
                  EXECUTAR
                </button>
              </div>

              {/* Trending Suggestions */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
                     <Flame size={14}/> Tópicos em Alta (Live Search)
                     {loadingTrends && <Loader2 size={12} className="animate-spin text-slate-500"/>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {trendingTopics.map((trend, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setIdeaInput(trend.title)}
                            className="text-left bg-slate-900/50 hover:bg-slate-700 p-3 rounded border border-slate-700 hover:border-orange-500/50 transition-all group"
                          >
                              <div className="text-sm font-bold text-slate-200 group-hover:text-white">{trend.title}</div>
                              <div className="text-xs text-slate-500">{trend.reason}</div>
                          </button>
                      ))}
                  </div>
              </div>
            </div>

            {currentScript && (
              <ScriptCard script={currentScript} onUpdate={updateScript} />
            )}
          </div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === AppTab.HISTORY && (
          <div className="max-w-5xl mx-auto">
             <header className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Arquivos</h2>
                <p className="text-slate-400">Histórico tático de operações.</p>
              </div>
              <div className="flex gap-2">
                 <button 
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-800 rounded transition-colors text-sm"
                 >
                    <FileSpreadsheet size={16}/> Baixar Planilha
                 </button>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6">
              {scripts.length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                  <Database size={48} className="mx-auto mb-4 opacity-50"/>
                  <p>Nenhuma operação encontrada.</p>
                </div>
              ) : (
                scripts.map(script => (
                  <ScriptCard key={script.id} script={script} onUpdate={updateScript} />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: ANALYSIS */}
        {activeTab === AppTab.ANALYSIS && (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Spy Lab</h2>
              <p className="text-slate-400">Analise ativos criativos para potencial viral.</p>
            </header>

            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-700 bg-slate-800/50">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAnalysisUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-slate-700/50 transition-all group"
                >
                  {analysisFile ? (
                    <div className="text-center">
                      <div className="bg-green-500/20 text-green-400 p-3 rounded-full inline-block mb-3">
                        {analysisFile.type.startsWith('image') ? <ImageIcon size={24}/> : <Video size={24}/>}
                      </div>
                      <p className="text-white font-medium">{analysisFile.name}</p>
                      <p className="text-slate-500 text-xs mt-1">{(analysisFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} className="text-slate-400 group-hover:text-green-400 mb-4 transition-colors"/>
                      <p className="text-slate-300 font-medium">Upload Screenshot ou Frame de Vídeo</p>
                      <p className="text-slate-500 text-sm mt-1">Suporta PNG, JPG, MP4</p>
                    </>
                  )}
                </div>

                {analysisFile && (
                  <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin"/> : <Scan size={18}/>}
                    ANALISAR COM GEMINI PRO
                  </button>
                )}
              </div>

              <div className="flex-1 p-6 bg-slate-950 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-slate-400 font-mono text-xs uppercase tracking-wider">
                  <Terminal size={14}/>
                  <span>Log de Saída da Análise</span>
                </div>
                {analysisResult ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                      {analysisResult}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-700 font-mono text-sm">
                    Aguardando entrada de dados...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: BRAIN (SETTINGS) */}
        {activeTab === AppTab.BRAIN && (
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Cérebro</h2>
                <p className="text-slate-400">Configure as instruções da persona e memória de contexto.</p>
              </div>
              <div className="flex gap-4">
                  <button onClick={downloadHistory} className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300">
                      <Download size={14}/> Backup Completo (JSON)
                  </button>
                  <button onClick={resetBrain} className="text-xs text-red-400 hover:text-red-300 underline">Resetar Padrão</button>
              </div>
            </header>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-green-400">
                <Database size={20} />
                <h3 className="font-bold">Núcleo de Memória JSON</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Este JSON define a "Alma" do Social GOD. Edite com cuidado.
              </p>
              <textarea 
                value={JSON.stringify(persona, null, 2)}
                onChange={(e) => {
                  try {
                    setPersona(JSON.parse(e.target.value));
                  } catch(e) {
                    // Allow typing invalid json momentarily
                  }
                }}
                className="w-full h-96 bg-slate-950 text-green-500 font-mono text-xs p-4 rounded border border-slate-800 focus:border-green-500 outline-none"
              />
              <div className="mt-4 flex justify-end">
                <div className="text-xs text-slate-500 flex items-center gap-2">
                   <Save size={14}/> Salvo Automaticamente no LocalStorage
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Helper Components
const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({
  active, onClick, icon, label
}) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-gradient-to-r from-green-900/40 to-slate-800 border-l-4 border-green-500 text-white shadow-lg' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
    }`}
  >
    <span className={`${active ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
    <span className="font-medium text-sm">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto text-green-500/50"/>}
  </button>
);

const ImageIcon = ({size, className}: {size?:number, className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);

export default App;