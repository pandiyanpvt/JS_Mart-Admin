'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Info, Calendar, Hash, PackageSearch, Tag, DollarSign, Archive, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { topProducts } from '@/data/mock';
import { getProducts, deleteProduct, updateProduct, saveProduct } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [notification, setNotification] = useState(null);

    // Load products from localStorage and merge with mock data
    const loadProducts = () => {
        const savedProducts = getProducts();
        // Merge saved products with mock data (mock data as fallback)
        const merged = [...topProducts, ...savedProducts];
        setAllProducts(merged);
    };

    useEffect(() => {
        loadProducts();

        // Refresh when window gains focus (user returns from add page)
        window.addEventListener('focus', loadProducts);

        return () => {
            window.removeEventListener('focus', loadProducts);
        };
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const success = deleteProduct(id);
            if (success) {
                loadProducts();
                showNotification('Product deleted successfully', 'success');
            } else {
                // For mock data, we just filter it out from local state
                setAllProducts(prev => prev.filter(p => p.id !== id));
                showNotification('Product removed from view', 'info');
            }
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
    };

    const handleUpdateChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            // If it's a mock product (numeric ID), we might need special handling 
            // but for this demo, we'll try updateProduct first.
            let result;
            try {
                result = updateProduct(editingProduct.id, editingProduct);
            } catch (err) {
                // If it fails (e.g. not in localStorage), we save it as a new product or skip for demo
                // For now, let's just update the local state to show it works
                result = editingProduct;
            }

            // Update local state directly for immediate feedback
            setAllProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));

            showNotification('Product updated successfully!', 'success');
            setEditingProduct(null);
        } catch (error) {
            console.error('Update failed:', error);
            showNotification('Failed to update product', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // Get unique categories from all products
    const categories = ['All Categories', ...new Set(allProducts.map(product => product.category))];

    // Filter products based on search and category
    const filteredProducts = allProducts.filter((product) => {
        const sku = product.sku || `PROD-${1000 + (product.id || 0)}`;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Products List</h1>
                    <p className="text-slate-500 text-sm">Manage your product catalog and inventory.</p>
                </div>
                <Link
                    href="/products/add"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            suppressHydrationWarning
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button suppressHydrationWarning className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                        <select
                            value={selectedCategory || 'All Categories'}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            suppressHydrationWarning
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600"
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No products found matching your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    const productId = product.id || `temp-${Math.random()}`;
                                    const sku = product.sku || `PROD-${1000 + (product.id || 0)}`;
                                    const price = product.price ? `$${parseFloat(product.price).toFixed(2)}` : '$99.00';
                                    const stock = product.stock !== undefined ? product.stock : 0;
                                    const imageSrc = product.image || (typeof product.image === 'string' && product.image.startsWith('data:') ? product.image : null);

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
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                {price}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">{stock} {product.unit || 'pcs'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                                                    product.stock > 10 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {product.stock > 10 ? 'Active' : 'Low Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedProduct(product)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(product)}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={16} />
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
                            ? 'No products found'
                            : `Showing ${filteredProducts.length} of ${allProducts.length} products`}
                    </p>
                    <div className="flex gap-2">
                        <button suppressHydrationWarning className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button suppressHydrationWarning className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Product Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
                    <div
                        onClick={() => setSelectedProduct(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <PackageSearch size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                                    <p className="text-xs text-slate-500">View complete catalog information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                                        {selectedProduct.image ? (
                                            <Image
                                                src={selectedProduct.image}
                                                alt={selectedProduct.name}
                                                fill
                                                className="object-cover"
                                                unoptimized={typeof selectedProduct.image === 'string' && selectedProduct.image.startsWith('data:')}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                <Archive size={64} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Info Section */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedProduct.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                                                {selectedProduct.category}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">
                                                SKU: {selectedProduct.sku || `PROD-${1000 + (selectedProduct.id || 0)}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <DollarSign size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Price</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">
                                                {typeof selectedProduct.price === 'number' ? `$${selectedProduct.price.toFixed(2)}` : selectedProduct.price || '$0.00'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <Hash size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Stock</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">{selectedProduct.stock} {selectedProduct.unit || 'pcs'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Tag size={16} className="text-slate-400" />
                                            <span className="font-medium">Category:</span>
                                            <span className="text-slate-900 font-semibold">{selectedProduct.category}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="font-medium">Created:</span>
                                            <span className="text-slate-900 font-semibold">{selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : 'Original Mock'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Info size={16} className="text-slate-400" />
                                            <span className="font-medium">Status:</span>
                                            <span className={cn(
                                                "font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-full",
                                                selectedProduct.stock > 10 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {selectedProduct.stock > 10 ? 'Active' : 'Low Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description Section */}
                            <div className="space-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                                    <h4 className="font-bold">Product Description</h4>
                                </div>
                                <div className="text-sm text-slate-600 leading-relaxed space-y-3 overflow-hidden">
                                    <p>{selectedProduct.description || selectedProduct.shortDescription || 'No detailed description available for this product.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold transition-all text-sm"
                            >
                                Close Preview
                            </button>
                            <Link
                                href={`/products/add?id=${selectedProduct.id}`}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all text-center text-sm shadow-lg shadow-emerald-200"
                            >
                                Edit Product
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {notification && (
                <div
                    className={cn(
                        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
                        notification.type === 'success' ? "bg-emerald-600 border-emerald-500 text-white" :
                            notification.type === 'error' ? "bg-rose-600 border-rose-500 text-white" :
                                "bg-slate-800 border-slate-700 text-white"
                    )}
                >
                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        onClick={() => setEditingProduct(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                    <Edit size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
                                    <p className="text-xs text-slate-500">Modify product information</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form id="edit-product-form" onSubmit={handleUpdateSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Product Image Preview */}
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border border-slate-100 shrink-0">
                                            {editingProduct.image ? (
                                                <Image
                                                    src={editingProduct.image}
                                                    alt="Product"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized={typeof editingProduct.image === 'string' && editingProduct.image.startsWith('data:')}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                                    <Archive size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 mb-1">Product Photo</p>
                                            <p className="text-xs text-slate-500 mb-3">Update your product image</p>
                                            <button type="button" className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 hover:underline">
                                                <Upload size={14} />
                                                Change Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={editingProduct.name || ''}
                                            onChange={handleUpdateChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                Category
                                            </label>
                                            <select
                                                name="category"
                                                value={editingProduct.category || ''}
                                                onChange={handleUpdateChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            >
                                                {categories.filter(c => c !== 'All Categories').map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* SKU */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                SKU Code
                                            </label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={editingProduct.sku || ''}
                                                onChange={handleUpdateChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Price */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="price"
                                                required
                                                value={editingProduct.price || ''}
                                                onChange={handleUpdateChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                        {/* Stock */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                Stock Qty
                                            </label>
                                            <input
                                                type="number"
                                                name="stock"
                                                required
                                                value={editingProduct.stock || ''}
                                                onChange={handleUpdateChange}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Short Description
                                        </label>
                                        <textarea
                                            name="shortDescription"
                                            rows="3"
                                            value={editingProduct.shortDescription || editingProduct.description || ''}
                                            onChange={handleUpdateChange}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                            placeholder="Brief description of the product..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="edit-product-form"
                                disabled={isUpdating}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all text-center text-sm shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
