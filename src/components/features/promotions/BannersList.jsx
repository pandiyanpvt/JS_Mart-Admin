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
    Layout,
    HelpCircle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { promotionService } from '@/lib/api';
import { IMAGE_SPECS, validateImageFileSize, getBannerSpecForLevel, BANNER_SPEC_BY_LEVEL, getCropAspectForSpec } from '@/lib/imageSpecs';
import { pickOutputMime } from '@/lib/cropImage';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useSingleImageCrop } from '@/hooks/useSingleImageCrop';
import Image from 'next/image';

const LEVELS = [
    { id: 1, name: 'Level 1: Header Banners', description: 'JS Mart: Hero carousel on homepage (1920×600, 16:5)' },
    { id: 2, name: 'Level 2: Category Hero', description: 'JS Mart: Wide strip banner (1920×300, 32:5)' },
    { id: 3, name: 'Level 3: Curated picks / Mid-Page', description: 'JS Mart: Scrolling strip cards (900×375, 12:5)' },
    { id: 4, name: 'Level 4: Seasonal Highlights', description: 'JS Mart: Wide strip banner (1920×300, 32:5)' },
    { id: 5, name: 'Level 5: Footer Promotional', description: 'JS Mart: Footer wide strip (1920×300, 32:5)' },
];

/** Preview aspect ratio matches JS Mart storefront display per level */
const PREVIEW_ASPECT_BY_LEVEL = {
    1: 'aspect-[16/5]',   // Hero: 1920×600 — hero-section.tsx
    2: 'aspect-[32/5]',   // Category hero: level2-banner-section.tsx
    3: 'aspect-[12/5]',   // Curated picks: middle-banner-section.tsx
    4: 'aspect-[32/5]',   // Seasonal: level4-banner-section.tsx
    5: 'aspect-[32/5]',   // Footer: footer-banner-section.tsx
};

