import React, { useState, useEffect } from 'react';
import { City, Topic, CityStat } from '../types';
import { addFeedback } from '../services/firebaseService';
import { fetchCityStats } from '../services/geminiService';
import BarChart from './BarChart';
import Checklist from './Checklist';

type PanelView = 'overview' | 'roadmap' | 'topics';

interface InfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
    city: City | null;
    topic: Topic | null;
    children: React.ReactNode;
    topics: Topic[];
    onTopicSwitch: (topic: Topic) => void;
    suggestedNextCity: City | null;
    onTravelToNextCity: () => void;
}

const FeedbackSection: React.FC<{ cityId: string; topicId: string }> = ({ cityId, topicId }) => {
    const feedbackKey = `feedback_${cityId}_${topicId}`;
    const [feedbackSent, setFeedbackSent] = useState<boolean>(!!localStorage.getItem(feedbackKey));

    useEffect(() => {
        setFeedbackSent(!!localStorage.getItem(feedbackKey));
    }, [feedbackKey]);

    const handleFeedback = async (type: 'like' | 'dislike') => {
        if (feedbackSent) return;
        try {
            await addFeedback(cityId, topicId, type);
            localStorage.setItem(feedbackKey, 'true');
            setFeedbackSent(true);
        } catch (error) {
            console.error("Failed to send feedback:", error);
            // Optionally, show an error to the user
        }
    };

    return (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-3">Bu bilgi faydalı oldu mu?</p>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => handleFeedback('like')}
                    disabled={feedbackSent}
                    className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-green-100 text-gray-600 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    aria-label="Faydalı"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.7 5.4" /></svg>
                </button>
                <button
                    onClick={() => handleFeedback('dislike')}
                    disabled={feedbackSent}
                    className="flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    aria-label="Faydalı değil"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3H12.75c.163 0 .326.02.485.06L20 4m-10 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l2.7-5.4" /></svg>
                </button>
            </div>
            {feedbackSent && <p className="text-xs text-green-600 mt-2 font-medium">Geri bildiriminiz için teşekkürler!</p>}
        </div>
    );
};


