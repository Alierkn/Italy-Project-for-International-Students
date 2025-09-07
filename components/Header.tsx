import React from 'react';

interface HeaderProps {
    isVisible: boolean;
    isComparisonMode: boolean;
    onToggleComparisonMode: () => void;
    onStartSurvey: () => void;
    onOpenFinder: () => void;
}

const Header: React.FC<HeaderProps> = ({ isVisible, isComparisonMode, onToggleComparisonMode, onStartSurvey, onOpenFinder }) => {
    return (
        <header
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg transition-all duration-500 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className="container mx-auto bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
                <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="bg-gradient-to-br from-[var(--accent-secondary)] to-[var(--accent-primary)] p-2 rounded-lg shadow-md mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">
                                İtalya Eğitim Rehberi
                            </h1>
                            <p className="text-sm text-[var(--text-secondary)]">AI Destekli Öğrenci Danışmanınız</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                         <button
                            onClick={onOpenFinder}
                            title="Üniversite ve bölüm ara"
                            className="p-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out flex items-center gap-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200"
                         >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4A7.969 7.969 0 0011 4.804v11.392A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
                             </svg>
                        </button>
                        <button
                            onClick={onStartSurvey}
                            title="Kişiselleştirilmiş şehir önerileri için anketi yenile"
                            className="p-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out flex items-center gap-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200"
                         >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89a1.5 1.5 0 01-1.302.964l-2.942.34a1.5 1.5 0 00-.945 2.65L4.51 11.9a1.5 1.5 0 01-.44 1.634l-2.01 2.472a1.5 1.5 0 00.945 2.65l2.942.34a1.5 1.5 0 011.302.964l.65 2.72c.38 1.56 2.6 1.56 2.98 0l.65-2.72a1.5 1.5 0 011.302-.964l2.942-.34a1.5 1.5 0 00.945-2.65l-2.01-2.472a1.5 1.5 0 01-.44-1.634l.65-2.72a1.5 1.5 0 00-.945-2.65l-2.942-.34a1.5 1.5 0 01-1.302-.964L11.49 3.17z" clipRule="evenodd" /></svg>
                        </button>
                        <button
                            onClick={onToggleComparisonMode}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out flex items-center gap-1.5 ${
                                isComparisonMode
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-gray-100 text-[var(--text-secondary)] hover:bg-gray-200'
                            }`}
                            aria-pressed={isComparisonMode}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                             </svg>
                            {isComparisonMode ? 'Çıkış' : 'Karşılaştır'}
                        </button>
                     </div>
                </div>
            </div>
        </header>
    );
};

export default Header;