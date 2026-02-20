'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    RefreshCw,
    Eye,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    MapPin,
    CreditCard,
    Calendar,
    DollarSign,
    ChevronRight,
    Loader2,
    AlertCircle,
    FileText,
    Printer,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useModal } from '@/components/providers/ModalProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService, orderTrackingService } from '@/lib/api';
import Image from 'next/image';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import OrderReceipt from '@/components/features/orders/OrderReceipt';

const STATUS_FLOW = {
    'PENDING': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED'],
    'DELIVERED': ['COMPLETED'],
    'COMPLETED': [],
    'CANCELLED': []
};

export default function OrdersView() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingHistory, setTrackingHistory] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const receiptRef = useRef(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAll();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showModal({
                title: "Error",
                message: "Failed to load orders. Please try again.",
                type: "error",
                confirmLabel: "Close"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTrackingHistory = async (orderId) => {
        try {
            const history = await orderTrackingService.getByOrderId(orderId);
            setTrackingHistory(history || []);
        } catch (error) {
            console.error('Failed to load tracking history:', error);
            setTrackingHistory([]);
        }
    };

    const handleViewOrder = async (order) => {
        try {
            // Fetch full order payload (includes totals + correct shipping fields)
            const fullOrder = await orderService.getById(order.id);
            setSelectedOrder(fullOrder || order);
        } catch (error) {
            console.error('Failed to load order details:', error);
            // Fallback to list item if details fetch fails
            setSelectedOrder(order);
        } finally {
            await loadTrackingHistory(order.id);
        }
    };

    const { showModal } = useModal();

    const handleUpdateStatus = (orderId, newStatus) => {
        showModal({
            title: "Update Order Status",
            message: `Are you sure you want to update this order status to ${newStatus}?`,
            type: "confirm",
            confirmLabel: "Update Status",
            onConfirm: async () => {
                try {
                    setUpdatingStatus(true);
                    await orderTrackingService.updateStatus({
                        orderId: orderId,
                        orderStatus: newStatus
                    });

                    await loadOrders();

                    if (selectedOrder && selectedOrder.id === orderId) {
                        await loadTrackingHistory(orderId);
                        setSelectedOrder({ ...selectedOrder, status: newStatus });
                    }
                } catch (error) {
                    console.error('Failed to update status:', error);
                    throw error;
                } finally {
                    setUpdatingStatus(false);
                }
            }
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toString().includes(searchQuery) ||
            (order.user && (order.user.fullName || order.user.emailAddress || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.shippingAddress && (order.shippingAddress.address || '').toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = filterStatus === 'All' || order.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SHIPPED':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'DELIVERED':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'COMPLETED':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELLED':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <Clock size={14} />;
            case 'PROCESSING':
                return <Package size={14} />;
            case 'SHIPPED':
                return <Truck size={14} />;
            case 'DELIVERED':
                return <Truck size={14} />;
            case 'COMPLETED':
                return <CheckCircle2 size={14} />;
            case 'CANCELLED':
                return <XCircle size={14} />;
            default:
                return <AlertCircle size={14} />;
        }
    };

    const getNextStatuses = (currentStatus) => {
        return STATUS_FLOW[currentStatus] || [];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD'
        }).format(parseFloat(amount || 0));
    };

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Order_Receipt_${selectedOrder?.id || 'Order'}`,
        pageStyle: `
            @page {
                size: A4;
                margin: 0;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                    background: white;
                }
                .print-receipt {
                    width: 210mm !important;
                    min-height: 297mm !important;
                    margin: 0 !important;
                    padding: 20mm !important;
                }
            }
        `
    });

    const safePrint = async () => {
        // Wait a tick for the hidden receipt to mount and assign the ref.
        if (!receiptRef.current) {
            await new Promise((r) => setTimeout(r, 0));
        }
        if (!receiptRef.current) {
            alert('Receipt is still loading. Please try again in a moment.');
            return;
        }
        handlePrint();
    };

    const handleDownloadPDF = async () => {
        if (!receiptRef.current || !selectedOrder) return;

        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                allowTaint: true,
                removeContainer: false,
                windowWidth: 794, // A4 width in pixels at 96 DPI
                windowHeight: 1123, // A4 height in pixels at 96 DPI
                onclone: (clonedDoc) => {
                    // html2canvas can't parse newer CSS color functions (lab/oklch) from Tailwind.
                    // Force safe RGB colors in the cloned document for reliable PDF capture.
                    const style = clonedDoc.createElement('style');
                    style.textContent = `
                      * { 
                        color: rgb(15, 23, 42) !important;
                        border-color: rgb(226, 232, 240) !important;
                        outline-color: rgb(226, 232, 240) !important;
                        box-shadow: none !important;
                      }
                      body { background: rgb(255,255,255) !important; }
                      .print-receipt { background: rgb(255,255,255) !important; }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Order_Receipt_${selectedOrder.id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again or use the Print button instead.');
        }
    };

    return (
        <div className="w-full max-w-full space-y-6 sm:space-y-8 pb-12 font-sans overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 w-full">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
                    </div>
                    <p className="text-slate-500 ml-1 font-medium">Monitor and manage customer orders, update delivery status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadOrders}
                        disabled={loading}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link
                        href="/orders/returns"
                        className="px-5 py-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm font-medium text-sm flex items-center gap-2"
                    >
                        <FileText size={16} />
                        Returns
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 w-full">
                {['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((status) => {
                    const count = status === 'All'
                        ? orders.length
                        : orders.filter(o => o.status === status).length;
                    return (
                        <motion.div
                            key={status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{status}</span>
                                {status !== 'All' && getStatusIcon(status)}
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{count}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden w-full max-w-full">
                {/* Toolbar */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between bg-slate-50/30 w-full">
                    <div className="relative w-full lg:w-96 group min-w-0 flex-shrink">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm group-hover:border-slate-300"
                            placeholder="Search by order ID, customer name, or address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex p-1.5 bg-slate-100/80 rounded-2xl gap-1 overflow-x-auto w-full lg:w-auto scrollbar-hide">
                        {['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0",
                                    filterStatus === status
                                        ? "bg-white text-slate-900 shadow-sm shadow-slate-200 ring-1 ring-slate-100"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table Area */}
                <div className="relative overflow-x-hidden min-h-[500px] w-full">
                    <table className="w-full text-left table-fixed">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="w-[110px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</th>
                                <th className="hidden sm:table-cell w-[110px] px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Items</th>
                                <th className="hidden sm:table-cell w-[140px] px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                                <th className="w-[120px] px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="hidden lg:table-cell w-[190px] px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="w-[110px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-400 animate-pulse">Loading orders...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                <Search className="text-slate-300" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-slate-900 font-bold">No orders found</p>
                                                <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {filteredOrders.map((order) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            key={order.id}
                                            className="group hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs sm:text-sm font-bold text-slate-900">#{order.id}</span>
                                                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 md:hidden">{formatDate(order.dateTime)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                                                        {order.user?.fullName || order.user?.emailAddress || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block">{order.user?.emailAddress}</span>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                                                <span className="text-xs sm:text-sm font-medium text-slate-700">
                                                    {order.details?.length || 0} item(s)
                                                </span>
                                            </td>
                                            <td className="hidden sm:table-cell px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                                                <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full uppercase tracking-wide border transform transition-transform group-hover:scale-105",
                                                    getStatusColor(order.status)
                                                )}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="hidden sm:inline">{order.status}</span>
                                                    <span className="sm:hidden">{order.status.substring(0, 3)}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 hidden lg:table-cell">
                                                <span className="text-xs font-medium text-slate-600">
                                                    {formatDate(order.dateTime)}
                                                </span>
                                            </td>
                                            <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-5 text-right">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm"
                                                >
                                                    <Eye size={12} className="sm:w-[14px] sm:h-[14px]" />
                                                    <span className="hidden sm:inline">View</span>
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm font-medium text-slate-500">
                        {filteredOrders.length === 0
                            ? 'No items to show'
                            : `Showing ${filteredOrders.length} of ${orders.length} orders`}
                    </p>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto" data-lock-body-scroll>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedOrder(null)}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-4 mx-2 sm:mx-4"
                    >
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order Details</h2>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                        Order #{selectedOrder.id}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs font-medium text-slate-500">{formatDate(selectedOrder.dateTime)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        safePrint();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                                    title="Print Receipt"
                                >
                                    <Printer size={16} />
                                    Print
                                </button>
                                <button
                                    onClick={() => {
                                        if (receiptRef.current) {
                                            handleDownloadPDF();
                                        } else {
                                            alert('Receipt is loading. Please try again in a moment.');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                                    title="Download PDF"
                                >
                                    <Download size={16} />
                                    PDF
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
                            {/* Order Status Section */}
                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">Order Status</h3>
                                    <span className={cn(
                                        "inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wide border",
                                        getStatusColor(selectedOrder.status)
                                    )}>
                                        {getStatusIcon(selectedOrder.status)}
                                        {selectedOrder.status}
                                    </span>
                                </div>

                                {getNextStatuses(selectedOrder.status).length > 0 && (
                                    <div className="flex gap-2 mt-4">
                                        {getNextStatuses(selectedOrder.status).map((nextStatus) => (
                                            <button
                                                key={nextStatus}
                                                onClick={() => handleUpdateStatus(selectedOrder.id, nextStatus)}
                                                disabled={updatingStatus}
                                                className={cn(
                                                    "px-4 py-2 text-xs font-bold rounded-xl transition-all",
                                                    nextStatus === 'CANCELLED'
                                                        ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                                                        : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100",
                                                    updatingStatus && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {updatingStatus ? (
                                                    <Loader2 size={14} className="animate-spin inline mr-1" />
                                                ) : null}
                                                Update to {nextStatus}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Customer & Shipping Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <User size={18} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">Customer Info</h4>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-slate-700">
                                            {selectedOrder.user?.fullName || 'N/A'}
                                        </p>
                                        <p className="text-slate-500">{selectedOrder.user?.emailAddress || 'N/A'}</p>
                                        <p className="text-slate-500">{selectedOrder.user?.phoneNumber || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <MapPin size={18} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">Shipping Address</h4>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-700">
                                        {selectedOrder.shippingAddress ? (
                                            <>
                                                <p>{selectedOrder.shippingAddress.address}</p>
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                                                <p>{selectedOrder.shippingAddress.province}</p>
                                            </>
                                        ) : (
                                            <p className="text-slate-400">No address provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.details?.map((detail, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                                                {(() => {
                                                    const imgRaw = detail.product?.images?.[0]?.productImg || detail.product?.productImage;
                                                    const imgSrc = imgRaw
                                                        ? (imgRaw.startsWith('http') ? imgRaw : (imgRaw.startsWith('/') ? imgRaw : `/${imgRaw}`))
                                                        : '/placeholder.png';
                                                    return (
                                                        <Image
                                                            src={imgSrc}
                                                            alt={detail.product?.productName || 'Product'}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {detail.product?.productName || 'Unknown Product'}
                                                </p>
                                                <p className="text-xs text-slate-400">Qty: {detail.quantity} × {formatCurrency(detail.pricePerUnit)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-slate-900">
                                                    {formatCurrency((detail.pricePerUnit * detail.quantity) - (detail.discountAmount || 0))}
                                                </p>
                                                {detail.discountAmount > 0 && (
                                                    <p className="text-xs text-emerald-600">-{formatCurrency(detail.discountAmount)} discount</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Discount Breakdown */}
                            {selectedOrder.discountLogs && selectedOrder.discountLogs.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Discount Breakdown</h3>
                                    <div className="space-y-2">
                                        {selectedOrder.discountLogs.map((log) => (
                                            <div key={log.id} className="flex justify-between items-center text-sm p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <span className="font-medium text-emerald-800">{log.description}</span>
                                                <span className="font-bold text-emerald-800">-{formatCurrency(log.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Order Summary */}
                            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-100 p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Discount:</span>
                                            <span className="font-semibold text-emerald-600">-{formatCurrency(selectedOrder.discount)}</span>
                                        </div>
                                    )}
                                    {selectedOrder.tax > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Tax:</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(selectedOrder.tax)}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                                        <span className="font-bold text-slate-900">Total:</span>
                                        <span className="font-bold text-lg text-emerald-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                                    <CreditCard size={14} />
                                    <span>Payment: {selectedOrder.paymentType?.type || 'N/A'}</span>
                                    <span className="mx-2">•</span>
                                    <span>Paid: {selectedOrder.isPaid ? 'Yes' : 'No'}</span>
                                </div>
                            </div>

                            {/* Tracking History */}
                            {trackingHistory.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Tracking History</h3>
                                    <div className="space-y-3">
                                        {trackingHistory.map((tracking, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                    getStatusColor(tracking.orderStatus).replace('text-', 'bg-').replace('border-', '')
                                                )}>
                                                    {getStatusIcon(tracking.orderStatus)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-900">{tracking.orderStatus}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{formatDate(tracking.dateTime)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Hidden Receipt for Printing/PDF */}
            {selectedOrder && (
                // Keep it out of layout/interaction, but DO NOT clip it (or PDF/print can miss right-side content).
                <div className="fixed left-0 top-0 w-0 h-0 overflow-visible pointer-events-none opacity-0">
                    <OrderReceipt ref={receiptRef} order={selectedOrder} />
                </div>
            )}
        </div>
    );
}
