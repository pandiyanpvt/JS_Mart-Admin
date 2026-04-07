'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Info, Calendar, Hash, PackageSearch, Tag, DollarSign, Upload, Loader2, CheckCircle2, ShieldCheck, Star, RotateCcw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { resolveProductImageUrl, hasProductImage, productImageUnoptimized } from '@/lib/productImage';
import { useModal } from '@/components/providers/ModalProvider';
import { getProductsPaginated, deleteProduct, updateProduct, saveProduct, getCategories, getBrands, getProductsByBrand, getProductsByCategory, searchProducts, updateProductStatus } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { StatusToggle } from '@/components/ui/StatusToggle';
                        
export default function ProductsList() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('Active');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [selectedRowIds, setSelectedRowIds] = useState(new Set());
    const [bulkAction, setBulkAction] = useState('');
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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

    /** Resolve brand label when API omits nested `brand` on product rows */
    const enrichBrandLabels = useCallback(
        (products) => {
            if (!products?.length || !brands.length) return products || [];
            return products.map((p) => {
                const fromCatalog = brands.find((b) => String(b.id) === String(p.brandId));
                const label = fromCatalog?.brand || (p.brand && p.brand !== 'No Brand' ? p.brand : null) || 'No Brand';
                return { ...p, brand: label };
            });
        },
        [brands]
    );

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            let products = [];

            if (debouncedSearch) {
                products = await searchProducts(debouncedSearch, selectedStatus);
                if (selectedCategory !== 'All') {
                    products = products.filter((p) => String(p.categoryId) === String(selectedCategory));
                }
                if (selectedBrand !== 'All') {
                    products = products.filter((p) => String(p.brandId) === String(selectedBrand));
                }
                products = enrichBrandLabels(products);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (selectedCategory !== 'All' && selectedBrand !== 'All') {
                products = await getProductsByCategory(selectedCategory, selectedStatus);
                products = products.filter((p) => String(p.brandId) === String(selectedBrand));
                products = enrichBrandLabels(products);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (selectedCategory !== 'All') {
                products = await getProductsByCategory(selectedCategory, selectedStatus);
                products = enrichBrandLabels(products);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else if (selectedBrand !== 'All') {
                const brandId = String(selectedBrand);
                products = await getProductsByBrand(brandId, selectedStatus);
                products = enrichBrandLabels(products);
                setAllProducts(products);
                setTotalItems(products.length);
                setTotalPages(1);
            } else {
                const data = await getProductsPaginated(currentPage, pageSize, selectedStatus);
                const enriched = enrichBrandLabels(data.products);
                setAllProducts(enriched);
                setTotalItems(data.totalItems);
                setTotalPages(data.totalPages);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            showNotification('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, selectedCategory, selectedStatus, selectedBrand, currentPage, pageSize, enrichBrandLabels]);

    useEffect(() => {
        initData();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
            setCurrentPage(1);
        }, 320);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        const onFocus = () => loadProducts();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [loadProducts]);

    const handleExport = () => {
        const dataToExport = allProducts.map(p => ({
            ID: p.id,
            Name: p.name,
            Category: p.category,
            Brand: p.brand,
            Price: p.price,
            Stock: p.stock,
            Featured: p.isFeatured ? 'Yes' : 'No',
            Returnable: (p.isReturnable == 1 || p.isReturnable === true) ? 'Yes' : 'No',
            Description: p.description
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, `Products_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully', 'success');
    };

    const { showModal } = useModal();

    const isProductActive = (product) => {
        if (typeof product?.isActive === 'boolean') return product.isActive;
        return String(product?.status || '').toLowerCase() === 'active';
    };

    const handleDelete = (id) => {
        showModal({
            title: "Delete Product",
            message: "Inactive product will be permanently removed from database. Continue?",
            type: "error",
            confirmLabel: "Delete",
            onConfirm: async () => {
                try {
                    const success = await deleteProduct(id);
                    if (success) {
                        await loadProducts();
                        showNotification('Product permanently deleted', 'success');
                    }
                } catch (error) {
                    showNotification(error?.message || 'Delete failed', 'error');
                } finally {
                    await loadProducts();
                }
            }
        });
    };

    const handleReset = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setSelectedCategory('All');
        setSelectedStatus('Active');
        setSelectedBrand('All');
        setCurrentPage(1);
        setSelectedRowIds(new Set());
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    /** First load only — refetches keep rows so the table width & bottom scrollbar stay stable */
    const showInitialLoading = loading && allProducts.length === 0;

    const hasActiveFilters =
        Boolean(searchQuery?.trim()) || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedBrand !== 'All';

    const visibleRowIds = allProducts
        .map((p) => (p?.id != null ? String(p.id) : null))
        .filter(Boolean);
    const selectedVisibleCount = visibleRowIds.filter((id) => selectedRowIds.has(id)).length;
    const allVisibleSelected = visibleRowIds.length > 0 && selectedVisibleCount === visibleRowIds.length;

    const handleRowSelect = (productId, checked) => {
        const id = String(productId);
        setSelectedRowIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const handleSelectAllVisible = (checked) => {
        setSelectedRowIds((prev) => {
            const next = new Set(prev);
            visibleRowIds.forEach((id) => {
                if (checked) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    };

    const handleToggleStatus = async (product, nextActive) => {
        if (!product?.id) return;
        setTogglingId(product.id);
        const prev = allProducts;
        try {
            setAllProducts((curr) =>
                curr.map((p) =>
                    p.id === product.id
                        ? {
                            ...p,
                            status: nextActive ? 'active' : 'archived',
                            isActive: !!nextActive,
                        }
                        : p
                )
            );
            await updateProductStatus(product.id, nextActive);
        } catch (error) {
            console.error('Failed to update product status:', error);
            setAllProducts(prev);
            showNotification(error?.message || 'Failed to update status', 'error');
        } finally {
            setTogglingId(null);
        }
    };

    const handleBulkStatusUpdate = async (nextActive) => {
        const selectedIds = Array.from(selectedRowIds);
        if (selectedIds.length === 0 || isBulkUpdating) return;

        const actionLabel = nextActive ? 'enable' : 'disable';
        showModal({
            title: `${nextActive ? 'Enable' : 'Disable'} Selected Products`,
            message: `Are you sure you want to ${actionLabel} ${selectedIds.length} selected product(s)?`,
            type: "warning",
            confirmLabel: nextActive ? "Enable" : "Disable",
            onConfirm: async () => {
                setIsBulkUpdating(true);
                try {
                    const updateResults = await Promise.allSettled(
                        selectedIds.map((id) => updateProductStatus(id, nextActive))
                    );
                    const failedCount = updateResults.filter((result) => result.status === 'rejected').length;

                    if (failedCount === 0) {
                        showNotification(`Selected products ${nextActive ? 'enabled' : 'disabled'} successfully`, 'success');
                        setSelectedRowIds(new Set());
                    } else {
                        showNotification(`${failedCount} product(s) failed to update`, 'error');
                    }
                    await loadProducts();
                } catch (error) {
                    showNotification(error?.message || 'Bulk status update failed', 'error');
                } finally {
                    setIsBulkUpdating(false);
                    setBulkAction('');
                }
            }
        });
    };

    return (
        <div className="w-full min-w-0 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Product Information</h1>
                    <p className="text-base text-slate-500">View and edit basic product catalog details. Stocks are managed in the Stock Management section.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                        <Upload size={18} className="rotate-180" />
                        <span>Export Data</span>
                    </button>
                    <Link
                        href="/products/add"
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        <span>Add New Product</span>
                    </Link>
                </div>
            </div>

            <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative min-h-[2.5rem] min-w-0 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products by name..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setDebouncedSearch(e.currentTarget.value.trim());
                                    setCurrentPage(1);
                                }
                            }}
                            className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-emerald-500/10"
                        />
                    </div>
                    <div className="flex min-h-[2.5rem] flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                        {selectedVisibleCount > 0 && (
                            <select
                                value={bulkAction}
                                onChange={(e) => {
                                    const action = e.target.value;
                                    setBulkAction(action);
                                    if (action === 'disable') {
                                        handleBulkStatusUpdate(false);
                                    } else if (action === 'enable') {
                                        handleBulkStatusUpdate(true);
                                    }
                                }}
                                disabled={isBulkUpdating}
                                className="h-10 min-w-[12rem] shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-base font-semibold text-amber-800 focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <option value="" disabled>
                                    Bulk Action ({selectedVisibleCount})
                                </option>
                                <option value="disable">Disable Selected</option>
                                <option value="enable">Enable Selected</option>
                            </select>
                        )}
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSelectedCategory(e.target.value);
                            }}
                            className="h-10 min-w-[11.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:ring-0"
                        >
                            <option value="All">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={String(cat.id)}>
                                    {cat.category}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSelectedStatus(e.target.value);
                            }}
                            className="h-10 min-w-[11.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:ring-0"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select
                            value={selectedBrand}
                            onChange={(e) => {
                                setCurrentPage(1);
                                setSelectedBrand(e.target.value);
                            }}
                            className="h-10 min-w-[11.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:ring-0"
                        >
                            <option value="All">All Brands</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={String(brand.id)}>
                                    {brand.brand}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={handleReset}
                            className={cn(
                                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200',
                                !hasActiveFilters && 'pointer-events-none invisible'
                            )}
                            tabIndex={hasActiveFilters ? 0 : -1}
                            aria-hidden={!hasActiveFilters}
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px] min-w-0">
                    {/* Mobile / tablet: card list */}
                    <div className="lg:hidden space-y-3">
                        {showInitialLoading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                <p className="text-base font-medium">Loading products...</p>
                            </div>
                        ) : allProducts.length === 0 ? (
                            <p className="py-16 text-center text-base text-slate-500">No products found matching your search criteria.</p>
                        ) : (
                            <div className="relative space-y-3">
                                {loading && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                    </div>
                                )}
                            {allProducts.map((product) => {
                                const productId = product.id || `temp-${Math.random()}`;
                                const price = product.price ? `AUD ${parseFloat(product.price).toFixed(2)}` : 'AUD 99.00';
                                const stock = product.stock !== undefined ? product.stock : 0;
                                const rawImage = product.image;
                                const displaySrc = resolveProductImageUrl(rawImage);
                                const canPreview = hasProductImage(rawImage);
                                return (
                                    <div
                                        key={productId}
                                        className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm"
                                    >
                                        <div className="flex gap-3">
                                            {canPreview ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewImage(displaySrc)}
                                                    className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100"
                                                >
                                                    <Image
                                                        src={displaySrc}
                                                        alt={product.name || ''}
                                                        fill
                                                        sizes="56px"
                                                        className="object-cover"
                                                        unoptimized={productImageUnoptimized(displaySrc)}
                                                    />
                                                </button>
                                            ) : (
                                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100" aria-hidden>
                                                    <Image
                                                        src={displaySrc}
                                                        alt=""
                                                        fill
                                                        sizes="56px"
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="text-base font-semibold leading-snug text-slate-900">{product.name}</p>
                                                <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{product.description || 'No description'}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-100">{product.category}</span>
                                                    <span className="text-xs font-semibold text-slate-600">{product.brand}</span>
                                                    <Star
                                                        size={14}
                                                        className={cn(product.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-200')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                                            <div className="rounded-lg bg-white px-2 py-2 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400">Price</span>
                                                <p className="font-semibold text-slate-900 mt-0.5">{price}</p>
                                            </div>
                                            <div className="rounded-lg bg-white px-2 py-2 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400">Stock</span>
                                                <p className="font-semibold text-slate-900 mt-0.5">{stock} {product.unit || 'pcs'}</p>
                                            </div>
                                            <div className="rounded-lg bg-white px-2 py-2 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400">Return</span>
                                                <span className={cn(
                                                    'mt-0.5 inline-block text-xs font-bold',
                                                    (product.isReturnable == 1 || product.isReturnable === true) ? 'text-emerald-600' : 'text-rose-600'
                                                )}>
                                                    {(product.isReturnable == 1 || product.isReturnable === true) ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="rounded-lg bg-white px-2 py-2 border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400">Status</span>
                                                <span className={cn(
                                                    'mt-0.5 inline-flex text-xs font-bold',
                                                    product.stock > 10 ? 'text-emerald-700' : 'text-amber-700'
                                                )}>
                                                    {product.stock > 10 ? 'Active' : 'Low Stock'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                                            <StatusToggle
                                                checked={isProductActive(product)}
                                                disabled={togglingId === product.id}
                                                onChange={(next) => handleToggleStatus(product, next)}
                                                onLabel="Active"
                                                offLabel="Archived"
                                            />
                                            <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(product)}
                                                className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <Link
                                                href={`/products/add?id=${product.id}`}
                                                className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                title="Edit Product"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            {!isProductActive(product) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                        )}
                    </div>

                    {/* Desktop: auto column widths + horizontal scroll so headers never overlap */}
                    <div className="hidden lg:block w-full min-w-0 max-w-full overflow-x-auto pb-1">
                        <div className="relative w-full min-w-[1040px] align-top">
                            {loading && allProducts.length > 0 && (
                                <div
                                    className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 backdrop-blur-[1px]"
                                    aria-hidden
                                >
                                    <Loader2 className="animate-spin text-emerald-500" size={28} />
                                </div>
                            )}
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="w-12 px-2 py-2.5 text-center xl:px-4 xl:py-3">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={(e) => handleSelectAllVisible(e.target.checked)}
                                            aria-label="Select all rows"
                                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
                                        />
                                    </th>
                                    <th className="min-w-[200px] px-2 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm xl:tracking-wider">Product</th>
                                    <th className="min-w-[8.5rem] px-2 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Category</th>
                                    <th className="min-w-[5.5rem] whitespace-nowrap px-2 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Brand</th>
                                    <th className="min-w-[6.5rem] whitespace-nowrap px-2 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Price</th>
                                    <th className="min-w-[5rem] whitespace-nowrap px-2 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Stock</th>
                                    <th className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Featured</th>
                                    <th className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Returnable</th>
                                    <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Status</th>
                                    <th className="whitespace-nowrap px-2 py-2.5 text-right text-xs font-semibold tracking-wide text-slate-500 xl:px-4 xl:py-3 xl:text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {showInitialLoading ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <p className="font-medium">Loading products...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : allProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                                            No products found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    allProducts.map((product) => {
                                        const productId = product.id || `temp-${Math.random()}`;
                                        const rowChecked = product?.id != null && selectedRowIds.has(String(product.id));
                                        const price = product.price ? `AUD ${parseFloat(product.price).toFixed(2)}` : 'AUD 99.00';
                                        const stock = product.stock !== undefined ? product.stock : 0;
                                        const rawImage = product.image;
                                        const displaySrc = resolveProductImageUrl(rawImage);
                                        const canPreview = hasProductImage(rawImage);

                                        return (
                                            <tr key={productId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-2 py-2.5 align-middle text-center xl:px-4 xl:py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(rowChecked)}
                                                        onChange={(e) => handleRowSelect(product.id, e.target.checked)}
                                                        aria-label={`Select ${product.name || 'product'}`}
                                                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
                                                    />
                                                </td>
                                                <td className="max-w-0 px-2 py-2.5 align-middle xl:px-4 xl:py-3">
                                                    <div className="flex min-w-0 items-center gap-2 xl:gap-3">
                                                        {canPreview ? (
                                                            <div
                                                                role="button"
                                                                tabIndex={0}
                                                                onClick={() => setPreviewImage(displaySrc)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPreviewImage(displaySrc); } }}
                                                                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-100 cursor-zoom-in group xl:h-10 xl:w-10"
                                                            >
                                                                <Image
                                                                    src={displaySrc}
                                                                    alt={product.name || ''}
                                                                    fill
                                                                    sizes="40px"
                                                                    className="object-cover group-hover:scale-110 transition-transform"
                                                                    unoptimized={productImageUnoptimized(displaySrc)}
                                                                />
                                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        ) : (
                                                            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-100 xl:h-10 xl:w-10" aria-hidden>
                                                                <Image
                                                                    src={displaySrc}
                                                                    alt=""
                                                                    fill
                                                                    sizes="40px"
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-semibold text-slate-900 xl:text-base">{product.name}</p>
                                                            <p className="line-clamp-1 text-[11px] text-slate-500 xl:text-xs">{product.description || 'No description'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="min-w-[8rem] max-w-[14rem] px-2 py-2.5 align-middle xl:px-4 xl:py-3">
                                                    <span className="block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 xl:px-2.5 xl:py-1 xl:text-sm" title={product.category}>
                                                        <span className="line-clamp-2 break-words">{product.category}</span>
                                                    </span>
                                                </td>
                                                <td className="max-w-0 px-2 py-2.5 align-middle text-sm font-medium text-slate-600 xl:px-4 xl:py-3 xl:text-base">
                                                    <span className="block truncate" title={product.brand}>{product.brand}</span>
                                                </td>
                                                <td className="max-w-0 px-2 py-2.5 align-middle text-sm font-semibold tabular-nums text-slate-900 xl:px-4 xl:py-3 xl:text-base">
                                                    <span className="block whitespace-nowrap" title={price}>{price}</span>
                                                </td>
                                                <td className="max-w-0 px-2 py-2.5 align-middle xl:px-4 xl:py-3">
                                                    <div className="min-w-0">
                                                        <span className="block whitespace-nowrap text-sm text-slate-600 xl:text-base" title={`${stock} ${product.unit || 'pcs'}`}>
                                                            {stock} {product.unit || 'pcs'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2.5 align-middle xl:px-3 xl:py-3">
                                                    <div className="flex justify-center">
                                                        <Star
                                                            size={16}
                                                            className={cn(
                                                                product.isFeatured ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                                            )}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-1 py-2.5 align-middle xl:px-3 xl:py-3">
                                                    <div className="flex justify-center">
                                                        <span
                                                            className={cn(
                                                                "rounded-md px-1 py-0.5 text-[10px] font-bold  xl:rounded-lg xl:px-2.5 xl:py-1 xl:text-sm xl:tracking-wider",
                                                                (product.isReturnable == 1 || product.isReturnable === true) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                            )}
                                                            title={(product.isReturnable == 1 || product.isReturnable === true) ? 'Returnable' : 'Not returnable'}
                                                        >
                                                            <span className="xl:hidden">{(product.isReturnable == 1 || product.isReturnable === true) ? 'Y' : 'N'}</span>
                                                            <span className="hidden xl:inline">{(product.isReturnable == 1 || product.isReturnable === true) ? 'Yes' : 'No'}</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5 align-middle xl:px-4 xl:py-3">
                                                    <StatusToggle
                                                        checked={isProductActive(product)}
                                                        disabled={togglingId === product.id}
                                                        onChange={(next) => handleToggleStatus(product, next)}
                                                        onLabel="Active"
                                                        offLabel="Archived"
                                                    />
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-2.5 align-middle xl:px-4 xl:py-3">
                                                    <div className="flex items-center justify-end gap-0.5 xl:gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProduct(product)}
                                                            className="rounded-md p-1 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600 xl:rounded-lg xl:p-1.5"
                                                            title="View Details"
                                                        >
                                                            <Eye size={15} className="xl:h-4 xl:w-4" />
                                                        </button>
                                                        <Link
                                                            href={`/products/add?id=${product.id}`}
                                                            className="rounded-md p-1 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600 xl:rounded-lg xl:p-1.5"
                                                            title="Edit Product"
                                                        >
                                                            <Edit size={15} className="xl:h-4 xl:w-4" />
                                                        </Link>
                                                        {!isProductActive(product) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(product.id)}
                                                                className="rounded-md p-1 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 xl:rounded-lg xl:p-1.5"
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 size={15} className="xl:h-4 xl:w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-6">
                    <p className="order-2 text-center text-base text-slate-500 sm:order-1 sm:text-left">
                        {totalItems === 0
                            ? 'No products found'
                            : `Showing ${allProducts.length} of ${totalItems} products`}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 order-1 sm:order-2">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || loading}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-base font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:opacity-50 sm:px-4"
                        >
                            Previous
                        </button>
                        <div className="flex flex-wrap items-center justify-center gap-1 px-1 max-w-full">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    type="button"
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-1 text-sm font-bold transition-all",
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
                            type="button"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || loading}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-base font-medium text-white shadow-md shadow-emerald-100 transition-all hover:bg-emerald-700 disabled:bg-slate-300 disabled:opacity-50 disabled:shadow-none sm:px-4"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* View Product Modal */}
            {selectedProduct && (
                <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                    <div className="admin-modal-center">
                    <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="admin-modal-backdrop"
                        aria-label="Close dialog"
                    />
                    <div className="admin-modal-panel-host relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl sm:rounded-3xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <PackageSearch size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
                                    <p className="text-sm text-slate-500">View complete catalog information</p>
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
                                        <Image
                                            src={resolveProductImageUrl(selectedProduct.image)}
                                            alt={selectedProduct.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover"
                                            unoptimized={productImageUnoptimized(resolveProductImageUrl(selectedProduct.image))}
                                        />
                                    </div>

                                    {/* Additional Images */}
                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2">
                                            {selectedProduct.images.map((img, idx) => {
                                                const thumbSrc = resolveProductImageUrl(img.productImg);
                                                return (
                                                <div
                                                    key={img.id || idx}
                                                    onClick={() => setSelectedProduct(prev => ({ ...prev, image: img.productImg }))}
                                                    className={cn(
                                                        "relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
                                                        selectedProduct.image === img.productImg ? "border-emerald-500 shadow-md shadow-emerald-50" : "border-transparent opacity-60 hover:opacity-100"
                                                    )}
                                                >
                                                    <Image
                                                        src={thumbSrc}
                                                        alt={`Preview ${idx}`}
                                                        fill
                                                        sizes="120px"
                                                        className="object-cover"
                                                        unoptimized={productImageUnoptimized(thumbSrc)}
                                                    />
                                                </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Quick Info Section */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{selectedProduct.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full tracking-wider">
                                                {selectedProduct.category}
                                            </span>
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white rounded-full tracking-wider">
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
                                                <span className="text-xs font-bold tracking-wider">Price (AUD)</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">
                                                {typeof selectedProduct.price === 'number' ? `AUD ${selectedProduct.price.toFixed(2)}` : selectedProduct.price || 'AUD 0.00'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                                <Hash size={14} />
                                                <span className="text-xs font-bold tracking-wider">Stock</span>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <p className="text-lg font-bold text-slate-900">{selectedProduct.stock}</p>
                                                <span className="text-xs text-slate-500 font-medium">{selectedProduct.unit || 'pcs'}</span>
                                            </div>
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
                                            <RotateCcw size={16} className="text-slate-400" />
                                            <span className="font-medium">Returnable:</span>
                                            <span className={cn(
                                                "font-bold  tracking-wide text-xs px-2 py-0.5 rounded-full",
                                                (selectedProduct.isReturnable == 1 || selectedProduct.isReturnable === true) ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                            )}>
                                                {(selectedProduct.isReturnable == 1 || selectedProduct.isReturnable === true) ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="font-medium">Created:</span>
                                            <span className="text-slate-900 font-semibold">{selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleDateString() : '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Info size={16} className="text-slate-400" />
                                            <span className="font-medium">Status:</span>
                                            <span className={cn(
                                                "font-bold  tracking-wide text-xs px-2 py-0.5 rounded-full",
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
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="admin-modal-scroll z-[100]" data-lock-body-scroll role="dialog" aria-modal="true">
                    <div className="admin-modal-center">
                    <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="admin-modal-backdrop-heavy"
                        aria-label="Close preview"
                    />
                    <div
                        className="relative z-10 my-auto max-h-[min(92dvh,56rem)] w-full max-w-4xl overflow-x-hidden overflow-y-auto overscroll-y-contain px-2 sm:px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative aspect-square w-full max-h-[min(85dvh,800px)] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 sm:aspect-video sm:rounded-3xl">
                        <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            sizes="(max-width: 768px) 100vw, 896px"
                            className="object-contain"
                            unoptimized={productImageUnoptimized(previewImage)}
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute right-3 top-3 z-10 rounded-xl border border-white/15 bg-black/40 p-2.5 text-white backdrop-blur-md transition-all hover:bg-black/55 sm:right-5 sm:top-5 sm:p-3"
                            aria-label="Close preview"
                        >
                            <X size={24} />
                        </button>
                    </div>
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
        </div>
    );
}
