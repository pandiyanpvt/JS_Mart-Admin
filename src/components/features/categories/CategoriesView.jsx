'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    CheckCircle2,
    Loader2,
    Tag,
    Image as ImageIcon,
    Upload,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { categoryService } from '@/lib/api';
import { StatusToggle } from '@/components/ui/StatusToggle';
import { IMAGE_SPECS, validateImageFileSize, getCropAspectForSpec } from '@/lib/imageSpecs';
import { pickOutputMime } from '@/lib/cropImage';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useSingleImageCrop } from '@/hooks/useSingleImageCrop';
import * as XLSX from 'xlsx';
import { useModal } from '@/components/providers/ModalProvider';
import { resolveProductImageUrl } from '@/lib/productImage';

const CATEGORY_LEVELS = [
    { value: 1, label: 'Level 1 (Root)' },
    { value: 2, label: 'Level 2 (Sub-category)' },
    { value: 3, label: 'Level 3 (Grandchild)' },
];

const isCategoryActive = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true';
    }
    return false;
};

export default function CategoriesView() {
    const categoryCrop = useSingleImageCrop();
    const { showConfirm } = useModal();
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [notification, setNotification] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('Active');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [selectedRowIds, setSelectedRowIds] = useState(new Set());

    const [formData, setFormData] = useState({
        category: '',
        isActive: true,
        level: 1,
        parentId: ''
    });

    const [categoryImage, setCategoryImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [categoryPreview, setCategoryPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    /** After user removes a preview, tell API to clear stored image on save (edit mode). */
    const [stripCategoryImg, setStripCategoryImg] = useState(false);
    const [stripBannerImg, setStripBannerImg] = useState(false);

    const revokeIfBlob = (url) => {
        if (url && String(url).startsWith('blob:')) {
            try {
                URL.revokeObjectURL(url);
            } catch {
                /* ignore */
            }
        }
    };

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            setAllCategories(data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
            showNotification('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredCategories = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return allCategories
            .filter((cat) => {
                if (selectedStatus !== 'All' && isCategoryActive(cat.isActive) !== (selectedStatus === 'Active')) {
                    return false;
                }
                if (selectedLevel !== 'All' && String(cat.level || 1) !== selectedLevel) {
                    return false;
                }
                if (!q) return true;
                const parentName = allCategories.find((p) => p.id === cat.parentId)?.category || '';
                return (
                    String(cat.category || '').toLowerCase().includes(q) ||
                    String(parentName).toLowerCase().includes(q) ||
                    `cs-${String(cat.id).padStart(4, '0')}`.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => String(a.category || '').localeCompare(String(b.category || '')));
    }, [allCategories, searchQuery, selectedStatus, selectedLevel]);

    const hasActiveFilters = Boolean(searchQuery.trim()) || selectedStatus !== 'Active' || selectedLevel !== 'All';

    const handleReset = () => {
        setSearchQuery('');
        setSelectedStatus('Active');
        setSelectedLevel('All');
        setSelectedRowIds(new Set());
    };

    const visibleRowIds = filteredCategories
        .map((cat) => (cat?.id != null ? String(cat.id) : null))
        .filter(Boolean);
    const selectedVisibleCount = visibleRowIds.filter((id) => selectedRowIds.has(id)).length;
    const allVisibleSelected = visibleRowIds.length > 0 && selectedVisibleCount === visibleRowIds.length;

    const handleRowSelect = (categoryId, checked) => {
        const id = String(categoryId);
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

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                category: category.category,
                isActive: isCategoryActive(category.isActive),
                level: category.level || 1,
                parentId: category.parentId || ''
            });
            setCategoryPreview(category.categoryImg);
            setBannerPreview(category.bannerImg);
            setCategoryImage(null);
            setBannerImage(null);
            setStripCategoryImg(false);
            setStripBannerImg(false);
        } else {
            setEditingCategory(null);
            setFormData({
                category: '',
                isActive: true,
                level: 1,
                parentId: ''
            });
            setCategoryPreview(null);
            setBannerPreview(null);
            setCategoryImage(null);
            setBannerImage(null);
            setStripCategoryImg(false);
            setStripBannerImg(false);
        }
        setIsModalOpen(true);
    };

    const clearCategoryImageField = (e) => {
        e?.stopPropagation?.();
        revokeIfBlob(categoryPreview);
        setCategoryPreview(null);
        setCategoryImage(null);
        setStripCategoryImg(true);
    };

    const clearBannerImageField = (e) => {
        e?.stopPropagation?.();
        revokeIfBlob(bannerPreview);
        setBannerPreview(null);
        setBannerImage(null);
        setStripBannerImg(true);
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const specKey = type === 'category' ? 'categoryImages' : 'categoryBanner';
        const { valid, message } = validateImageFileSize(file, specKey);
        if (!valid) {
            showNotification(message, 'error');
            return;
        }
        categoryCrop.open(file, specKey);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category.trim()) return;

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('category', formData.category);
            submitData.append('isActive', formData.isActive);
            submitData.append('level', formData.level);

            if (formData.parentId) {
                submitData.append('parentId', formData.parentId);
            }

            if (categoryImage) {
                submitData.append('categoryImg', categoryImage);
            }
            if (bannerImage) {
                submitData.append('bannerImg', bannerImage);
            }
            if (stripCategoryImg) {
                submitData.append('removeCategoryImg', 'true');
            }
            if (stripBannerImg) {
                submitData.append('removeBannerImg', 'true');
            }

            if (editingCategory) {
                await categoryService.update(editingCategory.id, submitData);
                showNotification('Category updated successfully');
            } else {
                await categoryService.create(submitData);
                showNotification('Category created successfully');
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        showConfirm({
            title: "Delete Category",
            message: "Are you sure you want to delete this category and all its nested sub-categories? This action is permanent and will affect product categorization.",
            type: "danger",
            onConfirm: async () => {
                try {
                    await categoryService.delete(id);
                    showNotification('Category deleted successfully');
                    loadCategories();
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        });
    };

    const handleStatusToggle = async (category) => {
        const nextIsActive = !isCategoryActive(category?.isActive);
        setStatusUpdatingId(category.id);
        try {
            await categoryService.update(category.id, { isActive: nextIsActive });
            showNotification(`Category marked as ${nextIsActive ? 'active' : 'inactive'}`);
            await loadCategories();
        } catch (error) {
            showNotification(error.message || 'Failed to update category status', 'error');
        } finally {
            setStatusUpdatingId(null);
        }
    };

    const handleExport = () => {
        const dataToExport = allCategories.map(cat => ({
            'ID': cat.id,
            'Category Name': cat.category,
            'Level': cat.level,
            'Parent ID': cat.parentId || 'None',
            'Status': isCategoryActive(cat.isActive) ? 'Active' : 'Archived',
            'Created At': new Date(cat.createdAt).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, `Categories_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Data exported successfully');
    };

    // Helper to get potential parents based on level
    const getPotentialParents = (level) => {
        if (level === 1) return [];
        return allCategories.filter(cat => cat.level === level - 1);
    };

    return (
        <div className="w-full min-w-0 space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Product Categories</h1>
                    <p className="text-base text-slate-500">View and manage category hierarchy, level, and active status.</p>
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
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="relative min-h-[2.5rem] min-w-0 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search categories..."
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
                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="h-10 min-w-[10.5rem] shrink-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-base font-medium text-slate-800 focus:ring-0"
                        >
                            <option value="All">All Levels</option>
                            <option value="1">Level 1</option>
                            <option value="2">Level 2</option>
                            <option value="3">Level 3</option>
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
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px] min-w-0">
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                    <th className="w-12 px-2 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={allVisibleSelected}
                                            onChange={(e) => handleSelectAllVisible(e.target.checked)}
                                            aria-label="Select all category rows"
                                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-semibold">Category</th>
                                    <th className="px-4 py-3 font-semibold">Level</th>
                                    <th className="px-4 py-3 font-semibold">Parent</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16">
                                            <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <p className="text-base font-medium">Loading categories...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-16 text-center text-base text-slate-500">
                                            No categories found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((item) => {
                                        const parent = allCategories.find((p) => p.id === item.parentId);
                                        const rowChecked = item?.id != null && selectedRowIds.has(String(item.id));
                                        return (
                                            <tr key={item.id} className="border-b border-slate-100 last:border-none">
                                                <td className="px-2 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(rowChecked)}
                                                        onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                                                        aria-label={`Select ${item.category || 'category'}`}
                                                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-100 bg-white">
                                                            <img src={resolveProductImageUrl(item.categoryImg)} alt={item.category} className="h-full w-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-semibold text-slate-900">{item.category}</p>
                                                            <p className="text-xs font-medium text-slate-500">CS-{String(item.id).padStart(4, '0')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-semibold text-slate-700">Level {item.level || 1}</td>
                                                <td className="px-4 py-4 text-sm text-slate-700">{parent?.category || '-'}</td>
                                                <td className="px-4 py-4">
                                                    <StatusToggle
                                                        checked={isCategoryActive(item.isActive)}
                                                        onChange={() => handleStatusToggle(item)}
                                                        disabled={statusUpdatingId === item.id}
                                                        offLabel="Inactive"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                                                            title="Edit category"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                                                            title="View category"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {!isCategoryActive(item.isActive) && (
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                                title="Delete category"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3 lg:hidden">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                <p className="text-base font-medium">Loading categories...</p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <p className="py-16 text-center text-base text-slate-500">No categories found matching your search criteria.</p>
                        ) : (
                            filteredCategories.map((item) => {
                                const parent = allCategories.find((p) => p.id === item.parentId);
                                return (
                                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-100 bg-white">
                                                <img src={resolveProductImageUrl(item.categoryImg)} alt={item.category} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-base font-semibold text-slate-900">{item.category}</p>
                                                <p className="text-xs text-slate-500">Level {item.level || 1} • {parent?.category || 'No parent'}</p>
                                            </div>
                                            <StatusToggle
                                                checked={isCategoryActive(item.isActive)}
                                                onChange={() => handleStatusToggle(item)}
                                                disabled={statusUpdatingId === item.id}
                                                offLabel="Inactive"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(item)} className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"><Edit2 size={16} /></button>
                                            {!isCategoryActive(item.isActive) && (
                                                <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-base text-slate-500">
                    {filteredCategories.length === 0
                        ? 'No categories found'
                        : `Showing ${filteredCategories.length} categories`}
                </p>
                <p className="text-sm font-medium text-slate-500">
                    {selectedVisibleCount > 0
                        ? `${selectedVisibleCount} selected`
                        : 'Select rows to perform bulk actions'}
                </p>
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
                            className="admin-modal-panel-host relative w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:rounded-[3rem]"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-100">
                                        <Tag size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingCategory ? 'Edit Category' : 'New Hierarchy'}</h2>
                                        <p className="text-xs text-slate-500 font-bold tracking-widest mt-0.5 opacity-70">Category & Sub-category settings</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left side: Basic Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Category Name</label>
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                placeholder="e.g. Fresh Vegetables"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Level</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CATEGORY_LEVELS.map(level => (
                                                    <button
                                                        key={level.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, level: level.value, parentId: '' })}
                                                        className={cn(
                                                            "py-3 rounded-xl text-xs font-black  transition-all border",
                                                            formData.level === level.value
                                                                ? "bg-slate-900 text-white border-slate-900"
                                                                : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                                        )}
                                                    >
                                                        L{level.value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {formData.level > 1 && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Parent Category</label>
                                                <select
                                                    required
                                                    value={formData.parentId}
                                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all appearance-none"
                                                >
                                                    <option value="">Select Parent</option>
                                                    {getPotentialParents(formData.level).map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.category}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Active Status</p>
                                                    <p className="text-xs text-slate-400 font-bold">Visible in catalog</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Right side: Media */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Category Image</label>
                                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2">
                                                <p className="text-xs font-black text-amber-800 tracking-wider">Image size (before adding)</p>
                                                <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.categoryImages.width}×{IMAGE_SPECS.categoryImages.height} px, max {IMAGE_SPECS.categoryImages.maxFileSizeLabel}</p>
                                            </div>
                                            <div className="relative">
                                                <div
                                                    className="relative group cursor-pointer"
                                                    onClick={() => document.getElementById('category-img-input').click()}
                                                    role="presentation"
                                                >
                                                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-indigo-300 transition-all">
                                                        {categoryPreview ? (
                                                            <img src={categoryPreview} alt="Icon" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <>
                                                                <Upload size={24} className="text-slate-300 mb-2" />
                                                                <span className="text-xs font-black text-slate-400 tracking-widest">Icon (Square)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {categoryPreview && (
                                                        <div className="pointer-events-none absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                                                            <Upload size={24} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input id="category-img-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={(e) => handleImageChange(e, 'category')} />
                                                {categoryPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={clearCategoryImageField}
                                                        className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                                        title="Remove image"
                                                        aria-label="Remove category image"
                                                    >
                                                        <X size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Banner Image</label>
                                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2">
                                                <p className="text-xs font-black text-amber-800 tracking-wider">Image size (before adding)</p>
                                                <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.categoryBanner.width}×{IMAGE_SPECS.categoryBanner.height} px, max {IMAGE_SPECS.categoryBanner.maxFileSizeLabel}</p>
                                            </div>
                                            <div className="relative">
                                                <div
                                                    className="relative group cursor-pointer"
                                                    onClick={() => document.getElementById('banner-img-input').click()}
                                                    role="presentation"
                                                >
                                                    <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-indigo-300 transition-all">
                                                        {bannerPreview ? (
                                                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon size={24} className="text-slate-300 mb-2" />
                                                                <span className="text-xs font-black text-slate-400 tracking-widest">Wide Hero Banner</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {bannerPreview && (
                                                        <div className="pointer-events-none absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                                                            <Upload size={24} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <input id="banner-img-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={(e) => handleImageChange(e, 'banner')} />
                                                {bannerPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={clearBannerImageField}
                                                        className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                                        title="Remove image"
                                                        aria-label="Remove banner image"
                                                    >
                                                        <X size={16} strokeWidth={2.5} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.2rem] font-black text-xs hover:bg-slate-50 transition-all shadow-sm tracking-[0.2em]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.2rem] font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 tracking-[0.2em]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        <span>{isSubmitting ? 'Processing...' : editingCategory ? 'Save Changes' : 'Create Category'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                        </div>
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
                                showNotification(check.message, 'error');
                                categoryCrop.close();
                                return;
                            }
                            if (sk === 'categoryImages') {
                                setCategoryImage(file);
                                setCategoryPreview(URL.createObjectURL(file));
                                setStripCategoryImg(false);
                            } else {
                                setBannerImage(file);
                                setBannerPreview(URL.createObjectURL(file));
                                setStripBannerImg(false);
                            }
                            categoryCrop.close();
                        }}
                    />
            )}
        </div>
    );
}


