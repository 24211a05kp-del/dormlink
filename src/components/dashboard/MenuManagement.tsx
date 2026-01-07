import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Coffee, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';

import { menuService, WeeklyMenu, DayMenu } from '@/services/menuService';

export function MenuManagement() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = daysOfWeek[new Date().getDay()];

    const [menu, setMenu] = useState<WeeklyMenu>({});
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(today);
    const [newItem, setNewItem] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<keyof DayMenu>('breakfast');

    useEffect(() => {
        const init = async () => {
            await menuService.initialize();
        };
        init();

        const unsubscribe = menuService.subscribeToMenu((data) => {
            setMenu(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddItem = async () => {
        if (newItem.trim() && menu[selectedDay]) {
            const updatedDayMenu = {
                ...menu[selectedDay],
                [selectedCategory]: [...menu[selectedDay][selectedCategory], newItem]
            };

            // Optimistic update
            const prevMenu = { ...menu };
            setMenu(prev => ({ ...prev, [selectedDay]: updatedDayMenu }));
            setNewItem('');

            try {
                await menuService.updateDayMenu(selectedDay, updatedDayMenu);
            } catch (error) {
                console.error("Failed to update menu", error);
                setMenu(prevMenu); // Revert
            }
        }
    };

    const handleDeleteItem = async (day: string, category: keyof DayMenu, itemToDelete: string) => {
        if (menu[day]) {
            const updatedDayMenu = {
                ...menu[day],
                [category]: menu[day][category].filter(item => item !== itemToDelete)
            };

            // Optimistic update
            const prevMenu = { ...menu };
            setMenu(prev => ({ ...prev, [day]: updatedDayMenu }));

            try {
                await menuService.updateDayMenu(day, updatedDayMenu);
            } catch (error) {
                console.error("Failed to delete item", error);
                setMenu(prevMenu); // Revert
            }
        }
    };

    const categories: { key: keyof WeeklyMenu[string]; color: string; label: string }[] = [
        { key: 'breakfast', color: 'orange', label: 'Breakfast' },
        { key: 'lunch', color: 'green', label: 'Lunch' },
        { key: 'snacks', color: 'blue', label: 'Snacks' },
        { key: 'dinner', color: 'purple', label: 'Dinner' }
    ];

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#5A3A1E]" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                    <Coffee className="h-6 w-6 text-[#5A3A1E]" />
                </div>
                <div>
                    <h2 className="text-[#5A3A1E] text-2xl font-bold">Menu Management</h2>
                    <p className="text-sm text-[#7A5C3A]">Update and customize the weekly menu</p>
                </div>
            </div>

            {/* Editor Controls */}
            <Card className="p-5 shadow-lg border-[#EADFCC] bg-white">
                <h3 className="mb-4 text-[#5A3A1E] font-bold">Add Item to {selectedDay}'s Menu</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as keyof WeeklyMenu[string])}
                        className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-[#5A3A1E] font-medium outline-none focus:border-[#5A3A1E]"
                    >
                        {categories.map(cat => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                    </select>
                    <Input
                        placeholder="Dish name (e.g. Masala Dosa)"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        className="flex-1 border-[#EADFCC] focus-visible:ring-[#5A3A1E]"
                    />
                    <Button
                        onClick={handleAddItem}
                        className="bg-[#5A3A1E] hover:bg-[#3D2614] text-white rounded-xl"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Dish
                    </Button>
                </div>
            </Card>

            {/* Weekly View */}
            <Tabs value={selectedDay} onValueChange={setSelectedDay} className="space-y-6">
                <TabsList className="bg-white border border-[#EADFCC] p-1.5 rounded-2xl shadow-sm flex-wrap h-auto gap-1">
                    {daysOfWeek.map((day) => (
                        <TabsTrigger
                            key={day}
                            value={day}
                            className="rounded-xl flex-1 py-3 data-[state=active]:bg-[#5A3A1E] data-[state=active]:text-white text-[#5A3A1E] transition-all"
                        >
                            {day.slice(0, 3)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {daysOfWeek.map((day) => (
                    <TabsContent key={day} value={day} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => (
                            <Card key={cat.key} className="p-6 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow bg-white relative group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-3 h-3 rounded-full bg-${cat.color}-500 shadow-sm shadow-${cat.color}-200`}></div>
                                    <h3 className="text-[#5A3A1E] font-bold text-lg">{cat.label}</h3>
                                    <Badge variant="secondary" className="ml-auto bg-[#F5EFE6] text-[#7A5C3A]">
                                        {menu[day][cat.key].length} items
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {menu[day][cat.key].map((item, index) => (
                                        <div
                                            key={index}
                                            className="group/item relative flex items-center"
                                        >
                                            <span className="px-4 py-2 bg-[#F5EFE6] border border-[#EADFCC] rounded-xl text-sm font-medium text-[#5A3A1E] pr-8">
                                                {item}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteItem(day, cat.key, item)}
                                                className="absolute right-2 p-1 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {menu[day][cat.key].length === 0 && (
                                        <span className="text-sm text-muted-foreground italic">No items yet</span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
