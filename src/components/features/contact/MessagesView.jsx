'use client';

import React, { useState, useEffect } from 'react';
import {
    Mail,
    Search,
    Filter,
    Clock,
    User,
    ChevronRight,
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    Inbox,
    AlertCircle,
    ArrowLeft,
    Reply,
    Check,
    Calendar,
    Hash,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { contactService, userService } from '@/lib/api';

export default function MessagesView() {
    const [messages, setMessages] = useState([]);
    const [usersMap, setUsersMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, unread, read
    const [notification, setNotification] = useState(null);
    const [isReplying, setIsReplying] = useState(false);
    const [replyForm, setReplyForm] = useState({ subject: '', body: '' });
    const [isSending, setIsSending] = useState(false);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const [messagesData, usersData] = await Promise.all([
                contactService.getAll(),
                userService.getAll().catch(() => [])
            ]);

            const uMap = {};
            usersData.forEach(user => {
                uMap[user.id] = user.fullName || user.emailAddress || `Admin #${user.id}`;
            });
            setUsersMap(uMap);
            setMessages(messagesData);
        } catch (error) {
            console.error('Failed to load messages:', error);
            showNotification('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSelectMessage = async (msg) => {
        try {
            setSelectedMessage(msg);
            setReplyForm({
                subject: `Re: ${msg.subject}`,
                body: ''
            });

            if (!msg.is_read) {
                await contactService.markRead(msg.id);
                // Update local state to show it's read
                setMessages(prev => prev.map(m =>
                    m.id === msg.id ? { ...m, is_read: true } : m
                ));
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyForm.body.trim()) return;

        setIsSending(true);
        try {
            await contactService.reply(selectedMessage.id, replyForm);
            showNotification('Reply sent successfully!');

            // Fetch updated message details to show the new reply in the thread
            const updatedMsg = await contactService.getById(selectedMessage.id);
            setSelectedMessage(updatedMsg);

            setIsReplying(false);
            setReplyForm({ subject: '', body: '' });
            loadMessages(); // Refresh the list view as well
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSending(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            (msg.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.emailAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' ||
            (filterStatus === 'unread' && !msg.is_read) ||
            (filterStatus === 'read' && msg.is_read);

        return matchesSearch && matchesFilter;
    });

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Mail size={20} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Messages</h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Handle customer inquiries and support tickets from your website.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm items-center gap-8">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</p>
                            <p className="text-sm font-black text-slate-900">{messages.length}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-center">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Unread</p>
                            <p className="text-sm font-black text-slate-900">{unreadCount}</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        {['all', 'unread', 'read'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    filterStatus === s
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
                {/* List Pane */}
                <div className={cn(
                    "lg:col-span-5 xl:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col",
                    selectedMessage && "hidden lg:flex"
                )}>
                    <div className="p-6 border-b border-slate-50 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-4">
                                <Loader2 className="animate-spin text-indigo-600" size={32} />
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-tighter">Syncing Inbox...</p>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map((msg) => (
                                <motion.div
                                    layout
                                    key={msg.id}
                                    onClick={() => handleSelectMessage(msg)}
                                    className={cn(
                                        "p-6 cursor-pointer transition-all relative group",
                                        selectedMessage?.id === msg.id
                                            ? "bg-indigo-50/50"
                                            : "hover:bg-slate-50/80"
                                    )}
                                >
                                    {selectedMessage?.id === msg.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                                    )}

                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                                !msg.is_read ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <User size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={cn(
                                                    "text-sm tracking-tight truncate",
                                                    !msg.is_read ? "font-black text-slate-900" : "font-semibold text-slate-600"
                                                )}>
                                                    {msg.fullName}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold truncate">{msg.emailAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                            {!msg.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className={cn(
                                            "text-xs truncate",
                                            !msg.is_read ? "font-bold text-slate-900" : "font-medium text-slate-500"
                                        )}>
                                            {msg.subject}
                                        </p>
                                        <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                                            {msg.message}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-200">
                                    <Inbox size={32} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 leading-none mb-1">No Inquiries Found</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Inbox is clear</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Pane */}
                <div className={cn(
                    "lg:col-span-7 xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col relative",
                    !selectedMessage && "hidden lg:flex"
                )}>
                    {selectedMessage ? (
                        <div className="flex flex-col h-full">
                            {/* Detail Header */}
                            <div className="p-6 lg:p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{selectedMessage.fullName}</h2>
                                            <div className="flex gap-2">
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    ID: #{selectedMessage.id}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-300" /> {selectedMessage.emailAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Received</p>
                                        <p className="text-xs font-bold text-slate-900">
                                            {new Date(selectedMessage.createdAt).toLocaleString(undefined, {
                                                month: 'short', day: 'numeric', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsReplying(true)}
                                        className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100"
                                    >
                                        <Reply size={16} /> Reply
                                    </button>
                                </div>
                            </div>

                            {/* Message Bubble Column */}
                            <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50/30 custom-scrollbar">
                                <div className="max-w-4xl mx-auto space-y-12">
                                    {/* Subject Banner */}
                                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-600/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                                                <Hash size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Subject</p>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedMessage.subject}</h3>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Original Inquiry */}
                                    <div className="flex flex-col items-start gap-4">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-200" />
                                            <span className="text-xs font-black text-slate-900 tracking-tight">{selectedMessage.fullName} <span className="text-slate-400 font-bold ml-1">inquiry</span></span>
                                        </div>
                                        <div className="max-w-[85%] bg-white p-6 lg:p-8 rounded-[2.5rem] rounded-tl-sm border border-indigo-100 shadow-md relative group">
                                            <p className="text-slate-600 text-base leading-relaxed font-medium whitespace-pre-wrap">
                                                {selectedMessage.message}
                                            </p>
                                            <div className="absolute -bottom-6 left-2 flex items-center gap-2">
                                                <Clock size={12} className="text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400">Sent on {new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thread Replies */}
                                    {selectedMessage.replies?.map((reply, idx) => (
                                        <div key={idx} className="flex flex-col items-end gap-4">
                                            <div className="flex items-center gap-3 px-2">
                                                <span className="text-xs font-black text-slate-900 tracking-tight">
                                                    {usersMap[reply.userId] || 'Admin Support'}
                                                    <span className="text-indigo-500 font-bold ml-1">Response</span>
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            </div>
                                            <div className="max-w-[85%] bg-indigo-600 p-6 lg:p-8 rounded-[2.5rem] rounded-tr-sm shadow-xl shadow-indigo-100 relative text-white">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{reply.subject}</p>
                                                <p className="text-indigo-50 text-base leading-relaxed font-medium whitespace-pre-wrap">
                                                    {reply.body || reply.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sticky Reply Footer */}
                            {!isReplying && (
                                <div className="p-6 border-t border-slate-50 bg-white">
                                    <button
                                        onClick={() => setIsReplying(true)}
                                        className="w-full py-4 px-6 border border-slate-100 rounded-2xl flex items-center justify-between text-slate-400 hover:bg-slate-50 transition-all"
                                    >
                                        <span className="font-bold text-sm">Write a reply...</span>
                                        <Reply size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-20 text-center">
                            <div className="relative">
                                <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                                    <Mail size={48} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white animate-bounce">
                                    <ArrowLeft size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Select an Inquiry</h3>
                                <p className="text-slate-400 font-medium max-w-xs">
                                    Choose a customer message from the left panel to read and respond.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quick Reply Slide-over/Panel */}
                    <AnimatePresence>
                        {isReplying && (
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                className="absolute inset-0 bg-white z-[50] flex flex-col"
                            >
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsReplying(false)}
                                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Responding to Inquiry</h3>
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Case #{selectedMessage?.id}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">To</p>
                                            <p className="text-xs font-bold text-slate-900">{selectedMessage?.emailAddress}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleReply} className="flex-1 flex flex-col overflow-hidden">
                                    {/* Fixed Sub-Header with Action */}
                                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsReplying(false)}
                                                className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-all"
                                            >
                                                <X size={20} />
                                            </button>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Compose Reply</h3>
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">To: {selectedMessage?.emailAddress}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSending || !replyForm.body}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                                        >
                                            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            Send Reply
                                        </button>
                                    </div>

                                    {/* Scrollable Form Body */}
                                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                                        <div className="max-w-4xl mx-auto space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Subject</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={replyForm.subject}
                                                    onChange={e => setReplyForm({ ...replyForm, subject: e.target.value })}
                                                    className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 shadow-inner"
                                                />
                                            </div>

                                            <div className="space-y-3 pb-20">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Message Content</label>
                                                <textarea
                                                    required
                                                    rows={15}
                                                    value={replyForm.body}
                                                    onChange={e => setReplyForm({ ...replyForm, body: e.target.value })}
                                                    placeholder="Write your professional response here..."
                                                    className="w-full px-8 py-8 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 shadow-inner resize-none leading-relaxed text-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fixed Bottom Action Bar */}
                                    <div className="p-6 border-t border-slate-50 bg-white/80 backdrop-blur-md flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsReplying(false)}
                                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        >
                                            Cancel & Close
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSending || !replyForm.body}
                                            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-600 disabled:opacity-50 shadow-2xl shadow-indigo-100 transition-all"
                                        >
                                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                            {isSending ? 'Sending...' : 'Deliver Response'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notification Hud */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className={cn(
                            "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 backdrop-blur-md border border-white/20",
                            notification.type === 'success' ? "bg-emerald-600/90" : "bg-rose-600/90"
                        )}
                    >
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
