import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4" aria-label="Loading content">
            <div className="w-12 h-12 border-4 border-t-transparent border-[var(--accent-primary)] rounded-full animate-spin"></div>
            <p className="text-[var(--text-secondary)]">Bilgiler yükleniyor...</p>
        </div>
    );
};

export default LoadingSpinner;
