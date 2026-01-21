'use client';

import React from 'react';
import { Bell, Search, User, LogOut, Settings as SettingsIcon } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search for orders, products, customers..."
                        suppressHydrationWarning
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button suppressHydrationWarning className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Admin User</p>
                        <p className="text-[10px] text-slate-500">Super Admin</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300 group-hover:border-emerald-300 transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}



