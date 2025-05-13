'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, History, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define the type for past interview sessions
type PastSession = {
    id: string;
    role: string;
    createdAt: string;
};

// Define the type for grouped sessions
type GroupedSessions = {
    [key: string]: PastSession[];
};

export function SideNav() {
    const [isOpen, setIsOpen] = useState(true);
    const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
    const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Fetch past sessions when component mounts
    useEffect(() => {
        const fetchPastSessions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/interview-sessions');
                if (res.ok) {
                    const data = await res.json();
                    setPastSessions(data);
                    groupSessionsByDate(data);
                }
            } catch (error) {
                console.error('Failed to fetch past sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPastSessions();
    }, []);

    // Group sessions by date ranges
    const groupSessionsByDate = (sessions: PastSession[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const oneMonthAgo = new Date(today);
        oneMonthAgo.setDate(today.getDate() - 30);

        const grouped: GroupedSessions = {
            'Today': [],
            'Last 7 Days': [],
            'Last 30 Days': [],
            'Older': []
        };

        sessions.forEach(session => {
            const sessionDate = new Date(session.createdAt);
            sessionDate.setHours(0, 0, 0, 0);

            if (sessionDate.getTime() === today.getTime()) {
                grouped['Today'].push(session);
            } else if (sessionDate >= oneWeekAgo) {
                grouped['Last 7 Days'].push(session);
            } else if (sessionDate >= oneMonthAgo) {
                grouped['Last 30 Days'].push(session);
            } else {
                grouped['Older'].push(session);
            }
        });

        setGroupedSessions(grouped);
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Format time for display
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Determine if the current path is for a specific session
    const isSessionActive = (sessionId: string) => {
        return pathname === `interview-prep/${sessionId}`;
    };

    return (
        <>
            {/* Collapsible Sidebar */}
            <div
                className={cn(
                    "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-20 transition-all duration-300 flex flex-col",
                    isOpen ? "w-72" : "w-0"
                )}
            >
                {isOpen && (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Interview History</h2>
                            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-sm text-gray-500">Loading sessions...</div>
                            ) : pastSessions.length > 0 ? (
                                    <div className="py-2">
                                        {Object.entries(groupedSessions).map(([group, sessions]) => (
                                            sessions.length > 0 && (
                                                <div key={group} className="mb-4">
                                                    <h3 className="px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        {group}
                                                    </h3>
                                                    <ul>
                                                        {sessions.map((session) => (
                                                            <li key={session.id}>
                                                                <Link href={`interview-prep/${session.id}`} passHref>
                                                                    <div
                                                                        className={cn(
                                                                            "flex items-start px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer",
                                                                            isSessionActive(session.id) && "bg-blue-50 border-l-4 border-blue-500"
                                                                        )}
                                                                    >
                                                                        <History className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-gray-800 truncate">{session.role}</p>
                                                                            <p className="text-xs text-gray-500">
                                                                                {formatDate(session.createdAt)}, {formatTime(session.createdAt)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )
                                        ))}
                                    </div>
                            ) : (
                                <div className="p-4 text-sm text-gray-500">No past sessions found</div>
                            )}
                        </div>

                        <div className="p-3 border-t border-gray-200">
                            <Button
                                variant="outline"
                                className="w-full justify-start text-sm gap-2"
                                onClick={() => router.push('/interview-prep')}
                            >
                                <Plus className="h-4 w-4" />
                                New Interview
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Toggle button that appears when sidebar is closed */}
            {!isOpen && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="fixed top-20 left-0 bg-white rounded-r-md rounded-l-none border border-l-0 z-20 h-10"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            )}
        </>
    );
}