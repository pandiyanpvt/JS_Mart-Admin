'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    X,
    Loader2,
    CheckCircle2,
    Box,
    Hash,
    RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { productService, stockService, supplierService } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NumberInputNoScroll from '@/components/ui/NumberInputNoScroll';

export default function AddStockForm() {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSearchQuery, setProductSearchQuery] = useState('');
    const [supplierModalOpen, setSupplierModalOpen] = useState(false);
    const [isSavingSupplier, setIsSavingSupplier] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        companyName: '',
        companyContactNo: '',
        companyEmail: '',
        companyAddress: '',
        socialMediaLink: '',
        contactPersonName: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
        companyLogo: null,
    });

    // Form state for new batch
    const [newBatch, setNewBatch] = useState({
        productId: '',
        batchNumber: '',
        quantity: '',
        purchasePrice: '',
        expiryDate: '',
        manufactureDate: '',
        supplierId: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [products, suppliersList] = await Promise.all([
                productService.getAll(),
                supplierService.getAll()
            ]);
            setAllProducts(products);
            setSuppliers(suppliersList);
        } catch (error) {
            console.error('Failed to load data:', error);
            showNotification('Failed to synchronize system data', 'error');
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

    const generateBatchNumber = (product) => {
        if (!product) return '';
        const prefix = product.productName.substring(0, 3).toUpperCase();
        const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `BN-${prefix}-${datePart}-${randomPart}`;
    };

    const openSupplierModal = () => {
        setNewSupplier({
            companyName: '',
            companyContactNo: '',
            companyEmail: '',
            companyAddress: '',
            socialMediaLink: '',
            contactPersonName: '',
            contactPersonPhone: '',
            contactPersonEmail: '',
            companyLogo: null,
        });
        setSupplierModalOpen(true);
    };

    const closeSupplierModal = () => {
        if (!isSavingSupplier) setSupplierModalOpen(false);
    };

    const handleCreateSupplier = async (e) => {
        e.preventDefault();
        const name = newSupplier.companyName.trim();
        if (!name) {
            showNotification('Company name is required', 'error');
            return;
        }
        setIsSavingSupplier(true);
        try {
            const formData = new FormData();
            formData.append('companyName', name);
            ['companyContactNo', 'companyEmail', 'companyAddress', 'socialMediaLink', 'contactPersonName', 'contactPersonPhone', 'contactPersonEmail'].forEach((key) => {
                const v = newSupplier[key];
                if (v !== null && v !== undefined && String(v).trim() !== '') {
                    formData.append(key, typeof v === 'string' ? v.trim() : v);
                }
            });
            if (newSupplier.companyLogo instanceof File) {
                formData.append('companyLogo', newSupplier.companyLogo);
            }

            const created = await supplierService.create(formData);
            const suppliersList = await supplierService.getAll();
            setSuppliers(suppliersList);
            setNewBatch((prev) => ({ ...prev, supplierId: String(created.id) }));
            setSupplierModalOpen(false);
            showNotification('Supplier added');
        } catch (error) {
            showNotification(error.message || 'Could not create supplier', 'error');
        } finally {
            setIsSavingSupplier(false);
        }
    };

    const supplierLabel = (s) => {
        const company = s.companyName || s.name || 'Supplier';
        const contact = s.contactPersonName || s.contactPerson;
        return contact ? `${company} (${contact})` : company;
    };

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        if (!newBatch.productId) {
            showNotification('Please select a product', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            await stockService.addBatch({
                ...newBatch,
                quantity: parseInt(newBatch.quantity),
                purchasePrice: parseFloat(newBatch.purchasePrice),
                sellingPrice: 0,
                manufactureDate: newBatch.manufactureDate || null,
                expiryDate: newBatch.expiryDate || null,
                supplierId: newBatch.supplierId || null
            });

            showNotification('New stock batch finalized successfully!');
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Procure New Batch</h1>
                    <p className="text-slate-500 mt-2 font-medium">Add new stock to your inventory.</p>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <form onSubmit={handleBatchSubmit} className="p-10 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Selection Column */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Target Product</label>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={productSearchQuery}
                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    />
                                </div>

                                <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] overflow-hidden">
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                                        {loading ? (
                                            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-3">
                                                <Loader2 className="animate-spin" size={24} />
                                                <p className="text-xs font-bold uppercase">Syncing Catalog...</p>
                                            </div>
                                        ) : allProducts.filter(p => !productSearchQuery || p.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.id.toString().includes(productSearchQuery)).length === 0 ? (
                                            <div className="p-8 text-center text-slate-400">
                                                <p className="text-sm font-bold">No products matched your search</p>
                                            </div>
                                        ) : (
                                            allProducts
                                                .filter(p => !productSearchQuery || p.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.id.toString().includes(productSearchQuery))
                                                .map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewBatch({ ...newBatch, productId: p.id, batchNumber: generateBatchNumber(p) });
                                                            setProductSearchQuery(p.productName);
                                                        }}
                                                        className={cn(
                                                            "w-full flex items-center gap-4 p-4 transition-all text-left group",
                                                            newBatch.productId === p.id ? "bg-white shadow-sm ring-1 ring-inset ring-indigo-500/20" : "hover:bg-white/80"
                                                        )}
                                                    >
                                                        <div className="w-14 h-14 rounded-xl bg-slate-200 overflow-hidden relative border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                                                            {p.images?.[0] ? <Image src={p.images[0].productImg} alt="" fill sizes="80px" className="object-cover" /> : <Box size={24} className="absolute inset-0 m-auto text-slate-400" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-slate-900 truncate">{p.productName}</p>
                                                                {newBatch.productId === p.id && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: PROD-{p.id} • ${parseFloat(p.price || 0).toFixed(2)}</p>
                                                        </div>
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Fields Column */}
                        <div className="space-y-8">
                            <AnimatePresence mode="wait">
                                {newBatch.productId ? (
                                    <motion.div
                                        key="form-fields"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                                <Box size={120} />
                                            </div>
                                            <div className="relative z-10 flex items-center gap-6">
                                                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border border-white/20 relative overflow-hidden shrink-0">
                                                    {allProducts.find(p => p.id === newBatch.productId)?.images?.[0] ? (
                                                        <Image src={allProducts.find(p => p.id === newBatch.productId).images[0].productImg} alt="" fill sizes="80px" className="object-cover" />
                                                    ) : <Box size={40} className="absolute inset-0 m-auto opacity-30" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Selected Entity</p>
                                                    <h3 className="text-2xl font-black truncate">{allProducts.find(p => p.id === newBatch.productId)?.productName}</h3>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Target Batch</p>
                                                            <p className="text-sm font-bold font-mono tracking-tight">{newBatch.batchNumber}</p>
                                                        </div>
                                                        <div className="w-[1px] h-8 bg-white/10" />
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">Catalog Value</p>
                                                            <p className="text-sm font-bold">${parseFloat(allProducts.find(p => p.id === newBatch.productId)?.price || 0).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantity (Units)</label>
                                                <NumberInputNoScroll required placeholder="Enter amount" value={newBatch.quantity} onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Procurement Cost ($)</label>
                                                <NumberInputNoScroll required step="0.01" placeholder="Per unit" value={newBatch.purchasePrice} onChange={(e) => setNewBatch({ ...newBatch, purchasePrice: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Manufacture Date</label>
                                                <input type="date" value={newBatch.manufactureDate} onChange={(e) => setNewBatch({ ...newBatch, manufactureDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Expiry Horizon</label>
                                                <input type="date" value={newBatch.expiryDate} onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3 pl-1 pr-1">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Supplier Source <span className="font-semibold text-slate-300 normal-case tracking-normal">(optional)</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={openSupplierModal}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                                                    title="Add new supplier"
                                                >
                                                    <Plus size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                            <select
                                                value={newBatch.supplierId}
                                                onChange={(e) => setNewBatch({ ...newBatch, supplierId: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white transition-all"
                                            >
                                                <option value="">No supplier</option>
                                                {suppliers.map(s => (
                                                    <option key={s.id} value={s.id}>{supplierLabel(s)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                            <span>{isSubmitting ? 'Syncing...' : 'Confirm Stock Inbound'}</span>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6">
                                            <Hash size={32} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Select a Product</h3>
                                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs uppercase tracking-widest opacity-60">Complete the selection on the left to activate procurement fields</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>
            </div>

            {/* Add supplier modal */}
            <AnimatePresence>
                {supplierModalOpen && (
                    <motion.div
                        key="supplier-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[280] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-supplier-title"
                        onClick={closeSupplierModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            onClick={(ev) => ev.stopPropagation()}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-300/40"
                        >
                            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 pb-4 bg-white border-b border-slate-100 rounded-t-[2rem]">
                                <div>
                                    <h2 id="add-supplier-title" className="text-lg font-black text-slate-900 tracking-tight">New supplier</h2>
                                    <p className="text-xs font-semibold text-slate-500 mt-1">Saved suppliers appear in the dropdown.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeSupplierModal}
                                    disabled={isSavingSupplier}
                                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSupplier} className="p-6 pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Company name *</label>
                                    <input
                                        type="text"
                                        value={newSupplier.companyName}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, companyName: e.target.value })}
                                        placeholder="e.g. Fresh foods LTD"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Company phone</label>
                                        <input
                                            type="text"
                                            value={newSupplier.companyContactNo}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, companyContactNo: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Company email</label>
                                        <input
                                            type="email"
                                            value={newSupplier.companyEmail}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, companyEmail: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Address</label>
                                    <textarea
                                        value={newSupplier.companyAddress}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, companyAddress: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Social / web</label>
                                    <input
                                        type="url"
                                        value={newSupplier.socialMediaLink}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, socialMediaLink: e.target.value })}
                                        placeholder="https://"
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Contact person</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Name</label>
                                        <input
                                            type="text"
                                            value={newSupplier.contactPersonName}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, contactPersonName: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Phone</label>
                                        <input
                                            type="text"
                                            value={newSupplier.contactPersonPhone}
                                            onChange={(e) => setNewSupplier({ ...newSupplier, contactPersonPhone: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Contact email</label>
                                    <input
                                        type="email"
                                        value={newSupplier.contactPersonEmail}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, contactPersonEmail: e.target.value })}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Logo (optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewSupplier({ ...newSupplier, companyLogo: e.target.files?.[0] || null })}
                                        className="w-full text-xs font-bold text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:font-bold"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeSupplierModal}
                                        disabled={isSavingSupplier}
                                        className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingSupplier}
                                        className="flex-1 py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-wider hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSavingSupplier ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                        {isSavingSupplier ? 'Saving…' : 'Create supplier'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
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
