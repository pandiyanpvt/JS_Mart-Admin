'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    GripVertical,
    ChevronRight,
    Edit2,
    Trash2,
    X,
    AlertCircle,
    LayoutGrid,
    CheckCircle2,
    Layers,
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

const initialCategories = [
    { id: 1, name: 'Vegetables', sub: ['Fresh', 'Organic', 'Seasonal'], items: 450, status: 'Enabled', image: '🥦' },
    { id: 2, name: 'Fruits', sub: ['Local', 'Imported', 'Organic'], items: 320, status: 'Enabled', image: '🍎' },
    { id: 3, name: 'Dairy', sub: ['Milk', 'Cheese', 'Butter', 'Yogurt'], items: 150, status: 'Enabled', image: '🥛' },
    { id: 4, name: 'Meats', sub: ['Chicken', 'Beef', 'Mutton', 'Pork'], items: 280, status: 'Enabled', image: '🥩' },
    { id: 5, name: 'Seafood', sub: ['Fish', 'Prawns', 'Crabs'], items: 120, status: 'Enabled', image: '🦐' },
    { id: 6, name: 'Bakery', sub: ['Bread', 'Cakes', 'Buns', 'Rusk'], items: 310, status: 'Enabled', image: '🥖' },
];

export default function CategoriesView() {
    const [allCategories, setAllCategories] = useState(initialCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', sub: '', status: 'Enabled' });

    // Filter categories
    const filteredCategories = allCategories.filter(cat =>
        (cat.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        cat.sub.some(s => (s || '').toLowerCase().includes((searchQuery || '').toLowerCase()))
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                sub: category.sub.join(', '),
                status: category.status
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', sub: '', status: 'Enabled' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const subArr = formData.sub.split(',').map(s => s.trim()).filter(s => s !== '');

        if (editingCategory) {
            // Update existing
            setAllCategories(prev => prev.map(cat =>
                cat.id === editingCategory.id
                    ? { ...cat, name: formData.name, sub: subArr, status: formData.status }
                    : cat
            ));
        } else {
            // Create new
            const newCategory = {
                id: Date.now(),
                name: formData.name,
                sub: subArr,
                items: 0,
                status: formData.status,
                image: '📦' // Default icon
            };
            setAllCategories([newCategory, ...allCategories]);
        }

        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', sub: '', status: 'Enabled' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            setAllCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-500 text-sm">Organize your catalog structure and hierarchy.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>New Category</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="p-8 space-y-4">
                    {filteredCategories.map((cat) => (
                        <div
                            key={cat.id}
                            className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50/50 transition-all duration-300"
                        >
                            <div className="flex items-start md:items-center gap-4">
                                <div className="hidden md:flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-slate-400 cursor-move py-2">
                                    <GripVertical size={16} />
                                </div>

                                <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                                    {cat.image}
                                </div>

                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide",
                                            cat.status === 'Enabled' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            {cat.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {cat.sub.map((sub, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-medium text-slate-500 uppercase">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-col items-end px-6 border-l border-slate-100">
                                    <p className="text-xl font-bold text-slate-900">{cat.items}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Products</p>
                                </div>

                                <div className="flex items-center gap-1 border-l border-slate-100 pl-4">
                                    <button
                                        onClick={() => handleOpenModal(cat)}
                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredCategories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <AlertCircle size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Categories Found</h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest">Adjust your search or create a new one</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 border border-slate-200 overflow-hidden transform transition-all">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingCategory ? 'Edit Category' : 'New Definition'}</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {editingCategory ? 'Modify existing taxonomy' : 'Add to catalog structure'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                                    Category Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Fresh Produce"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                                    Sub-categories
                                </label>
                                <input
                                    type="text"
                                    value={formData.sub || ''}
                                    onChange={(e) => setFormData({ ...formData, sub: e.target.value })}
                                    placeholder="e.g. Organic, Local, Imported (comma separated)"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                />
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Separate multiple items with commas</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                                    Live Status
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={cn(
                                        "cursor-pointer px-4 py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2",
                                        formData.status === 'Enabled' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100 bg-white hover:bg-slate-50"
                                    )}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Enabled"
                                            checked={formData.status === 'Enabled'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="hidden"
                                        />
                                        <span className="text-xs font-black uppercase tracking-widest">Active</span>
                                        {formData.status === 'Enabled' && <CheckCircle2 size={16} />}
                                    </label>
                                    <label className={cn(
                                        "cursor-pointer px-4 py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2",
                                        formData.status === 'Disabled' ? "border-slate-500 bg-slate-50 text-slate-700" : "border-slate-100 bg-white hover:bg-slate-50"
                                    )}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="Disabled"
                                            checked={formData.status === 'Disabled'}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="hidden"
                                        />
                                        <span className="text-xs font-black uppercase tracking-widest">Hidden</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                                >
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
