import { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, MapPin, Search, Filter, Loader2, Clock, Megaphone, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { eventService, CampusEvent } from '@/services/eventService';
import { Input } from '../ui/input';
import { format } from 'date-fns';
import { PosterLightbox } from './PosterLightbox';

export function EventsBoard() {
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPoster, setSelectedPoster] = useState<{ src: string; title: string } | null>(null);

    useEffect(() => {
        const unsubscribe = eventService.subscribeToEvents((data) => {
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Dynamically get unique clubs/departments for filtering
    const categories = useMemo(() => {
        const cats = new Set(events.map(e => e.clubOrDepartment));
        return ['All', ...Array.from(cats)].sort();
    }, [events]);

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.clubOrDepartment.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || event.clubOrDepartment === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [events, searchQuery, selectedCategory]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-[#EADFCC]">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Megaphone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-[#5A3A1E] text-xl font-bold">Campus Events</h2>
                            <p className="text-xs text-[#7A5C3A]">Search and filter activities</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A5C3A] group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by event, club, or description..."
                            className="pl-10 rounded-xl border-[#EADFCC] bg-[#F5EFE6]/30 focus:bg-white"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-3 w-3 text-[#7A5C3A]" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:max-w-[50%]">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${selectedCategory === cat
                                ? 'bg-primary border-primary text-white shadow-md'
                                : 'bg-white border-[#EADFCC] text-[#7A5C3A] hover:bg-[#F5EFE6]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                    <Card
                        key={event.id}
                        className="overflow-hidden border-[#EADFCC] hover:shadow-xl transition-all group flex flex-col bg-white rounded-[2rem] cursor-pointer"
                        onClick={() => setSelectedPoster({
                            src: (event.imageUrl || event.image)!,
                            title: event.title
                        })}
                    >
                        <div className="h-56 bg-[#F5EFE6] relative overflow-hidden">
                            <ImageWithFallback
                                src={event.imageUrl || event.image}
                                alt={event.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <Badge className="absolute top-4 left-4 bg-white/90 text-[#5A3A1E] border-0 backdrop-blur-sm font-bold shadow-md">
                                {event.clubOrDepartment}
                            </Badge>

                            <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <Button
                                    className="w-full rounded-xl bg-white text-[#5A3A1E] hover:bg-primary hover:text-white font-bold text-xs h-9"
                                    onClick={(e) => {
                                        // Prevents triggering the lightbox if they clicked the register button specifically
                                        // (though usually they'd want to see the poster anyway for registration info)
                                        // e.stopPropagation(); 
                                    }}
                                >
                                    Register for Event
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-[#5A3A1E] mb-2 line-clamp-1">{event.title}</h3>
                                <p className="text-sm text-[#7A5C3A] line-clamp-2 italic">{event.description || "Join us for this exciting campus event!"}</p>
                            </div>

                            <div className="space-y-2 mt-auto">
                                <div className="flex items-center gap-2 text-xs font-medium text-[#7A5C3A]">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    <span>{event.date ? format(new Date(event.date), 'MMMM dd, yyyy') : 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Registration Deadline: {event.registrationDeadline ? format(new Date(event.registrationDeadline), 'MMM dd, yyyy') : 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-[#7A5C3A]">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span className="line-clamp-1">{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-[#EADFCC]">
                        <Search className="h-12 w-12 text-[#EADFCC] mx-auto mb-4" />
                        <h3 className="text-[#5A3A1E] font-bold text-xl">No events found</h3>
                        <p className="text-[#7A5C3A]">Try adjusting your search or filters</p>
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
