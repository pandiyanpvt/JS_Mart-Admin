'use client';

import React, { useState } from 'react';
import {
    Tag,
    Plus,
    Search,
    Filter,
    Calendar,
    Trash2,
    Edit,
    CheckCircle2,
    XCircle,
    Gift,
    Clock,
    TrendingUp,
    Percent,
    Ticket,
    Copy,
    ChevronRight,
    X,
    Info,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useModal } from '@/components/providers/ModalProvider';

const initialPromotions = [
    {
        id: 1,
        name: 'Summer Harvest Sale',
        code: 'SUMMER20',
        type: 'Percentage',
        value: 20,
        status: 'Active',
        expiry: '2026-08-31',
        redemptions: 1240,
        color: 'bg-emerald-500'
    },
    {
        id: 2,
        name: 'New Customer Welcome',
        code: 'WELCOME10',
        type: 'Fixed Amount',
        value: 10,
        status: 'Active',
        expiry: '2026-12-31',
        redemptions: 5430,
        color: 'bg-blue-500'
    },
    {
        id: 3,
        name: 'Flash Fruit Friday',
        code: 'FRUITFAST',
        type: 'Percentage',
        value: 50,
        status: 'Expired',
        expiry: '2026-01-15',
        redemptions: 890,
        color: 'bg-rose-500'
    },
    {
        id: 4,
        name: 'Organic Dairy Deal',
        code: 'DAIRYFREE',
        type: 'Buy One Get One',
        value: 1,
        status: 'Active',
        expiry: '2026-03-20',
        redemptions: 450,
        color: 'bg-amber-500'
    },
];

export default function PromotionsView() {
    const { showModal } = useModal();
    const [promotions, setPromotions] = useState(initialPromotions);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleToggleStatus = (id) => {
        setPromotions(prev => prev.map(promo => {
            if (promo.id === id) {
                const newStatus = promo.status === 'Active' ? 'Paused' : 'Active';
                showNotification(`Promotion ${newStatus === 'Active' ? 'activated' : 'paused'}`, 'info');
                return { ...promo, status: newStatus };
            }
            return promo;
        }));
    };

    const handleDelete = (id) => {
        showModal({
            title: "Delete Promotion",
            message: "Are you sure you want to remove this promotion? This action cannot be undone.",
            type: "error",
            confirmLabel: "Delete",
            onConfirm: () => {
                setPromotions(prev => prev.filter(p => p.id !== id));
                showNotification('Promotion removed permanently', 'error');
            }
        });
    };

    const filteredPromotions = promotions.filter(p =>
        (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (p.code || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Promotions & Discounts</h1>
                    <p className="text-slate-500 text-sm">Boost sales with coupons, deals, and special offers.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-slate-200"
                >
                    <Plus size={18} />
                    <span>Create New Campaign</span>
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Sales Driven</p>
                        <h3 className="text-2xl font-black text-slate-900">$24,540</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Ticket size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Coupons</p>
                        <h3 className="text-2xl font-black text-slate-900">{promotions.filter(p => p.status === 'Active').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Gift size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Redemptions</p>
                        <h3 className="text-2xl font-black text-slate-900">8.2k</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search campaign by name or code..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Value</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Redemptions</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPromotions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No promotions found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredPromotions.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm",
                                                    promo.color
                                                )}>
                                                    {promo.type === 'Percentage' ? <Percent size={18} strokeWidth={3} /> : <Gift size={18} strokeWidth={2.5} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{promo.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-600 select-all tracking-wider">{promo.code}</code>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(promo.code);
                                                                showNotification('Code copied to clipboard', 'success');
                                                            }}
                                                            className="text-slate-400 hover:text-emerald-500 transition-colors"
                                                            title="Copy Code"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">{promo.type}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">
                                                {promo.type === 'Percentage' ? `${promo.value}% OFF` : promo.type === 'Fixed Amount' ? `$${promo.value} OFF` : 'Special Offer'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                promo.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    promo.status === 'Expired' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-700 border-slate-100"
                                            )}>
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium">
                                                    {new Date(promo.expiry).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                                            {promo.redemptions.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(promo.id)}
                                                    className={cn(
                                                        "p-1.5 rounded-lg transition-all",
                                                        promo.status === 'Active' ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                                    )}
                                                    title={promo.status === 'Active' ? 'Pause' : 'Resume'}
                                                >
                                                    {promo.status === 'Active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500">
                        {filteredPromotions.length === 0
                            ? 'No promotions found'
                            : `Showing ${filteredPromotions.length} campaigns`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* Modal Placeholder */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                        <Plus size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">New Campaign</h2>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Setup a discount</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Campaign Name</label>
                                <input type="text" placeholder="e.g. Winter Sale 2026" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Coupon Code</label>
                                    <input type="text" placeholder="WINTER50" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Discount Type</label>
                                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all appearance-none">
                                        <option>Percentage</option>
                                        <option>Fixed Amount</option>
                                        <option>BOGO</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                                <Info size={20} className="text-blue-500 shrink-0" />
                                <p className="text-xs font-bold text-blue-700">This feature is limited in the demo. New campaigns won't persist yet.</p>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all">
                                DISCARD
                            </button>
                            <button onClick={() => {
                                setIsModalOpen(false);
                                showNotification('Campaign created (Demo mode)', 'success');
                            }} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all">
                                LAUNCH CAMPAIGN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border animate-in slide-in-from-right-10",
                    notification.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" :
                        notification.type === 'error' ? "bg-rose-600 border-rose-500 text-white" : "bg-slate-900 border-slate-800 text-white"
                )}>
                    {notification.type === 'success' ? <Check size={20} strokeWidth={3} /> : <Info size={20} />}
                    <span className="text-sm font-black">{notification.message}</span>
                </div>
            )}
        </div>
    );
}
