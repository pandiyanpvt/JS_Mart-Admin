'use client';

import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Save, Loader2, Star, Image as ImageIcon, Info, Box, DollarSign, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { saveProduct } from '@/lib/products';

export default function AddProductForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        comparePrice: '',
        stock: '',
        minStock: '',
        description: '',
        shortDescription: '',
        weight: '',
        unit: 'kg',
        status: 'active',
        featured: false,
    });
    const [images, setImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Vegetables', 'Fruits', 'Dairy', 'Baby Products', 'Bakery', 'Beverages', 'Snacks', 'Meat', 'Seafood'];

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
                setImages(prev => [...prev, { file, preview: e.target.result }]);
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
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
        if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const imageData = await Promise.all(
                    images.map(img => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                resolve({
                                    data: e.target.result,
                                    name: img.file.name,
                                    type: img.file.type
                                });
                            };
                            reader.readAsDataURL(img.file);
                        });
                    })
                );

                const productData = {
                    ...formData,
                    image: imageData.length > 0 ? imageData[0].data : null,
                    images: imageData,
                };

                const savedProduct = saveProduct(productData);

                if (savedProduct) {
                    router.push('/products');
                } else {
                    throw new Error('Failed to save product');
                }
            } catch (error) {
                console.error('Error saving product:', error);
                alert('Failed to save product. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const generateSKU = () => {
        const prefix = 'PROD-';
        const random = Math.floor(Math.random() * 9000) + 1000;
        setFormData(prev => ({ ...prev, sku: prefix + random }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/products"
                        className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-xl transition-all shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Add Product</h1>
                        <p className="text-slate-500 text-sm">Create a new item in your inventory.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/products"
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Info size={20} className="text-emerald-600" />
                            Basic Information
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Product Name <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Organic Bananas"
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none",
                                        errors.name ? "border-rose-300 bg-rose-50" : "border-slate-200"
                                    )}
                                />
                                {errors.name && <p className="text-xs font-bold text-rose-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Short Description</label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleInputChange}
                                    placeholder="Brief summary for cards and lists..."
                                    rows="2"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Full Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Detailed product information..."
                                    rows="6"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ImageIcon size={20} className="text-blue-600" />
                            Product Images
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                        <Image
                                            src={img.preview}
                                            alt={`Preview ${index}`}
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group text-slate-400 hover:text-emerald-600">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-[10px] font-bold uppercase">Upload</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500">
                                Upload high-quality images. First image will be the cover.
                            </p>
                        </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <DollarSign size={20} className="text-amber-600" />
                            Pricing & Inventory
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Price ($) <span className="text-rose-500">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none",
                                        errors.price ? "border-rose-300 bg-rose-50" : "border-slate-200"
                                    )}
                                />
                                {errors.price && <p className="text-xs font-bold text-rose-600">{errors.price}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Compare Price ($)</label>
                                <input
                                    type="number"
                                    name="comparePrice"
                                    value={formData.comparePrice}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Stock Quantity <span className="text-rose-500">*</span></label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none",
                                        errors.stock ? "border-rose-300 bg-rose-50" : "border-slate-200"
                                    )}
                                />
                                {errors.stock && <p className="text-xs font-bold text-rose-600">{errors.stock}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Low Stock Alert</label>
                                <input
                                    type="number"
                                    name="minStock"
                                    value={formData.minStock}
                                    onChange={handleInputChange}
                                    placeholder="10"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Organization */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Status */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Box size={20} className="text-purple-600" />
                            Organization
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">SKU (Stock Keeping Unit) <span className="text-rose-500">*</span></label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleInputChange}
                                        placeholder="PROD-001"
                                        className={cn(
                                            "flex-1 px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none",
                                            errors.sku ? "border-rose-300 bg-rose-50" : "border-slate-200"
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateSKU}
                                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Auto
                                    </button>
                                </div>
                                {errors.sku && <p className="text-xs font-bold text-rose-600">{errors.sku}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Category <span className="text-rose-500">*</span></label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={cn(
                                        "w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none",
                                        errors.category ? "border-rose-300 bg-rose-50" : "border-slate-200"
                                    )}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <p className="text-xs font-bold text-rose-600">{errors.category}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Weight</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                    />
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="g">g</option>
                                        <option value="lb">lb</option>
                                        <option value="oz">oz</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Star size={16} className={formData.featured ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
                                Featured Product
                            </p>
                            <p className="text-xs text-slate-500">Show on homepage</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>
                </div>
            </form>
        </div>
    );
}


