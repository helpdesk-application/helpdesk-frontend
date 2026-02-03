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
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#6b7280'],
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
      <h2 className="text-2xl font-bold text-gray-800">Analytics Overview</h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Total Tickets</p>
          <p className="text-3xl font-bold text-blue-600">{data?.totalTickets || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Resolved/Closed</p>
          <p className="text-3xl font-bold text-green-600">{(data?.resolvedTickets || 0) + (data?.closedTickets || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Active Tickets</p>
          <p className="text-3xl font-bold text-orange-600">{(data?.totalTickets || 0) - ((data?.resolvedTickets || 0) + (data?.closedTickets || 0))}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Ticket Status Distribution</h3>
          <div className="h-64 flex justify-center">
            {data?.ticketsByStatus?.length > 0 ? (
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Agent Performance (Tickets Resolved)</h3>
          <div className="h-64">
            {data?.performance?.length > 0 ? (
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;