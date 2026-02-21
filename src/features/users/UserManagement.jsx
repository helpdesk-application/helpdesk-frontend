import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pencil, Trash2, UserPlus, Shield, Users as UsersIcon, ToggleLeft, ToggleRight, X, Search, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchUsers, createUser, deleteUser, updateUser, toggleUserStatus } from '../../api/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Customer', department: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', department: '' });

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();
  const location = useLocation();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  const roleHierarchy = { 'Super Admin': 4, 'Admin': 3, 'Manager': 2, 'Agent': 1, 'Customer': 0 };
  const canManage = (target) => (roleHierarchy[currentUser.role] || 0) > (roleHierarchy[target.role] || 0);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Customer', department: '' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser._id, editForm);
      toast.success('User updated');
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleUserStatus(id);
      toast.success('Status toggled');
      loadUsers();
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name || '', email: user.email, role: user.role, department: user.department || '' });
    setShowEditModal(true);
  };

  const getRoleGradient = (role) => {
    const map = {
      'Super Admin': 'from-red-500 to-orange-500',
      'Admin': 'from-purple-500 to-indigo-500',
      'Manager': 'from-amber-500 to-orange-500',
      'Agent': 'from-blue-500 to-cyan-500',
      'Customer': 'from-slate-400 to-slate-500',
    };
    return map[role] || 'from-slate-400 to-slate-500';
  };

  const getRoleBadge = (role) => {
    const styles = {
      'Super Admin': 'bg-red-50 text-red-700 border-red-200',
      'Admin': 'bg-purple-50 text-purple-700 border-purple-200',
      'Manager': 'bg-amber-50 text-amber-700 border-amber-200',
      'Agent': 'bg-blue-50 text-blue-700 border-blue-200',
      'Customer': 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return styles[role] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const filtered = users.filter(u =>
    (u.name || u.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const ModalWrapper = ({ children, onClose: modalClose, title, icon }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={modalClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">{icon}</div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
          </div>
          <button onClick={modalClose} className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Users</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage users and access roles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: users.length, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Agents', value: users.filter(u => u.role === 'Agent').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Admins', value: users.filter(u => ['Admin', 'Super Admin'].includes(u.role)).length, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active', value: users.filter(u => u.status !== 'Inactive').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}><UsersIcon size={16} /></div>
            <div>
              <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>



      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map(user => (
                <tr key={user._id} className="hover:bg-brand-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getRoleGradient(user.role)} flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0`}>
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{user.name || '—'}</p>
                        <p className="text-[11px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{user.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.status === 'Inactive' ? 'text-red-600' : 'text-emerald-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Inactive' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {canManage(user) && (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleToggleStatus(user._id)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition" title="Toggle Status">
                          {user.status === 'Inactive' ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                        </button>
                        <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">No users found</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ModalWrapper onClose={() => setShowCreateModal(false)} title="Add New User" icon={<UserPlus size={20} className="text-white" />}>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
              <input type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="user@company.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="Min 6 characters" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition cursor-pointer font-medium">
                  <option>Customer</option>
                  <option>Agent</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <input type="text" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" placeholder="Optional" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition">Create User</button>
            </div>
          </form>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <ModalWrapper onClose={() => setShowEditModal(false)} title="Edit User" icon={<Pencil size={20} className="text-white" />}>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition cursor-pointer font-medium">
                  <option>Customer</option><option>Agent</option><option>Manager</option><option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                <input type="text" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition">Save Changes</button>
            </div>
          </form>
        </ModalWrapper>
      )}
    </div>
  );
};

export default UserManagement;
