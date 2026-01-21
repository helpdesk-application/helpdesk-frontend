import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  User, 
  Tag, 
  AlertCircle, 
  Send 
} from 'lucide-react';
import SLATimer from '../../components/tickets/SLATimer';

const TicketDetail = ({ ticketId, onBack }) => {
  // Mock data for the specific ticket
  const [ticket, setTicket] = useState({
    id: ticketId || 'TICK-101',
    subject: 'Laptop not starting',
    description: 'The device screen remains black even after holding the power button for 30 seconds. No fan noise detected. Occurred after the latest system update.',
    status: 'Open',
    priority: 'High',
    category: 'Hardware',
    customer: 'manoj@helpdesk.com',
    createdAt: '2023-10-01 10:30 AM',
    deadline: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2-hour SLA
  });

  const [comment, setComment] = useState('');

  const handleStatusChange = (newStatus) => {
    setTicket({ ...ticket, status: newStatus });
    // In a real app, you would call an API here to update the DB
    console.log(`Ticket ${ticketId} status changed to ${newStatus}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Top Navigation */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Ticket List
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ticket Header & Description */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-md mb-2 inline-block">
                  {ticket.category}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900">{ticket.subject}</h1>
              </div>
              <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {ticket.id}
              </span>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p>{ticket.description}</p>
            </div>
          </div>

          {/* Communication / Comments Section (Module 6) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              Discussion Thread
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                  <User size={20} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Type your reply or internal note..."
                    className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition min-h-[120px]"
                  />
                  <div className="flex justify-end mt-3">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                      <Send size={18} /> Send Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info (Right 1 Column) */}
        <div className="space-y-6">
          
          {/* Status & Assignment Box */}
<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
  <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 text-sm">Manage Ticket</h3>
  
  <div className="space-y-5">
    {/* Status Dropdown */}
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Update Status</label>
      <select 
        value={ticket.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
      >
        <option>Open</option>
        <option>In-Progress</option>
        <option>Resolved</option>
        <option>Closed</option>
      </select>
    </div>

    {/* Agent Assignment (New Feature) */}
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Assign Agent</label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <select 
          className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
          defaultValue="Unassigned"
          onChange={(e) => {
            // Logic to update assigned agent
            console.log(`Ticket assigned to: ${e.target.value}`);
          }}
        >
          <option disabled value="Unassigned">Select Agent...</option>
          <option>Manoj (Admin)</option>
          <option>Rahul (Senior Agent)</option>
          <option>Priya (Technical Lead)</option>
          <option>Suresh (Support Associate)</option>
        </select>
      </div>
    </div>

    {/* SLA Timer */}
    <div>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">SLA Time Remaining</label>
      <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-mono font-bold">
        <Clock size={20} />
        <SLATimer deadline={ticket.deadline} />
      </div>
    </div>
  </div>
</div>
          {/* Ticket Metadata */}
          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
              <AlertCircle size={18} /> Ticket Info
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Requester</span>
                <span className="font-medium">{ticket.customer}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Priority</span>
                <span className={`font-bold ${ticket.priority === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium">{ticket.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;