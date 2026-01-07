import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Package, MapPin, Calendar, Camera, Upload } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const lostItems = [
    {
        id: 1,
        name: 'Blue Water Bottle',
        section: 'Lost',
        description: 'Cello brand, slightly dented',
        location: 'Library - 2nd Floor',
        date: 'Dec 24, 2025',
        image: 'https://images.unsplash.com/photo-1724992609118-551ad0b79421?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGJvdHRsZSUyMGJsdWV8ZW58MXx8fHwxNzY2ODQ5MjYyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 2,
        name: 'Black Backpack',
        section: 'Found',
        description: 'Nike brand with laptop compartment',
        location: 'Cafeteria',
        date: 'Dec 23, 2025',
        image: 'https://images.unsplash.com/photo-1555825243-51b2b5931946?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGJhY2twYWNrfGVufDF8fHx8MTc2Njg0OTI2Mnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 3,
        name: 'Calculator',
        section: 'Found',
        description: 'Casio scientific calculator',
        location: 'Classroom 305',
        date: 'Dec 22, 2025',
        image: 'https://images.unsplash.com/photo-1675242314995-034d11bac319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxjdWxhdG9yJTIwc2NpZW50aWZpY3xlbnwxfHx8fDE3NjY3OTMyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: 4,
        name: 'Red Umbrella',
        section: 'Lost',
        description: 'Collapsible with floral pattern',
        location: 'Sports Complex',
        date: 'Dec 21, 2025',
        image: 'https://images.unsplash.com/photo-1516368694098-47836cebec97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB1bWJyZWxsYXxlbnwxfHx8fDE3NjY4NDkyNjN8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];

export function LostAndFound() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [section, setSection] = useState<'Lost' | 'Found'>('Lost');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // Handle form submission here
        console.log({ itemName, section, description, location, imageFile });
        // Reset form
        setItemName('');
        setSection('Lost');
        setDescription('');
        setLocation('');
        setImageFile(null);
        setImagePreview('');
        setDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                        <Package className="h-6 w-6 text-[#5A3A1E]" />
                    </div>
                    <div>
                        <h2 className="text-[#5A3A1E] text-2xl font-bold">Lost & Found</h2>
                        <p className="text-sm text-[#7A5C3A]">Help find or claim items</p>
                    </div>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger>
                        <Button className="rounded-xl shadow-md">
                            Report Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Report Lost or Found Item</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-5 mt-4">
                            {/* Item Type Selection */}
                            <div className="space-y-3">
                                <Label>Item Status</Label>
                                <RadioGroup value={section} onValueChange={(value) => setSection(value as 'Lost' | 'Found')} className="flex-row gap-6">
                                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border-2 border-[#EADFCC] cursor-pointer">
                                        <RadioGroupItem value="Lost" id="lost" />
                                        <Label htmlFor="lost" className="mb-0 cursor-pointer">I Lost This Item</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border-2 border-[#EADFCC] cursor-pointer">
                                        <RadioGroupItem value="Found" id="found" />
                                        <Label htmlFor="found" className="mb-0 cursor-pointer">I Found This Item</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Item Name */}
                            <div className="space-y-2">
                                <Label htmlFor="itemName">Item Name</Label>
                                <Input
                                    id="itemName"
                                    placeholder="e.g., Blue Water Bottle"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    placeholder="e.g., Library - 2nd Floor"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe the item in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-3">
                                <Label>Item Photo</Label>
                                <div className="space-y-3">
                                    {imagePreview && (
                                        <div className="relative w-full h-48 bg-[#F5EFE6] rounded-2xl overflow-hidden border-2 border-[#EADFCC]">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-2xl border-2 border-dashed border-[#EADFCC] transition-colors group">
                                                <Camera className="h-6 w-6 text-[#5A3A1E] group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold text-[#5A3A1E]">Camera</span>
                                            </div>
                                        </label>

                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-2xl border-2 border-dashed border-[#EADFCC] transition-colors group">
                                                <Upload className="h-6 w-6 text-[#5A3A1E] group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold text-[#5A3A1E]">Upload</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={!itemName || !location || !description || !imageFile}
                                className="w-full rounded-2xl py-6 font-bold text-lg shadow-lg mt-2"
                            >
                                Post to Feed
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {lostItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden shadow-sm border-[#EADFCC] hover:shadow-md transition-all group">
                        <div className="flex flex-col sm:flex-row">
                            {/* Item Image */}
                            <div className="sm:w-64 h-64 sm:h-auto bg-[#F5EFE6] flex-shrink-0 relative overflow-hidden">
                                <ImageWithFallback
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <Badge
                                    variant="outline"
                                    className={`absolute top-4 left-4 border-0 backdrop-blur-md shadow-sm ${item.section === 'Lost'
                                        ? 'bg-orange-500/80 text-white'
                                        : 'bg-green-600/80 text-white'
                                        }`}
                                >
                                    {item.section}
                                </Badge>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#5A3A1E] mb-1">{item.name}</h3>
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
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl font-bold border-2"
                                    >
                                        {item.section === 'Lost' ? 'I Found This' : 'This is Mine'}
                                    </Button>
                                    <Button
                                        className="rounded-xl px-6"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
