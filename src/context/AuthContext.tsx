import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import { authService, AppUser } from "../services/authService";
import { userService } from "../services/userService";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // If we already have a user in state from login/signup call, don't overwrite it with null
                // until we try to fetch the profile.
                try {
                    const profile = await userService.getUserProfile(firebaseUser.uid);
                    if (profile) {
                        setUser({
                            uid: firebaseUser.uid,
                            displayName: firebaseUser.displayName,
                            email: firebaseUser.email,
                            role: profile.role
                        });
                    } else {
                        // If no profile found in Firestore, we check if we are in the middle of a login/signup
                        // that might be creating it. If 'user' is already set, we keep it.
                        setUser(prev => {
                            if (prev && prev.uid === firebaseUser.uid) return prev;
                            return null;
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string, role: "student" | "faculty") => {
        const appUser = await authService.login(email, pass, role);
        setUser(appUser);
        return appUser;
    };

    const signup = async (email: string, pass: string, name: string, role: "student" | "faculty") => {
        const appUser = await authService.signup(email, pass, name, role);
        setUser(appUser);
        return appUser;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
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