const InfoPanel: React.FC<InfoPanelProps> = ({ isOpen, onClose, city, topic, children, topics, onTopicSwitch, suggestedNextCity, onTravelToNextCity }) => {
    const [stats, setStats] = useState<CityStat[] | null>(null);
    const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<PanelView>('overview');

     useEffect(() => {
        if (isOpen && city) {
            // If a topic is already selected when opening, go to topics view, otherwise overview.
            setActiveView(topic ? 'topics' : 'overview');
        }
    }, [isOpen, city, topic]);

     useEffect(() => {
        if (isOpen && city && activeView === 'overview') {
            const getStats = async () => {
                setStatsError(null);
                const STATS_STORAGE_KEY = `city_stats_${city.id}`;

                let hasCache = false;
                try {
                    const cachedStatsRaw = localStorage.getItem(STATS_STORAGE_KEY);
                    if (cachedStatsRaw) {
                        const cachedStats = JSON.parse(cachedStatsRaw);
                        if (Array.isArray(cachedStats) && cachedStats.length > 0) {
                            setStats(cachedStats);
                            hasCache = true;
                        }
                    }
                } catch(e) {
                    console.error("Failed to parse cached stats", e);
                    localStorage.removeItem(STATS_STORAGE_KEY);
                }
                
                if (!hasCache) {
                    setIsStatsLoading(true);
                    setStats(null);
                }

                try {
                    const fetchedStats = await fetchCityStats(city);
                    setStats(fetchedStats);
                    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(fetchedStats));
                } catch (error) {
                    console.error("Failed to fetch city stats:", error);
                    if (!hasCache) {
                        setStatsError("Şehir istatistikleri alınamadı.");
                    }
                } finally {
                    setIsStatsLoading(false);
                }
            };
            getStats();
        }
    }, [isOpen, city, activeView]);

    const handleShare = async () => {
        if (!city) return;
        const shareUrl = topic && activeView === 'topics'
            ? `${window.location.origin}${window.location.pathname}?city=${city.id}&topic=${topic.id}`
            : `${window.location.origin}${window.location.pathname}?city=${city.id}`;

        const shareData = {
            title: `${city.name}${topic ? ` - ${topic.name}` : ''} | İtalya Eğitim Rehberi`,
            text: `İtalya'nın ${city.name} şehri hakkında bilgilere göz atın!`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Paylaşım linki panoya kopyalandı!'); // Replace with a better notification
            } catch (err) {
                console.error('Failed to copy link:', err);
                alert('Link kopyalanamadı.');
            }
        }
    };
    
    const handleTopicSelect = (selectedTopic: Topic) => {
        setActiveView('topics');
        onTopicSwitch(selectedTopic);
    };

    const renderOverview = () => {
        if (isStatsLoading) {
            return (
                 <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded-md w-full mb-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-6 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-6 animate-pulse"></div>
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="h-4 bg-gray-200 rounded-md w-1/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-md w-1/6 animate-pulse"></div>
                                </div>
                                <div className="h-2.5 bg-gray-200 rounded-full w-full animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                 </div>
            );
        }
        if (statsError) {
             return <div className="p-6 text-center text-red-500">{statsError}</div>;
        }
        if (stats) {
            return (
                <div className="p-6">
                    <p className="text-gray-600 mb-6">{city?.description}</p>
                    <BarChart stats={stats} />
                </div>
            )
        }
        return null;
    };
    
     const renderActiveView = () => {
        if (!city) return null;

        switch (activeView) {
            case 'roadmap':
                return <Checklist />;
            case 'topics':
                if (topic) {
                    return React.Children.map(children, child => {
                        if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
                            return React.cloneElement(child, {
                                ...child.props,
                                children: (
                                    <>
                                        {child.props.children}
                                        {city && topic && (
                                            <div className="p-6 pt-0">
                                                <FeedbackSection cityId={city.id} topicId={topic.id} />
                                            </div>
                                        )}
                                    </>
                                )
                            });
                        }
                        return child;
                    });
                }
                 return (
                     <div className="flex items-center justify-center h-full text-center text-gray-500 p-6">
                        <div>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            <p className="font-semibold">Yukarıdaki ikonlardan bir konu seçerek detaylı bilgi alabilirsiniz.</p>
                        </div>
                    </div>
                );
            case 'overview':
            default:
                return renderOverview();
        }
    };

    return (
        <aside
            className={`fixed top-0 right-0 z-30 h-full w-full max-w-lg bg-[var(--bg-secondary)] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!isOpen}
            aria-labelledby="info-panel-title"
        >
            <header className="sticky top-0 z-10 bg-[var(--bg-secondary)] shadow-sm">
                {city && (
                    <div className="relative h-40 bg-gray-800 text-white flex flex-col justify-end p-4">
                        <img src={city.imageUrl} alt={`View of ${city.name}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        <div className="relative z-10">
                            <h2 id="info-panel-title" className="text-2xl font-bold drop-shadow-lg">{city.name}</h2>
                            <p className="text-lg drop-shadow-md">
                                {activeView === 'overview' && 'Genel Bakış'}
                                {activeView === 'roadmap' && 'Başvuru Yol Haritası'}
                                {activeView === 'topics' && (topic?.name || 'Konu Seçin')}
                            </p>
                        </div>
                         <div className="absolute top-3 right-3 z-10 flex gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full text-white bg-black/30 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-colors"
                                aria-label="İçeriği paylaş"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full text-white bg-black/30 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-colors"
                                aria-label="Paneli kapat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
               
                {city && (
                     <div className="p-3 border-b border-[var(--border-color)] bg-white/95 backdrop-blur-sm space-y-3">
                         <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setActiveView('overview')} aria-pressed={activeView === 'overview'} className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${ activeView === 'overview' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-gray-100 hover:bg-gray-200' }`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 12.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                                 Genel Bakış
                             </button>
                             <button onClick={() => setActiveView('roadmap')} aria-pressed={activeView === 'roadmap'} className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${ activeView === 'roadmap' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'bg-gray-100 hover:bg-gray-200' }`}>
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L16 11.414V15a1 1 0 01-1 1H5a1 1 0 01-1-1v-3.586L3.293 9.707A1 1 0 013 9V3zm2 1v1h10V4H5zm10 4H5v3.586l2 2V14h6v-2.414l2-2V8z" clipRule="evenodd" /></svg>
                                 Yol Haritası
                             </button>
                         </div>
                         {suggestedNextCity && (
                            <div className="pt-2">
                                <button
                                    onClick={onTravelToNextCity}
                                    title={`En yakın şehir olan ${suggestedNextCity.name}'e git`}
                                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all bg-green-100 text-green-800 hover:bg-green-200 shadow-sm border border-green-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-4-4a2 2 0 010-2.828l3-3a2 2 0 112.828 2.828L8.707 7.5l3.879-3.879zM10 12a2 2 0 110 4 2 2 0 010-4z" clipRule="evenodd" />
                                    </svg>
                                    Sonraki Durak: <span className="font-bold">{suggestedNextCity.name}</span>
                                </button>
                            </div>
                         )}
                         <div className="pt-2">
                             <p className="text-xs text-center text-gray-500 mb-2">Detaylı Bilgi için Konu Seçin:</p>
                             <ul className="flex items-center justify-around">
                                 {topics.map(t => (
                                     <li key={t.id}>
                                         <button
                                             onClick={() => handleTopicSelect(t)}
                                             title={t.name}
                                             aria-label={`Konuyu ${t.name} olarak değiştir`}
                                             aria-pressed={topic?.id === t.id && activeView === 'topics'}
                                             className={`p-3 rounded-full transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] ${
                                                 topic?.id === t.id && activeView === 'topics'
                                                 ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                                                 : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                                             }`}
                                         >
                                             {t.icon}
                                         </button>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    </div>
                )}
            </header>
            <main className="flex-grow overflow-y-auto bg-white">
                {renderActiveView()}
            </main>
        </aside>
    );
};

export default InfoPanel;