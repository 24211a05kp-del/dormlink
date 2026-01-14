import { auth } from "../firebase/config";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
} from "firebase/auth";
import { userService, UserProfile } from "./userService";

export interface AppUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    role: "student" | "faculty";
}

export const authService = {
    login: async (email: string, pass: string, role: "student" | "faculty"): Promise<AppUser> => {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const profile = await userService.getUserProfile(result.user.uid);

        if (!profile) {
            // Logout if profile is missing to prevent session persistence without profile
            await firebaseSignOut(auth);
            throw new Error("User profile not found. Please contact support or Sign Up.");
        }

        if (profile.role !== role) {
            // Logout if role mismatch to prevent unauthorized access to dashboards
            await firebaseSignOut(auth);
            throw new Error(`Unauthorized: You are registered as ${profile.role}, not ${role}.`);
        }

        return {
            uid: result.user.uid,
            displayName: profile.name || result.user.displayName,
            email: result.user.email,
            role: profile.role
        };
    },

    signup: async (email: string, pass: string, name: string, role: "student" | "faculty"): Promise<AppUser> => {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        if (result.user) {
            await updateProfile(result.user, { displayName: name });
            await userService.createUserProfile(result.user.uid, {
                name,
                email,
                role
            });
        }
        return {
            uid: result.user.uid,
            displayName: name,
            email: result.user.email,
            role
        };
    },

    logout: async () => {
        await firebaseSignOut(auth);
    }
};
