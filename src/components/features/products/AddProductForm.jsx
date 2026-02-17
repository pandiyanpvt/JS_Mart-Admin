'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Upload, X, Save, Loader2, Star, Image as ImageIcon, Info, Box, DollarSign, Tag, Archive, Scale } from 'lucide-react';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { productService, categoryService, brandService } from '@/lib/api';


function FormContent() {
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
        weight: '',
        unit: 'kg',
        status: 'active',
        isFeatured: false,
    });
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId);
    const isWeightRequired = selectedCategory?.isWeightBased;


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [cats, brs] = await Promise.all([categoryService.getAll(), brandService.getAll()]);
                setCategories(cats);
                setBrands(brs);

                if (isEditMode) {
                    const product = await productService.getById(productId);

                    setFormData({
                        name: product.productName,
                        categoryId: product.productCategoryId?.toString() || '',
                        brandId: product.brandId?.toString() || '',
                        price: product.price?.toString() || '',
                        description: product.description || '',
                        shortDescription: product.description || '',
                        weight: product.weight || '',
                        unit: 'kg', // Backend doesn't have individual units yet
                        status: product.isActive ? 'active' : 'archived',
                        isFeatured: product.isFeatured || false,
                    });

                    if (product.images && product.images.length > 0) {
                        setImages(product.images.map(img => ({
                            preview: img.productImg,
                            isExisting: true,
                            id: img.id
                        })));
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
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, { file, preview: e.target.result, isExisting: false }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.categoryId) newErrors.category = 'Category is required';
        if (!formData.brandId) newErrors.brand = 'Brand is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';

        // Check if weight is required for weight-based categories
        if (isWeightRequired && (!formData.weight || parseFloat(formData.weight) <= 0)) {
            newErrors.weight = 'Weight is required for this category';
        }

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
                        weight: parseFloat(formData.weight) || null,
                        isActive: formData.status === 'active',
                        isFeatured: formData.isFeatured
                    });
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

                    // Add weight if provided
                    if (formData.weight) {
                        productFormData.append('weight', formData.weight);
                    }

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
                alert(error.message || 'Synchronization failed. Check network logs.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-emerald-600" size={48} />
                <p className="text-slate-500 font-bold">Synchronizing product data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/products"
                        className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-2xl transition-all shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isEditMode ? 'Modify Product' : 'Add Product'}</h1>
                        <p className="text-slate-500 text-sm font-medium">{isEditMode ? 'Update existing product information' : 'Fill in the information below to add a new product'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/products"
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Discard
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSubmitting ? 'Syncing...' : isEditMode ? 'Save Changes' : 'Add Product'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Info size={20} /></div>
                            Basic Information
                        </h2>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Title</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter premium product name..."
                                    className={cn(
                                        "w-full px-6 py-4 bg-slate-50 border rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all outline-none",
                                        errors.name ? "border-rose-300 bg-rose-50" : "border-slate-100"
                                    )}
                                />
                                {errors.name && <p className="text-[10px] font-bold text-rose-600 mt-1 pl-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Provide detailed product characteristics..."
                                    rows="8"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Module */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><ImageIcon size={20} /></div>
                            Product Images
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden border border-slate-200 group ring-4 ring-transparent hover:ring-emerald-500/10 transition-all">
                                    <Image src={img.preview} alt="" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-[1.5rem] cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group text-slate-400 hover:text-emerald-600">
                                <Upload size={28} className="mb-2 group-hover:-translate-y-1 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">New Asset</span>
                                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column - Logistics */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><DollarSign size={20} /></div>
                            Price and Stock
                        </h2>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Standard Unit MRP (AUD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">AUD</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    className={cn(
                                        "w-full pl-12 pr-6 py-4 bg-slate-50 border rounded-2xl text-sm font-black focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none",
                                        errors.price ? "border-rose-300" : "border-slate-100"
                                    )}
                                />
                            </div>
                            {errors.price && <p className="text-[10px] font-bold text-rose-600 mt-1 pl-1">{errors.price}</p>}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Tag size={20} /></div>
                            Categorization
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Categorical Group</label>
                                <select
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="">Choose Category...</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.category}</option>)}
                                </select>
                            </div>

                            {isWeightRequired && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                        <Scale size={12} />
                                        Weight Measurement Required (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.001"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 1.250"
                                        className={cn(
                                            "w-full px-6 py-4 bg-rose-50/30 border rounded-2xl text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/50 transition-all",
                                            errors.weight ? "border-rose-300" : "border-rose-100"
                                        )}
                                    />
                                    {errors.weight && <p className="text-[10px] font-bold text-rose-600 mt-1 pl-1">{errors.weight}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brand Affiliation</label>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="">Choose Brand...</option>
                                    {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.brand}</option>)}
                                </select>
                            </div>

                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Star size={16} className={formData.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
                                Featured Product
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Showcase on Home</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="sr-only peer" />
                            <div className="w-12 h-6 bg-slate-100 rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all shadow-inner"></div>
                        </label>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function AddProductForm() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold">Initializing interface...</div>}>
            <FormContent />
        </Suspense>
    );
}
