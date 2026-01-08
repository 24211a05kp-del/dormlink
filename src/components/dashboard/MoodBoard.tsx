import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Heart, Smile, Loader2 } from 'lucide-react';
import { moodService, MoodEntry } from '@/services/moodService';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

const moodOptions = [
    { emoji: '😫', label: 'Terrible', color: 'bg-red-50 hover:bg-red-100 border-red-100' },
    { emoji: '😔', label: 'Sad', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100' },
    { emoji: '😐', label: 'Okay', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
    { emoji: '🙂', label: 'Good', color: 'bg-lime-50 hover:bg-lime-100 border-lime-100' },
    { emoji: '😄', label: 'Great', color: 'bg-green-50 hover:bg-green-100 border-green-100' },
    { emoji: '🤩', label: 'Amazing', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100' }
];

interface MoodBoardProps {
    userName: string;
}

export function MoodBoard({ userName }: MoodBoardProps) {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [history, setHistory] = useState<(MoodEntry & { id: string })[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchHistory();
            checkTodayMood();
        }
    }, [user]);

    const checkTodayMood = async () => {
        if (!user) return;
        const todayMood = await moodService.getTodayMood(user.uid);
        if (todayMood) {
            setSelectedMood(todayMood.mood);
            setNote(todayMood.note || '');
            setSubmitted(true);
        }
    };

    const fetchHistory = async () => {
        if (!user) return;
        const data = await moodService.getRecentMoods(user.uid);
        // Cast to correct type since service returns strictly typed array now
        setHistory(data as any);
    };

    const handleSubmit = async () => {
        if (!user || !selectedMood) return;

        setLoading(true);
        try {
            await moodService.saveMood(user.uid, userName || 'Student', selectedMood, note);
            setSubmitted(true);
            await fetchHistory();
            // Don't auto-clear for now, as requirements say "Allow updating it". 
            // Better to leave it selected so they know what they submitted.
        } catch (error) {
            console.error("Failed to save mood", error);
        } finally {
            setLoading(false);
        }
    };

    const getEmoji = (label: string) => {
        return moodOptions.find(m => m.label === label)?.emoji || '😐';
    };

    return (
        <Card className="p-6 shadow-sm border-[#EADFCC] bg-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-primary text-2xl font-bold">Mood Board</h2>
                    <p className="text-sm text-muted-foreground">How are you feeling today?</p>
                </div>
            </div>

            {/* Greeting */}
            <div className="mb-8 p-6 bg-gradient-to-r from-[#F5EFE6] to-[#EADFCC]/30 rounded-[1.5rem] border border-[#EADFCC] flex justify-between items-center">
                <p className="text-xl text-[#6B4F3A] font-medium">
                    Hey <span className="text-[#5A3A1E] font-bold">{userName}</span>, how have you been today?
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                        if (user) {
                            await moodService.seedFakeHistory(user.uid, userName || 'Student');
                            fetchHistory();
                        }
                    }}
                    className="text-xs text-muted-foreground hover:bg-[#EADFCC]/50"
                >
                    Seed History
                </Button>
            </div>

            {/* Mood Selection */}
            <div className="mb-8">
                <label className="block mb-4 text-sm font-semibold text-[#7A5C3A]">Select Your Mood</label>
                <div className="grid grid-cols-3 gap-4">
                    {moodOptions.map((mood) => (
                        <button
                            key={mood.label}
                            onClick={() => setSelectedMood(mood.label)}
                            className={`flex flex-col items-center p-4 rounded-2xl transition-all border-2 group ${selectedMood === mood.label
                                ? 'bg-primary border-primary scale-105 shadow-md shadow-primary/20'
                                : `${mood.color} border-transparent hover:border-current/20`
                                }`}
                        >
                            <span className={`text-4xl mb-2 transition-transform group-hover:scale-110 ${selectedMood === mood.label ? '' : ''}`}>
                                {mood.emoji}
                            </span>
                            <span className={`text-xs font-bold ${selectedMood === mood.label ? 'text-white' : 'text-[#5A3A1E]'}`}>
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Optional Note */}
            {selectedMood && (
                <div className="mb-6">
                    <label className="block mb-3 text-sm font-semibold text-[#7A5C3A]">
                        Anything you'd like to share? (Optional)
                    </label>
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What made you feel this way today?"
                        className="rounded-2xl min-h-[100px] bg-[#F5EFE6]/30 border-[#EADFCC]"
                    />
                </div>
            )}

            {/* Submit Button */}
            {selectedMood && (
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full rounded-2xl py-6 font-bold text-lg transition-all mb-8 ${submitted
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-primary hover:bg-[#3D2614] text-white shadow-lg'
                        }`}
                >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    {submitted ? 'Update Mood' : 'Save Mood'}
                </Button>
            )}

            {/* Weekly Timeline */}
            <div className="mt-4 pt-8 border-t border-[#F5EFE6]">
                <h3 className="mb-6 flex items-center gap-2 text-[#5A3A1E] font-bold">
                    <Smile className="h-5 w-5 text-primary" />
                    Your Recent Mood History
                </h3>
                {history.length > 0 ? (
                    <div className="flex gap-2 justify-start overflow-x-auto pb-2">
                        {history.map((entry) => (
                            <div
                                key={entry.id}
                                className={`flex flex-col items-center p-3 rounded-2xl border bg-[#F5EFE6] border-[#EADFCC] min-w-[70px] flex-shrink-0`}
                            >
                                <span className="text-2xl mb-1">{getEmoji(entry.mood)}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C3A]">
                                    {entry.timestamp?.toDate ? format(entry.timestamp.toDate(), 'EEE') : '...'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground italic">No mood history yet.</p>
                )}
            </div>
        </Card>
    );
}
