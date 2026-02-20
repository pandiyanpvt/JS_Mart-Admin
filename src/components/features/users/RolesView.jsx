'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, Shield, Lock, CheckCircle2, XCircle, Users, Loader2, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userRoleService, authService } from '@/lib/api';

const MODULES = ['dashboard', 'products', 'orders', 'users', 'content', 'settings', 'inventory'];
const ACTIONS = ['read', 'write', 'delete'];

const FormInput = ({ label, name, required = false, placeholder = '', value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
        <input
            type="text"
            required={required}
            value={value ?? ''}
            onChange={e => onChange(name, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none placeholder:text-slate-400"
        />
    </div>
);

export default function RolesView() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user?.role !== 'DEVELOPER') {
            router.push('/dashboard');
            return;
        }
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            const data = await userRoleService.getAll();
            // Map API data to UI model
            // Note: API might return slightly different structure, adjust accordingly
            // Assuming data is array of UserRole objects
            const mappedRoles = data.map(role => ({
                id: role.id,
                name: role.role, // "role" is the name field in backend model
                description: role.description || 'No description provided', // description might not exist in backend UserRole model yet
                usersCount: role.users ? role.users.length : 0, // Assuming users included
                status: role.isActive ? 'Active' : 'Inactive',
                permissions: role.permissions || {} // Assuming permissions field exists or we default
            }));
            setRoles(mappedRoles);
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal States
    const [viewRole, setViewRole] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [isNewRole, setIsNewRole] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handlers
    const handleOpenAdd = () => {
        setEditingRole({
            name: '',
            description: '',
            status: 'Active',
            permissions: MODULES.reduce((acc, module) => ({ ...acc, [module]: [] }), {})
        });
        setIsNewRole(true);
    };

    const handleOpenEdit = (role) => {
        // Ensure all modules are present in permissions object
        const fullPermissions = MODULES.reduce((acc, module) => ({
            ...acc,
            [module]: role.permissions[module] || []
        }), {});

        setEditingRole({ ...role, permissions: fullPermissions });
        setIsNewRole(false);
    };

    const handleRoleFieldChange = (name, value) => {
        setEditingRole(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handlePermissionChange = (module, action) => {
        setEditingRole(prev => {
            const modulePerms = prev.permissions[module] || [];
            const newModulePerms = modulePerms.includes(action)
                ? modulePerms.filter(p => p !== action)
                : [...modulePerms, action];

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [module]: newModulePerms
                }
            };
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Map UI model back to API model
            const apiData = {
                role: editingRole.name,
                description: editingRole.description,
                isActive: editingRole.status === 'Active',
                permissions: editingRole.permissions
            };

            if (isNewRole) {
                await userRoleService.create(apiData);
            } else {
                await userRoleService.update(editingRole.id, apiData);
            }
            await loadRoles();
            setEditingRole(null);
        } catch (error) {
            console.error('Failed to save role:', error);
            alert('Failed to save role');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        try {
            await userRoleService.delete(deleteId);
            await loadRoles();
        } catch (error) {
            console.error('Failed to delete role:', error);
            alert('Failed to delete role');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Roles & Permissions</h1>
                    <p className="text-slate-500 text-sm">Define access levels and security protocols.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={18} />
                    <span>Create New Role</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search roles..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Users</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No roles found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => {
                                    const permCount = Object.values(role.permissions || {}).reduce((acc, curr) => acc + curr.length, 0);
                                    return (
                                        <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                                        <Shield size={20} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 truncate">{role.name}</p>
                                                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{role.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                                                    <Users size={14} className="text-slate-400" />
                                                    {role.usersCount} users
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                                                    role.status === 'Active'
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                        : "bg-slate-50 text-slate-500 border-slate-100"
                                                )}>
                                                    {role.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {role.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                    {permCount} Access Points
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewRole(role)}
                                                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenEdit(role)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit Role"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {role.name !== 'Super Admin' && (
                                                        <button
                                                            onClick={() => handleDeleteClick(role.id)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Delete Role"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setEditingRole(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{isNewRole ? 'Create New Role' : 'Edit Role & Permissions'}</h3>
                                <p className="text-sm text-slate-500">Configure access levels for this role</p>
                            </div>
                            <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            <form id="role-form" onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-1">
                                        <FormInput label="Role Name" name="name" required placeholder="e.g. Finance Manager" value={editingRole.name} onChange={handleRoleFieldChange} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">Status</label>
                                        <select
                                            value={editingRole.status}
                                            onChange={e => handleRoleFieldChange('status', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <FormInput label="Description" name="description" placeholder="Briefly describe the responsibilities..." value={editingRole.description} onChange={handleRoleFieldChange} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                                        <Lock size={16} className="text-slate-500" />
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Permission Settings</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {MODULES.map(module => (
                                            <div key={module} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-200 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-bold text-slate-800 capitalize">{module}</span>
                                                    <span className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        (editingRole.permissions[module]?.length > 0) ? "bg-emerald-500" : "bg-slate-300"
                                                    )} />
                                                </div>
                                                <div className="space-y-2">
                                                    {ACTIONS.map(action => (
                                                        <label key={action} className="flex items-center gap-2 cursor-pointer group">
                                                            <div className={cn(
                                                                "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                                editingRole.permissions[module]?.includes(action)
                                                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                                                    : "bg-white border-slate-300 group-hover:border-emerald-400"
                                                            )}>
                                                                {editingRole.permissions[module]?.includes(action) && <CheckCircle2 size={10} />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={editingRole.permissions[module]?.includes(action)}
                                                                onChange={() => handlePermissionChange(module, action)}
                                                            />
                                                            <span className="text-xs text-slate-600 capitalize group-hover:text-slate-900">{action}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                            <button
                                onClick={() => setEditingRole(null)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                form="role-form"
                                disabled={isSaving}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                type="submit"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isNewRole ? <Plus size={18} /> : <CheckCircle2 size={18} />)}
                                <span>{isSaving ? 'Saving...' : (isNewRole ? 'Create Role' : 'Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal (Simple Read-only version of Edit) */}
            {viewRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-lock-body-scroll>
                    <div
                        onClick={() => setViewRole(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{viewRole.name}</h3>
                                <p className="text-sm text-slate-500">{viewRole.description}</p>
                            </div>
                            <button onClick={() => setViewRole(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Key size={16} className="text-emerald-500" />
                                Active Permissions
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {MODULES.map(module => {
                                    const actions = viewRole.permissions[module] || [];
                                    if (actions.length === 0) return null;
                                    return (
                                        <div key={module} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-sm font-bold text-slate-800 capitalize mb-2">{module}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {actions.map(action => (
                                                    <span key={action} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] uppercase font-bold text-slate-500">
                                                        {action}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => setViewRole(null)}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Close View
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
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Role?</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Are you sure you want to delete this role? Users assigned to this role may lose access.
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
