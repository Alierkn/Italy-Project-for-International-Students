import React, { useState, useEffect } from 'react';
import { City, Topic, CityComparisonResult, SubTopic } from '../types';
import { fetchStructuredComparison } from '../services/geminiService';
import SkeletonLoader from './SkeletonLoader';
import RadarChart from './RadarChart';

interface ComparisonPanelProps {
    isOpen: boolean;
    onClose: () => void;
    cities: City[];
    topics: Topic[];
}

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ isOpen, onClose, cities, topics }) => {
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [selectedSubTopics, setSelectedSubTopics] = useState<Set<string>>(new Set());
    const [comparisonData, setComparisonData] = useState<CityComparisonResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset state if panel is closed or cities change
        if (!isOpen || cities.length === 0) {
            setSelectedTopic(null);
            setSelectedSubTopics(new Set());
            setComparisonData([]);
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen, cities]);

    const handleTopicSelect = (topic: Topic) => {
        setSelectedTopic(topic);
        // Reset sub-topics and data when main topic changes
        setSelectedSubTopics(new Set(topic.subTopics.map(st => st.id))); // Select all by default
        setComparisonData([]);
        setError(null);
    };

    const handleSubTopicToggle = (subTopicId: string) => {
        setSelectedSubTopics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subTopicId)) {
                newSet.delete(subTopicId);
            } else {
                newSet.add(subTopicId);
            }
            return newSet;
        });
    };

    const handleGenerateComparison = async () => {
        if (!selectedTopic || selectedSubTopics.size === 0) {
            setError("Lütfen karşılaştırmak için en az bir alt konu seçin.");
            return;
        }
        
        setIsLoading(true);
        setComparisonData([]);
        setError(null);

        const subTopicsToFetch = selectedTopic.subTopics.filter(st => selectedSubTopics.has(st.id));

        try {
            const results = await Promise.all(
                cities.map(async (city) => {
                    try {
                        const data = await fetchStructuredComparison(city, selectedTopic.name, subTopicsToFetch);
                        return { cityId: city.id, data };
                    } catch (error) {
                        console.error(`Failed to fetch data for ${city.name}:`, error);
                        return { cityId: city.id, data: [], error: `Veri alınamadı.` };
                    }
                })
            );
            setComparisonData(results);
        } catch (err) {
            setError("Karşılaştırma verileri alınırken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
             return <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6"><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></div>;
        }

        if (error) {
            return <div className="p-6 text-center text-red-500">{error}</div>;
        }
        
        if (comparisonData.length > 0) {
            const subTopicsForChart = selectedTopic?.subTopics.filter(st => selectedSubTopics.has(st.id)) || [];
            return (
                <div className="p-6 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-700">Genel Bakış Skoru</h3>
                        <div className="bg-white p-4 rounded-lg shadow-md border max-w-4xl mx-auto">
                           <RadarChart cities={cities} results={comparisonData} subTopics={subTopicsForChart} />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-center mb-4 text-gray-700">Detaylı Değerlendirme</h3>
                        <div className="space-y-4">
                           {subTopicsForChart.map(subTopic => (
                               <div key={subTopic.id} className="bg-white p-4 rounded-lg shadow-md border">
                                   <h4 className="text-lg font-semibold mb-3 text-gray-800">{subTopic.name}</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                       {comparisonData.map(result => {
                                           const city = cities.find(c => c.id === result.cityId);
                                           const dataPoint = result.data.find(d => d.subTopic === subTopic.name);
                                           return (
                                               <div key={result.cityId} className="flex flex-col bg-gray-50 rounded-lg border h-full">
                                                    <h5 className="font-semibold text-gray-700 text-center p-2 bg-gray-100 border-b rounded-t-lg">{city?.name}</h5>
                                                    <div className="p-3 space-y-2 flex-grow flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                           <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                               <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(dataPoint?.rating ?? 0) * 10}%` }}></div>
                                                           </div>
                                                           <span className="text-sm font-semibold text-gray-600">{(dataPoint?.rating ?? 0)}/10</span>
                                                       </div>
                                                       <p className="text-sm text-gray-600 mt-2 flex-grow">{dataPoint?.summary ?? '...'}</p>
                                                   </div>
                                               </div>
                                           );
                                       })}
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center h-full p-6">
                <div className="text-center text-gray-500">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    <p className="font-semibold">{selectedTopic ? 'Lütfen alt konuları seçip "Karşılaştır" butonuna tıklayın.' : 'Lütfen karşılaştırmak için bir ana konu seçin.'}</p>
                </div>
            </div>
        );
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="fixed inset-y-0 right-0 w-full h-full bg-[var(--bg-primary)] shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out"
                style={{ maxWidth: '95vw' }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="sticky top-0 z-20 p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Şehir Karşılaştırması</h2>
                        <p className="text-sm text-gray-500">{cities.map(c => c.name).join(', ')}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200" aria-label="Karşılaştırmayı kapat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                
                <nav className="sticky top-[81px] z-20 p-4 border-b border-gray-200 bg-white/90 backdrop-blur-sm space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">1. Ana Konu Seçin:</label>
                        <ul className="flex flex-wrap items-center justify-center gap-3">
                            {topics.map(t => (
                                <li key={t.id}>
                                    <button onClick={() => handleTopicSelect(t)} aria-pressed={selectedTopic?.id === t.id}
                                        className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-all ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedTopic?.id === t.id ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {React.cloneElement(t.icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
                                        {t.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {selectedTopic && (
                         <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">2. Alt Konuları Seçin:</label>
                             <div className="flex flex-wrap items-center justify-center gap-3">
                                 {selectedTopic.subTopics.map(st => (
                                     <button key={st.id} onClick={() => handleSubTopicToggle(st.id)} aria-pressed={selectedSubTopics.has(st.id)}
                                         className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors ${selectedSubTopics.has(st.id) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                                         {st.name}
                                     </button>
                                 ))}
                             </div>
                         </div>
                    )}
                    {selectedTopic && (
                        <div className="text-center pt-2">
                             <button onClick={handleGenerateComparison} disabled={isLoading || selectedSubTopics.size === 0}
                                 className="px-8 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                                 Karşılaştır
                             </button>
                        </div>
                    )}
                </nav>

                <main className="flex-grow overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ComparisonPanel;