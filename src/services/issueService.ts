import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface IssueData {
    category: string;
    priority: "low" | "medium" | "high";
    hostelBlock: string;
    roomNumber: string;
    description: string;
    studentName: string;
    // We can add userId here later when we pull it from auth context
    userId?: string;
    image?: string; // Storing as base64 string for now, or URL if upload implemented
    status: "pending" | "in-progress" | "resolved";
}

export const issueService = {
    addIssue: async (data: Omit<IssueData, "status">) => {
        try {
            const docRef = await addDoc(collection(db, "issues"), {
                ...data,
                status: "pending",
                createdAt: serverTimestamp(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding document: ", error);
            throw error;
        }
    },
};
