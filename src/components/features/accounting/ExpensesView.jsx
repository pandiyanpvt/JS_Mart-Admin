'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, DollarSign, Tag, FileText, Loader2, Download, Filter, XCircle, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { expenseService } from '@/lib/api';
import * as XLSX from 'xlsx';

const EXPENSE_CATEGORIES = [
    'RENT',
    'UTILITIES',
    'SALARY',
    'MARKETING',
    'MAINTENANCE',
    'INVENTORY',
    'SHIPPING',
    'OTHER'
];

const FormInput = ({ label, name, type = "text", required = false, placeholder = "", value, onChange }) => (
    <div className="space-y-1.5 text-left">
        <label className="text-xs font-bold text-slate-700">{label}</label>
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

export default function ExpensesView() {
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    // Modal States
    const [editingExpense, setEditingExpense] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await expenseService.getAll();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingExpense.id) {
                await expenseService.update(editingExpense.id, editingExpense);
            } else {
                await expenseService.create(editingExpense);
            }
            await loadExpenses();
            setEditingExpense(null);
        } catch (error) {
            console.error('Failed to save expense:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        try {
            await expenseService.delete(deleteId);
            await loadExpenses();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to delete expense:', error);
        }
    };

    const handleExport = () => {
        const dataToExport = filteredExpenses.map(e => ({
            'ID': e.id,
            'Title': e.title,
            'Category': e.category,
            'Amount': e.amount,
            'Date': e.expenseDate,
            'Payment Method': e.paymentMethod,
            'Reference': e.reference,
            'Description': e.description
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");
        XLSX.writeFile(wb, `Expenses_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Expenses Log</h1>
                    <p className="text-slate-500 text-sm">Track all outgoing company expenditures.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Download size={18} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setEditingExpense({ title: '', category: 'OTHER', amount: '', expenseDate: new Date().toISOString().split('T')[0], description: '', paymentMethod: 'BANK' })}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
                    >
                        <Plus size={18} />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Filtered</p>
                            <h3 className="text-2xl font-bold text-slate-900">AUD {totalFilteredAmount.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
                {/* Could add more stats here like Current Month, Top Category etc */}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none appearance-none"
                            >
                                <option value="ALL">All Categories</option>
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">Expense Item</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-emerald-600" size={24} />
                                    </td>
                                </tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No expenses found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold text-slate-900">{exp.title}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{exp.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-rose-600">AUD {parseFloat(exp.amount).toFixed(2)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar size={14} />
                                                {exp.expenseDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingExpense({ ...exp })}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(exp.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
            </div>

            {/* Add/Edit Modal */}
            {editingExpense && (
                <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                    <div className="admin-modal-center">
                    <button
                        type="button"
                        onClick={() => setEditingExpense(null)}
                        className="admin-modal-backdrop"
                        aria-label="Close dialog"
                    />
                    <div className="admin-modal-panel-host relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{editingExpense.id ? 'Edit Expense' : 'Log New Expense'}</h3>
                                <p className="text-sm text-slate-500">Record an outgoing company transaction.</p>
                            </div>
                            <button type="button" onClick={() => setEditingExpense(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500" aria-label="Close">
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <FormInput
                                label="Expense Title"
                                required
                                value={editingExpense.title}
                                onChange={e => setEditingExpense({ ...editingExpense, title: e.target.value })}
                                placeholder="e.g. Monthly Shop Rent"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-700">Category</label>
                                    <select
                                        value={editingExpense.category}
                                        onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                    >
                                        {EXPENSE_CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <FormInput
                                    label="Amount (AUD)"
                                    type="number"
                                    required
                                    value={editingExpense.amount}
                                    onChange={e => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormInput
                                    label="Expense Date"
                                    type="date"
                                    required
                                    value={editingExpense.expenseDate}
                                    onChange={e => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })}
                                />
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-bold text-slate-700">Payment Method</label>
                                    <select
                                        value={editingExpense.paymentMethod}
                                        onChange={e => setEditingExpense({ ...editingExpense, paymentMethod: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none"
                                    >
                                        <option value="BANK">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="CARD">Credit/Debit Card</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-bold text-slate-700 block">Description</label>
                                <textarea
                                    value={editingExpense.description || ''}
                                    onChange={e => setEditingExpense({ ...editingExpense, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                                    rows="3"
                                    placeholder="Describe the nature of this expense..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setEditingExpense(null)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-lg"
                                    type="submit"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                    <span>{isSaving ? 'Logging...' : (editingExpense.id ? 'Update' : 'Log Expense')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="admin-modal-scroll z-50" data-lock-body-scroll role="dialog" aria-modal="true">
                    <div className="admin-modal-center">
                    <button
                        type="button"
                        onClick={() => setDeleteId(null)}
                        className="admin-modal-backdrop"
                        aria-label="Close dialog"
                    />
                    <div className="admin-modal-panel-host relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl sm:rounded-3xl">
                        <button
                            type="button"
                            onClick={() => setDeleteId(null)}
                            className="absolute right-3 top-3 rounded-xl bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Log?</h3>
                        <p className="text-sm text-slate-500 mb-6">This will remove this record from calculations. Confirm?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm hover:bg-slate-50">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all text-sm shadow-lg">Confirm Delete</button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </div>
    );
}
