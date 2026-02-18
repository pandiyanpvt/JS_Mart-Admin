'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    X,
    Loader2,
    CheckCircle2,
    Box,
    Hash,
    Camera,
    Upload,
    AlertTriangle,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IMAGE_SPECS } from '@/lib/imageSpecs';
import { productService, stockService, stockLogService } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RemoveStockForm() {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState([]);
    const [productBatches, setProductBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batchesLoading, setBatchesLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState('');

    // Selection state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);

    // Form state
    const [adjustment, setAdjustment] = useState({
        quantity: '',
        type: 'REMOVE',
        reason: ''
    });
    const [evidencePhoto, setEvidencePhoto] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const products = await productService.getAll();
            setAllProducts(products);
        } catch (error) {
            console.error('Failed to load products:', error);
            showNotification('Failed to synchronize catalog data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadBatches = async (productId) => {
        try {
            setBatchesLoading(true);
            const data = await stockService.getBatchesByProduct(productId);
            // Only show batches with stock
            setProductBatches(data.filter(b => b.quantity > 0));
        } catch (error) {
            console.error('Failed to load batches:', error);
            showNotification('Failed to load batch records', 'error');
        } finally {
            setBatchesLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSelectedBatch(null);
        setProductSearchQuery(product.productName);
        loadBatches(product.id);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEvidencePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEvidencePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return showNotification('Please select a product', 'error');
        if (!selectedBatch) return showNotification('Please select a specific batch', 'error');
        if (!evidencePhoto) return showNotification('Photo evidence is mandatory for removals', 'error');
        if (parseInt(adjustment.quantity) > selectedBatch.quantity) {
            return showNotification(`Insufficient stock. Only ${selectedBatch.quantity} available.`, 'error');
        }

        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append('productId', selectedProduct.id);
            submitData.append('stockBatchId', selectedBatch.id);
            submitData.append('type', adjustment.type);
            submitData.append('quantity', adjustment.quantity);
            submitData.append('reason', adjustment.reason);
            submitData.append('evidencePhoto', evidencePhoto);

            await stockLogService.adjust(submitData);
            showNotification('Removal request processed/submitted for approval!');
            setTimeout(() => router.push('/stocks/logs'), 1500);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-widest mb-2">
                        <div className="w-8 h-[2px] bg-rose-600 rounded-full" />
                        Inventory Depletion
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Stock Removal</h1>
                    <p className="text-slate-500 mt-2 font-medium">Remove stock from inventory with proper documentation.</p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Selector Column */}
                        <div className="space-y-8">
                            {/* Product Search */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">1. Identify Product</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search inventory..."
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                                    />
                                </div>

                                <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div className="divide-y divide-slate-100">
                                        {loading ? (
                                            <div className="p-8 text-center"><Loader2 className="animate-spin inline text-slate-300" /></div>
                                        ) : allProducts.filter(p => !productSearchQuery || p.productName.toLowerCase().includes(productSearchQuery.toLowerCase())).map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleProductSelect(p)}
                                                className={cn(
                                                    "w-full flex items-center gap-4 p-4 transition-all text-left group",
                                                    selectedProduct?.id === p.id ? "bg-white shadow-sm ring-1 ring-inset ring-rose-500/20" : "hover:bg-white/80"
                                                )}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden relative shrink-0">
                                                    {p.images?.[0] ? <Image src={p.images[0].productImg} alt="" fill className="object-cover" /> : <Box size={20} className="absolute inset-0 m-auto text-slate-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-slate-900 truncate">{p.productName}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Stock: {p.quantity} units</p>
                                                </div>
                                                {selectedProduct?.id === p.id && <CheckCircle2 size={16} className="text-rose-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Batch Selection */}
                            <AnimatePresence>
                                {selectedProduct && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-4"
                                    >
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">2. Select Specific Batch</label>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
                                            {batchesLoading ? (
                                                <div className="p-8 text-center"><Loader2 className="animate-spin inline text-slate-300" /></div>
                                            ) : productBatches.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No active batches available</div>
                                            ) : (
                                                <div className="divide-y divide-slate-100">
                                                    {productBatches.map(b => (
                                                        <button
                                                            key={b.id}
                                                            type="button"
                                                            onClick={() => setSelectedBatch(b)}
                                                            className={cn(
                                                                "w-full flex items-center justify-between p-4 transition-all text-left",
                                                                selectedBatch?.id === b.id ? "bg-white shadow-sm ring-1 ring-inset ring-rose-500/20" : "hover:bg-white/80"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Hash size={14} /></div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900">{b.batchNumber}</p>
                                                                    <p className="text-[9px] text-slate-400 font-bold">Expires: {b.expiryDate || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-slate-900">{b.quantity}</p>
                                                                <p className="text-[8px] text-slate-400 font-bold uppercase">Qty left</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Form Column */}
                        <div className="space-y-8">
                            <AnimatePresence mode="wait">
                                {selectedBatch ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-rose-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-rose-100 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <AlertTriangle size={120} />
                                            </div>
                                            <div className="relative z-10 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                                        <Layers size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Source Batch</p>
                                                        <h3 className="text-xl font-black">{selectedBatch.batchNumber}</h3>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase opacity-60">Current Stock</p>
                                                        <p className="text-lg font-black">{selectedBatch.quantity} Units</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase opacity-60">Product Ref</p>
                                                        <p className="text-xs font-bold truncate">{selectedProduct.productName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Volume to Remove</label>
                                                <input required type="number" max={selectedBatch.quantity} placeholder="Qty" value={adjustment.quantity} onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reason Code</label>
                                                <select required value={adjustment.type} onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none appearance-none focus:bg-white transition-all shadow-sm">
                                                    <option value="REMOVE">Normal Removal</option>
                                                    <option value="EXPIRED">Item Expiry</option>
                                                    <option value="DAMAGED">Physical Damage</option>
                                                    <option value="ADJUSTMENT">Audit Correction</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Official Justification</label>
                                            <textarea required rows="2" placeholder="Explain the depletion..." value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none resize-none focus:bg-white transition-all shadow-sm" />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                                                <Camera size={14} />
                                                Evidence Required
                                            </label>
                                            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mb-2">
                                                <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Image size (before adding)</p>
                                                <p className="text-[10px] font-semibold text-amber-900">Max {IMAGE_SPECS.evidencePhoto.maxFileSizeLabel}. {IMAGE_SPECS.evidencePhoto.formats}.</p>
                                            </div>
                                            <div className="relative">
                                                <input type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handlePhotoChange} className="hidden" id="evidence-upload-page" />
                                                <label htmlFor="evidence-upload-page" className="flex flex-col items-center justify-center gap-2 w-full p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-sm font-black cursor-pointer hover:bg-white hover:border-rose-300 transition-all group">
                                                    <Upload size={24} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                                                    <span className="text-slate-500 group-hover:text-rose-600 transition-colors">
                                                        {evidencePhoto ? evidencePhoto.name : 'Capture Evidence'}
                                                    </span>
                                                </label>
                                            </div>
                                            {evidencePreview && (
                                                <div className="mt-4 relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-slate-100 shadow-lg">
                                                    <img src={evidencePreview} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => { setEvidencePhoto(null); setEvidencePreview(null); }} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"><X size={16} /></button>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Syncing...' : 'Authenticate Removal'}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-400 mb-6 font-black italic">
                                            -
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Select Batch</h3>
                                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs uppercase tracking-widest opacity-60">Choose a product and a specific batch on the left to activate removal fields</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>
            </div>

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
