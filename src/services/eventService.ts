import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    query,
    onSnapshot,
    orderBy,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc
} from "firebase/firestore";

export interface CampusEvent {
    id?: string;
    title: string;
    description: string;
    clubOrDepartment: string;
    registrationDeadline: string;
    date: string; // Event date
    location: string;
    imageUrl?: string;
    image?: string;
    organizerId: string;
    organizerName: string;
    createdAt: any;
}

export const eventService = {
    createEvent: async (event: Omit<CampusEvent, 'id' | 'createdAt'>) => {
        const docRef = await addDoc(collection(db, "campus_events"), {
            ...event,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    subscribeToEvents: (callback: (events: CampusEvent[]) => void) => {
        const q = query(collection(db, "campus_events"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CampusEvent));
            callback(events);
        });
    },

    deleteEvent: async (id: string) => {
        await deleteDoc(doc(db, "campus_events", id));
    },

    updateEvent: async (id: string, data: Partial<CampusEvent>) => {
        await updateDoc(doc(db, "campus_events", id), data);
    }
};
