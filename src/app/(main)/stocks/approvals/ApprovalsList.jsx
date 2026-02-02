'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Box,
    Hash,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { stockLogService } from '@/lib/api';

export default function ApprovalsList() {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [notification, setNotification] = useState(null);

    const loadPending = async () => {
        try {
            setLoading(true);
            const data = await stockLogService.getPending();
            setPendingRequests(data);
        } catch (error) {
            console.error('Failed to load pending requests:', error);
            showNotification('Failed to load pending requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPending();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAction = async (id, approved) => {
        setProcessingId(id);
        try {
            await stockLogService.approve(id, approved);
            showNotification(approved ? 'Request approved successfully!' : 'Request rejected successfully!');
            loadPending();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-widest mb-2">
                        <div className="w-8 h-[2px] bg-rose-600 rounded-full" />
                        Governance Desk
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Removal Approvals</h1>
                    <p className="text-slate-500 mt-2 font-medium">Review and approve pending stock removal requests.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <button
                        onClick={loadPending}
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </motion.div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {loading && pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Loader2 className="animate-spin text-rose-600" size={48} />
                        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Awaiting pending requests...</p>
                    </div>
                ) : pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-32 gap-6 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-slate-900">All Clear!</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest leading-loose">No removal requests currently pending your authorization.</p>
                        </div>
                    </div>
                ) : (
                    pendingRequests.map((request, index) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Photo Evidence Preview */}
                                <div className="lg:w-72 h-72 lg:h-auto relative bg-slate-900 overflow-hidden shrink-0 group cursor-pointer" onClick={() => setSelectedPhoto(request.evidencePhoto)}>
                                    {request.evidencePhoto ? (
                                        <>
                                            <img src={request.evidencePhoto} alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl text-slate-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                    <Eye size={14} /> Full View
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                                            <ImageIcon size={40} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No photo provided</p>
                                        </div>
                                    )}
                                </div>

                                {/* Content Info */}
                                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between gap-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3">
                                                    <Clock size={12} /> Pending Approval
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                                    Removal of {request.quantity} units
                                                </h3>
                                                <p className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-tighter">
                                                    {request.Product?.productName} • ID: PROD-{request.productId}
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Manager's Justification</p>
                                                <p className="text-sm font-bold text-slate-700 italic leading-relaxed">"{request.reason || 'No reason specified.'}"</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested By</p>
                                                        <p className="text-xs font-black text-slate-900">
                                                            {request.performer?.emailAddress}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                                        <Hash size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Batch Source</p>
                                                        <p className="text-xs font-black text-slate-900">{request.StockBatch?.batchNumber || 'Direct Product Stock'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                                                        <AlertTriangle size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason Code</p>
                                                        <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{request.type}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                                        <button
                                            disabled={processingId === request.id}
                                            onClick={() => handleAction(request.id, true)}
                                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
                                        >
                                            {processingId === request.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                            Authorize Removal
                                        </button>
                                        <button
                                            disabled={processingId === request.id}
                                            onClick={() => handleAction(request.id, false)}
                                            className="flex-1 py-4 bg-white border border-slate-200 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-3"
                                        >
                                            <XCircle size={16} />
                                            Reject Request
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Photo Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 lg:p-20">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setSelectedPhoto(null)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-full max-h-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                            <img src={selectedPhoto} alt="Full Evidence" className="w-full h-full object-contain" />
                            <button onClick={() => setSelectedPhoto(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all"><XCircle size={24} /></button>
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
