import React, { useState } from 'react';
import { Send, Bot, Settings2, FileText, Code } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askDocumentQuestion } from '../services/geminiService';

interface DocQnAProps {
    combinedText: string;
    primaryColor: string;
    locale: any;
    onError: (msg: string) => void;
}

const DocQnA: React.FC<DocQnAProps> = ({ combinedText, primaryColor, locale, onError }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [model, setModel] = useState('gemini-2.5-flash');
    const [maxTokens, setMaxTokens] = useState(1024);
    const [viewMode, setViewMode] = useState<'markdown' | 'raw'>('markdown');

    const handleAsk = async () => {
        if (!combinedText) {
            onError("No document content available. Please upload and process documents first.");
            return;
        }
        if (!question.trim()) return;

        setLoading(true);
        setAnswer(''); // Clear previous answer
        
        try {
            const result = await askDocumentQuestion(combinedText, question, model, maxTokens);
            setAnswer(result);
        } catch (e: any) {
            onError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[600px] animate-in slide-in-from-bottom duration-500">
            
            {/* Settings Sidebar */}
            <div className="w-full lg:w-80 glass-panel p-6 rounded-2xl flex flex-col gap-6 shrink-0 h-fit">
                <div className="flex items-center gap-2 font-bold text-lg opacity-80 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <Settings2 size={20} />
                    {locale.settings}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold opacity-70">{locale.model}</label>
                    <div className="relative">
                        <select 
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 appearance-none focus:outline-none focus:ring-2"
                            style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            <option value="gemini-2.5-flash-lite-latest">Gemini Flash Lite</option>
                            <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold opacity-70">{locale.max_tokens}</label>
                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{maxTokens}</span>
                    </div>
                    <input 
                        type="range" 
                        min="100" 
                        max="8192" 
                        step="100" 
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                        className="w-full accent-[var(--primary)] h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        style={{ '--primary': primaryColor } as React.CSSProperties}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-black/10 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{locale.ask_title}</h3>
                        <p className="text-xs opacity-60">{locale.ask_subtitle}</p>
                    </div>
                    
                    {answer && (
                        <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                            <button 
                                onClick={() => setViewMode('markdown')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'markdown' ? 'bg-white dark:bg-gray-600 shadow' : 'opacity-50'}`}
                                title={locale.markdown_view}
                            >
                                <FileText size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('raw')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'raw' ? 'bg-white dark:bg-gray-600 shadow' : 'opacity-50'}`}
                                title={locale.raw_view}
                            >
                                <Code size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Response Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-white/40 dark:bg-black/20">
                    {!answer && !loading && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                            <Bot size={64} className="mb-4" />
                            <p>{locale.ask_placeholder}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center gap-3 text-sm opacity-70 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            Processing with {model}...
                        </div>
                    )}

                    {answer && !loading && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {viewMode === 'markdown' ? (
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap font-mono text-sm bg-black/5 dark:bg-black/30 p-4 rounded-lg overflow-x-auto">
                                    {answer}
                                </pre>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/60 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <textarea 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={locale.ask_placeholder}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none h-12 py-3 max-h-32"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAsk();
                            }
                        }}
                    />
                    <button 
                        onClick={handleAsk}
                        disabled={loading || !question.trim()}
                        className="p-3 rounded-xl text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocQnA;