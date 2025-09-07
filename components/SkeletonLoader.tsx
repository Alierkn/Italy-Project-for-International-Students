import React from 'react';

const SkeletonLoader: React.FC = () => {
    return (
        <div className="p-6 animate-pulse" role="status" aria-label="İçerik yükleniyor...">
            {/* Title Skeleton */}
            <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-6"></div>

            {/* Paragraph Skeleton */}
            <div className="h-4 bg-gray-200 rounded-md w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full mb-8"></div>
            
            {/* Subheading Skeleton */}
            <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-4"></div>

            {/* List Skeleton */}
            <div className="flex items-start space-x-3 mb-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
            </div>
            <div className="flex items-start space-x-3 mb-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
            </div>
            <div className="flex items-start space-x-3 mb-8">
                <div className="h-4 w-4 bg-gray-200 rounded-full mt-1 flex-shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
            </div>
            
            {/* Another Paragraph Skeleton */}
            <div className="h-4 bg-gray-200 rounded-md w-full mb-3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-5/6 mb-3"></div>
        </div>
    );
};

export default SkeletonLoader;
