import React from 'react';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const UserProfile = () => {
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest', email: 'N/A', role: 'Customer' };

    return (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-blue-600 h-32 px-8 flex items-end">
                    <div className="h-24 w-24 rounded-full bg-white border-4 border-white shadow-lg translate-y-12 flex items-center justify-center text-blue-600">
                        <User size={48} />
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <h2 className="text-2xl font-bold text-slate-800">{user.name || user.email.split('@')[0]}</h2>
                    <p className="text-slate-500 font-medium mb-6 uppercase tracking-wider text-xs">{user.role}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400 mb-2">
                                <Mail size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Email Address</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400 mb-2">
                                <Shield size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Account Role</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">{user.role}</p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 text-slate-400 mb-2">
                                <Calendar size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Joined On</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Feb 2026</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <button className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg opacity-50 cursor-not-allowed">
                            Edit Profile
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 italic">* Profile editing is currently restricted to administrators.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
