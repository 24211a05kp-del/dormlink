import { db } from "../firebase/config";
import { collection, setDoc, doc, query, where, orderBy, limit, getDocs, Timestamp, serverTimestamp, onSnapshot, getDoc } from "firebase/firestore";

export interface MoodEntry {
    id?: string;
    studentId: string;
    studentName: string;
    mood: string;
    note?: string;
    date: string; // YYYY-MM-DD
    timestamp: any;
    updatedAt: any;
}

export const moodService = {
    // Save or update mood (One per day restriction via ID)
    saveMood: async (studentId: string, studentName: string, mood: string, note?: string) => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const docId = `${studentId}_${today}`;
        const moodRef = doc(db, "student_moods", docId);

        await setDoc(moodRef, {
            studentId,
            studentName,
            mood,
            note: note || "",
            date: today,
            timestamp: serverTimestamp(), // Creation time
            updatedAt: serverTimestamp()  // Update time
        }, { merge: true });
    },

    // Get today's mood for a specific student
    getTodayMood: async (studentId: string) => {
        const today = new Date().toISOString().split('T')[0];
        const docId = `${studentId}_${today}`;
        const docRef = doc(db, "student_moods", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as MoodEntry;
        }
        return null;
    },

    // Get recent history for student
    getRecentMoods: async (studentId: string) => {
        const moodRef = collection(db, "student_moods");
        const q = query(
            moodRef,
            where("studentId", "==", studentId),
            orderBy("date", "desc"), // Order by date string is sufficient for daily granularity
            limit(7)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MoodEntry[];
    },

    // Real-time subscription for Faculty Dashboard (Daily View)
    subscribeToDailyMoods: (dateStr: string, callback: (moods: MoodEntry[]) => void) => {
        const moodRef = collection(db, "student_moods");
        const q = query(
            moodRef,
            where("date", "==", dateStr)
        );

        return onSnapshot(q, (snapshot) => {
            const moods = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as MoodEntry));
            callback(moods);
        });
    },

    // Seed fake history for demonstration
    seedFakeHistory: async (studentId: string, studentName: string) => {
        const moods = ['Great', 'Good', 'Okay', 'Sad', 'Amazing', 'Good', 'Okay'];
        const notes = [
            'Had a wonderful study session!',
            'Food was good today.',
            'Just a regular day.',
            'Missed my family a bit.',
            'Aced the quiz!',
            'Gym was nice.',
            'Sleepy...'
        ];

        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const docId = `${studentId}_${dateStr}`;
            const moodRef = doc(db, "student_moods", docId);

            await setDoc(moodRef, {
                studentId,
                studentName,
                mood: moods[i % moods.length],
                note: notes[i % notes.length],
                date: dateStr,
                timestamp: Timestamp.fromDate(d),
                updatedAt: serverTimestamp()
            }, { merge: true });
        }
    }
};
