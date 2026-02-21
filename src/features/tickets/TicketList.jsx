import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, List as ListIcon, LayoutGrid, Tag, User2 } from 'lucide-react';
import TicketDetail from './TicketDetail';
import TicketForm from './TicketForm';
import { fetchTickets } from '../../api/api';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('List');
  const navigate = useNavigate();
  const location = useLocation();

  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTickets();
      const mapped = (response.data || []).map(t => ({
        id: t._id,
        subject: t.subject,
        status: t.status === 'OPEN' ? 'Open' :
          t.status === 'IN_PROGRESS' ? 'In-Progress' :
            t.status === 'RESOLVED' ? 'Resolved' :
              t.status === 'CLOSED' ? 'Closed' : t.status,
        priority: t.priority === 'HIGH' ? 'High' :
          t.priority === 'LOW' ? 'Low' :
            t.priority === 'CRITICAL' ? 'Critical' : 'Medium',
        category: 'General',
        createdAt: new Date(t.created_at).toLocaleDateString()
      }));
      setTickets(mapped);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const statusParam = params.get('status');

    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (statusParam) {
      setFilter(statusParam);
    }
  }, [location.search]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
      case 'In-Progress': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
      case 'Closed': return 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/20';
      default: return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'Low': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-brand-500';
      case 'Low': return 'bg-slate-500';
      default: return 'bg-slate-300';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getColumnTickets = (status) => tickets.filter(t =>
    t.status === status &&
    (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In-Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-brand-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <span className="text-slate-500 font-medium animate-pulse">Loading workspace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-500 font-medium mb-2">Failed to load tickets: {typeof error === 'string' ? error : JSON.stringify(error)}</div>
        <button
          onClick={loadTickets}
          className="text-brand-600 font-bold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getAvatarColor = (name) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const hash = (name || '').charCodeAt(0) % colors.length;
    return colors[hash];
  };

  const TicketCard = ({ ticket }) => (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="group bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${getPriorityDot(ticket.priority)}`} />

      <div className="flex justify-between items-start mb-2 pl-2">
        <span className="text-[10px] font-mono text-slate-400">#{ticket.id.slice(-6)}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </span>
      </div>

      <h3 className="font-bold text-slate-800 text-sm mb-3 pl-2 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
        {ticket.subject}
      </h3>

      <div className="flex items-center justify-between pl-2 mt-auto border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Tag size={12} />
          <span className="truncate max-w-[80px]">{ticket.category}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          {ticket.assignee ? (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white ${getAvatarColor(ticket.assignee.name || ticket.assignee.email)}`}
              title={`Assigned to ${ticket.assignee.name || ticket.assignee.email}`}
            >
              {(ticket.assignee.name || ticket.assignee.email || '?').charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 ring-2 ring-white">
              <User2 size={12} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Support Tickets</h1>
          <p className="text-slate-500 mt-1">Manage and track all support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Ticket</span>
          </button>
        </div>
      </div>

      {/* Stats Cards (Optional - can be kept or removed, keeping for now) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tickets', value: tickets.length, color: 'brand' },
          { label: 'Open', value: tickets.filter(t => t.status === 'Open').length, color: 'blue' },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'In-Progress').length, color: 'amber' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length, color: 'emerald' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-800 mb-1">{stat.value}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>


      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          {['All', 'Open', 'In-Progress', 'Resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filter === status
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search size={32} />
          </div>
          <p className="text-slate-500 font-medium mb-1">No tickets found</p>
          <p className="text-slate-400 text-sm">Try adjusting your filters or create a new ticket.</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors mb-0.5">{ticket.subject}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono">#{ticket.id.slice(-6)}</span>
                          <span>•</span>
                          <span>{ticket.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></span>
                        <span className="text-sm font-semibold text-slate-600">{ticket.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-brand-600 transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-hidden pb-6 h-[calc(100vh-280px)] items-start">
          {['Open', 'In-Progress', 'Resolved', 'Closed'].map(status => {
            const columnTickets = filteredTickets.filter(t => t.status === status);
            return (
              <div key={status} className="flex-1 min-w-[250px] max-w-sm flex flex-col max-h-full bg-slate-50/50 rounded-3xl border border-slate-100/50">
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/50 backdrop-blur-sm z-10 rounded-t-3xl border-b border-slate-100/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status)} shadow-lg shadow-${getStatusColor(status).replace('bg-', '')}/50`}></div>
                    <h3 className="font-extrabold text-slate-700 text-sm tracking-wide">{status}</h3>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-400 border border-slate-100 shadow-sm">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Tickets */}
                <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {columnTickets.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-100 rounded-xl p-6 text-center">
                      <p className="text-xs text-slate-400 font-medium">No tickets</p>
                    </div>
                  ) : (
                    columnTickets.map(ticket => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <TicketForm
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadTickets}
        />
      )}
    </div>
  );
};

export default TicketList;