'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { ArrowLeft, Upload, X, Save, Loader2, Star, Image as ImageIcon, RotateCcw, Plus, Tag, CheckCircle2, ShieldCheck } from 'lucide-react';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { productService, categoryService, brandService } from '@/lib/api';
import { IMAGE_SPECS, validateImageFileSize, getCropAspectForSpec } from '@/lib/imageSpecs';
import { pickOutputMime } from '@/lib/cropImage';
import { useModal } from '@/components/providers/ModalProvider';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useQueuedImageCrop } from '@/hooks/useQueuedImageCrop';
import { useSingleImageCrop } from '@/hooks/useSingleImageCrop';


function FormContent() {
    const productCrop = useQueuedImageCrop();
    const categoryCrop = useSingleImageCrop();
    const brandCrop = useSingleImageCrop();
    const { showAlert } = useModal();
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const isEditMode = !!productId;

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        brandId: '',
        price: '',
        description: '',
        shortDescription: '',
        status: 'active',
        isFeatured: false,
        isReturnable: true,
    });
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showBrandPopup, setShowBrandPopup] = useState(false);
    const [newCategoryForm, setNewCategoryForm] = useState({
        category: '',
        isActive: true,
        level: 1,
        parentId: '',
    });
    const [newBrandName, setNewBrandName] = useState('');
    const [newBrandActive, setNewBrandActive] = useState(true);
    const [newBrandImage, setNewBrandImage] = useState(null);
    const [newBrandPreview, setNewBrandPreview] = useState(null);
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [newBannerImage, setNewBannerImage] = useState(null);
    const [newCategoryPreview, setNewCategoryPreview] = useState(null);
    const [newBannerPreview, setNewBannerPreview] = useState(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [nameSuggestOpen, setNameSuggestOpen] = useState(false);
    const nameFieldRef = useRef(null);
    /** DB image ids loaded in edit mode — used on save to DELETE any the user removed from the grid */
    const initialExistingImageIdsRef = useRef([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, brs, products] = await Promise.all([
                    categoryService.getAll(),
                    brandService.getAll(),
                    productService.getAll().catch(() => []),
                ]);
                setCategories(cats);
                setBrands(brs);
                setCatalogProducts(Array.isArray(products) ? products : []);

                if (!isEditMode) {
                    initialExistingImageIdsRef.current = [];
                    setImages([]);
                }

                if (isEditMode) {
                    const product = await productService.getById(productId);

                    setFormData({
                        name: product.productName,
                        categoryId: product.productCategoryId?.toString() || '',
                        brandId: product.brandId?.toString() || '',
                        price: product.price?.toString() || '',
                        description: product.description || '',
                        shortDescription: product.description || '',
                        status: product.isActive ? 'active' : 'archived',
                        isFeatured: product.isFeatured || false,
                        isReturnable: product.isReturnable === true || product.isReturnable === 1,
                    });

                    if (product.images && product.images.length > 0) {
                        initialExistingImageIdsRef.current = product.images.map((img) => img.id).filter(Boolean);
                        setImages(product.images.map(img => ({
                            preview: img.productImg,
                            isExisting: true,
                            id: img.id
                        })));
                    } else {
                        initialExistingImageIdsRef.current = [];
                    }
                }

            } catch (error) {
                console.error('Failed to load initial data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [isEditMode, productId]);

    const productDisplayName = (p) => (p?.productName || p?.name || '').trim();

    const nameMatches = useMemo(() => {
        const q = formData.name.trim().toLowerCase();
        if (q.length < 1) return [];
        return catalogProducts
            .filter((p) => {
                const n = productDisplayName(p).toLowerCase();
                if (!n.includes(q)) return false;
                if (isEditMode && String(p.id) === String(productId)) return false;
                return true;
            })
            .slice(0, 12);
    }, [catalogProducts, formData.name, isEditMode, productId]);

    const exactNameDuplicate = useMemo(() => {
        const q = formData.name.trim().toLowerCase();
        if (!q) return null;
        return (
            catalogProducts.find((p) => {
                const n = productDisplayName(p).toLowerCase();
                return n === q && (!isEditMode || String(p.id) !== String(productId));
            }) || null
        );
    }, [catalogProducts, formData.name, isEditMode, productId]);

    useEffect(() => {
        const onDoc = (e) => {
            if (nameFieldRef.current && !nameFieldRef.current.contains(e.target)) {
                setNameSuggestOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        const validFiles = [];
        for (const file of files) {
            const { valid, message } = validateImageFileSize(file, 'productImages');
            if (!valid) {
                showAlert('Upload Error', message, 'error');
                continue;
            }
            validFiles.push(file);
        }
        if (validFiles.length) productCrop.enqueue(validFiles);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        else if (!isEditMode && exactNameDuplicate) {
            newErrors.name =
                'This product name is already in your catalog. Use a different name or edit the existing product.';
        }
        if (!formData.categoryId) newErrors.category = 'Category is required';
        if (!formData.brandId) newErrors.brand = 'Brand is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                let savedProduct;

                if (isEditMode) {
                    savedProduct = await productService.update(productId, {
                        productName: formData.name,
                        productCategoryId: parseInt(formData.categoryId),
                        brandId: parseInt(formData.brandId),
                        price: parseFloat(formData.price),
                        description: formData.description,
                        isActive: formData.status === 'active',
                        isFeatured: formData.isFeatured,
                        isReturnable: formData.isReturnable
                    });

                    const remainingIds = new Set(
                        images.filter((img) => img.isExisting && img.id).map((img) => img.id)
                    );
                    const removedImageIds = initialExistingImageIdsRef.current.filter((id) => !remainingIds.has(id));
                    for (const imageId of removedImageIds) {
                        await productService.deleteImage(imageId);
                    }
                } else {

                    // CREATE flow - Use FormData as per user's image 0
                    const productFormData = new FormData();
                    productFormData.append('productName', formData.name);
                    productFormData.append('productCategoryId', formData.categoryId);
                    productFormData.append('brandId', formData.brandId);
                    productFormData.append('price', formData.price);
                    productFormData.append('quantity', '0'); // Default to 0, managed via batches
                    productFormData.append('description', formData.description);
                    productFormData.append('isFeatured', formData.isFeatured ? '1' : '0');
                    productFormData.append('isReturnable', formData.isReturnable ? '1' : '0');

                    savedProduct = await productService.create(productFormData);
                }

                const finalProductId = isEditMode ? productId : savedProduct.id;

                // 2. Handle Image Uploads for New Assets (matches image 1)
                const newImages = images.filter(img => !img.isExisting);
                if (newImages.length > 0) {
                    for (let i = 0; i < newImages.length; i++) {
                        const img = newImages[i];
                        const imgFormData = new FormData();
                        imgFormData.append('image', img.file);
                        imgFormData.append('isPrimary', i === 0 ? 'true' : 'false');

                        await productService.uploadImage(finalProductId, imgFormData);
                    }
                }

                router.push('/products');
                router.refresh();
            } catch (error) {
                console.error('Submission failed:', error);
                showAlert('Submission Failed', error.message || 'Product synchronization failed. Check your network and try again.', 'error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const potentialCategoryParents = useMemo(() => {
        if (newCategoryForm.level <= 1) return [];
        return categories.filter((cat) => Number(cat.level || 1) === Number(newCategoryForm.level) - 1);
    }, [categories, newCategoryForm.level]);

    const resetCategoryPopup = () => {
        setShowCategoryPopup(false);
        setNewCategoryForm({
            category: '',
            isActive: true,
            level: 1,
            parentId: '',
        });
        setNewCategoryImage(null);
        setNewBannerImage(null);
        setNewCategoryPreview(null);
        setNewBannerPreview(null);
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        const name = newCategoryForm.category.trim();
        if (!name) return;
        setIsCreatingCategory(true);
        try {
            const payload = new FormData();
            payload.append('category', name);
            payload.append('isActive', String(!!newCategoryForm.isActive));
            payload.append('level', String(newCategoryForm.level));
            if (newCategoryForm.level > 1 && newCategoryForm.parentId) {
                payload.append('parentId', String(newCategoryForm.parentId));
            }
            if (newCategoryImage) payload.append('categoryImg', newCategoryImage);
            if (newBannerImage) payload.append('bannerImg', newBannerImage);
            const created = await categoryService.create(payload);
            const refreshed = await categoryService.getAll();
            setCategories(refreshed);
            const createdId = created?.id || refreshed.find((c) => String(c.category || '').toLowerCase() === name.toLowerCase())?.id;
            if (createdId) {
                setFormData((prev) => ({ ...prev, categoryId: String(createdId) }));
            }
            resetCategoryPopup();
        } catch (error) {
            showAlert('Create Category Failed', error.message || 'Unable to create category now.', 'error');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    const resetBrandPopup = () => {
        if (newBrandPreview && String(newBrandPreview).startsWith('blob:')) {
            URL.revokeObjectURL(newBrandPreview);
        }
        setShowBrandPopup(false);
        setNewBrandName('');
        setNewBrandActive(true);
        setNewBrandImage(null);
        setNewBrandPreview(null);
    };

    const handleBrandImageChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const check = validateImageFileSize(file, 'brandImages');
        if (!check.valid) {
            showAlert('Upload Error', check.message, 'error');
            return;
        }
        brandCrop.open(file, 'brandImages');
    };

    const handleCategoryImageChange = (e, type) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const specKey = type === 'category' ? 'categoryImages' : 'categoryBanner';
        const check = validateImageFileSize(file, specKey);
        if (!check.valid) {
            showAlert('Upload Error', check.message, 'error');
            return;
        }
        categoryCrop.open(file, specKey);
    };

    const handleCreateBrand = async (e) => {
        e.preventDefault();
        const brand = newBrandName.trim();
        if (!brand) return;
        setIsCreatingBrand(true);
        try {
            const payload = new FormData();
            payload.append('brand', brand);
            payload.append('isActive', String(!!newBrandActive));
            if (newBrandImage) payload.append('brandImg', newBrandImage);
            const created = await brandService.create(payload);
            const refreshed = await brandService.getAll();
            setBrands(refreshed);
            const createdId = created?.id || refreshed.find((b) => String(b.brand || '').toLowerCase() === brand.toLowerCase())?.id;
            if (createdId) {
                setFormData((prev) => ({ ...prev, brandId: String(createdId) }));
            }
            resetBrandPopup();
        } catch (error) {
            showAlert('Create Brand Failed', error.message || 'Unable to create brand now.', 'error');
        } finally {
            setIsCreatingBrand(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="font-bold text-neutral-900">Synchronizing product data...</p>
            </div>
        );
    }

    const fieldLabel = 'text-xs font-semibold  tracking-wide text-neutral-900';
    const inputBase =
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-neutral-900 placeholder:text-neutral-600 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25';

    return (
        <div className="w-full min-w-0 max-w-full pb-28 sm:pb-32">
            {/* Page header — no primary action here */}
            <div className="mb-8 flex flex-wrap items-start gap-4">
                <Link
                    href="/products"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-neutral-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    aria-label="Back to products"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="min-w-0 flex-1">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
                        {isEditMode ? 'Modify product' : 'Add product'}
                    </h1>
                    <p className="mt-1 text-base text-neutral-900">
                        {isEditMode
                            ? 'Update catalog details below, then save.'
                            : 'One form for details, pricing, category, and images.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="divide-y divide-slate-100">
                    {/* Product details */}
                    <section className="p-6 sm:p-8">
                        <h2 className="mb-6 text-sm font-semibold tracking-wide text-neutral-900">Product details</h2>
                        <div className="space-y-6">
                            <div className="space-y-2" ref={nameFieldRef}>
                                <label htmlFor="product-name" className={fieldLabel}>
                                    Product name
                                </label>
                                <div className="relative">
                                    <input
                                        id="product-name"
                                        type="text"
                                        name="name"
                                        autoComplete="off"
                                        value={formData.name}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setNameSuggestOpen(true);
                                        }}
                                        onFocus={() => setNameSuggestOpen(true)}
                                        placeholder="e.g. Organic carrots 1kg"
                                        className={cn(
                                            inputBase,
                                            exactNameDuplicate && 'border-amber-400 ring-2 ring-amber-200',
                                            errors.name && 'border-rose-400 ring-2 ring-rose-100'
                                        )}
                                        aria-expanded={nameSuggestOpen && nameMatches.length > 0}
                                        aria-controls="product-name-suggestions"
                                    />
                                    {nameSuggestOpen && nameMatches.length > 0 && (
                                        <div
                                            id="product-name-suggestions"
                                            role="listbox"
                                            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                                        >
                                            <p className="px-3 py-2 text-xs font-semibold tracking-wide text-neutral-900">
                                                Matching products in catalog
                                            </p>
                                            {nameMatches.map((p) => {
                                                const label = productDisplayName(p);
                                                const exact =
                                                    label.toLowerCase() === formData.name.trim().toLowerCase();
                                                return (
                                                    <div
                                                        key={p.id}
                                                        role="option"
                                                        className={cn(
                                                            'flex w-full items-center gap-2 px-2 py-1 hover:bg-slate-50',
                                                            exact && 'bg-amber-50/80'
                                                        )}
                                                    >
                                                        <button
                                                            type="button"
                                                            className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm font-medium text-neutral-900"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                setFormData((prev) => ({ ...prev, name: label }));
                                                                setNameSuggestOpen(false);
                                                                setErrors((er) => ({ ...er, name: '' }));
                                                            }}
                                                        >
                                                            {label}
                                                            {exact ? (
                                                                <span className="ml-2 inline-block rounded-md bg-amber-200 px-2 py-0.5 text-xs font-bold text-neutral-900">
                                                                    Same name
                                                                </span>
                                                            ) : null}
                                                        </button>
                                                        <Link
                                                            href={`/products/add?id=${p.id}`}
                                                            className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => setNameSuggestOpen(false)}
                                                        >
                                                            Edit
                                                        </Link>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {exactNameDuplicate && !errors.name && (
                                    <p className="text-sm font-semibold text-amber-800">
                                        This name already exists. Pick another name or choose the match above to adjust
                                        spelling, then save from the product list.
                                    </p>
                                )}
                                {errors.name && <p className="text-sm font-medium text-rose-600">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="product-description" className={fieldLabel}>
                                    Description
                                </label>
                                <textarea
                                    id="product-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe the product for customers…"
                                    rows={6}
                                    className={cn(inputBase, 'resize-y min-h-[140px]')}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Price, category, brand */}
                    <section className="p-6 sm:p-8">
                        <h2 className="mb-6 text-sm font-semibold tracking-wide text-neutral-900">Pricing &amp; catalog</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="space-y-2 md:col-span-1">
                                <label htmlFor="product-price" className={fieldLabel}>
                                    Price (AUD)
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold tracking-wide text-neutral-900">
                                        AUD
                                    </span>
                                    <input
                                        id="product-price"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className={cn(inputBase, 'pl-14', errors.price && 'border-rose-300 bg-rose-50/50')}
                                    />
                                </div>
                                {errors.price && <p className="text-sm font-medium text-rose-600">{errors.price}</p>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="product-category" className={fieldLabel}>
                                    Category
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="product-category"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className={cn(inputBase, 'cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10')}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23171717' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                        }}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.category}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryPopup(true)}
                                        className="inline-flex h-12 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-slate-50"
                                        title="Add category"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="product-brand" className={fieldLabel}>
                                    Brand
                                </label>
                                <div className="flex items-center gap-2">
                                    <select
                                        id="product-brand"
                                        name="brandId"
                                        value={formData.brandId}
                                        onChange={handleInputChange}
                                        className={cn(inputBase, 'cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10')}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23171717' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                        }}
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.id} value={brand.id}>
                                                {brand.brand}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowBrandPopup(true)}
                                        className="inline-flex h-12 shrink-0 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-slate-50"
                                        title="Add brand"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Options */}
                    <section className="p-6 sm:p-8">
                        <h2 className="mb-6 text-sm font-semibold tracking-wide text-neutral-900">Store options</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Star
                                        className={cn(
                                            'h-5 w-5 shrink-0',
                                            formData.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-neutral-800'
                                        )}
                                    />
                                    <div>
                                        <p className="font-semibold text-neutral-950">Featured</p>
                                        <p className="text-sm text-neutral-900">Show on home</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                        className="peer sr-only"
                                    />
                                    <div className="relative h-7 w-12 shrink-0 rounded-full bg-slate-200 shadow-inner transition-colors after:pointer-events-none after:absolute after:left-0.5 after:top-0.5 after:block after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5" />
                                </label>
                            </div>
                            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <RotateCcw
                                        className={cn(
                                            'h-5 w-5 shrink-0',
                                            formData.isReturnable ? 'text-emerald-600' : 'text-neutral-800'
                                        )}
                                    />
                                    <div>
                                        <p className="font-semibold text-neutral-950">Returnable</p>
                                        <p className="text-sm text-neutral-900">Customers may return</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        name="isReturnable"
                                        checked={formData.isReturnable}
                                        onChange={handleInputChange}
                                        className="peer sr-only"
                                    />
                                    <div className="relative h-7 w-12 shrink-0 rounded-full bg-slate-200 shadow-inner transition-colors after:pointer-events-none after:absolute after:left-0.5 after:top-0.5 after:block after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-5" />
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Images */}
                    <section className="p-6 sm:p-8">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-neutral-900" />
                            <h2 className="text-sm font-semibold tracking-wide text-neutral-900">Product images</h2>
                        </div>
                        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-neutral-950">
                            <span className="font-semibold">Recommended:</span>{' '}
                            {IMAGE_SPECS.productImages.width}×{IMAGE_SPECS.productImages.height}px, max{' '}
                            {IMAGE_SPECS.productImages.maxFileSizeLabel}. {IMAGE_SPECS.productImages.formats}.
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                            {images.map((img, index) => (
                                <div
                                    key={img.isExisting && img.id ? `existing-${img.id}` : `new-${index}`}
                                    className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                                >
                                    <Image src={img.preview} alt="" fill sizes="(max-width:768px) 50vw, 120px" className="object-cover" unoptimized={typeof img.preview === 'string' && img.preview.startsWith('data:')} />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute right-2 top-2 z-10 rounded-lg bg-rose-600 p-1.5 text-white shadow-md ring-2 ring-white/90 transition hover:bg-rose-700"
                                        aria-label="Remove image from product"
                                        title="Remove image"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-neutral-900 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-neutral-950">
                                <Upload className="mb-2 h-8 w-8" />
                                <span className="text-xs font-semibold tracking-wide">Add images</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </section>
                </div>

                {/* Bottom actions */}
                <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
                    <Link
                        href="/products"
                        className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-neutral-900 shadow-sm transition hover:bg-slate-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 text-base font-semibold text-white shadow-md shadow-emerald-200/50 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        {isSubmitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Add product'}
                    </button>
                </div>
            </form>
            {productCrop.cropOpen && (
                <ImageCropModal
                    key={productCrop.cropSrc}
                    open
                    imageSrc={productCrop.cropSrc}
                    title="Crop product image"
                    aspect={getCropAspectForSpec('productImages')}
                    mimeType={pickOutputMime(productCrop.cropMimeType)}
                    originalFileName={productCrop.cropFileName}
                    onClose={() => productCrop.finishCrop()}
                    onComplete={(file) => {
                        const { valid, message } = validateImageFileSize(file, 'productImages');
                        if (!valid) {
                            showAlert('Upload Error', message, 'error');
                            productCrop.finishCrop();
                            return;
                        }
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            setImages((prev) => [...prev, { file, preview: ev.target.result, isExisting: false }]);
                        };
                        reader.readAsDataURL(file);
                        productCrop.finishCrop();
                    }}
                />
            )}
            {categoryCrop.isOpen && categoryCrop.target && (
                <ImageCropModal
                    key={categoryCrop.target.src}
                    open
                    imageSrc={categoryCrop.target.src}
                    title={categoryCrop.target.specKey === 'categoryImages' ? 'Crop category icon' : 'Crop category banner'}
                    aspect={getCropAspectForSpec(categoryCrop.target.specKey)}
                    mimeType={pickOutputMime(categoryCrop.target.mime)}
                    originalFileName={categoryCrop.target.fileName}
                    onClose={() => categoryCrop.close()}
                    onComplete={(file) => {
                        const sk = categoryCrop.target.specKey;
                        const check = validateImageFileSize(file, sk);
                        if (!check.valid) {
                            showAlert('Upload Error', check.message, 'error');
                            categoryCrop.close();
                            return;
                        }
                        if (sk === 'categoryImages') {
                            setNewCategoryImage(file);
                            setNewCategoryPreview(URL.createObjectURL(file));
                        } else {
                            setNewBannerImage(file);
                            setNewBannerPreview(URL.createObjectURL(file));
                        }
                        categoryCrop.close();
                    }}
                />
            )}
            {brandCrop.isOpen && brandCrop.target && (
                <ImageCropModal
                    key={brandCrop.target.src}
                    open
                    imageSrc={brandCrop.target.src}
                    title="Crop brand logo"
                    aspect={getCropAspectForSpec('brandImages')}
                    mimeType={pickOutputMime(brandCrop.target.mime)}
                    originalFileName={brandCrop.target.fileName}
                    onClose={() => brandCrop.close()}
                    onComplete={(file) => {
                        const check = validateImageFileSize(file, 'brandImages');
                        if (!check.valid) {
                            showAlert('Upload Error', check.message, 'error');
                            brandCrop.close();
                            return;
                        }
                        if (newBrandPreview && String(newBrandPreview).startsWith('blob:')) {
                            URL.revokeObjectURL(newBrandPreview);
                        }
                        setNewBrandImage(file);
                        setNewBrandPreview(URL.createObjectURL(file));
                        brandCrop.close();
                    }}
                />
            )}
            <AnimatePresence>
                {showCategoryPopup && (
                    <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                        <div className="admin-modal-center">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={resetCategoryPopup}
                                className="admin-modal-backdrop"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="admin-modal-panel-host relative w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[3rem]"
                            >
                        <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                    <Tag size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight text-slate-900">New Hierarchy</h3>
                                    <p className="text-sm font-semibold tracking-[0.2em] text-slate-400">Category &amp; Sub-category settings</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetCategoryPopup}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:bg-slate-50"
                                aria-label="Close add category popup"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-[0.25em] text-slate-400">Category Name</label>
                                        <input
                                            type="text"
                                            value={newCategoryForm.category}
                                            onChange={(e) => setNewCategoryForm((prev) => ({ ...prev, category: e.target.value }))}
                                            placeholder="e.g. Fresh Vegetables"
                                            autoFocus
                                            className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-4 text-xl font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-[0.25em] text-slate-400">Level</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map((lvl) => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() =>
                                                        setNewCategoryForm((prev) => ({ ...prev, level: lvl, parentId: '' }))
                                                    }
                                                    className={cn(
                                                        "h-12 rounded-2xl border text-sm font-black tracking-[0.2em] transition",
                                                        newCategoryForm.level === lvl
                                                            ? "border-slate-900 bg-slate-900 text-white"
                                                            : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
                                                    )}
                                                >
                                                    L{lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {newCategoryForm.level > 1 && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black tracking-[0.25em] text-slate-400">Parent Category</label>
                                            <select
                                                value={newCategoryForm.parentId}
                                                onChange={(e) => setNewCategoryForm((prev) => ({ ...prev, parentId: e.target.value }))}
                                                required
                                                className={cn(inputBase, 'cursor-pointer')}
                                            >
                                                <option value="">Select parent</option>
                                                {potentialCategoryParents.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">Active Status</p>
                                                <p className="text-sm font-semibold text-slate-400">Visible in catalog</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                checked={newCategoryForm.isActive}
                                                onChange={(e) =>
                                                    setNewCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))
                                                }
                                                className="peer sr-only"
                                            />
                                            <div className="h-8 w-14 rounded-full bg-slate-200 transition peer-checked:bg-indigo-600 after:absolute after:left-[3px] after:top-[3px] after:h-6 after:w-6 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-6" />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-[0.25em] text-slate-400">Category Image</label>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                                            <p className="text-xs font-black text-amber-800">Image size (before adding)</p>
                                            <p className="text-xs font-semibold text-amber-900">
                                                {IMAGE_SPECS.categoryImages.width}x{IMAGE_SPECS.categoryImages.height} px, max {IMAGE_SPECS.categoryImages.maxFileSizeLabel}
                                            </p>
                                        </div>
                                        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-white">
                                            {newCategoryPreview ? <img src={newCategoryPreview} alt="Icon" className="h-full w-full rounded-3xl object-cover" /> : (
                                                <>
                                                    <Upload className="mb-2 h-7 w-7" />
                                                    <span className="text-lg font-black tracking-[0.18em]">Icon (Square)</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                onChange={(e) => handleCategoryImageChange(e, 'category')}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black tracking-[0.25em] text-slate-400">Banner Image</label>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                                            <p className="text-xs font-black text-amber-800">Image size (before adding)</p>
                                            <p className="text-xs font-semibold text-amber-900">
                                                {IMAGE_SPECS.banners.width}x{IMAGE_SPECS.banners.height} px, max {IMAGE_SPECS.banners.maxFileSizeLabel}
                                            </p>
                                        </div>
                                        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:bg-white">
                                            {newBannerPreview ? <img src={newBannerPreview} alt="Banner" className="h-full w-full rounded-3xl object-cover" /> : (
                                                <>
                                                    <ImageIcon className="mb-2 h-7 w-7" />
                                                    <span className="text-lg font-black tracking-[0.12em]">Wide Hero Banner</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                onChange={(e) => handleCategoryImageChange(e, 'banner')}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={resetCategoryPopup}
                                    className="inline-flex h-14 flex-1 items-center justify-center rounded-3xl border border-slate-200 bg-white text-2xl font-black tracking-[0.2em] text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingCategory || !newCategoryForm.category.trim() || (newCategoryForm.level > 1 && !newCategoryForm.parentId)}
                                    className="inline-flex h-14 flex-[2] items-center justify-center gap-3 rounded-3xl bg-slate-900 text-xl font-black tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isCreatingCategory ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                    Create Category
                                </button>
                            </div>
                        </form>
                            </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showBrandPopup && (
                    <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                        <div className="admin-modal-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetBrandPopup}
                            className="admin-modal-backdrop"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="admin-modal-panel-host relative w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[3rem]"
                        >
                        <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900">Add Brand</h3>
                                    <p className="mt-0.5 text-xs font-bold tracking-widest text-slate-500 opacity-70">Brand Details &amp; Settings</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetBrandPopup}
                                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm transition hover:bg-slate-50"
                                aria-label="Close add brand popup"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBrand} className="space-y-8 p-10">
                            <div className="space-y-2">
                                <label className="pl-1 text-xs font-black tracking-widest text-slate-400">Brand Name</label>
                                <input
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="Enter official brand partner..."
                                    autoFocus
                                    className="w-full rounded-[1.5rem] border border-slate-100 bg-slate-50 px-6 py-5 text-sm font-black outline-none transition-all focus:border-indigo-500/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="pl-1 text-xs font-black tracking-widest text-slate-400">Brand Logo</label>
                                <div className="mb-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                                    <p className="mb-1 text-xs font-black tracking-wider text-amber-800">Image size (before adding)</p>
                                    <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.brandImages.width}x{IMAGE_SPECS.brandImages.height} px, max {IMAGE_SPECS.brandImages.maxFileSizeLabel}. {IMAGE_SPECS.brandImages.formats}.</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleBrandImageChange}
                                    className="hidden"
                                    id="new-brand-image-upload"
                                />
                                <label
                                    htmlFor="new-brand-image-upload"
                                    className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-5 text-sm font-black text-slate-600 transition-all hover:border-indigo-300 hover:bg-white"
                                >
                                    <Upload size={20} className="text-slate-400" />
                                    <span>{newBrandImage ? newBrandImage.name : 'Upload Brand Logo'}</span>
                                </label>
                                {newBrandPreview && (
                                    <div className="relative mx-auto mt-4 h-32 w-32 overflow-hidden rounded-2xl border-2 border-slate-200">
                                        <img src={newBrandPreview} alt="Brand logo preview" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newBrandPreview && String(newBrandPreview).startsWith('blob:')) {
                                                    URL.revokeObjectURL(newBrandPreview);
                                                }
                                                setNewBrandImage(null);
                                                setNewBrandPreview(null);
                                            }}
                                            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                            title="Remove logo"
                                            aria-label="Remove brand logo"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="group flex items-center justify-between rounded-[2rem] border border-slate-100 bg-slate-50 p-6 transition-all duration-500 hover:border-emerald-100 hover:bg-white hover:shadow-lg hover:shadow-emerald-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition-colors group-hover:text-emerald-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Verified Status</p>
                                        <p className="text-xs font-bold tracking-tight text-slate-400">Active for procurement</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={newBrandActive}
                                        onChange={(e) => setNewBrandActive(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="h-6 w-12 rounded-full bg-slate-200 shadow-inner after:absolute after:left-[4px] after:top-[4px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={resetBrandPopup}
                                    className="flex-1 rounded-[1.5rem] border border-slate-200 bg-white py-5 text-xs font-black tracking-[0.2em] text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingBrand || !newBrandName.trim()}
                                    className="flex flex-[2] items-center justify-center gap-3 rounded-[1.5rem] bg-slate-900 py-5 text-xs font-black tracking-[0.2em] text-white shadow-2xl shadow-slate-200 transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isCreatingBrand ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                                    {isCreatingBrand ? 'Syncing...' : 'Add Brand'}
                                </button>
                            </div>
                        </form>
                        </motion.div>
                        </div>
                </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AddProductForm() {
    return (
        <Suspense fallback={<div className="flex min-h-[320px] w-full items-center justify-start p-6 font-bold text-neutral-900">Initializing interface...</div>}>
            <FormContent />
        </Suspense>
    );
}
