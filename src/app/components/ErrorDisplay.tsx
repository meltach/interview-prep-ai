'use client';

import { Button } from '@/components/ui/button'; // Assuming you're using shadcn/ui
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
    message: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorDisplay({
    message,
    onRetry,
    className = ''
}: ErrorDisplayProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Something went wrong
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                    {message}
                </p>
                {onRetry && (
                    <Button
                        variant="outline"
                        onClick={onRetry}
                        className="mt-4"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    );
}