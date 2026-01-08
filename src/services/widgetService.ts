import { db } from "../firebase/config";
import { collection, query, onSnapshot, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";

export interface Thought {
    id?: string;
    text: string;
    author: string;
    createdAt: any;
}

export interface Event {
    id?: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    image?: string; // UI uses both occasionally or image
    category: string;
    color?: string;
    attendees?: number;
    saved?: boolean;
    createdAt: any;
}

export const widgetService = {
    subscribeToLatestThought: (callback: (thought: Thought | null) => void) => {
        const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"), limit(1));
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                callback({ id: doc.id, ...doc.data() } as Thought);
            } else {
                callback(null);
            }
        });
    },

    subscribeToEvents: (callback: (events: Event[]) => void) => {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Event));
            callback(events);
        });
    },

    addThought: async (text: string, author: string) => {
        await addDoc(collection(db, "thoughts"), {
            text,
            author,
            createdAt: serverTimestamp()
        });
    },

    addEvent: async (event: Omit<Event, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, "events"), {
            ...event,
            createdAt: serverTimestamp()
        });
    }
};
