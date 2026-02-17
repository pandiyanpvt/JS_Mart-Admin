'use client';

import React, { forwardRef } from 'react';
import { Package } from 'lucide-react';

const OrderReceipt = forwardRef(({ order }, ref) => {
    const toNumber = (value) => {
        if (value === null || value === undefined) return 0;
        const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
        return Number.isFinite(n) ? n : 0;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(toNumber(amount));
    };

    const details = Array.isArray(order?.details) ? order.details : [];
    const computedSubtotal = details.reduce((sum, d) => sum + toNumber(d?.pricePerUnit) * toNumber(d?.quantity), 0);
    const computedDiscount = details.reduce((sum, d) => sum + toNumber(d?.discountAmount), 0);

    const subtotal = toNumber(order?.subtotal) || computedSubtotal;
    const discount = toNumber(order?.discount) || computedDiscount;
    const tax = toNumber(order?.tax);
    const totalAmount = toNumber(order?.totalAmount) || Math.max(0, subtotal - discount + tax);

    const user = order?.user || {};
    const customerName = user.fullName || user.emailAddress || 'N/A';
    const customerEmail = user.emailAddress || 'N/A';
    const customerPhone = user.phoneNumber || 'N/A';

    const shipping = order?.shippingAddress || {};
    const addressLine1 = shipping.addressLine1 || shipping.address || '';
    const addressLine2 = shipping.addressLine2 || '';
    const city = shipping.city || '';
    const state = shipping.state || shipping.province || '';
    const postalCode = shipping.postalCode || '';
    const country = shipping.country || '';

    return (
        <div ref={ref} className="print-receipt" style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '32px',
            fontFamily: 'Arial, sans-serif',
            color: '#0f172a',
            boxSizing: 'border-box',
            overflow: 'visible'
        }}>

            {/* Header */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px', margin: 0 }}>JS MART</h1>
                        <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>Order Receipt</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Order #</p>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>{order.id}</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                    <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', margin: '0 0 4px 0' }}>Order Date</p>
                        <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>{formatDate(order?.dateTime)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', margin: '0 0 4px 0' }}>Status</p>
                        <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>{order?.status || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Customer & Shipping Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', margin: '0 0 8px 0' }}>Customer Information</h3>
                    <div style={{ fontSize: '14px', color: '#334155' }}>
                        <p style={{ fontWeight: '600', margin: '4px 0' }}>{customerName}</p>
                        <p style={{ margin: '4px 0' }}>{customerEmail}</p>
                        <p style={{ margin: '4px 0' }}>{customerPhone}</p>
                    </div>
                </div>
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', margin: '0 0 8px 0' }}>Shipping Address</h3>
                    <div style={{ fontSize: '14px', color: '#334155' }}>
                        {addressLine1 || city || state || postalCode || country ? (
                            <>
                                {addressLine1 ? <p style={{ fontWeight: '600', margin: '4px 0' }}>{addressLine1}</p> : null}
                                {addressLine2 ? <p style={{ margin: '4px 0' }}>{addressLine2}</p> : null}
                                {(city || state || postalCode) ? (
                                    <p style={{ margin: '4px 0' }}>
                                        {[city, state, postalCode].filter(Boolean).join(', ')}
                                    </p>
                                ) : null}
                                {country ? <p style={{ margin: '4px 0' }}>{country}</p> : null}
                            </>
                        ) : (
                            <p style={{ color: '#94a3b8', margin: '4px 0' }}>No address provided</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', margin: '0 0 16px 0' }}>Order Items</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: '45%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '25%' }} />
                    </colgroup>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #0f172a' }}>
                            <th style={{ textAlign: 'left', padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</th>
                            <th style={{ textAlign: 'center', padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Price</th>
                            <th style={{ textAlign: 'right', padding: '8px', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((detail, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px 8px', wordWrap: 'break-word' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {detail.product?.images && detail.product.images.length > 0 ? (
                                                <img
                                                    src={detail.product.images[0].productImg}
                                                    alt={detail.product.productName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            ) : (
                                                <Package size={20} color="#cbd5e1" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>{detail.product?.productName || 'Unknown Product'}</p>
                                            {detail.product?.brand && (
                                                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Brand: {detail.product.brand.brand}</p>
                                            )}
                                            {detail.discountAmount > 0 && (
                                                <p style={{ fontSize: '12px', color: '#10b981', margin: '4px 0 0 0' }}>Discount: {formatCurrency(detail.discountAmount)}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#334155' }}>{detail.quantity}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', color: '#334155', whiteSpace: 'nowrap' }}>{formatCurrency(detail.pricePerUnit || 0)}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                    {formatCurrency((detail.pricePerUnit || 0) * (detail.quantity || 0) - (detail.discountAmount || 0))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Summary */}
            <div style={{ borderTop: '2px solid #0f172a', paddingTop: '16px', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                        <tr>
                            <td style={{ color: '#475569', padding: '6px 0' }}>Subtotal:</td>
                            <td style={{ fontWeight: 600, color: '#0f172a', padding: '6px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {formatCurrency(subtotal)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ color: '#475569', padding: '6px 0' }}>Discount:</td>
                            <td style={{ fontWeight: 600, color: '#10b981', padding: '6px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                -{formatCurrency(discount)}
                            </td>
                        </tr>
                        {tax > 0 && (
                            <tr>
                                <td style={{ color: '#475569', padding: '6px 0' }}>Tax:</td>
                                <td style={{ fontWeight: 600, color: '#0f172a', padding: '6px 0', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    {formatCurrency(tax)}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan={2} style={{ borderTop: '2px solid #0f172a', paddingTop: '10px' }} />
                        </tr>
                        <tr>
                            <td style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', paddingTop: '4px' }}>Total Amount:</td>
                            <td style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', paddingTop: '4px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {formatCurrency(totalAmount)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment Info */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                    <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', margin: '0 0 4px 0' }}>Payment Method</p>
                        <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>{order.paymentType?.type || 'N/A'}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', margin: '0 0 4px 0' }}>Payment Status</p>
                        <p style={{ fontWeight: '600', color: '#0f172a', margin: 0 }}>{order.isPaid ? 'Paid' : 'Pending'}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px', marginTop: 'auto' }}>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                    <p style={{ fontWeight: '600', color: '#0f172a', margin: '0 0 4px 0' }}>Thank you for your order!</p>
                    <p style={{ margin: '4px 0' }}>This receipt is generated for parcel attachment.</p>
                    <p style={{ marginTop: '16px', margin: '16px 0 0 0' }}>JS Mart - Your trusted grocery partner</p>
                </div>
            </div>
        </div>
    );
});

OrderReceipt.displayName = 'OrderReceipt';

export default OrderReceipt;
