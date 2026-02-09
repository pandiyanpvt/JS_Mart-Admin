'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, MapPin, Truck, DollarSign, Clock, CheckCircle2, XCircle, Loader2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data for Delivery Areas
const mockAreas = [
    {
        id: 1,
        name: 'Downtown Metro',
        region: 'City Center',
        postalCodes: ['10001', '10002', '10003', '10004'],
        fee: 5.00,
        minOrder: 0,
        estimatedTime: '24-48 hours',
        status: 'Active'
    },
    {
        id: 2,
        name: 'North Suburbs',
        region: 'North Zone',
        postalCodes: ['10020', '10021', '10022'],
        fee: 10.00,
        minOrder: 50.00,
        estimatedTime: '2-3 days',
        status: 'Active'
    },
    {
        id: 3,
        name: 'West Industrial Park',
        region: 'West Zone',
        postalCodes: ['10050', '10051'],
        fee: 15.00,
        minOrder: 100.00,
        estimatedTime: '3-4 days',
        status: 'Inactive'
    },
    {
        id: 4,
        name: 'Nationwide Express',
        region: 'National',
        postalCodes: ['All Others'],
        fee: 25.00,
        minOrder: 0,
        estimatedTime: '5-7 days',
        status: 'Active'
    }
];

export default function DeliveryAreasView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [areas, setAreas] = useState(mockAreas);

    // Modal States
    const [viewArea, setViewArea] = useState(null);
    const [editingArea, setEditingArea] = useState(null); // Contains form data for Add/Edit
    const [isNewArea, setIsNewArea] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredAreas = areas.filter(area => {
        const matchesSearch = area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            area.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
            area.postalCodes.some(code => code.includes(searchQuery));
        const matchesStatus = statusFilter === 'All Status' || area.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingArea({
            name: '',
            region: '',
            postalCodes: '',
            fee: 0,
            minOrder: 0,
            estimatedTime: '',
            status: 'Active'
        });
        setIsNewArea(true);
    };

    const handleOpenEdit = (area) => {
        setEditingArea({
            ...area,
            postalCodes: Array.isArray(area.postalCodes) ? area.postalCodes.join(', ') : area.postalCodes
        });
        setIsNewArea(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const processedArea = {
            ...editingArea,
            postalCodes: editingArea.postalCodes.split(',').map(s => s.trim()).filter(Boolean),
            fee: parseFloat(editingArea.fee),
            minOrder: parseFloat(editingArea.minOrder)
        };

        if (isNewArea) {
            const newId = Math.max(...areas.map(a => a.id), 0) + 1;
            const newArea = { ...processedArea, id: newId };
            setAreas([newArea, ...areas]);
        } else {
            setAreas(areas.map(a => a.id === editingArea.id ? processedArea : a));
        }

        setIsSaving(false);
        setEditingArea(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setAreas(areas.filter(a => a.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "", step }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                step={step}
                required={required}
                value={editingArea?.[name] || ''}
                onChange={e => setEditingArea({ ...editingArea, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Delivery Areas</h1>
                    <p className="text-slate-500 text-sm">Configure shipping zones and rates.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add Area</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search areas by name, region or zip code..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Area Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipping Fee</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Est. Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAreas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No delivery areas found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAreas.map((area) => (
                                    <tr key={area.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 border border-orange-100">
                                                    <MapPin size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{area.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{area.postalCodes.length} zones defined</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">{area.region}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">${area.fee.toFixed(2)}</span>
                                                {area.minOrder > 0 && <span className="text-[10px] text-slate-500">Min Order: ${area.minOrder}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Clock size={14} className="text-slate-400" />
                                                {area.estimatedTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                area.status === 'Active'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {area.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {area.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewArea(area)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(area)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Area"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(area.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Area"
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
                        {filteredAreas.length === 0
                            ? 'No areas found'
                            : `Showing ${filteredAreas.length} areas`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewArea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewArea(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Delivery Zone Details</h3>
                                <p className="text-sm text-slate-500">{viewArea.region}</p>
                            </div>
                            <button onClick={() => setViewArea(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                                    <MapPin size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewArea.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                            viewArea.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {viewArea.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                            {viewArea.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-blue-50 text-blue-700 border-blue-100">
                                            <Navigation size={10} />
                                            {viewArea.region}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Truck size={12} /> Shipping Cost</span>
                                    <p className="text-lg font-bold text-slate-900">${viewArea.fee.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><DollarSign size={12} /> Min Order To Qualify</span>
                                    <p className="text-lg font-bold text-slate-900">${viewArea.minOrder > 0 ? viewArea.minOrder.toFixed(2) : 'None'}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Covered Postal Codes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewArea.postalCodes.map((code, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-mono font-medium border border-slate-200">
                                                {code}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <Clock className="text-blue-500 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Estimated Delivery Time</p>
                                        <p className="text-sm font-semibold text-slate-900">{viewArea.estimatedTime}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewArea(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingArea && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingArea(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewArea ? 'Add Delivery Area' : 'Edit Delivery Area'}</h3>
                                <p className="text-sm text-slate-500">{isNewArea ? 'Define a new shipping zone' : 'Update shipping parameters'}</p>
                            </div>
                            <button onClick={() => setEditingArea(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="area-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Area Name" name="name" required placeholder="e.g. Downtown Metro" />
                                    </div>
                                    <FormInput label="Region / Zone" name="region" required placeholder="e.g. City Center" />
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingArea.status}
                                            onChange={e => setEditingArea({ ...editingArea, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-700 uppercase">Postal Codes / Zip Codes</label>
                                            <textarea
                                                required
                                                value={editingArea.postalCodes}
                                                onChange={e => setEditingArea({ ...editingArea, postalCodes: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none resize-none"
                                                rows="3"
                                                placeholder="Enter codes separated by commas (e.g. 10001, 10002, 10003)"
                                            />
                                            <p className="text-[10px] text-slate-500 text-right">Separate multiple codes with commas</p>
                                        </div>
                                    </div>
                                    <FormInput label="Shipping Fee ($)" name="fee" type="number" step="0.01" required placeholder="0.00" />
                                    <FormInput label="Min. Order ($)" name="minOrder" type="number" step="0.01" required placeholder="0.00" />
                                    <div className="sm:col-span-2">
                                        <FormInput label="Estimated Delivery Time" name="estimatedTime" required placeholder="e.g. 1-2 Days" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingArea(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="area-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewArea ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewArea ? 'Create Area' : 'Save Changes')}</span>
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
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Delivery Area?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this zone? Orders in this area may become undeliverable.
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
