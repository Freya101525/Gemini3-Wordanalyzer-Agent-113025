import React, { useState } from 'react';
import { generateSmartNote } from '../services/geminiService';
import { SmartNote as SmartNoteType } from '../types';
import { Brain, FileText, List, MessageCircle, Sparkles, Upload, Settings2, Code, Eye, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PROMPTS } from '../constants';

interface SmartNoteProps {
    text: string; // From combined text in App, used as default for Paste tab if needed
    primaryColor: string;
    locale: any;
    onError: (msg: string) => void;
}

const SmartNote: React.FC<SmartNoteProps> = ({ text, primaryColor, locale, onError }) => {
    // Input State
    const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
    const [inputText, setInputText] = useState(text || '');
    const [fileName, setFileName] = useState('');
    
    // Configuration State
    const [model, setModel] = useState('gemini-2.5-flash');
    const [maxTokens, setMaxTokens] = useState(12000);
    const [prompt, setPrompt] = useState(PROMPTS.smartNote);
    
    // Result State
    const [note, setNote] = useState<SmartNoteType | null>(null);
    const [rawJson, setRawJson] = useState(''); // For editing raw result
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'format' | 'entities' | 'graph' | 'questions' | 'raw'>('format');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            setInputText(content);
        };
        reader.readAsText(file);
    };

    const handleGenerate = async () => {
        if (!inputText.trim()) {
            onError("No text provided. Please paste text or upload a file.");
            return;
        }
        
        setLoading(true);
        try {
            const data = await generateSmartNote(inputText, prompt, model, maxTokens);
            setRawJson(JSON.stringify(data, null, 2));
            setNote({
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                originalText: inputText,
                formattedText: data.formattedText,
                entities: data.entities,
                mindGraph: data.mindGraph,
                keywords: data.keywords,
                questions: data.questions
            });
            setActiveTab('format');
        } catch (e: any) {
            onError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Update note structure when Raw JSON is edited
    const handleRawUpdate = () => {
        try {
            const data = JSON.parse(rawJson);
            setNote(prev => prev ? ({
                ...prev,
                formattedText: data.formattedText,
                entities: data.entities,
                mindGraph: data.mindGraph,
                keywords: data.keywords,
                questions: data.questions
            }) : null);
            setActiveTab('format'); // Switch to visual view to see changes
        } catch (e) {
            onError("Invalid JSON format. Please correct it before updating.");
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[600px]">
            
            {/* LEFT COLUMN: Input & Settings */}
            <div className="w-full xl:w-1/3 flex flex-col gap-6">
                
                {/* Input Panel */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button 
                            onClick={() => setInputMode('paste')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${inputMode === 'paste' ? 'bg-white dark:bg-gray-700 shadow text-current' : 'opacity-60'}`}
                        >
                            Paste Text
                        </button>
                        <button 
                            onClick={() => setInputMode('upload')}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${inputMode === 'upload' ? 'bg-white dark:bg-gray-700 shadow text-current' : 'opacity-60'}`}
                        >
                            Upload File
                        </button>
                    </div>

                    <div className="mb-4">
                        {inputMode === 'paste' ? (
                            <textarea 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-48 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                placeholder="Paste your text content here..."
                            />
                        ) : (
                            <div className="h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative">
                                <Upload className="mb-2 opacity-50" />
                                <span className="text-sm font-bold opacity-70">Click to Upload</span>
                                <span className="text-xs opacity-50 text-center">TXT, MD, CSV, JSON</span>
                                {fileName && <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{fileName}</div>}
                                <input 
                                    type="file" 
                                    accept=".txt,.md,.csv,.json"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Panel */}
                <div className="glass-panel p-6 rounded-2xl flex-1 flex flex-col">
                    <div className="flex items-center gap-2 font-bold mb-4 opacity-80">
                        <Settings2 size={18} /> Configuration
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold opacity-60 uppercase">Model</label>
                            <select 
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-sm"
                            >
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold opacity-60 uppercase flex justify-between">
                                Max Tokens <span>{maxTokens}</span>
                            </label>
                            <input 
                                type="range" min="1000" max="32000" step="1000"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(Number(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                                style={{ accentColor: primaryColor }}
                            />
                        </div>

                        <div className="space-y-1 flex-1 flex flex-col">
                            <label className="text-xs font-bold opacity-60 uppercase">Prompt Instruction</label>
                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full flex-1 min-h-[120px] p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-xs font-mono resize-none"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-6 w-full py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {loading ? <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent"/> : <Sparkles size={20} />}
                        {loading ? locale.analyzing : locale.transform}
                    </button>
                </div>
            </div>

            {/* RIGHT COLUMN: Results */}
            <div className="w-full xl:w-2/3 glass-panel p-6 rounded-2xl flex flex-col min-h-[600px]">
                {!note && !loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                        <Sparkles size={64} className="mb-4" />
                        <p className="text-lg font-medium">Ready to transform your content</p>
                        <p className="text-sm">Configure settings and click Transform to start</p>
                    </div>
                ) : (
                    <>
                        {/* Header & Keywords */}
                        <div className="mb-6">
                            {note?.keywords && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {note.keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/50 dark:bg-black/20 border" style={{ borderColor: primaryColor, color: primaryColor }}>
                                            #{kw}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Tabs */}
                            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar border-b border-gray-200 dark:border-gray-700">
                                {[
                                    { id: 'format', icon: FileText, label: locale.formatted },
                                    { id: 'entities', icon: List, label: locale.entities },
                                    { id: 'graph', icon: Brain, label: locale.mindgraph },
                                    { id: 'questions', icon: MessageCircle, label: locale.questions },
                                    { id: 'raw', icon: Code, label: "Edit Raw Result" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gray-100 dark:bg-gray-800 border-b-2' : 'opacity-60 hover:opacity-100'}`}
                                        style={{ borderColor: activeTab === tab.id ? primaryColor : 'transparent', color: activeTab === tab.id ? primaryColor : 'inherit' }}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto min-h-0 relative">
                            {loading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                                    <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}></div>
                                    <p className="font-bold animate-pulse">{locale.analyzing}</p>
                                </div>
                            )}

                            {activeTab === 'format' && (
                                <div className="prose dark:prose-invert max-w-none p-2">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note?.formattedText || ''}</ReactMarkdown>
                                </div>
                            )}
                            
                            {activeTab === 'entities' && (
                                <div className="prose dark:prose-invert max-w-none p-2">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note?.entities || ''}</ReactMarkdown>
                                </div>
                            )}
                            
                            {activeTab === 'graph' && note?.mindGraph && (
                                <div className="h-[500px] w-full flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-xl relative overflow-hidden">
                                    <svg width="100%" height="100%" viewBox="0 0 600 400" className="w-full h-full">
                                         {note.mindGraph.links?.map((link: any, i: number) => {
                                             const source = note.mindGraph.nodes.find((n:any) => n.id === link.source);
                                             const target = note.mindGraph.nodes.find((n:any) => n.id === link.target);
                                             if(!source || !target) return null;
                                             
                                             const sx = 300 + Math.cos(i) * 150; 
                                             const sy = 200 + Math.sin(i) * 120;
                                             const tx = 300 + Math.cos(i + 2) * 150;
                                             const ty = 200 + Math.sin(i + 2) * 120;
                                             
                                             return <line key={i} x1={sx} y1={sy} x2={tx} y2={ty} stroke={primaryColor} strokeWidth={Math.max(1, link.value/2)} opacity={0.3} />
                                         })}
                                         {note.mindGraph.nodes?.map((node: any, i: number) => {
                                             const x = 300 + Math.cos(i * (Math.PI * 2 / note.mindGraph.nodes.length)) * 150;
                                             const y = 200 + Math.sin(i * (Math.PI * 2 / note.mindGraph.nodes.length)) * 120;
                                             
                                             return (
                                                 <g key={i} className="hover:opacity-100 transition-opacity cursor-pointer group">
                                                     <circle cx={x} cy={y} r={node.val * 1.5} fill={primaryColor} opacity={0.8} className="group-hover:scale-110 transition-transform origin-center" />
                                                     <text x={x} y={y+node.val*1.5+15} textAnchor="middle" fontSize="11" fill="currentColor" fontWeight="bold" className="opacity-70 group-hover:opacity-100">{node.label}</text>
                                                 </g>
                                             )
                                         })}
                                    </svg>
                                    <div className="absolute bottom-4 right-4 text-xs opacity-50 bg-white/80 dark:bg-black/50 px-2 py-1 rounded">Interactive View Coming Soon</div>
                                </div>
                            )}
                            
                            {activeTab === 'questions' && (
                                <div className="grid gap-4 p-2">
                                    {note?.questions.split('\n').filter(q => q.trim().length > 0).map((q, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all flex gap-3">
                                            <MessageCircle size={20} className="shrink-0 mt-1 opacity-60" style={{ color: primaryColor }} />
                                            <div>{q.replace(/^\d+\.\s*/, '')}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'raw' && (
                                <div className="h-full flex flex-col gap-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs p-3 rounded-lg">
                                        Warning: Editing the structure manually may break visual renderings. Ensure valid JSON format.
                                    </div>
                                    <textarea 
                                        value={rawJson}
                                        onChange={(e) => setRawJson(e.target.value)}
                                        className="flex-1 w-full bg-black/5 dark:bg-black/30 font-mono text-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 resize-none focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleRawUpdate}
                                        className="py-2 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Play size={16} /> Update Visualization
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SmartNote;