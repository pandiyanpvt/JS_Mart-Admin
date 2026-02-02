'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Mail, Shield, ShieldCheck, Lock, Calendar, CheckCircle2, XCircle, Key, Loader2, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { userService, userRoleService, authService } from '@/lib/api';
import * as XLSX from 'xlsx';

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

export default function AdminsView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [admins, setAdmins] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal States
    const [viewAdmin, setViewAdmin] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null); // Contains form data for Add/Edit
    const [isNewAdmin, setIsNewAdmin] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const user = authService.getCurrentUser();
        // Manager should not see this page
        if (user?.role === 'MANAGER') {
            router.push('/dashboard');
            return;
        }
        setCurrentUser(user);
        loadData(user);
    }, []);

    const loadData = async (user) => {
        try {
            setIsLoading(true);
            const [usersData, rolesData] = await Promise.all([
                userService.getAll(),
                userRoleService.getAll()
            ]);

            setAvailableRoles(rolesData);

            // Filter for only admin-like roles (assuming ID 1 is User/Customer, others are admin/staff)
            // Adjust logic based on your actual role structure. 
            // If roles have a 'type' or similar, use that. For now assuming ID > 1 is admin-like.
            const mappedAdmins = usersData
                .filter(u => u.userRoleId && u.userRoleId !== 1) // Access logic
                .map(u => {
                    const roleObj = rolesData.find(r => r.id === u.userRoleId);
                    return {
                        id: u.id,
                        fullName: u.fullName,
                        name: u.fullName || (u.emailAddress ? u.emailAddress.split('@')[0] : 'User'),
                        emailAddress: u.emailAddress,
                        userRoleId: u.userRoleId,
                        role: roleObj ? roleObj.role : 'Unknown',
                        status: u.isActive ? 'Active' : 'Inactive',
                        lastLogin: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Never',
                        permissions: ['all'], // Placeholder
                        phoneNumber: u.phoneNumber
                    };
                })
                .filter(admin => {
                    // RBAC Filtering Logic
                    if (user?.role === 'DEVELOPER') return true;
                    if (user?.role === 'ADMIN') {
                        // Admin sees Admin and Manager, but NOT Developer
                        return admin.role !== 'DEVELOPER';
                    }
                    // Default fallback (e.g. if user role is unknown or new type)
                    return admin.role !== 'DEVELOPER';
                });
            setAdmins(mappedAdmins);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAdmins = async () => {
        // Helper to just reload admins if roles are already loaded
        try {
            const usersData = await userService.getAll();
            const mappedAdmins = usersData
                .filter(u => u.userRoleId && u.userRoleId !== 1)
                .map(u => {
                    const roleObj = availableRoles.find(r => r.id === u.userRoleId);
                    return {
                        id: u.id,
                        fullName: u.fullName,
                        name: u.fullName || (u.emailAddress ? u.emailAddress.split('@')[0] : 'User'),
                        emailAddress: u.emailAddress,
                        userRoleId: u.userRoleId,
                        role: roleObj ? roleObj.role : 'Unknown',
                        status: u.isActive ? 'Active' : 'Inactive',
                        lastLogin: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : 'Never',
                        permissions: ['all'],
                        phoneNumber: u.phoneNumber
                    };
                })
                .filter(admin => {
                    // RBAC Filtering Logic
                    if (currentUser?.role === 'DEVELOPER') return true;
                    if (currentUser?.role === 'ADMIN') {
                        return admin.role !== 'DEVELOPER';
                    }
                    return admin.role !== 'DEVELOPER';
                });
            setAdmins(mappedAdmins);
        } catch (error) {
            console.error('Failed to reload admins:', error);
        }
    };

    // Filter Logic
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = (admin.emailAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (admin.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || admin.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Handlers
    const handleOpenAdd = () => {
        // Default to first available admin role or just the first one
        const defaultRole = availableRoles.find(r => r.id !== 1) || availableRoles[0];
        setEditingAdmin({
            fullName: '',
            emailAddress: '',
            userRoleId: defaultRole ? defaultRole.id : '',
            status: 'Active',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        });
        setIsNewAdmin(true);
    };

    const handleOpenEdit = (admin) => {
        setEditingAdmin({
            ...admin,
            password: '' // Don't fill password on edit
        });
        setIsNewAdmin(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const apiData = {
                fullName: editingAdmin.fullName,
                emailAddress: editingAdmin.emailAddress,
                phoneNumber: editingAdmin.phoneNumber || '0000000000', // Ensure phone is present if required
                userRoleId: parseInt(editingAdmin.userRoleId),
                isActive: editingAdmin.status === 'Active'
            };

            if (isNewAdmin) {
                // Register requires password
                await userService.create({
                    ...apiData,
                    password: editingAdmin.password
                });
            } else {
                // Update doesn't strictly require password unless changing
                await userService.update(editingAdmin.id, apiData);
            }
            await loadAdmins();
            setEditingAdmin(null);
        } catch (error) {
            console.error('Failed to save admin:', error);
            alert('Failed to save: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await userService.delete(deleteId);
            await loadAdmins();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete admin:', error);
        }
    };

    const handleExport = () => {
        const dataToExport = admins.map(a => ({
            'ID': a.id,
            'Full Name': a.fullName || 'N/A',
            'Email': a.emailAddress,
            'Role': a.role,
            'Status': a.status,
            'Last Login': a.lastLogin,
            'Phone': a.phoneNumber
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Admins");
        XLSX.writeFile(wb, `Admins_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Users</h1>
                    <p className="text-slate-500 text-sm">Manage administrative access and roles.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Plus className="rotate-45" size={18} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                    >
                        <Plus size={18} />
                        <span>Add New Admin</span>
                    </button>
                </div>
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
                            {availableRoles.filter(r => r.id !== 1).map(role => (
                                <option key={role.id} value={role.role}>{role.role}</option>
                            ))}
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                                    </td>
                                </tr>
                            ) : filteredAdmins.length === 0 ? (
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
                                                        {admin.emailAddress}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
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
                    {/* Pagination UI */}
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
                                    <h4 className="text-xl font-bold text-slate-900">{viewAdmin.fullName || viewAdmin.name}</h4>
                                    <p className="text-xs text-slate-500">{viewAdmin.emailAddress}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-slate-50 text-slate-600 border-slate-100">
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
                                        <p className="text-sm font-medium text-slate-900">{viewAdmin.emailAddress}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <Calendar className="text-amber-600 mt-0.5" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Last Login</p>
                                        <p className="text-sm font-medium text-slate-900">{viewAdmin.lastLogin}</p>
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
                                        <FormInput
                                            label="Full Name"
                                            name="fullName"
                                            required
                                            placeholder="e.g. Admin Name"
                                            value={editingAdmin.fullName}
                                            onChange={e => setEditingAdmin({ ...editingAdmin, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput
                                            label="Email Address"
                                            name="emailAddress"
                                            type="email"
                                            required
                                            placeholder="admin@domain.com"
                                            value={editingAdmin.emailAddress}
                                            onChange={e => setEditingAdmin({ ...editingAdmin, emailAddress: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Role</label>
                                        <select
                                            value={editingAdmin.userRoleId}
                                            onChange={e => setEditingAdmin({ ...editingAdmin, userRoleId: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="">Select Role</option>
                                            {availableRoles.filter(r => r.id !== 1).map(role => (
                                                <option key={role.id} value={role.id}>{role.role}</option>
                                            ))}
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
                                                <FormInput
                                                    label="Temporary Password"
                                                    name="password"
                                                    type="password"
                                                    required={isNewAdmin}
                                                    placeholder="••••••••"
                                                    value={editingAdmin.password || ''}
                                                    onChange={e => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                                                />
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
