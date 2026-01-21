import React, { useState } from 'react';
import { UserPlus, Shield, Mail, MoreVertical, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  // Mock data for Module 2 requirements
  const [users, setUsers] = useState([
    { id: 1, name: 'Manoj Kumar', email: 'manoj@helpdesk.com', role: 'Admin', status: 'Active', department: 'IT Support' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@helpdesk.com', role: 'Agent', status: 'Active', department: 'Network' },
    { id: 3, name: 'Priya Singh', email: 'priya@client.com', role: 'Customer', status: 'Active', department: 'External' },
    { id: 4, name: 'Suresh Raina', email: 'suresh@helpdesk.com', role: 'Agent', status: 'Inactive', department: 'Hardware' },
  ]);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Agent': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm">Manage system access, roles, and permissions</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg active:scale-95">
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      {/* User Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-5">User Details</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Department</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.status === 'Active' ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <XCircle size={14} className="text-slate-300" />
                      )}
                      <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-slate-700' : 'text-slate-400'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Summary Footer */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Shield className="text-blue-600 mt-0.5" size={20} />
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Security Note:</strong> Admins can manage all users and roles. Agents have restricted access to ticket management only. Role changes take effect upon the next user login.
        </p>
      </div>
    </div>
  );
};

export default UserManagement;