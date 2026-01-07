import { useState, useEffect } from "react";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

type Screen =
    | "landing"
    | "student-auth"
    | "faculty-auth"
    | "student-dashboard"
    | "faculty-dashboard";

function AppContent() {
    const { user, loading, logout } = useAuth();
    const [currentScreen, setCurrentScreen] = useState<Screen>("landing");

    // Sync screen with auth state
    useEffect(() => {
        if (!loading) {
            if (user) {
                setCurrentScreen(user.role === "student" ? "student-dashboard" : "faculty-dashboard");
            } else if (currentScreen.includes("dashboard")) {
                setCurrentScreen("landing");
            }
        }
    }, [user, loading]);

    const handleStudentLogin = () => {
        setCurrentScreen("student-auth");
    };

    const handleFacultyLogin = () => {
        setCurrentScreen("faculty-auth");
    };

    const handleBack = () => {
        setCurrentScreen("landing");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
                <Loader2 className="w-10 h-10 animate-spin text-[#5A3A1E]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <AnimatePresence mode="wait">
                {currentScreen === "landing" && !user && (
                    <motion.div
                        key="landing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <LandingPage
                            onStudentLogin={handleStudentLogin}
                            onFacultyLogin={handleFacultyLogin}
                        />
                    </motion.div>
                )}

                {currentScreen === "student-auth" && !user && (
                    <motion.div
                        key="student-auth"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <AuthPage
                            role="student"
                            onBack={handleBack}
                        />
                    </motion.div>
                )}

                {currentScreen === "faculty-auth" && !user && (
                    <motion.div
                        key="faculty-auth"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <AuthPage
                            role="faculty"
                            onBack={handleBack}
                        />
                    </motion.div>
                )}

                {currentScreen === "student-dashboard" && user?.role === "student" && (
                    <motion.div
                        key="student-dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <StudentDashboard
                            userName={user.displayName || "Student"}
                            onLogout={logout}
                        />
                    </motion.div>
                )}

                {currentScreen === "faculty-dashboard" && user?.role === "faculty" && (
                    <motion.div
                        key="faculty-dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <FacultyDashboard
                            userName={user.displayName || "Faculty"}
                            onLogout={logout}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
