import React from 'react';
import { Clock } from 'lucide-react';
import SLATimer from '../../05-sla/SLATimer';
import FileUploader from '../../04-attachments/FileUploader';

const TicketSidebar = ({ ticket, isAdminOrAgent, isAdmin, handleStatusChange, agents, assignTicket, ticketId, attachments, onUploadSuccess }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">Management</h3>
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Ticket Status</label>
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={!isAdminOrAgent}
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <option>Open</option>
                            <option>In-Progress</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                        </select>
                    </div>

                    {isAdmin && (
                        <div>
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Assign Agent</label>
                            <select
                                value={ticket.assigned_agent_id}
                                onChange={(e) => assignTicket(ticketId, e.target.value)}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <option value="">Unassigned</option>
                                {agents.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-50 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">SLA Time</span>
                            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 border border-red-100">
                                <Clock size={12} /> <SLATimer deadline={ticket.deadline} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">Priority</span>
                            <span className={`font-extrabold ${ticket.priority === 'Critical' ? 'text-red-500' : ticket.priority === 'High' ? 'text-orange-500' : 'text-slate-600'}`}>{ticket.priority}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest border-b border-slate-50 pb-4">Attachments</h3>
                <div className="space-y-3">
                    {attachments && attachments.length > 0 ? (
                        attachments.map(file => (
                            <div key={file._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                    <Clock size={14} /> {/* Placeholder for file icon */}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{file.original_name}</p>
                                    <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <a
                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/attachments/download/${file.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                >
                                    <Clock size={14} /> {/* Placeholder for download icon */}
                                </a>
                            </div>
                        ))
                    ) : (
                        <p className="text-[11px] text-slate-400 text-center py-4 italic">No files attached</p>
                    )}

                    {/* Uploader Component */}
                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <FileUploader ticketId={ticketId} onUploadSuccess={onUploadSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketSidebar;
