import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/card';
import { Calendar, Lightbulb, CheckCircle2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { widgetService, Thought, Event } from '@/services/widgetService';

interface DashboardTopSectionProps {
    userName: string;
    onFeedbackClick?: () => void;
    onSupportClick?: () => void;
}

export function DashboardTopSection({ userName, onFeedbackClick, onSupportClick }: DashboardTopSectionProps) {
    const [thought, setThought] = useState<Thought | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const unsubThought = widgetService.subscribeToLatestThought(setThought);
        const unsubEvents = widgetService.subscribeToEvents(setEvents);
        return () => {
            unsubThought();
            unsubEvents();
        };
    }, []);

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const slideCount = 4;

    const paginate = useCallback((newDirection: number) => {
        setDirection(newDirection);
        setCurrentSlide((prev) => (prev + newDirection + slideCount) % slideCount);
    }, [slideCount]);

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1);
        }, 8000);
        return () => clearInterval(timer);
    }, [paginate]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0
        })
    };

    const renderSlide = (index: number) => {
        switch (index) {
            case 0:
                return (
                    <Card className="w-full h-full flex items-center justify-center rounded-none border-0 p-6 sm:p-12 bg-gradient-to-r from-orange-50 to-amber-50 shadow-none">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center gap-3 mb-6"
                            >
                                <div className="bg-primary/10 p-4 rounded-full">
                                    <Lightbulb className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold text-xl">Thought of the Day</h3>
                                    <p className="text-sm text-muted-foreground">{today}</p>
                                </div>
                            </motion.div>
                            <motion.blockquote
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-foreground/90 italic mb-6 text-2xl sm:text-4xl font-serif leading-tight"
                            >
                                "{thought?.text || "Every accomplishment starts with the decision to try."}"
                            </motion.blockquote>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-lg text-muted-foreground font-medium"
                            >— {thought?.author || "John F. Kennedy"}</motion.p>
                        </div>
                    </Card>
                );
            case 1:
                const event = events[0];
                return (
                    <Card className="w-full h-full flex items-center justify-center rounded-none border-0 p-6 sm:p-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-none">
                        <div className="max-w-4xl mx-auto text-center">
                            {event ? (
                                <>
                                    <div className="flex flex-col items-center gap-3 mb-6">
                                        <div className="bg-white/20 p-4 rounded-full">
                                            <Calendar className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl">Upcoming Event</h3>
                                            <p className="text-sm text-white/80">{event.date}</p>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl sm:text-6xl font-bold mb-4">{event.title}</h2>
                                    <p className="text-xl sm:text-2xl text-white/90">{event.description}</p>
                                    <p className="text-lg mt-4 text-white/80">{event.location} • {event.time}</p>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center gap-3 mb-6">
                                        <div className="bg-white/20 p-4 rounded-full">
                                            <Calendar className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl">No Events</h3>
                                            <p className="text-sm text-white/80">Stay tuned</p>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl sm:text-6xl font-bold mb-4">New Events Soon</h2>
                                    <p className="text-xl sm:text-2xl text-white/90">Check back later for exciting campus activities!</p>
                                </>
                            )}
                        </div>
                    </Card>
                );
            case 2:
                return (
                    <Card className="w-full h-full flex items-center justify-center rounded-none border-0 p-6 sm:p-12 bg-gradient-to-r from-orange-50 to-orange-100 shadow-none">
                        <div className="max-w-4xl mx-auto text-center text-orange-950">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-orange-500 p-4 rounded-full">
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Mess Feedback</h3>
                                    <p className="text-sm opacity-70">Help us improve</p>
                                </div>
                            </div>
                            <p className="text-3xl sm:text-4xl mb-8 font-medium">
                                Share your thoughts on today's meals
                            </p>
                            <Button
                                onClick={onFeedbackClick}
                                size="lg"
                                className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-12 py-8 text-xl shadow-lg transform active:scale-95 transition-all"
                            >
                                Give Feedback
                            </Button>
                        </div>
                    </Card>
                );
            case 3:
                return (
                    <Card className="w-full h-full flex items-center justify-center rounded-none border-0 p-6 sm:p-12 bg-gradient-to-r from-blue-50 to-blue-100 shadow-none">
                        <div className="max-w-4xl mx-auto text-center text-blue-950">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                <div className="bg-blue-600 p-4 rounded-full">
                                    <MessageSquare className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Need Support?</h3>
                                    <p className="text-sm opacity-70">We're here for you</p>
                                </div>
                            </div>
                            <p className="text-3xl sm:text-4xl mb-8 font-medium">
                                Facing any issues in your room or hostel?
                            </p>
                            <Button
                                onClick={onSupportClick}
                                variant="outline"
                                size="lg"
                                className="border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white rounded-full px-12 py-8 text-xl border-2 shadow-lg transform active:scale-95 transition-all"
                            >
                                Raise Ticket
                            </Button>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="w-full mb-8 relative group overflow-hidden bg-white/50 border-b border-[#EADFCC]">
            <div className="h-[400px] relative w-full">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {renderSlide(currentSlide)}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/10 hover:bg-black/20 text-black/50 hover:text-black backdrop-blur-sm h-12 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => paginate(-1)}
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/10 hover:bg-black/20 text-black/50 hover:text-black backdrop-blur-sm h-12 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => paginate(1)}
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {[...Array(slideCount)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setDirection(i > currentSlide ? 1 : -1);
                                setCurrentSlide(i);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-8 bg-primary shadow-sm' : 'w-2 bg-black/20 hover:bg-black/30'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
