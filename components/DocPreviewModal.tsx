import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Image as ImageIcon, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentFile } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source dynamically to match loaded library version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface DocPreviewModalProps {
    doc: DocumentFile;
    onClose: () => void;
    themeColor: string;
}

const DocPreviewModal: React.FC<DocPreviewModalProps> = ({ doc, onClose, themeColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (doc.type === 'pdf' && doc.base64) {
            renderPdf();
        }
    }, [doc, pageNumber, scale]);

    const renderPdf = async () => {
        if (!canvasRef.current || !doc.base64) return;
        setLoading(true);
        setError('');

        try {
            const binaryString = window.atob(doc.base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const loadingTask = pdfjsLib.getDocument({ data: bytes });
            const pdf = await loadingTask.promise;
            setNumPages(pdf.numPages);

            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };
                await page.render(renderContext).promise;
            }
        } catch (err: any) {
            console.error("PDF Render Error:", err);
            setError("Failed to render PDF. It might be corrupted or password protected.");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (doc.type === 'pdf') {
             if (!doc.base64) return <div className="p-8 text-center">No PDF data available.</div>;
             
             return (
                 <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                     {/* PDF Toolbar */}
                     <div className="flex items-center justify-center gap-4 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
                         <button 
                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            disabled={pageNumber <= 1}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                         >
                             <ChevronLeft size={20} />
                         </button>
                         <span className="text-sm font-mono">{pageNumber} / {numPages || '-'}</span>
                         <button 
                            onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                            disabled={pageNumber >= numPages}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                         >
                             <ChevronRight size={20} />
                         </button>
                         <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-2"></div>
                         <button 
                            onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                         >
                             <ZoomOut size={20} />
                         </button>
                         <span className="text-sm font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                         <button 
                            onClick={() => setScale(prev => Math.min(3.0, prev + 0.2))}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                         >
                             <ZoomIn size={20} />
                         </button>
                     </div>

                     {/* PDF Canvas */}
                     <div className="flex-1 overflow-auto flex justify-center p-8">
                         {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20"><div className="animate-spin w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full"></div></div>}
                         {error ? (
                             <div className="text-red-500 mt-10">{error}</div>
                         ) : (
                             <canvas ref={canvasRef} className="shadow-2xl" />
                         )}
                     </div>
                 </div>
             );
        } else if (doc.type === 'image' || doc.type.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-auto p-4">
                    <img src={`data:image/png;base64,${doc.base64}`} alt={doc.name} className="max-w-full max-h-full object-contain shadow-lg" />
                </div>
            );
        } else {
            // Text or OCR Result
            return (
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg h-full overflow-y-auto font-mono text-sm whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                    {doc.content}
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: themeColor }}>
                            {doc.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{doc.name}</h3>
                            <p className="text-xs opacity-60 uppercase">{doc.type}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden relative">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default DocPreviewModal;