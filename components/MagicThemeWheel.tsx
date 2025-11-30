import React from 'react';
import { FLOWER_THEMES } from '../constants';

interface MagicThemeWheelProps {
    onSelect: (index: number) => void;
    currentThemeIndex: number;
    onClose: () => void;
}

const MagicThemeWheel: React.FC<MagicThemeWheelProps> = ({ onSelect, currentThemeIndex, onClose }) => {
    const radius = 150;
    const center = radius + 20;
    const size = center * 2;
    const sliceAngle = (2 * Math.PI) / FLOWER_THEMES.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="relative bg-white dark:bg-gray-800 rounded-full shadow-2xl p-4 animate-in fade-in zoom-in duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
                    <span className="text-xl font-bold bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
                        Select Style
                    </span>
                </div>
                
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="animate-spin-slow hover:pause">
                    {FLOWER_THEMES.map((theme, i) => {
                        const startAngle = i * sliceAngle;
                        const endAngle = (i + 1) * sliceAngle;
                        
                        // Calculate path for slice
                        const x1 = center + radius * Math.cos(startAngle);
                        const y1 = center + radius * Math.sin(startAngle);
                        const x2 = center + radius * Math.cos(endAngle);
                        const y2 = center + radius * Math.sin(endAngle);

                        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

                        const pathData = [
                            `M ${center} ${center}`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`
                        ].join(' ');

                        return (
                            <g key={i} onClick={() => onSelect(i)} className="cursor-pointer hover:opacity-80 transition-opacity">
                                <path 
                                    d={pathData} 
                                    fill={theme.primary} 
                                    stroke="white" 
                                    strokeWidth="2"
                                />
                                {/* Label roughly in middle of slice */}
                                <text
                                    x={center + (radius * 0.7) * Math.cos(startAngle + sliceAngle/2)}
                                    y={center + (radius * 0.7) * Math.sin(startAngle + sliceAngle/2)}
                                    fill="white"
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    transform={`rotate(${(startAngle + sliceAngle/2) * (180/Math.PI) + 90}, ${center + (radius * 0.7) * Math.cos(startAngle + sliceAngle/2)}, ${center + (radius * 0.7) * Math.sin(startAngle + sliceAngle/2)})`}
                                >
                                    {theme.name.split(' ')[0]}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default MagicThemeWheel;
