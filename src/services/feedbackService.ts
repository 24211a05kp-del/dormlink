import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface FeedbackData {
    meal: string;
    rating: number;
    comment?: string;
    studentName?: string; // Optional if anonymous
}

export const feedbackService = {
    submitFeedback: async (data: FeedbackData) => {
        try {
            await addDoc(collection(db, "feedbacks"), {
                ...data,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error submitting feedback: ", error);
            throw error;
        }
    },
};
