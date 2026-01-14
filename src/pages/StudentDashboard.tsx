import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DashboardTopSection } from '../components/dashboard/DashboardTopSection';
import { FeedbackModule } from '../components/dashboard/FeedbackModule';
import { MoodBoard } from '../components/dashboard/MoodBoard';
import { OutingApproval } from '../components/dashboard/OutingApproval';

import { LostAndFound } from '../components/dashboard/LostAndFound';
import { EventsBoard } from '../components/dashboard/EventsBoard';
import { MenuScreen } from '../components/dashboard/MenuScreen';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { IssuesModule } from '../components/dashboard/IssuesModule';
import { Smile, Utensils, MapPin, Package, Calendar, Coffee, AlertTriangle, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';

interface StudentDashboardProps {
    userName: string;
    onLogout: () => void;
}

export function StudentDashboard(props: StudentDashboardProps) {
    try {
        return <StudentDashboardContent {...props} />;
    } catch (error) {
        console.error("StudentDashboard crash:", error);
        return (
            <DashboardLayout userName={props.userName} role="student" onLogout={props.onLogout}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-sm max-w-md mx-auto my-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-6 drop-shadow-sm" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Interface Error</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed font-medium">
                        Something went wrong while rendering the dashboard UI.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                    >
                        Reload Interface
                    </button>
                </div>
            </DashboardLayout>
        );
    }
}

function StudentDashboardContent({ userName, onLogout }: StudentDashboardProps) {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [loadError, setLoadError] = useState<string | null>(null);

    // Initial check for data availability
    useEffect(() => {
        if (!authLoading && !user) {
            setLoadError("Your session could not be verified. Please try logging in again.");
        } else if (!authLoading && user && user.role !== 'student') {
            setLoadError(`Access Denied: You are logged in as a ${user.role}.`);
        }
    }, [authLoading, user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-[#5A3A1E] font-bold animate-pulse">Loading Student Dashboard...</p>
                </div>
            </div>
        );
    }

    // Role safety catch: if we made it here but role is mismatched, show error
    if (loadError) {
        return (
            <DashboardLayout userName={userName} role="student" onLogout={onLogout}>
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border-2 border-dashed border-red-200 shadow-sm max-w-md mx-auto my-12">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-6 drop-shadow-sm" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Dashboard Unavailable</h2>
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

    const handleFeedbackClick = () => {
        setActiveTab('feedback');
    };

    const handleSupportClick = () => {
        setActiveTab('issues');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'feedback', label: 'Feedback', icon: Utensils },
        { id: 'issues', label: 'Issues', icon: AlertTriangle },
        { id: 'mood', label: 'Mood', icon: Smile },
        { id: 'outing', label: 'Outing', icon: MapPin },
        { id: 'lost-found', label: 'Lost & Found', icon: Package },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'menu', label: 'Menu', icon: Coffee },
    ];

    return (
        <DashboardLayout userName={userName} role="student" onLogout={onLogout}>
            {/* Netflix-style Top Section - Full Width */}
            <DashboardTopSection
                userName={userName}
                onFeedbackClick={handleFeedbackClick}
                onSupportClick={handleSupportClick}
            />

            <div className="py-8">
                {/* Custom Tabs Navigation */}
                <div className="flex bg-white border border-[#EADFCC] p-1.5 rounded-2xl shadow-sm overflow-x-auto gap-1 mb-8 scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-[#7A5C3A] hover:bg-[#F5EFE6]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid gap-6 lg:grid-cols-2 items-start">
                            <div className="space-y-6">
                                <FeedbackModule />
                                <PendingApprovals userName={userName} />
                            </div>
                            <MoodBoard userName={userName} />
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div className="max-w-2xl mx-auto">
                            <FeedbackModule />
                        </div>
                    )}

                    {activeTab === 'issues' && (
                        <IssuesModule userName={userName} />
                    )}

                    {activeTab === 'mood' && (
                        <div className="max-w-2xl mx-auto">
                            <MoodBoard userName={userName} />
                        </div>
                    )}

                    {activeTab === 'outing' && (
                        <div className="max-w-2xl mx-auto">
                            <OutingApproval />
                        </div>
                    )}

                    {activeTab === 'lost-found' && (
                        <LostAndFound />
                    )}

                    {activeTab === 'events' && (
                        <EventsBoard />
                    )}

                    {activeTab === 'menu' && (
                        <MenuScreen />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
