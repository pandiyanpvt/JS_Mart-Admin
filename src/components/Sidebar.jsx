'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { cn } from '@/lib/utils';

import Image from 'next/image';

export function Sidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState([]);
    const [isOpen, setIsOpen] = useState(true);

    const toggleExpand = (title) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
                suppressHydrationWarning
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 280 : 80 }}
                suppressHydrationWarning
                className={cn(
                    "fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 transition-all duration-300 z-40 overflow-y-auto overflow-x-hidden border-r border-slate-800",
                    !isOpen && "items-center"
                )}
            >
                <div className="p-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0">
                        <Image
                            src="/logo.png"
                            alt="JS Mart Logo"
                            fill
                            sizes="48px"
                            className="object-contain"
                        />
                    </div>
                    {isOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold text-white whitespace-nowrap"
                        >
                            JS Mart <span className="text-emerald-500 font-normal">Admin</span>
                        </motion.span>
                    )}
                </div>

                <nav className="px-3 py-4 space-y-1">
                    {navigationItems.map((item) => {
                        const hasSubItems = item.items && item.items.length > 0;
                        const isExpanded = expandedItems.includes(item.title);
                        const isActive = pathname === item.href ||
                            (item.items?.some(sub => sub.href === pathname));

                        return (
                            <div key={item.title}>
                                {hasSubItems ? (
                                    <div>
                                        <button
                                            onClick={() => toggleExpand(item.title)}
                                            suppressHydrationWarning
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                                                isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            <item.icon size={20} className={cn("shrink-0", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                                            {isOpen && (
                                                <>
                                                    <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="pl-10 pr-3 mt-1 space-y-1 overflow-hidden"
                                                >
                                                    {item.items?.map((subItem) => (
                                                        <Link
                                                            key={subItem.href}
                                                            href={subItem.href}
                                                            className={cn(
                                                                "block py-1.5 text-xs font-medium rounded-md transition-colors",
                                                                pathname === subItem.href
                                                                    ? "text-emerald-400"
                                                                    : "text-slate-400 hover:text-white"
                                                            )}
                                                        >
                                                            {subItem.title}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href || '#'}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                                            isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <item.icon size={20} className={cn("shrink-0", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                                        {isOpen && (
                                            <span className="text-sm font-medium">{item.title}</span>
                                        )}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>


            </motion.aside>
        </>
    );
}



