

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
    role: "student" | "faculty";
}

export const AuthPage = ({ role }: AuthPageProps) => {
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Validation
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                setIsLoading(false);
                return;
            }

            if (!isLogin) {
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setIsLoading(false);
                    return;
                }
                if (!email || !name) {
                    setError("Please fill in all fields");
                    setIsLoading(false);
                    return;
                }

                const appUser = await signup(email, password, name, role);
                navigate(appUser.role === 'student' ? '/student-dashboard' : '/faculty-dashboard');
            } else {
                if (!email) {
                    setError("Please enter your email");
                    setIsLoading(false);
                    return;
                }
                const appUser = await login(email, password, role);
                navigate(appUser.role === 'student' ? '/student-dashboard' : '/faculty-dashboard');
            }
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Incorrect email or password. If you haven't created an account yet, please Sign Up below.");
            } else {
                setError(err.message || "Authentication failed. Please check your credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const idLabel = role === "student" ? "Student ID" : "Faculty ID";
    const emailLabel = role === "student" ? "Student Email" : "Faculty Email";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6] px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-xl my-10"
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-[#7A5C3A] hover:text-[#5A3A1E] mb-6 transition-colors group self-start"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#5A3A1E] mb-2 capitalize">
                        {role} {isLogin ? "Login" : "Sign Up"}
                    </h2>
                    <p className="text-[#7A5C3A]">
                        {isLogin
                            ? "Welcome back! Please enter your details."
                            : "Create your account to get started."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field - Only for Signup */}
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4"
                        >
                            <label className="block text-sm font-medium text-[#6B4F3A] mb-2 px-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border-2 border-[#EADFCC] focus:border-[#5A3A1E] outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </motion.div>
                    )}

                    {/* Email Field - Always Visible */}
                    <div>
                        <label className="block text-sm font-medium text-[#6B4F3A] mb-2 px-1">
                            {isLogin ? "Email Address" : emailLabel}
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border-2 border-[#EADFCC] focus:border-[#5A3A1E] outline-none transition-all"
                            placeholder="your.email@college.edu"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#6B4F3A] mb-2 px-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-xl border-2 border-[#EADFCC] focus:border-[#5A3A1E] outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="block text-sm font-medium text-[#6B4F3A] mb-2 px-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border-2 border-[#EADFCC] focus:border-[#5A3A1E] outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </motion.div>
                    )}

                    {error && (
                        <p className="text-red-500 text-sm px-1 bg-red-50 py-2 rounded-lg text-center">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl bg-[#5A3A1E] text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isLogin ? "Logging in..." : "Signing up..."}
                            </>
                        ) : (
                            isLogin ? "Login" : "Sign Up"
                        )}
                    </button>

                    <div className="text-center text-sm text-[#7A5C3A] mt-4">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                // Reset form partially but typically users might want to keep some info. 
                                // Let's simplify and not clear inputs to allow switching back and forth easily 
                                // if they clicked by mistake, but password maybe should clear.
                            }}
                            className="font-bold text-[#5A3A1E] hover:underline focus:outline-none"
                        >
                            {isLogin ? "Sign up" : "Login"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
