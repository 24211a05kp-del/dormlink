

import { Coffee, LogOut, Menu as MenuIcon } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationBarProps {
    userName: string;
    userRole: 'student' | 'faculty';
    onLogout: () => void;
}

export function NavigationBar({ userName, userRole, onLogout }: NavigationBarProps) {
    return (
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-xl p-2">
                            <Coffee className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-primary font-bold">Dormlink</h1>
                            <p className="text-xs text-muted-foreground">Your daily campus companion</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-foreground font-medium">Hey, {userName}!</p>
                            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onLogout}
                            className="hover:bg-destructive/10 hover:text-destructive rounded-xl"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
