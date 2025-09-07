import React, { useState } from 'react';
import { UniversityFilters, UniversityProgram } from '../types';
import { fetchUniversities } from '../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16" aria-label="Loading content">
        <div className="w-12 h-12 border-4 border-t-transparent border-[var(--accent-primary)] rounded-full animate-spin"></div>
        <p className="text-[var(--text-secondary)]">AI sizin için en iyi programları arıyor...</p>
    </div>
);


interface UniversityFinderProps {
    isOpen: boolean;
    onClose: () => void;
}

const UniversityFinder: React.FC<UniversityFinderProps> = ({ isOpen, onClose }) => {
    const [filters, setFilters] = useState<UniversityFilters>({
        fieldOfStudy: 'any',
        language: 'any',
        tuitionMax: 20000,
    });
    const [results, setResults] = useState<UniversityProgram[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);


    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: name === 'tuitionMax' ? parseInt(value, 10) : value,
        }));
    };

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const data = await fetchUniversities(filters);
            setResults(data);
        } catch (err) {
            setError('Üniversiteler alınırken bir hata oluştu. Lütfen filtrelerinizi değiştirip tekrar deneyin.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center" 
            onClick={onClose}
            role="dialog" 
            aria-modal="true"
        >
            <div
                className="bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'scale-in 0.3s forwards' }}
            >
                <header className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                         <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4A7.969 7.969 0 0011 4.804v11.392A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" />
                            </svg>
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">Akıllı Üniversite ve Bölüm Bulucu</h2>
                             <p className="text-sm text-gray-500">AI ile İtalya'daki programları keşfedin</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200" aria-label="Kapat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <div className="p-4 bg-white/50 border-b border-gray-200 flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">Alan</label>
                            <select id="fieldOfStudy" name="fieldOfStudy" value={filters.fieldOfStudy} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="any">Tümü</option>
                                <option value="art">Sanat & Tasarım</option>
                                <option value="tech">Mühendislik & Teknoloji</option>
                                <option value="social">Sosyal Bilimler</option>
                                <option value="health">Tıp & Sağlık</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Eğitim Dili</label>
                            <select id="language" name="language" value={filters.language} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                <option value="any">Tümü</option>
                                <option value="english">İngilizce</option>
                                <option value="italian">İtalyanca</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="tuitionMax" className="block text-sm font-medium text-gray-700 mb-1">Yıllık Harç (Max)</label>
                            <div className="flex items-center gap-2">
                               <input type="range" id="tuitionMax" name="tuitionMax" min="500" max="40000" step="500" value={filters.tuitionMax} onChange={handleFilterChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                               <span className="text-sm font-semibold text-gray-600 w-20 text-right">€{filters.tuitionMax.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                        <button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-all transform hover:scale-105">
                            {isLoading ? 'Aranıyor...' : 'Ara'}
                        </button>
                    </div>
                </div>

                <main className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="text-center text-red-500 p-8">{error}</div>
                    ) : results.length > 0 ? (
                        <div className="space-y-4">
                            {results.map((program, index) => (
                                <div key={index} className="bg-white rounded-lg shadow border p-4 transition-all hover:shadow-lg hover:border-blue-300">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-gray-800">{program.universityName}</h3>
                                            <p className="text-md font-semibold text-blue-700">{program.programName}</p>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-2">
                                                <span className="font-semibold">📍 {program.city}</span>
                                                <span>🌐 {program.language}</span>
                                                <span>💶 Yıllık ~€{program.annualFee.toLocaleString('tr-TR')}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 italic">"{program.description}"</p>
                                        </div>
                                        <a href={program.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-2 sm:mt-0 bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                                            Resmi Site
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full text-center text-gray-500 p-8">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <p className="font-semibold">{hasSearched ? 'Bu kriterlere uygun program bulunamadı.' : 'Filtreleri kullanarak İtalya\'daki ideal programınızı bulun.'}</p>
                                <p className="text-sm">{hasSearched ? 'Filtrelerinizi genişletmeyi deneyin.' : 'Yukarıdan seçim yapıp "Ara" butonuna tıklayın.'}</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <style>{`
                @keyframes scale-in {
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default UniversityFinder;