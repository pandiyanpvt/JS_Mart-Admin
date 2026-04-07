import React from 'react';
import { cn } from '@/lib/utils';

export function StatusToggle({
    checked,
    onChange,
    disabled = false,
    onLabel = 'Active',
    offLabel = 'Inactive',
    className,
}) {
    const label = checked ? onLabel : offLabel;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-bold transition-colors",
                checked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600",
                disabled && "opacity-60 cursor-not-allowed",
                className
            )}
        >
            <span
                className={cn(
                    "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
                    checked ? "bg-emerald-600" : "bg-slate-300"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform",
                        checked ? "translate-x-3.5" : "translate-x-0.5"
                    )}
                />
            </span>
            <span>{label}</span>
        </button>
    );
}

