'use client';

import React, { useState } from 'react';
import {
    Layout,
    Image as ImageIcon,
    FileText,
    Star,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Settings,
    MoreHorizontal,
    Monitor,
    Smartphone,
    Globe,
    CheckCircle2,
    Clock,
    X,
    Upload,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { cn } from '@/lib/utils';

const initialBanners = [
    { id: 1, title: 'Summer Fresh Vegetables', site: 'Homepage', status: 'Active', updated: '2 days ago', image: '/images/potatoes.png' },
    { id: 2, title: 'Dairy Essentials 20% Off', site: 'Homepage', status: 'Draft', updated: '5 hours ago', image: '/images/apples.png' },
];

const initialPages = [
    { id: 1, name: 'About JS Mart', slug: '/about', status: 'Published', author: 'Admin', views: '1.2k' },
    { id: 2, name: 'Privacy Policy', slug: '/privacy', status: 'Published', author: 'System', views: '450' },
    { id: 3, name: 'Delivery Information', slug: '/delivery-info', status: 'Draft', author: 'Admin', views: '0' },
];

export default function CmsView() {
    const [activeSection, setActiveSection] = useState('Banners');
    const [searchQuery, setSearchQuery] = useState('');
    const [banners, setBanners] = useState(initialBanners);
    const [pages, setPages] = useState(initialPages);

    const sections = [
        { name: 'Banners', icon: ImageIcon, count: banners.length },
        { name: 'Pages', icon: Layout, count: pages.length },
        { name: 'Blog', icon: FileText, count: 8 },
        { name: 'Reviews', icon: Star, count: 124 },
    ];

    const filteredBanners = banners.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredPages = pages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-display uppercase">Store Content Hub</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage banners, landing pages, and customer narratives.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
                    <Plus size={18} />
                    <span>Create Content</span>
                </button>
            </div>

            {/* CMS Navigation */}
            <div className="flex gap-4 p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm w-fit overflow-x-auto no-scrollbar">
                {sections.map((section) => (
                    <button
                        key={section.name}
                        onClick={() => setActiveSection(section.name)}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeSection === section.name
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <section.icon size={18} />
                        <span>{section.name}</span>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded-md text-[10px]",
                            activeSection === section.name ? "bg-white/20" : "bg-slate-100 text-slate-500"
                        )}>
                            {section.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder={`Search ${activeSection.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-4 bg-white border border-slate-100 rounded-3xl text-slate-400 hover:text-slate-900 transition-all">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {activeSection === 'Banners' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {filteredBanners.map((banner) => (
                                <div key={banner.id} className="group relative bg-white border border-slate-100 rounded-[2rem] p-4 hover:shadow-2xl hover:border-emerald-100 transition-all duration-500">
                                    <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-slate-100 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <p className="text-white font-black text-lg drop-shadow-md">{banner.title}</p>
                                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{banner.site}</p>
                                        </div>
                                        {/* Mock Image */}
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                            <ImageIcon size={48} className="text-slate-300" />
                                        </div>
                                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-md",
                                                banner.status === 'Active' ? "text-emerald-600" : "text-slate-500"
                                            )}>
                                                {banner.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Clock size={12} />
                                            <span>Updated {banner.updated}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="aspect-[21/9] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-200 hover:text-emerald-300 hover:bg-emerald-50/10 transition-all group">
                                <div className="p-4 bg-slate-50 rounded-3xl mb-4 group-hover:bg-emerald-50">
                                    <Plus size={32} />
                                </div>
                                <span className="font-black uppercase tracking-[0.2em] text-xs">Add Banner</span>
                            </button>
                        </div>
                    )}

                    {activeSection === 'Pages' && (
                        <div className="space-y-4">
                            {filteredPages.map((page) => (
                                <div key={page.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                            <Layout size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">{page.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-bold text-slate-400">{page.slug}</span>
                                                <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Author: {page.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center mt-4 md:mt-0 gap-8">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                                            <span className="text-sm font-black text-slate-900">{page.views}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                page.status === 'Published' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {page.status}
                                            </span>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredBanners.length === 0 && filteredPages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <SearchX size={48} className="text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">No Content Found</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Box (Sticky/Bottom) */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <Globe size={180} className="text-emerald-500" />
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Storefront Live Sync</span>
                        </div>
                        <h2 className="text-2xl font-black text-white">Visual Content Orchestration</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Preview how your banners and pages look across all devices before pushing live. Our real-time engine ensures pixel-perfect content delivery to your customers.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button className="flex flex-col items-center gap-3 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-white group">
                            <Monitor size={32} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Desktop</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-white group">
                            <Smartphone size={32} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Mobile</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
