import React, { useState } from 'react';
import { ScriptContent } from '../types';
import { Copy, Image as ImageIcon, Video, FileText, Check, Share2, Clock, Megaphone } from 'lucide-react';
import { generateHookImage } from '../services/geminiService';

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
      alert("Falha ao gerar imagem. Tente novamente.");
    } finally {
      setLoadingImg(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const exportForNotion = () => {
    let scenesText = "";
    if (script.script_scenes) {
        scenesText = script.script_scenes.map(s => `| ${s.time_segment} | ${s.visual_cue} | ${s.audio_narration} |`).join('\n');
    }

    const content = `
# ${script.title}
**Tópico:** ${script.topic}
**Data:** ${new Date(script.timestamp).toLocaleDateString()}
**Duração:** ${script.duration || 'N/A'}

## 🎥 Gancho Visual
**Texto Tela:** ${script.video_start_text}
**Visual:** ${script.hook_visual_desc}
**Prompt Veo:** ${script.veo_prompt}

## ⚡ CTA (${script.cta_placement})
${script.cta_text}

## 📝 Roteiro (Tabela)
| Tempo | Visual (Tela) | Áudio (Locução) |
| :--- | :--- | :--- |
${scenesText}

## 🔚 Encerramento
${script.outro}

## 🏷️ Metadados
**Legenda:** ${script.caption_seo}
**Hashtags:** ${script.hashtags.join(' ')}
    `;
    copyToClipboard(content, 'Notion Export');
  };

  const exportForSheets = () => {
    // CSV format for row
    const row = [
      script.id,
      script.title,
      script.topic,
      "Scripted",
      new Date(script.timestamp).toLocaleDateString(),
      script.hook_visual_desc,
      script.duration
    ].join('\t');
    copyToClipboard(row, 'Linha Sheets');
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-slate-700 pb-4 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-green-400 font-mono tracking-tight">{script.title.toUpperCase()}</h2>
          <div className="flex gap-4 mt-2 text-xs text-slate-400">
             <span className="flex items-center gap-1"><Clock size={12}/> {script.duration || '30s'}</span>
             <span className="flex items-center gap-1"><Megaphone size={12}/> CTA: {script.cta_placement}</span>
             <span>{new Date(script.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button 
            onClick={exportForNotion}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors"
          >
            {copiedSection === 'Notion Export' ? <Check size={14} className="text-green-400"/> : <FileText size={14}/>}
            Copiar Notion
          </button>
          <button 
            onClick={exportForSheets}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded text-xs transition-colors border border-green-800"
          >
            {copiedSection === 'Linha Sheets' ? <Check size={14}/> : <Share2 size={14}/>}
            Copiar p/ Sheets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Script Structure */}
        <div className="space-y-6">
          
          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-yellow-500 relative group">
             <button onClick={() => copyToClipboard(script.video_start_text, 'intro')} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"><Copy size={12}/></button>
            <h3 className="text-yellow-500 text-xs font-bold uppercase mb-2 tracking-wider">01. Texto na Tela (Headline)</h3>
            <p className="text-lg font-bold text-white">"{script.video_start_text}"</p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-500 relative group">
            <h3 className="text-purple-500 text-xs font-bold uppercase mb-2 tracking-wider">02. O Gancho (0-3s)</h3>
            <p className="text-slate-300 text-sm mb-2"><span className="font-bold text-purple-300">Visual:</span> {script.hook_visual_desc}</p>
            <p className="text-slate-300 text-sm mb-4"><span className="font-bold text-purple-300">Prompt Veo:</span> {script.veo_prompt}</p>
            <p className="text-slate-400 text-xs italic border-t border-slate-700 pt-2">Opção B: {script.alternative_hook}</p>
            
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleGenerateImage}
                disabled={loadingImg}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition-all disabled:opacity-50"
              >
                {loadingImg ? "Gerando..." : <><ImageIcon size={14}/> Gerar Frame (Gancho)</>}
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-blue-500 relative group">
            <button onClick={() => copyToClipboard(script.cta_text, 'cta')} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"><Copy size={12}/></button>
            <h3 className="text-blue-500 text-xs font-bold uppercase mb-2 tracking-wider">03. Chamada para Ação ({script.cta_placement})</h3>
            <p className="text-white italic">"{script.cta_text}"</p>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-green-500 relative group overflow-x-auto">
            <button onClick={() => copyToClipboard(script.script_scenes?.map(s => `${s.visual_cue} | ${s.audio_narration}`).join('\n') || script.main_content, 'body')} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"><Copy size={12}/></button>
            <h3 className="text-green-500 text-xs font-bold uppercase mb-4 tracking-wider">04. Roteiro Detalhado</h3>
            
            {script.script_scenes ? (
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-500 uppercase bg-slate-800">
                  <tr>
                    <th className="px-2 py-1">Tempo</th>
                    <th className="px-2 py-1">Visual (Tela)</th>
                    <th className="px-2 py-1">Áudio (Locução)</th>
                  </tr>
                </thead>
                <tbody>
                  {script.script_scenes.map((scene, idx) => (
                    <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                      <td className="px-2 py-2 font-mono text-xs text-slate-500 whitespace-nowrap">{scene.time_segment}</td>
                      <td className="px-2 py-2 text-blue-300">{scene.visual_cue}</td>
                      <td className="px-2 py-2 text-white italic">"{scene.audio_narration}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-300 whitespace-pre-line leading-relaxed text-sm">{script.main_content}</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Encerramento</h4>
              <p className="text-slate-300 text-sm">{script.outro}</p>
            </div>
          </div>

        </div>

        {/* Right Column: Visuals & Metadata */}
        <div className="space-y-6">
          {script.generated_image_url ? (
            <div className="aspect-[9/16] w-full bg-black rounded-lg overflow-hidden border border-slate-600 relative group">
              <img src={script.generated_image_url} alt="Hook" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-xs text-center text-white">
                Frame Gerado por IA
              </div>
            </div>
          ) : (
            <div className="aspect-[9/16] w-full bg-slate-900 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <ImageIcon size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Gere o frame do gancho para visualizar o estilo.</p>
            </div>
          )}

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
             <h3 className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">SEO & Legenda</h3>
             <div className="bg-slate-950 p-3 rounded text-sm text-slate-300 font-mono text-xs whitespace-pre-wrap">
                {script.caption_seo}
                <br/><br/>
                <span className="text-blue-400">{script.hashtags.map(t => `#${t}`).join(' ')}</span>
             </div>
             <button 
                onClick={() => copyToClipboard(`${script.caption_seo}\n\n${script.hashtags.map(t => `#${t}`).join(' ')}`, 'caption')}
                className="mt-2 w-full py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
             >
               Copiar Legenda
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptCard;