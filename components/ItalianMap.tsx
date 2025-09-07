import React, { useState, useRef, MouseEvent as ReactMouseEvent, useCallback, useEffect } from 'react';
import { City, CityRecommendation } from '../types';
import { ITALY_LAND_PATH } from '../constants';

interface ItalianMapProps {
    cities: City[];
    selectedCity: City | null;
    onCitySelect: (city: City) => void;
    zoomToCity: City | null;
    onResetView: () => void;
    isComparisonMode: boolean;
    comparisonList: City[];
    recommendations: CityRecommendation[];
}

const VIEWBOX_WIDTH = 500;
const VIEWBOX_HEIGHT = 700;
const ZOOM_SPEED = 0.005;
const MIN_ZOOM = 0.9;
const MAX_ZOOM = 8;

// LocalStorage keys for settings
const MARKER_STYLE_KEY = 'map_marker_style';
const MARKER_COLOR_KEY = 'map_marker_color';


type MarkerStyle = 'circle' | 'pin' | 'star';

// Marker definitions
const MARKER_PATHS = {
    pin: "M0-12a6,6 0 1,1 0,12a6,6 0 1,1 0,-12zm0 4a2,2 0 1,0 0-4a2,2 0 1,0 0,4z", // A more compact pin
    star: "M0-7l2,4h4l-3,3l1,5l-4-3l-4,3l1-5l-3-3h4z",
};

const MARKER_COLORS = [
    { name: 'Adriatic Blue', value: '#007BFF' },
    { name: 'Tuscan Red', value: '#D6336C' },
    { name: 'Olive Green', value: '#66A80F' },
    { name: 'Amalfi Lemon', value: '#F59E0B' },
];

