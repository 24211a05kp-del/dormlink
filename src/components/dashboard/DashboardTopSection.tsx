"use client";

import { HorizontalScroll } from './HorizontalScroll';
import { Card } from '../ui/card';
import { Calendar, Lightbulb, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardTopSectionProps {
    userName: string;
    onFeedbackClick?: () => void;
    onSupportClick?: () => void;
}

export function DashboardTopSection({ userName, onFeedbackClick, onSupportClick }: DashboardTopSectionProps) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="w-full mb-8">
            <HorizontalScroll className="gap-0 p-0 px-0 sm:px-0 lg:px-0 pb-0">
                {/* Thought of the Day */}
                <div className="w-screen flex-shrink-0 snap-start">
                    <Card
                        className="w-full h-[350px] flex items-center justify-center rounded-none border-x-0 border-t-0 p-6 sm:p-12 bg-gradient-to-r from-orange-50 to-amber-50 shadow-sm"
                    >
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Lightbulb className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold text-xl">Thought of the Day</h3>
                                    <p className="text-sm text-muted-foreground">{today}</p>
                                </div>
                            </div>
                            <blockquote className="text-foreground/90 italic mb-6 text-2xl sm:text-4xl font-serif">
                                "Every accomplishment starts with the decision to try."
                            </blockquote>
                            <p className="text-lg text-muted-foreground font-medium">— John F. Kennedy</p>
                        </div>
                    </Card>
                </div>

                {/* Upcoming Event */}
                <div className="w-screen flex-shrink-0 snap-start">
                    <Card
                        className="w-full h-[350px] flex items-center justify-center rounded-none border-x-0 border-t-0 p-6 sm:p-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
                    >
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-white/20 p-4 rounded-full">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-xl">Upcoming Event</h3>
                                    <p className="text-sm text-white/80">Jan 15-17</p>
                                </div>
                            </div>
                            <h2 className="text-4xl sm:text-6xl font-bold mb-4">Tech Fest 2025</h2>
                            <p className="text-xl sm:text-2xl text-white/90">Annual technology festival with competitions, workshops, and exhibitions</p>
                        </div>
                    </Card>
                </div>

                {/* Food Feedback Prompt */}
                <div className="w-screen flex-shrink-0 snap-start">
                    <Card className="w-full h-[350px] flex items-center justify-center rounded-none border-x-0 border-t-0 p-6 sm:p-12 bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-orange-500 p-4 rounded-full">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-orange-900 font-bold text-xl">Mess Feedback</h3>
                                    <p className="text-sm text-orange-700">Help us improve</p>
                                </div>
                            </div>
                            <p className="text-3xl sm:text-4xl text-orange-900 mb-8 font-medium">
                                Did you give today's food feedback?
                            </p>
                            <Button
                                onClick={onFeedbackClick}
                                size="lg"
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-12 py-8 text-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Share Feedback
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Issues/Support Card */}
                <div className="w-screen flex-shrink-0 snap-start">
                    <Card className="w-full h-[350px] flex items-center justify-center rounded-none border-x-0 border-t-0 p-6 sm:p-12 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-blue-500 p-4 rounded-full">
                                    <MessageSquare className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-blue-900 font-bold text-xl">Need Help?</h3>
                                    <p className="text-sm text-blue-700">We're here for you</p>
                                </div>
                            </div>
                            <p className="text-3xl sm:text-4xl text-blue-900 mb-8 font-medium">
                                Do you face any issues?
                            </p>
                            <Button
                                onClick={onSupportClick}
                                variant="outline"
                                size="lg"
                                className="border-blue-500 text-blue-700 hover:bg-blue-500 hover:text-white rounded-full px-12 py-8 text-xl border-2"
                            >
                                Report an Issue
                            </Button>
                        </div>
                    </Card>
                </div>
            </HorizontalScroll>
        </div>
    );
}
