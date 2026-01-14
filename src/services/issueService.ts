import { db } from "../firebase/config";
import { collection, addDoc, query, onSnapshot, updateDoc, doc, serverTimestamp, orderBy, where } from "firebase/firestore";

export interface Issue {
    id: string;
    studentId: string; // Changed from uid
    studentName: string;
    hostelBlock: string;
    roomNumber: string;
    issueCategory: string; // Changed from category
    description: string;
    priority: 'low' | 'medium' | 'high';
    imageUrl?: string; // Changed from image
    status: 'open' | 'in_progress' | 'resolved'; // Changed to match "OPEN", "IN_PROGRESS", "RESOLVED" if needed, but requirements said "Open", "In Progress", "Resolved" in one place and "open" in another. I will stick to "open" as initial status requirement, but let's look at the requirement "Open / In Progress / Resolved" for display. I'll use lowercase for DB storage "open", "in_progress", "resolved" for consistency, or human readable if preferred. The prompt says: 'status = "open"' on save. And 'Status (Open / In Progress / Resolved)' for display.
    createdAt: any;
    adminRemarks?: string;
    statusUpdatedBy?: string;
    statusUpdatedAt?: any;
    isActive?: boolean;
    resolvedAt?: any;
}

export const issueService = {
    addIssue: async (data: Omit<Issue, 'id' | 'status' | 'createdAt'>) => {
        const docRef = await addDoc(collection(db, "reported_issues"), {
            ...data,
            status: 'open',
            createdAt: serverTimestamp(),
            isActive: true
        });
        return docRef.id;
    },

    subscribeToIssues: (callback: (issues: Issue[]) => void) => {
        const q = query(
            collection(db, "reported_issues"),
            where("isActive", "==", true),
            orderBy("createdAt", "desc")
        );
        return onSnapshot(q, (snapshot) => {
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Issue));
            callback(issues);
        });
    },

    updateStatus: async (id: string, status: Issue['status'], facultyId: string) => {
        const updates: any = {
            status,
            statusUpdatedBy: facultyId,
            statusUpdatedAt: serverTimestamp()
        };

        if (status === 'resolved') {
            updates.isActive = false;
            updates.resolvedAt = serverTimestamp();
        }

        await updateDoc(doc(db, "reported_issues", id), updates);
    },

    addRemark: async (id: string, adminRemarks: string) => {
        await updateDoc(doc(db, "reported_issues", id), { adminRemarks });
    }
};
