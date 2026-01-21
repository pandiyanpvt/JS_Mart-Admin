'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Eye, ArrowUpRight, BarChart2, AlertOctagon, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { topProducts } from '@/data/mock';
import { getProducts } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';

export default function LowStockView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Load products from localStorage and merge with mock data
    const loadProducts = () => {
        const savedProducts = getProducts();
        // Merge saved products with mock data (mock data as fallback)
        const merged = [...topProducts, ...savedProducts];
        // Filter only low stock products (stock <= 10)
        const lowStock = merged.filter(p => (p.stock || 0) <= 10);
        setAllProducts(lowStock);
    };

    useEffect(() => {
        loadProducts();

        // Refresh when window gains focus (user returns from add/edit page)
        window.addEventListener('focus', loadProducts);

        return () => {
            window.removeEventListener('focus', loadProducts);
        };
    }, []);

    // Get unique categories from low stock products
    const categories = ['All Categories', ...new Set(allProducts.map(product => product.category))];

    // Filter products based on search and category
    const filteredProducts = allProducts.filter((product) => {
        const sku = product.sku || `PROD-${1000 + (product.id || 0)}`;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-rose-600 bg-rose-100' };
        if (stock <= 5) return { label: 'Critical', color: 'text-rose-600 bg-rose-50 border-rose-100' };
        return { label: 'Low Stock', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/inventory"
                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
                        <p className="text-slate-500 text-sm">Monitor products that need restocking immediately.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl border border-rose-100">
                        <AlertTriangle size={18} className="text-rose-500" />
                        <span className="text-sm font-bold text-rose-700">{allProducts.filter(p => p.stock === 0).length} Out of Stock</span>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product name or SKU..."
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
                        <select
                            value={selectedCategory || 'All Categories'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No low stock items found. Great job on inventory management!
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const productId = product.id || `temp-${Math.random()}`;
                                    const sku = product.sku || `PROD-${1000 + (product.id || 0)}`;
                                    const stock = product.stock !== undefined ? product.stock : 0;
                                    const imageSrc = product.image || (typeof product.image === 'string' && product.image.startsWith('data:') ? product.image : null);
                                    const status = getStockStatus(stock);

                                    return (
                                        <tr key={productId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {imageSrc ? (
                                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                                                            <Image
                                                                src={imageSrc}
                                                                alt={product.name || ''}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                                unoptimized={typeof imageSrc === 'string' && imageSrc.startsWith('data:')}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">SKU: {sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{product.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">{stock} {product.unit || 'pcs'}</span>
                                                    {stock < 5 && <AlertOctagon size={14} className="text-rose-500" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border",
                                                    status.color
                                                )}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                                                    >
                                                        <ArrowUpRight size={14} />
                                                        Restock
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500">
                        {filteredProducts.length === 0
                            ? 'No alerts'
                            : `Showing ${filteredProducts.length} low stock items`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
