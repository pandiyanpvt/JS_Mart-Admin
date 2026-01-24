'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Ticket, Calendar, DollarSign, Percent, Copy, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data for Coupons
const mockCoupons = [
    {
        id: 1,
        code: 'WELCOME20',
        type: 'Percentage',
        value: 20,
        minPurchase: 50,
        usageLimit: 100,
        usedCount: 45,
        expiryDate: '2026-12-31',
        status: 'Active'
    },
    {
        id: 2,
        code: 'SUMMERSALE',
        type: 'Fixed Amount',
        value: 15,
        minPurchase: 100,
        usageLimit: 500,
        usedCount: 120,
        expiryDate: '2026-08-31',
        status: 'Active'
    },
    {
        id: 3,
        code: 'FREESHIP',
        type: 'Free Shipping',
        value: 0,
        minPurchase: 30,
        usageLimit: 1000,
        usedCount: 850,
        expiryDate: '2025-12-31',
        status: 'Expired'
    },
    {
        id: 4,
        code: 'VIPACCESS',
        type: 'Percentage',
        value: 25,
        minPurchase: 200,
        usageLimit: 50,
        usedCount: 10,
        expiryDate: '2026-06-30',
        status: 'Inactive'
    }
];

export default function CouponsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [coupons, setCoupons] = useState(mockCoupons);

    // Modal States
    const [viewCoupon, setViewCoupon] = useState(null);
    const [editingCoupon, setEditingCoupon] = useState(null); // Contains form data for Add/Edit
    const [isNewCoupon, setIsNewCoupon] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredCoupons = coupons.filter(coupon => {
        const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || coupon.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingCoupon({
            code: '',
            type: 'Percentage',
            value: 0,
            minPurchase: 0,
            usageLimit: 100,
            usedCount: 0,
            expiryDate: '',
            status: 'Active'
        });
        setIsNewCoupon(true);
    };

    const handleOpenEdit = (coupon) => {
        setEditingCoupon({ ...coupon });
        setIsNewCoupon(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewCoupon) {
            const newId = Math.max(...coupons.map(c => c.id), 0) + 1;
            const newCoupon = {
                ...editingCoupon,
                id: newId,
                code: editingCoupon.code.toUpperCase()
            };
            setCoupons([newCoupon, ...coupons]);
        } else {
            setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...editingCoupon, code: editingCoupon.code.toUpperCase() } : c));
        }

        setIsSaving(false);
        setEditingCoupon(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setCoupons(coupons.filter(c => c.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "", step }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                step={step}
                required={required}
                value={editingCoupon?.[name] || ''}
                onChange={e => setEditingCoupon({ ...editingCoupon, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Coupons</h1>
                    <p className="text-slate-500 text-sm">Manage discount codes and promotional offers.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Create Coupon</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search coupons by code..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Expired</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No coupons found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                                                    <Ticket size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 font-mono tracking-wide">{coupon.code}</p>
                                                    <p className="text-[10px] text-slate-500">Min. Spend: ${coupon.minPurchase}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                {coupon.type === 'Percentage' ? <Percent size={14} className="text-emerald-500" /> : <DollarSign size={14} className="text-emerald-500" />}
                                                {coupon.type === 'Free Shipping' ? 'Free Ship' : coupon.value + (coupon.type === 'Percentage' ? '%' : '')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-medium">{coupon.usedCount} / {coupon.usageLimit} used</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {coupon.expiryDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                coupon.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    coupon.status === 'Expired' ? "bg-slate-100 text-slate-500 border-slate-200" :
                                                        "bg-amber-50 text-amber-700 border-amber-100"
                                            )}>
                                                {coupon.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {coupon.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewCoupon(coupon)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(coupon)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(coupon.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Coupon"
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
            </div>

            {/* View Modal */}
            {viewCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewCoupon(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <Ticket size={200} className="absolute -right-10 -top-10 transform rotate-12" />
                            </div>
                            <h3 className="text-sm font-medium uppercase tracking-wider opacity-90 mb-1">Coupon Code</h3>
                            <div className="text-3xl font-bold font-mono tracking-widest my-2 flex items-center justify-center gap-2">
                                {viewCoupon.code}
                                <Copy size={18} className="cursor-pointer hover:opacity-80" />
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm mt-2">
                                {viewCoupon.status}
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Discount Type</span>
                                    <p className="font-semibold text-slate-900">{viewCoupon.type}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Value</span>
                                    <p className="font-semibold text-slate-900 text-lg text-emerald-600">
                                        {viewCoupon.type === 'Free Shipping' ? 'Free Ship' : `${viewCoupon.value}${viewCoupon.type === 'Percentage' ? '%' : ''}`}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Min. Spend</span>
                                    <p className="font-medium text-slate-900">${viewCoupon.minPurchase}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Expiry Date</span>
                                    <p className="font-medium text-slate-900">{viewCoupon.expiryDate}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Usage Limit</span>
                                    <span className="text-xs font-bold text-indigo-600">{Math.round((viewCoupon.usedCount / viewCoupon.usageLimit) * 100)}% Used</span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min((viewCoupon.usedCount / viewCoupon.usageLimit) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-2">{viewCoupon.usedCount} used out of {viewCoupon.usageLimit}</p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewCoupon(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingCoupon(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewCoupon ? 'Create Coupon' : 'Edit Coupon'}</h3>
                                <p className="text-sm text-slate-500">{isNewCoupon ? 'Generate a new discount code' : 'Modify promotion details'}</p>
                            </div>
                            <button onClick={() => setEditingCoupon(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="coupon-form" onSubmit={handleSave} className="space-y-6">
                                <FormInput label="Coupon Code" name="code" required placeholder="e.g. SUMMER2024" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Discount Type</label>
                                        <select
                                            value={editingCoupon.type}
                                            onChange={e => setEditingCoupon({ ...editingCoupon, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed Amount">Fixed Amount ($)</option>
                                            <option value="Free Shipping">Free Shipping</option>
                                        </select>
                                    </div>
                                    <FormInput label="Value" name="value" type="number" step="0.01" required={editingCoupon.type !== 'Free Shipping'} placeholder="0" />
                                    <FormInput label="Min. Purchase ($)" name="minPurchase" type="number" step="0.01" placeholder="0.00" />
                                    <FormInput label="Usage Limit" name="usageLimit" type="number" placeholder="100" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Expiry Date" name="expiryDate" type="date" required />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingCoupon.status}
                                            onChange={e => setEditingCoupon({ ...editingCoupon, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Expired">Expired</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingCoupon(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="coupon-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewCoupon ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewCoupon ? 'Create Coupon' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setDeleteId(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Coupon?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this coupon? It will no longer be valid for comparisons or orders.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-rose-200"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
