import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from '../firebase/config';
import { authService, AppUser } from "../services/authService";
import { userService, UserProfile } from "../services/userService";

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    login: typeof authService.login;
    signup: typeof authService.signup;
    logout: typeof authService.logout;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [manualLoading, setManualLoading] = useState(false);

    const loading = authLoading || manualLoading;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            console.log("AuthContext: Auth state change detected. UID:", firebaseUser?.uid || "None");

            // If we have a user but no profile yet, keep loading
            if (firebaseUser) {
                setAuthLoading(true);
                try {
                    const profilePromise = userService.getUserProfile(firebaseUser.uid);
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Profile timeout")), 5000)
                    );

                    const profile = await Promise.race([profilePromise, timeoutPromise]) as UserProfile | null;

                    if (profile) {
                        setUser({
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName,
                            email: firebaseUser.email,
                            role: profile.role
                        });
                    }
                } catch (error: any) {
                    console.error("AuthContext: Profile fetch failure:", error.message);
                } finally {
                    setAuthLoading(false);
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string, role: "student" | "faculty") => {
        setManualLoading(true);
        try {
            const appUser = await authService.login(email, pass, role);
            setUser(appUser);
            return appUser;
        } finally {
            setManualLoading(false);
        }
    };

    const signup = async (email: string, pass: string, name: string, role: "student" | "faculty") => {
        setManualLoading(true);
        try {
            const appUser = await authService.signup(email, pass, name, role);
            setUser(appUser);
            return appUser;
        } finally {
            setManualLoading(false);
        }
    };

    const logout = async () => {
        setManualLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setManualLoading(false);
        }
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
