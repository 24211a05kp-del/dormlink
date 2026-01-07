import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

const weeklyData = [
    { day: 'Mon', rating: 4.2 },
    { day: 'Tue', rating: 3.8 },
    { day: 'Wed', rating: 4.5 },
    { day: 'Thu', rating: 3.9 },
    { day: 'Fri', rating: 4.1 },
    { day: 'Sat', rating: 4.6 },
    { day: 'Sun', rating: 4.3 }
];

const mealDistribution = [
    { name: 'Excellent', value: 45, color: '#5B8C5A' },
    { name: 'Good', value: 30, color: '#C4A77D' },
    { name: 'Average', value: 15, color: '#D97706' },
    { name: 'Below Avg', value: 7, color: '#C44536' },
    { name: 'Poor', value: 3, color: '#7A5C3D' }
];

export function FeedbackAnalytics() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                    <Activity className="h-6 w-6 text-[#5A3A1E]" />
                </div>
                <div>
                    <h2 className="text-[#5A3A1E] text-2xl font-bold">Feedback Analytics</h2>
                    <p className="text-sm text-[#7A5C3A]">Student satisfaction insights</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5 shadow-sm border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#7A5C3A]">Average Rating</p>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-[#5A3A1E] mb-1">4.2</p>
                    <p className="text-xs text-green-600 font-medium">+0.3 from last week</p>
                </Card>

                <Card className="p-5 shadow-sm border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#7A5C3A]">Total Feedback</p>
                        <Activity className="h-4 w-4 text-[#5A3A1E]" />
                    </div>
                    <p className="text-3xl font-bold text-[#5A3A1E] mb-1">1,247</p>
                    <p className="text-xs text-[#7A5C3A] font-medium">This week</p>
                </Card>

                <Card className="p-5 shadow-sm border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-[#7A5C3A]">Most Appreciated</p>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-[#5A3A1E] mb-1">Lunch</p>
                    <p className="text-xs text-green-600 font-medium">4.6 avg rating</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Weekly Trend */}
                <Card className="p-6 shadow-sm border-[#EADFCC]">
                    <h3 className="mb-6 text-[#5A3A1E] font-bold">Weekly Trend</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#EADFCC" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#7A5C3A"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#7A5C3A"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    domain={[0, 5]}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#FEFBF6',
                                        border: '1px solid #EADFCC',
                                        borderRadius: '1rem',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Bar dataKey="rating" fill="#5A3A1E" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Rating Distribution */}
                <Card className="p-6 shadow-sm border-[#EADFCC]">
                    <h3 className="mb-6 text-[#5A3A1E] font-bold">Rating Distribution</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mealDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {mealDistribution.map((entry, index) => (
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
