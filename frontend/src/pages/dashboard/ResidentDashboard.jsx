import React, { useEffect, useState } from 'react';
import { getResidentStats } from '@/api/dashboard.api.js';
import StatCard from '@/components/ui/StatCard.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { FileWarning, CheckSquare, MessageSquare } from 'lucide-react';

const ResidentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getResidentStats();
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
  if (error) return <EmptyState title="Error Loading Dashboard" message={error} icon={MessageSquare} />;
  if (!stats) return null;

  const complaintCols = [
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'type', render: (row) => <span className="capitalize">{row.type.replace('_', ' ')}</span> },
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'resolved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'}>
        {row.status.replace('_', ' ')}
      </Badge>
    )},
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Resident Portal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your complaints and community feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Complaints" value={stats.complaintCount} icon={MessageSquare} />
        <StatCard title="Active Complaints" value={stats.activeComplaints} icon={FileWarning} />
        <StatCard title="Verifications Pending" value={0} icon={CheckSquare} />
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Complaints</h3>
        </div>
        <DataTable 
          columns={complaintCols} 
          data={stats.recentComplaints || []} 
          keyField="_id"
          emptyMessage="You have not filed any complaints recently."
        />
      </div>
    </div>
  );
};

export default ResidentDashboard;
