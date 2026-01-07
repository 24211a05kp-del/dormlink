import { auth } from "../firebase/config";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    User as FirebaseUser
} from "firebase/auth";

export interface AppUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    role: "student" | "faculty";
}

// Helper to map Firebase User to local user shape
// Note: We're storing role in localStorage for now as a simple solution. 
// Ideally this would come from Firestore user document.
const mapUser = (user: FirebaseUser, role: "student" | "faculty"): AppUser => ({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    role
});

export const authService = {
    login: async (email: string, pass: string, role: "student" | "faculty") => {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        // Persist role preference
        localStorage.setItem("userRole", role);
        return mapUser(result.user, role);
    },

    signup: async (email: string, pass: string, name: string, role: "student" | "faculty") => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        if (result.user) {
            await updateProfile(result.user, { displayName: name });
            localStorage.setItem("userRole", role);
        }
        return mapUser(result.user, role);
    },

    logout: async () => {
        await firebaseSignOut(auth);
        localStorage.removeItem("userRole");
    },

    getCurrentRole: (): "student" | "faculty" => {
        return (localStorage.getItem("userRole") as "student" | "faculty") || "student";
    }
};
