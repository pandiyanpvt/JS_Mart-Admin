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
    Tag,
    Image as ImageIcon,
    Scale,
    Upload

} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { categoryService } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function CategoriesView() {
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        category: '',
        isWeightBased: false,
        isActive: true
    });
    const [categoryImage, setCategoryImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);


    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAll();
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

    const filteredCategories = allCategories.filter(cat =>
        (cat.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                category: category.category,
                isWeightBased: category.isWeightBased,
                isActive: category.isActive
            });
            setImagePreview(category.categoryImg);
            setCategoryImage(null);
        } else {
            setEditingCategory(null);
            setFormData({ category: '', isWeightBased: false, isActive: true });
            setImagePreview(null);
            setCategoryImage(null);
        }
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCategoryImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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
            if (categoryImage) {
                submitData.append('categoryImg', categoryImage);
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
        if (window.confirm('Are you sure you want to delete this category?')) {
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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Categories</h1>
                    <p className="text-slate-500 text-sm font-medium">Create and manage your store's product categories.</p>
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
                        <span>New Category</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Filter categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 className="animate-spin text-emerald-600" size={48} />
                            <p className="text-slate-500 font-bold animate-pulse">Syncing catalog taxonomy...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identification</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Measurement Logic</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 overflow-hidden relative border border-emerald-100/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                    {cat.categoryImg ? (
                                                        <img src={cat.categoryImg} alt={cat.category} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-emerald-600">
                                                            <Tag size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 leading-tight">{cat.category}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: CS-{cat.id.toString().padStart(4, '0')}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                cat.isWeightBased ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                            )}>
                                                <Scale size={12} />
                                                {cat.isWeightBased ? 'Weight Based' : 'Unit Based'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                cat.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", cat.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                                                {cat.isActive ? 'Active' : 'Archived'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-200">
                                                    <AlertCircle size={48} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">No Categories Found</h3>
                                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Refine your search parameters</p>
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
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200"
                        >
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                        <Tag size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingCategory ? 'Update Logic' : 'New Category'}</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5 opacity-70">Category Settings & Options</p>
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
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Name</label>
                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. Fresh Produce"
                                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category Icon</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="category-image-upload"
                                        />
                                        <label
                                            htmlFor="category-image-upload"
                                            className="flex items-center justify-center gap-3 w-full px-6 py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-sm font-black cursor-pointer hover:bg-white hover:border-emerald-300 transition-all"
                                        >
                                            <Upload size={20} className="text-slate-400" />
                                            <span className="text-slate-600">{categoryImage ? categoryImage.name : 'Upload Category Icon'}</span>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-4 relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-slate-200">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                            <Scale size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Weight Based</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Required for loose items</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isWeightBased}
                                            onChange={(e) => setFormData({ ...formData, isWeightBased: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-5 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black text-xs hover:bg-slate-50 transition-all shadow-sm uppercase tracking-[0.2em]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                        <span>{isSubmitting ? 'Syncing...' : editingCategory ? 'Save Changes' : 'Add Category'}</span>
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


