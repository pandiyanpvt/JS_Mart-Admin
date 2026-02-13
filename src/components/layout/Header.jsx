'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { authService, notificationService } from '@/lib/api';
import { useAuth } from '@/components/providers/AuthProvider';

export function Header() {
    const [roleName, setRoleName] = useState('');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const { logout, user } = useAuth();

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
            if (!notifRef.current) return;
            if (!notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) {
            document.addEventListener('mousedown', handler);
        } else {
            document.removeEventListener('mousedown', handler);
        }
        return () => document.removeEventListener('mousedown', handler);
    }, [isNotifOpen]);

    useEffect(() => {
        const handler = (e) => {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        if (isProfileOpen) {
            document.addEventListener('mousedown', handler);
        } else {
            document.removeEventListener('mousedown', handler);
        }
        return () => document.removeEventListener('mousedown', handler);
    }, [isProfileOpen]);

    const handleToggleNotif = () => {
        setIsNotifOpen((open) => !open);
    };

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
                <div className="relative" ref={notifRef}>
                    <button
                        type="button"
                        suppressHydrationWarning
                        onClick={handleToggleNotif}
                        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 min-w-[0.75rem] h-2 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-40">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                                    <p className="text-[11px] text-slate-500">
                                        {unreadCount > 0
                                            ? `${unreadCount} unread`
                                            : 'You are all caught up'}
                                    </p>
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-xs text-slate-500">
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <button
                                            key={n.id}
                                            type="button"
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full text-left px-4 py-3 text-xs border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors ${n.isRead ? 'bg-white' : 'bg-emerald-50/60'
                                                }`}
                                        >
                                            <p className="font-semibold text-slate-900 truncate">
                                                {n.title}
                                            </p>
                                            {n.message && (
                                                <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">
                                                    {n.message}
                                                </p>
                                            )}
                                            <div className="mt-1 flex items-center justify-between">
                                                <span className="text-[10px] uppercase text-slate-400 font-bold">
                                                    {n.type || 'GENERAL'}
                                                </span>
                                                {!n.isRead && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                )}
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
                        className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                {user?.emailAddress?.split('@')[0] || 'Guest'}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">
                                {roleName}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 border border-slate-300 group-hover:border-emerald-300 transition-all overflow-hidden relative">
                            <User size={20} />
                        </div>
                        <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {user?.emailAddress || 'Guest'}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {roleName}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

