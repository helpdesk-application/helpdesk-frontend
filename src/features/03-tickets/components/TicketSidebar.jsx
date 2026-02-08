import React from 'react';
import { Clock } from 'lucide-react';
import SLATimer from '../../05-sla/SLATimer';

const TicketSidebar = ({ ticket, isAdminOrAgent, isAdmin, handleStatusChange, agents, assignTicket, ticketId }) => {
    return (
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
    );
};

export default TicketSidebar;
