'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Upload,
    Image as ImageIcon,
    ChevronRight,
    Loader2,
    AlertCircle,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { promotionService } from '@/lib/api';
import { IMAGE_SPECS, validateImageFileSize } from '@/lib/imageSpecs';
import Image from 'next/image';

const LEVELS = [
    { id: 1, name: 'Level 1: Header Banners', description: 'Top carousel on homepage' },
    { id: 2, name: 'Level 2: Category Hero', description: 'Featured category section' },
    { id: 3, name: 'Level 3: Mid-Page Banners', description: 'Full-width banners below products' },
    { id: 4, name: 'Level 4: Seasonal Highlights', description: 'Small banners for events' },
    { id: 5, name: 'Level 5: Footer Promotional', description: 'Final call-to-action blocks' },
];

/** Preview aspect ratio matches js mart storefront display per level */
const PREVIEW_ASPECT_BY_LEVEL = {
    1: 'aspect-[16/5]',   // Hero: same as 1920×600 on js mart
    2: 'aspect-[16/5]',   // Category hero: same as hero
    3: 'aspect-[4/5]',    // Middle: js mart middle-banner-section uses aspect-[4/5]
    4: 'aspect-[4/5]',    // Seasonal: same as middle
    5: 'aspect-[16/3]',   // Footer: js mart footer uses wide short strip (h-[180px]–[300px])
};

export default function BannersList() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        level: 1,
        order: 1,
        image: null,
        preview: ''
    });

    const loadPromotions = async () => {
        try {
            setLoading(true);
            const data = await promotionService.getAll();
            setPromotions(data);
        } catch (error) {
            console.error('Failed to load banners:', error);
            showNotification('Failed to sync banner data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const { valid, message } = validateImageFileSize(file, 'banners');
        if (!valid) {
            showNotification(message, 'error');
            e.target.value = '';
            return;
        }
        setFormData({
            ...formData,
            image: file,
            preview: URL.createObjectURL(file)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('level', formData.level);
            data.append('order', formData.order);
            if (formData.image) {
                data.append('promotionImg', formData.image);
            }

            if (editingBanner) {
                await promotionService.update(editingBanner.id, data);
                showNotification('Banner updated successfully!');
            } else {
                await promotionService.create(data);
                showNotification('New banner published!');
            }

            setIsModalOpen(false);
            setEditingBanner(null);
            setFormData({ level: 1, order: 1, image: null, preview: '' });
            loadPromotions();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this banner?')) return;
        try {
            await promotionService.delete(id);
            showNotification('Banner removed from floor');
            loadPromotions();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const openEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            level: banner.level,
            order: banner.order,
            image: null,
            preview: banner.promotionImg
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <div className="w-8 h-[2px] bg-indigo-600 rounded-full" />
                        Promotional Banners
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Homepage Banners</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage display real-estate across all platform placements.</p>
                </motion.div>

                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setFormData({ level: 1, order: 1, image: null, preview: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
                >
                    <Plus size={18} />
                    Deploy New Banner
                </button>
            </div>

            {/* Levels View */}
            <div className="space-y-12">
                {LEVELS.map((level, lIndex) => {
                    const levelBanners = promotions.filter(p => parseInt(p.level) === level.id);
                    return (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: lIndex * 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{level.name}</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tight mt-1">{level.description}</p>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                    {levelBanners.length} ACTIVE
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {levelBanners.length === 0 ? (
                                    <div className="lg:col-span-3 h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold text-xs uppercase tracking-widest">
                                        No banners deployed for this level
                                    </div>
                                ) : (
                                    levelBanners.sort((a, b) => a.order - b.order).map((banner, index) => (
                                        <motion.div
                                            key={banner.id}
                                            whileHover={{ y: -5 }}
                                            className={cn(
                                                'group relative w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm',
                                                PREVIEW_ASPECT_BY_LEVEL[level.id] || 'aspect-[16/5]'
                                            )}
                                        >
                                            <Image
                                                src={banner.promotionImg}
                                                alt=""
                                                fill
                                                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-between translate-y-4 group-hover:translate-y-0 transition-transform">
                                                <div className="text-white">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Priority</p>
                                                    <p className="text-lg font-black">{banner.order}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEdit(banner)}
                                                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white hover:text-slate-900 transition-all border border-white/20"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-rose-500 transition-all border border-white/20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" data-lock-body-scroll>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900">
                                        {editingBanner ? 'Refine Banner' : 'New Deployment'}
                                    </h2>
                                    <ImageIcon className="text-indigo-600" />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Placement Level</label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white transition-all appearance-none"
                                        >
                                            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Priority (Order)</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Asset Upload</label>
                                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-2">
                                            <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">Image size (before adding)</p>
                                            <p className="text-xs font-semibold text-amber-900">
                                                {IMAGE_SPECS.banners.width}×{IMAGE_SPECS.banners.height} px recommended, max {IMAGE_SPECS.banners.maxFileSizeLabel}. {IMAGE_SPECS.banners.formats}.
                                            </p>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                id="banner-upload"
                                                className="hidden"
                                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                                onChange={handleFileChange}
                                            />
                                            <label
                                                htmlFor="banner-upload"
                                                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 cursor-pointer group-hover:bg-white group-hover:border-indigo-600/30 transition-all overflow-hidden relative"
                                            >
                                                {formData.preview ? (
                                                    <>
                                                        <div className={cn('relative w-full max-w-md mx-auto rounded-xl overflow-hidden', PREVIEW_ASPECT_BY_LEVEL[formData.level] || 'aspect-[16/5]')}>
                                                            <Image src={formData.preview} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 28rem" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2 block">Preview: same ratio as storefront</span>
                                                    </>
                                                ) : (
                                                    <div className="min-h-[160px] flex flex-col items-center justify-center">
                                                        <Upload className="text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Image Asset</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Layout size={20} />}
                                    <span>{isSubmitting ? 'Processing...' : (editingBanner ? 'Save Changes' : 'Initialize Banner')}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, x: '-50%' }} className={cn("fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-white font-bold text-sm backdrop-blur-md border border-white/20", notification.type === 'success' ? "bg-emerald-600/90" : "bg-rose-600/90")}>
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
