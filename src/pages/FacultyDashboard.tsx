import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Users, Settings, ClipboardList, ShieldAlert, Package } from "lucide-react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { ComplaintManagement } from "../components/dashboard/ComplaintManagement";
import { FeedbackAnalytics } from "../components/dashboard/FeedbackAnalytics";
import { MenuManagement } from "../components/dashboard/MenuManagement";
import { RequestManagement } from "../components/dashboard/RequestManagement";
import { MoodAnalytics } from "../components/dashboard/MoodAnalytics";
import { SettingsManagement } from "../components/dashboard/SettingsManagement";
import { EventManagement } from "../components/dashboard/EventManagement";
import { EventsBoard } from "../components/dashboard/EventsBoard";

import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface DashboardProps {
    userName: string;
    onLogout: () => void;
}

export const FacultyDashboard = ({ userName, onLogout }: DashboardProps) => {
    const { user, loading: authLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        // This effect runs on mount and when authLoading or user changes
        // We need to check role after authLoading is false and user is available
        if (!authLoading && user) {
            const currentRole = user.role;
            console.log("FacultyDashboard: User Role:", currentRole);

            if (currentRole !== 'faculty') {
                console.warn("FacultyDashboard: Role mismatch. Found:", currentRole);
                setLoadError(`Access Denied: Your role is '${currentRole}', but this is the Faculty Dashboard.`);
            }
        }
    }, [authLoading, user]); // Depend on authLoading and user

    const [stats, setStats] = useState([
        { label: "Total Students", value: "...", icon: Users, color: "text-blue-600" },
        { label: "Pending Outings", value: "...", icon: ClipboardList, color: "text-orange-600" },

        { label: "Pending Issues", value: "...", icon: ShieldAlert, color: "text-red-600" },
    ]);

    // If auth is loading, show a basic centered loader
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
                <Loader2 className="w-10 h-10 animate-spin text-[#5A3A1E]" />
            </div>
        );
    }

    if (loadError) {
        return (
            <DashboardLayout userName={userName} role="faculty" onLogout={onLogout}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-sm max-w-md mx-auto my-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-6 drop-shadow-sm" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Access Restricted</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed font-medium">{loadError}</p>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full px-6 py-4 bg-[#F5EFE6] text-[#5A3A1E] rounded-2xl font-bold hover:bg-[#EADFCC] transition-all"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    useEffect(() => {
        if (loadError || authLoading || !isMounted) return; // Do not fetch stats if there's an error, still loading auth, or not mounted

        // Students count
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const studentCount = snap.docs.filter(d => d.data().role === 'student').length;
            setStats(prev => prev.map(s => s.label === "Total Students" ? { ...s, value: studentCount.toString() } : s));
        });

        // Pending Outings
        const unsubOutings = onSnapshot(
            query(collection(db, "outing_requests"), where("status", "in", ["pending", "approved"])),
            (snap) => {
                const pendingCount = snap.docs.filter(d =>
                    d.data().status === 'pending'
                ).length;
                setStats(prev => prev.map(s => s.label === "Pending Outings" ? { ...s, value: pendingCount.toString() } : s));
            }
        );



        // Pending Issues
        const unsubIssues = onSnapshot(
            query(collection(db, "reported_issues"), where("status", "==", "open"), where("isActive", "==", true)),
            (snap) => {
                setStats(prev => prev.map(s => s.label === "Pending Issues" ? { ...s, value: snap.size.toString() } : s));
            }
        );

        return () => {
            unsubUsers();
            unsubOutings();

            unsubIssues();
        };
    }, []);

    return (
        <DashboardLayout userName={userName} role="faculty" onLogout={onLogout}>
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#5A3A1E]">Faculty Portal</h2>
                    <p className="text-[#7A5C3A]">Welcome back, Admin {userName}</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-[#F5EFE6] text-[#5A3A1E] border border-[#EADFCC] px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-[#EADFCC] transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EADFCC]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#7A5C3A] font-medium">{stat.label}</span>
                            <div className={`${stat.color.replace('text-', 'bg-')}/10 p-2 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-4xl font-extrabold text-[#5A3A1E]">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-12">
                <section>
                    <SettingsManagement />
                </section>

                <section>
                    <EventManagement />
                </section>

                <section>
                    <RequestManagement />
                </section>


                <section>
                    <FeedbackAnalytics />
                </section>

                <section>
                    <MoodAnalytics />
                </section>

                <section>
                    <ComplaintManagement />
                </section>

                <section>
                    <MenuManagement />
                </section>
            </div>
        </DashboardLayout>
    );
};
