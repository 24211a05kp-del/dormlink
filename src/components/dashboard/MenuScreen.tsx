import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Coffee, Clock, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { menuService, WeeklyMenu } from '@/services/menuService';

const mealTimings = [
    { name: 'Breakfast', time: '7:30 AM - 9:30 AM' },
    { name: 'Lunch', time: '12:30 PM - 2:30 PM' },
    { name: 'Snacks', time: '4:30 PM - 6:00 PM' },
    { name: 'Dinner', time: '7:30 PM - 9:30 PM' }
];

export function MenuScreen() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];

    const [menu, setMenu] = useState<WeeklyMenu>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = menuService.subscribeToMenu((data) => {
            setMenu(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Coffee className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-primary text-2xl font-bold">Weekly Menu</h2>
                    <p className="text-sm text-muted-foreground">Check out this week's meals</p>
                </div>
            </div>

            {/* Meal Timings */}
            <Card className="p-6 bg-[#F5EFE6] border-[#EADFCC] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="text-primary font-bold">Meal Timings</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {mealTimings.map((meal) => (
                        <div key={meal.name} className="text-center p-3 bg-white rounded-xl border border-[#EADFCC]">
                            <p className="font-bold text-[#5A3A1E] mb-1">{meal.name}</p>
                            <p className="text-[10px] font-medium text-[#7A5C3A]">{meal.time}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Weekly Menu Tabs */}
            <Tabs defaultValue={today} className="space-y-6">
                <TabsList className="bg-white border border-[#EADFCC] p-1.5 rounded-2xl shadow-sm flex-wrap h-auto gap-1">
                    {daysOfWeek.map((day) => (
                        <TabsTrigger
                            key={day}
                            value={day}
                            className="rounded-xl flex-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                        >
                            {day.slice(0, 3)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {daysOfWeek.map((day) => (
                    <TabsContent key={day} value={day} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Breakfast */}
                        <Card className="p-6 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-200"></div>
                                <h3 className="text-primary font-bold text-lg">Breakfast</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {menu[day]?.breakfast?.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-sm font-medium text-[#5A3A1E]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Lunch */}
                        <Card className="p-6 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200"></div>
                                <h3 className="text-primary font-bold text-lg">Lunch</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {menu[day]?.lunch?.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-sm font-medium text-[#5A3A1E]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Snacks */}
                        <Card className="p-6 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                                <h3 className="text-primary font-bold text-lg">Snacks</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {menu[day]?.snacks?.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-sm font-medium text-[#5A3A1E]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        {/* Dinner */}
                        <Card className="p-6 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm shadow-purple-200"></div>
                                <h3 className="text-primary font-bold text-lg">Dinner</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {menu[day]?.dinner?.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-sm font-medium text-[#5A3A1E]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
