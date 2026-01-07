import { ReactNode } from "react";
import { NavigationBar } from "../NavigationBar";

interface DashboardLayoutProps {
    children: ReactNode;
    userName: string;
    role: "student" | "faculty";
    onLogout: () => void;
}

export function DashboardLayout({ children, userName, role, onLogout }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#F5EFE6]">
            <NavigationBar userName={userName} userRole={role} onLogout={onLogout} />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
