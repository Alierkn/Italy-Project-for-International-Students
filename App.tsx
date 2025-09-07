import React, { useState, useCallback, useEffect } from 'react';
import { City, Topic, SurveyAnswers, CityRecommendation } from './types';
import { CITIES, TOPICS } from './constants';
import { fetchInfo, fetchAllCityIntros, fetchSurveyRecommendations } from './services/geminiService';
import Header from './components/Header';
import ItalianMap from './components/ItalianMap';
import InfoPanel from './components/InfoPanel';
import SkeletonLoader from './components/SkeletonLoader';
import SearchBar from './components/SearchBar';
import WelcomeTour from './components/WelcomeTour';
import ComparisonPanel from './components/ComparisonPanel';
import Survey from './components/Survey';
import RecommendationsPanel from './components/RecommendationsPanel';
import UniversityFinder from './components/UniversityFinder';
import Chatbot from './components/Chatbot';


interface InfoContent {
    html: string;
    sources: { web: { uri: string; title: string } }[] | null;
}

const FullScreenLoader: React.FC<{ message: string, subMessage: string }> = ({ message, subMessage }) => (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm gap-4 transition-opacity duration-500">
        <div className="w-16 h-16 border-4 border-t-transparent border-[var(--accent-primary)] rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-[var(--text-secondary)]">{message}</h2>
        <p className="text-[var(--text-secondary)]">{subMessage}</p>
    </div>
);

