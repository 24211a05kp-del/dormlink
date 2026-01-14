import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    query,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy,
    where
} from "firebase/firestore";

export interface LostItem {
    id?: string;
    uid: string;
    studentName: string; // The person reporting/contact person
    blockName: string;
    yearOfStudy: string;
    collegeEmail?: string;
    title: string;
    description: string;
    location: string;
    date: string;
    category: string;
    image?: string;
    status: 'lost' | 'found' | 'claimed';
    createdAt: any;
}

export interface FoundItem {
    id?: string;
    uid: string;
    studentName: string; // The person reporting/contact person
    blockName: string;
    yearOfStudy: string;
    collegeEmail?: string;
    title: string;
    description: string;
    location: string;
    date: string;
    category: string;
    image?: string;
    status: 'lost' | 'found' | 'claimed';
    createdAt: any;
}

export const lostFoundService = {
    reportLost: async (data: Omit<LostItem, 'id' | 'status' | 'createdAt'>) => {
        const docRef = await addDoc(collection(db, "lost_items"), {
            ...data,
            status: 'lost',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    reportFound: async (data: Omit<FoundItem, 'id' | 'status' | 'createdAt'>) => {
        const docRef = await addDoc(collection(db, "found_items"), {
            ...data,
            status: 'found',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    },

    subscribeToLostItems: (callback: (items: LostItem[]) => void) => {
        const q = query(collection(db, "lost_items"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LostItem));
            callback(items);
        });
    },

    subscribeToFoundItems: (callback: (items: FoundItem[]) => void) => {
        const q = query(collection(db, "found_items"), orderBy("createdAt", "desc"));
        return onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as FoundItem));
            callback(items);
        });
    },

    updateLostItemStatus: async (id: string, status: LostItem['status']) => {
        await updateDoc(doc(db, "lost_items", id), { status });
    },

    updateFoundItemStatus: async (id: string, status: FoundItem['status']) => {
        await updateDoc(doc(db, "found_items", id), { status });
    }
};
