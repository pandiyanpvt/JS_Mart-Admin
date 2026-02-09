'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Truck, Phone, Mail, Globe, CheckCircle2, XCircle, Loader2, Star, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock Data for Delivery Partners
const mockPartners = [
    {
        id: 1,
        name: 'Speedy Express',
        contactPerson: 'John Doe',
        phone: '+1 (555) 123-4567',
        email: 'support@speedy.com',
        website: 'www.speedy-express.com',
        rating: 4.8,
        activeOrders: 154,
        status: 'Active',
        logo: null
    },
    {
        id: 2,
        name: 'Global Logistics',
        contactPerson: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        email: 'ops@global-logistics.net',
        website: 'www.globallogistics.net',
        rating: 4.5,
        activeOrders: 89,
        status: 'Active',
        logo: null
    },
    {
        id: 3,
        name: 'City Courier',
        contactPerson: 'Mike Brown',
        phone: '+1 (555) 456-7890',
        email: 'dispatch@citycourier.io',
        website: 'www.citycourier.io',
        rating: 4.2,
        activeOrders: 42,
        status: 'Inactive',
        logo: null
    },
    {
        id: 4,
        name: 'Eagle Eye Shipping',
        contactPerson: 'Sarah Wilson',
        phone: '+1 (555) 222-3333',
        email: 'info@eagleshipping.com',
        website: 'www.eagleshipping.com',
        rating: 4.9,
        activeOrders: 210,
        status: 'Active',
        logo: null
    }
];

export default function PartnersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [partners, setPartners] = useState(mockPartners);

    // Modal States
    const [viewPartner, setViewPartner] = useState(null);
    const [editingPartner, setEditingPartner] = useState(null); // Contains form data for Add/Edit
    const [isNewPartner, setIsNewPartner] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' || partner.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingPartner({
            name: '',
            contactPerson: '',
            phone: '',
            email: '',
            website: '',
            rating: 5.0,
            activeOrders: 0,
            status: 'Active'
        });
        setIsNewPartner(true);
    };

    const handleOpenEdit = (partner) => {
        setEditingPartner({ ...partner });
        setIsNewPartner(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewPartner) {
            const newId = Math.max(...partners.map(p => p.id), 0) + 1;
            const newPartner = { ...editingPartner, id: newId };
            setPartners([newPartner, ...partners]);
        } else {
            setPartners(partners.map(p => p.id === editingPartner.id ? editingPartner : p));
        }

        setIsSaving(false);
        setEditingPartner(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setPartners(partners.filter(p => p.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingPartner?.[name] || ''}
                onChange={e => setEditingPartner({ ...editingPartner, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Partners</h1>
                    <p className="text-slate-500 text-sm">Manage courier services and logistic providers.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add Partner</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search partners by name or contact person..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPartners.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No delivery partners found.
                                    </td>
                                </tr>
                            ) : (
                                filteredPartners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                                                    <Truck size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{partner.name}</p>
                                                    <a href={`https://${partner.website}`} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline truncate block">
                                                        {partner.website}
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-medium text-slate-700">{partner.contactPerson}</span>
                                                <span className="text-[10px] text-slate-500">{partner.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg w-fit">
                                                <Star size={12} fill="currentColor" />
                                                <span className="text-xs font-bold">{partner.rating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                <Package size={14} className="text-slate-400" />
                                                {partner.activeOrders}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                partner.status === 'Active'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {partner.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {partner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewPartner(partner)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(partner)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Partner"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(partner.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Partner"
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
                        {filteredPartners.length === 0
                            ? 'No partners found'
                            : `Showing ${filteredPartners.length} partners`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewPartner(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Partner Details</h3>
                                <p className="text-sm text-slate-500">{viewPartner.name}</p>
                            </div>
                            <button onClick={() => setViewPartner(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                                    <Truck size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewPartner.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                            viewPartner.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {viewPartner.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                            {viewPartner.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-amber-50 text-amber-700 border-amber-100">
                                            <Star size={10} fill="currentColor" />
                                            {viewPartner.rating} Rating
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Phone className="text-blue-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Contact Support</p>
                                        <p className="text-sm font-medium text-slate-900">{viewPartner.phone}</p>
                                        <p className="text-xs text-slate-500">Point of Contact: {viewPartner.contactPerson}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Mail className="text-emerald-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewPartner.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Globe className="text-purple-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Website</p>
                                        <a href={`https://${viewPartner.website}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">
                                            {viewPartner.website}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewPartner(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingPartner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingPartner(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewPartner ? 'Add Delivery Partner' : 'Edit Partner Info'}</h3>
                                <p className="text-sm text-slate-500">{isNewPartner ? 'Onboard new logistics provider' : 'Update partner details'}</p>
                            </div>
                            <button onClick={() => setEditingPartner(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="partner-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Company Name" name="name" required placeholder="e.g. Speedy Express" />
                                    </div>
                                    <FormInput label="Contact Person" name="contactPerson" required placeholder="e.g. John Doe" />
                                    <FormInput label="Phone Number" name="phone" required placeholder="e.g. +1 (555) 123-4567" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Email Address" name="email" type="email" required placeholder="support@company.com" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Website URL" name="website" placeholder="www.company.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingPartner.status}
                                            onChange={e => setEditingPartner({ ...editingPartner, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
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
                                onClick={() => setEditingPartner(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="partner-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewPartner ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewPartner ? 'Add Partner' : 'Save Changes')}</span>
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Remove Partner?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to remove this delivery partner? This may affect order fulfillment.
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
