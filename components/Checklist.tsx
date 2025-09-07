import React, { useState, useEffect, useMemo } from 'react';
import { City } from '../types';
import { CHECKLIST_STAGES } from '../constants';

interface ChecklistProps {
    city: City;
}

const Checklist: React.FC<ChecklistProps> = ({ city }) => {
    const storageKey = `checklist_${city.id}`;
    const allItemIds = useMemo(() => CHECKLIST_STAGES.flatMap(stage => stage.items.map(item => item.id)), []);
    const totalItems = allItemIds.length;

    const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch (error) {
            console.error("Error reading checklist from localStorage", error);
            return new Set();
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(Array.from(checkedItems)));
        } catch (error) {
            console.error("Error saving checklist to localStorage", error);
        }
    }, [checkedItems, storageKey]);

    const handleToggle = (itemId: string) => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const progress = totalItems > 0 ? (checkedItems.size / totalItems) * 100 : 0;

    return (
        <div className="p-6 bg-white h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Başvuru Yol Haritası</h3>
            <p className="text-sm text-gray-600 mb-6">İtalya eğitim yolculuğunuzdaki adımları takip edin ve ilerlemenizi kaydedin.</p>
            
            <div className="mb-8 sticky top-0 bg-white/80 backdrop-blur-sm py-2">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-blue-700">İlerleme</span>
                    <span className="text-sm font-bold text-blue-700">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="space-y-4">
                {CHECKLIST_STAGES.map((stage, stageIndex) => (
                    <details key={stageIndex} className="group" open>
                        <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <h4 className="font-semibold text-gray-700">{stage.title}</h4>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <ul className="mt-2 ml-4 space-y-3 py-2 border-l-2 border-gray-100">
                            {stage.items.map(item => (
                                <li key={item.id} className="pl-4">
                                    <label className="flex items-start cursor-pointer text-gray-800">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                                            checked={checkedItems.has(item.id)}
                                            onChange={() => handleToggle(item.id)}
                                            aria-label={item.text}
                                        />
                                        <span className={`ml-3 text-sm transition-colors ${checkedItems.has(item.id) ? 'line-through text-gray-400' : ''}`}>
                                            {item.text}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default Checklist;