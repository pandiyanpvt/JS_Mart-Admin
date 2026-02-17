'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Info, Calendar, Hash, PackageSearch, Tag, DollarSign, Archive, Upload, Loader2, CheckCircle2, ShieldCheck, Star } from 'lucide-react';

import { cn } from '@/lib/utils';
import { topProducts } from '@/data/mock';
import { getProducts, getProductsPaginated, deleteProduct, updateProduct, saveProduct, getCategories, getBrands, getProductsByBrand, getProductsByCategory, getProductsByPriceRange, searchProducts } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ProductsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);


    // Load initialization data
    const initData = async () => {
        try {
            const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
            setCategories(cats);
            setBrands(brs);
        } catch (error) {
            console.error('Failed to load filter data:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            let products = [];
            if (searchQuery) {
                products = await searchProducts(searchQuery);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (selectedCategory !== 'All') {
                products = await getProductsByCategory(selectedCategory);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (selectedBrand !== 'All') {
                products = await getProductsByBrand(selectedBrand);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (priceRange.min !== '' && priceRange.max !== '') {
                products = await getProductsByPriceRange(priceRange.min, priceRange.max);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else {
                const data = await getProductsPaginated(currentPage, pageSize);
                setAllProducts(data.products);
                setTotalItems(data.totalItems);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            showNotification('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initData();
        loadProducts();

        window.addEventListener('focus', loadProducts);
        return () => {
            window.removeEventListener('focus', loadProducts);
        };
    }, [currentPage]);

    const handleExport = () => {
        const dataToExport = allProducts.map(p => ({
            ID: p.id,
            Name: p.name,
            Category: p.category,
            Brand: p.brand,
            Price: p.price,
            Stock: p.stock,
            Weight: p.weight || 'N/A',
            Featured: p.isFeatured ? 'Yes' : 'No',
            Description: p.description
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `Products_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully', 'success');
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const success = await deleteProduct(id);
            if (success) {
                await loadProducts();
                showNotification('Product deleted successfully', 'success');
            } else {
                // For mock data, we just filter it out from local state
                setAllProducts(prev => prev.filter(p => p.id !== id));
                showNotification('Product removed from view', 'info');
            }
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedBrand('All');
        setPriceRange({ min: '', max: '' });
        setCurrentPage(1);
    };

    // Correcting loadProducts to handle reset better or just calling it after state changes
    useEffect(() => {
        if (selectedCategory === 'All' && selectedBrand === 'All' && searchQuery === '' && priceRange.min === '' && priceRange.max === '') {
            loadProducts();
        }
    }, [selectedCategory, selectedBrand, searchQuery, priceRange]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };




    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Information</h1>
                    <p className="text-slate-500 text-sm">View and edit basic product catalog details. Stocks are managed in the Stock Management section.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Upload size={18} className="rotate-180" />
                        <span>Export Data</span>
                    </button>
                    <Link
                        href="/products/add"
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                    >
                        <Plus size={18} />
                        <span>Add New Product</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.category}</option>
                            ))}
                        </select>
                        <select
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600"
                        >
                            <option value="All">All Brands</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.brand}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
                            <span className="text-[10px] text-slate-400 font-bold">AUD</span>
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                className="w-16 bg-transparent text-sm outline-none"
                            />
                            <span className="text-slate-300">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                className="w-16 bg-transparent text-sm outline-none"
                            />
                        </div>
                        <button
                            onClick={loadProducts}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100"
                        >
                            <Filter size={16} />
                            Apply Filters
                        </button>
                        {(searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All' || priceRange.min || priceRange.max) && (
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-all"
                            >
                                <X size={16} />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>

                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                                            <p className="font-medium">Loading products...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : allProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                        No products found matching your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                allProducts.map((product) => {
                                    const productId = product.id || `temp-${Math.random()}`;
                                    const sku = product.sku || `PROD-${1000 + (product.id || 0)}`;
                                    const price = product.price ? `AUD ${parseFloat(product.price).toFixed(2)}` : 'AUD 99.00';
                                    const stock = product.stock !== undefined ? product.stock : 0;
                                    const imageSrc = product.image || (typeof product.image === 'string' && product.image.startsWith('data:') ? product.image : null);

                                    return (
                                        <tr key={productId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {imageSrc ? (
                                                        <div
                                                            onClick={() => setPreviewImage(imageSrc)}
                                                            className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 cursor-zoom-in group"
                                                        >
                                                            <Image
                                                                src={imageSrc}
                                                                alt={product.name || ''}
                                                                fill
                                                                sizes="40px"
                                                                className="object-cover group-hover:scale-110 transition-transform"
                                                                unoptimized={typeof imageSrc === 'string' && imageSrc.startsWith('data:')}
                                                            />
                                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                                        <p className="text-[10px] text-slate-500 line-clamp-1">{product.description || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{product.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                {product.brand}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                {price}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-600">{stock} {product.unit || 'pcs'}</span>
                                                    {product.weight && (
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{product.weight}kg</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-start">
                                                    <Star
                                                        size={18}
                                                        className={cn(
                                                            product.isFeatured ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                                        )}
                                                    />
                                                </div>
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
                                                    <Link
                                                        href={`/products/add?id=${product.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Edit Product"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
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
                        {totalItems === 0
                            ? 'No products found'
                            : `Showing ${allProducts.length} of ${totalItems} products`}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                                        currentPage === page
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                    )}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            Next
                        </button>
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
                                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
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

                                    {/* Additional Images */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProduct.images.map((img, idx) => (
                                                <div
                                                    key={img.id || idx}
                                                    onClick={() => setSelectedProduct(prev => ({ ...prev, image: img.productImg }))}
                                                    className={cn(
                                                        "relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                                                        selectedProduct.image === img.productImg ? "border-emerald-500 shadow-md shadow-emerald-50" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <Image
                                                        src={img.productImg}
                                                        alt={`Preview ${idx}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Info Section */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedProduct.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase tracking-wider">
                                                {selectedProduct.category}
                                            </span>
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded-full uppercase tracking-wider">
                                                {selectedProduct.brand}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">
                                                SKU: {selectedProduct.sku}
                                            </span>

                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <DollarSign size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Price (AUD)</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">
                                                {typeof selectedProduct.price === 'number' ? `AUD ${selectedProduct.price.toFixed(2)}` : selectedProduct.price || 'AUD 0.00'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <Hash size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Stock</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <p className="text-lg font-bold text-slate-900">{selectedProduct.stock}</p>
                                                <span className="text-xs text-slate-500 font-medium">{selectedProduct.unit || 'pcs'}</span>
                                            </div>
                                            {selectedProduct.weight && (
                                                <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Weight: {selectedProduct.weight}kg</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Tag size={16} className="text-slate-400" />
                                            <span className="font-medium">Category:</span>
                                            <span className="text-slate-900 font-semibold">{selectedProduct.category}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <ShieldCheck size={16} className="text-slate-400" />
                                            <span className="font-medium">Brand:</span>
                                            <span className="text-slate-900 font-semibold">{selectedProduct.brand}</span>
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

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md cursor-zoom-out"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-2xl transition-all shadow-xl border border-white/10"
                        >
                            <X size={24} />
                        </button>
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
        </div>
    );
}
