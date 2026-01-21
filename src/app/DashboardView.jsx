'use client';

import React, { useState, useEffect } from 'react';
import { StatsCard } from "@/components/StatsCard";
import { SalesChart } from "@/components/SalesChart";
import { summaryStats, topProducts, stockMovements } from "@/data/mock";
import {
    ShoppingBag,
    TrendingUp,
    Users,
    ArrowUpRight,
    ChevronRight,
    Package,
    Clock,
    Bell,
    Search,
    LayoutDashboard,
    Zap,
    Download,
    CreditCard,
    Image as ImageIcon,
    Tag,
    Megaphone,
    Settings,
    Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';

export default function DashboardView() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="p-8"><div className="w-full h-96 bg-slate-50 animate-pulse rounded-3xl" /></div>;

    const QuickLinks = [
        { title: 'Flash Sales', href: '/promotions/flash-sales', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        { title: 'Discount Coupons', href: '/promotions/coupons', icon: Tag, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Site Banners', href: '/cms/banners', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Store Settings', href: '/settings', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Upper Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Overview of your store's performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} />
                        Export Data
                    </button>
                    <Link href="/products/add" className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                        <Zap size={16} fill="currentColor" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Summary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase">{stat.title}</span>
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
                                stat.type === 'up' ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                            )}>
                                {stat.type === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full bg-slate-900", stat.type === 'up' ? "bg-emerald-500" : "bg-rose-500")} style={{ width: '70%' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Modules */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QuickLinks.map((link, i) => (
                    <Link key={i} href={link.href} className="group p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", link.bg, link.color)}>
                            <link.icon size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{link.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Manage</p>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analytics Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Revenue Overview</h2>
                            <p className="text-xs text-slate-500">Monthly sales performance</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-100 text-xs font-medium rounded-lg px-3 py-1.5 outline-none">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full">
                        {/* Placeholder for Chart - In real app, pass data props */}
                        <SalesChart />
                    </div>
                </div>

                {/* Right Sidebar - Activity / Top Products */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
                            <Link href="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {topProducts.slice(0, 4).map((product) => (
                                <div key={product.id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 relative overflow-hidden shrink-0 border border-slate-100">
                                        {product.image ? (
                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16} /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                                        <p className="text-xs text-slate-500">{product.sales} sales</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600">{product.revenue}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={100} />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Boost Sales</h3>
                        <p className="text-sm text-slate-300 mb-4">Create a new flash sale campaign to drive revenue.</p>
                        <Link href="/promotions/flash-sales" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all">
                            <Zap size={16} fill="currentColor" /> Create Campaign
                        </Link>
                    </div>
                </div>
            </div>

            {/* Live Activity Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                        <p className="text-xs text-slate-500">Latest transactions from your store</p>
                    </div>
                    <Link href="/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All Orders</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <tr key={item} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">#ORD-202{item}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">Alex Johnson</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                            Completed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">$12{item}.00</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
