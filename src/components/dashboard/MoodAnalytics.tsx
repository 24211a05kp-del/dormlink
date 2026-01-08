import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { moodService, MoodEntry } from '@/services/moodService';
import { Smile, Frown, Meh, Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const moodConfig: Record<string, { color: string, icon: any, label: string }> = {
    'Amazing': { color: 'text-emerald-600 bg-emerald-100', icon: Heart, label: 'Amazing' },
    'Great': { color: 'text-green-600 bg-green-100', icon: Smile, label: 'Great' },
    'Good': { color: 'text-lime-600 bg-lime-100', icon: Smile, label: 'Good' },
    'Okay': { color: 'text-yellow-600 bg-yellow-100', icon: Meh, label: 'Okay' },
    'Sad': { color: 'text-orange-600 bg-orange-100', icon: Frown, label: 'Sad' },
    'Terrible': { color: 'text-red-600 bg-red-100', icon: Activity, label: 'Terrible' },
};

export function MoodAnalytics() {
    const [moods, setMoods] = useState<MoodEntry[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const unsubscribe = moodService.subscribeToDailyMoods(today, (data) => {
            setMoods(data);
            calculateStats(data);
        });

        return () => unsubscribe();
    }, []);

    const calculateStats = (data: MoodEntry[]) => {
        const Counts: Record<string, number> = {};
        data.forEach(m => {
            Counts[m.mood] = (Counts[m.mood] || 0) + 1;
        });
        setStats(Counts);
        setTotal(data.length);
    };

    return (
        <Card className="p-6 border-[#EADFCC] bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#5A3A1E]">Campus Pulse</h2>
                    <p className="text-sm text-[#7A5C3A]">Today's Student Mood Overview</p>
                </div>
                <div className="bg-[#F5EFE6] px-4 py-2 rounded-xl border border-[#EADFCC]">
                    <span className="text-[#5A3A1E] font-bold text-lg">{total}</span>
                    <span className="text-xs text-[#7A5C3A] ml-2">Responses</span>
                </div>
            </div>

            {total === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                    No mood data recorded yet today.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.keys(moodConfig).map((moodLabel) => {
                        const count = stats[moodLabel] || 0;
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        const config = moodConfig[moodLabel] || { color: 'text-gray-600 bg-gray-100', icon: Smile };
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={moodLabel}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border ${count > 0 ? 'border-border' : 'border-transparent opacity-60'} flex flex-col items-center justify-center text-center bg-white shadow-sm hover:shadow-md transition-all`}
                            >
                                <div className={`p-3 rounded-full mb-3 ${config.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{moodLabel}</span>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-[#5A3A1E]">{count}</span>
                                    <span className="text-xs text-muted-foreground">({percentage}%)</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
