'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Zap, Calendar, Clock, Tag, Percent, CheckCircle2, XCircle, Loader2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock Data for Flash Sales
const mockSales = [
    {
        id: 1,
        name: 'Super Weekend Sale',
        discount: 30,
        startDate: '2026-01-25',
        startTime: '09:00',
        endDate: '2026-01-27',
        endTime: '23:59',
        productsCount: 15,
        status: 'Scheduled',
        banner: null
    },
    {
        id: 2,
        name: 'Cyber Monday Deals',
        discount: 50,
        startDate: '2025-12-02',
        startTime: '00:00',
        endDate: '2025-12-02',
        endTime: '23:59',
        productsCount: 42,
        status: 'Expired',
        banner: null
    },
    {
        id: 3,
        name: 'Flash Hour Special',
        discount: 25,
        startDate: '2026-01-22',
        startTime: '14:00',
        endDate: '2026-01-22',
        endTime: '16:00',
        productsCount: 8,
        status: 'Scheduled',
        banner: null
    },
    {
        id: 4,
        name: 'Clearance Blowout',
        discount: 70,
        startDate: '2026-01-18',
        startTime: '10:00',
        endDate: '2026-01-31',
        endTime: '18:00',
        productsCount: 120,
        status: 'Active',
        banner: null
    }
];

export default function FlashSalesView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [sales, setSales] = useState(mockSales);

    // Modal States
    const [viewSale, setViewSale] = useState(null);
    const [editingSale, setEditingSale] = useState(null);
    const [isNewSale, setIsNewSale] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || sale.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingSale({
            name: '',
            discount: 0,
            startDate: '',
            startTime: '12:00',
            endDate: '',
            endTime: '12:00',
            productsCount: 0,
            status: 'Scheduled'
        });
        setIsNewSale(true);
    };

    const handleOpenEdit = (sale) => {
        setEditingSale({ ...sale });
        setIsNewSale(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewSale) {
            const newId = Math.max(...sales.map(s => s.id), 0) + 1;
            const newSale = { ...editingSale, id: newId };
            setSales([newSale, ...sales]);
        } else {
            setSales(sales.map(s => s.id === editingSale.id ? editingSale : s));
        }

        setIsSaving(false);
        setEditingSale(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setSales(sales.filter(s => s.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingSale?.[name] || ''}
                onChange={e => setEditingSale({ ...editingSale, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Flash Sales</h1>
                    <p className="text-slate-500 text-sm">Create high-urgency, time-limited sales campaigns.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Create Flash Sale</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search sales events..."
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
                            <option>Scheduled</option>
                            <option>Expired</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Products</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No flash sales found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                                                    <Zap size={20} fill="currentColor" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">{sale.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-emerald-600">{sale.discount}% OFF</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                                                <span className="flex items-center gap-1.5 ">
                                                    <Calendar size={10} /> {sale.startDate}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={10} /> {sale.endDate}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                <Package size={14} className="text-slate-400" />
                                                {sale.productsCount} items
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                sale.status === 'Active' ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" :
                                                    sale.status === 'Scheduled' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-slate-100 text-slate-500 border-slate-200"
                                            )}>
                                                {sale.status === 'Active' && <Zap size={10} fill="currentColor" />}
                                                {sale.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewSale(sale)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(sale)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Sale"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(sale.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Sale"
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
            {viewSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setViewSale(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <Zap size={200} className="absolute -left-10 -bottom-10 transform -rotate-12" fill="currentColor" />
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-wide mb-1 relative z-10">{viewSale.name}</h3>
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-rose-600 text-sm font-bold shadow-lg mt-2 relative z-10">
                                {viewSale.discount}% OFF EVERYTHING
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-center flex-1 border-r border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                                    <p className={cn(
                                        "font-bold text-sm uppercase",
                                        viewSale.status === 'Active' ? "text-rose-600" : "text-slate-800"
                                    )}>{viewSale.status}</p>
                                </div>
                                <div className="text-center flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Products Included</p>
                                    <p className="font-bold text-slate-800">{viewSale.productsCount}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Start Date</p>
                                            <p className="font-medium text-slate-900">{viewSale.startDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">End Date</p>
                                            <p className="font-medium text-slate-900">{viewSale.endDate}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Start Time</p>
                                            <p className="font-medium text-slate-900">{viewSale.startTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">End Time</p>
                                            <p className="font-medium text-slate-900">{viewSale.endTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewSale(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setEditingSale(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewSale ? 'Schedule Flash Sale' : 'Edit Campaign'}</h3>
                                <p className="text-sm text-slate-500">{isNewSale ? 'Set up a new time-limited offer' : 'Adjust sale parameters'}</p>
                            </div>
                            <button onClick={() => setEditingSale(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="sale-form" onSubmit={handleSave} className="space-y-6">
                                <FormInput label="Campaign Name" name="name" required placeholder="e.g. Midnight Madness" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Discount Percentage (%)" name="discount" type="number" required placeholder="0" />
                                    </div>
                                    <FormInput label="Start Date" name="startDate" type="date" required />
                                    <FormInput label="Start Time" name="startTime" type="time" required />
                                    <FormInput label="End Date" name="endDate" type="date" required />
                                    <FormInput label="End Time" name="endTime" type="time" required />
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingSale.status}
                                            onChange={e => setEditingSale({ ...editingSale, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Expired">Expired</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                                            <p className="text-sm text-slate-500 font-medium mb-2">Target Products</p>
                                            <button type="button" className="text-emerald-600 font-bold text-sm hover:underline flex items-center justify-center gap-1">
                                                <Plus size={16} /> Select Products
                                            </button>
                                            <p className="text-[10px] text-slate-400 mt-2">{editingSale.productsCount} products selected</p>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingSale(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="sale-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewSale ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewSale ? 'Schedule Sale' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setDeleteId(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Flash Sale?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to cancel this event? This will remove the discounts from all selected products.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                            >
                                Keep Event
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-rose-200"
                            >
                                Cancel Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
