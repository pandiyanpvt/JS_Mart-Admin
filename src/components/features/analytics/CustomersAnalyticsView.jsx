'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { analyticsService } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function CustomersAnalyticsView() {
    const [activeRange, setActiveRange] = useState('1y');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    const load = async (range = activeRange) => {
        try {
            setLoading(true);
            setError('');
            const res = await analyticsService.getSummary(range);
            setData(res);
        } catch (e) {
            console.error('Failed to load customer analytics:', e);
            setError(e?.message || 'Failed to load customer analytics');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(activeRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRange]);

    const topCustomers = useMemo(() => data?.topCustomers || [], [data]);
    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));

    const chartData = useMemo(() => topCustomers.slice(0, 8).map(c => ({
        name: c.name,
        spend: Number(c.spend || 0),
        orders: Number(c.orders || 0),
        aov: Number(c.aov || 0)
    })), [topCustomers]);

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '—';
        return d.toLocaleDateString();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Analysis</h1>
                    <p className="text-slate-500 text-sm font-medium">Understand retention, repeat purchases, and top customers.</p>
                </div>
                <div className="flex items-center gap-3 p-1.5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
                    {['24h', '7d', '30d', '1y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setActiveRange(range)}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                activeRange === range
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-slate-100 mx-1" />
                    <button
                        onClick={() => load(activeRange)}
                        className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Customers</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? '—' : (data?.metrics?.activeCustomers ?? 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">New Customers</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? '—' : (data?.metrics?.newCustomers ?? 0)}</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Repeat Rate</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{loading ? '—' : `${(data?.metrics?.repeatRate ?? 0).toFixed(1)}%`}</h3>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900">Top Customers by Spend</h2>
                    <p className="text-xs text-slate-500 mb-6">Net spend in selected range</p>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(v) => formatCurrency(v)}
                                />
                                <Bar dataKey="spend" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900">Orders per Customer</h2>
                    <p className="text-xs text-slate-500 mb-6">Top customers by order count</p>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="orders" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Top Customers</h2>
                        <p className="text-xs text-slate-500">Highest spend in the selected range</p>
                    </div>
                    <Link href="/users/customers" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View Customers</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Avg Order</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Last Order</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Spend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 w-56 bg-slate-100 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : topCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No customer spending data for this range. Try selecting <strong>1Y</strong>.
                                    </td>
                                </tr>
                            ) : (
                                topCustomers.map((c) => (
                                    <tr key={c.userId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                    <Users size={16} className="text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{c.orders}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatCurrency(c.aov)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">{formatDate(c.lastOrderDate)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-emerald-700">{formatCurrency(c.spend)}</td>
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

