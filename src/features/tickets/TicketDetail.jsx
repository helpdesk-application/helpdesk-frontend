import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import FileUploader from '../../components/FileUploader';
import { fetchTicketById, updateTicketStatus, fetchReplies, postReply, fetchUsers, assignTicket, fetchAttachments } from '../../api/api';

const TicketDetail = ({ ticketId: propTicketId, onBack: propOnBack }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const ticketId = propTicketId || routeId;
  const onBack = propOnBack || (() => navigate('/tickets'));

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user')) || { role: 'Customer' };
  const isAdminOrAgent = ['Admin', 'Agent', 'Super Admin'].includes(currentUser.role);
  const isAdmin = ['Admin', 'Super Admin'].includes(currentUser.role);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = [
          fetchTicketById(ticketId),
          fetchReplies(ticketId),
          fetchAttachments(ticketId)
        ];

        if (isAdminOrAgent) {
          promises.push(fetchUsers());
        }

        const [ticketRes, repliesRes, attachmentsRes] = await Promise.all([
          fetchTicketById(ticketId),
          fetchReplies(ticketId),
          fetchAttachments(ticketId).catch(err => {
            console.warn("Failed to fetch attachments:", err);
            return { data: [] }; // Return empty list on error
          })
        ]);

        const usersRes = isAdminOrAgent ? await fetchUsers() : null;

        const t = ticketRes.data;
        setTicket({
          id: t._id,
          subject: t.subject,
          description: t.description || 'No description provided.',
          status: t.status === 'OPEN' ? 'Open' :
            t.status === 'IN_PROGRESS' ? 'In-Progress' :
              t.status === 'RESOLVED' ? 'Resolved' :
                t.status === 'CLOSED' ? 'Closed' : t.status,
          priority: t.priority === 'HIGH' ? 'High' :
            t.priority === 'LOW' ? 'Low' :
              t.priority === 'CRITICAL' ? 'Critical' : 'Medium',
          category: 'General',
          customer: t.customer_id?.email || 'Unknown',
          assigned_agent_id: t.assigned_agent_id?._id || t.assigned_agent_id || '',
          createdAt: new Date(t.created_at).toLocaleString(),
          deadline: new Date(new Date(t.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        });

        setReplies(repliesRes.data || []);
        setAttachments(attachmentsRes.data || []);
        // Filter agents and admins
        if (isAdminOrAgent && usersRes) {
          setAgents((usersRes.data || []).filter(u => u.role === 'Agent' || u.role === 'Admin' || u.role === 'Super Admin'));
        }
      } catch (err) {
        console.error('Failed to load ticket:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [ticketId, isAdminOrAgent]);

  const reloadAttachments = async () => {
    try {
      const res = await fetchAttachments(ticketId);
      setAttachments(res.data || []);
    } catch (err) {
      console.error("Failed to reload attachments", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const apiStatus = newStatus === 'Open' ? 'OPEN' :
      newStatus === 'In-Progress' ? 'IN_PROGRESS' :
        newStatus === 'Resolved' ? 'RESOLVED' :
          newStatus === 'Closed' ? 'CLOSED' : newStatus;
    try {
      await updateTicketStatus(ticketId, apiStatus);
      setTicket({ ...ticket, status: newStatus });
      console.log(`Ticket ${ticketId} status changed to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update ticket status');
    }
  };

  const handleSendMessage = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      const response = await postReply(ticketId, comment);
      setReplies([...replies, response.data]);
      setComment('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleAgentChange = async (agentId) => {
    try {
      await assignTicket(ticketId, agentId);
      setTicket({ ...ticket, assigned_agent_id: agentId });
      alert('Ticket assigned successfully!');
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      alert('Failed to assign ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Loading ticket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <p className="font-semibold">Failed to load ticket</p>
        <p className="text-sm">{error}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">Go Back</button>
      </div>
    );
  }

  if (!ticket) return null;

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
        <div className={isAdminOrAgent ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>

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

            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-6">
              <p>{ticket.description}</p>
            </div>

            {/* Attachments Section */}
            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-slate-400" /> Attachments
              </h4>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {attachments.map(file => (
                    <div key={file._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {file.original_name.split('.').pop()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{file.original_name}</p>
                          <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:3000/api/attachments/download/${file.filename}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-xs font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic mb-4">No attachments yet.</p>
              )}

              <FileUploader ticketId={ticketId} onUploadSuccess={reloadAttachments} />
            </div>
          </div>

          {/* Communication / Comments Section (Module 6) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500" />
              Discussion Thread
            </h3>

            <div className="space-y-6">
              {/* Existing Replies */}
              <div className="space-y-4 mb-8">
                {replies.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-4">No messages in this thread yet.</p>
                ) : (
                  replies.map((reply) => (
                    <div key={reply._id} className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center font-bold text-blue-600 text-xs">
                        {reply.user_id?.name?.charAt(0) || reply.user_id?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-700">{reply.user_id?.name || reply.user_id?.email}</span>
                          <span className="text-[10px] text-slate-400">{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${reply.is_internal ? 'bg-yellow-50 text-slate-700 border border-yellow-100' : 'bg-slate-50 text-slate-600'}`}>
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Input */}
              <div className="flex gap-4 border-t border-slate-50 pt-6">
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
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !comment.trim()}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50"
                    >
                      <Send size={18} /> {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info (Right 1 Column) - Only for Agents/Admins */}
        {isAdminOrAgent && (
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
                      className={`w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none transition-all appearance-none ${isAdmin ? 'focus:ring-2 focus:ring-blue-500 cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                      value={ticket.assigned_agent_id || 'Unassigned'}
                      onChange={(e) => handleAgentChange(e.target.value)}
                      disabled={!isAdmin}
                    >
                      <option disabled value="Unassigned">
                        {ticket.assigned_agent_id ? 'Loading...' : 'Select Agent...'}
                      </option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.role})
                        </option>
                      ))}
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
        )}
      </div>
    </div>
  );
};

export default TicketDetail;