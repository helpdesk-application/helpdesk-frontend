import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Search, Filter, X } from 'lucide-react';
import TicketDetail from './TicketDetail';
import TicketForm from './TicketForm';
import { fetchTickets } from '../../api/api';

const TicketList = () => {
  // --- States ---
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('List'); // 'List' or 'Kanban'
  const navigate = useNavigate();

  // --- Load Real Data from API ---
  const loadTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchTickets();
      // Map API response to component format
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

  useEffect(() => {
    loadTickets();
  }, []);

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In-Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Kanban Column Helper ---
  const getColumnTickets = (status) => tickets.filter(t =>
    t.status === status &&
    (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Loading tickets...</span>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <p className="font-semibold">Failed to load tickets</p>
        <p className="text-sm">{error}</p>
        <button onClick={loadTickets} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ticket Management</h2>
          <p className="text-slate-500 text-sm">Monitor and resolve support requests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mr-2">
            <button
              onClick={() => setViewMode('List')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'List' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('Kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'Kanban' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
            >
              Kanban
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} /> New Ticket
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {viewMode === 'List' && (
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
            {['All', 'Open', 'In-Progress', 'Resolved', 'Closed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'List' ? (
        /* Table Section */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-slate-400 font-medium text-xs text-center">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-slate-400">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 font-medium ${ticket.priority === 'High' ? 'text-red-600' : 'text-slate-600'}`}>
                        {ticket.priority === 'High' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {ticket.createdAt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div className="p-2 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-xl transition-all">
                          <Eye size={20} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-block p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                <Search size={48} />
              </div>
              <p className="text-slate-500 font-medium">No tickets match your criteria</p>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View Section */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
          {['Open', 'In-Progress', 'Resolved', 'Closed'].map(status => (
            <div key={status} className="bg-slate-100/50 rounded-3xl p-4 min-w-[280px] flex flex-col h-full border border-slate-200/50">
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === 'Open' ? 'bg-blue-500' : status === 'In-Progress' ? 'bg-yellow-500' : status === 'Resolved' ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {status}
                </h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 shadow-sm border border-slate-100">
                  {getColumnTickets(status).length}
                </span>
              </div>
              <div className="space-y-3 flex-1">
                {getColumnTickets(status).map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-mono font-bold text-slate-400 mb-2 uppercase tracking-tight">#{ticket.id.slice(-6)}</div>
                    <div className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{ticket.subject}</div>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{ticket.createdAt}</span>
                    </div>
                  </div>
                ))}
                {getColumnTickets(status).length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 text-xs italic bg-white/30">
                    No tickets in {status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TicketForm onClose={() => setIsModalOpen(false)} onSuccess={loadTickets} />
      )}
    </div>
  );
};

export default TicketList;