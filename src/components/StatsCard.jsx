import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';



export function StatsCard({ title, value, change, type, className }) {
    return (
        <div className={cn("p-6 bg-white rounded-2xl border border-slate-200 shadow-sm", className)}>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className="mt-2 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                <div className={cn(
                    "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                    type === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                    {type === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {change}
                </div>
            </div>
        </div>
    );
}



