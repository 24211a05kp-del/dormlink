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
        distribution: [] as any[],
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

            const distMap = {
                'Excellent': 0,
                'Good': 0,
                'Average': 0,
                'Below Avg': 0,
                'Poor': 0
            };

            feedbacks.forEach(f => {
                if (f.rating === 5) distMap['Excellent']++;
                else if (f.rating === 4) distMap['Good']++;
                else if (f.rating === 3) distMap['Average']++;
                else if (f.rating === 2) distMap['Below Avg']++;
                else if (f.rating === 1) distMap['Poor']++;
            });

            const distribution = [
                { name: 'Excellent', value: distMap['Excellent'], color: '#5B8C5A' },
                { name: 'Good', value: distMap['Good'], color: '#C4A77D' },
                { name: 'Average', value: distMap['Average'], color: '#D97706' },
                { name: 'Below Avg', value: distMap['Below Avg'], color: '#C44536' },
                { name: 'Poor', value: distMap['Poor'], color: '#7A5C3D' }
            ].filter(d => d.value > 0);

            setStats({
                averageRating: Number(avg.toFixed(1)),
                totalFeedback: total,
                distribution,
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
                    <h3 className="mb-6 text-[#5A3A1E] font-bold">Rating Distribution</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.distribution.length > 0 ? stats.distribution : [{ name: 'No Data', value: 1, color: '#EADFCC' }]}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {stats.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FEFBF6',
                                        border: '1px solid #EADFCC',
                                        borderRadius: '1rem'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
