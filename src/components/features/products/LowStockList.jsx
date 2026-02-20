'use client';

import React, { useState, useEffect } from 'react';
import {
    Download,
    Plus,
    MoreVertical,
    AlertCircle,
    Package,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { productService } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function LowStockList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAll();
            // Filter products with quantity < 10
            const lowStock = data.filter(p => p.quantity < 10 && p.isActive);
            setProducts(lowStock);
        } catch (error) {
            console.error('Failed to load low stock products:', error);
            showNotification('Sync failed. Checking local cache...', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };



    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-[0.2em] mb-3">
                        <div className="w-10 h-[2px] bg-rose-600 rounded-full" />
                        Critical Alert
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Low & Out of Stock Inventory</h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">Monitor and restock items that are running low or out of stock.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex gap-3"
                >
                    <Link
                        href="/stocks/add"
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>Restock Now</span>
                    </Link>
                    <button
                        onClick={loadProducts}
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm group"
                    >
                        <RefreshCw size={20} className={cn("group-hover:rotate-180 transition-transform duration-500", loading ? 'animate-spin' : '')} />
                    </button>
                </motion.div>
            </div>

            {/* Filter & Table Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
            >
                {/* Removed Search and Filter Bar as requested */}

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-32 text-center flex flex-col items-center gap-4">
                            <Loader2 className="animate-spin text-rose-600" size={40} />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Scanning Warehouse Data...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-6">
                                <Package size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Health Check Passed</h3>
                            <p className="text-slate-500 mt-2 font-medium">No products match the low stock criteria at this moment.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Stock</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Restock Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((product, index) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-rose-50/30 transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                                                    {product.images?.[0] ? (
                                                        <Image src={product.images[0].productImg} alt="" fill sizes="40px" className="object-cover" />
                                                    ) : (
                                                        <Package className="absolute inset-0 m-auto text-slate-300" size={24} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{product.productName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">ID: PROD-{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                                {product.product_category?.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-lg font-black leading-none",
                                                        product.quantity === 0 ? "text-rose-600" : "text-amber-600"
                                                    )}>
                                                        {product.quantity}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">pcs</p>
                                                </div>
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            product.quantity === 0 ? "bg-rose-600 w-0" : "bg-amber-400"
                                                        )}
                                                        style={{ width: `${(product.quantity / 10) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight",
                                                product.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {product.quantity === 0 ? <AlertCircle size={12} /> : <TrendingDown size={12} />}
                                                <span>{product.quantity === 0 ? 'Out of Stock' : 'Low Inventory'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                href={`/stocks/add?productId=${product.id}`}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white hover:bg-rose-600 transition-all shadow-lg shadow-slate-200"
                                            >
                                                <TrendingUp size={18} />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </motion.div>

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
