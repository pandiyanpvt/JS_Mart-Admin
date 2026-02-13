'use client';

import React, { useState, useEffect } from 'react';
import {
    Star,
    Search,
    CheckCircle2,
    XCircle,
    MessageSquare,
    User,
    Package,
    Calendar,
    Filter,
    Loader2,
    AlertCircle,
    ThumbsUp,
    Check,
    X,
    TrendingUp,
    ShieldCheck,
    Eye,
    ChevronRight,
    ArrowUpRight,
    ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { reviewService, userService } from '@/lib/api';

export default function ReviewsView() {
    const [reviews, setReviews] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved
    const [notification, setNotification] = useState(null);
    const [isUpdating, setIsUpdating] = useState(null);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const [reviewsData, usersData] = await Promise.all([
                reviewService.getAllByAdmin(),
                userService.getAll().catch(() => [])
            ]);

            const uMap = {};
            usersData.forEach(user => {
                uMap[user.id] = user.fullName || user.emailAddress || `Customer #${user.id}`;
            });
            setUsersMap(uMap);
            setReviews(reviewsData);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            showNotification('Failed to load feedback', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleApproval = async (id, isApproved) => {
        setIsUpdating(id);
        try {
            await reviewService.approve(id, isApproved);
            showNotification(isApproved ? 'Review approved and published' : 'Review has been hidden');
            loadReviews();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredReviews = reviews.filter(rev => {
        const userName = usersMap[rev.userId] || rev.user?.fullName || 'Anonymous';
        const matchesSearch =
            userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rev.product?.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rev.comment || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && rev.is_approved === true) ||
            (filterStatus === 'pending' && rev.is_approved === false);

        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => !r.is_approved).length,
        approved: reviews.filter(r => r.is_approved).length,
        avgRating: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0
    };

    const RatingStars = ({ rating }) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={cn(
                            "transition-all duration-300",
                            star <= rating ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-200"
                        )}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
            {/* Glassmorphism Header */}
            <header className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-4">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Feedback Center</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Customer Reviews</h1>
                        <p className="text-slate-400 font-medium max-w-md">
                            Monitor, moderate, and gain insights from customer feedback across your entire product catalog.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-blue-400' },
                            { label: 'Pending', value: stats.pending, icon: AlertCircle, color: 'text-amber-400' },
                            { label: 'Published', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-400' },
                            { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-purple-400' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/5 p-4 rounded-3xl text-center min-w-[120px]">
                                <stat.icon size={20} className={cn("mx-auto mb-2", stat.color)} />
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">

                {/* Sidebar Filters */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Filter size={16} className="text-indigo-600" /> Filter Reviews
                        </h3>

                        <div className="space-y-2">
                            {['all', 'pending', 'approved'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group",
                                        filterStatus === status
                                            ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <span className="capitalize">{status}</span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px]",
                                        filterStatus === status ? "bg-white/20" : "bg-slate-100 group-hover:bg-slate-200"
                                    )}>
                                        {status === 'all' ? stats.total : status === 'pending' ? stats.pending : stats.approved}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Find feedback by product, user, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all placeholder:text-slate-300"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                            <kbd className="hidden sm:inline-flex items-center gap-1 h-8 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400">
                                ⌘ K
                            </kbd>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-[3rem] p-32 flex flex-col items-center justify-center border border-slate-50">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                                    <MessageSquare size={24} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
                                </div>
                                <p className="mt-6 text-slate-400 font-black uppercase tracking-widest text-[10px]">Processing Database...</p>
                            </div>
                        ) : filteredReviews.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {filteredReviews.map((rev, index) => (
                                    <motion.div
                                        key={rev.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white rounded-[3rem] p-2 border border-slate-100 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500"
                                    >
                                        <div className="bg-slate-50/50 rounded-[2.5rem] p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
                                            {/* Left Column: Context */}
                                            <div className="lg:w-72 shrink-0 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 transform group-hover:rotate-6 transition-transform">
                                                        <User size={24} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-black text-slate-900 truncate tracking-tight">
                                                            {usersMap[rev.userId] || rev.user?.fullName || 'Anonymous'}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                            ID: #{rev.userId}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                                                            <Package size={16} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Product</p>
                                                            <p className="text-xs font-black text-slate-900 truncate">
                                                                {rev.product?.productName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-slate-300" />
                                                            <span className="text-[10px] font-bold text-slate-500">
                                                                {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <ArrowUpRight size={14} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Column: Feedback Content */}
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <RatingStars rating={rev.rating} />
                                                            <span className="px-2 py-0.5 bg-amber-50 rounded-lg text-amber-600 text-xs font-black">
                                                                {rev.rating}.0
                                                            </span>
                                                        </div>

                                                        <div className={cn(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2",
                                                            rev.is_approved
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-amber-50 text-amber-500"
                                                        )}>
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", rev.is_approved ? "bg-emerald-500" : "bg-amber-400 animate-pulse")} />
                                                            {rev.is_approved ? 'Verified & Public' : 'Needs Approval'}
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <MessageSquare size={60} className="absolute -top-4 -left-6 text-slate-100/50 -z-10" />
                                                        <p className="text-lg font-medium text-slate-600 leading-relaxed italic pl-3 border-l-4 border-indigo-500/20">
                                                            "{rev.comment}"
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8">
                                                    <div className="flex items-center gap-3">
                                                        {rev.order && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                                <Check size={14} className="text-emerald-500" />
                                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Purchase</span>
                                                            </div>
                                                        )}
                                                        <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                                                            <Eye size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                        {!rev.is_approved ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApproval(rev.id, true)}
                                                                    disabled={isUpdating === rev.id}
                                                                    className="flex-1 sm:flex-none px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-emerald-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                                                >
                                                                    {isUpdating === rev.id ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                                                                    Approve Feedback
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApproval(rev.id, false)}
                                                                    className="p-3.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                                >
                                                                    <XCircle size={20} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApproval(rev.id, false)}
                                                                disabled={isUpdating === rev.id}
                                                                className="flex-1 sm:flex-none px-8 py-3.5 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-rose-50 disabled:opacity-50"
                                                            >
                                                                {isUpdating === rev.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                                Unpublish Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[4rem] p-24 text-center border border-slate-50"
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
                                    <MessageSquare size={48} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No results matching your filter</h3>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">
                                    Try adjusting your search terms or filters to find specific customer feedback.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                                >
                                    Reset Filters
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Floater Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 100, x: '-50%' }}
                        className={cn(
                            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] p-1 rounded-[2rem] shadow-2xl flex items-center border overflow-hidden",
                            notification.type === 'success'
                                ? "bg-emerald-600 border-emerald-500 shadow-emerald-200"
                                : "bg-rose-600 border-rose-500 shadow-rose-200"
                        )}
                    >
                        <div className="bg-white/10 backdrop-blur-xl w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem]">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-lg",
                                notification.type === 'success' ? "text-emerald-600" : "text-rose-600"
                            )}>
                                {notification.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">Notification</p>
                                <p className="text-sm font-bold text-white">{notification.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
