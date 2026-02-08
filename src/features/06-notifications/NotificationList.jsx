import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../../api/api';
import { Bell, BellOff, Check, Trash2, Clock } from 'lucide-react';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetchNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const filtered = activeTab === 'all'
        ? notifications
        : notifications.filter(n => !n.is_read);

    if (loading && notifications.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">Notifications</h2>
                    <p className="text-slate-500 font-medium text-sm">Stay updated on your ticket activity</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab('unread')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BellOff className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
                    <p className="text-slate-400 font-medium">You have no {activeTab === 'unread' ? 'unread' : ''} notifications at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(notif => {
                        const content = (
                            <>
                                <div className={`p-3 rounded-2xl flex-shrink-0 ${notif.is_read ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <Bell size={20} />
                                </div>
                                <div className="flex-grow pt-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className={`font-bold leading-relaxed ${notif.is_read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.message}</p>
                                        {!notif.is_read && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notif._id);
                                                }}
                                                className="p-1.5 hover:bg-blue-100 text-blue-400 hover:text-blue-600 rounded-lg transition-colors flex-shrink-0"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <Clock size={12} />
                                        {new Date(notif.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </>
                        );

                        const className = `p-6 rounded-[2rem] border transition-all flex items-start gap-4 ${notif.is_read ? 'bg-slate-50/50 border-slate-100 opacity-75' : 'bg-white border-blue-100 shadow-xl shadow-blue-50/50'} ${notif.ticket_id ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'}`;

                        if (notif.ticket_id) {
                            return (
                                <Link
                                    key={notif._id}
                                    to={`/tickets/${notif.ticket_id}`}
                                    onClick={() => !notif.is_read && handleMarkAsRead(notif._id)}
                                    className={className}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div key={notif._id} className={className}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificationList;
