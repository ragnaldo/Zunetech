import React, { useState } from 'react';
import { ScriptContent } from '../types.ts';
import { Copy, Image as ImageIcon, FileText, Check, Share2, Clock, Megaphone, Monitor, Mic } from 'lucide-react';
import { generateHookImage } from '../services/geminiService.ts';

interface ScriptCardProps {
  script: ScriptContent;
  onUpdate: (updatedScript: ScriptContent) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({ script, onUpdate }) => {
  const [loadingImg, setLoadingImg] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setLoadingImg(true);
    try {
      const base64 = await generateHookImage(script.hook_visual_desc);
      onUpdate({ ...script, generated_image_url: base64 });
    } catch (e) {
      alert("Erro ao gerar imagem.");
    } finally {
      setLoadingImg(false);
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-green-400 font-mono">{script.title.toUpperCase()}</h2>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
             <span className="flex items-center gap-1"><Clock size={12}/> {script.duration}</span>
             <span className="flex items-center gap-1"><Megaphone size={12}/> CTA: {script.cta_placement}</span>
             <span>{new Date(script.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => copy(JSON.stringify(script, null, 2), 'JSON')} className="flex-1 bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors">
            {copiedSection === 'JSON' ? <Check size={14} className="text-green-400"/> : <FileText size={14}/>} JSON
          </button>
          <button onClick={() => copy(script.caption_seo, 'SEO')} className="flex-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-800 px-3 py-2 rounded text-xs flex items-center justify-center gap-2 transition-colors">
            {copiedSection === 'SEO' ? <Check size={14}/> : <Share2 size={14}/>} Legenda
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-purple-400 text-xs font-bold uppercase mb-2">01. O Gancho Visual</h3>
            <p className="text-sm text-slate-300 mb-2"><strong>Visual:</strong> {script.hook_visual_desc}</p>
            <button onClick={handleGenerateImage} disabled={loadingImg} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all">
              {loadingImg ? "Gerando..." : <><ImageIcon size={14}/> Gerar Frame</>}
            </button>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-green-500 overflow-x-auto">
            <h3 className="text-green-400 text-xs font-bold uppercase mb-4">02. Roteiro Detalhado</h3>
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2 pr-2">Tempo</th>
                  <th className="py-2 pr-2 flex items-center gap-1"><Monitor size={12}/> Tela</th>
                  <th className="py-2 flex items-center gap-1"><Mic size={12}/> Locução</th>
                </tr>
              </thead>
              <tbody>
                {script.script_scenes?.map((s, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50">
                    <td className="py-3 pr-2 font-mono text-slate-500">{s.time_segment}</td>
                    <td className="py-3 pr-2 text-blue-300">{s.visual_cue}</td>
                    <td className="py-3 text-white italic">"{s.audio_narration}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="aspect-[9/16] bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center relative">
            {script.generated_image_url ? (
              <img src={script.generated_image_url} className="w-full h-full object-cover" alt="Gancho Gerado" />
            ) : (
              <div className="text-slate-600 text-center p-8">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-20"/>
                <p className="text-xs italic">Aguardando geração do frame...</p>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white uppercase font-bold">Preview 9:16</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;