import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Utensils } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';

const emojiOptions = [
    { emoji: '😢', label: 'Poor', value: 1 },
    { emoji: '😕', label: 'Below Avg', value: 2 },
    { emoji: '😐', label: 'Average', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😄', label: 'Excellent', value: 5 }
];

const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export function FeedbackModule() {
    const [selectedMeal, setSelectedMeal] = useState('Lunch');
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedRating) return;

        setLoading(true);
        try {
            await feedbackService.submitFeedback({
                meal: selectedMeal,
                rating: selectedRating,
            });
            setSubmitted(true);
            setSelectedRating(null); // Reset rating after submit
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error("Failed to submit feedback", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 shadow-sm border-border bg-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <Utensils className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-primary text-xl font-bold">Meal Feedback</h2>
                    <p className="text-sm text-muted-foreground">Help us improve the menu</p>
                </div>
            </div>

            {/* Meal Selection */}
            <div className="mb-6">
                <label className="block mb-3 text-sm font-semibold text-secondary">Which meal did you have?</label>
                <div className="flex gap-2 flex-wrap">
                    {meals.map((meal) => (
                        <Button
                            key={meal}
                            variant={selectedMeal === meal ? 'default' : 'outline'}
                            onClick={() => setSelectedMeal(meal)}
                            className={`rounded-xl py-1 text-sm ${selectedMeal === meal
                                ? 'bg-primary text-white border-primary'
                                : 'border-border hover:bg-muted text-secondary'
                                }`}
                        >
                            {meal}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Emoji Rating */}
            <div className="mb-6">
                <label className="block mb-4 text-sm font-semibold text-secondary">How was the taste and quality?</label>
                <div className="grid grid-cols-5 gap-2">
                    {emojiOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedRating(option.value)}
                            className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${selectedRating === option.value
                                ? 'bg-primary/10 border-primary scale-105 shadow-sm'
                                : 'bg-[#F5EFE6]/50 border-transparent hover:bg-[#F5EFE6] text-secondary'
                                }`}
                        >
                            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{option.emoji}</span>
                            <span className="text-[10px] sm:text-xs font-medium text-center">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit & Clear Buttons */}
            <div className="flex gap-3">
                <Button
                    onClick={() => setSelectedRating(null)}
                    variant="outline"
                    disabled={!selectedRating}
                    className="flex-1 rounded-xl py-6 border-border hover:bg-muted text-secondary font-semibold"
                >
                    Clear
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={!selectedRating || submitted}
                    className={`flex-[2] rounded-xl py-6 font-bold transition-all ${submitted
                        ? 'bg-green-600 hover:bg-green-600 text-white cursor-default'
                        : 'bg-primary hover:bg-[#3D2614] text-white shadow-md'
                        }`}
                >
                    {submitted ? 'Feedback Submitted! ✓' : 'Submit Feedback'}
                </Button>
            </div>
        </Card>
    );
}
