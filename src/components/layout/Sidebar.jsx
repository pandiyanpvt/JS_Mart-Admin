'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { authService, stockLogService, productService } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

export function Sidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState([]);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    const { logout } = useAuth();

    const toggleExpand = (title) => {
        setExpandedItems((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
        );
    };

    // Fetch counts for badges
    useEffect(() => {
        const fetchCounts = async () => {
            const user = authService.getCurrentUser();
            if (!user || user.role === 'DELIVERY_AGENT') return;

            try {
                // Fetch pending approvals count
                const pendingApprovals = await stockLogService.getPending();
                setPendingApprovalsCount(pendingApprovals?.length || 0);

                // Fetch low stock count
                const allProducts = await productService.getAll();
                const lowStockProducts = (allProducts || []).filter(p => p.quantity < 10);
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
            <aside
                id="admin-sidebar"
                suppressHydrationWarning
                className={cn(
                    'fixed left-0 top-0 z-[40] flex h-[100dvh] w-[var(--admin-sidebar-drawer-width)] shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-300 ease-out lg:w-[var(--admin-sidebar-width,280px)]',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                <div className="flex shrink-0 items-center gap-3 p-4 pr-3 2xl:gap-4 2xl:p-5 min-[1920px]:p-6">
                    <div className="relative h-12 w-12 shrink-0 2xl:h-14 2xl:w-14 min-[1920px]:h-16 min-[1920px]:w-16">
                        <Image
                            src="/logo.png"
                            alt="JS Mart Logo"
                            fill
                            sizes="(max-width: 1919px) 48px, 64px"
                            className="object-contain"
                        />
                    </div>
                    <span className="text-xl font-bold whitespace-nowrap text-white 2xl:text-2xl min-[1920px]:text-3xl">
                        JS Mart <span className="font-normal text-emerald-500">Admin</span>
                    </span>
                </div>

                <nav className="custom-scrollbar w-full flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4 2xl:space-y-1.5 2xl:px-4 2xl:py-5 min-[1920px]:px-5">
                    {navigationItems
                        .filter(item => {
                            const user = authService.getCurrentUser();
                            const userRole = user?.role;
                            if (!item.allowedRoles) return true;
                            return item.allowedRoles.includes(userRole);
                        })
                        .map((item) => {
                            let filteredItems = item.items;
                            const user = authService.getCurrentUser();
                            const userRole = user?.role;

                            if (item.title === 'Users') {
                                filteredItems = item.items.filter(subItem => {
                                    if (subItem.title === 'Admin Users') {
                                        return userRole !== 'MANAGER';
                                    }
                                    if (subItem.title === 'Roles') {
                                        return userRole === 'DEVELOPER';
                                    }
                                    return true;
                                });
                            }

                            const hasSubItems = filteredItems && filteredItems.length > 0;
                            const isExpanded = expandedItems.includes(item.title);
                            const isActive = pathname === item.href ||
                                (filteredItems?.some(sub => sub.href === pathname));

                            return (
                                <div key={item.title}>
                                    {hasSubItems ? (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(item.title)}
                                                suppressHydrationWarning
                                                className={cn(
                                                    "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 2xl:gap-3.5 2xl:px-4 2xl:py-3 min-[1920px]:py-3.5",
                                                    isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                                                )}
                                            >
                                                <item.icon className={cn("h-5 w-5 shrink-0 2xl:h-6 2xl:w-6 min-[1920px]:h-7 min-[1920px]:w-7", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} strokeWidth={2} />
                                                <span className="flex-1 text-left text-sm font-medium 2xl:text-base min-[1920px]:text-lg">{item.title}</span>
                                                {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 2xl:h-5 2xl:w-5 min-[1920px]:h-6 min-[1920px]:w-6" strokeWidth={2} /> : <ChevronRight className="h-4 w-4 shrink-0 2xl:h-5 2xl:w-5 min-[1920px]:h-6 min-[1920px]:w-6" strokeWidth={2} />}
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-1 space-y-1 overflow-hidden pl-10 pr-3 2xl:pl-11 min-[1920px]:pl-12 min-[1920px]:pr-4 min-[2560px]:pl-[3.25rem]"
                                                    >
                                                        {filteredItems?.map((subItem) => (
                                                            <Link
                                                                key={subItem.href}
                                                                href={subItem.href}
                                                                onClick={() => onCloseMobile()}
                                                                className={cn(
                                                                    "flex items-center justify-between rounded-md py-1.5 text-sm font-medium transition-colors 2xl:py-2 2xl:text-base min-[1920px]:py-2.5 min-[1920px]:text-[1.0625rem]",
                                                                    pathname === subItem.href
                                                                        ? "text-emerald-400"
                                                                        : "text-slate-400 hover:text-white"
                                                                )}
                                                            >
                                                                <span>{subItem.title}</span>
                                                                {subItem.title === 'Removal Approvals' && pendingApprovalsCount > 0 && (
                                                                    <span className="min-w-[1.25rem] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-black text-white 2xl:min-w-[1.35rem] 2xl:px-2 2xl:text-sm">
                                                                        {pendingApprovalsCount}
                                                                    </span>
                                                                )}
                                                                {subItem.title === 'Low Stock' && lowStockCount > 0 && (
                                                                    <span className="min-w-[1.25rem] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-xs font-black text-white 2xl:min-w-[1.35rem] 2xl:px-2 2xl:text-sm">
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
                                        (!item.items || item.items.length === 0) && (
                                            <Link
                                                href={item.href || '#'}
                                                onClick={() => onCloseMobile()}
                                                className={cn(
                                                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 2xl:gap-3.5 2xl:px-4 2xl:py-3 min-[1920px]:py-3.5",
                                                    isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                                                )}
                                            >
                                                <item.icon className={cn("h-5 w-5 shrink-0 2xl:h-6 2xl:w-6 min-[1920px]:h-7 min-[1920px]:w-7", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} strokeWidth={2} />
                                                <span className="text-sm font-medium 2xl:text-base min-[1920px]:text-lg">{item.title}</span>
                                            </Link>
                                        )
                                    )}
                                </div>
                            );
                        })}
                </nav>

                <div className="w-full shrink-0 border-t border-slate-800 p-3 2xl:p-4 min-[1920px]:p-5">
                    <button
                        type="button"
                        onClick={() => {
                            onCloseMobile();
                            logout();
                        }}
                        className={cn(
                            "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 2xl:gap-3.5 2xl:px-4 2xl:py-3 min-[1920px]:py-3.5"
                        )}
                    >
                        <LogOut className="h-5 w-5 shrink-0 2xl:h-6 2xl:w-6 min-[1920px]:h-7 min-[1920px]:w-7" strokeWidth={2} />
                        <span className="text-sm font-medium 2xl:text-base min-[1920px]:text-lg">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
