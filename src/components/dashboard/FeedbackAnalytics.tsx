import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Star } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

export function FeedbackAnalytics() {
    const [stats, setStats] = useState({
        averageRating: 0,
        totalFeedback: 0,
        mealDistributions: {
            'Breakfast': [] as any[],
            'Lunch': [] as any[],
            'Snacks': [] as any[],
            'Dinner': [] as any[]
        },
        loading: true
    });

    useEffect(() => {
        const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const feedbacks = snapshot.docs.map(doc => doc.data());

            if (feedbacks.length === 0) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            const total = feedbacks.length;
            const avg = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total;

            const mealDistributions: any = {
                'Breakfast': { Excellent: 0, Good: 0, Average: 0, 'Below Avg': 0, Poor: 0 },
                'Lunch': { Excellent: 0, Good: 0, Average: 0, 'Below Avg': 0, Poor: 0 },
                'Snacks': { Excellent: 0, Good: 0, Average: 0, 'Below Avg': 0, Poor: 0 },
                'Dinner': { Excellent: 0, Good: 0, Average: 0, 'Below Avg': 0, Poor: 0 }
            };

            feedbacks.forEach(f => {
                const meal = f.meal || 'Lunch'; // Fallback
                if (!mealDistributions[meal]) return;

                if (f.rating === 5) mealDistributions[meal]['Excellent']++;
                else if (f.rating === 4) mealDistributions[meal]['Good']++;
                else if (f.rating === 3) mealDistributions[meal]['Average']++;
                else if (f.rating === 2) mealDistributions[meal]['Below Avg']++;
                else if (f.rating === 1) mealDistributions[meal]['Poor']++;
            });

            const colors: any = {
                'Excellent': '#5B8C5A',
                'Good': '#C4A77D',
                'Average': '#D97706',
                'Below Avg': '#C44536',
                'Poor': '#7A5C3D'
            };

            const finalizedDistributions: any = {};
            ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].forEach(meal => {
                finalizedDistributions[meal] = Object.entries(mealDistributions[meal])
                    .map(([name, value]) => ({
                        name,
                        value,
                        color: colors[name]
                    }))
                    .filter(d => (d.value as number) > 0);
            });

            setStats({
                averageRating: Number(avg.toFixed(1)),
                totalFeedback: total,
                mealDistributions: finalizedDistributions,
                loading: false
            });
        });

        return () => unsubscribe();
    }, []);

    if (stats.loading) {
        return <div className="p-8 text-center text-[#7A5C3A]">Calculating analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                    <Activity className="h-6 w-6 text-[#5A3A1E]" />
                </div>
                <div>
                    <h2 className="text-[#5A3A1E] text-2xl font-bold">Feedback Analytics</h2>
                    <p className="text-sm text-[#7A5C3A]">Real-time student satisfaction insights</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5 shadow-sm border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#7A5C3A]">Average Rating</p>
                        <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-[#5A3A1E] mb-1">{stats.averageRating || 'N/A'}</p>
                    <p className="text-xs text-orange-600 font-medium">Based on current reports</p>
                </Card>

                <Card className="p-5 shadow-sm border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#7A5C3A]">Total Feedback</p>
                        <Activity className="h-4 w-4 text-[#5A3A1E]" />
                    </div>
                    <p className="text-3xl font-bold text-[#5A3A1E] mb-1">{stats.totalFeedback}</p>
                    <p className="text-xs text-[#7A5C3A] font-medium">Accumulated reports</p>
                </Card>

            </div>

            <div className="grid gap-6">
                <Card className="p-6 shadow-sm border-[#EADFCC]">
                    <h3 className="mb-6 text-[#5A3A1E] font-bold">Meal-Wise Satisfaction</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => {
                            const data = stats.mealDistributions[meal as keyof typeof stats.mealDistributions];
                            const hasData = data && data.length > 0;

                            return (
                                <div key={meal} className="flex flex-col items-center">
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={hasData ? data : [{ name: 'No Data', value: 1, color: '#EADFCC' }]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={60}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {hasData ? data.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    )) : (
                                                        <Cell fill="#F5EFE6" />
                                                    )}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#FEFBF6',
                                                        border: '1px solid #EADFCC',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '10px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-[#5A3A1E] text-sm">{meal}</p>
                                        {!hasData && <p className="text-[10px] text-[#7A5C3A] italic">No ratings yet</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}
