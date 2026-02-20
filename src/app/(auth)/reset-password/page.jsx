"use client";

import React, { useState, useEffect } from "react";
import { Lock, Mail, KeyRound, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { authService } from "@/lib/api";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const q = searchParams.get("email");
        if (q) setEmail(decodeURIComponent(q));
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setIsLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Failed to reset password. Check OTP and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full flex bg-white font-sans">
                <div className="w-full flex items-center justify-center p-8 bg-slate-100/50">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Password reset</h1>
                        <p className="text-slate-600 mb-6">You can now sign in with your new password.</p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors"
                        >
                            Sign in <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            <div className="hidden lg:flex w-1/2 bg-white relative overflow-hidden items-center justify-center border-r border-slate-100">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white" />
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <div className="relative w-72 h-72 mb-10">
                        <Image
                            src="/logo.png"
                            alt="JS Mart"
                            fill
                            className="object-contain"
                            priority
                            sizes="288px"
                        />
                    </div>
                    <h1 className="text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">JS Mart</h1>
                    <div className="h-1.5 w-32 bg-indigo-600 mx-auto mb-8 rounded-full" />
                    <p className="text-2xl text-slate-500 font-medium tracking-[0.2em] uppercase">Inventory Management</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-100/50">
                <div className="max-w-md w-full">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset password</h2>
                        <p className="text-slate-500">Enter the OTP from your email and choose a new password.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-semibold mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                                    placeholder="admin@jsmart.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">OTP</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-mono tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">New password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Confirm password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Reset password <ArrowRight className="h-5 w-5" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500">
                        <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Back to login</Link>
                        {" · "}
                        <Link href="/forgot-password" className="font-bold text-indigo-600 hover:text-indigo-700">Resend OTP</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
