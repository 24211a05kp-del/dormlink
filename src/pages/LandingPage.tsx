"use client";

import { motion } from "framer-motion";

interface LandingPageProps {
    onStudentLogin: () => void;
    onFacultyLogin: () => void;
}

export const LandingPage = ({ onStudentLogin, onFacultyLogin }: LandingPageProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-md px-6"
            >
                {/* Logo */}
                <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-[#5A3A1E] flex items-center justify-center shadow-lg">
                    <span className="text-white text-3xl font-bold">D</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-[#5A3A1E] mb-2">
                    Dormlink
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-[#7A5C3A] mb-4">
                    Your daily campus companion
                </p>

                {/* Description */}
                <p className="text-sm text-[#6B4F3A] mb-8 leading-relaxed">
                    Connect with your campus life — manage feedback, track moods,
                    request outings, and stay updated with all campus events in one
                    warm, friendly space.
                </p>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onStudentLogin}
                        className="px-6 py-3 rounded-xl bg-[#5A3A1E] text-white font-medium shadow-md hover:scale-105 transition active:scale-95"
                    >
                        Student Login
                    </button>

                    <button
                        onClick={onFacultyLogin}
                        className="px-6 py-3 rounded-xl border-2 border-[#5A3A1E] text-[#5A3A1E] font-medium hover:bg-[#EADFCC] transition active:scale-95"
                    >
                        Faculty Login
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-8 text-xs text-[#8A6A4F]">
                    Built with care for campus communities
                </p>
            </motion.div>
        </div>
    );
};
