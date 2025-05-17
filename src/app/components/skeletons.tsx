import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSpinner({ size = 4 }: { size?: number }) {
    return (
        <div className={`flex items-center justify-center h-${size} w-${size}`}>
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent h-full w-full"></div>
        </div>
    );
}

export function SetupFormSkeleton() {
    return (
        <div className="mx-auto w-full">
            <div className="space-y-3">
                <Skeleton className="h-5 w-1/4 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-10 w-full bg-gray-100 dark:bg-gray-700" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-32 w-full bg-gray-100 dark:bg-gray-700" />
            </div>

            <Skeleton className="h-12 w-full bg-gray-100 dark:bg-gray-700" />
        </div>
    );
}

export function QuestionSkeleton() {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm space-y-4 w-full mx-auto">
            <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-full bg-gray-100 dark:bg-gray-700" />
            <Skeleton className="h-24 w-full bg-gray-100 dark:bg-gray-700" />
            <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700" />
        </div>
    );
}

export function SideNavSkeleton() {
    return (
        <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
                        <Skeleton className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function HistorySkeleton() {
    return (
        <div className="space-y-6 w-full mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-3">
                <Skeleton className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-100 dark:bg-gray-700" />
            </div>

            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-full bg-gray-100 dark:bg-gray-700" />
                    <Skeleton className="h-24 w-full bg-gray-100 dark:bg-gray-700" />
                </div>
            ))}
        </div>
    )
}