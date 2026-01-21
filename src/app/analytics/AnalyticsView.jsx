'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Download,
    Filter,
    Layers,
    MousePointer2,
    DollarSign,
    Target,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { StatsCard } from '@/components/StatsCard';

const salesData = [
    { name: 'Mon', revenue: 4500, orders: 120, target: 4000 },
    { name: 'Tue', revenue: 5200, orders: 145, target: 4000 },
    { name: 'Wed', revenue: 4800, orders: 130, target: 4000 },
    { name: 'Thu', revenue: 6100, orders: 170, target: 4000 },
    { name: 'Fri', revenue: 5900, orders: 160, target: 4000 },
    { name: 'Sat', revenue: 8200, orders: 220, target: 4000 },
    { name: 'Sun', revenue: 7500, orders: 190, target: 4000 },
];

const categoryData = [
    { name: 'Vegetables', value: 35, color: '#10b981', icon: '🥦' },
    { name: 'Fruits', value: 25, color: '#34d399', icon: '🍎' },
    { name: 'Dairy', value: 20, color: '#6ee7b7', icon: '🥛' },
    { name: 'Meat', value: 15, color: '#a7f3d0', icon: '🥩' },
    { name: 'Bakery', value: 5, color: '#d1fae5', icon: '🥐' },
];

const trafficData = [
    { source: 'Direct Search', value: 45, color: 'bg-emerald-500' },
    { source: 'Social Media', value: 30, color: 'bg-teal-500' },
    { source: 'Referral', value: 15, color: 'bg-emerald-400' },
    { source: 'Email', value: 10, color: 'bg-emerald-300' },
];

export default function AnalyticsView() {
    const [mounted, setMounted] = useState(false);
    const [activeRange, setActiveRange] = useState('Last 7 Days');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-20 bg-slate-100 rounded-3xl" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
                </div>
                <div className="h-96 bg-slate-100 rounded-3xl" />
            </div>
        );
    }

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
                                (range === '7d' && activeRange === '7d') || activeRange === range
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                    <div className="w-[1px] h-6 bg-slate-100 mx-1" />
                    <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                        <Download size={20} />
                    </button>
                </div>
            </div>

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
                    <h3 className="text-2xl font-black text-slate-900 mt-1">$52,489.00</h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+8.2%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Orders</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">1,284</h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-purple-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <MousePointer2 size={24} />
                        </div>
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">-0.5%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Conv. Rate</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">3.42%</h3>
                </div>

                <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-200 transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+2.4%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg. Ticket</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">$40.87</h3>
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
                            <AreaChart data={salesData}>
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
                                <Area
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#e2e8f0"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
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
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                        {cat.icon}
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-wider">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                                    </div>
                                    <span className="text-xs font-black text-slate-900 min-w-[30px]">{cat.value}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Traffic Acquisition */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">User Acquisition</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top performing channels</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 rounded-xl transition-all">Details</button>
                    </div>

                    <div className="space-y-6">
                        {trafficData.map((item) => (
                            <div key={item.source} className="group cursor-pointer">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.1em] mb-3">
                                    <span className="text-slate-500">{item.source}</span>
                                    <span className="text-slate-900">{item.value}% Impact</span>
                                </div>
                                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden relative border border-slate-100/50">
                                    <div
                                        className={cn("h-full transition-all duration-1000 relative rounded-full", item.color)}
                                        style={{ width: `${item.value}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                            <span className="block text-sm font-black mb-0.5">Growth Insight</span>
                            Direct search has grown by 15% this week. SEO optimization is yielding positive results.
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
                                <h3 className="text-3xl font-black">342</h3>
                                <span className="text-emerald-400 text-xs font-bold">+15%</span>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Returning</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">842</h3>
                                <span className="text-emerald-400 text-xs font-bold">+5%</span>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Satisfaction</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-3xl font-black">4.8</h3>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />)}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/10 transition-all">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Avg. Session</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black">8m</h3>
                                <span className="text-blue-400 text-xs font-bold">+2m</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 p-6 bg-white text-slate-900 rounded-3xl flex items-center justify-between shadow-2xl shadow-emerald-900/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loyalty Target</p>
                                <p className="text-lg font-black tracking-tight">85% Goal Achievement</p>
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
