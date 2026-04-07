'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, ArrowRight, Menu } from 'lucide-react';
import { authService, notificationService } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';
import { navigationItems } from '@/data/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header({ onOpenMobileNav }) {
    const router = useRouter();
    const [roleName, setRoleName] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const notifRef = useRef(null);
    const profileRef = useRef(null);
    const searchRef = useRef(null);

    const { logout, user } = useAuth();

    // Flatten navigation items for searching
    const allPages = React.useMemo(() => {
        const pages = [];
        navigationItems.forEach(item => {
            if (item.href) {
                pages.push({ title: item.title, href: item.href, icon: item.icon, category: 'Main' });
            }
            if (item.items) {
                item.items.forEach(subItem => {
                    pages.push({ title: subItem.title, href: subItem.href, icon: item.icon, category: item.title });
                });
            }
        });
        return pages;
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const filtered = allPages.filter(page =>
                page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                page.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered);
            setIsSearchOpen(true);
        } else {
            setSearchResults([]);
            setIsSearchOpen(false);
        }
    }, [searchQuery, allPages]);

    useEffect(() => {
        if (user?.userRoleId) {
            import('@/lib/api').then(({ userRoleService }) => {
                userRoleService.getById(user.userRoleId)
                    .then(role => setRoleName(role?.role || 'User'))
                    .catch(() => setRoleName('User'));
            });
        }
    }, [user]);

    useEffect(() => {
        const loadNotifications = async () => {
            if (!user || user.role === 'DELIVERY_AGENT') {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }
            try {
                const data = await notificationService.getMy(1, 10);
                const items = data?.items || [];
                setNotifications(items);
                setUnreadCount(items.filter(n => !n.isRead).length);
            } catch (e) {
                console.error('Failed to load notifications', e);
            }
        };
        loadNotifications();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleToggleNotif = () => setIsNotifOpen((open) => !open);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.isRead) {
            try {
                await notificationService.markAsRead(notif.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                );
                setUnreadCount((c) => Math.max(0, c - 1));
            } catch (e) {
                console.error('Failed to mark notification as read', e);
            }
        }
    };

    return (
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 py-2 backdrop-blur-md sm:px-5 2xl:min-h-[4.25rem] 2xl:gap-3 2xl:px-8 2xl:py-3 min-[1920px]:min-h-[4.5rem]">
            <div className="flex min-w-0 max-w-xl flex-1 items-center gap-2 sm:gap-4">
                {typeof onOpenMobileNav === 'function' ? (
                    <button
                        type="button"
                        onClick={onOpenMobileNav}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
                        aria-label="Open navigation menu"
                    >
                        <Menu className="h-6 w-6" strokeWidth={2} />
                    </button>
                ) : null}
                <div className="relative min-w-0 flex-1" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 2xl:left-3.5 2xl:h-5 2xl:w-5 min-[1920px]:h-6 min-[1920px]:w-6" strokeWidth={2} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                        placeholder="Search for pages..."
                        className="w-full rounded-xl border-none bg-slate-100 py-2 pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500/20 sm:pr-4 sm:text-base 2xl:py-2.5 2xl:pl-11 min-[1920px]:py-3 min-[1920px]:pl-12 min-[1920px]:text-lg"
                    />

                    {isSearchOpen && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
                            <div className="mb-1 bg-slate-50/50 px-4 py-1.5 text-xs font-bold tracking-widest text-slate-400 2xl:py-2 2xl:text-sm">
                                Matching Pages
                            </div>
                            {searchResults.map((result, idx) => (
                                <Link
                                    key={idx}
                                    href={result.href}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                    }}
                                    className="group flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-emerald-50 2xl:py-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-600 2xl:h-10 2xl:w-10">
                                            {result.icon && <result.icon className="h-4 w-4 2xl:h-5 2xl:w-5" strokeWidth={2} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 2xl:text-base">{result.title}</p>
                                            <p className="text-xs font-bold text-slate-400 2xl:text-sm">{result.category}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0 group-hover:text-emerald-500 group-hover:opacity-100 -translate-x-2 opacity-0 2xl:h-5 2xl:w-5" strokeWidth={2} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <div className="relative" ref={notifRef}>
                    <button
                        type="button"
                        onClick={handleToggleNotif}
                        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 2xl:p-2.5 min-[1920px]:p-3"
                    >
                        <Bell className="h-5 w-5 2xl:h-6 2xl:w-6" strokeWidth={2} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[0.75rem] h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 z-40 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-80">
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 2xl:py-3">
                                <div>
                                    <p className="text-sm font-bold text-slate-900 2xl:text-base">Notifications</p>
                                    <p className="text-xs text-slate-500 2xl:text-sm">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 2xl:text-base"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-xs text-slate-500 2xl:text-sm">No notifications yet.</div>
                                ) : (
                                    notifications.map((n) => (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full border-b border-slate-50 px-4 py-2.5 text-left text-xs last:border-b-0 transition-colors hover:bg-slate-50 2xl:py-3 2xl:text-sm ${n.isRead ? 'bg-white' : 'bg-emerald-50/60'}`}
                                        >
                                            <p className="font-semibold text-slate-900 truncate">{n.title}</p>
                                            {n.message && <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 2xl:text-base">{n.message}</p>}
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 2xl:text-sm">{n.type || 'GENERAL'}</span>
                                                {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="relative" ref={profileRef}>
                    <button
                        type="button"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="group flex cursor-pointer items-center gap-2 rounded-lg py-2 pl-1 pr-1 transition-colors hover:bg-slate-50 sm:gap-3 sm:px-2 sm:py-2 2xl:px-3 2xl:py-2.5"
                    >
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-emerald-600 2xl:text-base">
                                {user?.emailAddress?.split('@')[0] || 'Guest'}
                            </p>
                            <p className="text-xs font-black tracking-widest text-slate-500 2xl:text-sm">{roleName}</p>
                        </div>
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-300 bg-slate-200 text-slate-600 transition-all group-hover:border-emerald-300 2xl:h-10 2xl:w-10 min-[1920px]:h-11 min-[1920px]:w-11">
                            <User className="h-5 w-5 2xl:h-6 2xl:w-6" strokeWidth={2} />
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-600 2xl:h-5 2xl:w-5" strokeWidth={2} />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl 2xl:w-60">
                            <div className="border-b border-slate-100 bg-slate-50 px-4 py-2.5 2xl:py-3">
                                <p className="truncate text-sm font-bold text-slate-900 2xl:text-base">{user?.emailAddress || 'Guest'}</p>
                                <p className="mt-0.5 text-xs text-slate-500 2xl:text-sm">{roleName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 2xl:py-3.5 2xl:text-base"
                            >
                                <LogOut className="h-[18px] w-[18px] shrink-0 2xl:h-5 2xl:w-5" strokeWidth={2} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

