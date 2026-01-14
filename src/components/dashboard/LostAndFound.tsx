import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Package, MapPin, Calendar, Camera, Upload, Loader2, Search, Check } from 'lucide-react';
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

    // New Fields
    const [personName, setPersonName] = useState('');
    const [blockName, setBlockName] = useState('');
    const [yearOfStudy, setYearOfStudy] = useState('');
    const [collegeEmail, setCollegeEmail] = useState('');

    const [category, setCategory] = useState('Personal');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
    const [activeTab, setActiveTab] = useState<'Lost' | 'Found'>('Lost');
    const [claimedItems, setClaimedItems] = useState<Set<string>>(new Set());

    const handleClaim = (id: string, isLost: boolean) => {
        setClaimedItems(prev => new Set(prev).add(id));
        // Optionally update backend status to 'claimed'
        if (isLost) {
            lostFoundService.updateLostItemStatus(id, 'claimed');
        } else {
            lostFoundService.updateFoundItemStatus(id, 'claimed');
        }
    };

    useEffect(() => {
        if (user?.displayName) {
            setPersonName(user.displayName);
        }
    }, [user]);

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
        if (!user || !itemName || !location || !description || !personName || !blockName || !yearOfStudy) return;

        setLoading(true);
        try {
            const data = {
                uid: user.uid,
                studentName: personName, // Using the manual input which defaults to displayName
                blockName,
                yearOfStudy,
                collegeEmail: collegeEmail || undefined, // Optional
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
            // Reset fields but keep name logic (useEffect handles name, but maybe good to keep it set? implementation plan said pre-fill. If I clear it, useEffect might not re-run unless user changes. Better to reset name to user.displayName manually or keep it.)
            // The user might want to report another item. Keeping name is friendly.
            setBlockName('');
            setYearOfStudy('');
            setCollegeEmail('');
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="personName">Your Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="personName"
                                            value={personName}
                                            onChange={(e) => setPersonName(e.target.value)}
                                            className="rounded-xl border-[#EADFCC]"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="yearOfStudy">Year <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="yearOfStudy"
                                            value={yearOfStudy}
                                            onChange={(e) => setYearOfStudy(e.target.value)}
                                            className="rounded-xl border-[#EADFCC]"
                                            placeholder="e.g. 2nd Year"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="blockName">Block <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="blockName"
                                            value={blockName}
                                            onChange={(e) => setBlockName(e.target.value)}
                                            className="rounded-xl border-[#EADFCC]"
                                            placeholder="e.g. Block A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="collegeEmail">College Email (Optional)</Label>
                                        <Input
                                            id="collegeEmail"
                                            type="email"
                                            value={collegeEmail}
                                            onChange={(e) => setCollegeEmail(e.target.value)}
                                            className="rounded-xl border-[#EADFCC]"
                                            placeholder="student@college.edu"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="itemName">Item Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="itemName"
                                        placeholder="e.g., Blue Water Bottle"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="location"
                                        placeholder="e.g., Library - 2nd Floor"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
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
                                    <Label>Item Photo (Optional)</Label>
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
                                    disabled={loading || !itemName || !location || !description || !personName || !blockName || !yearOfStudy}
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
                                    <div className="text-xs text-[#7A5C3A] mb-4 space-y-1">
                                        <p>Reported by: <span className="font-bold">{item.studentName}</span></p>
                                        <p>Block: <span className="font-bold">{item.blockName}</span> • Year: <span className="font-bold">{item.yearOfStudy}</span></p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 mt-auto">
                                    <div className="flex gap-3">
                                        <Button
                                            variant={claimedItems.has(item.id!) ? "secondary" : "outline"}
                                            className={`flex-1 rounded-xl font-bold border-2 ${claimedItems.has(item.id!) ? 'bg-green-100 border-green-500 text-green-700' : 'border-[#EADFCC] text-[#5A3A1E]'}`}
                                            onClick={() => item.id && handleClaim(item.id, activeTab === 'Lost')}
                                            disabled={claimedItems.has(item.id!)}
                                        >
                                            {claimedItems.has(item.id!) ? (
                                                <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Claimed</span>
                                            ) : (
                                                activeTab === 'Lost' ? 'I Found This' : 'This is Mine'
                                            )}
                                        </Button>

                                        {item.collegeEmail && (
                                            <a
                                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.collegeEmail}&su=${encodeURIComponent(`Contact regarding ${activeTab} Item: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.studentName},\n\nI am contacting you regarding the ${activeTab.toLowerCase()} item "${item.title}" reported on Dormlink.\n\n[Item Details]:\n- Item: ${item.title}\n- Location: ${item.location}\n- Date: ${item.date}\n- Block: ${item.blockName}\n\n[Reporter Info]:\n- Name: ${item.studentName}\n- Year: ${item.yearOfStudy}\n\nPlease let me know a suitable time to connect.\n\nRegards,\n${user?.displayName || 'Dormlink User'}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-xl flex-[1.5] bg-[#5A3A1E] hover:bg-[#3D2614] text-xs py-2 px-4 shadow-sm text-white font-bold flex items-center justify-center transition-colors"
                                            >
                                                Email: {item.collegeEmail}
                                            </a>
                                        )}
                                    </div>
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
