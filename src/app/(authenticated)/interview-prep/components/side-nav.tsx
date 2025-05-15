'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, History, X, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

type PastSession = {
    id: string;
    role: string;
    createdAt: string;
};

type GroupedSessions = {
    [key: string]: PastSession[];
};

export function SideNav({ onOpenChange }: SideNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
    const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        onOpenChange?.(isOpen);
    }, [isOpen, onOpenChange]);

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
        return pathname === `/interview-prep/${sessionId}`;
    };

    // Delete interview session 
    const handleDeleteInterview = async (sessionToDelete: string) => {
        if (!sessionToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/interview-sessions`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: sessionToDelete }),

            });

            if (!res.ok) {
                throw new Error('Failed to delete session');
            }

            // Update the list by removing the deleted session
            setPastSessions(prev => prev.filter(session => session.id !== sessionToDelete));

            // Re-group the sessions
            groupSessionsByDate(pastSessions.filter(session => session.id !== sessionToDelete));

            toast.success('Interview deleted successfully');

            router.push('/interview-prep')

        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete interview session');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-20 w-72 shadow-lg"
                    >
                        <>
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="font-semibold text-gray-800">History</h2>
                                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                                    <X className="h-4 w-4" />
                                </Button>
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
                            <div className="flex-1 overflow-y-auto">
                                {isLoading || isDeleting ? (
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
                                                                <Link href={`/interview-prep/${session.id}`} passHref>
                                                                    <div
                                                                        className={cn(
                                                                            "flex items-start px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer group",
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
                                                                        <div>
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                                                                                        <MoreVertical className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end">
                                                                                    <DropdownMenuItem
                                                                                        className="text-red-600 focus:text-red-600"
                                                                                        onClick={(e) => {
                                                                                            console.log("Event", e);
                                                                                            console.log("session", session);
                                                                                            handleDeleteInterview(session.id);
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
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
                        </>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(true)}
                        className="fixed top-20 left-0 bg-white rounded-r-md rounded-l-none border border-l-0 z-20 h-10"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}
        </>
    );
}

export type { SideNavProps };
type SideNavProps = {
    onOpenChange?: (isOpen: boolean) => void;
};