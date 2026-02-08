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
import { TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';
import { fetchAnalytics } from '../../api/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsDashboard = () => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchAnalytics();
        setData(response.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Map Ticket Status Distribution
  const pieData = {
    labels: data?.ticketsByStatus?.map(s => s._id) || [],
    datasets: [{
      data: data?.ticketsByStatus?.map(s => s.count) || [],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6b7280', '#fb7185'],
    }],
  };

  // Map Agent Performance (Resolved Tickets)
  const barData = {
    labels: data?.performance?.map(p => p.agent.name || p.agent.email) || [],
    datasets: [{
      label: 'Tickets Resolved',
      data: data?.performance?.map(p => p.count) || [],
      backgroundColor: '#3b82f6',
    }],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
          <Zap size={14} className="text-yellow-500" /> Live Data
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tickets</p>
          <p className="text-3xl font-extrabold text-blue-600">{data?.totalTickets || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resolved Rate</p>
          <p className="text-3xl font-extrabold text-green-600">
            {data?.totalTickets ? Math.round(((data?.resolvedTickets || 0) + (data?.closedTickets || 0)) / data.totalTickets * 100) : 0}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Zap size={10} className="text-yellow-500" /> SLA Compliance
          </p>
          <p className="text-3xl font-extrabold text-indigo-600">{Math.round(data?.slaCompliance || 100)}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Clock size={10} className="text-blue-500" /> Avg Resolution
          </p>
          <p className="text-3xl font-extrabold text-slate-800">
            {data?.avgResolutionTime ? data.avgResolutionTime.toFixed(1) : 0}h
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" /> Ticket Status Distribution
          </h3>
          <div className="h-64 flex justify-center">
            {data?.ticketsByStatus?.length > 0 ? (
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" /> Agent Performance
          </h3>
          <div className="h-64">
            {data?.performance?.length > 0 ? (
              <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
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