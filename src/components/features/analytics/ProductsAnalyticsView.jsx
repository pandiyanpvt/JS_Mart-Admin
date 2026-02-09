'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { analyticsService } from '@/lib/api';
import { cn } from '@/lib/utils';
import { AlertCircle, Package, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ProductsAnalyticsView() {
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
            console.error('Failed to load product analytics:', e);
            setError(e?.message || 'Failed to load product analytics');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(activeRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeRange]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));

    const topProducts = useMemo(() => data?.topProducts || [], [data]);
    const chartData = useMemo(() => topProducts.slice(0, 8).map(p => ({
        name: p.name,
        revenue: Number(p.revenue || 0),
        sold: Number(p.sold || 0),
        avgPrice: Number(p.avgUnitPrice || 0),
    })), [topProducts]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Analysis</h1>
                    <p className="text-slate-500 text-sm font-medium">See what products drive revenue and quantity sold.</p>
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

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900">Top Products by Revenue</h2>
                    <p className="text-xs text-slate-500 mb-6">Revenue (after discounts) in selected range</p>
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
                                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900">Units Sold</h2>
                    <p className="text-xs text-slate-500 mb-6">Top products by quantity sold</p>
                    <div className="h-[320px] w-full min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="sold" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
                        <p className="text-xs text-slate-500">Highest revenue in the selected range</p>
                    </div>
                    <Link href="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View Products</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Product</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Avg Price</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Discount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded animate-pulse" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : topProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                                        No product sales data for this range. Try selecting <strong>1Y</strong>.
                                    </td>
                                </tr>
                            ) : (
                                topProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                    <Package size={16} className="text-slate-500" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900 truncate">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{p.sold}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">{formatCurrency(p.avgUnitPrice)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-rose-700">{formatCurrency(p.totalDiscount)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-emerald-700">{formatCurrency(p.revenue)}</td>
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

