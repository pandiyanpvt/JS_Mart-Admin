'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Phone, Mail, MapPin, Building2, CheckCircle2, XCircle, MoreHorizontal, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supplierService } from '@/lib/api';
import * as XLSX from 'xlsx';

const initialSuppliers = [
    {
        id: 1,
        companyName: 'Fresh Farm Co.',
        companyContactNo: '+1 (555) 123-4567',
        companyEmail: 'contact@freshfarm.co',
        companyAddress: '123 Meadow Lane, Countryside, CA',
        companyLogo: null,
        socialMediaLink: 'https://facebook.com/freshfarm',
        contactPersonName: 'Robert Fields',
        contactPersonPhone: '+1 (555) 987-6543',
        contactPersonEmail: 'robert@freshfarm.co',
        isActive: true
    },
];

const FormInput = ({ label, name, type = "text", required = false, placeholder = "", value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
        <input
            type={type}
            required={required}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
        />
    </div>
);

export default function SuppliersView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Interaction States
    const [viewSupplier, setViewSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null); // Used for both Add and Edit (contains form data)
    const [isNewSupplier, setIsNewSupplier] = useState(false); // Flag to distinguish Add vs Edit
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredSuppliers = suppliers.filter(supplier =>
        (supplier.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contactPersonName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.companyEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setIsLoading(true);
            const data = await supplierService.getAll();
            setSuppliers(data);
        } catch (error) {
            console.error('Failed to load suppliers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getProductCount = (supplierName) => {
        // This logic needs to be updated if we want actual product counts per supplier
        return 0;
    };

    // --- Handlers ---

    const handleOpenAdd = () => {
        setEditingSupplier({
            companyName: '',
            companyContactNo: '',
            companyEmail: '',
            companyAddress: '',
            companyLogo: null,
            socialMediaLink: '',
            contactPersonName: '',
            contactPersonPhone: '',
            contactPersonEmail: '',
            isActive: true
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

        try {
            const formData = new FormData();
            Object.keys(editingSupplier).forEach(key => {
                if (key === 'companyLogo' && typeof editingSupplier[key] === 'string') {
                    // Don't append existing URL as a file
                } else if (editingSupplier[key] !== null && editingSupplier[key] !== undefined) {
                    formData.append(key, editingSupplier[key]);
                }
            });

            if (isNewSupplier) {
                await supplierService.create(formData);
            } else {
                await supplierService.update(editingSupplier.id, formData);
            }
            await loadSuppliers();
            setEditingSupplier(null);
        } catch (error) {
            console.error('Failed to save supplier:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await supplierService.delete(deleteId);
            await loadSuppliers();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete supplier:', error);
        }
    };

    const handleExport = () => {
        const dataToExport = suppliers.map(s => ({
            'ID': s.id,
            'Company Name': s.companyName,
            'Company Phone': s.companyContactNo,
            'Company Email': s.companyEmail,
            'Company Address': s.companyAddress,
            'Contact Person': s.contactPersonName,
            'Contact Phone': s.contactPersonPhone,
            'Contact Email': s.contactPersonEmail,
            'Social Media': s.socialMediaLink
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
        XLSX.writeFile(wb, `Suppliers_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
                    <p className="text-slate-500 text-sm">Manage your supply chain partners and contacts.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={18} className="rotate-180" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                    >
                        <Plus size={18} />
                        <span>Add Supplier</span>
                    </button>
                </div>
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact Person</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</th>
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
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 overflow-hidden">
                                                    {supplier.companyLogo ? (
                                                        <img src={supplier.companyLogo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 size={20} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{supplier.companyName}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{supplier.socialMediaLink}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm font-semibold text-slate-800">{supplier.contactPersonName}</p>
                                                <p className="text-[10px] text-slate-500">{supplier.contactPersonEmail}</p>
                                                <p className="text-[10px] text-slate-500">{supplier.contactPersonPhone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail size={12} />
                                                    {supplier.companyEmail}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Phone size={12} />
                                                    {supplier.companyContactNo}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <div className="flex items-start gap-2 text-slate-600">
                                                <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                                <p className="text-xs line-clamp-2">{supplier.companyAddress || 'No address'}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
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
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden">
                                    {viewSupplier.companyLogo ? (
                                        <img src={viewSupplier.companyLogo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={32} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewSupplier.companyName}</h4>
                                    <p className="text-sm text-slate-500">{viewSupplier.socialMediaLink || 'No social link'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 space-y-1">
                                    <span className="text-xs font-bold text-emerald-600 uppercase">Contact Person</span>
                                    <p className="font-bold text-slate-900">{viewSupplier.contactPersonName}</p>
                                    <p className="text-[10px] text-slate-500">{viewSupplier.contactPersonEmail}</p>
                                    <p className="text-[10px] text-slate-500">{viewSupplier.contactPersonPhone}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 space-y-1">
                                    <span className="text-xs font-bold text-blue-600 uppercase">Company Contact</span>
                                    <p className="font-bold text-slate-900">{viewSupplier.companyContactNo}</p>
                                    <p className="text-[10px] text-slate-500">{viewSupplier.companyEmail}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <MapPin className="text-rose-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Registered Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewSupplier.companyAddress}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
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
                            <form id="supplier-form" onSubmit={handleSave} className="space-y-8">
                                {/* Section: Company Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Building2 size={18} className="text-emerald-600" />
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Company Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <FormInput
                                                label="Company Name"
                                                required
                                                placeholder="e.g. Fresh Foods Ltd"
                                                value={editingSupplier.companyName}
                                                onChange={e => setEditingSupplier({ ...editingSupplier, companyName: e.target.value })}
                                            />
                                        </div>
                                        <FormInput
                                            label="Company Contact No"
                                            placeholder="e.g. +1 234 567 890"
                                            value={editingSupplier.companyContactNo}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, companyContactNo: e.target.value })}
                                        />
                                        <FormInput
                                            label="Company Email"
                                            type="email"
                                            placeholder="contact@company.com"
                                            value={editingSupplier.companyEmail}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, companyEmail: e.target.value })}
                                        />
                                        <FormInput
                                            label="Social Media Link"
                                            placeholder="e.g. https://fb.com/company"
                                            value={editingSupplier.socialMediaLink}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, socialMediaLink: e.target.value })}
                                        />
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Company Logo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={e => setEditingSupplier({ ...editingSupplier, companyLogo: e.target.files[0] })}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Company Address</label>
                                            <textarea
                                                value={editingSupplier.companyAddress || ''}
                                                onChange={e => setEditingSupplier({ ...editingSupplier, companyAddress: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                                rows="2"
                                                placeholder="Full business address..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Contact Person Details */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Plus size={18} className="text-blue-600" />
                                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Contact Person Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <FormInput
                                                label="Contact Person Name"
                                                placeholder="e.g. John Doe"
                                                value={editingSupplier.contactPersonName}
                                                onChange={e => setEditingSupplier({ ...editingSupplier, contactPersonName: e.target.value })}
                                            />
                                        </div>
                                        <FormInput
                                            label="Contact Phone"
                                            placeholder="+1 (555) 000-0000"
                                            value={editingSupplier.contactPersonPhone}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, contactPersonPhone: e.target.value })}
                                        />
                                        <FormInput
                                            label="Contact Email"
                                            type="email"
                                            placeholder="john@company.com"
                                            value={editingSupplier.contactPersonEmail}
                                            onChange={e => setEditingSupplier({ ...editingSupplier, contactPersonEmail: e.target.value })}
                                        />
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
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