export default function BannersList() {
    const bannerCrop = useSingleImageCrop();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showLinkHelp, setShowLinkHelp] = useState(false);
    const [stripPromotionImg, setStripPromotionImg] = useState(false);

    const [formData, setFormData] = useState({
        level: 1,
        order: 1,
        redirectLink: '',
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

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const specKey = BANNER_SPEC_BY_LEVEL[formData.level] || 'banners';
        const { valid, message } = validateImageFileSize(file, specKey);
        if (!valid) {
            showNotification(message, 'error');
            return;
        }
        bannerCrop.open(file, specKey);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('level', formData.level);
            data.append('order', formData.order);
            data.append('redirectLink', formData.redirectLink || '');
            if (formData.image) {
                data.append('promotionImg', formData.image);
            }
            if (editingBanner && stripPromotionImg && !formData.image) {
                data.append('removePromotionImg', 'true');
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
            setFormData({ level: 1, order: 1, redirectLink: '', image: null, preview: '' });
            setStripPromotionImg(false);
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
        setStripPromotionImg(false);
        setFormData({
            level: banner.level,
            order: banner.order,
            redirectLink: banner.redirectLink || '',
            image: null,
            preview: banner.promotionImg
        });
        setIsModalOpen(true);
    };

    const clearPromotionPreview = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setFormData((prev) => {
            if (prev.preview?.startsWith?.('blob:')) {
                try {
                    URL.revokeObjectURL(prev.preview);
                } catch {
                    /* ignore */
                }
            }
            return { ...prev, image: null, preview: '' };
        });
        if (editingBanner) setStripPromotionImg(true);
    };

    return (
        <div className="space-y-10 min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs tracking-[0.2em] mb-3">
                        <div className="w-8 h-[2px] bg-indigo-600 rounded-full" />
                        Promotional Banners
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Homepage Banners</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage display real-estate across all platform placements.</p>
                </motion.div>

                <button
                    onClick={() => {
                        setEditingBanner(null);
                        setFormData({ level: 1, order: 1, redirectLink: '', image: null, preview: '' });
                        setStripPromotionImg(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 tracking-widest"
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
                                    <p className="text-slate-400 text-xs font-bold tracking-tight mt-1">{level.description}</p>
                                </div>
                                <div className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                    {levelBanners.length} ACTIVE
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {levelBanners.length === 0 ? (
                                    <div className="lg:col-span-3 h-32 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold text-xs tracking-widest">
                                        No banners deployed for this level
                                    </div>
                                ) : (
                                    levelBanners.sort((a, b) => a.order - b.order).map((banner, index) => (
                                        <motion.div
                                            key={banner.id}
                                            whileHover={{ y: -5 }}
                                            className={cn(
                                                'group relative w-full overflow-hidden border border-slate-100 shadow-sm',
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
                                                    <p className="text-xs font-black tracking-widest opacity-60">Priority</p>
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
                    <div className="admin-modal-scroll z-[100]" data-lock-body-scroll role="dialog" aria-modal="true">
                        <div className="admin-modal-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="admin-modal-backdrop"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="admin-modal-panel-host relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:rounded-[3rem]"
                        >
                            <form onSubmit={handleSubmit} className="p-6 space-y-8 sm:p-10">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <ImageIcon className="h-8 w-8 shrink-0 text-indigo-600 sm:h-9 sm:w-9" />
                                        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                                            {editingBanner ? 'Refine Banner' : 'New Deployment'}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="shrink-0 rounded-2xl bg-slate-50 p-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
                                        aria-label="Close"
                                    >
                                        <X size={22} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Placement Level</label>
                                        <select
                                            value={formData.level}
                                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white transition-all appearance-none"
                                        >
                                            {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Display Priority (Order)</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between pl-1">
                                            <label className="text-xs font-black text-slate-400 tracking-widest">Redirect Link</label>
                                            <button
                                                type="button"
                                                onClick={() => setShowLinkHelp(!showLinkHelp)}
                                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <HelpCircle size={14} />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="e.g. /shop?category=1 or https://brand.com"
                                            value={formData.redirectLink || ''}
                                            onChange={(e) => setFormData({ ...formData, redirectLink: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                                        />

                                        <AnimatePresence>
                                            {showLinkHelp && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-2 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
                                                        <p className="text-xs font-black text-indigo-600 tracking-wider">How links work:</p>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700 mb-0.5">Internal Redirection</p>
                                                                <p className="text-xs text-slate-500 leading-relaxed">Use relative paths like <code className="bg-white px-1 py-0.5 rounded border border-indigo-100">/shop</code> or <code className="bg-white px-1 py-0.5 rounded border border-indigo-100">/shop?category=5</code> to link to pages inside your store.</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700 mb-0.5">External Promotion</p>
                                                                <p className="text-xs text-slate-500 leading-relaxed">Use full URLs starting with <code className="bg-white px-1 py-0.5 rounded border border-indigo-100">https://</code> to link to partner sites. These will automatically open in a new tab.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Asset Upload</label>
                                        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-2">
                                            <p className="text-xs font-black text-amber-800 tracking-wider mb-1">Image size (before adding)</p>
                                            <p className="text-xs font-semibold text-amber-900">
                                                {(() => {
                                                    const spec = getBannerSpecForLevel(formData.level);
                                                    return `${spec.width}×${spec.height} px recommended (${spec.aspectRatio}), max ${spec.maxFileSizeLabel}. ${spec.formats}.`;
                                                })()}
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
                                                        <div className={cn('relative w-full max-w-md mx-auto overflow-hidden', PREVIEW_ASPECT_BY_LEVEL[formData.level] || 'aspect-[16/5]')}>
                                                            <Image src={formData.preview} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 28rem" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 tracking-wider mt-2 block">Preview: same ratio as storefront</span>
                                                    </>
                                                ) : (
                                                    <div className="min-h-[160px] flex flex-col items-center justify-center">
                                                        <Upload className="text-slate-400 mb-2 group-hover:text-indigo-600 transition-colors" />
                                                        <span className="text-xs font-black text-slate-400 tracking-widest">Select Image Asset</span>
                                                    </div>
                                                )}
                                            </label>
                                            {formData.preview && (
                                                <button
                                                    type="button"
                                                    onClick={clearPromotionPreview}
                                                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                                    title="Remove image"
                                                    aria-label="Remove banner image"
                                                >
                                                    <X size={18} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-sm tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Layout size={20} />}
                                    <span>{isSubmitting ? 'Processing...' : (editingBanner ? 'Save Changes' : 'Initialize Banner')}</span>
                                </button>
                            </form>
                        </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {bannerCrop.isOpen && bannerCrop.target && (
                <ImageCropModal
                    key={bannerCrop.target.src}
                    open
                    imageSrc={bannerCrop.target.src}
                    title="Crop banner"
                    aspect={getCropAspectForSpec(bannerCrop.target.specKey)}
                    mimeType={pickOutputMime(bannerCrop.target.mime)}
                    originalFileName={bannerCrop.target.fileName}
                    onClose={() => bannerCrop.close()}
                    onComplete={async (file) => {
                        const sk = bannerCrop.target.specKey;
                        const check = validateImageFileSize(file, sk);
                        if (!check.valid) {
                            showNotification(check.message, 'error');
                            bannerCrop.close();
                            return;
                        }
                        setFormData((prev) => {
                            if (prev.preview?.startsWith?.('blob:')) {
                                try {
                                    URL.revokeObjectURL(prev.preview);
                                } catch {
                                    /* ignore */
                                }
                            }
                            return { ...prev, image: file, preview: URL.createObjectURL(file) };
                        });
                        setStripPromotionImg(false);
                        bannerCrop.close();
                    }}
                />
            )}

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
