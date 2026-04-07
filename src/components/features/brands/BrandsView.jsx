'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    RotateCcw,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Image as ImageIcon,
    Upload

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { resolveProductImageUrl } from '@/lib/productImage';
import { brandService } from '@/lib/api';
import { IMAGE_SPECS, validateImageFileSize, getCropAspectForSpec } from '@/lib/imageSpecs';
import { pickOutputMime } from '@/lib/cropImage';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useSingleImageCrop } from '@/hooks/useSingleImageCrop';
import * as XLSX from 'xlsx';
import { useModal } from '@/components/providers/ModalProvider';
import { StatusToggle } from '@/components/ui/StatusToggle';

export default function BrandsView() {
    const brandCrop = useSingleImageCrop();
    const { showConfirm } = useModal();
    const [allBrands, setAllBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [notification, setNotification] = useState(null);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    const [formData, setFormData] = useState({
        brand: '',
        isActive: true
    });
    const [brandImage, setBrandImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [stripBrandImg, setStripBrandImg] = useState(false);

    const isBrandActive = (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value === 1;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            return normalized === '1' || normalized === 'true' || normalized === 'active';
        }
        return false;
    };

    const revokeIfBlob = (url) => {
        if (url && String(url).startsWith('blob:')) {
            try {
                URL.revokeObjectURL(url);
            } catch {
                /* ignore */
            }
        }
    };


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

    const filteredBrands = allBrands.filter((b) => {
        const matchesSearch = (b.brand || '').toLowerCase().includes((searchQuery || '').toLowerCase());
        if (!matchesSearch) return false;
        if (selectedStatus === 'All') return true;
        const isActive = isBrandActive(b.isActive);
        return selectedStatus === 'Active' ? isActive : !isActive;
    });
    const hasActiveFilters = Boolean(searchQuery?.trim()) || selectedStatus !== 'All';

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                brand: brand.brand,
                isActive: isBrandActive(brand.isActive)
            });
            setImagePreview(brand.brandImg);
            setBrandImage(null);
            setStripBrandImg(false);
        } else {
            setEditingBrand(null);
            setFormData({ brand: '', isActive: true });
            setImagePreview(null);
            setBrandImage(null);
            setStripBrandImg(false);
        }
        setIsModalOpen(true);
    };

    const clearBrandImage = (e) => {
        e?.stopPropagation?.();
        revokeIfBlob(imagePreview);
        setImagePreview(null);
        setBrandImage(null);
        setStripBrandImg(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const { valid, message } = validateImageFileSize(file, 'brandImages');
        if (!valid) {
            showNotification(message, 'error');
            return;
        }
        brandCrop.open(file, 'brandImages');
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
        showConfirm({
            title: "Delete Brand",
            message: "Are you sure you want to delete this brand? This action cannot be undone and may affect associated products.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await brandService.delete(id);
                    showNotification('Brand deleted successfully');
                    loadBrands();
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        });
    };

    const handleExport = () => {
        const dataToExport = allBrands.map(b => ({
            'ID': b.id,
            'Brand Name': b.brand,
            'Status': isBrandActive(b.isActive) ? 'Active' : 'Inactive',
            'Created At': new Date(b.createdAt).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Brands");
        XLSX.writeFile(wb, `Brands_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully');
    };

    const handleStatusToggle = async (brand) => {
        const nextIsActive = !isBrandActive(brand?.isActive);
        setStatusUpdatingId(brand.id);
        try {
            await brandService.update(brand.id, { isActive: nextIsActive });
            showNotification(`Brand marked as ${nextIsActive ? 'active' : 'inactive'}`);
            await loadBrands();
        } catch (error) {
            showNotification(error.message || 'Failed to update brand status', 'error');
        } finally {
            setStatusUpdatingId(null);
        }
    };

    return (
        <div className="w-full min-w-0 space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Brands</h1>
                    <p className="text-base text-slate-500">Manage and organize your official brand partners.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                    >
                        <Upload size={18} className="rotate-180" />
                        <span>Export Data</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700"
                    >
                        <Plus size={18} />
                        <span>Add Brand</span>
                    </button>
                </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative min-h-[2.5rem] min-w-0 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 py-2 pl-10 pr-4 text-base outline-none transition-all focus:ring-2 focus:ring-emerald-500/10"
                        />
                    </div>
                    <div className="flex min-h-[2.5rem] flex-wrap items-center gap-2 lg:flex-nowrap lg:justify-end">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-10 min-w-[10.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:ring-0"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedStatus('All');
                            }}
                            className={cn(
                                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200',
                                !hasActiveFilters && 'pointer-events-none invisible'
                            )}
                            tabIndex={hasActiveFilters ? 0 : -1}
                            aria-hidden={!hasActiveFilters}
                            aria-label="Reset filters"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px] min-w-0 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <p className="text-base font-medium">Loading brands...</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[720px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="px-4 py-3 font-semibold">Brand</th>
                                    <th className="px-4 py-3 font-semibold">Reference</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBrands.map((b) => (
                                    <tr key={b.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/60 transition-all">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                    <img src={resolveProductImageUrl(b.brandImg)} alt={b.brand} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900">{b.brand}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-500">
                                            BP-{String(b.id).padStart(4, '0')}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusToggle
                                                checked={isBrandActive(b.isActive)}
                                                onChange={() => handleStatusToggle(b)}
                                                disabled={statusUpdatingId === b.id}
                                                offLabel="Inactive"
                                            />
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(b)}
                                                    className="rounded-lg p-2 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                    title="Edit brand"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {!isBrandActive(b.isActive) && (
                                                    <button
                                                        onClick={() => handleDelete(b.id)}
                                                        className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                        title="Delete brand"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredBrands.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="rounded-2xl bg-slate-100 p-4 text-slate-300">
                                                    <AlertCircle size={36} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900">No brands found</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Try changing filters or add a new brand.</p>
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
                    <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                        <div className="admin-modal-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="admin-modal-backdrop"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="admin-modal-panel-host relative w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[3rem]"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                        <ShieldCheck size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingBrand ? 'Modify Brand' : 'Add Brand'}</h2>
                                        <p className="text-xs text-slate-500 font-bold tracking-widest mt-0.5 opacity-70">Brand Details & Settings</p>
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
                                    <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Brand Name</label>
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
                                    <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Brand Logo</label>
                                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-2">
                                        <p className="text-xs font-black text-amber-800 tracking-wider mb-1">Image size (before adding)</p>
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
                                            <button
                                                type="button"
                                                onClick={clearBrandImage}
                                                className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                                title="Remove logo"
                                                aria-label="Remove brand logo"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
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
                                            <p className="text-xs text-slate-400 font-bold tracking-tight">Active for procurement</p>
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
                                        className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black text-xs hover:bg-slate-50 transition-all shadow-sm tracking-[0.2em]"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 tracking-[0.2em]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
                                        <span>{isSubmitting ? 'Syncing...' : editingBrand ? 'Save Changes' : 'Add Brand'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

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
                            showNotification(check.message, 'error');
                            brandCrop.close();
                            return;
                        }
                        setBrandImage(file);
                        setImagePreview(URL.createObjectURL(file));
                        setStripBrandImg(false);
                        brandCrop.close();
                    }}
                />
            )}

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
