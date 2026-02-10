import React, { useState } from 'react';
import { Settings, Lock, Bell, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { changePassword } from '../../api/api';

const AccountSettings = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const isFormValid =
        passwords.currentPassword.length > 0 &&
        passwords.newPassword.length >= 8 &&
        passwords.newPassword === passwords.confirmPassword;

    const handleUpdatePassword = async () => {
        if (!isFormValid) return;

        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        try {
            await changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            window.alert('✅ Password updated successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update password';
            setStatus({ type: 'error', message: msg });
            window.alert('❌ ' + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="text-blue-500" /> Account Settings
                </h2>

                {/* Change Password */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                    </div>

                    <div className="space-y-4">
                        {status.message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition shadow-sm text-slate-800 placeholder:text-slate-500 font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">New Password (Min 8 characters)</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition shadow-sm text-slate-800 placeholder:text-slate-500 font-medium"
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition shadow-sm text-slate-800 placeholder:text-slate-500 font-medium"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleUpdatePassword}
                                disabled={!isFormValid || isSubmitting}
                                className={`w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 ${isFormValid && !isSubmitting ? 'hover:bg-blue-700 hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95' : 'opacity-50 cursor-not-allowed bg-slate-400 shadow-none'
                                    }`}
                            >
                                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Notification Preferences</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Email Notifications</p>
                                <p className="text-xs text-slate-400">Receive alerts when a ticket is updated</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full relative shadow-inner cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-50">
                            <div>
                                <p className="text-sm font-bold text-slate-700">Desktop Notifications</p>
                                <p className="text-xs text-slate-400">Browser alerts for urgent assignments</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-not-allowed">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
