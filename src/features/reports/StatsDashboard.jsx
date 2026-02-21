import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TrendingUp, Zap, Clock, CheckCircle, Ticket, ArrowUpRight } from 'lucide-react';
import { fetchAnalytics } from '../../api/api';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsDashboard = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState('all');
  const navigate = useNavigate();

  const loadStats = async (selectedRange) => {
    setLoading(true);
    try {
      const response = await fetchAnalytics(selectedRange);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { loadStats(range); }, [range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = {
    labels: data?.ticketsByStatus?.map(s => s._id) || [],
    datasets: [{
      data: data?.ticketsByStatus?.map(s => s.count) || [],
      backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#6b7280', '#fb7185'],
      borderWidth: 0,
      borderRadius: 4,
    }],
  };

  const barData = {
    labels: data?.performance?.map(p => p.agent.name || p.agent.email) || [],
    datasets: [{
      label: 'Tickets Resolved',
      data: data?.performance?.map(p => p.count) || [],
      backgroundColor: '#6366f1',
      borderRadius: 8,
    }],
  };

  const resolvedRate = data?.totalTickets ? Math.round(((data?.resolvedTickets || 0) + (data?.closedTickets || 0)) / data.totalTickets * 100) : 0;

  const metrics = [
    {
      label: 'Total Tickets',
      value: data?.totalTickets || 0,
      icon: <Ticket size={20} />,
      gradient: 'from-brand-500 to-brand-600',
      shadowColor: 'shadow-brand-500/20',
      link: '/reports/total-tickets'
    },
    {
      label: 'Resolved Rate',
      value: `${resolvedRate}%`,
      icon: <CheckCircle size={20} />,
      gradient: 'from-emerald-500 to-emerald-600',
      shadowColor: 'shadow-emerald-500/20',
      link: '/reports/resolved-rate'
    },
    {
      label: 'SLA Compliance',
      value: `${Math.round(data?.slaCompliance || 100)}%`,
      icon: <Zap size={20} />,
      gradient: 'from-amber-500 to-orange-500',
      shadowColor: 'shadow-amber-500/20',
      link: '/reports/sla-compliance'
    },
    {
      label: 'Avg Resolution',
      value: `${data?.avgResolutionTime ? data.avgResolutionTime.toFixed(1) : 0}h`,
      icon: <Clock size={20} />,
      gradient: 'from-purple-500 to-violet-600',
      shadowColor: 'shadow-purple-500/20',
      link: '/reports/avg-resolution'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track performance and monitor ticket trends</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            {['daily', 'weekly', 'monthly', 'all'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${range === r ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {r === 'all' ? 'All Time' : r}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            onClick={() => navigate(metric.link)}
            className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 group hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${metric.gradient} text-white shadow-lg ${metric.shadowColor}`}>
                {metric.icon}
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-1">{metric.value}</p>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-brand-500" /> Status Distribution
          </h3>
          <div className="h-64 flex justify-center">
            {data?.ticketsByStatus?.length > 0 ? (
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { family: 'Inter', weight: 600, size: 11 } } } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" /> Agent Performance
          </h3>
          <div className="h-64">
            {data?.performance?.length > 0 ? (
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;