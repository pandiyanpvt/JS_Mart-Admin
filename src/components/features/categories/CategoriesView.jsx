'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Tag,
    Image as ImageIcon,
    Scale,
    Upload,
    ChevronDown,
    ChevronRight,
    Layers,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { categoryService } from '@/lib/api';
import { IMAGE_SPECS } from '@/lib/imageSpecs';
import * as XLSX from 'xlsx';

const CATEGORY_LEVELS = [
    { value: 1, label: 'Level 1 (Root)' },
    { value: 2, label: 'Level 2 (Sub-category)' },
    { value: 3, label: 'Level 3 (Grandchild)' },
];

export default function CategoriesView() {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [notification, setNotification] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const [formData, setFormData] = useState({
        category: '',
        isWeightBased: false,
        isActive: true,
        level: 1,
        parentId: ''
    });

    const [categoryImage, setCategoryImage] = useState(null);
    const [bannerImage, setBannerImage] = useState(null);
    const [categoryPreview, setCategoryPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
            // The API might return nested subCategories, but we'll work with the flat list for parent selection
            // and build our own tree for display if needed, or use the nested if available.
            // Based on the user sample, it's a flat list with subCategories potentially populated.
            setAllCategories(data);
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

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedCategories(newExpanded);
    };

    // Organized categories into a tree for the hierarchical view
    const categoryTree = useMemo(() => {
        const roots = allCategories.filter(cat => !cat.parentId || cat.level === 1);
        const buildTree = (cats) => {
            return cats.map(cat => ({
                ...cat,
                children: allCategories.filter(child => child.parentId === cat.id)
            })).sort((a, b) => a.category.localeCompare(b.category));
        };
        return buildTree(roots);
    }, [allCategories]);

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                category: category.category,
                isWeightBased: category.isWeightBased,
                isActive: category.isActive,
                level: category.level || 1,
                parentId: category.parentId || ''
            });
            setCategoryPreview(category.categoryImg);
            setBannerPreview(category.bannerImg);
            setCategoryImage(null);
            setBannerImage(null);
        } else {
            setEditingCategory(null);
            setFormData({
                category: '',
                isWeightBased: false,
                isActive: true,
                level: 1,
                parentId: ''
            });
            setCategoryPreview(null);
            setBannerPreview(null);
            setCategoryImage(null);
            setBannerImage(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'category') {
                setCategoryImage(file);
                const reader = new FileReader();
                reader.onloadend = () => setCategoryPreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setBannerImage(file);
                const reader = new FileReader();
                reader.onloadend = () => setBannerPreview(reader.result);
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category.trim()) return;

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('category', formData.category);
            submitData.append('isWeightBased', formData.isWeightBased);
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
        if (window.confirm('Are you sure you want to delete this category and all its sub-categories?')) {
            try {
                await categoryService.delete(id);
                showNotification('Category deleted successfully');
                loadCategories();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const handleExport = () => {
        const dataToExport = allCategories.map(cat => ({
            'ID': cat.id,
            'Category Name': cat.category,
            'Level': cat.level,
            'Parent ID': cat.parentId || 'None',
            'Measurement Logic': cat.isWeightBased ? 'Weight Based' : 'Unit Based',
            'Status': cat.isActive ? 'Active' : 'Archived',
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

    const CategoryItem = ({ item, depth = 0 }) => {
        const isExpanded = expandedCategories.has(item.id);
        const hasChildren = item.children && item.children.length > 0;
        const matchesSearch = item.category.toLowerCase().includes(searchQuery.toLowerCase());

        // If we are searching, we want to show items that match or have children that match
        const shouldShow = searchQuery ? (matchesSearch || item.children.some(child => child.category.toLowerCase().includes(searchQuery.toLowerCase()))) : true;

        if (!shouldShow) return null;

        return (
            <div className="border-b border-slate-50 last:border-none">
                <div className={cn(
                    "flex items-center gap-4 py-4 px-6 hover:bg-slate-50/80 transition-all group",
                    depth > 0 && "bg-slate-50/30"
                )}>
                    <div className="flex items-center gap-2" style={{ marginLeft: `${depth * 2}rem` }}>
                        {hasChildren ? (
                            <button
                                onClick={() => toggleExpand(item.id)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all text-slate-400"
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div className="w-6 h-6" />
                        )}

                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                            {item.categoryImg ? (
                                <img src={item.categoryImg} alt={item.category} className="w-full h-full object-cover" />
                            ) : (
                                <Tag size={16} className="text-indigo-400" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-slate-900 truncate">{item.category}</h4>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                                item.level === 1 ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                    item.level === 2 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                                L{item.level}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">CS-{item.id.toString().padStart(4, '0')}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-6 px-4">
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            item.isWeightBased ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                            <Scale size={10} />
                            {item.isWeightBased ? 'Weight' : 'Unit'}
                        </div>
                        <div className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            item.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                            <div className={cn("w-1 h-1 rounded-full", item.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                            {item.isActive ? 'Active' : 'Archived'}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            {item.children.map(child => (
                                <CategoryItem key={child.id} item={child} depth={depth + 1} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Categories</h1>
                    <p className="text-slate-500 text-sm font-medium italic">Build your store's hierarchical taxonomy.</p>
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
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <span className="flex items-center gap-1.5"><Layers size={14} className="text-indigo-600" /> Hierarchy View Enabled</span>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-32 gap-4">
                                <Loader2 className="animate-spin text-indigo-600" size={48} />
                                <p className="text-slate-500 font-bold animate-pulse">Organizing taxonomy...</p>
                            </div>
                        ) : categoryTree.length > 0 ? (
                            <div className="p-2">
                                {categoryTree.map(item => (
                                    <CategoryItem key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-32 gap-4 text-center">
                                <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-200">
                                    <Layout size={48} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">No Categories Found</h3>
                                    <p className="text-sm font-medium text-slate-400 mt-1">Start by adding your first root category.</p>
                                </div>
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                >
                                    Create Category
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-100">
                                        <Tag size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingCategory ? 'Edit Category' : 'New Hierarchy'}</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-70">Category & Sub-category settings</p>
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
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Name</label>
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
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Level</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {CATEGORY_LEVELS.map(level => (
                                                    <button
                                                        key={level.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, level: level.value, parentId: '' })}
                                                        className={cn(
                                                            "py-3 rounded-xl text-[10px] font-black uppercase transition-all border",
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
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Parent Category</label>
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
                                                    <Scale size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Weight Based</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">For items sold by weight</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isWeightBased}
                                                    onChange={(e) => setFormData({ ...formData, isWeightBased: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                            </label>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">Active Status</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">Visible in catalog</p>
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
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Image</label>
                                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2">
                                                <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Image size (before adding)</p>
                                                <p className="text-[10px] font-semibold text-amber-900">{IMAGE_SPECS.categoryImages.width}×{IMAGE_SPECS.categoryImages.height} px, max {IMAGE_SPECS.categoryImages.maxFileSizeLabel}</p>
                                            </div>
                                            <div
                                                className="relative group cursor-pointer"
                                                onClick={() => document.getElementById('category-img-input').click()}
                                            >
                                                <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-indigo-300 transition-all">
                                                    {categoryPreview ? (
                                                        <img src={categoryPreview} alt="Icon" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <Upload size={24} className="text-slate-300 mb-2" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon (Square)</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input id="category-img-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={(e) => handleImageChange(e, 'category')} />
                                                {categoryPreview && (
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                                                        <Upload size={24} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Banner Image</label>
                                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2">
                                                <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Image size (before adding)</p>
                                                <p className="text-[10px] font-semibold text-amber-900">{IMAGE_SPECS.banners.width}×{IMAGE_SPECS.banners.height} px, max {IMAGE_SPECS.banners.maxFileSizeLabel}</p>
                                            </div>
                                            <div
                                                className="relative group cursor-pointer"
                                                onClick={() => document.getElementById('banner-img-input').click()}
                                            >
                                                <div className="w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center overflow-hidden hover:bg-white hover:border-indigo-300 transition-all">
                                                    {bannerPreview ? (
                                                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={24} className="text-slate-300 mb-2" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wide Hero Banner</span>
                                                        </>
                                                    )}
                                                </div>
                                                <input id="banner-img-input" type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={(e) => handleImageChange(e, 'banner')} />
                                                {bannerPreview && (
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[1.5rem]">
                                                        <Upload size={24} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.2rem] font-black text-xs hover:bg-slate-50 transition-all shadow-sm uppercase tracking-[0.2em]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-4 bg-slate-900 text-white rounded-[1.2rem] font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        <span>{isSubmitting ? 'Processing...' : editingCategory ? 'Save Changes' : 'Create Category'}</span>
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


