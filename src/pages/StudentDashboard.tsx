import { useState } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DashboardTopSection } from '../components/dashboard/DashboardTopSection';
import { FeedbackModule } from '../components/dashboard/FeedbackModule';
import { MoodBoard } from '../components/dashboard/MoodBoard';
import { OutingApproval } from '../components/dashboard/OutingApproval';
import { LostAndFound } from '../components/dashboard/LostAndFound';
import { EventsAndClubs } from '../components/dashboard/EventsAndClubs';
import { MenuScreen } from '../components/dashboard/MenuScreen';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { IssuesModule } from '../components/dashboard/IssuesModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Smile, Utensils, MapPin, Package, Calendar, Coffee, AlertTriangle } from 'lucide-react';

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

    return (
        <DashboardLayout userName={userName} role="student" onLogout={onLogout}>
            {/* Netflix-style Top Section - Full Width */}
            <DashboardTopSection
                userName={userName}
                onFeedbackClick={handleFeedbackClick}
                onSupportClick={handleSupportClick}
            />

            <div className="py-8">
                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-card border border-border p-1 rounded-2xl shadow-sm flex-wrap h-auto gap-1">
                        <TabsTrigger
                            value="overview"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="feedback"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Utensils className="h-4 w-4 mr-2" />
                            Feedback
                        </TabsTrigger>
                        <TabsTrigger
                            value="issues"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Issues
                        </TabsTrigger>
                        <TabsTrigger
                            value="mood"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Smile className="h-4 w-4 mr-2" />
                            Mood
                        </TabsTrigger>
                        <TabsTrigger
                            value="outing"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            Outing
                        </TabsTrigger>
                        <TabsTrigger
                            value="lost-found"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Package className="h-4 w-4 mr-2" />
                            Lost & Found
                        </TabsTrigger>
                        <TabsTrigger
                            value="events"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Events
                        </TabsTrigger>
                        <TabsTrigger
                            value="menu"
                            className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Coffee className="h-4 w-4 mr-2" />
                            Menu
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 items-start">
                            <div className="space-y-6">
                                <FeedbackModule />
                                <PendingApprovals userName={userName} />
                            </div>
                            <MoodBoard userName={userName} />
                        </div>
                    </TabsContent>

                    <TabsContent value="feedback">
                        <div className="max-w-2xl">
                            <FeedbackModule />
                        </div>
                    </TabsContent>

                    <TabsContent value="issues">
                        <IssuesModule userName={userName} />
                    </TabsContent>

                    <TabsContent value="mood">
                        <div className="max-w-2xl">
                            <MoodBoard userName={userName} />
                        </div>
                    </TabsContent>

                    <TabsContent value="outing">
                        <div className="max-w-2xl">
                            <OutingApproval />
                        </div>
                    </TabsContent>

                    <TabsContent value="lost-found">
                        <LostAndFound />
                    </TabsContent>

                    <TabsContent value="events">
                        <EventsAndClubs />
                    </TabsContent>

                    <TabsContent value="menu">
                        <MenuScreen />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
