import { motion } from "framer-motion";
import { Users, Settings, ClipboardList, ShieldAlert } from "lucide-react";
import { DashboardLayout } from "../components/layouts/DashboardLayout";
import { ComplaintManagement } from "../components/dashboard/ComplaintManagement";
import { FeedbackAnalytics } from "../components/dashboard/FeedbackAnalytics";
import { MenuManagement } from "../components/dashboard/MenuManagement";

interface DashboardProps {
    userName: string;
    onLogout: () => void;
}

export const FacultyDashboard = ({ userName, onLogout }: DashboardProps) => {
    const stats = [
        { label: "Active Students", value: "248", icon: Users, color: "text-blue-600" },
        { label: "Pending Outings", value: "12", icon: ClipboardList, color: "text-orange-600" },
        { label: "Urgent Feedback", value: "3", icon: ShieldAlert, color: "text-red-600" },
    ];

    return (
        <DashboardLayout userName={userName} role="faculty" onLogout={onLogout}>
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[#5A3A1E]">Admin Panel</h2>
                    <p className="text-[#7A5C3A]">Logged in as Faculty: {userName}</p>
                </div>
                <button className="flex items-center gap-2 bg-[#5A3A1E] text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-[#3D2614] transition-colors">
                    <Settings className="w-4 h-4" />
                    Admin Settings
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-3xl shadow-sm border border-[#EADFCC]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[#7A5C3A] font-medium">{stat.label}</span>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <p className="text-4xl font-extrabold text-[#5A3A1E]">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <section className="mb-12">
                <FeedbackAnalytics />
            </section>

            <section className="mb-12">
                <MenuManagement />
            </section>

            <section className="mb-12">
                <ComplaintManagement />
            </section>

            <div className="bg-white rounded-[2.5rem] p-8 border border-[#EADFCC] shadow-sm">
                <h3 className="text-xl font-bold text-[#5A3A1E] mb-6">Recent Activity</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center gap-4 py-4 border-b border-[#F5EFE6] last:border-0 text-[#6B4F3A]">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <p>New feedback received from Room 30{item}</p>
                            <span className="ml-auto text-xs text-[#8A6A4F]">2h ago</span>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};
