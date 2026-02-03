import React, { useState } from 'react';
import { Settings, Lock, Bell, Eye, EyeOff } from 'lucide-react';

const AccountSettings = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
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
                        <h3 className="text-lg font-bold text-slate-800">Change Password</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div className="pt-2">
                            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 opacity-50 cursor-not-allowed">
                                Update Password
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
                        <h3 className="text-lg font-bold text-slate-800">Notification Preferences</h3>
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
