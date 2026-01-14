import { useState } from 'react';
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
import { Smile, Utensils, MapPin, Package, Calendar, Coffee, AlertTriangle, LayoutDashboard } from 'lucide-react';

interface StudentDashboardProps {
    userName: string;
    onLogout: () => void;
}

export function StudentDashboard({ userName, onLogout }: StudentDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');

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
