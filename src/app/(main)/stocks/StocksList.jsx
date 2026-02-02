'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Box,
    Hash,
    Layers,
    RefreshCw,
    History,
    Upload,
    Camera
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { productService, stockService, stockLogService } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import * as XLSX from 'xlsx';


export default function StocksList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [allBatches, setAllBatches] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Adjustment state
    const [adjustment, setAdjustment] = useState({
        productId: '',
        stockBatchId: '',
        type: 'REMOVE',
        quantity: '',
        reason: ''
    });
    const [evidencePhoto, setEvidencePhoto] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState(null);


    const loadData = async () => {
        try {
            setLoading(true);
            const [batches, products] = await Promise.all([
                stockService.getAllBatches(),
                productService.getAll()
            ]);
            setAllBatches(batches);
            setAllProducts(products);
        } catch (error) {
            console.error('Failed to load data:', error);
            showNotification('Failed to synchronize stock data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleOpenAdjust = (batch) => {
        setAdjustment({
            productId: batch.productId,
            stockBatchId: batch.id,
            type: 'REMOVE',
            quantity: '',
            reason: ''
        });
        setEvidencePhoto(null);
        setEvidencePreview(null);
        setIsAdjustOpen(true);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEvidencePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidencePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleAdjustmentSubmit = async (e) => {
        e.preventDefault();

        // Validation: Removal requires photo evidence as per new workflow
        if (!evidencePhoto) {
            showNotification('Photo evidence is required for stock removal', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('productId', adjustment.productId);
            submitData.append('stockBatchId', adjustment.stockBatchId);
            submitData.append('type', adjustment.type);
            submitData.append('quantity', adjustment.quantity);
            submitData.append('reason', adjustment.reason);
            submitData.append('evidencePhoto', evidencePhoto);

            await stockLogService.adjust(submitData);
            showNotification('Removal request submitted for approval!');
            setIsAdjustOpen(false);
            loadData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = () => {
        const dataToExport = allBatches.map(b => ({
            'Batch ID': b.id,
            'Batch Number': b.batchNumber,
            'Product': b.product?.productName || 'N/A',
            'Brand': b.product?.brand?.brand || 'In-House',
            'Purchase Price': parseFloat(b.purchasePrice).toFixed(2),
            'Expiry Date': b.expiryDate || 'N/A',
            'Created At': new Date(b.createdAt).toLocaleString(),
            'Quantity Available': b.quantity
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stocks");
        XLSX.writeFile(wb, `Stocks_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully');
    };


    const filteredBatches = allBatches.filter((batch) => {
        const query = searchQuery.toLowerCase();
        return (
            batch.batchNumber.toLowerCase().includes(query) ||
            batch.product?.productName.toLowerCase().includes(query)
        );
    });

    // Stats calculations
    const totalInventoryValue = allBatches.reduce((acc, b) => acc + (b.quantity * (b.product?.price || 0)), 0);
    const expiredBatchesCount = allBatches.filter(b => b.expiryDate && new Date(b.expiryDate) < new Date()).length;
    const activeBatchesCount = allBatches.filter(b => b.quantity > 0).length;

    const stats = [
        {
            title: 'Valuation Audit',
            value: `$${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'bg-emerald-500',
            trend: 'Live Market Value'
        },
        {
            title: 'Active Batches',
            value: activeBatchesCount.toString(),
            icon: Layers,
            color: 'bg-indigo-500',
            trend: 'Stock In-Hand'
        },
        {
            title: 'Expiry Alerts',
            value: expiredBatchesCount.toString(),
            icon: AlertTriangle,
            color: expiredBatchesCount > 0 ? 'bg-rose-500' : 'bg-blue-500',
            trend: expiredBatchesCount > 0 ? 'Requires Clearance' : 'Safe Storage'
        }
    ];

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
                        Unified Warehouse Management
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Stock Governance</h1>
                    <p className="text-slate-500 mt-2 font-medium">Add, remove, and audit every batch with full immutability.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                >
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
                    >
                        <Upload size={18} className="rotate-180" />
                        <span>Export Data</span>
                    </button>
                    <Link
                        href="/stocks/add"
                        className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Procure New Batch</span>
                    </Link>
                    <button
                        onClick={loadData}
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </motion.div>

            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                    >
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-700", stat.color)} />
                        <div className="flex flex-col gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                                <stat.icon size={22} />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                                <div className="text-[10px] text-slate-400 font-medium mt-2 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    {stat.trend}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search batch or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                            <p className="text-slate-500 font-bold animate-pulse">Syncing warehouse records...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Reference</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Procurement Detail</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Available</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                                {filteredBatches.length === 0 ? (
                                    <tr><td colSpan="5" className="p-20 text-center text-slate-400">No active batches found.</td></tr>

                                ) : (
                                    filteredBatches.map((batch) => (
                                        <tr key={batch.id} className="group hover:bg-slate-50/80 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                        <Hash size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-900 leading-tight">{batch.batchNumber}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">DB-ID: {batch.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                                        {batch.product?.images?.[0] ? <Image src={batch.product.images[0].productImg} alt="" fill className="object-cover" /> : <Box size={18} className="absolute inset-0 m-auto text-slate-200" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{batch.product?.productName}</p>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase">Ref: {batch.product?.brand?.brand || 'In-House'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase w-12 tracking-tighter">Purchase</span>
                                                        <span className="text-[11px] font-black text-emerald-600">${parseFloat(batch.purchasePrice).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-1 h-1 rounded-full", batch.expiryDate && new Date(batch.expiryDate) < new Date() ? "bg-rose-500 animate-pulse" : "bg-indigo-400")} />
                                                        <span className="text-[9px] font-black text-slate-400 uppercase w-12 tracking-tighter">Expiry</span>
                                                        <span className={cn("text-[11px] font-black", batch.expiryDate && new Date(batch.expiryDate) < new Date() ? "text-rose-600" : "text-slate-900")}>
                                                            {batch.expiryDate || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                        <Hash size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-bold text-slate-900">
                                                            {new Date(batch.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(batch.createdAt).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="inline-flex flex-col items-end">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-lg font-black text-slate-900 leading-none">{batch.quantity}</p>
                                                        <div className={cn("w-2 h-2 rounded-full", batch.quantity > 10 ? "bg-emerald-500" : "bg-rose-500")} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5 tracking-tighter">pcs available</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>



            {/* Adjust Stock Modal */}
            <AnimatePresence>
                {isAdjustOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAdjustOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white z-20 shrink-0">
                                <h2 className="text-2xl font-black text-slate-900">Stock Removal</h2>
                                <button onClick={() => setIsAdjustOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                                <form onSubmit={handleAdjustmentSubmit} className="p-10 pb-20 space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Volume to Remove</label>
                                        <input required type="number" placeholder="Qty" value={adjustment.quantity} onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                            <Camera size={14} />
                                            Photo Evidence Required
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                                id="evidence-upload"
                                            />
                                            <label
                                                htmlFor="evidence-upload"
                                                className="flex flex-col items-center justify-center gap-2 w-full p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-sm font-black cursor-pointer hover:bg-white hover:border-rose-300 transition-all group"
                                            >
                                                <Upload size={24} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                                <span className="text-slate-500 group-hover:text-rose-600 transition-colors">
                                                    {evidencePhoto ? evidencePhoto.name : 'Capture or Upload Evidence'}
                                                </span>
                                            </label>
                                        </div>
                                        <AnimatePresence>
                                            {evidencePreview && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mt-4 relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 shadow-lg"
                                                >
                                                    <img src={evidencePreview} alt="Evidence" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => { setEvidencePhoto(null); setEvidencePreview(null); }}
                                                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70 transition-all"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Removal Context</label>
                                        <select required value={adjustment.type} onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none appearance-none">
                                            <option value="REMOVE">Normal Removal</option>
                                            <option value="EXPIRED">Item Expiry</option>
                                            <option value="DAMAGED">Physical Damage</option>
                                            <option value="ADJUSTMENT">Audit Correction</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Official Justification</label>
                                        <textarea required rows="3" placeholder="Explain the inventory shift..." value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none resize-none" />
                                    </div>

                                    <button disabled={isSubmitting} className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100">
                                        {isSubmitting ? 'Processing...' : 'Submit for Approval'}
                                    </button>
                                </form>
                            </div>
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
