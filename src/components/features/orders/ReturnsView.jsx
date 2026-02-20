'use client';

import { useRef, useEffect, useState } from 'react';
import { refundService, refundTrackingService } from '@/lib/api';
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
    PackageX,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [refundTracking, setRefundTracking] = useState([]);

    useEffect(() => {
        loadRefunds();
    }, []);

    const loadRefunds = async () => {
        try {
            setLoading(true);
            const data = await refundService.getAll();
            const mappedReturns = data.map(r => ({
                id: r.id.toString(),
                orderId: r.order ? r.order.id.toString() : 'N/A',
                customer: r.user ? (r.user.fullName || r.user.emailAddress) : 'Unknown',
                product: r.product ? r.product.productName : 'Unknown Product',
                sku: r.product ? `PROD-${r.product.id}` : 'N/A',
                image: (r.product && r.product.images && r.product.images.length > 0) ? r.product.images[0].productImg : null,
                amount: parseFloat(r.refundAmount),
                reason: r.reason,
                status: r.status.charAt(0) + r.status.slice(1).toLowerCase(), // Capitalize
                date: new Date(r.createdAt).toLocaleDateString(),
                comment: r.adminComment || '',
                refundMethod: r.refundMethod,
                original: r
            }));
            setReturns(mappedReturns);
        } catch (error) {
            console.error("Failed to load refunds:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReturns = returns.filter(item => {
        const matchesSearch =
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || item.status.toUpperCase() === filterStatus.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'Pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'Rejected': return "bg-rose-100 text-rose-700 border-rose-200";
            case 'Completed': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'Collected': return "bg-indigo-100 text-indigo-700 border-indigo-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        if (window.confirm(`Are you sure you want to mark this return as ${newStatus}?`)) {
            try {
                // Determine API status value (UPPERCASE)
                const apiStatus = newStatus.toUpperCase();
                const comment = selectedReturn?.comment || selectedReturn?.original?.adminComment || '';
                await refundService.updateStatus(id, apiStatus, comment);
                await loadRefunds();
                setSelectedReturn(null);
                setRefundTracking([]);
            } catch (error) {
                console.error("Failed to update status:", error);
                alert("Failed to update status");
            }
        }
    };

    const openReturnDetails = async (item) => {
        setSelectedReturn(item);
        try {
            const tracking = await refundTrackingService.getByRefundId(item.id);
            setRefundTracking(tracking || []);
        } catch (e) {
            console.error("Failed to load refund tracking:", e);
            setRefundTracking([]);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12 font-sans">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/orders" className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Returns Management</h1>
                    </div>
                    <p className="text-slate-500 ml-1 font-medium">Monitor, approve, and process customer return requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-25" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">
                            {returns.filter(r => r.status === 'Pending').length} Pending Requests
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-6 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm group-hover:border-slate-300"
                            placeholder="Search returns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl gap-1 overflow-x-auto">
                        {['All', 'Pending', 'Approved', 'Collected', 'Completed', 'Rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                    filterStatus === status
                                        ? "bg-white text-slate-900 shadow-sm shadow-slate-200 ring-1 ring-slate-100"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area */}
                <div className="relative overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 animate-pulse">Loading return requests...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Search className="text-slate-300" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-bold">No returns found</p>
                                                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {filteredReturns.map((item) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            key={item.id}
                                            className="group hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.product}
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <PackageX size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{item.product}</p>
                                                        <p className="text-xs font-semibold text-slate-400 mt-0.5 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded">SKU: {item.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{item.orderId}</span>
                                                    <span className="text-sm font-semibold text-slate-700">{item.customer}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
                                                        <CornerUpLeft size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{item.reason}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-slate-900 font-mono">${item.amount.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border transform transition-transform group-hover:scale-105",
                                                    getStatusStyle(item.status)
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                                                        item.status === 'Approved' ? "bg-emerald-500 animate-none" :
                                                            item.status === 'Pending' ? "bg-amber-500" :
                                                                item.status === 'Rejected' ? "bg-rose-500 animate-none" :
                                                                    item.status === 'Collected' ? "bg-indigo-500 animate-none" :
                                                                        "bg-blue-500 animate-none"
                                                    )} />
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => openReturnDetails(item)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                                                >
                                                    <Eye size={14} />
                                                    <span>View</span>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-500">
                        {filteredReturns.length === 0
                            ? 'No items to show'
                            : `Showing ${filteredReturns.length} of ${returns.length} requests`}
                    </p>
                    <div className="flex gap-3">
                        <button className="px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all disabled:opacity-50 shadow-sm">Previous</button>
                        <button className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 border border-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">Next Page</button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedReturn && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedReturn(null)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Return Request Details</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">ID: {selectedReturn.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs font-medium text-slate-500">{selectedReturn.date}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReturn(null)}
                                className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8 overflow-y-auto">
                            {/* Product Info */}
                            <div className="flex items-center gap-6 p-5 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-inner shrink-0 flex items-center justify-center">
                                    {selectedReturn.image ? (
                                        <Image
                                            src={selectedReturn.image}
                                            alt={selectedReturn.product}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <PackageX size={32} className="text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">{selectedReturn.product}</h3>
                                    <p className="text-xs font-medium text-slate-400 mt-1">SKU: {selectedReturn.sku}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                                            Verified Purchase
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Customer Info</label>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {selectedReturn.customer.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 leading-tight">{selectedReturn.customer}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedReturn.orderId}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Refund Amount</label>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-2xl font-black text-slate-900">${selectedReturn.amount.toFixed(2)}</p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">USD</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                    <AlertCircle size={12} /> Reason for Return
                                </label>
                                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                                    <p className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        {selectedReturn.reason}
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed pl-2 border-l-2 border-slate-100">
                                        "{selectedReturn.comment}"
                                    </p>
                                </div>
                            </div>

                            {/* Refund Tracking Timeline */}
                            {refundTracking.length > 0 && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                                        <FileText size={12} /> Return / Refund Log
                                    </label>
                                    <div className="space-y-3">
                                        {refundTracking.map((t) => (
                                            <div key={t.id} className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mt-1.5" />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900">{t.status}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {new Date(t.dateTime).toLocaleString()}
                                                    </p>
                                                    {t.note ? (
                                                        <p className="text-xs text-slate-600 mt-2">{t.note}</p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 block shrink-0">
                            <div className="flex gap-3">
                                {selectedReturn.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReturn.id, 'Rejected')}
                                            className="flex-1 py-3.5 bg-white text-rose-600 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedReturn.id, 'Approved')}
                                            className="flex-1 py-3.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                        >
                                            Approve Request
                                        </button>
                                    </>
                                )}
                                {selectedReturn.status === 'Approved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReturn.id, 'Collected')}
                                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        Mark as Collected
                                    </button>
                                )}
                                {selectedReturn.status === 'Collected' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReturn.id, 'Completed')}
                                        className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        <DollarSign size={16} />
                                        Process Refund
                                    </button>
                                )}
                                {(selectedReturn.status === 'Rejected' || selectedReturn.status === 'Completed') && (
                                    <button
                                        onClick={() => setSelectedReturn(null)}
                                        className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                                    >
                                        Close Details
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
