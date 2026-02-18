'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Save, User, Lock, Bell, Store, Loader2, Camera, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { settingsService } from '@/lib/api';
import { IMAGE_SPECS } from '@/lib/imageSpecs';

export default function SettingsView() {
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        storeName: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: true,
        darkMode: false
    });

    const [storeSettings, setStoreSettings] = useState({
        REFUND_DAYS: '',
        LOW_STOCK_THRESHOLD: '',
        SHIPPING_FEE: '',
        POINTS_TO_AUD_RATIO: '',
    });

    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    const logoInputRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await settingsService.getAll();
                const shop = data.shopDetails || {};
                const settings = data.storeSettings || [];

                setFormData(prev => ({
                    ...prev,
                    storeName: shop.name || 'JS Mart',
                    email: shop.email || '',
                    phone: shop.phone || '',
                    addressLine1: shop.addressLine1 || '',
                    addressLine2: shop.addressLine2 || '',
                    city: shop.city || '',
                    state: shop.state || '',
                    postalCode: shop.postalCode || '',
                    country: shop.country || ''
                }));

                if (shop.logoUrl) {
                    setLogoPreview(shop.logoUrl);
                }

                const map = {};
                settings.forEach(s => {
                    map[s.configKey] = s.configValue;
                });
                setStoreSettings(prev => ({
                    ...prev,
                    ...map,
                }));
            } catch (e) {
                console.error('Failed to load settings:', e);
                setError(e?.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleStoreSettingChange = (e) => {
        const { name, value } = e.target;
        setStoreSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            // First upload logo if a new file was selected
            if (logoFile) {
                const shop = await settingsService.uploadLogo(logoFile);
                if (shop?.logoUrl) {
                    setLogoPreview(shop.logoUrl);
                }
                setLogoFile(null);
            }

            await settingsService.updateShop({
                name: formData.storeName,
                email: formData.email,
                phone: formData.phone,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
            });

            await settingsService.updateStoreSettings([
                { configKey: 'REFUND_DAYS', configValue: storeSettings.REFUND_DAYS, description: 'Number of days allowed for refund after delivery' },
                { configKey: 'LOW_STOCK_THRESHOLD', configValue: storeSettings.LOW_STOCK_THRESHOLD, description: 'Quantity at or below which a product is considered low stock' },
                { configKey: 'SHIPPING_FEE', configValue: storeSettings.SHIPPING_FEE, description: 'Default shipping fee for orders in AUD' },
                { configKey: 'POINTS_TO_AUD_RATIO', configValue: storeSettings.POINTS_TO_AUD_RATIO, description: 'Conversion rate for points to AUD (e.g. 1.0 means 1 point = 1 AUD)' },
            ]);

            // Password change could be added via separate API later

            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (e) {
            console.error('Failed to save settings:', e);
            setError(e?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500 text-sm">Manage your account and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-200 disabled:opacity-70"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Save Changes</span>
                </button>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSave} className="divide-y divide-slate-100">

                    {/* Profile Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Store size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Store Profile</h2>
                                <p className="text-sm text-slate-500">Update your store's basic information.</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar / Logo Placeholder */}
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    className="group"
                                >
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 text-slate-400 relative overflow-hidden cursor-pointer">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Store logo"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={40} />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <span className="mt-2 block text-xs font-semibold text-emerald-600 hover:underline">
                                        Change Logo
                                    </span>
                                    <p className="mt-1 text-[10px] text-slate-500 font-medium">Image size (before adding): {IMAGE_SPECS.logo.width}×{IMAGE_SPECS.logo.height} px, max {IMAGE_SPECS.logo.maxFileSizeLabel}.</p>
                                </button>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setLogoFile(file);
                                        try {
                                            const previewUrl = URL.createObjectURL(file);
                                            setLogoPreview(previewUrl);
                                        } catch {
                                            // Fallback: no preview if URL.createObjectURL fails
                                        }
                                    }}
                                />
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Store Name</label>
                                    <input
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Address Line 1</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">State/Province</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Postal Code</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Security</h2>
                                <p className="text-sm text-slate-500">Update your password to keep your account safe.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences / Notifications and Store Settings */}
                    <div className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Preferences</h2>
                                <p className="text-sm text-slate-500">Manage your notification and display settings.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                                    <p className="text-xs text-slate-500">Receive updates about orders and stock.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="notifications"
                                        checked={formData.notifications}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                            <SettingsIcon size={14} /> Refund Window (Days)
                                        </p>
                                        <p className="text-xs text-slate-500">How many days after delivery a customer can request a refund.</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        name="REFUND_DAYS"
                                        value={storeSettings.REFUND_DAYS || ''}
                                        onChange={handleStoreSettingChange}
                                        className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                            <SettingsIcon size={14} /> Low Stock Threshold
                                        </p>
                                        <p className="text-xs text-slate-500">When a product’s quantity is at or below this number, it’s treated as low stock for alerts.</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        name="LOW_STOCK_THRESHOLD"
                                        value={storeSettings.LOW_STOCK_THRESHOLD || ''}
                                        onChange={handleStoreSettingChange}
                                        className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                            <SettingsIcon size={14} /> Shipping Fee (AUD)
                                        </p>
                                        <p className="text-xs text-slate-500">Fixed shipping rate applied to all orders.</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="SHIPPING_FEE"
                                        value={storeSettings.SHIPPING_FEE || ''}
                                        onChange={handleStoreSettingChange}
                                        className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                            <SettingsIcon size={14} /> Points to AUD Ratio
                                        </p>
                                        <p className="text-xs text-slate-500">1 point equals how much AUD (e.g. 1.0 = 1 AUD per point).</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.0001"
                                        name="POINTS_TO_AUD_RATIO"
                                        value={storeSettings.POINTS_TO_AUD_RATIO || ''}
                                        onChange={handleStoreSettingChange}
                                        className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
