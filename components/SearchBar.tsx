import React, { useState, useEffect, useRef, useCallback } from 'react';
import { City } from '../types';

interface SearchBarProps {
    cities: City[];
    onCitySelect: (city: City) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ cities, onCitySelect }) => {
    const [query, setQuery] = useState('');
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim() !== '') {
            const lowerCaseQuery = query.toLowerCase();
            const results = cities.filter(city =>
                city.name.toLowerCase().includes(lowerCaseQuery)
            );
            setFilteredCities(results);
            setIsDropdownOpen(results.length > 0);
            setActiveIndex(-1);
        } else {
            setFilteredCities([]);
            setIsDropdownOpen(false);
        }
    }, [query, cities]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleSelect = (city: City) => {
        setQuery('');
        setIsDropdownOpen(false);
        onCitySelect(city);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isDropdownOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev < filteredCities.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < filteredCities.length) {
                    handleSelect(filteredCities[activeIndex]);
                }
            } else if (e.key === 'Escape') {
                setIsDropdownOpen(false);
            }
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Bir şehir arayın (örn. Roma)"
                    className="w-full px-4 py-3 pr-10 text-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition"
                    aria-autocomplete="list"
                    aria-expanded={isDropdownOpen}
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>
            
            {isDropdownOpen && (
                <ul className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto" role="listbox">
                    {filteredCities.map((city, index) => (
                        <li
                            key={city.id}
                            onClick={() => handleSelect(city)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${activeIndex === index ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-gray-50'}`}
                            role="option"
                            aria-selected={activeIndex === index}
                        >
                            <span className="font-semibold text-[var(--text-primary)]">{city.name}</span>
                            <span className="text-sm text-[var(--text-secondary)] ml-2">- {city.description}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
