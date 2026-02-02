'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Target,
    Activity,
    CreditCard,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { analyticsService } from '@/lib/api';

export default function AnalyticsView() {
    const [activeRange, setActiveRange] = useState('7d');
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
            console.error('Failed to load analytics:', e);
            setError(e?.message || 'Failed to load analytics');
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

    const palette = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#0ea5e9', '#a78bfa', '#f59e0b'];

    const categoryData = useMemo(() => {
        const items = data?.breakdowns?.categoryShare || [];
        return items.map((c, idx) => ({
            name: c.name,
            value: c.value,
            color: palette[idx % palette.length],
        }));
    }, [data]);

    const paymentData = useMemo(() => {
        const mix = data?.breakdowns?.paymentMix || {};
        return Object.entries(mix)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [data]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Intelligence</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time performance analytics and market insights.</p>
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

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-emerald-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <DollarSign size={24} />
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Revenue</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {loading ? '—' : formatCurrency(data?.metrics?.netRevenue)}
                    </h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+8.2%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Orders</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {loading ? '—' : (data?.metrics?.totalOrders ?? 0)}
                    </h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-purple-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Target size={24} />
                        </div>
                        <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Repeat</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Repeat Rate</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {loading ? '—' : `${(data?.metrics?.repeatRate ?? 0).toFixed(1)}%`}
                    </h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+2.4%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg. Ticket</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                        {loading ? '—' : formatCurrency(data?.metrics?.aov)}
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue & Target Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Performance Index</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue vs Daily Target</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-xs font-bold text-slate-600">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <span className="text-xs font-bold text-slate-600">Target</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full min-w-0" style={{ minWidth: 0, minHeight: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.series || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        borderRadius: '16px',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '12px 16px',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Distribution */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-slate-900 mb-2">Market Share</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Sales by Product Type</p>

                    <div className="h-[280px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 text-white p-3 rounded-2xl border-none shadow-xl">
                                                    <p className="text-xs font-black uppercase tracking-wider">{payload[0].name}</p>
                                                    <p className="text-lg font-black text-emerald-400">{payload[0].value}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-3xl font-black text-slate-900">100%</p>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Revenue</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4 flex-1">
                        {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wider truncate">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-900 min-w-[40px] text-right">{cat.value}%</span>
                                </div>
                            </div>
                        ))}
                        {!loading && categoryData.length === 0 ? (
                            <p className="text-sm text-slate-500">No category sales data.</p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Mix */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Payment Mix</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Orders by payment method</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CreditCard size={20} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {paymentData.map((p) => (
                            <div key={p.name} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{p.name}</span>
                                <span className="text-sm font-black text-slate-900">{p.value}</span>
                            </div>
                        ))}
                        {!loading && paymentData.length === 0 ? (
                            <p className="text-sm text-slate-500">No payment data.</p>
                        ) : null}
                    </div>

                    <div className="mt-10 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                            <span className="block text-sm font-black mb-0.5">Operational Insight</span>
                            Promote your preferred payment methods to reduce failed deliveries and speed up settlements.
                        </p>
                    </div>
                </div>

                {/* Customer Retention Metrics */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
                    </div>

                    <h2 className="text-xl font-black mb-8 relative">Customer Loyalty Hub</h2>

                    <div className="grid grid-cols-2 gap-4 relative">
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">New Customers</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">{loading ? '—' : (data?.metrics?.newCustomers ?? 0)}</h3>
                                <span className="text-emerald-400 text-xs font-bold">range</span>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Returning</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">{loading ? '—' : (data?.metrics?.returningCustomers ?? 0)}</h3>
                                <span className="text-emerald-400 text-xs font-bold">{loading ? '' : `${(data?.metrics?.repeatRate ?? 0).toFixed(1)}%`}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Refund Rate</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-3xl font-black">{loading ? '—' : `${(data?.metrics?.refundRate ?? 0).toFixed(1)}%`}</h3>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Active Customers</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">{loading ? '—' : (data?.metrics?.activeCustomers ?? 0)}</h3>
                                <span className="text-blue-400 text-xs font-bold">range</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-white text-slate-900 rounded-3xl flex items-center justify-between shadow-2xl shadow-emerald-900/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refunded Amount</p>
                                <p className="text-lg font-black tracking-tight">{loading ? '—' : formatCurrency(data?.metrics?.refundedAmount)}</p>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-slate-100 animate-spin-slow flex items-center justify-center">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
