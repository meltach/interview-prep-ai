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

    return (
        <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 z-10 ml-16"> {/* Added ml-16 to offset the collapsed sidebar width */}
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">InterviewPrep</h1>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                          {session?.user?.image ? (
                              <Avatar className="h-7 w-7">
                                  <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                                  <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                              </Avatar>
                          ) : (
                              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-700">
                                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                              </div>
                          )}
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="font-medium text-gray-700 dark:text-gray-200">
                          {session?.user?.name || "User"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                          onClick={() => signOut()}
                          className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                      >
                          Sign Out
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
      </header>
  );
}