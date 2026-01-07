import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Heart, Smile } from 'lucide-react';

const moodOptions = [
    { emoji: '😫', label: 'Terrible', color: 'bg-red-50 hover:bg-red-100 border-red-100' },
    { emoji: '😔', label: 'Sad', color: 'bg-orange-50 hover:bg-orange-100 border-orange-100' },
    { emoji: '😐', label: 'Okay', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-100' },
    { emoji: '🙂', label: 'Good', color: 'bg-lime-50 hover:bg-lime-100 border-lime-100' },
    { emoji: '😄', label: 'Great', color: 'bg-green-50 hover:bg-green-100 border-green-100' },
    { emoji: '🤩', label: 'Amazing', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100' }
];

const weeklyMoods = [
    { day: 'Mon', mood: '😊', color: 'bg-green-50 border-green-100' },
    { day: 'Tue', mood: '😐', color: 'bg-yellow-50 border-yellow-100' },
    { day: 'Wed', mood: '😄', color: 'bg-green-50 border-green-100' },
    { day: 'Thu', mood: '🙂', color: 'bg-lime-50 border-lime-100' },
    { day: 'Fri', mood: '😫', color: 'bg-red-50 border-red-100' },
    { day: 'Sat', mood: '🤩', color: 'bg-emerald-50 border-emerald-100' },
    { day: 'Today', mood: '?', color: 'bg-[#F5EFE6] border-[#EADFCC]' }
];

interface MoodBoardProps {
    userName: string;
}

export function MoodBoard({ userName }: MoodBoardProps) {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSelectedMood(null);
            setNote('');
        }, 3000);
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
            <div className="mb-8 p-6 bg-gradient-to-r from-[#F5EFE6] to-[#EADFCC]/30 rounded-[1.5rem] border border-[#EADFCC]">
                <p className="text-xl text-[#6B4F3A] font-medium">
                    Hey <span className="text-[#5A3A1E] font-bold">{userName}</span>, how have you been today?
                </p>
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
                    disabled={submitted}
                    className={`w-full rounded-2xl py-6 font-bold text-lg transition-all mb-8 ${submitted
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : 'bg-primary hover:bg-[#3D2614] text-white shadow-lg'
                        }`}
                >
                    {submitted ? 'Recorded! Take care ❤️' : 'Save Mood'}
                </Button>
            )}

            {/* Weekly Timeline */}
            <div className="mt-4 pt-8 border-t border-[#F5EFE6]">
                <h3 className="mb-6 flex items-center gap-2 text-[#5A3A1E] font-bold">
                    <Smile className="h-5 w-5 text-primary" />
                    Your Week at a Glance
                </h3>
                <div className="flex gap-2 justify-between overflow-x-auto pb-2">
                    {weeklyMoods.map((day, index) => (
                        <div
                            key={index}
                            className={`flex flex-col items-center p-3 rounded-2xl border ${day.color} min-w-[60px] flex-shrink-0`}
                        >
                            <span className="text-2xl mb-1">{day.mood}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A5C3A]">{day.day}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
