import React, { useState, useEffect, useRef } from 'react';
import { DocumentFile } from '../types';
import { ScanLine, Settings2, FileText, Code, Sparkles, Edit3, Image as ImageIcon, Check, Upload, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { performOCR, analyzeDocumentText } from '../services/geminiService';
import { PROMPTS } from '../constants';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is set for the OCR workspace preview as well, matching dynamic version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface OCRWorkspaceProps {
    documents: DocumentFile[];
    onUpdateDocument: (doc: DocumentFile) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    primaryColor: string;
    locale: any;
    onError: (msg: string) => void;
}

const OCRWorkspace: React.FC<OCRWorkspaceProps> = ({ documents, onUpdateDocument, onFileUpload, primaryColor, locale, onError }) => {
    // OCR Settings
    const [ocrModel, setOcrModel] = useState('gemini-2.5-flash');
    const [ocrMaxTokens, setOcrMaxTokens] = useState(12000);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    
    // Agent Settings
    const [agentModel, setAgentModel] = useState('gemini-2.5-flash');
    const [agentMaxTokens, setAgentMaxTokens] = useState(12000);
    const [agentPrompt, setAgentPrompt] = useState(PROMPTS.agentAnalysis);
    
    // UI State
    const [processing, setProcessing] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [viewMode, setViewMode] = useState<'markdown' | 'raw'>('markdown');
    const [activeTab, setActiveTab] = useState<'ocr' | 'agent'>('ocr');
    const [agentResult, setAgentResult] = useState('');

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const activeDoc = documents.find(d => d.id === selectedDocId);
    // Allow Images AND PDFs
    const ocrDocs = documents.filter(d => d.type === 'image' || d.type.startsWith('image/') || d.type === 'pdf');

    useEffect(() => {
        if (!selectedDocId && ocrDocs.length > 0) {
            setSelectedDocId(ocrDocs[0].id);
        }
    }, [documents]);

    // Simple PDF render for OCR preview (page 1 only)
    useEffect(() => {
        const renderPdfPreview = async () => {
            if (activeDoc?.type === 'pdf' && activeDoc.base64 && canvasRef.current) {
                try {
                    const binaryString = window.atob(activeDoc.base64);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    
                    const loadingTask = pdfjsLib.getDocument({ data: bytes });
                    const pdf = await loadingTask.promise;
                    const page = await pdf.getPage(1);
                    
                    const viewport = page.getViewport({ scale: 0.8 }); // Smaller scale for preview
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');
                    
                    if (context) {
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        await page.render({ canvasContext: context, viewport }).promise;
                    }
                } catch (e) {
                    console.error("OCR Preview PDF Error", e);
                }
            }
        };

        renderPdfPreview();
    }, [activeDoc]);

    const handleRunOCR = async () => {
        if (!activeDoc || !activeDoc.base64) return;
        
        setProcessing(true);
        try {
            const mimeType = activeDoc.type === 'pdf' ? 'application/pdf' : 'image/png';
            const text = await performOCR(activeDoc.base64, ocrModel, ocrMaxTokens, mimeType);
            onUpdateDocument({ ...activeDoc, content: text });
            setActiveTab('ocr');
            setViewMode('markdown');
        } catch (e: any) {
            onError(e.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleRunAgent = async () => {
        if (!activeDoc || !activeDoc.content) {
            onError("No text content available. Run OCR first.");
            return;
        }

        setAnalyzing(true);
        try {
            const result = await analyzeDocumentText(activeDoc.content, agentPrompt, agentModel, agentMaxTokens);
            setAgentResult(result);
        } catch (e: any) {
            onError(e.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-[700px] gap-4 animate-in slide-in-from-bottom duration-500">
            {/* Global Toolbar */}
            <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center gap-6 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-bold opacity-70 flex items-center gap-1"><Settings2 size={16}/> {locale.ocr_settings}</span>
                    </div>
                    
                    <select 
                        value={ocrModel}
                        onChange={(e) => setOcrModel(e.target.value)}
                        className="p-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-sm"
                    >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                    </select>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60">Tokens: {ocrMaxTokens}</span>
                        <input 
                            type="range" min="1000" max="32000" step="1000"
                            value={ocrMaxTokens}
                            onChange={(e) => setOcrMaxTokens(Number(e.target.value))}
                            className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleRunOCR}
                    disabled={processing || !activeDoc}
                    className="px-6 py-2 rounded-lg text-white font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: primaryColor }}
                >
                    {processing ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent"/> : <ScanLine size={18}/>}
                    {locale.generate}
                </button>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left: Document List */}
                <div className="w-24 md:w-48 glass-panel rounded-xl flex flex-col overflow-hidden shrink-0">
                    <div className="p-3 bg-gray-100/50 dark:bg-gray-800/50 text-xs font-bold uppercase opacity-60 flex justify-between items-center">
                        {locale.docs}
                        <label className="cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded-full transition-colors">
                            <Plus size={14} />
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileUpload} multiple />
                        </label>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {ocrDocs.length === 0 && (
                            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <Upload size={20} className="opacity-50 mb-1" />
                                <span className="text-[10px] opacity-50 text-center">Upload File</span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFileUpload} />
                            </label>
                        )}
                        {ocrDocs.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDocId(doc.id)}
                                className={`w-full p-2 rounded-lg text-left transition-all ${selectedDocId === doc.id ? 'bg-white shadow-md dark:bg-gray-700' : 'hover:bg-white/50 dark:hover:bg-gray-800'}`}
                            >
                                <div className="aspect-square bg-gray-200 dark:bg-gray-900 rounded-md mb-2 overflow-hidden relative flex items-center justify-center">
                                    {doc.type === 'pdf' ? (
                                        <div className="flex flex-col items-center opacity-50">
                                            <FileText size={24} />
                                            <span className="text-[10px] mt-1">PDF</span>
                                        </div>
                                    ) : (
                                        doc.base64 && <img src={`data:image/png;base64,${doc.base64}`} className="w-full h-full object-cover" alt="" />
                                    )}
                                </div>
                                <div className="text-xs font-medium truncate">{doc.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Middle: Preview */}
                <div className="flex-1 glass-panel rounded-xl overflow-hidden flex flex-col min-w-[300px]">
                     <div className="p-3 bg-gray-100/50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase opacity-60">Preview</span>
                        {activeDoc && <span className="text-xs opacity-50">{activeDoc.name}</span>}
                    </div>
                    <div className="flex-1 bg-black/5 dark:bg-black/40 flex items-center justify-center p-4 overflow-auto">
                        {activeDoc ? (
                            activeDoc.type === 'pdf' ? (
                                <canvas ref={canvasRef} className="max-w-full shadow-lg rounded-lg" />
                            ) : (
                                activeDoc.base64 && <img src={`data:image/png;base64,${activeDoc.base64}`} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" alt="" />
                            )
                        ) : (
                            <div className="flex flex-col items-center opacity-30">
                                <ImageIcon size={48} className="mb-2"/>
                                <span>Select a document</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Results & Agent */}
                <div className="flex-[1.5] glass-panel rounded-xl flex flex-col overflow-hidden min-w-[350px]">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={() => setActiveTab('ocr')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ocr' ? 'bg-white/50 dark:bg-white/10 text-current' : 'opacity-60 hover:opacity-100'}`}
                            style={{ borderBottom: activeTab === 'ocr' ? `3px solid ${primaryColor}` : 'none' }}
                        >
                            <FileText size={16}/> OCR Result
                        </button>
                        <button 
                            onClick={() => setActiveTab('agent')}
                            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'agent' ? 'bg-white/50 dark:bg-white/10 text-current' : 'opacity-60 hover:opacity-100'}`}
                            style={{ borderBottom: activeTab === 'agent' ? `3px solid ${primaryColor}` : 'none' }}
                        >
                            <Sparkles size={16}/> {locale.agent_analysis}
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'ocr' && (
                            <div className="h-full flex flex-col">
                                <div className="p-2 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewMode('markdown')} className={`p-1.5 rounded ${viewMode === 'markdown' ? 'bg-white dark:bg-gray-700 shadow' : 'opacity-50'}`} title="Markdown View"><FileText size={14}/></button>
                                        <button onClick={() => setViewMode('raw')} className={`p-1.5 rounded ${viewMode === 'raw' ? 'bg-white dark:bg-gray-700 shadow' : 'opacity-50'}`} title="Edit Raw Text"><Edit3 size={14}/></button>
                                    </div>
                                    <button 
                                        onClick={() => { setActiveTab('agent'); handleRunAgent(); }}
                                        className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                                    >
                                        <Sparkles size={12} /> {locale.run_analysis}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {viewMode === 'raw' ? (
                                        <textarea 
                                            value={activeDoc?.content || ''}
                                            onChange={(e) => activeDoc && onUpdateDocument({ ...activeDoc, content: e.target.value })}
                                            className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-mono text-sm"
                                            placeholder={locale.ocr_placeholder}
                                        />
                                    ) : (
                                        <div className="h-full overflow-y-auto p-4 prose dark:prose-invert max-w-none">
                                            {activeDoc?.content ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeDoc.content}</ReactMarkdown>
                                            ) : (
                                                <div className="opacity-40 text-center mt-10">{locale.ocr_placeholder}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'agent' && (
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
                                    <div className="flex gap-3">
                                         <select 
                                            value={agentModel}
                                            onChange={(e) => setAgentModel(e.target.value)}
                                            className="flex-1 p-2 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-xs"
                                        >
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
                                        </select>
                                        <input 
                                            type="number" 
                                            value={agentMaxTokens}
                                            onChange={(e) => setAgentMaxTokens(Number(e.target.value))}
                                            className="w-20 p-2 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-xs"
                                            placeholder="Tokens"
                                        />
                                    </div>
                                    <textarea 
                                        value={agentPrompt}
                                        onChange={(e) => setAgentPrompt(e.target.value)}
                                        className="w-full h-20 p-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        placeholder={locale.agent_prompt}
                                    />
                                    <button 
                                        onClick={handleRunAgent}
                                        disabled={analyzing}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                                    >
                                        {analyzing ? <div className="animate-spin w-3 h-3 border-2 border-white rounded-full border-t-transparent"/> : <Sparkles size={14}/>}
                                        {locale.run_analysis}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 bg-white/40 dark:bg-black/20">
                                    {agentResult ? (
                                        <div className="prose dark:prose-invert max-w-none text-sm">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{agentResult}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="opacity-40 text-center mt-10 text-sm">{locale.analysis_placeholder}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OCRWorkspace;