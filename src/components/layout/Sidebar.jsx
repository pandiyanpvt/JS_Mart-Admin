'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, X, LogOut } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { cn } from '@/lib/utils';

import Image from 'next/image';
import { authService, stockLogService, productService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export function Sidebar() {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    const toggleExpand = (title) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    const router = useRouter();

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    // Fetch counts for badges
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch pending approvals count
                const pendingApprovals = await stockLogService.getPending();
                setPendingApprovalsCount(pendingApprovals.length);

                // Fetch low stock count
                const allProducts = await productService.getAll();
                const lowStockProducts = allProducts.filter(p => p.quantity < 10);
                setLowStockCount(lowStockProducts.length);
            } catch (error) {
                console.error('Failed to fetch counts:', error);
            }
        };

        fetchCounts();
        // Refresh counts every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);


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
                    "fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 transition-all duration-300 z-40 border-r border-slate-800 flex flex-col",
                    !isOpen && "items-center"
                )}
            >
                <div className="p-4 flex items-center gap-3 shrink-0">
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

                <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar">
                    {navigationItems.map((item) => {
                        let filteredItems = item.items;
                        const user = authService.getCurrentUser();
                        const userRole = user?.role; // Requires re-login to get updated role

                        if (item.title === 'User Management') {
                            filteredItems = item.items.filter(subItem => {
                                if (subItem.title === 'Admin Users') {
                                    return userRole !== 'MANAGER';
                                }
                                if (subItem.title === 'Roles & Permissions') {
                                    return userRole === 'DEVELOPER';
                                }
                                return true;
                            });
                        }

                        // If all children are filtered out, optionally hide the parent. 
                        // For now, we'll keep the parent but with empty/reduced list.

                        const hasSubItems = filteredItems && filteredItems.length > 0;
                        const isExpanded = expandedItems.includes(item.title);
                        const isActive = pathname === item.href ||
                            (filteredItems?.some(sub => sub.href === pathname));

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
                                                    {filteredItems?.map((subItem) => (
                                                        <Link
                                                            key={subItem.href}
                                                            href={subItem.href}
                                                            className={cn(
                                                                "block py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-between",
                                                                pathname === subItem.href
                                                                    ? "text-emerald-400"
                                                                    : "text-slate-400 hover:text-white"
                                                            )}
                                                        >
                                                            <span>{subItem.title}</span>
                                                            {/* Show badge for Removal Approvals */}
                                                            {subItem.title === 'Removal Approvals' && pendingApprovalsCount > 0 && (
                                                                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] text-center">
                                                                    {pendingApprovalsCount}
                                                                </span>
                                                            )}
                                                            {/* Show badge for Low Stock */}
                                                            {subItem.title === 'Low Stock' && lowStockCount > 0 && (
                                                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full min-w-[18px] text-center">
                                                                    {lowStockCount}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    // If strictly no subitems originally, OR filtered out all subitems but we want to fail gracefully (though navigation structure implies User Management always has items)
                                    // This block handles the case where item.items was undefined originally.
                                    // Logic for creating Link if no subitems:
                                    (!item.items || item.items.length === 0) && (
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
                                    )
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-slate-800 w-full shrink-0">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group w-full hover:bg-red-500/10 hover:text-red-400 text-slate-400"
                        )}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {isOpen && (
                            <span className="text-sm font-medium">Logout</span>
                        )}
                    </button>
                </div>


            </motion.aside>
        </>
    );
}



