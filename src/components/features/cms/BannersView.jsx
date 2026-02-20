'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, X, Image as ImageIcon, Link as LinkIcon, Layers, CheckCircle2, XCircle, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IMAGE_SPECS } from '@/lib/imageSpecs';
import Image from 'next/image';

// Mock Data for Banners
const mockBanners = [
    {
        id: 1,
        title: 'Summer Collection Launch',
        subtitle: 'Up to 50% off on new arrivals',
        imageUrl: '/api/placeholder/800/400',
        link: '/collections/summer',
        type: 'Hero Slider',
        order: 1,
        status: 'Active'
    },
    {
        id: 2,
        title: 'Tech Gadgets Sale',
        subtitle: 'Latest electronics at unbeatable prices',
        imageUrl: '/api/placeholder/800/400',
        link: '/electronics/deals',
        type: 'Hero Slider',
        order: 2,
        status: 'Active'
    },
    {
        id: 3,
        title: 'Free Shipping Offer',
        subtitle: 'On all orders above $50',
        imageUrl: '/api/placeholder/800/200',
        link: '/shipping-policy',
        type: 'Promo Strip',
        order: 1,
        status: 'Inactive'
    },
    {
        id: 4,
        title: 'New User Discount',
        subtitle: 'Get 10% off your first purchase',
        imageUrl: '/api/placeholder/400/400',
        link: '/signup',
        type: 'Sidebar AD',
        order: 1,
        status: 'Active'
    }
];

export default function BannersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [banners, setBanners] = useState(mockBanners);

    // Modal States
    const [viewBanner, setViewBanner] = useState(null);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isNewBanner, setIsNewBanner] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredBanners = banners.filter(banner => {
        const matchesSearch = banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            banner.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All Types' || banner.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingBanner({
            title: '',
            subtitle: '',
            imageUrl: '',
            link: '',
            type: 'Hero Slider',
            order: 1,
            status: 'Active'
        });
        setIsNewBanner(true);
    };

    const handleOpenEdit = (banner) => {
        setEditingBanner({ ...banner });
        setIsNewBanner(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewBanner) {
            const newId = Math.max(...banners.map(b => b.id), 0) + 1;
            const newBanner = { ...editingBanner, id: newId };
            setBanners([newBanner, ...banners]);
        } else {
            setBanners(banners.map(b => b.id === editingBanner.id ? editingBanner : b));
        }

        setIsSaving(false);
        setEditingBanner(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setBanners(banners.filter(b => b.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingBanner?.[name] || ''}
                onChange={e => setEditingBanner({ ...editingBanner, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Home Banners</h1>
                    <p className="text-slate-500 text-sm">Manage website banners, sliders, and promotional images.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add New Banner</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search banners..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                        >
                            <option>All Types</option>
                            <option>Hero Slider</option>
                            <option>Promo Strip</option>
                            <option>Sidebar AD</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBanners.map(banner => (
                        <div key={banner.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="relative h-48 bg-slate-100 w-full">
                                {/* Placeholder for Image - in a real app, use next/image */}
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <ImageIcon size={48} />
                                </div>
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">
                                        {banner.type}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-sm flex items-center gap-1",
                                        banner.status === 'Active' ? "bg-emerald-500/90 text-white" : "bg-slate-500/90 text-white"
                                    )}>
                                        {banner.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                        {banner.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{banner.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{banner.subtitle}</p>

                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                        <Layers size={12} />
                                        Order: {banner.order}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewBanner(banner)}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(banner)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(banner.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Card Button */}
                    <button
                        onClick={handleOpenAdd}
                        className="group relative h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center mb-4 transition-colors">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold">Add New Banner</span>
                    </button>
                </div>
            </div>

            {/* View Modal */}
            {viewBanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setViewBanner(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                            <ImageIcon size={64} className="text-slate-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 text-white">
                                <h2 className="text-3xl font-bold mb-2">{viewBanner.title}</h2>
                                <p className="text-lg opacity-90">{viewBanner.subtitle}</p>
                            </div>
                            <button onClick={() => setViewBanner(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Link URL</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                                        <LinkIcon size={14} />
                                        {viewBanner.link}
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Display Order</p>
                                    <p className="text-sm font-bold text-slate-800">Position {viewBanner.order}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewBanner(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingBanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setEditingBanner(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewBanner ? 'Upload Banner' : 'Edit Banner'}</h3>
                                <p className="text-sm text-slate-500">{isNewBanner ? 'Add new visual content' : 'Update banner details'}</p>
                            </div>
                            <button onClick={() => setEditingBanner(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="banner-form" onSubmit={handleSave} className="space-y-6">
                                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-4">
                                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">Image size (before adding)</p>
                                    <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.banners.width}×{IMAGE_SPECS.banners.height} px recommended, max {IMAGE_SPECS.banners.maxFileSizeLabel}. {IMAGE_SPECS.banners.formats}.</p>
                                </div>
                                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors mb-4">
                                        <ImageIcon size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">{IMAGE_SPECS.banners.width}×{IMAGE_SPECS.banners.height} px, max {IMAGE_SPECS.banners.maxFileSizeLabel}</p>
                                </div>
                                <FormInput label="Title / Headline" name="title" required placeholder="e.g. Summer Sale" />
                                <FormInput label="Subtitle / Description" name="subtitle" placeholder="e.g. Huge discounts on all items" />
                                <FormInput label="Target Link" name="link" placeholder="/collections/summer" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Banner Type</label>
                                        <select
                                            value={editingBanner.type}
                                            onChange={e => setEditingBanner({ ...editingBanner, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option>Hero Slider</option>
                                            <option>Promo Strip</option>
                                            <option>Sidebar AD</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Order</label>
                                            <input
                                                type="number"
                                                value={editingBanner.order}
                                                onChange={e => setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                            <select
                                                value={editingBanner.status}
                                                onChange={e => setEditingBanner({ ...editingBanner, status: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingBanner(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="banner-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewBanner ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewBanner ? 'Upload Banner' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setDeleteId(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Banner?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to remove this banner? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-rose-200"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
