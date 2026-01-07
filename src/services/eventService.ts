import { db } from "../firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

export interface EventData {
    id: string;
    title: string;
    date: string; // Display string for now, could be formatted from timestamp
    time: string;
    location: string;
    category: string;
    attendees: number;
    saved: boolean; // Just a local toggle for now, usually needs user-event mapping
    color: string;
}

export const eventService = {
    getEvents: async (): Promise<EventData[]> => {
        try {
            // optimized to sort by date if needed, but for now just fetching all
            const q = query(collection(db, "events"));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as EventData));
        } catch (error) {
            console.error("Error fetching events: ", error);
            // Fallback to empty list or throw
            return [];
        }
    }
};
