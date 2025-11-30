import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap } from 'recharts';
import { DocumentFile } from '../types';

interface WordGraphProps {
    documents: DocumentFile[];
    combinedText: string;
    primaryColor: string;
}

const WordGraph: React.FC<WordGraphProps> = ({ combinedText, primaryColor }) => {
    
    const wordData = useMemo(() => {
        if (!combinedText) return [];
        
        // Basic tokenizer
        const words = combinedText.toLowerCase()
            .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length > 3)
            .filter(w => !['that', 'this', 'with', 'from', 'have', 'were', 'will', 'your', 'they', 'could', 'which'].includes(w));

        const freqMap: Record<string, number> = {};
        words.forEach(w => {
            freqMap[w] = (freqMap[w] || 0) + 1;
        });

        return Object.entries(freqMap)
            .map(([text, value]) => ({ name: text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);
    }, [combinedText]);

    if (wordData.length === 0) {
        return <div className="p-8 text-center opacity-50">No data available. Process documents to view analysis.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
            <div className="p-6 rounded-2xl glass-panel shadow-lg">
                <h3 className="text-lg font-bold mb-4 opacity-80">Top Word Frequency</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={wordData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fill: 'currentColor', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                cursor={{fill: 'rgba(0,0,0,0.05)'}}
                            />
                            <Bar dataKey="value" fill={primaryColor} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="p-6 rounded-2xl glass-panel shadow-lg">
                <h3 className="text-lg font-bold mb-4 opacity-80">Distribution Map</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={wordData}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill={primaryColor}
                        >
                             <Tooltip />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default WordGraph;
