'use client';

import React, { useState } from 'react';
import {
    ArrowLeft,
    Search,
    Filter,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    MoreHorizontal,
    CornerUpLeft,
    FileText,
    DollarSign,
    PackageX
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const initialReturns = [
    {
        id: 'RET-2024-001',
        orderId: '#12341',
        customer: 'John Doe',
        product: 'Wireless Headphones',
        sku: 'AUD-001',
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=200',
        amount: 145.00,
        reason: 'Defective Item',
        status: 'Pending',
        date: '2026-01-20',
        comment: 'Left ear cup is not working properly.'
    },
    {
        id: 'RET-2024-002',
        orderId: '#12344',
        customer: 'Maria Garcia',
        product: 'Smart Watch Series 5',
        sku: 'WTC-005',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=200',
        amount: 89.00,
        reason: 'Wrong Item Sent',
        status: 'Approved',
        date: '2026-01-19',
        comment: 'I received the black version instead of silver.'
    },
    {
        id: 'RET-2024-003',
        orderId: '#12342',
        customer: 'Jane Smith',
        product: 'Mechanical Keyboard',
        sku: 'GAM-102',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=200',
        amount: 45.00,
        reason: 'Changed Mind',
        status: 'Rejected',
        date: '2026-01-18',
        comment: 'Product is fine, I just dont need it anymore.'
    },
];

export default function ReturnsView() {
    const [returns, setReturns] = useState(initialReturns);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedReturn, setSelectedReturn] = useState(null);

    const filteredReturns = returns.filter(item => {
        const matchesSearch =
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'Pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'Rejected': return "bg-rose-100 text-rose-700 border-rose-200";
            case 'Completed': return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const handleUpdateStatus = (id, newStatus) => {
        if (window.confirm(`Are you sure you want to mark this return as ${newStatus}?`)) {
            setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            if (selectedReturn && selectedReturn.id === id) {
                setSelectedReturn(prev => ({ ...prev, status: newStatus }));
            }
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/orders"
                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Returns Management</h1>
                        <p className="text-slate-500 text-sm">Handle return requests, refunds, and exchanges.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-lg border border-rose-100">
                        <AlertCircle size={14} className="text-rose-500" />
                        <span className="text-xs font-semibold text-rose-700">{returns.filter(r => r.status === 'Pending').length} Pending</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Return ID, Order #, or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
                                    filterStatus === status
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200"
                                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table List */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Return Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No returns found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredReturns.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.product}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{item.product}</p>
                                                    <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{item.orderId}</span>
                                                <span className="text-xs text-slate-500">{item.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <CornerUpLeft size={12} className="text-rose-500" />
                                                <span className="text-sm text-slate-700">{item.reason}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-slate-900">${item.amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                                                getStatusStyle(item.status)
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                                    item.status === 'Approved' ? "bg-emerald-500" :
                                                        item.status === 'Pending' ? "bg-amber-500" :
                                                            item.status === 'Rejected' ? "bg-rose-500" :
                                                                "bg-blue-500"
                                                )} />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedReturn(item)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
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
                        {filteredReturns.length === 0
                            ? 'No returns found'
                            : `Showing ${filteredReturns.length} of ${returns.length} requests`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setSelectedReturn(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Return Request</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {selectedReturn.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedReturn(null)}
                                className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-500"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Product Info */}
                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm shrink-0">
                                    <Image
                                        src={selectedReturn.image}
                                        alt={selectedReturn.product}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">{selectedReturn.product}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">SKU: {selectedReturn.sku}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wide">
                                            Purchased {selectedReturn.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Customer</label>
                                    <p className="text-sm font-bold text-slate-700">{selectedReturn.customer}</p>
                                    <p className="text-xs text-slate-400">{selectedReturn.orderId}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Refund Amount</label>
                                    <p className="text-xl font-black text-slate-900">${selectedReturn.amount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Reason for Return</label>
                                <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                                    <p className="text-sm font-bold text-rose-500 mb-1 flex items-center gap-2">
                                        <AlertCircle size={14} /> {selectedReturn.reason}
                                    </p>
                                    <p className="text-sm text-slate-600 italic">"{selectedReturn.comment}"</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-3">
                                {selectedReturn.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReturn.id, 'Rejected')}
                                            className="flex-1 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReturn.id, 'Approved')}
                                            className="flex-1 py-4 bg-emerald-600 text-white shadow-xl shadow-emerald-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                        >
                                            Approve Return
                                        </button>
                                    </>
                                )}
                                {selectedReturn.status === 'Approved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReturn.id, 'Completed')}
                                        className="flex-1 py-4 bg-blue-600 text-white shadow-xl shadow-blue-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <DollarSign size={16} />
                                        Process Refund
                                    </button>
                                )}
                                {(selectedReturn.status === 'Rejected' || selectedReturn.status === 'Completed') && (
                                    <button
                                        onClick={() => setSelectedReturn(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
