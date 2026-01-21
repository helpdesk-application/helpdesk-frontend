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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatsDashboard = () => {
  // Data for Module 8: Ticket Status Distribution
  const pieData = {
    labels: ['Open', 'In-Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [12, 19, 45, 10],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#6b7280'],
    }],
  };

  // Data for Module 8: Agent Performance (Tickets Resolved)
  const barData = {
    labels: ['Agent Rahul', 'Agent Priya', 'Agent Manoj', 'Agent Sarah'],
    datasets: [{
      label: 'Tickets Resolved',
      data: [15, 22, 18, 25],
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
          <p className="text-3xl font-bold text-blue-600">86</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Avg. Resolution Time</p>
          <p className="text-3xl font-bold text-green-600">4.2 hrs</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">SLA Compliance</p>
          <p className="text-3xl font-bold text-orange-600">94%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Ticket Status</h3>
          <div className="h-64 flex justify-center">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Performing Agents</h3>
          <div className="h-64">
            <Bar data={barData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;