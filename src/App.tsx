import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { FacultyDashboard } from "./pages/FacultyDashboard";
import { GuardianApprovalPage } from "./pages/GuardianApprovalPage";

import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function AnimatedRoutes() {
    const { user, loading, logout } = useAuth();
    const location = useLocation();

    console.log("App Route Log:", {
        path: location.pathname,
        userUid: user?.uid,
        userRole: user?.role,
        loading
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
                <Loader2 className="w-10 h-10 animate-spin text-[#5A3A1E]" />
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={
                !user ? <LandingPage /> : <Navigate to={user.role === 'student' ? '/student-dashboard' : '/faculty-dashboard'} replace />
            } />

            <Route path="/auth/student" element={
                !user ? <AuthPage role="student" /> : <Navigate to="/student-dashboard" replace />
            } />

            <Route path="/auth/faculty" element={
                !user ? <AuthPage role="faculty" /> : <Navigate to="/faculty-dashboard" replace />
            } />

            {/* Public Access Route for Guardians */}
            <Route path="/guardian/approve/:token" element={<GuardianApprovalPage />} />

            {/* Protected Routes */}
            <Route path="/student-dashboard" element={
                user?.role === "student" ? (
                    <StudentDashboard userName={user.displayName || "Student"} onLogout={logout} />
                ) : (
                    <Navigate to={user?.role === "faculty" ? "/faculty-dashboard" : "/"} replace />
                )
            } />

            <Route path="/faculty-dashboard" element={
                user?.role === "faculty" ? (
                    <FacultyDashboard userName={user.displayName || "Faculty"} onLogout={logout} />
                ) : (
                    <Navigate to={user?.role === "student" ? "/student-dashboard" : "/"} replace />
                )
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen">
                    <AnimatedRoutes />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
