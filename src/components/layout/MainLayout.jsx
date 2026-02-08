import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, BookOpen, Users,
  LogOut, UserCircle, ChevronDown, Settings, Bell, Check
} from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../../api/api';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Get real user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { email: 'Guest', role: 'Customer' };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetchNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Refresh every minute
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Super Admin', 'Manager'] },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin', 'Manager'] },
    { name: 'Knowledge Base', path: '/kb', icon: <BookOpen size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin', 'Manager'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['Admin', 'Super Admin'] },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 text-xl font-bold border-b border-slate-800 text-blue-400">
          Helpdesk Pro
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}>
                {item.icon} <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 relative z-40">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {menuItems.find(i => i.path === location.pathname)?.name || 'Overview'}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <Link
                          key={n._id}
                          to={n.ticket_id ? `/tickets/${n.ticket_id}` : '#'}
                          onClick={() => {
                            if (!n.is_read) handleMarkRead(n._id);
                            setIsNotifOpen(false);
                          }}
                          className={`p-4 border-b border-slate-50 flex gap-3 hover:bg-slate-50 transition cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className="flex-1">
                            <p className={`text-sm ${!n.is_read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="block py-3 text-center text-xs font-bold text-blue-600 bg-slate-50 border-t border-slate-100 hover:bg-blue-50 transition"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 hover:bg-slate-50 rounded-full border border-transparent hover:border-slate-200 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-700">{user.email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{user.role}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    <UserCircle size={18} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition"
                  >
                    <Settings size={18} /> Account Settings
                  </Link>
                  <div className="border-t border-slate-50 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-semibold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;