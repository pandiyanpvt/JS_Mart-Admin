'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, Building2, CheckCircle2, XCircle, MoreHorizontal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inventoryItems } from '@/data/mock';

// Generate mock suppliers based on inventory items
const initialSuppliers = [
    {
        id: 1,
        name: 'Fresh Farm Co.',
        contactPerson: 'Robert Fields',
        email: 'robert@freshfarm.co',
        phone: '+1 (555) 123-4567',
        address: '123 Meadow Lane, Countryside, CA',
        status: 'Active',
        rating: 4.8,
        suppliedCategories: ['Vegetables'],
        lastDelivery: '2026-01-15'
    },
    {
        id: 2,
        name: 'Orchard Fresh',
        contactPerson: 'Sarah Appleby',
        email: 'orders@orchardfresh.net',
        phone: '+1 (555) 987-6543',
        address: '456 Orchard Way, Fruitville, WA',
        status: 'Active',
        rating: 4.6,
        suppliedCategories: ['Fruits'],
        lastDelivery: '2026-01-18'
    },
    {
        id: 3,
        name: 'Baby Care Inc.',
        contactPerson: 'Jennifer Small',
        email: 'supply@babycare.com',
        phone: '+1 (555) 222-3333',
        address: '789 Nursery Blvd, Totstown, NY',
        status: 'Active',
        rating: 4.9,
        suppliedCategories: ['Baby Products'],
        lastDelivery: '2026-01-10'
    },
    {
        id: 4,
        name: 'Dairy Farm Ltd.',
        contactPerson: 'Mike Cheesy',
        email: 'mike@dairyfarmltd.com',
        phone: '+1 (555) 444-5555',
        address: '101 Milk Route, Cowford, WI',
        status: 'Inactive',
        rating: 4.2,
        suppliedCategories: ['Dairy'],
        lastDelivery: '2026-01-19'
    },
    {
        id: 5,
        name: 'Tropical Fruits Co.',
        contactPerson: 'Juan Tropicana',
        email: 'juan@tropicalfruits.com',
        phone: '+1 (555) 777-8888',
        address: '222 Palm St, Sunnydale, FL',
        status: 'Active',
        rating: 4.5,
        suppliedCategories: ['Fruits'],
        lastDelivery: '2026-01-16'
    },
    {
        id: 6,
        name: 'Bakery Fresh',
        contactPerson: 'Loaf Baker',
        email: 'loaf@bakeryfresh.com',
        phone: '+1 (555) 333-2222',
        address: '333 Yeast Ct, Breadville, OR',
        status: 'Active',
        rating: 4.7,
        suppliedCategories: ['Bakery'],
        lastDelivery: '2026-01-19'
    }
];

export default function SuppliersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suppliers, setSuppliers] = useState(initialSuppliers);

    // Modal Interaction States
    const [viewSupplier, setViewSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null); // Used for both Add and Edit (contains form data)
    const [isNewSupplier, setIsNewSupplier] = useState(false); // Flag to distinguish Add vs Edit
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProductCount = (supplierName) => {
        return inventoryItems.filter(item => item.supplier === supplierName).length;
    };

    // --- Handlers ---

    const handleOpenAdd = () => {
        setEditingSupplier({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            status: 'Active',
            rating: 5.0,
            suppliedCategories: []
        });
        setIsNewSupplier(true);
    };

    const handleOpenEdit = (supplier) => {
        setEditingSupplier({ ...supplier });
        setIsNewSupplier(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewSupplier) {
            const newId = Math.max(...suppliers.map(s => s.id), 0) + 1;
            const newSupplier = {
                ...editingSupplier,
                id: newId,
                suppliedCategories: typeof editingSupplier.suppliedCategories === 'string'
                    ? editingSupplier.suppliedCategories.split(',').map(s => s.trim())
                    : editingSupplier.suppliedCategories || []
            };
            setSuppliers([newSupplier, ...suppliers]);
        } else {
            setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
        }

        setIsSaving(false);
        setEditingSupplier(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setSuppliers(suppliers.filter(s => s.id !== deleteId));
        setDeleteId(null);
    };

    // Common Form Components
    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingSupplier?.[name] || ''}
                onChange={e => setEditingSupplier({ ...editingSupplier, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
                    <p className="text-slate-500 text-sm">Manage your supply chain partners and contacts.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add Supplier</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search suppliers..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Info</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No suppliers found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                                    <Building2 size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{supplier.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">{getProductCount(supplier.name)} Products</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-semibold text-slate-800">{supplier.contactPerson}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail size={12} />
                                                    {supplier.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Phone size={12} />
                                                    {supplier.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(supplier.suppliedCategories || []).map((cat, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-medium text-slate-600 uppercase">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                supplier.status === 'Active'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {supplier.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {supplier.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm font-bold text-slate-700">{supplier.rating}</span>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <div
                                                            key={s}
                                                            className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                s <= Math.round(supplier.rating) ? "bg-amber-400" : "bg-slate-200"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewSupplier(supplier)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(supplier)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Supplier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(supplier.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Supplier"
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
                        {filteredSuppliers.length === 0
                            ? 'No suppliers found'
                            : `Showing ${filteredSuppliers.length} suppliers`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewSupplier(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Supplier Details</h3>
                                <p className="text-sm text-slate-500">Full information card</p>
                            </div>
                            <button onClick={() => setViewSupplier(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Building2 size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewSupplier.name}</h4>
                                    <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border mt-1",
                                        viewSupplier.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                    )}>
                                        {viewSupplier.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                        {viewSupplier.status}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Contact Person</span>
                                    <p className="font-semibold text-slate-900">{viewSupplier.contactPerson}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase">Rating</span>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-slate-900">{viewSupplier.rating}</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <div key={s} className={cn("w-1.5 h-1.5 rounded-full", s <= Math.round(viewSupplier.rating) ? "bg-amber-400" : "bg-slate-300")} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Mail className="text-emerald-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewSupplier.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Phone className="text-blue-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Phone Number</p>
                                        <p className="text-sm font-medium text-slate-900">{viewSupplier.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <MapPin className="text-rose-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewSupplier.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewSupplier(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingSupplier(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewSupplier ? 'Add Supplier' : 'Edit Supplier'}</h3>
                                <p className="text-sm text-slate-500">{isNewSupplier ? 'Register new partner' : 'Update existing information'}</p>
                            </div>
                            <button onClick={() => setEditingSupplier(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="supplier-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Company Name" name="name" required placeholder="e.g. Fresh Foods Ltd" />
                                    </div>
                                    <FormInput label="Contact Person" name="contactPerson" required placeholder="e.g. John Doe" />
                                    <FormInput label="Phone Number" name="phone" required placeholder="+1 (555) 000-0000" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Email Address" name="email" type="email" required placeholder="contact@company.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Address</label>
                                        <textarea
                                            value={editingSupplier.address}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                            rows="3"
                                            placeholder="Full business address..."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Categories (Comma separated)" name="suppliedCategories" placeholder="Vegetables, Fruits, Dairy..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingSupplier.status}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingSupplier(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="supplier-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewSupplier ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewSupplier ? 'Create Supplier' : 'Save Changes')}</span>
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Supplier?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to remove this supplier? This action cannot be undone.
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
