import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAnalytics, fetchTickets } from '../../api/api';
import { ArrowLeft, Ticket, CheckCircle, Zap, Clock, Search, Filter } from 'lucide-react';

const MetricReport = () => {
    const { metricId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const titleMap = {
        'total-tickets': 'Total Tickets Overview',
        'resolved-rate': 'Resolved Rate Analysis',
        'sla-compliance': 'SLA Compliance Report',
        'avg-resolution': 'Average Resolution Time Trends'
    };

    const descriptionMap = {
        'total-tickets': 'Comprehensive view of all tickets in the system',
        'resolved-rate': 'Detailed breakdown of resolved and closed tickets vs open tickets',
        'sla-compliance': 'Analysis of tickets meeting SLA targets',
        'avg-resolution': 'Tracking the average time taken to resolve issues'
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [analyticsRes, ticketsRes] = await Promise.all([
                    fetchAnalytics('all'),
                    fetchTickets()
                ]);
                setData(analyticsRes.data);
                setTickets(ticketsRes.data || []);
            } catch (err) {
                console.error('Failed to load metric report data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [metricId]);

    if (!titleMap[metricId]) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div className="text-2xl font-bold text-slate-800 mb-2">Report Not Found</div>
                <p className="text-slate-500 mb-6">The requested metric report does not exist.</p>
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition">Return to Dashboard</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Determine what value to highlight based on metricId
    let highlightValue = 'N/A';
    let highlightIcon = <Ticket size={24} className="text-brand-500" />;
    let highlightColor = 'text-brand-600';
    let bgGradient = 'bg-brand-50';
    let filteredList = tickets;

    if (data) {
        if (metricId === 'total-tickets') {
            highlightValue = data.totalTickets;
            highlightIcon = <Ticket size={24} className="text-brand-500" />;
            highlightColor = 'text-brand-600';
            bgGradient = 'bg-brand-50';
        } else if (metricId === 'resolved-rate') {
            const resolvedRate = data.totalTickets ? Math.round(((data.resolvedTickets || 0) + (data.closedTickets || 0)) / data.totalTickets * 100) : 0;
            highlightValue = `${resolvedRate}%`;
            highlightIcon = <CheckCircle size={24} className="text-emerald-500" />;
            highlightColor = 'text-emerald-600';
            bgGradient = 'bg-emerald-50';
            filteredList = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
        } else if (metricId === 'sla-compliance') {
            highlightValue = `${Math.round(data.slaCompliance || 100)}%`;
            highlightIcon = <Zap size={24} className="text-amber-500" />;
            highlightColor = 'text-amber-600';
            bgGradient = 'bg-amber-50';
        } else if (metricId === 'avg-resolution') {
            highlightValue = `${data.avgResolutionTime ? data.avgResolutionTime.toFixed(1) : 0}h`;
            highlightIcon = <Clock size={24} className="text-purple-500" />;
            highlightColor = 'text-purple-600';
            bgGradient = 'bg-purple-50';
            filteredList = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-[1200px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-500 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{titleMap[metricId]}</h1>
                    <p className="text-slate-500 mt-1">{descriptionMap[metricId]}</p>
                </div>
            </div>

            {/* Highlight Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-slate-500 font-semibold mb-2 uppercase tracking-wider text-sm">Key Metric</h2>
                    <div className={`text-6xl font-black ${highlightColor}`}>{highlightValue}</div>
                </div>
                <div className={`p-6 rounded-3xl ${bgGradient}`}>
                    {highlightIcon}
                </div>
            </div>

            {/* Relevant Tickets Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Relevant Tickets ({filteredList.length})</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Search tickets..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition w-64" />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition flex items-center gap-2 text-sm font-semibold">
                            <Filter size={16} /> Filter
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket ID</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredList.slice(0, 10).map((ticket) => (
                                <tr key={ticket._id} className="hover:bg-slate-50/80 transition cursor-pointer" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                                    <td className="py-4 px-6 font-mono text-sm text-slate-500">#{ticket._id.slice(-6)}</td>
                                    <td className="py-4 px-6 font-semibold text-slate-800">{ticket.subject}</td>
                                    <td className="py-4 px-6">
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">{ticket.status}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500">No relevant tickets found holding this metric.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MetricReport;
