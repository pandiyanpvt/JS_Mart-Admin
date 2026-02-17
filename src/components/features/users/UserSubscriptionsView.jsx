'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, User as UserIcon, CheckCircle2, XCircle, Loader2, Download, Gem, CreditCard, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { membershipService } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function UserSubscriptionsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [subscriptions, setSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        setIsLoading(true);
        try {
            const data = await membershipService.getAllSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const exportToExcel = () => {
        const exportData = subscriptions.map(s => ({
            'User': s.user?.fullName || 'N/A',
            'Email': s.user?.emailAddress || 'N/A',
            'Plan': s.plan?.name || 'N/A',
            'Status': s.status,
            'Start Date': new Date(s.startDate).toLocaleDateString(),
            'End Date': new Date(s.endDate).toLocaleDateString(),
            'Created At': new Date(s.createdAt).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Subscriptions');
        XLSX.writeFile(wb, 'User_Subscriptions.xlsx');
    };

    const filteredSubscriptions = subscriptions.filter(s => {
        const query = searchQuery.toLowerCase();
        const userName = (s.user?.fullName || '').toLowerCase();
        const userEmail = (s.user?.emailAddress || '').toLowerCase();
        const planName = (s.plan?.name || '').toLowerCase();

        const matchesSearch = userName.includes(query) || userEmail.includes(query) || planName.includes(query);
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Subscriptions</h1>
                    <p className="text-slate-500 font-medium">Manage and monitor all active and historical user memberships.</p>
                </div>
                <button
                    onClick={exportToExcel}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by user or plan..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'ACTIVE', 'CANCELLED', 'EXPIRED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                statusFilter === status
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                            )}
                        >
                            {status === 'All' ? 'All Status' : status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">User / Account</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Subscription Plan</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Duration</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Payment ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-indigo-600" size={32} />
                                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading subscriptions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-400 font-bold">
                                        No subscriptions found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{s.user?.fullName || 'Deleted User'}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{s.user?.emailAddress || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                    s.plan?.level === 2 ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                                                )}>
                                                    {s.plan?.level === 2 ? <Gem size={16} /> : <CreditCard size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{s.plan?.name || 'Unknown Plan'}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Level {s.plan?.level || 1}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <p className="text-xs font-bold">{new Date(s.startDate).toLocaleDateString()}</p>
                                                    <span className="text-slate-300">→</span>
                                                    <p className="text-xs font-bold text-indigo-600">{new Date(s.endDate).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-1">
                                                    <Clock size={10} />
                                                    Created: {new Date(s.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                s.status === 'ACTIVE'
                                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                                    : s.status === 'CANCELLED'
                                                        ? "bg-red-50 border-red-100 text-red-600"
                                                        : "bg-slate-50 border-slate-100 text-slate-500"
                                            )}>
                                                {s.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {s.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-mono text-slate-400 font-bold">{s.paymentId || '---'}</p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
