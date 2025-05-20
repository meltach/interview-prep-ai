'use client';

import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../page-header';
import { SideNav } from '../side-nav';
import '../style.css';


interface InterviewLayoutProps {
    children: ReactNode;
    className?: string;
}

export function InterviewLayout({ children }: InterviewLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            {/* Fixed header */}
            <header className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16">
                <PageHeader />
            </header>
            {/* Fixed sidebar */}
            <SideNav onOpenChange={setIsSidebarOpen} />


            {/* Main content area */}
            <div className="flex flex-1 pt-16">

                {/* Content container with proper spacing */}
                <motion.main
                    className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out"
                    style={{
                        paddingLeft: '4rem', // base for collapsed sidebar
                        transform: isSidebarOpen ? 'translateX(14rem)' : 'translateX(0)', // slide effect
                    }}
                >
                    {/* Centered content with max-width and padding */}
                    <div className="flex-1 flex flex-col items-center justify-start w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </motion.main>
            </div>
        </div>
    );
}