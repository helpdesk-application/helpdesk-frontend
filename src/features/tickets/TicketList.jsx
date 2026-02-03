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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Conditional Render: Detail View (Removed state-based toggle) ---

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> New Ticket
        </button>
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

        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          {['All', 'Open', 'In-Progress', 'Resolved'].map((s) => (
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
      </div>

      {/* Table Section */}
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
                  // --- CLICKABLE ROW LOGIC (Navigate to route) ---
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

      {isModalOpen && (
        <TicketForm onClose={() => setIsModalOpen(false)} onSuccess={loadTickets} />
      )}
    </div>
  );
};

export default TicketList;