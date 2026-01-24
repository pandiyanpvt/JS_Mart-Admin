'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Mail, Phone, Calendar, MapPin, User, CheckCircle2, XCircle, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock Data for Customers
const mockCustomers = [
    {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        phone: '+1 (555) 123-4567',
        status: 'Active',
        joinDate: '2025-11-15',
        totalOrders: 12,
        totalSpent: 1250.50,
        address: '123 Maple Ave, Springfield, IL',
        role: 'Customer',
        avatar: null
    
    },
    {
        id: 2,
        name: 'Bob Smith',
        email: 'bob.smith@testmail.com',
        phone: '+1 (555) 987-6543',
        status: 'Active',
        joinDate: '2025-12-01',
        totalOrders: 5,
        totalSpent: 450.75,
        address: '456 Oak Dr, Metropolis, NY',
        role: 'Customer',
        avatar: null
    },
    {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie.b@peanuts.com',
        phone: '+1 (555) 555-5555',
        status: 'Inactive',
        joinDate: '2026-01-10',
        totalOrders: 0,
        totalSpent: 0.00,
        address: '789 Pine Ln, Smallville, KS',
        role: 'Customer',
        avatar: null
    },
    {
        id: 4,
        name: 'Diana Prince',
        email: 'diana.wd@themyscira.net',
        phone: '+1 (555) 777-7777',
        status: 'Active',
        joinDate: '2025-10-20',
        totalOrders: 25,
        totalSpent: 3500.00,
        address: '101 Island Way, Paradise, CA',
        role: 'VIP',
        avatar: null
    },
];

export default function CustomersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [customers, setCustomers] = useState(mockCustomers);

    // Modal States
    const [viewCustomer, setViewCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null); // Contains form data for Add/Edit
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'All Status' || customer.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingCustomer({
            name: '',
            email: '',
            phone: '',
            address: '',
            status: 'Active',
            role: 'Customer',
            totalOrders: 0,
            totalSpent: 0,
            joinDate: new Date().toISOString().split('T')[0]
        });
        setIsNewCustomer(true);
    };

    const handleOpenEdit = (customer) => {
        setEditingCustomer({ ...customer });
        setIsNewCustomer(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewCustomer) {
            const newId = Math.max(...customers.map(c => c.id), 0) + 1;
            const newCustomer = {
                ...editingCustomer,
                id: newId,
            };
            setCustomers([newCustomer, ...customers]);
        } else {
            setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
        }

        setIsSaving(false);
        setEditingCustomer(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setCustomers(customers.filter(c => c.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingCustomer?.[name] || ''}
                onChange={e => setEditingCustomer({ ...editingCustomer, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
                    <p className="text-slate-500 text-sm">Manage your registered users and their details.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add New Customer</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search customers by name, email, or phone..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stats</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 overflow-hidden">
                                                    <User size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{customer.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Joined: {new Date(customer.joinDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-slate-700">
                                                    {customer.totalOrders} Orders
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    ${customer.totalSpent.toFixed(2)} spent
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                customer.status === 'Active'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {customer.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewCustomer(customer)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(customer)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Customer"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(customer.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 size={16} />
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
                        {filteredCustomers.length === 0
                            ? 'No customers found'
                            : `Showing ${filteredCustomers.length} customers`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewCustomer(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Customer Details</h3>
                                <p className="text-sm text-slate-500">User Profile</p>
                            </div>
                            <button onClick={() => setViewCustomer(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewCustomer.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                            viewCustomer.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {viewCustomer.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                            {viewCustomer.status}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100">
                                            {viewCustomer.role}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><ShoppingBag size={12} /> Total Orders</span>
                                    <p className="font-semibold text-slate-900">{viewCustomer.totalOrders}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><DollarSign size={12} /> Total Spent</span>
                                    <p className="font-semibold text-slate-900">${viewCustomer.totalSpent.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Mail className="text-emerald-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewCustomer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Phone className="text-blue-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Phone Number</p>
                                        <p className="text-sm font-medium text-slate-900">{viewCustomer.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <MapPin className="text-rose-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewCustomer.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Calendar className="text-amber-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Joined On</p>
                                        <p className="text-sm font-medium text-slate-900">{new Date(viewCustomer.joinDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewCustomer(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingCustomer(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewCustomer ? 'Add Customer' : 'Edit Customer'}</h3>
                                <p className="text-sm text-slate-500">{isNewCustomer ? 'Register new user' : 'Update user profile'}</p>
                            </div>
                            <button onClick={() => setEditingCustomer(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="customer-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Full Name" name="name" required placeholder="e.g. John Doe" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Email Address" name="email" type="email" required placeholder="john@example.com" />
                                    </div>
                                    <FormInput label="Phone Number" name="phone" required placeholder="+1 (555) 000-0000" />
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingCustomer.status}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Address</label>
                                        <textarea
                                            value={editingCustomer.address}
                                            onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                            rows="3"
                                            placeholder="Full address..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingCustomer(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="customer-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewCustomer ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewCustomer ? 'Register Customer' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setDeleteId(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Customer?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this customer? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg shadow-rose-200"
                            >
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
