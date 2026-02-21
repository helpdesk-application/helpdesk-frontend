import React, { useState } from 'react';
import {
    User, CheckCircle2, CloudUpload, X, FileText, Image, Paperclip,
    ChevronDown, Shield, Briefcase, Calendar, Clock, Download
} from 'lucide-react';
import axios from 'axios';
import SLATimer from '../../sla/SLATimer';

const TicketSidebar = ({ ticket, isAdminOrAgent, isAdmin, handleStatusChange, agents, assignTicket, ticketId, onUploadSuccess, attachments }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/attachments/${ticketId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const onDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'In-Progress': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const isImage = (filename) => {
        const ext = filename?.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    };

    return (
        <div className="space-y-6">
            {/* Management Card */}
            <div className="bg-white p-5 rounded-3xl shadow-card border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    Management
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Status</label>
                        {isAdminOrAgent ? (
                            <div className="relative">
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                                >
                                    <option>Open</option>
                                    <option>In-Progress</option>
                                    <option>Resolved</option>
                                    <option>Closed</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        ) : (
                            <div className={`px-4 py-3 rounded-xl text-sm font-bold border flex items-center justify-between ${getStatusColor(ticket.status)}`}>
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                    {ticket.status}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Assigned Agent</label>
                        {isAdmin ? (
                            <div className="relative">
                                <select
                                    value={ticket.assigned_agent_id?._id || ticket.assigned_agent_id || ''}
                                    onChange={(e) => assignTicket(ticketId, e.target.value)}
                                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {agents.map(agent => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                    <User size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate">
                                        {ticket.assigned_agent_id?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ticket.priority === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
                                ticket.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    ticket.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>
            </div>

            {/* Attachments Card */}
            <div className="bg-white p-5 rounded-3xl shadow-card border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Paperclip size={14} /> Attachments
                </h3>

                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive
                            ? 'border-brand-500 bg-brand-50/50 scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                    />

                    <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dragActive ? 'bg-brand-100 text-brand-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                            {uploading ? <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /> : <CloudUpload size={20} />}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">
                                {uploading ? 'Uploading...' : 'Click or drop files'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Any format support</p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="mt-4 space-y-2">
                    {attachments && attachments.slice(0, 3).map(file => (
                        <a
                            key={file._id}
                            href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                                {isImage(file.filename) ? <Image size={14} /> : <FileText size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-700 truncate">{file.original_name}</p>
                                <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <Download size={14} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                        </a>
                    ))}
                    {attachments && attachments.length === 0 && (
                        <p className="text-[10px] text-slate-400 text-center italic py-2">No attachments yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketSidebar;
