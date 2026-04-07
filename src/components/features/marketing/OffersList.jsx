'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    Percent,
    Package,
    Calendar,
    Search,
    Loader2,
    CheckCircle2,
    X,
    Upload,
    Tag,
    ShoppingBag,
    Gift,
    Box,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { offerService, offerTypeService, productService } from '@/lib/api';
import { IMAGE_SPECS, validateImageFileSize, getCropAspectForSpec } from '@/lib/imageSpecs';
import { pickOutputMime } from '@/lib/cropImage';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { useSingleImageCrop } from '@/hooks/useSingleImageCrop';
import Image from 'next/image';
import { resolveProductImageUrl, productImageUnoptimized } from '@/lib/productImage';
import * as XLSX from 'xlsx';

export default function OffersList() {
    const offerBannerCrop = useSingleImageCrop();
    const [offers, setOffers] = useState([]);
    const [offerTypes, setOfferTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [stripOfferBanner, setStripOfferBanner] = useState(false);

    const [formData, setFormData] = useState({
        offerTypeId: '',
        name: '',
        description: '',
        productId: '',
        minOrderAmount: '',
        discountPercentage: '',
        discountAmount: '',
        buyQuantity: '',
        getQuantity: '',
        freeProductId: '',
        startDate: '',
        endDate: '',
        bannerImg: null,
        targetMembershipLevel: 0,
        preview: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [offersData, typesData, productsData] = await Promise.all([
                offerService.getAll(),
                offerTypeService.getAll(),
                productService.getAll()
            ]);
            setOffers(offersData);
            setOfferTypes(typesData);
            setProducts(productsData.filter(p => p.isActive));
        } catch (error) {
            console.error('Failed to load offers data:', error);
            showNotification('Failed to sync marketing data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        const { valid, message } = validateImageFileSize(file, 'offerBanner');
        if (!valid) {
            showNotification(message, 'error');
            return;
        }
        offerBannerCrop.open(file, 'offerBanner');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'bannerImg') {
                    if (formData[key]) data.append('bannerImg', formData[key]);
                } else if (key !== 'preview' && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });
            if (editingOffer && stripOfferBanner && !formData.bannerImg) {
                data.append('removeOfferBanner', 'true');
            }

            if (editingOffer) {
                await offerService.update(editingOffer.id, data);
                showNotification('Offer updated!');
            } else {
                await offerService.create(data);
                showNotification('New offer live and active!');
            }

            setIsModalOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setEditingOffer(null);
        setFormData({
            offerTypeId: '',
            name: '',
            description: '',
            productId: '',
            minOrderAmount: '',
            discountPercentage: '',
            discountAmount: '',
            buyQuantity: '',
            getQuantity: '',
            freeProductId: '',
            startDate: '',
            endDate: '',
            bannerImg: null,
            targetMembershipLevel: 0,
            preview: ''
        });
        setStripOfferBanner(false);
    };

    const openEdit = (offer) => {
        setEditingOffer(offer);
        setStripOfferBanner(false);
        setFormData({
            offerTypeId: offer.offerTypeId,
            name: offer.name,
            description: offer.description || '',
            productId: offer.productId || '',
            minOrderAmount: offer.minOrderAmount || '',
            discountPercentage: offer.discountPercentage || '',
            discountAmount: offer.discountAmount || '',
            buyQuantity: offer.buyQuantity || '',
            getQuantity: offer.getQuantity || '',
            freeProductId: offer.freeProductId || '',
            startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
            endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
            bannerImg: null,
            targetMembershipLevel: offer.targetMembershipLevel || 0,
            preview: offer.bannerImg || ''
        });
        setIsModalOpen(true);
    };

    const clearOfferBanner = (e) => {
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
            return { ...prev, bannerImg: null, preview: '' };
        });
        if (editingOffer) setStripOfferBanner(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this offer? It will stop showing to customers.')) return;
        try {
            await offerService.delete(id);
            showNotification('Promotion deactivated');
            loadData();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const filteredOffers = offers.filter(o =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.offer_type?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getOfferIcon = (typeId) => {
        switch (typeId) {
            case 1: return <Gift className="text-pink-500" />;
            case 2: return <Percent className="text-indigo-500" />;
            case 3: return <ShoppingBag className="text-emerald-500" />;
            case 4: return <Box className="text-amber-500" />;
            default: return <Tag className="text-slate-500" />;
        }
    };

    const handleExport = () => {
        if (!offers || offers.length === 0) return;

        const dataToExport = offers.map(o => ({
            'ID': o.id,
            'Name': o.name,
            'Type': o.offer_type?.name || 'N/A',
            'Target Product': o.product?.productName || (o.offerTypeId === 3 ? 'Cart / Storewide' : 'N/A'),
            'Discount %': o.discountPercentage || '',
            'Discount Amount': o.discountAmount || '',
            'Buy Qty': o.buyQuantity || '',
            'Get Qty': o.getQuantity || '',
            'Min Order Amount': o.minOrderAmount || '',
            'Audience': o.targetMembershipLevel === 2 ? 'JS Plus Exclusive'
                : o.targetMembershipLevel === 1 ? 'JS Pro & Plus'
                : 'Everyone',
            'Start Date': o.startDate ? new Date(o.startDate).toLocaleString() : '',
            'End Date': o.endDate ? new Date(o.endDate).toLocaleString() : '',
            'Active': o.isActive ? 'Active' : 'Archived'
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Offers');
        XLSX.writeFile(wb, `Offers_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        showNotification('Offers exported successfully');
    };

    return (
        <div className="space-y-10 min-h-screen pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-2 text-indigo-600 font-black text-xs tracking-[0.2em] mb-3">
                        <div className="w-8 h-[2px] bg-indigo-600 rounded-full" />
                        Offers
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Offers</h1>
                    <p className="text-slate-500 mt-2 font-medium">Create and manage offers for your products.</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-sm tracking-widest"
                    >
                        <Download size={18} />
                        Export Data
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 tracking-widest"
                    >
                        <Plus size={18} />
                        New Offer
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative min-w-0 w-full max-w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search offers by name or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                />
            </div>

            {/* Offers Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-32 gap-4 bg-white rounded-[3rem] border border-slate-50">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-400 font-black tracking-widest text-xs">Loading...</p>
                </div>
            ) : filteredOffers.length === 0 ? (
                <div className="p-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                        <Tag size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No offers yet</h3>
                    <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto">No offers right now. Click the button above to create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOffers.map((offer, index) => {
                        const bannerSrc = resolveProductImageUrl(offer.bannerImg);
                        return (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col",
                                !offer.isActive && "opacity-60 grayscale"
                            )}
                        >
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                                <Image
                                    src={bannerSrc}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 280px"
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    unoptimized={productImageUnoptimized(bannerSrc)}
                                />
                                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <button onClick={() => openEdit(offer)} className="p-3 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-indigo-600 hover:text-white transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(offer.id)} className="p-3 bg-white text-rose-600 rounded-xl shadow-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16} /></button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black tracking-widest text-slate-900 shadow-sm flex items-center gap-2">
                                        {getOfferIcon(offer.offerTypeId)}
                                        {offer.offer_type?.name}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-xl font-black text-slate-900 mb-2 truncate">{offer.name}</h3>
                                <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 h-10">{offer.description}</p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm font-bold tracking-tighter">
                                        <span className="text-slate-400">Product</span>
                                        <span className="text-slate-900 truncate max-w-[150px]">{offer.product?.productName || 'All Cart Orders'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold tracking-tighter">
                                        <span className="text-slate-400">Discount</span>
                                        <span className="text-emerald-600">
                                            {offer.discountPercentage ? `${offer.discountPercentage}% OFF` :
                                                offer.getQuantity ? `GET ${offer.getQuantity} FREE` :
                                                    `$${offer.discountAmount} OFF`}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold tracking-tighter">
                                        <span className="text-slate-400">For</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg border",
                                            offer.targetMembershipLevel === 2 ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                offer.targetMembershipLevel === 1 ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                                    "bg-slate-50 text-slate-600 border-slate-100"
                                        )}>
                                            {offer.targetMembershipLevel === 2 ? 'JS Plus Exclusive' :
                                                offer.targetMembershipLevel === 1 ? 'JS Pro & Above' : 'Everyone'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm font-bold tracking-tighter">
                                        <span className="text-slate-400">End date</span>
                                        <span className="text-slate-900 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : 'No end date'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className={cn(
                                        "px-3 py-1 rounded-full text-xs font-black  tracking-widest",
                                        offer.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                    )}>
                                        {offer.isActive ? 'Active Now' : 'Archived'}
                                    </div>
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(n => <div key={n} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="admin-modal-scroll z-[100]" data-lock-body-scroll role="dialog" aria-modal="true">
                        <div className="admin-modal-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="admin-modal-panel-host relative w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:rounded-[3rem] flex flex-col">
                            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white z-10 shrink-0">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                        {editingOffer ? 'Edit Offer' : 'New Offer'}
                                    </h2>
                                    <p className="text-slate-500 text-sm font-medium mt-1 tracking-widest leading-loose opacity-60">Offer details</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><X size={24} /></button>
                            </div>

                            <div className="p-10 overflow-y-auto custom-scrollbar">
                                <form onSubmit={handleSubmit} className="space-y-12">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Left Side: General Info */}
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Offer Type</label>
                                                <select
                                                    required
                                                    value={formData.offerTypeId}
                                                    onChange={(e) => setFormData({ ...formData, offerTypeId: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
                                                >
                                                    <option value="">Select offer type</option>
                                                    {offerTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Offer Name</label>
                                                <input
                                                    required
                                                    placeholder="e.g. Summer Sale 2026"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Description</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Offer details..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Start Date</label>
                                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all shadow-sm" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 tracking-widest pl-1">End Date</label>
                                                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all shadow-sm" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">For Members</label>
                                                <select
                                                    value={formData.targetMembershipLevel}
                                                    onChange={(e) => setFormData({ ...formData, targetMembershipLevel: parseInt(e.target.value) })}
                                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white transition-all appearance-none"
                                                >
                                                    <option value={0}>Public (Everyone)</option>
                                                    <option value={1}>JS Pro & Plus Members</option>
                                                    <option value={2}>JS Plus Exclusive</option>
                                                </select>
                                                <p className="text-xs text-slate-400 font-medium pl-1 italic">Assign this offer to specific membership tiers.</p>
                                            </div>
                                        </div>

                                        {/* Right Side: Logic Fields based on Type */}
                                        <div className="space-y-8">
                                            {/* Dynamic Logic Fields */}
                                            <AnimatePresence mode="wait">
                                                {formData.offerTypeId ? (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                                                        <p className="text-xs font-black text-indigo-600 tracking-[0.2em] mb-2">Offer options</p>

                                                        {/* Product Selection for Product-Specific offers */}
                                                        {[1, 2, 4].includes(parseInt(formData.offerTypeId)) && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-400">Primary Product</label>
                                                                <select required value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm outline-none">
                                                                    <option value="">Select Target Entity</option>
                                                                    {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                                                                </select>
                                                            </div>
                                                        )}

                                                        {/* Min Order for Cart-Level offers */}
                                                        {parseInt(formData.offerTypeId) === 3 && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-400">Min Cart Amount ($)</label>
                                                                <input type="number" step="0.01" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" />
                                                            </div>
                                                        )}

                                                        {/* Discount Fields */}
                                                        {[2, 3].includes(parseInt(formData.offerTypeId)) && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-slate-400">Percentage (%)</label>
                                                                    <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-slate-400">Or Fixed ($)</label>
                                                                    <input type="number" step="0.01" value={formData.discountAmount} onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* BOGO Logic */}
                                                        {[1, 4].includes(parseInt(formData.offerTypeId)) && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-slate-400">Buy Qty</label>
                                                                    <input type="number" value={formData.buyQuantity} onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-black text-slate-400">Get Qty</label>
                                                                    <input type="number" value={formData.getQuantity} onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Free Product for Type 4 */}
                                                        {parseInt(formData.offerTypeId) === 4 && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-black text-slate-400">Gifted Product</label>
                                                                <select value={formData.freeProductId} onChange={(e) => setFormData({ ...formData, freeProductId: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold">
                                                                    <option value="">Same as Primary</option>
                                                                    {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-3">
                                                        <ShoppingBag className="mx-auto text-slate-200" size={32} />
                                                        <p className="text-xs font-black text-slate-300 tracking-widest">Select offer type to set options</p>
                                                    </div>
                                                )}
                                            </AnimatePresence>

                                            {/* Media Upload */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 tracking-widest pl-1">Banner image</label>
                                                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-2">
                                                    <p className="text-xs font-black text-amber-800 tracking-wider mb-1">Image size (before adding)</p>
                                                    <p className="text-xs font-semibold text-amber-900">{IMAGE_SPECS.offerBanner.width}×{IMAGE_SPECS.offerBanner.height} px, max {IMAGE_SPECS.offerBanner.maxFileSizeLabel}. {IMAGE_SPECS.offerBanner.formats}.</p>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-[2rem] border-2 border-dashed border-slate-200 aspect-video flex items-center justify-center bg-slate-50 cursor-pointer hover:bg-white hover:border-emerald-300 transition-all">
                                                    <input type="file" onChange={handleFileChange} className="hidden" id="banner-media" accept="image/jpeg,image/png,image/webp,image/jpg" />
                                                    <label htmlFor="banner-media" className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2">
                                                        {formData.preview ? (
                                                            <Image
                                                                src={formData.preview}
                                                                alt=""
                                                                fill
                                                                sizes="280px"
                                                                className="object-cover"
                                                                unoptimized={typeof formData.preview === 'string' && formData.preview.startsWith('blob:')}
                                                            />
                                                        ) : (
                                                            <>
                                                                <Upload className="text-slate-400" size={24} />
                                                                <span className="text-xs font-black text-slate-400 tracking-[0.2em]">Upload banner</span>
                                                            </>
                                                        )}
                                                    </label>
                                                    {formData.preview && (
                                                        <button
                                                            type="button"
                                                            onClick={clearOfferBanner}
                                                            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg ring-2 ring-white/90 transition hover:bg-rose-700"
                                                            title="Remove banner"
                                                            aria-label="Remove offer banner"
                                                        >
                                                            <X size={18} strokeWidth={2.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 p-2 bg-slate-50 rounded-[2.5rem]">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                                            {isSubmitting ? 'Saving...' : (editingOffer ? 'Save changes' : 'Create offer')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-10 py-5 bg-white text-slate-400 border border-slate-100 rounded-[2rem] font-black text-sm tracking-widest hover:text-rose-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {offerBannerCrop.isOpen && offerBannerCrop.target && (
                <ImageCropModal
                    key={offerBannerCrop.target.src}
                    open
                    imageSrc={offerBannerCrop.target.src}
                    title="Crop offer banner"
                    aspect={getCropAspectForSpec('offerBanner')}
                    mimeType={pickOutputMime(offerBannerCrop.target.mime)}
                    originalFileName={offerBannerCrop.target.fileName}
                    onClose={() => offerBannerCrop.close()}
                    onComplete={(file) => {
                        const check = validateImageFileSize(file, 'offerBanner');
                        if (!check.valid) {
                            showNotification(check.message, 'error');
                            offerBannerCrop.close();
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
                            return { ...prev, bannerImg: file, preview: URL.createObjectURL(file) };
                        });
                        setStripOfferBanner(false);
                        offerBannerCrop.close();
                    }}
                />
            )}

            {/* Notifications */}
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