const ItalianMap: React.FC<ItalianMapProps> = ({ 
    cities, 
    selectedCity, 
    onCitySelect,
    zoomToCity,
    onResetView,
    isComparisonMode,
    comparisonList,
    recommendations
}) => {
    const [hoveredCity, setHoveredCity] = useState<City | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragStartRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

    // Marker Customization State - now loads from localStorage
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [markerStyle, setMarkerStyle] = useState<MarkerStyle>(() => {
        const savedStyle = localStorage.getItem(MARKER_STYLE_KEY) as MarkerStyle;
        return ['circle', 'pin', 'star'].includes(savedStyle) ? savedStyle : 'circle';
    });
    const [markerColor, setMarkerColor] = useState<string>(() => {
        const savedColor = localStorage.getItem(MARKER_COLOR_KEY);
        return savedColor || MARKER_COLORS[0].value;
    });

    // Save marker settings to localStorage on change
    useEffect(() => {
        localStorage.setItem(MARKER_STYLE_KEY, markerStyle);
    }, [markerStyle]);

    useEffect(() => {
        localStorage.setItem(MARKER_COLOR_KEY, markerColor);
    }, [markerColor]);


    const mapStroke = 'var(--land-stroke)';
    const cityDefault = 'var(--city-default)';
    const cityHover = 'var(--city-hover)';
    const citySelected = 'var(--city-selected)';
    const cityComparison = 'var(--city-comparison)';
    const cityRecommendation = 'var(--city-recommendation)';
    const textColor = 'var(--text-primary)';
    const tooltipBg = 'var(--bg-secondary)';
    const tooltipBorder = 'var(--border-color)';
    const shadow = 'var(--shadow-color-dark)';
    const waterColor = 'var(--water-color)';
    const landColor = 'var(--land-color)';

    const getClampedTransform = useCallback((t: { k: number, x: number, y: number }) => {
        const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, t.k));
        
        const maxX = 0;
        const minX = VIEWBOX_WIDTH * (1 - k);
        const maxY = 0;
        const minY = VIEWBOX_HEIGHT * (1 - k);

        const x = Math.max(minX, Math.min(maxX, t.x));
        const y = Math.max(minY, Math.min(maxY, t.y));

        return { k, x, y };
    }, []);

    useEffect(() => {
        if (zoomToCity && !isComparisonMode) {
            const cx = (zoomToCity.coords.x / 100) * VIEWBOX_WIDTH;
            const cy = (zoomToCity.coords.y / 100) * VIEWBOX_HEIGHT;
            const zoomLevel = 4;
            const newX = (VIEWBOX_WIDTH / 2) - (cx * zoomLevel);
            const newY = (VIEWBOX_HEIGHT / 2) - (cy * zoomLevel);
            setTransform(getClampedTransform({ k: zoomLevel, x: newX, y: newY }));
        } else {
            setTransform(getClampedTransform({ k: 1, x: 0, y: 0 }));
        }
    }, [zoomToCity, isComparisonMode, getClampedTransform]);


    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const svg = svgRef.current;
        if (!svg) return;

        const { deltaY } = e;
        const newScale = transform.k * (1 - deltaY * ZOOM_SPEED);
        
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        
        const newX = svgPoint.x - (svgPoint.x - transform.x) * (newScale / transform.k);
        const newY = svgPoint.y - (svgPoint.y - transform.y) * (newScale / transform.k);
        setTransform(getClampedTransform({ k: newScale, x: newX, y: newY }));
    };

    const handleMouseDown = (e: ReactMouseEvent<SVGSVGElement>) => {
        if ((e.target as SVGElement).closest('.city-marker, .zoom-control, .settings-control')) return;
        document.body.style.userSelect = 'none'; // Prevent text selection while dragging
        e.currentTarget.style.cursor = 'grabbing';
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    };
    
    const handleMouseMove = (e: ReactMouseEvent<SVGSVGElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        setTooltipPosition({ x: svgPoint.x, y: svgPoint.y });

        if (isDragging) {
            const { x: startX, y: startY, tx: startTx, ty: startTy } = dragStartRef.current;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const newX = startTx + dx;
            const newY = startTy + dy;
            setTransform(getClampedTransform({ k: transform.k, x: newX, y: newY }));
        }
    };
    
    const endDrag = (e: ReactMouseEvent<SVGSVGElement>) => {
        document.body.style.userSelect = ''; // Re-enable text selection
        e.currentTarget.style.cursor = 'grab';
        setIsDragging(false);
    };
    
    const handleZoomAction = (factor: number) => {
        const newScale = transform.k * factor;
        const centerX = VIEWBOX_WIDTH / 2;
        const centerY = VIEWBOX_HEIGHT / 2;
        
        const newX = centerX - (centerX - transform.x) * (newScale / transform.k);
        const newY = centerY - (centerY - transform.y) * (newScale / transform.k);
        setTransform(getClampedTransform({ k: newScale, x: newX, y: newY }));
    };
    
    const handleDoubleClick = (e: ReactMouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        if ((e.target as SVGElement).closest('.city-marker')) return;
        
        const factor = e.shiftKey ? 1 / 1.8 : 1.8; // Zoom out if Shift is pressed
        const newScale = transform.k * factor;
        const svg = svgRef.current;
        if (!svg) return;
        
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
        
        const newX = svgPoint.x - (svgPoint.x - transform.x) * (newScale / transform.k);
        const newY = svgPoint.y - (svgPoint.y - transform.y) * (newScale / transform.k);
        setTransform(getClampedTransform({ k: newScale, x: newX, y: newY }));
    };
    
    const renderMarker = (style: MarkerStyle, color: string, isHovered: boolean) => {
        const hoverBorderColor = 'var(--city-hover)';
        const defaultStrokeColor = tooltipBg;
        const baseStrokeWidth = isHovered ? 2.5 : 1.5;

        switch (style) {
            case 'pin':
                return (
                    <path
                        d={MARKER_PATHS.pin}
                        fill={color}
                        stroke={isHovered ? hoverBorderColor : 'none'}
                        strokeWidth={isHovered ? 1.5 : 0}
                        style={{ transition: 'all 0.2s ease-in-out' }}
                    />
                );
            case 'star':
                return (
                    <path
                        d={MARKER_PATHS.star}
                        fill={color}
                        stroke={isHovered ? hoverBorderColor : 'none'}
                        strokeWidth={isHovered ? 1.5 : 0}
                        style={{ transition: 'all 0.2s ease-in-out' }}
                    />
                );
            case 'circle':
            default:
                return (
                    <>
                        <circle
                            r={6}
                            fill={color}
                            stroke={isHovered ? hoverBorderColor : defaultStrokeColor}
                            strokeWidth={baseStrokeWidth}
                            style={{ transition: 'all 0.2s ease-in-out' }}
                        />
                        <circle r={2.5} fill={tooltipBg} />
                    </>
                );
        }
    };


    return (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[var(--bg-primary)]">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-w-full max-h-full cursor-grab"
                aria-label="Map of Italy"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onDoubleClick={handleDoubleClick}
            >
                <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill={waterColor} />
                <g 
                    transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
                    style={{ transition: isDragging ? 'none' : 'transform 0.3s ease-out' }}
                >
                    <g id="landmass">
                        <path d={ITALY_LAND_PATH} fill={landColor} stroke={mapStroke} strokeWidth={0.5 / transform.k} vectorEffect="non-scaling-stroke" />
                    </g>
                    
                    <g id="cities">
                        {cities.map(city => {
                            const isSelected = selectedCity?.id === city.id;
                            const isHovered = hoveredCity?.id === city.id;
                            const isInComparison = comparisonList.some(c => c.id === city.id);
                            const isRecommended = recommendations.some(r => r.cityId === city.id);
                            
                            const cx = (city.coords.x / 100) * VIEWBOX_WIDTH;
                            const cy = (city.coords.y / 100) * VIEWBOX_HEIGHT;

                            let finalMarkerColor = markerColor; // Default from settings
                            if (isRecommended && !isComparisonMode) finalMarkerColor = cityRecommendation;
                            else if (isInComparison) finalMarkerColor = cityComparison;
                            else if (isSelected) finalMarkerColor = citySelected;
                            
                            const markerScale = 1 / transform.k;
                            const textAndPulseScale = isHovered ? 1.2 * markerScale : markerScale;

                            return (
                                <g
                                    key={city.id}
                                    className="city-marker cursor-pointer"
                                    transform={`translate(${cx}, ${cy})`}
                                    onClick={() => onCitySelect(city)}
                                    onMouseEnter={() => setHoveredCity(city)}
                                    onMouseLeave={() => setHoveredCity(null)}
                                    aria-label={`Select ${city.name}`}
                                >
                                    <g transform={`scale(${textAndPulseScale})`} style={{ transition: 'transform 0.2s ease-out', willChange: 'transform' }}>
                                        {isRecommended && !isComparisonMode && (
                                            <circle r={10} fill={cityRecommendation} className="animate-recommendation-pulse" style={{ pointerEvents: 'none' }} />
                                        )}
                                        {(isSelected || isInComparison) && !isRecommended && (
                                            <circle r={8} fill={isInComparison ? cityComparison : citySelected} className={isInComparison ? 'animate-gentle-pulse-orange' : 'animate-gentle-pulse'} style={{ pointerEvents: 'none' }} />
                                        )}
                                        <g>
                                            {renderMarker(markerStyle, finalMarkerColor, isHovered)}
                                        </g>
                                        {isRecommended && !isComparisonMode && (
                                            <path
                                                d="M-4.5 9.5l1.5-5 5-1.5-5-1.5-1.5-5-1.5 5-5 1.5 5 1.5z"
                                                transform={`scale(0.5) translate(16, -28)`}
                                                fill="#FFFFFF"
                                                stroke={cityRecommendation}
                                                strokeWidth={2}
                                            />
                                        )}
                                    </g>
                                </g>
                            );
                        })}
                    </g>
                </g>
                
                {hoveredCity && (
                    <g
                        transform={`translate(${tooltipPosition.x}, ${tooltipPosition.y}) scale(${1 / transform.k})`}
                        className={`transition-opacity duration-200 ${hoveredCity ? 'opacity-100' : 'opacity-0'}`}
                        style={{ pointerEvents: 'none' }}
                    >
                         <foreignObject 
                            x={15 * transform.k} 
                            y={-50 * transform.k} // Adjust position based on scale
                            width="230" 
                            height="130"
                         >
                             <div 
                                style={{ 
                                    backgroundColor: tooltipBg, 
                                    color: textColor, 
                                    border: `1px solid ${tooltipBorder}`, 
                                    boxShadow: `0 6px 15px ${shadow}`
                                }} 
                                className="p-3 rounded-lg text-sm"
                            >
                                <p className="font-bold text-base">{hoveredCity.name}</p>
                                {hoveredCity.region && <p className="text-xs text-[var(--text-secondary)]">Bölge: {hoveredCity.region}</p>}
                                {hoveredCity.population && <p className="text-xs text-[var(--text-secondary)]">Nüfus: ~{hoveredCity.population.toLocaleString('tr-TR')}</p>}
                                <p className="mt-2 italic">{hoveredCity.description}</p>
                            </div>
                        </foreignObject>
                    </g>
                )}
            </svg>
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 zoom-control">
                <button onClick={() => handleZoomAction(1.5)} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg shadow-md flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" aria-label="Yakınlaştır">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
                <button onClick={() => handleZoomAction(1/1.5)} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg shadow-md flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" aria-label="Uzaklaştır">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
            </div>
            <div className="absolute bottom-4 left-4 settings-control">
                <div className={`transition-all duration-300 ease-in-out ${isSettingsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                    <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-3 w-48 mb-2 border border-gray-200/50">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">İşaretçi Stili</label>
                            <div className="flex justify-around items-center">
                                <button onClick={() => setMarkerStyle('circle')} aria-label="Daire stili" className={`p-2 rounded-md ${markerStyle === 'circle' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                                    <svg viewBox="-8 -8 16 16" className="w-5 h-5"><circle r={6} fill={markerColor} stroke="white" strokeWidth={1.5} /><circle r={2.5} fill="white" /></svg>
                                </button>
                                <button onClick={() => setMarkerStyle('pin')} aria-label="Raptiye stili" className={`p-2 rounded-md ${markerStyle === 'pin' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                                    <svg viewBox="-8 -14 16 16" className="w-5 h-5"><path d={MARKER_PATHS.pin} fill={markerColor} /></svg>
                                </button>
                                 <button onClick={() => setMarkerStyle('star')} aria-label="Yıldız stili" className={`p-2 rounded-md ${markerStyle === 'star' ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                                    <svg viewBox="-7 -8 14 16" className="w-5 h-5"><path d={MARKER_PATHS.star} fill={markerColor} /></svg>
                                </button>
                            </div>
                        </div>
                        <hr className="my-2 border-t border-gray-200" />
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-2">Varsayılan Renk</label>
                            <div className="flex justify-around">
                                {MARKER_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setMarkerColor(color.value)}
                                        aria-label={`Renk ${color.name}`}
                                        className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${markerColor === color.value ? 'ring-2 ring-offset-2 ring-blue-400' : 'ring-1 ring-gray-300'}`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full shadow-md flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" aria-label="İşaretçi ayarlarını aç/kapat" aria-expanded={isSettingsOpen}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300" style={{ transform: isSettingsOpen ? 'rotate(90deg)' : 'none' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ItalianMap;