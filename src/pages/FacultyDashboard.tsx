import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Users, Settings, ClipboardList, ShieldAlert, Package } from "lucide-react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { ComplaintManagement } from "../components/dashboard/ComplaintManagement";
import { FeedbackAnalytics } from "../components/dashboard/FeedbackAnalytics";
import { MenuManagement } from "../components/dashboard/MenuManagement";
import { RequestManagement } from "../components/dashboard/RequestManagement";
import { MoodAnalytics } from "../components/dashboard/MoodAnalytics";

import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface DashboardProps {
    userName: string;
    onLogout: () => void;
}

export const FacultyDashboard = ({ userName, onLogout }: DashboardProps) => {
    const [stats, setStats] = useState([
        { label: "Total Students", value: "...", icon: Users, color: "text-blue-600" },
        { label: "Pending Outings", value: "...", icon: ClipboardList, color: "text-orange-600" },

        { label: "Pending Issues", value: "...", icon: ShieldAlert, color: "text-red-600" },
    ]);

    useEffect(() => {
        // Students count
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            const studentCount = snap.docs.filter(d => d.data().role === 'student').length;
            setStats(prev => prev.map(s => s.label === "Total Students" ? { ...s, value: studentCount.toString() } : s));
        });

        // Pending Outings
        const unsubOutings = onSnapshot(
            collection(db, "outing_requests"),
            (snap) => {
                const pendingCount = snap.docs.filter(d =>
                    d.data().status === 'requested' ||
                    d.data().status === 'guardian_approved'
                ).length;
                setStats(prev => prev.map(s => s.label === "Pending Outings" ? { ...s, value: pendingCount.toString() } : s));
            }
        );



        // Pending Issues
        const unsubIssues = onSnapshot(
            query(collection(db, "issues"), where("status", "==", "Pending")),
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
