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

        // Use auth.currentUser.uid as the source of truth for Firestore mapping
        const currentUid = auth.currentUser?.uid;
        console.log("Auth Flow: Authenticated UID:", currentUid);

        if (!currentUid) {
            throw new Error("Authentication failed: User state not available.");
        }

        // Defensive Delay: Sometimes Firestore needs a moment to recognize the new Auth token
        await new Promise(resolve => setTimeout(resolve, 500));

        let profile;
        try {
            // Document ID must exactly match Auth UID
            profile = await userService.getUserProfile(currentUid);
        } catch (error: any) {
            console.error("Auth Flow: Error fetching profile during login:", error.message);
            await firebaseSignOut(auth);
            // Include actual Firestore error for diagnostics
            throw new Error(`Failed to access user data: ${error.message}. Please check your connection.`);
        }

        if (!profile) {
            console.warn(`Auth Flow: Profile document missing at users/${currentUid}`);
            await firebaseSignOut(auth);
            // Requirement from user: "User profile not found"
            throw new Error("User profile not found");
        }

        if (profile.role !== role) {
            console.warn(`Auth Flow: Role mismatch. Found ${profile.role}, expected ${role}`);
            await firebaseSignOut(auth);
            const roleError = role === "student"
                ? "Unauthorized role for student login."
                : "Unauthorized role for faculty login.";
            throw new Error(roleError);
        }

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
