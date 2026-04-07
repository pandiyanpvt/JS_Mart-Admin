'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    AlertCircle,
    Package,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { resolveProductImageUrl } from '@/lib/productImage';
import { pickCategoryName } from '@/lib/products';
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
        <div className="w-full min-w-0 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Low & Out of Stock Products</h1>
                    <p className="text-base text-slate-500">Track products that need immediate restocking.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/stocks/add"
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        <span>Restock Now</span>
                    </Link>
                    <button
                        onClick={loadProducts}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={cn(loading ? 'animate-spin' : '')} />
                    </button>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
                <div className="min-h-[400px] min-w-0">
                    <div className="hidden overflow-x-auto lg:block">
                    {loading ? (
                        <div className="p-16 text-center flex flex-col items-center gap-3 text-slate-500">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <p className="text-base font-medium">Loading low stock products...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4">
                                <Package size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Inventory looks healthy</h3>
                            <p className="text-slate-500 mt-2">No products match the low stock criteria at this moment.</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[920px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="px-4 py-3 font-semibold">Product</th>
                                    <th className="px-4 py-3 font-semibold">Category</th>
                                    <th className="px-4 py-3 font-semibold">In Stock</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-slate-100 last:border-none hover:bg-slate-50/60 transition-all group"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                                    <Image src={resolveProductImageUrl(product.images?.[0]?.productImg)} alt="" fill sizes="40px" className="object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-base font-semibold text-slate-900 truncate">{product.productName}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">PROD-{product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {pickCategoryName(product)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-base font-semibold leading-none",
                                                        product.quantity === 0 ? "text-rose-600" : "text-amber-600"
                                                    )}>
                                                        {product.quantity}
                                                    </p>
                                                    <p className="text-xs font-semibold text-slate-500">pcs</p>
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
                                        <td className="px-4 py-4">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold",
                                                product.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {product.quantity === 0 ? <AlertCircle size={12} /> : <TrendingDown size={12} />}
                                                <span>{product.quantity === 0 ? 'Out of Stock' : 'Low Inventory'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/stocks/add?productId=${product.id}`}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-700"
                                                title="Restock product"
                                            >
                                                <TrendingUp size={16} />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                    </div>
                    <div className="space-y-3 lg:hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                <p className="text-base font-medium">Loading low stock products...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <p className="py-16 text-center text-base text-slate-500">No low stock products found.</p>
                        ) : (
                            products.map((product) => (
                                <div key={product.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-100 bg-white">
                                            <Image src={resolveProductImageUrl(product.images?.[0]?.productImg)} alt="" fill sizes="48px" className="object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-base font-semibold text-slate-900">{product.productName}</p>
                                            <p className="text-xs text-slate-500">{pickCategoryName(product)}</p>
                                        </div>
                                        <Link
                                            href={`/stocks/add?productId=${product.id}`}
                                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-600 text-white transition-all hover:bg-emerald-700"
                                        >
                                            <TrendingUp size={16} />
                                        </Link>
                                    </div>
                                </div>
                            ))
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
