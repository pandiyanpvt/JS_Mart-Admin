'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Image as ImageIcon,
    Layout,
    Upload

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { brandService } from '@/lib/api';
import { IMAGE_SPECS } from '@/lib/imageSpecs';
import * as XLSX from 'xlsx';

export default function BrandsView() {
    const [allBrands, setAllBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        brand: '',
        isActive: true
    });
    const [brandImage, setBrandImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);


    const loadBrands = async () => {
        try {
            setLoading(true);
            const data = await brandService.getAll();
            setAllBrands(data);
        } catch (error) {
            console.error('Failed to load brands:', error);
            showNotification('Failed to load brands', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredBrands = allBrands.filter(b =>
        (b.brand || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                brand: brand.brand,
                isActive: brand.isActive
            });
            setImagePreview(brand.brandImg);
            setBrandImage(null);
        } else {
            setEditingBrand(null);
            setFormData({ brand: '', isActive: true });
            setImagePreview(null);
            setBrandImage(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.brand.trim()) return;

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('brand', formData.brand);
            submitData.append('isActive', formData.isActive);
            if (brandImage) {
                submitData.append('brandImg', brandImage);
            }

            if (editingBrand) {
                await brandService.update(editingBrand.id, submitData);
                showNotification('Brand updated successfully');
            } else {
                await brandService.create(submitData);
                showNotification('Brand created successfully');
            }
            setIsModalOpen(false);
            loadBrands();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                await brandService.delete(id);
                showNotification('Brand deleted successfully');
                loadBrands();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const handleExport = () => {
        const dataToExport = allBrands.map(b => ({
            'ID': b.id,
            'Brand Name': b.brand,
            'Created At': new Date(b.createdAt).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Brands");
        XLSX.writeFile(wb, `Brands_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully');
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Brands</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage and organize your official brand partners.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-xl shadow-slate-100 uppercase tracking-widest"
                    >
                        <Upload size={18} className="rotate-180" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} />
                        <span>New Brand</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filter brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="animate-spin text-indigo-600" size={48} />
                            <p className="text-slate-500 font-bold animate-pulse">Syncing brand partners...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBrands.map((b) => (
                                    <tr key={b.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-100/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                    {b.brandImg ? (
                                                        <img src={b.brandImg} alt={b.brand} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Layout size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 leading-tight">{b.brand}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Reference: BP-{b.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>


                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 text-right">
                                                <button
                                                    onClick={() => handleOpenModal(b)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(b.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBrands.length === 0 && (
                                    <tr>
                                        <td colSpan="2" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-200">
                                                    <AlertCircle size={48} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">No Brands Identified</h3>
                                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Audit your search or add a partner</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Premium Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingBrand ? 'Modify Brand' : 'Add Brand'}</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-70">Brand Details & Settings</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brand Name</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="Enter official brand partner..."
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Brand Logo</label>
                                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-2">
                                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">Image size (before adding)</p>
                                        <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.brandImages.width}×{IMAGE_SPECS.brandImages.height} px, max {IMAGE_SPECS.brandImages.maxFileSizeLabel}. {IMAGE_SPECS.brandImages.formats}.</p>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/jpg"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="brand-image-upload"
                                        />
                                        <label
                                            htmlFor="brand-image-upload"
                                            className="flex items-center justify-center gap-3 w-full px-6 py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-sm font-black cursor-pointer hover:bg-white hover:border-indigo-300 transition-all"
                                        >
                                            <Upload size={20} className="text-slate-400" />
                                            <span className="text-slate-600">{brandImage ? brandImage.name : 'Upload Brand Logo'}</span>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-4 relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-50/50 transition-all duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors text-right">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Verified Status</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Active for procurement</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 shadow-inner text-right"></div>
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black text-xs hover:bg-slate-50 transition-all shadow-sm uppercase tracking-[0.2em]"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                                        <span>{isSubmitting ? 'Syncing...' : editingBrand ? 'Save Changes' : 'Add Brand'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, x: '-50%' }}
                        className={cn(
                            "fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold text-sm backdrop-blur-md border border-white/20",
                            notification.type === 'success' ? "bg-emerald-600/90" : "bg-rose-600/90"
                        )}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
