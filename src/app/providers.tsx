'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { InterviewProvider } from './context/InterviewContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
    return <SessionProvider>
        <InterviewProvider>
            {children}
        </InterviewProvider>
        <Toaster
            toastOptions={{
                className: "bg-gray-900 text-white",
                duration: 3000,
                style: {
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                },
            }} />
    </SessionProvider>;
}