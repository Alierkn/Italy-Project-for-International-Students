import React from 'react';
import { City, CityRecommendation } from '../types';

interface RecommendationsPanelProps {
    recommendations: CityRecommendation[];
    cities: City[];
    onCitySelect: (city: City) => void;
    onClose: () => void;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations, cities, onCitySelect, onClose }) => {
    
    // Map recommendations to full city objects
    const recommendedCities = recommendations.map(rec => {
        const cityDetails = cities.find(c => c.id === rec.cityId);
        return { ...cityDetails, reason: rec.reason };
    }).filter(c => c.id); // Filter out any that weren't found

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-4xl px-4 transition-all duration-500 ease-in-out animate-slide-up"
            role="alert"
            aria-live="polite"
        >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                <header className="p-4 flex justify-between items-center bg-amber-50 border-b border-amber-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-2 rounded-lg shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89a1.5 1.5 0 01-1.302.964l-2.942.34a1.5 1.5 0 00-.945 2.65L4.51 11.9a1.5 1.5 0 01-.44 1.634l-2.01 2.472a1.5 1.5 0 00.945 2.65l2.942.34a1.5 1.5 0 011.302.964l.65 2.72c.38 1.56 2.6 1.56 2.98 0l.65-2.72a1.5 1.5 0 011.302-.964l2.942-.34a1.5 1.5 0 00.945-2.65l-2.01-2.472a1.5 1.5 0 01-.44-1.634l.65-2.72a1.5 1.5 0 00-.945-2.65l-2.942-.34a1.5 1.5 0 01-1.302-.964L11.49 3.17z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-900">Sana Özel Önerilerimiz</h2>
                            <p className="text-sm text-amber-700">Anket sonuçlarına göre senin için en uygun şehirler.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-amber-600 bg-amber-100 hover:bg-amber-200" 
                        aria-label="Önerileri kapat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedCities.map((city, index) => {
                         if (!city || !city.id) return null;
                         const fullCity = cities.find(c => c.id === city.id);
                         if (!fullCity) return null;

                        return (
                            <div 
                                key={city.id} 
                                className="group bg-white rounded-lg shadow-md border border-gray-200/80 overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                                onClick={() => onCitySelect(fullCity)}
                                style={{ animation: `fade-in-up 0.5s ${index * 150}ms ease-out forwards`, opacity: 0 }}
                            >
                                <div className="relative h-32">
                                    <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <h3 className="absolute bottom-2 left-3 text-white text-lg font-bold drop-shadow-md">{city.name}</h3>
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-gray-600 italic">"{city.reason}"</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { transform: translate(-50%, 100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RecommendationsPanel;
