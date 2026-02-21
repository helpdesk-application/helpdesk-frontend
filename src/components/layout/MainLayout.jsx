import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, BookOpen, Users,
  LogOut, UserCircle, ChevronDown, Settings, Bell, Check,
  PanelLeftClose, PanelLeft, Menu, X, Search
} from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../../api/api';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user')) || { email: 'Guest', role: 'Customer' };

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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const term = encodeURIComponent(searchQuery.trim());
      if (location.pathname.startsWith('/users')) {
        navigate(`/users?search=${term}`);
      } else if (location.pathname.startsWith('/kb')) {
        navigate(`/kb?search=${term}`);
      } else {
        navigate(`/tickets?search=${term}`);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Super Admin', 'Manager'] },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin', 'Manager'] },
    { name: 'Knowledge Base', path: '/kb', icon: <BookOpen size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin', 'Manager'] },
    { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['Admin', 'Super Admin'] },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentPageName = menuItems.find(i => i.path === location.pathname)?.name || 'Overview';

  const userInitial = user.email.charAt(0).toUpperCase();
  const userName = user.name || user.email.split('@')[0];

  // Avatar gradient based on role
  const avatarGradient = {
    'Super Admin': 'from-rose-500 to-orange-500',
    'Admin': 'from-violet-500 to-purple-600',
    'Manager': 'from-amber-400 to-orange-500',
    'Agent': 'from-blue-500 to-cyan-500',
    'Customer': 'from-emerald-400 to-teal-600',
  }[user.role] || 'from-brand-500 to-brand-600';

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className={`h-16 flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-6'} border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0 text-white">
            <Ticket size={18} strokeWidth={2.5} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">Helpdesk</h1>
              <p className="text-[10px] text-brand-200 font-medium uppercase tracking-widest mt-0.5">Pro Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!item.roles.includes(user.role)) return null;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={sidebarCollapsed ? item.name : undefined}
              className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-4 py-3'} rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              )}
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110 text-brand-300' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              {!sidebarCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="p-3 border-t border-white/10 hidden md:block">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-4 py-3'} rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200`}
        >
          {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          {!sidebarCollapsed && <span className="text-sm font-medium">Collapse Sidebar</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-surface-ground text-text-primary selection:bg-brand-500/30">
      {/* Desktop Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-[72px]' : 'w-72'} bg-[#0f172a] flex flex-col hidden md:flex transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] relative z-50 shadow-2xl`}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl flex flex-col animate-slide-in-from-left">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 z-40
          bg-surface-overlay backdrop-blur-md border-b border-slate-200/50">

          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-xl transition md:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-text-primary tracking-tight">{currentPageName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Global Search (Visual Placeholder) */}
            <div className="hidden md:flex items-center bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 w-64 transition-all focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 focus-within:bg-white">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 ml-2 w-full"
              />
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2.5 rounded-xl transition-all duration-200 relative group
                  ${isNotifOpen ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-in origin-top-right z-50">
                  <div className="px-5 py-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-10 glass">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && <span className="bg-brand-100 text-brand-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                        <Bell size={32} className="opacity-20" />
                        <p className="text-sm font-medium">All caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map(n => (
                          <Link
                            key={n._id}
                            to={n.ticket_id ? `/tickets/${n.ticket_id}` : '#'}
                            onClick={() => {
                              if (!n.is_read) handleMarkRead(n._id);
                              setIsNotifOpen(false);
                            }}
                            className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group relative
                              ${!n.is_read ? 'bg-brand-50/40' : ''}`}
                          >
                            {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-brand-500' : 'bg-slate-300'}`} />
                            <div className="flex-1 space-y-1">
                              <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>{n.message}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="block py-3.5 text-center text-xs font-bold text-brand-600 bg-slate-50 border-t border-slate-100 hover:bg-brand-50 hover:text-brand-700 transition"
                  >
                    View History
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 p-1.5 pl-3 rounded-xl border transition-all duration-200
                  ${isProfileOpen ? 'bg-white border-brand-200 shadow-sm' : 'border-transparent hover:bg-white hover:border-slate-200'}`}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-700 leading-tight">{userName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white`}>
                  {userInitial}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-brand-500' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-scale-in origin-top-right z-50">
                  <div className="px-5 py-4 border-b border-slate-50 mb-1">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                  </div>
                  <div className="px-2 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors rounded-xl"
                    >
                      <UserCircle size={18} /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-brand-600 transition-colors rounded-xl"
                    >
                      <Settings size={18} /> Account Settings
                    </Link>
                  </div>
                  <div className="border-t border-slate-50 mt-2 pt-2 px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-semibold rounded-xl"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              {/* Breadcrumb or Page Title can go here if needed in future, currently handled by header title */}
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;