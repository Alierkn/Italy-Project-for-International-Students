import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ChatMessage } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { marked } from 'marked';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            text: "Merhaba! Ben Guido, İtalya eğitim yolculuğunuzdaki kişisel AI danışmanınızım. Vize, konaklama, şehir yaşamı gibi konularda merak ettiklerinizi sorabilirsiniz. Size nasıl yardımcı olabilirim?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: 'You are "Guido", an expert AI assistant for Turkish students planning to study in Italy. Your tone is friendly, encouraging, and helpful. You provide concise, accurate information formatted in Markdown. You must always answer in Turkish.',
                    },
                });
            } catch (error) {
                 console.error("Failed to initialize Gemini Chat:", error);
                 setMessages(prev => [...prev, { role: 'model', text: 'Üzgünüm, şu anda AI danışmanına bağlanırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.' }]);
            }
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const chat = chatRef.current;
            const response = await chat.sendMessage({ message: userMessage.text });
            const modelMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message to Gemini:", error);
            const errorMessage: ChatMessage = { role: 'model', text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' };
            setMessages(prev => [...prev, errorMessage]);
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
                className="bg-[var(--bg-primary)] rounded-2xl shadow-2xl w-full h-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'scale-in 0.3s forwards' }}
            >
                <header className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-lg shadow-md">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.93 8.93 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.416 11.92a6.962 6.962 0 003.584 3.584L7.017 17.47l.005-.003-.018.018-2.479.827c-.03.01-.058.022-.086.034a7.008 7.008 0 00-1.42 5.087l2.875-.958.003.001z" clipRule="evenodd" /></svg>
                        </div>
                        <div>
                             <h2 className="text-xl font-bold text-gray-800">AI Danışman</h2>
                             <p className="text-sm text-gray-500">Kişisel Rehberiniz Guido</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 bg-gray-100 hover:bg-gray-200" aria-label="Sohbeti Kapat">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            <div className={`prose prose-sm max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}></div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                             </div>
                             <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-bl-none">
                                <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                
                <footer className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Bir soru sorun..."
                            disabled={isLoading}
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:bg-gray-100"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </footer>
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

export default Chatbot;
