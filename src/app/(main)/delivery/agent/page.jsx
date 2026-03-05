'use client';

import { useState, useEffect } from 'react';
import {
    Truck,
    Package,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    RefreshCw,
    X,
    Lock,
    LogOut
} from 'lucide-react';
import { orderService } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DeliveryAgentDashboard() {
    const { logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadAssignedOrders();
    }, []);

    const loadAssignedOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAssignedOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to load assigned orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setVerifying(true);
            await orderService.verifyOtp(selectedOrder.id, otp);
            toast.success('Order delivered successfully!');
            setSelectedOrder(null);
            setOtp('');
            loadAssignedOrders();
        } catch (error) {
            console.error('OTP Verification failed:', error);
            toast.error(error.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchQuery) ||
        (order.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.shippingAddress?.address || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Loading assigned orders...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10 border-b border-slate-100 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Truck className="text-emerald-600" size={24} />
                        Delivery Dashboard
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">{orders.length} active deliveries</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={loadAssignedOrders}
                        className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-emerald-600 active:scale-90"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={logout}
                        className="p-2.5 hover:bg-rose-50 rounded-full transition-colors text-slate-400 hover:text-rose-600 active:scale-90"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search Order ID or Name..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Order Cards */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <Package className="mx-auto text-slate-300 mb-3" size={48} />
                        <p className="text-slate-500 font-medium">No assigned orders found.</p>
                        <button
                            onClick={loadAssignedOrders}
                            className="mt-4 text-emerald-600 font-bold text-sm whitespace-nowrap"
                        >
                            Tap to refresh
                        </button>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        #{order.id}
                                    </span>
                                    <h3 className="font-bold text-slate-900 mt-1">{order.user?.fullName}</h3>
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border",
                                    order.status === 'SHIPPED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                )}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                                    <p className="text-slate-600 leading-tight">
                                        {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="text-slate-400 shrink-0" size={16} />
                                        <span className="text-slate-500 text-xs">{formatDate(order.dateTime)}</span>
                                    </div>
                                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Verification Sheet/Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]"
                        >
                            <div className="p-6 sm:p-8 space-y-6">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Deliver Order</h2>
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-slate-50 rounded-3xl p-5 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                                            <p className="text-lg font-bold text-slate-900">#{selectedOrder.id}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-200/50">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Shipping Address</p>
                                                <p className="text-sm text-slate-500">{selectedOrder.shippingAddress?.address}</p>
                                                <p className="text-sm text-slate-500">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">Contact Number</p>
                                                <p className="text-sm text-slate-500">{selectedOrder.user?.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Entry Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock size={18} className="text-emerald-600" />
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verification Code</h3>
                                    </div>
                                    <p className="text-xs text-slate-500">Ask the customer for the 6-digit OTP sent to their email.</p>

                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="Enter 6-digit OTP"
                                            className="w-full text-center text-3xl font-black tracking-[0.5em] py-5 bg-white border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-200 placeholder:tracking-normal placeholder:font-medium placeholder:text-sm"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        />
                                        {otp.length === 6 && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
                                            >
                                                <CheckCircle2 size={24} />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={otp.length !== 6 || verifying}
                                    className={cn(
                                        "w-full py-5 rounded-3xl text-lg font-black transition-all flex items-center justify-center gap-3",
                                        otp.length === 6 && !verifying
                                            ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95"
                                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    {verifying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            Complete Delivery
                                            <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
