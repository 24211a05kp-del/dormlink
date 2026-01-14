import { db } from "../firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
export interface Guardian {
    name: string;
    relation: string;
    phone: string;
    email: string;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    role: "student" | "faculty";
    hostelId?: string;
    guardians?: Guardian[];
    createdAt: any;
}

export const userService = {
    createUserProfile: async (uid: string, data: Omit<UserProfile, 'uid' | 'createdAt'>) => {
        // REQUIRED: All user profiles are stored in: users/{uid}
        await setDoc(doc(db, "users", uid), {
            ...data,
            uid,
            createdAt: serverTimestamp()
        });
    },

    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const path = `users/${uid}`;
        console.log(`Firestore: Fetching document from ${path}`);
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log(`Firestore: Document found at ${path}`);
                return docSnap.data() as UserProfile;
            }
            console.warn(`Firestore: No document found at ${path}`);
            return null;
        } catch (error: any) {
            console.error(`Firestore Error (getUserProfile) at ${path}:`, {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            throw error;
        }
    },

    updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        await setDoc(doc(db, "users", uid), data, { merge: true });
    },

    addGuardian: async (uid: string, guardian: Guardian) => {
        const profile = await userService.getUserProfile(uid);
        if (!profile) throw new Error("User profile not found");

        const guardians = profile.guardians || [];
        if (guardians.length >= 5) {
            throw new Error("Maximum of 5 guardians allowed");
        }

        await setDoc(doc(db, "users", uid), {
            guardians: [...guardians, guardian]
        }, { merge: true });
    },

    removeGuardian: async (uid: string, guardianIndex: number) => {
        const profile = await userService.getUserProfile(uid);
        if (!profile) return;

        const guardians = [...(profile.guardians || [])];
        guardians.splice(guardianIndex, 1);

        await setDoc(doc(db, "users", uid), {
            guardians: guardians
        }, { merge: true });
    }
};
