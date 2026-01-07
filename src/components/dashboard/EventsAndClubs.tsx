import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Bookmark, MapPin, Users, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { eventService, EventData } from '@/services/eventService';

export function EventsAndClubs() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventService.getEvents();
                if (data.length > 0) {
                    setEvents(data);
                } else {
                    // Fallback mock data if DB is empty for demo purposes
                    setEvents([
                        {
                            id: '1',
                            title: 'Tech Fest 2025',
                            date: 'Jan 15-17, 2025',
                            time: '9:00 AM onwards',
                            location: 'Main Auditorium',
                            category: 'Technology',
                            attendees: 450,
                            saved: false,
                            color: 'from-primary to-primary/70'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to load events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-primary text-2xl font-bold">Events & Clubs</h2>
                    <p className="text-sm text-muted-foreground">Discover campus activities</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden shadow-sm border-border hover:shadow-md transition-all group">
                        {/* Event Poster */}
                        <div className={`bg-gradient-to-br ${event.color || 'from-primary to-primary/70'} p-8 text-white relative`}>
                            <Badge className="absolute top-4 right-4 bg-white/20 text-white border-0 backdrop-blur-sm">
                                {event.category}
                            </Badge>
                            <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                            <p className="text-white/90 font-medium">{event.date}</p>
                        </div>

                        {/* Event Details */}
                        <div className="p-5 bg-white">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {event.time}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    {event.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    {event.attendees} interested
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1 rounded-xl">
                                    Register Now
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`rounded-xl p-2.5 h-auto ${event.saved
                                        ? 'bg-primary text-white border-primary'
                                        : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    <Bookmark className={`h-4 w-4 ${event.saved ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
