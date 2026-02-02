'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, History, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stockService } from '@/lib/api';

export default function BatchesList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [allBatches, setAllBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const loadBatches = async () => {
        try {
            setLoading(true);
            const data = await stockService.getAllBatches();
            setAllBatches(data);
        } catch (error) {
            console.error('Failed to load batches:', error);
            showNotification('Failed to load batches', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBatches();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredBatches = allBatches.filter((batch) => {
        return (
            batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            batch.product?.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">All Stock Batches</h1>
                    <p className="text-slate-500 text-sm">Monitor all product batches, expiry dates, and purchase history.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search batches or products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Number</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Price Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBatches.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            No batches found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBatches.map((batch) => (
                                        <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                        <History size={16} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{batch.batchNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{batch.product?.productName}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{batch.product?.brand?.brandName || 'No Brand'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] flex items-center gap-2">
                                                        <span className="text-slate-400 w-12 text-right">MFG:</span>
                                                        <span className="font-medium">{batch.manufactureDate || 'N/A'}</span>
                                                    </p>
                                                    <p className="text-[10px] flex items-center gap-2">
                                                        <span className="text-slate-400 w-12 text-right">EXP:</span>
                                                        <span className={cn(
                                                            "font-medium",
                                                            batch.expiryDate && new Date(batch.expiryDate) < new Date() ? "text-rose-500 font-bold" : "text-slate-900"
                                                        )}>
                                                            {batch.expiryDate || 'N/A'}
                                                            {batch.expiryDate && new Date(batch.expiryDate) < new Date() && <AlertTriangle size={10} className="inline ml-1" />}
                                                        </span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-slate-900">{batch.quantity}</p>
                                                <p className="text-[10px] text-slate-400">of {batch.initialQuantity} units</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="text-sm font-bold text-emerald-600">${parseFloat(batch.sellingPrice).toFixed(2)}</p>
                                                <p className="text-[10px] text-slate-400">Pur: ${parseFloat(batch.purchasePrice).toFixed(2)}</p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={cn(
                    "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
                    notification.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-rose-600 border-rose-500 text-white"
                )}>
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}
        </div>
    );
}
