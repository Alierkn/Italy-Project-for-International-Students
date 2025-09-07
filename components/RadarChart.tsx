import React, { useState } from 'react';
import { City, CityComparisonResult, SubTopic } from '../types';

interface RadarChartProps {
    cities: City[];
    results: CityComparisonResult[];
    subTopics: SubTopic[];
}

const COLORS = ['#3B82F6', '#F97316', '#10B981']; // Blue, Orange, Green

const RadarChart: React.FC<RadarChartProps> = ({ cities, results, subTopics }) => {
    const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);

    const size = 300;
    const center = size / 2;
    const numAxes = subTopics.length;
    if (numAxes < 3) return <div className="text-center text-sm text-gray-500">Radar grafiği için en az 3 alt konu seçilmelidir.</div>;

    const angleSlice = (Math.PI * 2) / numAxes;

    // Function to calculate point coordinates
    const getPointCoordinate = (value: number, index: number): [number, number] => {
        const angle = angleSlice * index - Math.PI / 2;
        const radius = (value / 10) * (center * 0.8); // 80% of center for padding
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return [x, y];
    };

    // Axes lines
    const axes = subTopics.map((subTopic, i) => {
        const [x, y] = getPointCoordinate(10, i);
        return <line key={`axis-${i}`} x1={center} y1={center} x2={x} y2={y} stroke="#E5E7EB" strokeWidth="1" />;
    });

    // Concentric grid lines
    const gridLevels = 5;
    const gridLines = Array.from({ length: gridLevels }, (_, i) => {
        const radius = ((center * 0.8) / gridLevels) * (i + 1);
        const points = Array.from({ length: numAxes }, (__, j) => {
            const angle = angleSlice * j - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={`grid-${i}`} points={points} fill="none" stroke="#F3F4F6" strokeWidth="1" />;
    });

    // Data polygons
    const dataPolygons = results.map((result, cityIndex) => {
        const cityColor = COLORS[cityIndex % COLORS.length];
        const points = subTopics.map((subTopic, i) => {
            const dataPoint = result.data.find(d => d.subTopic === subTopic.name);
            const value = dataPoint ? dataPoint.rating : 0;
            return getPointCoordinate(value, i).join(',');
        }).join(' ');

        const isHovered = hoveredCityId === result.cityId;
        const isFaded = hoveredCityId !== null && !isHovered;

        return (
            <polygon
                key={`poly-${result.cityId}`}
                points={points}
                fill={cityColor}
                fillOpacity={isFaded ? 0.1 : (isHovered ? 0.4 : 0.25)}
                stroke={cityColor}
                strokeWidth={isHovered ? 3 : 2}
                onMouseEnter={() => setHoveredCityId(result.cityId)}
                onMouseLeave={() => setHoveredCityId(null)}
                className="cursor-pointer transition-all duration-200"
            />
        );
    });

    // Labels for axes
    const labels = subTopics.map((subTopic, i) => {
        const [x, y] = getPointCoordinate(11.5, i); // Position labels slightly outside the max radius
        let textAnchor: "middle" | "end" | "start" = "middle";
        if (x < center - 1) textAnchor = "end";
        if (x > center + 1) textAnchor = "start";

        return (
            <text
                key={`label-${i}`}
                x={x}
                y={y}
                dy="0.35em"
                fontSize="11"
                fill="#4B5563"
                fontWeight="500"
                textAnchor={textAnchor}
                className="pointer-events-none"
            >
                {subTopic.name}
            </text>
        );
    });

    const hoveredCity = cities.find(c => c.id === hoveredCityId);
    const hoveredData = results.find(r => r.cityId === hoveredCityId);

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 p-4">
            <div className="flex-shrink-0 w-full max-w-sm md:max-w-xs lg:max-w-sm">
                <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" onMouseLeave={() => setHoveredCityId(null)}>
                    <g>
                        {gridLines}
                        {axes}
                        {labels}
                        {dataPolygons}
                    </g>
                </svg>
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
                    {cities.map((city, index) => {
                        const isHovered = hoveredCityId === city.id;
                        const cityColor = COLORS[index % COLORS.length];
                        return (
                            <div
                                key={city.id}
                                className={`flex items-center p-2 rounded-lg transition-all duration-200 cursor-pointer ${isHovered ? 'bg-gray-100 shadow-sm' : 'bg-transparent'}`}
                                onMouseEnter={() => setHoveredCityId(city.id)}
                                onMouseLeave={() => setHoveredCityId(null)}
                            >
                                <span
                                    className="w-3 h-3 rounded-full mr-2 transition-all duration-200"
                                    style={{
                                        backgroundColor: cityColor,
                                        transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                                        boxShadow: isHovered ? `0 0 6px 1px ${cityColor}` : 'none'
                                    }}
                                ></span>
                                <span className={`text-sm font-medium transition-colors ${isHovered ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                                    {city.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full md:w-72 h-80 bg-gray-50 rounded-lg p-4 border overflow-y-auto">
                {hoveredCity && hoveredData ? (
                    <div className="animate-fade-in">
                        <h4 className="text-lg font-bold text-gray-800 mb-3">{hoveredCity.name} Değerlendirmesi</h4>
                        <ul className="space-y-3">
                            {hoveredData.data.map(dp => (
                                <li key={dp.subTopic} className="text-sm">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="font-semibold text-gray-700">{dp.subTopic}</p>
                                        <p className="font-bold text-blue-600">{dp.rating}/10</p>
                                    </div>
                                    <p className="text-gray-600 italic">"{dp.summary}"</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                        <div>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
                             </svg>
                            <p className="font-semibold">Grafikteki bir şehrin üzerine gelerek detayları görün.</p>
                        </div>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default RadarChart;
