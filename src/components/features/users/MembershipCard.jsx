'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Zap, Gem, Download, Info, QrCode, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function MembershipCard({ user, onClose }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const cardRef = useRef(null);

    if (!user) return null;

    const subscription = user?.activeSubscription;
    const isPlus = subscription?.plan?.level === 2;
    const planName = subscription?.plan?.name || "Free Tier";

    const userIdStr = String(user?.id || 0).padStart(6, '0');
    const cardNumber = `JSM ${userIdStr.slice(0, 3)} ${userIdStr.slice(3, 6)} ${new Date(user?.createdAt || Date.now()).getFullYear()}`;

    const handleDownloadPDF = async () => {
        if (!cardRef.current) return;

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: null,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [85.6, 54]
            });

            pdf.addImage(imgData, "PNG", 0, 0, 85.6, 54);
            pdf.save(`${user?.fullName || 'User'}_JSMart_Membership.pdf`);
        } catch (error) {
            console.error("PDF Export error:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 md:p-12 items-center">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900">Virtual Membership Card</h3>
                    <p className="text-slate-500 font-medium">Digital ID for {user.fullName}</p>
                </div>

                <div className="flex flex-col items-center justify-center py-10 w-full">
                    <div
                        className="relative w-[340px] h-[210px] md:w-[500px] md:h-[310px] cursor-pointer group"
                        style={{ perspective: "2000px" }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <motion.div
                            className="w-full h-full relative"
                            style={{ transformStyle: "preserve-3d" }}
                            initial={false}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* FRONT SIDE */}
                            <div
                                ref={!isFlipped ? cardRef : null}
                                className={cn(
                                    "absolute inset-0 w-full h-full rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-20",
                                    isPlus ? "bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF4500]" : "bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899]"
                                )}
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    transform: "translateZ(1px)"
                                }}
                            >
                                {/* Premium Overlays */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
                                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 pointer-events-none shimmer-card" />

                                <div className="relative h-full flex flex-col justify-between text-white z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-inner">
                                                    <Zap className="fill-white" size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xl md:text-3xl font-black tracking-tighter leading-none">JS MART</span>
                                                    <span className="text-[10px] font-black tracking-[0.4em] opacity-80 uppercase">Australia</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-2xl px-5 py-2 rounded-2xl border border-white/10 shadow-xl">
                                            {isPlus ? <Gem size={16} className="text-amber-300" /> : <Zap size={16} className="text-white" />}
                                            <span className="text-[12px] font-black uppercase tracking-[0.2em]">{planName}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-left">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-11 md:w-18 md:h-14 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),0_4px_8px_rgba(0,0,0,0.2)] flex items-center justify-center overflow-hidden relative">
                                                <div className="absolute inset-0 border border-black/10 rounded-xl" />
                                                <div className="flex flex-col gap-1.5 w-full items-center opacity-30">
                                                    {[...Array(4)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black" />)}
                                                </div>
                                            </div>
                                            <div className="opacity-40">
                                                <QrCode size={45} strokeWidth={1.5} />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase truncate drop-shadow-2xl">
                                            {user?.fullName || "Valued Member"}
                                        </h3>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                        <div className="flex gap-10">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Member Since</p>
                                                <p className="text-xs md:text-lg font-black tracking-widest">
                                                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-left">Valid Thru</p>
                                                <p className="text-xs md:text-lg font-black tracking-widest text-emerald-300 drop-shadow-sm">
                                                    {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' }) : "∞"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="opacity-20 translate-y-2">
                                            <Crown size={60} strokeWidth={1} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BACK SIDE - COMPLETELY REDESIGNED */}
                            <div
                                ref={isFlipped ? cardRef : null}
                                className="absolute inset-0 w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-[#111] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col"
                                style={{
                                    transform: "rotateY(180deg) translateZ(1px)",
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden"
                                }}
                            >
                                {/* Matte Texture Overlay */}
                                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                                {/* Magnetic Strip */}
                                <div className="relative w-full h-14 md:h-16 bg-black mt-10 md:mt-12 shadow-2xl z-10">
                                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black opacity-50" />
                                </div>

                                <div className="relative flex-1 px-8 md:px-12 py-6 flex flex-col gap-6">

                                    {/* Signature & CVC Row */}
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1 space-y-1">
                                            <div className="h-10 md:h-12 bg-white rounded flex items-center px-4 overflow-hidden relative">
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
                                                <span className="font-handwriting text-black text-lg md:text-xl font-bold italic tracking-wider font-mono z-10" style={{ fontFamily: 'cursive' }}>
                                                    Authorized Signature
                                                </span>
                                            </div>
                                            <p className="text-[8px] text-gray-500 uppercase tracking-widest pl-1">Authorized Signature</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="h-10 md:h-12 w-16 md:w-20 bg-white/10 rounded border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-white font-mono font-bold text-lg italic">707</span>
                                            </div>
                                            <p className="text-[8px] text-gray-500 uppercase tracking-widest text-center">CVC</p>
                                        </div>
                                    </div>

                                    {/* Info & QR Row */}
                                    <div className="flex items-end justify-between mt-auto mb-4">
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold text-left">Member ID</p>
                                                <p className="text-sm md:text-base text-white font-mono tracking-widest text-shadow-sm text-left">
                                                    {cardNumber}
                                                </p>
                                            </div>
                                            <p className="text-[9px] text-gray-600 max-w-[200px] leading-relaxed text-left">
                                                Issued by JS Mart Australia.
                                                <br />This digital token verifies active membership status.
                                            </p>
                                        </div>

                                        <div className="bg-white p-2 rounded-xl shadow-lg">
                                            <QrCode size={60} className="text-black" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-4">
                    <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <Info size={18} />
                        Flip Card
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl"
                    >
                        <Download size={18} />
                        {isDownloading ? "..." : "Download PDF"}
                    </button>
                </div>
            </div>
        </div>
    );
}
