"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle, X, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const modalStyles = {
    info: {
        icon: <Info className="h-6 w-6" />,
        color: "blue",
        titleGradient: "from-blue-600 to-indigo-600",
        bgLight: "bg-blue-50/50",
        border: "border-blue-100",
        shadow: "shadow-blue-200/50",
        btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    },
    success: {
        icon: <CheckCircle2 className="h-6 w-6" />,
        color: "emerald",
        titleGradient: "from-emerald-600 to-teal-600",
        bgLight: "bg-emerald-50/50",
        border: "border-emerald-100",
        shadow: "shadow-emerald-200/50",
        btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    },
    warning: {
        icon: <AlertTriangle className="h-6 w-6" />,
        color: "amber",
        titleGradient: "from-amber-600 to-orange-600",
        bgLight: "bg-amber-50/50",
        border: "border-amber-100",
        shadow: "shadow-amber-200/50",
        btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    },
    confirm: {
        icon: <HelpCircle className="h-6 w-6" />,
        color: "indigo",
        titleGradient: "from-indigo-600 to-violet-600",
        bgLight: "bg-indigo-50/50",
        border: "border-indigo-100",
        shadow: "shadow-indigo-200/50",
        btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200",
    },
    danger: {
        icon: <XCircle className="h-6 w-6" />,
        color: "rose",
        titleGradient: "from-rose-600 to-pink-600",
        bgLight: "bg-rose-50/50",
        border: "border-rose-100",
        shadow: "shadow-rose-200/50",
        btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
    error: {
        icon: <XCircle className="h-6 w-6" />,
        color: "rose",
        titleGradient: "from-rose-600 to-pink-600",
        bgLight: "bg-rose-50/50",
        border: "border-rose-100",
        shadow: "shadow-rose-200/50",
        btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
    },
};

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "confirm",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    loading = false,
}) {
    const style = modalStyles[type] || modalStyles.confirm;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="admin-modal-scroll z-[9999]" data-lock-body-scroll role="dialog" aria-modal="true">
                    <div className="admin-modal-center">
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        disabled={loading}
                        className="admin-modal-backdrop"
                        aria-label="Close dialog"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className={cn(
                            "admin-modal-panel-host relative w-full max-w-lg overflow-hidden rounded-2xl bg-white text-left shadow-2xl border border-white/50 sm:rounded-[2.5rem]",
                            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/80 before:to-white/20 before:pointer-events-none"
                        )}
                    >
                        {/* Status Icon Decoration */}
                        <div className={cn(
                            "absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none",
                            `bg-${style.color}-500`
                        )} />

                        <div className="relative p-8 sm:p-10">
                            <div className="absolute right-6 top-6">
                                <button
                                    type="button"
                                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95 disabled:opacity-50"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center sm:items-start gap-6">
                                <div className={cn(
                                    "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg transform rotate-3 active:rotate-0 transition-transform",
                                    style.bgLight,
                                    `text-${style.color}-600`,
                                    style.border,
                                    "border"
                                )}>
                                    {style.icon}
                                </div>
                                <div className="text-center sm:text-left space-y-3">
                                    <h3 className={cn(
                                        "text-2xl font-black leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r",
                                        style.titleGradient
                                    )}>
                                        {title}
                                    </h3>
                                    <p className="text-base text-slate-500 font-medium leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="relative bg-slate-50/80 px-8 py-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100/50 backdrop-blur-sm">
                            {cancelLabel && (
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 sm:w-auto transition-all active:scale-95 disabled:opacity-50"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    {cancelLabel}
                                </button>
                            )}
                            <button
                                type="button"
                                className={cn(
                                    "inline-flex w-full justify-center rounded-2xl px-6 py-3 text-sm font-black text-white shadow-xl sm:w-auto transition-all items-center gap-2 active:scale-95 group",
                                    style.btn,
                                    loading && "opacity-70 cursor-not-allowed"
                                )}
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <div className="w-5 h-5 group-hover:translate-x-0.5 transition-transform">
                                        {style.icon}
                                    </div>
                                )}
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
