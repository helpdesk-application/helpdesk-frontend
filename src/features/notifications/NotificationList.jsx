import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Clock, Ticket, AlertCircle } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../../api/api';

const getRelativeTime = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
};

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchNotifications();
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            load();
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Notifications</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'unread' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                {filtered.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {filtered.map(notification => (
                            <div
                                key={notification._id}
                                className={`p-5 flex items-start gap-4 transition-colors ${!notification.is_read ? 'bg-brand-50/20' : 'hover:bg-slate-50/80'}`}
                            >
                                <div className={`p-2.5 rounded-xl flex-shrink-0 ${!notification.is_read ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Bell size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-relaxed ${!notification.is_read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                            <Clock size={12} /> {getRelativeTime(notification.created_at)}
                                        </span>
                                        {notification.ticket_id && (
                                            <Link
                                                to={`/tickets/${notification.ticket_id}`}
                                                className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Ticket size={12} /> View Ticket
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        onClick={() => handleMarkRead(notification._id)}
                                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition flex-shrink-0"
                                        title="Mark as read"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="inline-block p-4 rounded-2xl bg-slate-50 text-slate-300 mb-4">
                            <Bell size={40} />
                        </div>
                        <p className="text-slate-500 font-semibold">No notifications</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {filter === 'unread' ? "You're all caught up!" : "Nothing to show yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
