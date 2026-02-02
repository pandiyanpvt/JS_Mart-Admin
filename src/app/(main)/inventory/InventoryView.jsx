'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRightLeft, PackageCheck, Truck, Plus, Download, Search, Filter, X, TrendingUp, TrendingDown, Clock, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inventoryItems, stockMovements as mockMovements } from '@/data/mock';
import { getProducts, updateProduct } from '@/lib/products';
import Image from 'next/image';
import * as XLSX from 'xlsx';

export default function InventoryView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [allInventory, setAllInventory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState('add');
    const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState(null);
    const [modalCategory, setModalCategory] = useState('all');
    const [modalSearchQuery, setModalSearchQuery] = useState('');

    // Load products and merge with inventory mock data
    const loadInventory = () => {
        const savedProducts = getProducts();

        // Map saved products to inventory structure
        const mappedSaved = savedProducts.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku || `SKU-${p.id}`,
            category: p.category,
            currentStock: parseInt(p.stock) || 0,
            minLevel: parseInt(p.minStock) || 10,
            maxLevel: (parseInt(p.stock) || 0) + 100,
            unit: p.unit || 'pcs',
            location: 'Warehouse General',
            supplier: 'Various',
            lastRestocked: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : 'N/A',
            value: `$${((parseFloat(p.price) || 0) * (parseInt(p.stock) || 0)).toFixed(2)}`,
            image: p.image
        }));

        // Merge keeping mock data as base
        setAllInventory([...inventoryItems, ...mappedSaved]);
    };

    useEffect(() => {
        loadInventory();
        window.addEventListener('focus', loadInventory);
        return () => window.removeEventListener('focus', loadInventory);
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const categories = ['all', ...new Set(allInventory.map(item => item.category))];

    const filteredItems = allInventory.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (item.sku || '').toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'low' && item.currentStock <= item.minLevel) ||
            (stockFilter === 'out' && item.currentStock === 0) ||
            (stockFilter === 'inStock' && item.currentStock > item.minLevel);
        return matchesSearch && matchesCategory && matchesStock;
    });

    const lowStockItems = allInventory.filter(item => item.currentStock <= item.minLevel);
    const totalValue = allInventory.reduce((sum, item) => {
        const valStr = typeof item.value === 'string' ? item.value.replace(/[^0-9.]/g, '') : item.value;
        const value = parseFloat(valStr) || 0;
        return sum + value;
    }, 0);

    const handleAdjustStock = (product) => {
        setSelectedProduct(product);
        setShowAdjustModal(true);
        setAdjustmentQuantity('');
        setAdjustmentReason('');
        setAdjustmentType('add');
    };

    const handleSubmitAdjustment = async () => {
        if (!adjustmentQuantity || !adjustmentReason) return;
        setIsUpdating(true);

        try {
            const qty = parseInt(adjustmentQuantity);
            const newStock = adjustmentType === 'add'
                ? selectedProduct.currentStock + qty
                : Math.max(0, selectedProduct.currentStock - qty);

            // Try to update in localStorage if it exists there
            try {
                updateProduct(selectedProduct.id, { stock: newStock });
            } catch (e) {
                // If it's a mock product not in localStorage, we just update local state
                console.info('Mock product updated locally only');
            }

            // Update local state for immediate reflected change
            setAllInventory(prev => prev.map(item =>
                item.id === selectedProduct.id
                    ? { ...item, currentStock: newStock, value: `$${(parseFloat(item.value.replace(/[^0-9.]/g, '')) * (newStock / (item.currentStock || 1))).toFixed(2)}` }
                    : item
            ));

            showNotification(`Stock ${adjustmentType === 'add' ? 'increased' : 'decreased'} successfully`, 'success');
            setShowAdjustModal(false);
            setSelectedProduct(null);
        } catch (error) {
            showNotification('Failed to update stock', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExport = () => {
        const dataToExport = allInventory.map(item => ({
            'ID': item.id,
            'Product Name': item.name,
            'SKU': item.sku,
            'Category': item.category,
            'Current Stock': item.currentStock,
            'Min Level': item.minLevel,
            'Max Level': item.maxLevel,
            'Unit': item.unit,
            'Location': item.location,
            'Supplier': item.supplier,
            'Last Restocked': item.lastRestocked,
            'Asset Value': item.value
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, `Inventory_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                    <p className="text-slate-500 text-sm">Monitor stock levels and manage supply chain.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={18} />
                        <span>Export Report</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedProduct(null);
                            setShowAdjustModal(true);
                            setAdjustmentType('add');
                            setAdjustmentQuantity('');
                            setAdjustmentReason('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                        <Plus size={18} />
                        <span>Add Stock</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 bg-emerald-50 rounded-bl-3xl group-hover:scale-110 transition-transform">
                        <PackageCheck size={20} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Items</p>
                    <h3 className="text-3xl font-bold text-slate-900">{allInventory.length}</h3>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <TrendingUp size={14} />
                        <span>Catalog Growing</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 bg-amber-50 rounded-bl-3xl group-hover:scale-110 transition-transform">
                        <AlertCircle size={20} className="text-amber-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Low Stock Alerts</p>
                    <h3 className="text-3xl font-bold text-slate-900">{lowStockItems.length}</h3>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
                        <AlertCircle size={14} />
                        <span>Needs Attention</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 bg-blue-50 rounded-bl-3xl group-hover:scale-110 transition-transform">
                        <Truck size={20} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">In Transit</p>
                    <h3 className="text-3xl font-bold text-slate-900">450</h3>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                        <TrendingDown size={14} />
                        <span>Incoming Soon</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 bg-purple-50 rounded-bl-3xl group-hover:scale-110 transition-transform">
                        <PackageCheck size={20} className="text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Inventory Value</p>
                    <h3 className="text-3xl font-bold text-slate-900">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600">
                        <TrendingUp size={14} />
                        <span>Asset Value</span>
                    </div>
                </div>
            </div>

            {/* Main Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                            <select
                                value={selectedCategory || 'all'}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={stockFilter || 'all'}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                            >
                                <option value="all">All Levels</option>
                                <option value="low">Low Stock</option>
                                <option value="out">Out of Stock</option>
                                <option value="inStock">In Stock</option>
                            </select>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Value</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No inventory matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const stockPercentage = (item.currentStock / (item.maxLevel || 100)) * 100;
                                    const isLowStock = item.currentStock <= item.minLevel;
                                    const isOutOfStock = item.currentStock === 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover"
                                                                unoptimized={typeof item.image === 'string' && item.image.startsWith('data:')}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <PackageCheck size={18} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium uppercase">{item.category}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500 uppercase">
                                                {item.sku}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between w-32">
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-emerald-600"
                                                        )}>
                                                            {item.currentStock} {item.unit}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                            / {item.maxLevel}
                                                        </span>
                                                    </div>
                                                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full transition-all duration-500",
                                                                stockPercentage < 20 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" :
                                                                    stockPercentage < 50 ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                                            )}
                                                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <span className="text-xs font-medium text-slate-600">{item.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleAdjustStock(item)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    <ArrowRightLeft size={14} />
                                                    Adjust
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6 m-6">
                    <p className="text-sm text-slate-500">
                        {filteredItems.length === 0
                            ? 'No items found'
                            : `Showing ${filteredItems.length} of ${allInventory.length} items`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>



            {/* Adjustment Modal */}
            {showAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => !isUpdating && setShowAdjustModal(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {selectedProduct ? 'Stock Adjustment' : 'Select Product'}
                                </h3>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {selectedProduct ? selectedProduct.name : 'Find item to update'}
                                </p>
                            </div>
                            <button
                                onClick={() => !isUpdating && setShowAdjustModal(false)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {!selectedProduct ? (
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={modalSearchQuery}
                                            autoFocus
                                            placeholder="Search product..."
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                            onChange={(e) => setModalSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={modalCategory}
                                        onChange={(e) => setModalCategory(e.target.value)}
                                        className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-2xl px-4 py-3 focus:ring-0 text-slate-600 outline-none max-w-[140px]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat === 'all' ? 'All' : cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    {allInventory
                                        .filter(item => {
                                            const matchesTerm = !modalSearchQuery || item.name.toLowerCase().includes(modalSearchQuery.toLowerCase());
                                            const matchesCategory = modalCategory === 'all' || item.category === modalCategory;
                                            return matchesTerm && matchesCategory;
                                        })
                                        .slice(0, 50) // Limit results
                                        .map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedProduct(item)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 text-left group"
                                            >
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-white">
                                                    {item.image ? (
                                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <PackageCheck size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Stock: {item.currentStock} {item.unit}</p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                                    <Plus size={16} />
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 space-y-6 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Current Stock</p>
                                            <p className="text-xl font-bold text-slate-900">{selectedProduct.currentStock} {selectedProduct.unit}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Level</p>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-2">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${Math.min(100, (selectedProduct.currentStock / (selectedProduct.maxLevel || 100)) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setAdjustmentType('add')}
                                                className={cn(
                                                    "flex-1 py-3 rounded-2xl text-xs font-bold transition-all",
                                                    adjustmentType === 'add'
                                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                )}
                                            >
                                                INVENTORY IN
                                            </button>
                                            <button
                                                onClick={() => setAdjustmentType('remove')}
                                                className={cn(
                                                    "flex-1 py-3 rounded-2xl text-xs font-bold transition-all",
                                                    adjustmentType === 'remove'
                                                        ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                                )}
                                            >
                                                INVENTORY OUT
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Quantity ({selectedProduct.unit})</label>
                                            <input
                                                type="number"
                                                value={adjustmentQuantity || ''}
                                                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                                                placeholder="0"
                                                autoFocus
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Reason for Adjustment</label>
                                            <select
                                                value={adjustmentReason || ''}
                                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                            >
                                                <option value="">Select reason...</option>
                                                <option value="supplier-delivery">Supplier Restock</option>
                                                <option value="damaged-items">Damaged / Expired</option>
                                                <option value="correction">Inventory Correction</option>
                                                <option value="sale-return">Customer Return</option>
                                                <option value="other">Internal Move</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                                    <button
                                        onClick={() => setShowAdjustModal(false)}
                                        disabled={isUpdating}
                                        className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-sm hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitAdjustment}
                                        disabled={!adjustmentQuantity || !adjustmentReason || isUpdating}
                                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        <span>{isUpdating ? 'Updating...' : 'Submit Update'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Notifications */}
            {notification && (
                <div
                    className={cn(
                        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-5",
                        notification.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" : "bg-rose-600 border-rose-500 text-white"
                    )}
                >
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold">{notification.message}</span>
                </div>
            )}
        </div>
    );
}
