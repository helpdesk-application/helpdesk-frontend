import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Shield, Building2, Activity, Save } from 'lucide-react';
import api from '../../api/api';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [activities, setActivities] = useState([]);

    const storedUser = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await api.get(`/users/${storedUser._id}`);
                setUser(res.data);
                setEditName(res.data.name || '');
            } catch (err) {
                console.error('Failed to load profile:', err);
                setUser(storedUser);
                setEditName(storedUser.name || '');
            }
            try {
                const actRes = await api.get(`/users/${storedUser._id}/activity`);
                setActivities(Array.isArray(actRes.data) ? actRes.data : []);
            } catch { }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const handleUpdateName = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        try {
            await api.patch(`/users/${storedUser._id}`, { name: editName.trim() });
            const updated = { ...storedUser, name: editName.trim() };
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(prev => ({ ...prev, name: editName.trim() }));
        } catch (err) {
            console.error('Failed to update name:', err);
        } finally {
            setSaving(false);
        }
    };

    const getRoleGradient = (role) => {
        const map = {
            'Super Admin': 'from-red-500 to-orange-500',
            'Admin': 'from-purple-500 to-indigo-500',
            'Manager': 'from-amber-500 to-orange-500',
            'Agent': 'from-blue-500 to-cyan-500',
            'Customer': 'from-brand-500 to-brand-600',
        };
        return map[role] || 'from-brand-500 to-brand-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const displayUser = user || storedUser;
    const avatarGradient = getRoleGradient(displayUser.role);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Profile Hero Card */}
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
                {/* Gradient Banner */}
                <div className="h-32 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-500 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-30" />
                </div>

                <div className="px-8 pb-8">
                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 relative z-10">
                        <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-extrabold text-3xl shadow-lg ring-4 ring-white flex-shrink-0`}>
                            {(displayUser.name || displayUser.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="pt-2 sm:pt-0 sm:pb-1">
                            <h2 className="text-xl font-extrabold text-slate-900">{displayUser.name || displayUser.email.split('@')[0]}</h2>
                            <p className="text-sm text-slate-500">{displayUser.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800"
                                    />
                                    <button
                                        onClick={handleUpdateName}
                                        disabled={saving || editName === displayUser.name}
                                        className="px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Mail size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Email</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">{displayUser.email}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Shield size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Role</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">{displayUser.role}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Building2 size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Department</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">{displayUser.department || 'Not assigned'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Activity size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                                    </div>
                                    <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {activities.length > 0 ? (
                                activities.slice(0, 8).map((act, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                                        <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-slate-700 font-medium">{act.action || act.message || 'Activity'}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{new Date(act.created_at || act.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-6 italic">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
