import React, { useState } from 'react';
import { SurveyAnswers } from '../types';

interface SurveyProps {
    onFinish: (answers: SurveyAnswers) => void;
    onSkip: () => void;
}

const Survey: React.FC<SurveyProps> = ({ onFinish, onSkip }) => {
    const [answers, setAnswers] = useState<SurveyAnswers>({
        budget: 'medium',
        cityLife: 'balanced',
        fieldOfStudy: 'tech',
    });

    const handleAnswerChange = <K extends keyof SurveyAnswers>(
        question: K,
        value: SurveyAnswers[K]
    ) => {
        setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFinish(answers);
    };

    const budgetOptions: { value: SurveyAnswers['budget']; label: string; description: string }[] = [
        { value: 'low', label: 'Ekonomik', description: '€500-€700' },
        { value: 'medium', label: 'Orta', description: '€700-€1000' },
        { value: 'high', label: 'Geniş', description: '€1000+' },
    ];
    
    const cityLifeOptions: { value: SurveyAnswers['cityLife']; label: string; description: string }[] = [
        { value: 'calm', label: 'Sakin', description: 'Tarihi ve huzurlu' },
        { value: 'balanced', label: 'Dengeli', description: 'Kültürel ve sosyal' },
        { value: 'vibrant', label: 'Hareketli', description: 'Modern ve dinamik' },
    ];
    
    const fieldOfStudyOptions: { value: SurveyAnswers['fieldOfStudy']; label: string; icon: string }[] = [
        { value: 'art', label: 'Sanat & Tasarım', icon: '🎨' },
        { value: 'tech', label: 'Mühendislik & Teknoloji', icon: '💻' },
        { value: 'social', label: 'Sosyal Bilimler', icon: '🏛️' },
        { value: 'health', label: 'Tıp & Sağlık', icon: '🩺' },
    ];

    const QuestionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
        </div>
    );
    
    const OptionButton: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({ selected, onClick, children, className }) => (
         <button
            type="button"
            onClick={onClick}
            className={`p-4 rounded-lg border-2 text-center transition-all duration-200 w-full h-full flex flex-col items-center justify-center ${
                selected 
                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500 ring-offset-2 ring-offset-white' 
                : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
            } ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 welcome-tour-backdrop" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in" style={{ animation: 'scale-in 0.3s forwards' }}>
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-3">✨</div>
                            <h2 className="text-2xl font-bold text-gray-800">Size Özel Şehir Önerileri</h2>
                            <p className="text-gray-600 mt-2">Birkaç soruyla İtalya'daki ideal şehrinizi bulmanıza yardımcı olalım.</p>
                        </div>

                        <QuestionCard title="1. Aylık ortalama bütçeniz ne kadar olacak?">
                             {budgetOptions.map(opt => (
                                 <OptionButton
                                    key={opt.value}
                                    selected={answers.budget === opt.value}
                                    onClick={() => handleAnswerChange('budget', opt.value)}
                                    className="md:col-span-1 col-span-2"
                                >
                                    <span className="font-semibold text-gray-800">{opt.label}</span>
                                    <span className="text-sm text-gray-500">{opt.description}</span>
                                </OptionButton>
                            ))}
                        </QuestionCard>

                        <QuestionCard title="2. Nasıl bir şehir hayatı tercih edersiniz?">
                             {cityLifeOptions.map(opt => (
                                 <OptionButton
                                    key={opt.value}
                                    selected={answers.cityLife === opt.value}
                                    onClick={() => handleAnswerChange('cityLife', opt.value)}
                                     className="md:col-span-1 col-span-2"
                                >
                                    <span className="font-semibold text-gray-800">{opt.label}</span>
                                    <span className="text-sm text-gray-500">{opt.description}</span>
                                </OptionButton>
                            ))}
                        </QuestionCard>

                         <QuestionCard title="3. Hangi alanda eğitim almayı düşünüyorsunuz?">
                             {fieldOfStudyOptions.map(opt => (
                                <OptionButton
                                    key={opt.value}
                                    selected={answers.fieldOfStudy === opt.value}
                                    onClick={() => handleAnswerChange('fieldOfStudy', opt.value)}
                                >
                                    <span className="text-3xl mb-1">{opt.icon}</span>
                                    <span className="font-semibold text-sm text-gray-800">{opt.label}</span>
                                </OptionButton>
                            ))}
                        </QuestionCard>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-b-2xl">
                         <button
                            type="button"
                            onClick={onSkip}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition px-4 py-2"
                        >
                            Şimdilik Atla
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                        >
                            Önerileri Göster
                        </button>
                    </div>
                </form>
                 <style>{`
                    @keyframes scale-in {
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Survey;
