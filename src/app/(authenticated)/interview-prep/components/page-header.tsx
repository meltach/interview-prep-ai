'use client';

import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useSession, signOut } from 'next-auth/react';

export function PageHeader() {
    const { data: session } = useSession();
    console.log('SESSION:', session);

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">IP</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">InterviewPrep</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                                {session?.user?.image ? (
                                    <Avatar>
                                        <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                                        <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="font-medium">
                                {session?.user?.name || "User"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => signOut()}>
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}