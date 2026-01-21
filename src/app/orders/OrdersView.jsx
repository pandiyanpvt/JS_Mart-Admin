'use client';

import React, { useState } from 'react';
import {
    ShoppingBag,
    Search,
    Filter,
    Eye,
    Download,
    Printer,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    ChevronRight,
    X,
    MoreHorizontal,
    ExternalLink,
    AlertCircle,
    BadgeCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const initialOrders = [
    { id: '#12341', customer: 'John Doe', items: 3, total: 145.00, status: 'Delivered', date: '2026-01-18', payment: 'Credit Card' },
    { id: '#12342', customer: 'Jane Smith', items: 1, total: 45.00, status: 'Processing', date: '2026-01-19', payment: 'PayPal' },
    { id: '#12343', customer: 'Robert Brown', items: 5, total: 210.00, status: 'Shipped', date: '2026-01-19', payment: 'Credit Card' },
    { id: '#12344', customer: 'Maria Garcia', items: 2, total: 89.00, status: 'Pending', date: '2026-01-19', payment: 'Cash' },
    { id: '#12345', customer: 'David Lee', items: 4, total: 125.50, status: 'Processing', date: '2026-01-20', payment: 'Google Pay' },
    { id: '#12346', customer: 'Sarah Wilson', items: 2, total: 67.20, status: 'Cancelled', date: '2026-01-20', payment: 'Credit Card' },
];

export default function OrdersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const tabs = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (order.customer || '').toLowerCase().includes((searchQuery || '').toLowerCase());
        const matchesTab = activeTab === 'All' || order.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Delivered': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'Processing': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'Shipped': return "bg-purple-100 text-purple-700 border-purple-200";
            case 'Pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'Cancelled': return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 size={12} />;
            case 'Processing': return <Clock size={12} />;
            case 'Shipped': return <Truck size={12} />;
            case 'Pending': return <Package size={12} />;
            case 'Cancelled': return <X size={12} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Orders List</h1>
                    <p className="text-slate-500 text-sm">Manage logistics, fulfillment, and customer satisfaction.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Printer size={18} />
                        <span>Print Batch</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border",
                            activeTab === tab
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                                : "bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        {tab}
                        <span className={cn(
                            "ml-2 px-1.5 py-0.5 rounded-md text-[10px]",
                            activeTab === tab ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                            {tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, name, or SKU..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Value</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No orders found matching your search criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">{order.id}</p>
                                                <p className="text-[10px] text-slate-500 uppercase">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold shrink-0">
                                                    {order.customer.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{order.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500">{order.items} Items</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600">{order.payment}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                                                getStatusStyles(order.status)
                                            )}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Order"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                    <p className="text-sm text-slate-500">
                        {filteredOrders.length === 0
                            ? 'No orders found'
                            : `Showing ${filteredOrders.length} of ${orders.length} orders`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setSelectedOrder(null)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200">
                                    <ShoppingBag size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">Order {selectedOrder.id}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Placed {new Date(selectedOrder.date).toLocaleDateString()}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedOrder.payment}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10">
                            {/* Roadmap / Progress */}
                            <div className="relative flex justify-between items-center px-10">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-1" />
                                <div className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 -z-1 transition-all duration-1000" style={{ width: selectedOrder.status === 'Delivered' ? '100%' : selectedOrder.status === 'Shipped' ? '66%' : selectedOrder.status === 'Processing' ? '33%' : '0%' }} />

                                <div className="flex flex-col items-center gap-3 relative bg-white px-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md", selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing' || selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                        <Package size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-900">Order</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 relative bg-white px-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md", selectedOrder.status === 'Processing' || selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                        <Clock size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-900">Prepare</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 relative bg-white px-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md", selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                        <Truck size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-900">Ship</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 relative bg-white px-4">
                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md", selectedOrder.status === 'Delivered' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                                        <BadgeCheck size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-900">Finish</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Details</h4>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Name</span>
                                            <span className="text-sm font-black text-slate-900">{selectedOrder.customer}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Email</span>
                                            <span className="text-sm font-black text-slate-600">customer@example.com</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Phone</span>
                                            <span className="text-sm font-black text-slate-600">+1 234 567 890</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Shipping Address</h4>
                                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 h-full">
                                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                            742 Evergreen Terrace<br />
                                            Springfield, MA 01001<br />
                                            United States
                                        </p>
                                        <button className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase">
                                            <ExternalLink size={12} />
                                            View on Map
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Items ({selectedOrder.items})</h4>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200" />
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">Product Name {i}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">SKU: PROD-00{i}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900">$45.00</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">x1</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Grand Total</span>
                                <span className="text-2xl font-black text-slate-900">${selectedOrder.total.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all uppercase">
                                    Refund
                                </button>
                                <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all uppercase shadow-xl shadow-slate-200">
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

