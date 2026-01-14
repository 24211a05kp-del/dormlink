import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar, Upload, Camera, Trash2, Plus, Loader2, Megaphone, MapPin, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useAuth } from '@/context/AuthContext';
import { eventService, CampusEvent } from '@/services/eventService';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { PosterLightbox } from './PosterLightbox';

export function EventManagement() {
    const { user } = useAuth();
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>('');

    // Form fields
    const [eventName, setEventName] = useState('');
    const [clubOrDept, setClubOrDept] = useState('');
    const [deadline, setDeadline] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPoster, setSelectedPoster] = useState<{ src: string; title: string } | null>(null);

    useEffect(() => {
        const unsubscribe = eventService.subscribeToEvents(setEvents);
        return () => unsubscribe();
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
        if (!user || !eventName || !clubOrDept || !deadline || !eventDate || !location) {
            toast.error("Please fill all mandatory fields (marked with *)");
            return;
        }

        setLoading(true);
        try {
            await eventService.createEvent({
                title: eventName,
                clubOrDepartment: clubOrDept,
                registrationDeadline: deadline,
                date: eventDate,
                location: location,
                description: description,
                imageUrl: imagePreview || undefined,
                organizerId: user.uid,
                organizerName: user.displayName || 'Faculty'
            });

            toast.success("Event uploaded successfully!");
            // Reset form
            setEventName('');
            setClubOrDept('');
            setDeadline('');
            setEventDate('');
            setLocation('');
            setDescription('');
            setImagePreview('');
            setIsCreating(false);
        } catch (error) {
            toast.error("Failed to upload event");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await eventService.deleteEvent(id);
                toast.success("Event deleted");
            } catch (error) {
                toast.error("Failed to delete event");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                        <Megaphone className="h-6 w-6 text-[#5A3A1E]" />
                    </div>
                    <div>
                        <h2 className="text-[#5A3A1E] text-2xl font-bold">Event Management</h2>
                        <p className="text-sm text-[#7A5C3A]">Upload posters and manage registrations</p>
                    </div>
                </div>

                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="rounded-xl shadow-md h-12 px-6"
                >
                    {isCreating ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Post New Event</>}
                </Button>
            </div>

            {isCreating && (
                <Card className="p-6 border-2 border-primary/20 bg-white animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-[#5A3A1E] mb-6 flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        New Event Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5A3A1E]">Event Name *</label>
                                <Input
                                    placeholder="e.g. Annual Tech Symposium"
                                    value={eventName}
                                    onChange={e => setEventName(e.target.value)}
                                    className="rounded-xl border-[#EADFCC]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5A3A1E]">Club / Department Name *</label>
                                <Input
                                    placeholder="e.g. CSE Department / Drama Club"
                                    value={clubOrDept}
                                    onChange={e => setClubOrDept(e.target.value)}
                                    className="rounded-xl border-[#EADFCC]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#5A3A1E]">Registration Deadline *</label>
                                    <Input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#5A3A1E]">Event Date *</label>
                                    <Input
                                        type="date"
                                        value={eventDate}
                                        onChange={e => setEventDate(e.target.value)}
                                        className="rounded-xl border-[#EADFCC]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5A3A1E]">Location *</label>
                                <Input
                                    placeholder="e.g. Main Auditorium"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    className="rounded-xl border-[#EADFCC]"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5A3A1E]">Event Description</label>
                                <Textarea
                                    placeholder="Briefly describe the event..."
                                    rows={4}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="rounded-xl border-[#EADFCC]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#5A3A1E]">Event Poster / Registration QR</label>
                                <div className="space-y-3">
                                    {imagePreview && (
                                        <div className="relative w-full h-40 bg-[#F5EFE6] rounded-xl overflow-hidden border-2 border-[#EADFCC]">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="cursor-pointer">
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-xl border-2 border-dashed border-[#EADFCC] transition-all group">
                                                <Upload className="h-5 w-5 text-[#5A3A1E] group-hover:scale-110" />
                                                <span className="text-xs font-bold text-[#5A3A1E]">Choose Photo</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
                                            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-[#F5EFE6] rounded-xl border-2 border-dashed border-[#EADFCC] transition-all group">
                                                <Camera className="h-5 w-5 text-[#5A3A1E] group-hover:scale-110" />
                                                <span className="text-xs font-bold text-[#5A3A1E]">Take Photo</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !eventName || !clubOrDept || !deadline}
                            className="w-full h-12 rounded-xl text-lg font-bold shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            Upload and Broadcast Event
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden border-[#EADFCC] hover:shadow-lg transition-all group relative h-full flex flex-col">
                        <div
                            className="h-48 bg-[#F5EFE6] relative cursor-pointer"
                            onClick={() => setSelectedPoster({
                                src: (event.imageUrl || event.image)!,
                                title: event.title
                            })}
                        >
                            <ImageWithFallback
                                src={event.imageUrl || event.image}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                <Badge className="bg-[#5A3A1E] text-white border-0 shadow-sm">
                                    {event.clubOrDepartment}
                                </Badge>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => event.id && handleDelete(event.id)}
                                className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-[#5A3A1E] text-lg mb-4 line-clamp-1">{event.title}</h3>
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-sm text-[#7A5C3A] bg-[#F5EFE6] p-2 rounded-lg border border-[#EADFCC]/50">
                                    <Calendar className="h-4 w-4 text-[#5A3A1E]" />
                                    <span className="font-bold">Date:</span> {format(new Date(event.date), 'MMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#7A5C3A] bg-[#F5EFE6] p-2 rounded-lg border border-[#EADFCC]/50">
                                    <Clock className="h-4 w-4 text-[#5A3A1E]" />
                                    <span className="font-bold text-red-600">Reg. Till:</span> {format(new Date(event.registrationDeadline), 'MMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[#7A5C3A] bg-[#F5EFE6] p-2 rounded-lg border border-[#EADFCC]/50">
                                    <MapPin className="h-4 w-4 text-[#5A3A1E]" />
                                    <span className="font-bold">Loc:</span> {event.location}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {events.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-[#EADFCC]">
                        <Megaphone className="h-12 w-12 text-[#EADFCC] mx-auto mb-4" />
                        <h3 className="text-[#5A3A1E] font-bold text-xl">No events posted</h3>
                        <p className="text-[#7A5C3A]">Be the first to organize an event!</p>
                    </div>
                )}
            </div>

            <PosterLightbox
                isOpen={!!selectedPoster}
                onClose={() => setSelectedPoster(null)}
                imageSrc={selectedPoster?.src}
                imageAlt={selectedPoster?.title}
            />
        </div>
    );
}
