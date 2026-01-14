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
        console.log(`Auth Flow: Attempting login for ${email} as ${role}`);
        const result = await signInWithEmailAndPassword(auth, email, pass);
        const currentUid = result.user.uid;

        // Fetch profile with selective retries to handle propagation
        let profile: UserProfile | null = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            try {
                profile = await userService.getUserProfile(currentUid);
                if (profile) break;
            } catch (err) {
                console.warn(`Auth Flow: Fetch attempt ${attempts + 1} failed:`, err);
            }
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`Auth Flow: Retrying profile fetch (${attempts}/${maxAttempts})...`);
                await new Promise(r => setTimeout(r, 500 * attempts));
            }
        }

        if (!profile) {
            console.error(`Auth Flow: No profile found for UID ${currentUid} after ${maxAttempts} attempts`);
            await firebaseSignOut(auth);
            throw new Error("Unable to find your user profile. Please contact support or try signing up again.");
        }

        if (profile.role !== role) {
            console.warn(`Auth Flow: Role mismatch. Found '${profile.role}', expected '${role}'`);
            await firebaseSignOut(auth);
            throw new Error(`Access Denied: You are registered as a ${profile.role}, not a ${role}.`);
        }

        console.log("Auth Flow: Login successful, role verified.");
        return {
            uid: currentUid,
            displayName: profile.name || result.user.displayName,
            email: result.user.email,
            role: profile.role
        };
    },

    signup: async (email: string, pass: string, name: string, role: "student" | "faculty"): Promise<AppUser> => {
        console.log(`Auth Flow: Starting signup for ${email} as ${role}`);
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        if (result.user) {
            console.log("Auth Flow: Auth account created, UID:", result.user.uid);
            await updateProfile(result.user, { displayName: name });

            try {
                console.log(`Auth Flow: Creating Firestore profile at users/${result.user.uid}`);
                await userService.createUserProfile(result.user.uid, {
                    name,
                    email,
                    role
                });
                console.log("Auth Flow: Firestore profile created successfully");
            } catch (error: any) {
                console.error("Auth Flow: Failed to create Firestore profile:", error.message);
                throw new Error(`Signup succeeded but profile creation failed: ${error.message}`);
            }
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
