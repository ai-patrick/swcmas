import React, { useEffect, useState } from 'react';
import { getOfficerStats } from '@/api/dashboard.api.js';
import StatCard from '@/components/ui/StatCard.jsx';
import BarChartCard from '@/components/ui/BarChartCard.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { FileWarning, AlertTriangle, AlertCircle, Clock } from 'lucide-react';

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getOfficerStats();
        setStats(data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <EmptyState title="Error Loading Dashboard" message={error} icon={AlertTriangle} />;
  if (!stats) return null;

  const complaintCols = [
    { header: 'Title', accessor: 'title' },
    { header: 'Priority', accessor: 'priority', render: (row) => (
      <Badge variant={row.priority === 'critical' ? 'danger' : row.priority === 'high' ? 'warning' : 'info'}>
        {row.priority}
      </Badge>
    )},
    { header: 'Status', accessor: 'status', render: (row) => <span className="capitalize">{row.status.replace('_', ' ')}</span> },
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  // Convert complaintsByPriority object to array for chart
  const priorityChartData = Object.keys(stats.complaintsByPriority || {}).map(key => ({
    priority: key,
    count: stats.complaintsByPriority[key]
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Officer Command Center</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage complaints and monitor operational anomalies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Complaints" value={stats.activeComplaints} icon={FileWarning} />
        <StatCard title="Unresolved Anomalies" value={stats.unresolvedAnomalies?.length || 0} icon={AlertTriangle} />
        <StatCard title="Critical Issues" value={stats.complaintsByPriority?.critical || 0} icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Complaints</h3>
              <Badge variant="info">Action Required</Badge>
            </div>
            <DataTable 
              columns={complaintCols} 
              data={stats.recentComplaints || []} 
              keyField="_id"
              emptyMessage="No recent complaints."
            />
          </div>
        </div>

        <div className="space-y-6">
          <BarChartCard 
            title="Complaints by Priority" 
            data={priorityChartData}
            xAxisKey="priority"
            dataKey="count"
          />
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;
