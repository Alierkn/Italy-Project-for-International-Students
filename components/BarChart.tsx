import React from 'react';
import { CityStat } from '../types';

interface BarChartProps {
    stats: CityStat[];
}

const METRIC_CONFIG: { [key: string]: { color: string; icon: JSX.Element } } = {
    'Yaşam Maliyeti': {
        color: 'bg-green-500',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.134 0V7.418zM7.25 12.25a2.5 2.5 0 001.134 0v1.698c-.22-.07-.408-.164-.567-.267v-1.431z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.5 4.5 0 00-1.876.662C6.168 6.288 6 6.874 6 7.5c0 .828.305 1.584.876 2.148.571.564 1.32.91 2.124.962v.092a1 1 0 102 0v-.092a4.5 4.5 0 001.876-.662c.932-.564 1.124-1.32 1.124-2.048 0-.828-.305-1.584-.876-2.148A4.502 4.502 0 0011 4.092V3zM8.5 12.5a2.5 2.5 0 015 0V13a1 1 0 11-2 0v-.5a.5.5 0 00-1 0V13a1 1 0 11-2 0v-.5z" clipRule="evenodd" /></svg>
    },
    'Üniversite Kalitesi': {
        color: 'bg-blue-500',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
    },
    'Güvenlik': {
        color: 'bg-yellow-500',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5.068l.255.402a12.017 12.017 0 00-1.144 6.09c-.044.59-.044 1.191 0 1.782l.024.312a11.95 11.95 0 009.682 6.347l.313.023c.591.043 1.19.043 1.782 0l.312-.023a11.95 11.95 0 009.682-6.347l.024-.312c.044-.59.044-1.191 0-1.782a12.017 12.017 0 00-1.144-6.09l.255-.402A11.954 11.954 0 0110 1.944zM8 8a2 2 0 114 0 2 2 0 01-4 0zm2 5a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" /></svg>
    }
};

const BarChart: React.FC<BarChartProps> = ({ stats }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Genel Bakış</h3>
            <div className="space-y-5">
                {stats.map((stat, index) => {
                    const config = METRIC_CONFIG[stat.metric] || { color: 'bg-gray-500', icon: null };
                    return (
                        <div key={index} className="group" title={stat.summary}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500">{config.icon}</span>
                                    <span className="text-sm font-medium text-gray-600">{stat.metric}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800">{stat.value}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`${config.color} h-2.5 rounded-full origin-center transition-transform duration-300 ease-out group-hover:scale-y-150`}
                                    style={{
                                        // FIX: Cast style object to allow CSS custom properties for the animation.
                                        '--value': `${stat.value}%`,
                                        animation: `fill-bar 1s ease-out forwards`,
                                        animationDelay: `${index * 150}ms`,
                                    } as React.CSSProperties}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <p className="text-xs text-center text-gray-500 mt-4 italic">Daha fazla ayrıntı için yukarıdan bir konu seçin.</p>
        </div>
    );
};

export default BarChart;