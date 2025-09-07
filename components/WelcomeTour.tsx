import React, { useState } from 'react';

interface WelcomeTourProps {
    onFinish: () => void;
}

const TOUR_STEPS = [
    {
        title: "İtalya Eğitim Rehberine Hoş Geldiniz!",
        content: "Bu interaktif rehber, İtalya'daki eğitim hayatınız için AI destekli bilgiler sunar. Keşfetmeye hazır mısınız?",
        icon: '👋'
    },
    {
        title: "Haritadan Bir Şehir Seçin",
        content: "İtalya haritası üzerinde ilgilendiğiniz şehre tıklayarak o şehirle ilgili bilgi alabilirsiniz. Haritayı sürükleyebilir ve yakınlaştırabilirsiniz.",
        icon: '🗺️'
    },
    {
        title: "Konu Başlıklarını Keşfedin",
        content: "Bir şehir seçtiğinizde, konaklama, üniversiteler, sosyal yaşam gibi konularda detaylı bilgi alabileceğiniz bir menü açılır.",
        icon: '📚'
    },
    {
        title: "Detaylı Bilgi Alın",
        content: "Bir konuya tıkladığınızda, AI tarafından sizin için özel olarak hazırlanmış detaylı bilgilerin yer aldığı bir panel açılır.",
        icon: '🤖'
    },
    {
        title: "Şehirleri Karşılaştırın",
        content: "Kararsız mı kaldınız? 'Karşılaştır' modunu kullanarak 3 şehre kadar seçip aynı konu başlığında kıyaslama yapabilirsiniz.",
        icon: '📊'
    },
];

const WelcomeTour: React.FC<WelcomeTourProps> = ({ onFinish }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onFinish();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 welcome-tour-backdrop" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in" style={{ animation: 'scale-in 0.3s forwards' }}>
                <div className="p-8 text-center">
                    <div className="text-6xl mb-4">{step.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{step.title}</h2>
                    <p className="text-gray-600 mb-8">{step.content}</p>

                    <div className="flex items-center justify-center mb-6">
                        {TOUR_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2.5 h-2.5 rounded-full mx-1 transition-all duration-300 ${
                                    currentStep === index ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex bg-gray-50 p-4 rounded-b-2xl">
                    {currentStep > 0 ? (
                         <button
                            onClick={handlePrev}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition px-4 py-2"
                        >
                            Geri
                        </button>
                    ) : <div className="w-20"></div>}
                    <button
                        onClick={handleNext}
                        className="ml-auto bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                    >
                        {currentStep === TOUR_STEPS.length - 1 ? 'Başla!' : 'İleri'}
                    </button>
                </div>
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

export default WelcomeTour;
