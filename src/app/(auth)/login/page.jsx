"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Redirect to dashboard
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            {/* Left Decoration Section */}
            <div className="hidden lg:flex w-1/2 bg-white relative overflow-hidden items-center justify-center border-r border-slate-100">

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative w-72 h-72 mb-10 group"
                    >
                        {/* Shadow/Glow behind logo */}
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700" />

                        <Image
                            src="/logo.png"
                            alt="JS Mart Logo"
                            fill
                            className="object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                            priority
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">JS Mart</h1>
                        <div className="h-1.5 w-32 bg-indigo-600 mx-auto mb-8 rounded-full shadow-sm" />
                        <p className="text-2xl text-slate-500 font-medium tracking-[0.2em] uppercase">
                            Inventory Management
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-100/50 relative shadow-[inset_0_0_80px_rgba(0,0,0,0.03)] border-l border-slate-200/50">
                <div className="max-w-md w-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-12 text-center lg:text-left">
                            <h2 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h2>
                            <p className="text-slate-500 text-lg">Sign in to manage your empire.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="admin@jsmart.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {isLoading ? (
                                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-slate-500">
                                Need an account?{" "}
                                <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors border-b-2 border-indigo-600/10 hover:border-indigo-600">
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 text-center w-full text-sm font-medium text-slate-400">
                    © {new Date().getFullYear()} JS Mart. All rights reserved.
                </div>
            </div>
        </div>
    );
}