const App: React.FC = () => {
    const [cities, setCities] = useState<City[]>(CITIES);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [zoomToCity, setZoomToCity] = useState<City | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [infoContent, setInfoContent] = useState<InfoContent>({ html: '', sources: null });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedNextCity, setSuggestedNextCity] = useState<City | null>(null);

    // New features state
    const [showTour, setShowTour] = useState<boolean>(false);
    const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
    const [comparisonList, setComparisonList] = useState<City[]>([]);
    const [isComparisonPanelOpen, setIsComparisonPanelOpen] = useState<boolean>(false);
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [isFinderOpen, setIsFinderOpen] = useState<boolean>(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

    // Survey & Recommendation State
    const [showSurvey, setShowSurvey] = useState<boolean>(false);
    const [isSurveyLoading, setIsSurveyLoading] = useState<boolean>(false);
    const [cityRecommendations, setCityRecommendations] = useState<CityRecommendation[]>([]);


    // App Initialization: Load cached data, then fetch fresh data
    useEffect(() => {
        const CITIES_STORAGE_KEY = 'italy_guide_cities';

        const initializeApp = async () => {
            let isDataLoaded = false;
            // 1. Load cached cities for a fast initial render
            try {
                const cachedCitiesRaw = localStorage.getItem(CITIES_STORAGE_KEY);
                if (cachedCitiesRaw) {
                    const cachedCities = JSON.parse(cachedCitiesRaw);
                    if (Array.isArray(cachedCities) && cachedCities.length > 0 && cachedCities[0].id) {
                        setCities(cachedCities);
                        isDataLoaded = true;
                    }
                }
            } catch (e) {
                console.error("Failed to parse cached cities", e);
            }

            // 2. Fetch fresh city data to update UI and cache
            try {
                const updatedCities = await fetchAllCityIntros(CITIES);
                setCities(updatedCities);
                isDataLoaded = true;
                localStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(updatedCities));
            } catch (error) {
                console.error("Could not fetch fresh city data, using cached/static.", error);
                if (!isDataLoaded) {
                    setCities(CITIES); // Fallback to static data if cache and fetch fail
                }
            }

            // 3. Handle tour and survey display logic
            if (!localStorage.getItem('hasSeenTour')) {
                setShowTour(true);
            } else if (!localStorage.getItem('hasCompletedSurvey')) {
                setShowSurvey(true);
            }
        };

        initializeApp();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const cityId = params.get('city');
        const topicId = params.get('topic');

        if (cityId && topicId && !selectedCity) {
            const city = cities.find(c => c.id === cityId);
            const topic = TOPICS.find(t => t.id === topicId);
            if (city && topic) {
                setSelectedCity(city);
                setZoomToCity(city);
                setSelectedTopic(topic);
                setIsPanelOpen(true);
                 window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [cities, selectedCity]);


    useEffect(() => {
        if (!selectedCity || !selectedTopic || isComparisonMode) {
            return;
        }

        const fetchContent = async () => {
            setError(null);
            const INFO_CONTENT_STORAGE_KEY = `info_content_${selectedCity.id}_${selectedTopic.id}`;

            let hasCache = false;
            try {
                const cachedContentRaw = localStorage.getItem(INFO_CONTENT_STORAGE_KEY);
                if (cachedContentRaw) {
                    const cachedContent = JSON.parse(cachedContentRaw);
                    if (cachedContent.html) {
                        setInfoContent(cachedContent);
                        hasCache = true;
                    }
                }
            } catch (e) {
                console.error("Failed to parse cached info content", e);
                localStorage.removeItem(INFO_CONTENT_STORAGE_KEY);
            }
            
            if (!hasCache) {
                 setIsLoading(true);
                 setInfoContent({ html: '', sources: null });
            }

            try {
                const { htmlContent, sources } = await fetchInfo(selectedCity.name, selectedTopic.name, selectedTopic.id);
                const freshContent = { html: htmlContent, sources };
                setInfoContent(freshContent);
                localStorage.setItem(INFO_CONTENT_STORAGE_KEY, JSON.stringify(freshContent));
            } catch (err) {
                if (!hasCache) {
                    setError('Bilgiler alınırken bir hata oluştu. Lütfen tekrar deneyin.');
                }
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [selectedCity, selectedTopic, isComparisonMode]);

     useEffect(() => {
        if (selectedCity) {
            let closestCity: City | null = null;
            let minDistance = Infinity;

            const { x: x1, y: y1 } = selectedCity.coords;

            cities.forEach(city => {
                if (city.id === selectedCity.id) return; // Skip self

                const { x: x2, y: y2 } = city.coords;
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCity = city;
                }
            });
            setSuggestedNextCity(closestCity);
        } else {
            setSuggestedNextCity(null);
        }
    }, [selectedCity, cities]);


    const handleCitySelect = (city: City) => {
        if (isComparisonMode) {
            setComparisonList(prev => {
                const isAlreadyInList = prev.some(c => c.id === city.id);
                if (isAlreadyInList) {
                    return prev.filter(c => c.id !== city.id);
                }
                if (prev.length < 3) {
                    return [...prev, city];
                }
                // Optionally provide feedback that the limit is reached
                alert("En fazla 3 şehir karşılaştırabilirsiniz.");
                return prev;
            });
        } else {
            if (selectedCity?.id === city.id) {
                handleReset();
            } else {
                setSelectedCity(city);
                setZoomToCity(city);
                setSelectedTopic(null);
                setIsPanelOpen(true);
            }
        }
    };

    const handleTopicSelect = useCallback((topic: Topic) => {
        if (!selectedCity) return;
        
        setSelectedTopic(topic);
        setIsPanelOpen(true);
    }, [selectedCity]);
    
    const handleReset = () => {
        setSelectedCity(null);
        setZoomToCity(null);
        setSelectedTopic(null);
        setInfoContent({ html: '', sources: null });
        setIsPanelOpen(false);
        setIsComparisonMode(false);
        setComparisonList([]);
        setCityRecommendations([]);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setSelectedTopic(null);
    };

    const handleRetry = useCallback(() => {
        if (selectedTopic) {
            setSelectedTopic({ ...selectedTopic });
        }
    }, [selectedTopic]);

     const handleTourFinish = () => {
        localStorage.setItem('hasSeenTour', 'true');
        setShowTour(false);
        if (!localStorage.getItem('hasCompletedSurvey')) {
            setShowSurvey(true);
        }
    };
    
    const handleToggleComparisonMode = () => {
        setIsComparisonMode(prev => !prev);
        handleReset();
    };

    const handleSurveySubmit = async (answers: SurveyAnswers) => {
        setShowSurvey(false);
        setIsSurveyLoading(true);
        try {
            const recommendations = await fetchSurveyRecommendations(answers, cities);
            setCityRecommendations(recommendations);
        } catch (error) {
            console.error("Failed to get recommendations", error);
            alert("Size özel öneriler alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        } finally {
            setIsSurveyLoading(false);
            localStorage.setItem('hasCompletedSurvey', 'true');
        }
    };
    
    const handleSurveySkip = () => {
        setShowSurvey(false);
        localStorage.setItem('hasCompletedSurvey', 'true');
    };

    const handleStartSurvey = () => {
        handleReset();
        setShowSurvey(true);
    };

    const handleOpenFinder = () => setIsFinderOpen(true);
    const handleCloseFinder = () => setIsFinderOpen(false);

    const handleOpenChatbot = () => setIsChatbotOpen(true);
    const handleCloseChatbot = () => setIsChatbotOpen(false);
    
    const handleTravelToNextCity = () => {
        if (suggestedNextCity) {
            handleCitySelect(suggestedNextCity);
        }
    };


    const renderPanelContent = () => {
        if (isLoading) return <SkeletonLoader />;
        if (error) return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-semibold mb-4">{error}</p>
                <button 
                    onClick={handleRetry} 
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Tekrar Dene
                </button>
            </div>
        );
        return (
            <div className="p-6">
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: infoContent.html }} />
                {infoContent.sources && infoContent.sources.length > 0 && (
                    <div className="sources-section">
                        <h3><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 -mt-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>Doğrulama Kaynakları</h3>
                        <ul className="sources-list">
                            {infoContent.sources.map((source, index) => (
                                <li key={index}>
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer">
                                        <span className="source-title">{source.web.title || 'Untitled'}</span>
                                        <span className="source-uri">{new URL(source.web.uri).hostname}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-screen font-sans antialiased flex flex-col overflow-hidden relative">
            {showTour && <WelcomeTour onFinish={handleTourFinish} />}
            {showSurvey && <Survey onFinish={handleSurveySubmit} onSkip={handleSurveySkip} />}
            {isSurveyLoading && <FullScreenLoader message="Size özel öneriler hazırlanıyor..." subMessage="AI tercihlerinizi analiz ediyor." />}
            
            <Header 
                isVisible={!isPanelOpen && !isComparisonPanelOpen && !isFinderOpen && !isChatbotOpen} 
                isComparisonMode={isComparisonMode}
                onToggleComparisonMode={handleToggleComparisonMode}
                onStartSurvey={handleStartSurvey}
                onOpenFinder={handleOpenFinder}
            />
            <main className="flex-grow relative">
                {isComparisonMode && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg p-2 bg-yellow-100 text-yellow-800 rounded-lg shadow-lg text-center border border-yellow-300">
                        <p className="font-semibold">Karşılaştırma Modu Aktif</p>
                        <p className="text-sm">Haritadan en fazla 3 şehir seçin.</p>
                    </div>
                )}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 mt-16">
                   {!isComparisonMode && <SearchBar cities={cities} onCitySelect={handleCitySelect} />}
                </div>
                <ItalianMap 
                    cities={cities} 
                    selectedCity={selectedCity}
                    onCitySelect={handleCitySelect} 
                    zoomToCity={zoomToCity}
                    onResetView={handleReset}
                    isComparisonMode={isComparisonMode}
                    comparisonList={comparisonList}
                    recommendations={cityRecommendations}
                />
                
                 {isComparisonMode && comparisonList.length >= 2 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                        <button 
                            onClick={() => setIsComparisonPanelOpen(true)}
                            className="px-8 py-4 bg-[var(--city-comparison)] text-white font-bold rounded-full shadow-2xl text-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 ease-in-out"
                        >
                           {comparisonList.length} Şehri Karşılaştır
                        </button>
                    </div>
                )}
                 {cityRecommendations.length > 0 && !isComparisonMode && (
                    <RecommendationsPanel 
                        recommendations={cityRecommendations}
                        cities={cities}
                        onCitySelect={(city) => {
                            setSelectedCity(city);
                            setZoomToCity(city);
                            setIsPanelOpen(true);
                        }}
                        onClose={() => setCityRecommendations([])}
                    />
                )}
                 <button
                    onClick={handleOpenChatbot}
                    className="fixed bottom-6 right-6 z-20 w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[var(--shadow-color-light)]"
                    aria-label="AI Danışmanı'nı Aç"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.93 8.93 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 11.92a6.962 6.962 0 003.584 3.584L7.017 17.47l.005-.003-.018.01_8a1.5 1.5 0 001.5-1.5V12a1 1 0 112 0v2.5a1.5 1.5 0 001.5 1.5h.5a1.5 1.5 0 001.5-1.5v-2.5a1 1 0 112 0v2.5a1.5 1.5 0 001.5 1.5h.5a1.5 1.5 0 001.5-1.5V12a1 1 0 112 0v2.5a1.5 1.5 0 001.5 1.5h.084l1.983-5.949a6.963 6.963 0 00-3.584-3.584L4.017 8.03l.005.003-.018-.018-2.479.827c-.03.01-.058.022-.086.034a7.008 7.008 0 00-1.42 5.087l2.875-.958.003.001z" clipRule="evenodd" />
                    </svg>
                </button>
            </main>
            <InfoPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                city={selectedCity}
                topic={selectedTopic}
                topics={TOPICS}
                onTopicSwitch={handleTopicSelect}
                suggestedNextCity={suggestedNextCity}
                onTravelToNextCity={handleTravelToNextCity}
            >
                {renderPanelContent()}
            </InfoPanel>
             <ComparisonPanel
                isOpen={isComparisonPanelOpen}
                onClose={() => setIsComparisonPanelOpen(false)}
                cities={comparisonList}
                topics={TOPICS}
            />
            <UniversityFinder
                isOpen={isFinderOpen}
                onClose={handleCloseFinder}
            />
             <Chatbot
                isOpen={isChatbotOpen}
                onClose={handleCloseChatbot}
            />
        </div>
    );
};

export default App;