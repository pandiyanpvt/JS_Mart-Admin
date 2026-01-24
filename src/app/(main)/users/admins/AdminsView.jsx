'use client';

import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Mail, Shield, ShieldCheck, Lock, Calendar, CheckCircle2, XCircle, Key, Loader2, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Mock Data for Admin Users
const mockAdmins = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@jsmart.com',
        role: 'Super Admin',
        status: 'Active',
        lastLogin: '2026-01-21 14:30',
        permissions: ['all'],
        avatar: null
    },
    {
        id: 2,
        name: 'Sarah Manager',
        email: 'sarah.m@jsmart.com',
        role: 'Store Manager',
        status: 'Active',
        lastLogin: '2026-01-20 09:15',
        permissions: ['products:write', 'orders:read', 'inventory:write'],
        avatar: null
    },
    {
        id: 3,
        name: 'Mike Support',
        email: 'mike.s@jsmart.com',
        role: 'Support Agent',
        status: 'Active',
        lastLogin: '2026-01-21 11:45',
        permissions: ['orders:read', 'users:read'],
        avatar: null
    },
    {
        id: 4,
        name: 'John Content',
        email: 'john.c@jsmart.com',
        role: 'Content Editor',
        status: 'Inactive',
        lastLogin: '2025-12-15 16:20',
        permissions: ['cms:write'],
        avatar: null
    },
];

export default function AdminsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [admins, setAdmins] = useState(mockAdmins);

    // Modal States
    const [viewAdmin, setViewAdmin] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null); // Contains form data for Add/Edit
    const [isNewAdmin, setIsNewAdmin] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Logic
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || admin.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handlers
    const handleOpenAdd = () => {
        setEditingAdmin({
            name: '',
            email: '',
            role: 'Support Agent',
            status: 'Active',
            permissions: [],
            password: '', // Should be handled securely in real app
            confirmPassword: ''
        });
        setIsNewAdmin(true);
    };

    const handleOpenEdit = (admin) => {
        setEditingAdmin({ ...admin });
        setIsNewAdmin(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isNewAdmin) {
            const newId = Math.max(...admins.map(a => a.id), 0) + 1;
            const newAdmin = {
                ...editingAdmin,
                id: newId,
                lastLogin: 'Never',
                // password fields would not be stored in frontend state like this in production
            };
            setAdmins([newAdmin, ...admins]);
        } else {
            setAdmins(admins.map(a => a.id === editingAdmin.id ? editingAdmin : a));
        }

        setIsSaving(false);
        setEditingAdmin(null);
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        setAdmins(admins.filter(a => a.id !== deleteId));
        setDeleteId(null);
    };

    const FormInput = ({ label, name, type = "text", required = false, placeholder = "" }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
            <input
                type={type}
                required={required}
                value={editingAdmin?.[name] || ''}
                onChange={e => setEditingAdmin({ ...editingAdmin, [name]: e.target.value })}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
                    <p className="text-slate-500 text-sm">Manage administrative access and roles.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Add New Admin</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search admins by name or email..."
                            value={searchQuery || ''}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-100 text-sm font-medium rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none"
                        >
                            <option>All Roles</option>
                            <option>Super Admin</option>
                            <option>Store Manager</option>
                            <option>Support Agent</option>
                            <option>Content Editor</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No admin users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200 overflow-hidden">
                                                    <UserCog size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate">{admin.name}</p>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Mail size={10} />
                                                        {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                admin.role === 'Super Admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                    admin.role === 'Store Manager' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                        "bg-slate-50 text-slate-600 border-slate-100"
                                            )}>
                                                <ShieldCheck size={12} />
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                admin.status === 'Active'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    : "bg-slate-50 text-slate-500 border-slate-100"
                                            )}>
                                                {admin.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                {admin.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                {admin.lastLogin}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setViewAdmin(admin)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="View Permissions"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(admin)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(admin.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete User"
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
                        {filteredAdmins.length === 0
                            ? 'No admins found'
                            : `Showing ${filteredAdmins.length} admin users`}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">Next</button>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {viewAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setViewAdmin(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Admin Profile</h3>
                                <p className="text-sm text-slate-500">User Details & Permissions</p>
                            </div>
                            <button onClick={() => setViewAdmin(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                    <UserCog size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{viewAdmin.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                            viewAdmin.role === 'Super Admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                viewAdmin.role === 'Store Manager' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                    "bg-slate-50 text-slate-600 border-slate-100"
                                        )}>
                                            <ShieldCheck size={10} />
                                            {viewAdmin.role}
                                        </span>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                            viewAdmin.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                        )}>
                                            {viewAdmin.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                            {viewAdmin.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Mail className="text-emerald-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Email Address</p>
                                        <p className="text-sm font-medium text-slate-900">{viewAdmin.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Calendar className="text-amber-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Last Login</p>
                                        <p className="text-sm font-medium text-slate-900">{viewAdmin.lastLogin}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                        <Key size={14} /> Assigned Permissions
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewAdmin.permissions.includes('all') ? (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold uppercase">All Access</span>
                                        ) : (
                                            viewAdmin.permissions.map((perm, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium font-mono">
                                                    {perm}
                                                </span>
                                            ))
                                        )}
                                        {viewAdmin.permissions.length === 0 && (
                                            <span className="text-xs text-slate-400 italic">No specific permissions assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewAdmin(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {editingAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        onClick={() => setEditingAdmin(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewAdmin ? 'Add Admin User' : 'Edit Admin User'}</h3>
                                <p className="text-sm text-slate-500">{isNewAdmin ? 'Grant new access' : 'Update access rights'}</p>
                            </div>
                            <button onClick={() => setEditingAdmin(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form id="admin-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <FormInput label="Full Name" name="name" required placeholder="e.g. Admin Name" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Email Address" name="email" type="email" required placeholder="admin@domain.com" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Role</label>
                                        <select
                                            value={editingAdmin.role}
                                            onChange={e => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Super Admin">Super Admin</option>
                                            <option value="Store Manager">Store Manager</option>
                                            <option value="Support Agent">Support Agent</option>
                                            <option value="Content Editor">Content Editor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingAdmin.status}
                                            onChange={e => setEditingAdmin({ ...editingAdmin, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    {isNewAdmin && (
                                        <>
                                            <div className="sm:col-span-2 relative">
                                                <FormInput label="Temporary Password" name="password" type="password" required={isNewAdmin} placeholder="••••••••" />
                                                <div className="absolute top-0 right-0 text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                                    <Lock size={10} />
                                                    Required for new users
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingAdmin(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="admin-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewAdmin ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewAdmin ? 'Create Admin' : 'Save Changes')}</span>
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
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Revoke Access?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this admin user? They will lose access immediately.
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
                                Revoke Access
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
