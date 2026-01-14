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

        // Ensure auth state is ready
        if (!auth.currentUser) {
            throw new Error("Authentication failed: User state not available. Please try again.");
        }

        let profile;
        try {
            profile = await userService.getUserProfile(result.user.uid);
        } catch (error) {
            await firebaseSignOut(auth);
            throw new Error("Failed to access user data. Please check your connection and try again.");
        }

        if (!profile) {
            await firebaseSignOut(auth);
            throw new Error("User profile not found. Please sign up again.");
        }

        if (profile.role !== role) {
            await firebaseSignOut(auth);
            const roleError = role === "student"
                ? "Unauthorized role for student login."
                : "Unauthorized role for faculty login.";
            throw new Error(roleError);
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
