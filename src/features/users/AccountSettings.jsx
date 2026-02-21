import React, { useState } from 'react';
import { Lock, Bell, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import api from '../../api/api';

const AccountSettings = () => {
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [notifications, setNotifications] = useState({
        emailNotif: true,
        ticketUpdates: true,
        slaAlerts: true,
        weeklyReport: false,
    });

    const user = JSON.parse(localStorage.getItem('user')) || {};

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.newPass.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
            return;
        }
        if (passwords.newPass !== passwords.confirm) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await api.patch(`/users/${user._id}/password`, {
                currentPassword: passwords.current,
                newPassword: passwords.newPass,
            });
            setMessage({ text: 'Password updated successfully', type: 'success' });
            setPasswords({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const ToggleSwitch = ({ checked, onChange, label }) => (
        <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-brand-500' : 'bg-slate-200'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    const PasswordInput = ({ name, value, placeholder }) => (
        <div className="relative">
            <input
                type={showPasswords[name] ? 'text' : 'password'}
                required
                value={value}
                onChange={(e) => setPasswords({ ...passwords, [name]: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition text-slate-800 pr-12"
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, [name]: !showPasswords[name] })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
                {showPasswords[name] ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Account Settings</h2>
                <p className="text-slate-500 text-sm mt-0.5">Manage your security and notification preferences</p>
            </div>

            {/* Change Password */}
            <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                        <Lock size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
                        <p className="text-[11px] text-slate-400">Update your account password</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-sm font-medium animate-slide-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                        <PasswordInput name="current" value={passwords.current} placeholder="Enter current password" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                        <PasswordInput name="newPass" value={passwords.newPass} placeholder="Min. 6 characters" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                        <PasswordInput name="confirm" value={passwords.confirm} placeholder="Re-enter new password" />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <ShieldCheck size={18} /> {saving ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                        <Bell size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Notification Preferences</h3>
                        <p className="text-[11px] text-slate-400">Choose what notifications you receive</p>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    <ToggleSwitch label="Email Notifications" checked={notifications.emailNotif} onChange={(v) => setNotifications({ ...notifications, emailNotif: v })} />
                    <ToggleSwitch label="Ticket Updates" checked={notifications.ticketUpdates} onChange={(v) => setNotifications({ ...notifications, ticketUpdates: v })} />
                    <ToggleSwitch label="SLA Alerts" checked={notifications.slaAlerts} onChange={(v) => setNotifications({ ...notifications, slaAlerts: v })} />
                    <ToggleSwitch label="Weekly Summary Report" checked={notifications.weeklyReport} onChange={(v) => setNotifications({ ...notifications, weeklyReport: v })} />
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
