// src/components/GlobalLoader.tsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Or any icon you like

export const GlobalLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-gray-900">
      <div className="flex items-center space-x-3">
        {/* You can replace this with your app's logo */}
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        
        <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default GlobalLoader;
