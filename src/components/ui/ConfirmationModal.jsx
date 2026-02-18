"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const modalStyles = {
    info: {
        icon: <Info className="h-6 w-6 text-blue-600" />,
        bg: "bg-blue-50",
        btn: "bg-blue-600 hover:bg-blue-700",
        border: "border-blue-100",
    },
    success: {
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
        bg: "bg-emerald-50",
        btn: "bg-emerald-600 hover:bg-emerald-700",
        border: "border-emerald-100",
    },
    warning: {
        icon: <AlertCircle className="h-6 w-6 text-amber-600" />,
        bg: "bg-amber-50",
        btn: "bg-amber-600 hover:bg-amber-700",
        border: "border-amber-100",
    },
    confirm: {
        icon: <AlertCircle className="h-6 w-6 text-indigo-600" />,
        bg: "bg-indigo-50",
        btn: "bg-indigo-600 hover:bg-indigo-700",
        border: "border-indigo-100",
    },
    error: {
        icon: <XCircle className="h-6 w-6 text-rose-600" />,
        bg: "bg-rose-50",
        btn: "bg-rose-600 hover:bg-rose-700",
        border: "border-rose-100",
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
    if (!isOpen) return null;

    const style = modalStyles[type];

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-max-w-lg border border-slate-100 animate-in fade-in zoom-in duration-200" style={{ maxWidth: '32rem' }}>
                    <div className="absolute right-4 top-4">
                        <button
                            type="button"
                            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="bg-white px-6 pb-6 pt-8">
                        <div className="sm:flex sm:items-start">
                            <div className={cn(
                                "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl sm:mx-0 sm:h-10 sm:w-10",
                                style.bg
                            )}>
                                {style.icon}
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-xl font-bold leading-6 text-slate-900">
                                    {title}
                                </h3>
                                <div className="mt-3">
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:w-auto transition-all"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md sm:w-auto transition-all items-center gap-2",
                                style.btn,
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading && (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
