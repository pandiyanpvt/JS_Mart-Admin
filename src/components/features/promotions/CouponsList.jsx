'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Ticket,
    Users,
    Calendar,
    Search,
    Loader2,
    CheckCircle2,
    X,
    Filter,
    Percent,
    DollarSign,
    AlertCircle,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { couponService } from '@/lib/api';

export default function CouponsList() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: '',
        expiryDate: '',
        isActive: true
    });

    const loadCoupons = async () => {
        try {
            setLoading(true);
            const data = await couponService.getAll();
            setCoupons(data);
        } catch (error) {
            console.error('Failed to load coupons:', error);
            showNotification('Failed to sync marketing data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Sanitize data: convert empty strings for optional numeric fields to null
            const submissionData = { ...formData };
            if (submissionData.maxDiscountAmount === '') submissionData.maxDiscountAmount = null;
            if (submissionData.minOrderAmount === '') submissionData.minOrderAmount = 0;

            if (editingCoupon) {
                await couponService.update(editingCoupon.id, submissionData);
                showNotification('Coupon strategy updated!');
            } else {
                await couponService.create(submissionData);
                showNotification('New discount code published!');
            }

            setIsModalOpen(false);
            resetForm();
            loadCoupons();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minOrderAmount: '0',
            maxDiscountAmount: '',
            usageLimit: '',
            startDate: '',
            expiryDate: '',
            isActive: true
        });
    };

    const openEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            maxDiscountAmount: coupon.maxDiscountAmount || '',
            usageLimit: coupon.usageLimit,
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            isActive: coupon.isActive
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this coupon?')) return;
        try {
            await couponService.delete(id);
            showNotification('Coupon deactivated');
            loadCoupons();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <div className="w-8 h-[2px] bg-rose-600 rounded-full" />
                        Engagement Rewards
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Customer Coupons</h1>
                    <p className="text-slate-500 mt-2 font-medium">Create exclusive discount codes locked to usage thresholds.</p>
                </motion.div>

                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                >
                    <Plus size={18} />
                    Generate Coupon
                </button>
            </div>

            {/* Filter Area */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        <Filter size={14} />
                        Active Only
                    </button>
                </div>
            </div>

            {/* Coupons Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-rose-600" size={40} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Processing Vault Data...</p>
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="col-span-full h-80 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 gap-4">
                        <Ticket size={48} />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">No coupons generated yet</p>
                    </div>
                ) : (
                    filteredCoupons.map((coupon, index) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 bg-rose-50 rounded-[1.2rem] flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-rose-100">
                                        <Ticket size={24} />
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                        <button onClick={() => openEdit(coupon)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(coupon.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coupon Code</p>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-rose-600 transition-colors uppercase">{coupon.code}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Benefit</p>
                                        <p className="text-lg font-black text-emerald-600">
                                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Threshold</p>
                                        <p className="text-lg font-black text-slate-900">${coupon.minOrderAmount}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                        <span className="text-slate-400 uppercase tracking-widest">Usage Limit</span>
                                        <span className="text-slate-900">{coupon.usedCount} / {coupon.usageLimit} REDEEMED</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                coupon.usedCount >= coupon.usageLimit ? "bg-rose-500" : "bg-emerald-500"
                                            )}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 pt-2">
                                        <Calendar size={12} />
                                        <span>EXPIRES {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" data-lock-body-scroll>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                        {editingCoupon ? 'Update Strategy' : 'Initialize Vault'}
                                    </h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X size={24} /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Coupon Code (Unique identifier)</label>
                                        <input required placeholder="E.G. SUMMER25" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reduction Logic</label>
                                            <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none appearance-none">
                                                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                                                <option value="FIXED">FIXED AMOUNT ($)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reduction Magnitude</label>
                                            <input required type="number" step="0.01" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Activation Limit (First N)</label>
                                            <input required type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Threshold Amount ($)</label>
                                            <input required type="number" step="0.01" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Max Discount ($)</label>
                                            <input type="number" step="0.01" placeholder="Optional" value={formData.maxDiscountAmount} onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })} className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Horizon Start</label>
                                            <input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl text-xs font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Horizon End</label>
                                            <input required type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-none rounded-xl text-xs font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
                                    {isSubmitting ? 'Finalizing Sync...' : (editingCoupon ? 'Confirm Strategy Shift' : 'Deploy Discount Code')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, x: '-50%' }} className={cn("fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold text-sm backdrop-blur-md border border-white/20", notification.type === 'success' ? "bg-emerald-600/90" : "bg-rose-600/90")}>
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
