'use client';

import React, { useState, useEffect } from 'react';
import {
    Gem,
    CheckCircle2,
    Edit2,
    Plus,
    Loader2,
    Save,
    X,
    Trash2,
    TrendingUp,
    Users,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { membershipService } from '@/lib/api';

export default function MembershipPlansView() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletePlanId, setDeletePlanId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState(null);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await membershipService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to load membership plans:', error);
            showNotification('Failed to load plans', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = {
                ...editingPlan,
                features: JSON.stringify(editingPlan.featuresList)
            };
            if (editingPlan.id) {
                await membershipService.updatePlan(editingPlan.id, data);
                showNotification('Plan updated successfully');
            } else {
                await membershipService.createPlan(data);
                showNotification('Plan created successfully');
            }
            setEditingPlan(null);
            loadPlans();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const addFeature = () => {
        setEditingPlan({
            ...editingPlan,
            featuresList: [...editingPlan.featuresList, 'New Benefit']
        });
    };

    const removeFeature = (index) => {
        const newList = [...editingPlan.featuresList];
        newList.splice(index, 1);
        setEditingPlan({ ...editingPlan, featuresList: newList });
    };

    const updateFeature = (index, value) => {
        const newList = [...editingPlan.featuresList];
        newList[index] = value;
        setEditingPlan({ ...editingPlan, featuresList: newList });
    };

    const handleDeleteClick = (plan) => setDeletePlanId(plan.id);

    const confirmDelete = async () => {
        if (!deletePlanId) return;
        setIsDeleting(true);
        try {
            await membershipService.deletePlan(deletePlanId);
            showNotification('Plan deleted successfully');
            setDeletePlanId(null);
            loadPlans();
        } catch (error) {
            showNotification(error.message || 'Failed to delete plan', 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-32 gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Configuring Membership Tiers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <div className="w-8 h-[2px] bg-amber-600 rounded-full" />
                        Premium Tier Management
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Membership Plans</h1>
                    <p className="text-slate-500 mt-2 font-medium">Control pricing, benefits, and exclusivity levels for JS Mart members.</p>
                </motion.div>
                <button
                    onClick={() => setEditingPlan({
                        name: '',
                        priceMonth: '',
                        description: '',
                        level: 1,
                        featuresList: ['Benefit 1'],
                        isActive: true
                    })}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={18} />
                    New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {plans.map((plan) => {
                    const features = JSON.parse(plan.features || '[]');
                    return (
                        <motion.div
                            key={plan.id}
                            layoutId={plan.id}
                            className={cn(
                                "group bg-white rounded-[3rem] border-2 transition-all duration-500 overflow-hidden relative",
                                plan.level === 2 ? "border-amber-100 shadow-amber-50" : "border-slate-50 shadow-slate-50",
                                "hover:shadow-2xl"
                            )}
                        >
                            <div className={cn(
                                "h-2 w-full",
                                plan.level === 2 ? "bg-amber-400" : "bg-indigo-400"
                            )} />

                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                                        plan.level === 2 ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                                    )}>
                                        <Gem size={32} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setEditingPlan({ ...plan, featuresList: features })}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            title="Edit plan"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(plan)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            title="Delete plan"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-slate-900">AUD {plan.priceMonth}</span>
                                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/ Month</span>
                                </div>

                                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                    {plan.description}
                                </p>

                                <div className="space-y-4 mb-10">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Included Benefits</p>
                                    {features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                            <CheckCircle2 size={18} className={plan.level === 2 ? "text-amber-500" : "text-indigo-500"} />
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Users size={14} />
                                        Exclusivity Level: {plan.level}
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                        plan.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {plan.isActive ? 'Active' : 'Disabled'}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingPlan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" data-lock-body-scroll>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setEditingPlan(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingPlan.id ? `Edit ${editingPlan.name}` : 'New Plan Strategy'}</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1">Tier Configuration Architecture</p>
                                </div>
                                <button onClick={() => setEditingPlan(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-10 hide-scrollbar overflow-y-auto">
                                <form onSubmit={handleSave} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Plan Name</label>
                                        <input
                                            type="text"
                                            value={editingPlan.name}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price Month (AUD)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editingPlan.priceMonth}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, priceMonth: e.target.value })}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tier Level</label>
                                            <input
                                                type="number"
                                                value={editingPlan.level}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, level: parseInt(e.target.value) })}
                                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                        <textarea
                                            rows="3"
                                            value={editingPlan.description}
                                            onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all shadow-sm resize-none"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pl-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Features & Benefits</label>
                                            <button
                                                type="button"
                                                onClick={addFeature}
                                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                                            >
                                                + Add Benefit
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {editingPlan.featuresList.map((feature, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        value={feature}
                                                        onChange={(e) => updateFeature(index, e.target.value)}
                                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFeature(index)}
                                                        className="p-4 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                                            <Gem className="text-amber-600" size={24} />
                                        </motion.div>
                                        <p className="text-xs font-bold text-amber-900 leading-relaxed">
                                            Changes to plan features will be reflected immediately to all active subscribers.
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                        >
                                            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                            {isSaving ? 'Updating...' : 'Save Configuration'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingPlan(null)}
                                            className="px-10 py-5 bg-white text-slate-400 border border-slate-100 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:text-rose-600 transition-all"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete confirmation modal */}
            <AnimatePresence>
                {deletePlanId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" data-lock-body-scroll>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setDeletePlanId(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-10 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Delete membership plan?</h3>
                            <p className="text-slate-500 text-sm mb-8">
                                This plan will be removed permanently. It cannot be deleted if any users are currently subscribed.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setDeletePlanId(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    {isDeleting ? 'Deleting...' : 'Delete plan'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notifications */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, x: '-50%' }}
                        className={cn(
                            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold text-sm backdrop-blur-md border border-white/20",
                            notification.type === 'success' ? "bg-emerald-600/90" : "bg-rose-600/90"
                        )}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
