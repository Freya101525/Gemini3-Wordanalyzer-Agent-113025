import React, { useState, useEffect } from 'react';
import { LOCALIZATION, FLOWER_THEMES } from './constants';
import { Language, DocumentFile } from './types';
import { Settings, Moon, Sun, Upload, FileText, ScanLine, X, MessageSquare, Eye } from 'lucide-react';

// Components
import MagicThemeWheel from './components/MagicThemeWheel';
import WordGraph from './components/WordGraph';
import SmartNote from './components/SmartNote';
import DocQnA from './components/DocQnA';
import DocPreviewModal from './components/DocPreviewModal';
import OCRWorkspace from './components/OCRWorkspace';
import { performOCR } from './services/geminiService';

const App = () => {
    // State
    const [lang, setLang] = useState<Language>('en');
    const [themeIndex, setThemeIndex] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [showWheel, setShowWheel] = useState(false);
    const [activeTab, setActiveTab] = useState('docs');
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [message, setMessage] = useState<{type:'error'|'success', text: string} | null>(null);
    const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);

    // Derived vars
    const t = LOCALIZATION[lang];
    const theme = FLOWER_THEMES[themeIndex];

    // Effects
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            
            // Determine if we should read as DataURL (Base64) or Text
            // Images and PDFs need Base64 for preview/embed
            const isImage = file.type.startsWith('image/');
            const isPdf = file.type === 'application/pdf';
            const readAsBase64 = isImage || isPdf;

            reader.onload = (ev) => {
                const content = ev.target?.result as string;
                
                const newDoc: DocumentFile = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: isImage ? 'image' : (isPdf ? 'pdf' : 'text'),
                    // For PDF/Image, content is initially empty until OCR or extraction
                    // For text files, content is initially the text itself
                    content: readAsBase64 ? '' : content,
                    // If readAsBase64, split the data URL prefix to get raw base64
                    base64: readAsBase64 ? content.split(',')[1] : undefined,
                    timestamp: new Date().toISOString()
                };
                setDocuments(prev => [...prev, newDoc]);
            };
            
            if (readAsBase64) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    const handleUpdateDocument = (updatedDoc: DocumentFile) => {
        setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    };

    // Styling
    const bgStyle = {
        background: darkMode 
            ? `linear-gradient(135deg, ${theme.bgDark} 0%, #1a1a1a 100%)`
            : `linear-gradient(135deg, ${theme.bgLight} 0%, white 100%)`,
        color: darkMode ? theme.textDark : theme.textLight
    };

    const combinedText = documents.map(d => d.content).join('\n\n');

    return (
        <div className="min-h-screen transition-colors duration-500 font-sans" style={bgStyle}>
            {/* Notifications */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)} className="ml-4 opacity-70 hover:opacity-100"><X size={16}/></button>
                </div>
            )}

            {/* Magic Wheel */}
            {showWheel && (
                <MagicThemeWheel 
                    currentThemeIndex={themeIndex} 
                    onSelect={(i) => { setThemeIndex(i); setShowWheel(false); }}
                    onClose={() => setShowWheel(false)}
                />
            )}

            {/* Preview Modal */}
            {previewDoc && (
                <DocPreviewModal 
                    doc={previewDoc} 
                    onClose={() => setPreviewDoc(null)} 
                    themeColor={theme.primary} 
                />
            )}

            {/* Header */}
            <header className="sticky top-0 z-40 px-6 py-4 glass-panel border-b border-white/10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg text-white shadow-lg" style={{ backgroundColor: theme.primary }}>
                        <ScanLine size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-none tracking-tight">{t.title}</h1>
                        <p className="text-xs opacity-70">{t.subtitle}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button onClick={() => setLang(l => l === 'en' ? 'zh-TW' : 'en')} className="px-3 py-1.5 rounded-full text-xs font-bold border border-current opacity-70 hover:opacity-100 transition-opacity">
                        {lang === 'en' ? 'EN' : '繁中'}
                    </button>
                    
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>

                    <button onClick={() => setShowWheel(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: theme.primary }}>
                        <Settings size={14} className="animate-spin-slow" />
                        {t.theme}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Nav Tabs */}
                <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                    {[
                        { id: 'docs', label: t.docs, icon: Upload },
                        { id: 'ocr', label: t.ocr, icon: ScanLine },
                        { id: 'qna', label: t.qna, icon: MessageSquare },
                        { id: 'wordgraph', label: t.wordgraph, icon: FileText },
                        { id: 'smartnote', label: t.smartnote, icon: Settings },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'shadow-lg scale-105' : 'opacity-60 hover:opacity-100'}`}
                            style={{ 
                                backgroundColor: activeTab === tab.id ? theme.primary : 'transparent',
                                color: activeTab === tab.id ? '#fff' : 'currentColor'
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'docs' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
                            {/* Upload Area */}
                            <div className="col-span-1 md:col-span-2 space-y-6">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: theme.primary }}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-12 h-12 mb-4 opacity-50" style={{ color: theme.primary }} />
                                        <p className="mb-2 text-sm opacity-80 font-semibold">{t.upload}</p>
                                        <p className="text-xs opacity-50">PDF (Images), TXT, MD</p>
                                    </div>
                                    <input type="file" className="hidden" multiple accept="image/*,.txt,.md,.pdf" onChange={handleFileUpload} />
                                </label>

                                <div className="glass-panel rounded-2xl p-4">
                                    <h3 className="font-bold mb-4 flex items-center gap-2"><FileText size={18}/> {t.paste}</h3>
                                    <textarea 
                                        className="w-full h-40 bg-transparent border-none resize-none focus:ring-0 placeholder-gray-400/50"
                                        placeholder="Paste text directly here..."
                                        onChange={(e) => {
                                            if (e.target.value.length > 10) {
                                                 const newDoc: DocumentFile = {
                                                    id: 'paste-' + Date.now(),
                                                    name: 'Pasted Text',
                                                    type: 'text',
                                                    content: e.target.value,
                                                    timestamp: new Date().toISOString()
                                                };
                                                setDocuments(prev => [...prev.filter(d => !d.id.startsWith('paste-')), newDoc]);
                                            }
                                        }}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Document List */}
                            <div className="glass-panel rounded-2xl p-6 h-full overflow-hidden flex flex-col">
                                <h3 className="font-bold mb-4 opacity-80 uppercase tracking-wider text-sm">{t.docs} ({documents.length})</h3>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {documents.length === 0 && <div className="text-center opacity-40 mt-10">No documents yet</div>}
                                    {documents.map(doc => (
                                        <div key={doc.id} className="p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 transition-colors flex items-center justify-between group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 rounded bg-gray-200 dark:bg-gray-700">
                                                    {doc.type === 'image' || doc.type.startsWith('image/') ? <ScanLine size={16}/> : <FileText size={16}/>}
                                                </div>
                                                <div className="truncate">
                                                    <div className="font-medium text-sm truncate max-w-[120px]">{doc.name}</div>
                                                    <div className="text-xs opacity-50">{new Date(doc.timestamp).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setPreviewDoc(doc)}
                                                    className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-current transition-colors"
                                                    title={t.preview}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                                                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ocr' && (
                        <OCRWorkspace 
                            documents={documents}
                            onUpdateDocument={handleUpdateDocument}
                            onFileUpload={handleFileUpload}
                            primaryColor={theme.primary}
                            locale={t}
                            onError={(msg) => setMessage({ type: 'error', text: msg })}
                        />
                    )}

                    {activeTab === 'qna' && (
                        <DocQnA 
                            combinedText={combinedText} 
                            primaryColor={theme.primary} 
                            locale={t} 
                            onError={(msg) => setMessage({ type: 'error', text: msg })} 
                        />
                    )}

                    {activeTab === 'wordgraph' && (
                        <WordGraph documents={documents} combinedText={combinedText} primaryColor={theme.primary} />
                    )}

                    {activeTab === 'smartnote' && (
                        <SmartNote 
                            text={combinedText} 
                            primaryColor={theme.primary} 
                            locale={t}
                            onError={(msg) => setMessage({ type: 'error', text: msg })}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;