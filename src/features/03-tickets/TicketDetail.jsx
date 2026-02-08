import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  User,
  Tag,
  AlertCircle,
  Send,
  Star,
  Columns,
  Sparkles,
  FileText,
  Mail,
  Linkedin,
  MessageCircle,
  Hash,
  History,
  Activity
} from 'lucide-react';
import SLATimer from '../05-sla/SLATimer';
import FileUploader from '../04-attachments/FileUploader';
import TicketConversation from './components/TicketConversation';
import TicketHistory from './components/TicketHistory';
import AIInsights from './components/AIInsights';
import TicketSidebar from './components/TicketSidebar';
import { fetchTicketById, updateTicketStatus, fetchReplies, postReply, fetchUsers, assignTicket, fetchAttachments, fetchTicketHistory } from '../../api/api';

const Blueprints = {
  Billing: ["Verify customer subscription status", "Check recent payment logs in Stripe", "Request screenshot of the error if applicable", "Escalate to Accounts if refund requested"],
  Technical: ["Check server logs for error trace", "Identify which API version is being used", "Try to reproduce on staging environment", "Tag as 'BUG' if reproduced"],
  Security: ["Audit recent login attempts", "Check if 2FA is enabled for the account", "Verify ownership via identity challenge", "Force logout all sessions if suspicious"],
  General: ["Acknowledge the ticket within 2 hours", "Ask for more details if the description is vague", "Search KB for similar issues"]
};

const ResponseTemplates = {
  Billing: [{ title: "Refund Policy", text: "Hello, our refund policy covers requests made within 30 days. Let me check your eligibility." }, { title: "Payment Failed", text: "It seems your recent payment failed. Please check your card details or contact your bank." }],
  Technical: [{ title: "Bug Acknowledged", text: "We've confirmed this is a bug and our engineers are working on a fix." }, { title: "Log Request", text: "Could you please provide the server logs or the exact error message you received?" }],
  Security: [{ title: "Password Reset", text: "For security reasons, please reset your password using the link sent to your email." }, { title: "Account Freeze", text: "We have temporarily frozen your account as a precaution due to suspicious activity." }],
  General: [{ title: "Initial Greet", text: "Thank you for reaching out! We've received your ticket and are looking into it." }]
};

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
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [activeTab, setActiveTab] = useState('Conversation');
  const [history, setHistory] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user')) || { role: 'Customer' };
  const isAdminOrAgent = ['Admin', 'Agent', 'Super Admin', 'Manager'].includes(currentUser.role);
  const isAdmin = ['Admin', 'Super Admin', 'Manager'].includes(currentUser.role);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ticketRes, repliesRes, attachmentsRes, historyRes] = await Promise.all([
          fetchTicketById(ticketId),
          fetchReplies(ticketId),
          fetchAttachments(ticketId).catch(() => ({ data: [] })),
          fetchTicketHistory(ticketId).catch(() => ({ data: [] }))
        ]);

        const usersRes = isAdmin ? await fetchUsers() : null;
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
          category: t.category || 'General',
          customer: t.customer_id?.email || 'Unknown',
          assigned_agent_id: t.assigned_agent_id?._id || t.assigned_agent_id || '',
          createdAt: new Date(t.created_at).toLocaleString(),
          deadline: new Date(new Date(t.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString(),
          sentiment: t.sentiment || 'Neutral'
        });

        setReplies(repliesRes.data || []);
        setAttachments(attachmentsRes.data || []);
        setHistory(historyRes.data || []);
        setRating(t.happiness_rating || 0);
        setFeedback(t.customer_feedback || '');
        setTimeSpent(t.time_spent_minutes || 0);

        if (isAdminOrAgent && usersRes) {
          setAgents((usersRes.data || []).filter(u => ['Agent', 'Admin', 'Super Admin'].includes(u.role)));
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

  const handleStatusChange = async (newStatus) => {
    const apiStatus = newStatus === 'Open' ? 'OPEN' :
      newStatus === 'In-Progress' ? 'IN_PROGRESS' :
        newStatus === 'Resolved' ? 'RESOLVED' :
          newStatus === 'Closed' ? 'CLOSED' : newStatus;
    try {
      await updateTicketStatus(ticketId, apiStatus);
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
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
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="py-20 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" /><p className="mt-4 text-slate-500">Loading ticket...</p></div>;
  if (error) return <div className="p-10 text-center bg-red-50 rounded-3xl"><p className="text-red-600 font-bold">{error}</p><button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl">Back</button></div>;
  if (!ticket) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg mb-3 inline-block">
                  {ticket.category}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{ticket.subject}</h1>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">TICKET ID</span>
                <span className="font-mono text-xs font-bold bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{ticket.id}</span>
              </div>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-lg mb-8 whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {['Conversation', 'History'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
                </button>
              ))}
            </div>

            {activeTab === 'Conversation' ? (
              <TicketConversation
                replies={replies}
                isAdminOrAgent={isAdminOrAgent}
                ResponseTemplates={ResponseTemplates}
                category={ticket.category}
                comment={comment}
                setComment={setComment}
                handleSendMessage={handleSendMessage}
                sending={sending}
              />
            ) : (
              <TicketHistory history={history} createdAt={ticket.createdAt} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TicketSidebar
            ticket={ticket}
            isAdminOrAgent={isAdminOrAgent}
            isAdmin={isAdmin}
            handleStatusChange={handleStatusChange}
            agents={agents}
            assignTicket={assignTicket}
            ticketId={ticketId}
          />

          {isAdminOrAgent && (
            <AIInsights
              sentiment={ticket.sentiment}
              Blueprints={Blueprints}
              category={ticket.category}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;