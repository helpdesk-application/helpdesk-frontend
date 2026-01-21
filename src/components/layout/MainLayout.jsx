import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Ticket, BookOpen, Users, 
  LogOut, UserCircle, ChevronDown, Settings, Bell 
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get real user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || { email: 'Guest', role: 'Customer' };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin'] },
    { name: 'Tickets', path: '/tickets', icon: <Ticket size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin'] },
    { name: 'Knowledge Base', path: '/kb', icon: <BookOpen size={20} />, roles: ['Admin', 'Agent', 'Customer', 'Super Admin'] },
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
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

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
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                    <UserCircle size={18} /> My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition">
                    <Settings size={18} /> Account Settings
                  </button>
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