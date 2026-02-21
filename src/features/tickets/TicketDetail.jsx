import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, History, Lightbulb, Tag, User2, Clock, Calendar, Hash, CheckCircle2 } from 'lucide-react';
import TicketConversation from './components/TicketConversation';
import TicketHistory from './components/TicketHistory';
import TicketSidebar from './components/TicketSidebar';
import AIInsights from './components/AIInsights';
import {
  fetchTicketById, fetchReplies, fetchAttachments, fetchTicketHistory,
  updateTicketStatus, postReply, assignTicket, fetchUsers
} from '../../api/api';

const ResponseTemplates = {
  General: [
    { title: '👋 Greeting', text: 'Hello! Thank you for reaching out. I\'d be happy to help with your request.' },
    { title: '🔍 Need Info', text: 'Could you provide more details about the issue? This will help us resolve it faster.' },
    { title: '✅ Resolved', text: 'This issue has been resolved. Please let us know if you need further assistance.' },
  ],
  Technical: [
    { title: '🔄 Restart', text: 'Please try restarting the application and let us know if the issue persists.' },
    { title: '🧹 Cache', text: 'Try clearing your browser cache and cookies, then attempt again.' },
  ],
};

const TicketDetail = ({ ticketId: propTicketId, onBack: propOnBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const ticketId = propTicketId || params.id;

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('conversation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = ['Admin', 'Super Admin'].includes(user.role);
  const isAdminOrAgent = ['Admin', 'Super Admin', 'Agent', 'Manager'].includes(user.role);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      try {
        const [ticketRes, repliesRes, attachmentsRes, historyRes] = await Promise.all([
          fetchTicketById(ticketId),
          fetchReplies(ticketId),
          fetchAttachments(ticketId),
          fetchTicketHistory(ticketId)
        ]);
        setTicket(ticketRes.data);
        setReplies(Array.isArray(repliesRes.data) ? repliesRes.data : []);
        setAttachments(Array.isArray(attachmentsRes.data) ? attachmentsRes.data : []);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);

        if (isAdmin) {
          try {
            const usersRes = await fetchUsers();
            setAgents(usersRes.data.filter(u => ['Agent', 'Admin', 'Super Admin'].includes(u.role)));
          } catch { }
        }
      } catch (err) {
        setError(err.message || 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    loadTicket();
  }, [ticketId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      setTicket(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await postReply(ticketId, comment);
      const repliesRes = await fetchReplies(ticketId);
      setReplies(Array.isArray(repliesRes.data) ? repliesRes.data : []);
      setComment('');
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (tid, agentId) => {
    try {
      await assignTicket(tid, agentId);
      setTicket(prev => ({ ...prev, assigned_agent_id: agentId }));
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  const handleBack = () => propOnBack ? propOnBack() : navigate('/tickets');

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-brand-100 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="text-slate-500 font-medium animate-pulse">Loading ticket details...</span>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center max-w-md shadow-lg shadow-red-100/50">
        <h3 className="font-bold text-red-900 text-lg mb-2">Unable to load ticket</h3>
        <p className="text-red-600/80 text-sm mb-6">{error}</p>
        <button
          onClick={handleBack}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition shadow-lg shadow-red-600/20 active:scale-95"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!ticket) return null;

  const statusStyles = {
    'Open': 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    'In-Progress': 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    'Resolved': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    'Closed': 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/20',
  };

  const priorityStyles = {
    'Critical': 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    'High': 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
    'Medium': 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/20',
    'Low': 'bg-slate-50 text-slate-600 ring-1 ring-slate-400/20',
  };

  const getNormalizedStyle = (styles, key, defaultKey) => {
    const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '-');
    const foundKey = Object.keys(styles).find(k => normalize(k) === normalize(key));
    return styles[foundKey] || styles[defaultKey];
  };

  const currentStatusStyle = getNormalizedStyle(statusStyles, ticket.status, 'Open');
  const currentPriorityStyle = getNormalizedStyle(priorityStyles, ticket.priority, 'Medium');

  const tabs = [
    { id: 'conversation', label: 'Conversation', icon: <MessageSquare size={18} />, count: replies.length },
    { id: 'history', label: 'History', icon: <History size={18} />, count: history.length },
    { id: 'insights', label: 'AI Insights', icon: <Lightbulb size={18} /> },
  ];

  return (
    <div className="animate-fade-in pb-10 space-y-6">
      {/* Ticket Header */}
      <div>
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6 group font-medium text-sm">
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-slate-300 transition-colors shadow-sm">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Back to Tickets
        </button>

        <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 md:p-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${currentStatusStyle.split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`} />

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${currentStatusStyle}`}>
                  {ticket.status}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${currentPriorityStyle}`}>
                  {ticket.priority} Priority
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  <Hash size={12} /> {ticketId.slice(-6)}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">{ticket.subject}</h1>
                {ticket.description && (
                  <p className="text-slate-500 text-base leading-relaxed max-w-3xl">{ticket.description}</p>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50 text-xs font-medium text-slate-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                    <User2 size={14} />
                  </div>
                  <span className="text-slate-600">{ticket.created_by?.name || ticket.created_by?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Tag size={14} />
                  </div>
                  <span className="text-slate-600">{ticket.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Calendar size={14} />
                  </div>
                  <span className="text-slate-600">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm w-full sm:w-auto self-start overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden min-h-[500px]">
            {activeTab === 'conversation' && (
              <TicketConversation
                replies={replies}
                isAdminOrAgent={isAdminOrAgent}
                ResponseTemplates={ResponseTemplates}
                category={ticket.category || 'General'}
                comment={comment}
                setComment={setComment}
                handleSendMessage={handleSendMessage}
                sending={sending}
                attachments={attachments}
              />
            )}
            {activeTab === 'history' && <TicketHistory history={history} />}
            {activeTab === 'insights' && <AIInsights ticket={ticket} />}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <TicketSidebar
            ticket={ticket}
            isAdminOrAgent={isAdminOrAgent}
            isAdmin={isAdmin}
            handleStatusChange={handleStatusChange}
            agents={agents}
            assignTicket={handleAssign}
            ticketId={ticketId}
            attachments={attachments}
            onUploadSuccess={async () => {
              const res = await fetchAttachments(ticketId);
              setAttachments(Array.isArray(res.data) ? res.data : []);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;