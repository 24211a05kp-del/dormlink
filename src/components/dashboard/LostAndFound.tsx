import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Package, MapPin, Calendar, Camera, Upload, Loader2, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { lostFoundService, LostItem, FoundItem } from '@/services/lostFoundService';
import { format } from 'date-fns';

export function LostAndFound() {
    const { user } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [section, setSection] = useState<'Lost' | 'Found'>('Lost');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Personal');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
    const [activeTab, setActiveTab] = useState<'Lost' | 'Found'>('Lost');

    useEffect(() => {
        const unsubLost = lostFoundService.subscribeToLostItems(setLostItems);
        const unsubFound = lostFoundService.subscribeToFoundItems(setFoundItems);
        return () => {
            unsubLost();
            unsubFound();
        };
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!user || !itemName || !location || !description) return;

        setLoading(true);
        try {
            const data = {
                uid: user.uid,
                studentName: user.displayName || 'Anonymous',
                title: itemName,
                description,
                location,
                category,
                date: format(new Date(), 'MMM dd, yyyy'),
                image: imagePreview || undefined
            };

            if (section === 'Lost') {
                await lostFoundService.reportLost(data);
            } else {
                await lostFoundService.reportFound(data);
            }

            // Reset form
            setItemName('');
            setSection('Lost');
            setDescription('');
            setLocation('');
            setImagePreview('');
            setDialogOpen(false);
        } catch (error) {
            console.error("Failed to report item", error);
        } finally {
            setLoading(false);
        }
    };

    const displayItems = activeTab === 'Lost' ? lostItems : foundItems;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                        <Package className="h-6 w-6 text-[#5A3A1E]" />
                    </div>
                    <div>
                        <h2 className="text-[#5A3A1E] text-2xl font-bold">Lost & Found</h2>
                        <p className="text-sm text-[#7A5C3A]">Help find or claim items</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[#F5EFE6] p-1 rounded-xl border border-[#EADFCC]">
                        <button
                            onClick={() => setActiveTab('Lost')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Lost' ? 'bg-primary text-white shadow-sm' : 'text-[#7A5C3A] hover:bg-[#EADFCC]'}`}
                        >
                            Lost Items
                        </button>
                        <button
                            onClick={() => setActiveTab('Found')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Found' ? 'bg-primary text-white shadow-sm' : 'text-[#7A5C3A] hover:bg-[#EADFCC]'}`}
                        >
                            Found Items
                        </button>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl shadow-md">
                                Report Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
                            <DialogHeader>
                                <DialogTitle className="text-[#5A3A1E]">Report Lost or Found Item</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5 mt-4">
                                <RadioGroup value={section} onValueChange={(value) => setSection(value as 'Lost' | 'Found')} className="flex gap-4">
                                    <div className="flex items-center space-x-2 bg-[#F5EFE6] px-4 py-3 rounded-xl border-2 border-[#EADFCC] flex-1 cursor-pointer">
                                        <RadioGroupItem value="Lost" id="lost" />
                                        <Label htmlFor="lost" className="mb-0 cursor-pointer text-[#5A3A1E] font-bold">Lost</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-[#F5EFE6] px-4 py-3 rounded-xl border-2 border-[#EADFCC] flex-1 cursor-pointer">
                                        <RadioGroupItem value="Found" id="found" />
                                        <Label htmlFor="found" className="mb-0 cursor-pointer text-[#5A3A1E] font-bold">Found</Label>
                                    </div>
                                </RadioGroup>

                                <div className="space-y-2">
                                    <Label htmlFor="itemName">Item Name</Label>
                                    <Input
                                        id="itemName"
                                        placeholder="e.g., Blue Water Bottle"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Library - 2nd Floor"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the item to help identify it..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label>Item Photo</Label>
                                    <div className="space-y-3">
                                        {imagePreview && (
                                            <div className="relative w-full h-48 bg-[#F5EFE6] rounded-2xl overflow-hidden border-2 border-[#EADFCC]">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className="cursor-pointer">
                                                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                                                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-2xl border-2 border-dashed border-[#EADFCC] transition-all group">
                                                    <Camera className="h-6 w-6 text-[#5A3A1E] group-hover:scale-110" />
                                                    <span className="text-xs font-bold text-[#5A3A1E]">Camera</span>
                                                </div>
                                            </label>
                                            <label className="cursor-pointer">
                                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-2xl border-2 border-dashed border-[#EADFCC] transition-all group">
                                                    <Upload className="h-6 w-6 text-[#5A3A1E] group-hover:scale-110" />
                                                    <span className="text-xs font-bold text-[#5A3A1E]">Upload</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || !itemName || !location || !description}
                                    className="w-full rounded-2xl py-6 font-bold text-lg shadow-lg mt-2"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                    Post Report
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6">
                {displayItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden shadow-sm border-[#EADFCC] hover:shadow-md transition-all group bg-white">
                        <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-64 h-64 sm:h-auto bg-[#F5EFE6] flex-shrink-0 relative overflow-hidden">
                                <ImageWithFallback
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <Badge
                                    className={`absolute top-4 left-4 border-0 shadow-sm ${activeTab === 'Lost' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'}`}
                                >
                                    {activeTab === 'Lost' ? 'Lost' : 'Found'} • {item.status}
                                </Badge>
                            </div>

                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#5A3A1E] mb-1">{item.title}</h3>
                                            <p className="text-[#7A5C3A] font-medium italic">{item.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-[#7A5C3A] bg-[#F5EFE6] p-3 rounded-xl border border-[#EADFCC]">
                                            <MapPin className="h-4 w-4 text-[#5A3A1E]" />
                                            <span className="font-bold text-[#5A3A1E]">Where:</span> {item.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#7A5C3A] bg-[#F5EFE6] p-3 rounded-xl border border-[#EADFCC]">
                                            <Calendar className="h-4 w-4 text-[#5A3A1E]" />
                                            <span className="font-bold text-[#5A3A1E]">When:</span> {item.date}
                                        </div>
                                    </div>
                                    <div className="text-xs text-[#7A5C3A] mb-4">
                                        Reported by: <span className="font-bold">{item.studentName}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 rounded-xl font-bold border-2 border-[#EADFCC] text-[#5A3A1E]">
                                        {activeTab === 'Lost' ? 'I Found This' : 'This is Mine'}
                                    </Button>
                                    <Button className="rounded-xl px-6 bg-[#5A3A1E]">
                                        Contact
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {displayItems.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-[#EADFCC]">
                        <Package className="h-12 w-12 text-[#EADFCC] mx-auto mb-4" />
                        <h3 className="text-[#5A3A1E] font-bold text-xl">No items reported yet</h3>
                        <p className="text-[#7A5C3A]">Be the first to help the community!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
