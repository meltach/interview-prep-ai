'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    History, Plus, MoreVertical,
    ArrowRightToLine, ArrowLeftToLine, PanelLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDate, formatTime, groupSessionsByDate } from './utils';

type PastSession = {
    id: string;
    role: string;
    createdAt: string;
};

type GroupedSessions = {
    [key: string]: PastSession[];
};

export function SideNav({ onOpenChange }: SideNavProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
    const [groupedSessions, setGroupedSessions] = useState<GroupedSessions>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        onOpenChange?.(isExpanded);
    }, [isExpanded, onOpenChange]);

    // Fetch past sessions when component mounts
    useEffect(() => {
        const fetchPastSessions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/interview-sessions');
                if (res.ok) {
                    const data = await res.json();
                    setPastSessions(data);
                    groupSessionsByDate(data, setGroupedSessions);
                }
            } catch (error) {
                console.error('Failed to fetch past sessions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPastSessions();
    }, []);

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
            groupSessionsByDate(pastSessions.filter(session => session.id !== sessionToDelete), setGroupedSessions);

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
        <motion.div
            className="fixed top-0 left-0 z-20 h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md overflow-hidden"
            animate={{ width: isExpanded ? '18rem' : '4rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 h-16">
                <div className={cn("flex items-center", !isExpanded && "justify-center w-full")}>
                    {isExpanded ? (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                className="flex items-center space-x-2 hover:cursor-pointer group"
                                onClick={() => setIsExpanded(false)}
                            >
                                <div className="relative">
                                    <PanelLeft className="h-5 w-5 text-gray-500 dark:text-gray-300 group-hover:opacity-0 transition-opacity" />
                                    <ArrowLeftToLine className="h-5 w-5 text-gray-500 dark:text-gray-300 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Button>
                            <h2 className="font-semibold text-gray-800 dark:text-gray-200">History</h2>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center hover:cursor-pointer group"
                            onClick={() => setIsExpanded(true)}
                        >
                                <div className="relative">
                                    <PanelLeft className="h-5 w-5 text-gray-500 dark:text-gray-300 group-hover:opacity-0 transition-opacity" />
                                    <ArrowRightToLine className="h-5 w-5 text-gray-500 dark:text-gray-300 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Button>
                    )}
                </div>
            </div>
            {/* Nav actions */}
            <div className="p-3">
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-sm gap-2",
                        !isExpanded && "px-0 justify-center"
                    )}
                    onClick={() => router.push('/interview-prep')}
                >
                    <Plus className="h-4 w-4" />
                    {isExpanded && "New Interview"}
                </Button>
            </div>

            {/* Nav content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading || isDeleting ? (
                    <div className={cn(
                        "p-4 text-sm text-gray-500",
                        !isExpanded && "text-center"
                    )}>
                        {isExpanded ? "Loading..." : "..."}
                    </div>
                ) : pastSessions.length > 0 && isExpanded ? (
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
                                                                        onClick={() => handleDeleteInterview(session.id)}
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
                ) : null}
            </div>
        </motion.div>
    );
}

export type { SideNavProps };
type SideNavProps = {
    onOpenChange?: (isOpen: boolean) => void;
};