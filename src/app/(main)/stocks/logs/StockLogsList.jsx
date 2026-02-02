'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    History,
    ArrowUpRight,
    Loader2,
    FileText,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    User,
    Calendar,
    Tag,
    Hash,
    ShieldCheck,
    Clock,
    Camera,
    X,
    ChevronLeft,
    ChevronRight,
    Upload
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { stockLogService } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function StockLogsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    const loadLogs = async (page = 1) => {
        try {
            setLoading(true);
            const data = await stockLogService.getPaginated(page, itemsPerPage);
            console.log('Fetched Logs:', data);
            setLogs(data.logs || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.totalItems || 0);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleExport = async () => {
        try {
            // Fetch all logs for export (not paginated)
            const allLogsData = await stockLogService.getAll();
            const dataToExport = allLogsData.map(log => ({
                'Log ID': log.id,
                'Batch Number': log.stockBatch?.batchNumber || 'N/A',
                'Product': log.product?.productName || 'N/A',
                'Brand': log.product?.brand?.brand || 'In-House',
                'Type': log.type,
                'Quantity': log.quantity,
                'Previous Qty': log.previousQuantity,
                'New Qty': log.newQuantity,
                'Reason': log.reason || 'N/A',
                'Approval Status': log.approvalStatus,
                'Created At': new Date(log.createdAt).toLocaleString()
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Stock Logs");
            XLSX.writeFile(wb, `Stock_Logs_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const query = searchQuery.toLowerCase();
        return (
            log.Product?.productName.toLowerCase().includes(query) ||
            log.StockBatch?.batchNumber.toLowerCase().includes(query) ||
            log.type.toLowerCase().includes(query) ||
            log.reason?.toLowerCase().includes(query)
        );
    });

    const getTypeStyles = (type) => {
        switch (type) {
            case 'ADD': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'REMOVE': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'EXPIRED': return 'text-rose-600 bg-rose-50 border-rose-100';
            case 'DAMAGED': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'ADJUSTMENT': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
            case 'SALE': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'RETURN': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'APPROVED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'REJECTED': return 'text-rose-600 bg-rose-50 border-rose-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };


    const getTypeIcon = (type) => {
        switch (type) {
            case 'ADD': return <ArrowUp size={14} />;
            case 'REMOVE': return <ArrowDown size={14} />;
            case 'SALE': return <ArrowDown size={14} />;
            default: return <RefreshCw size={14} />;
        }
    };

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest mb-2">
                        <div className="w-8 h-[2px] bg-indigo-600 rounded-full" />
                        Audit Trail
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Stock Logs</h1>
                    <p className="text-slate-500 mt-2 font-medium">Complete history of all stock movements and transactions.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                >
                    <button
                        onClick={loadLogs}
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Upload size={18} className="rotate-180" strokeWidth={3} />
                        <span>Export Data</span>
                    </button>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by product, batch or type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading && logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                            <p className="text-slate-500 font-bold animate-pulse">Retrieving audit records...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Reference</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supplier</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit & Record</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Account Shift</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center text-slate-400">
                                            No audit records found matching the query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log, idx) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="group hover:bg-slate-50/80 transition-all"
                                        >
                                            {/* Batch ID */}
                                            <td className="px-6 py-6">
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{log.stockBatch?.batchNumber || 'N/A'}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: {log.stockBatchId || '-'}</p>
                                                </div>
                                            </td>

                                            {/* Product Reference */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                                        {log.product?.images?.[0]?.productImg ? (
                                                            <img src={log.product.images[0].productImg} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                                <Tag size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{log.product?.productName}</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase">Ref: {log.product?.brand?.brand || 'In-House'}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Supplier */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700">
                                                            {log.supplier?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                                            {log.type === 'ADD' ? 'Source' : 'Internal'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Transaction Details */}
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-1 h-1 rounded-full", log.type === 'ADD' ? "bg-emerald-500" : "bg-rose-500")} />
                                                        <span className={cn(
                                                            "text-[10px] font-black uppercase tracking-tighter",
                                                            log.type === 'ADD' ? "text-emerald-600" : "text-rose-600"
                                                        )}>
                                                            {log.type} Operation
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span className="text-[11px] font-bold text-slate-500 truncate max-w-[140px]">
                                                            {log.reason || 'No justification'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Audit & Record */}
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                            <Clock size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-bold text-slate-900">
                                                                {new Date(log.createdAt).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-medium">
                                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {log.evidencePhoto ? (
                                                            <div
                                                                className="w-8 h-8 rounded-lg bg-slate-900 overflow-hidden border border-slate-200 cursor-zoom-in group-hover:scale-110 transition-transform shadow-sm"
                                                                onClick={() => setSelectedImage(log.evidencePhoto)}
                                                            >
                                                                <img src={log.evidencePhoto} alt="" className="w-full h-full object-cover opacity-80" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                                                <Camera size={12} />
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                                                            getTypeStyles(log.approvalStatus)
                                                        )}>
                                                            {log.approvalStatus}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Account Shift */}
                                            <td className="px-8 py-6 text-right">
                                                <div className="inline-flex flex-col items-end">
                                                    <div className="flex items-center gap-2">
                                                        <p className={cn(
                                                            "text-lg font-black leading-none",
                                                            log.type === 'ADD' ? "text-emerald-600" : "text-rose-600"
                                                        )}>
                                                            {log.type === 'ADD' ? '+' : '-'}{log.quantity}
                                                        </p>
                                                        <div className={cn("w-2 h-2 rounded-full", log.type === 'ADD' ? "bg-emerald-500" : "bg-rose-500")} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-tighter">
                                                        Shift from {log.previousQuantity} to {log.newQuantity}
                                                    </p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-bold text-slate-900">{totalItems}</span> logs
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => loadLogs(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => loadLogs(i + 1)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl font-bold text-sm transition-all",
                                        currentPage === i + 1
                                            ? "bg-slate-900 text-white"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => loadLogs(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Image Popup Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 z-10 p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"
                            >
                                <X size={24} />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Evidence"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
