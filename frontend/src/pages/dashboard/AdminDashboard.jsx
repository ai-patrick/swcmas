import React, { useEffect, useState } from 'react';
import { getAdminStats } from '@/api/dashboard.api.js';
import StatCard from '@/components/ui/StatCard.jsx';
import LineChartCard from '@/components/ui/LineChartCard.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import TrustScoreGauge from '@/components/ui/TrustScoreGauge.jsx';
import { Users, Building2, Truck, FileWarning, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
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

  const anomalyCols = [
    { header: 'Type', accessor: 'type', render: (row) => <span className="capitalize">{row.type.replace('_', ' ')}</span> },
    { header: 'Entity', accessor: 'entity', render: (row) => row.apartment ? row.apartment.name : 'Unknown' },
    { header: 'Severity', accessor: 'severity', render: (row) => (
      <Badge variant={row.severity === 'high' || row.severity === 'critical' ? 'danger' : row.severity === 'medium' ? 'warning' : 'info'}>
        {row.severity}
      </Badge>
    )},
    { header: 'Date', accessor: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">County-wide waste management performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.userCount} icon={Users} />
        <StatCard title="Registered Properties" value={stats.apartmentCount} icon={Building2} />
        <StatCard title="Total Collections" value={stats.collectionCount} icon={Truck} />
        <StatCard title="Total Complaints" value={stats.complaintCount} icon={FileWarning} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LineChartCard 
            title="30-Day Activity Trends" 
            data={stats.collectionTrend?.map((ct, i) => ({
              date: new Date(ct.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
              collections: ct.count,
              complaints: stats.complaintTrend?.[i]?.count || 0
            })) || []}
            xAxisKey="date"
            lines={[
              { dataKey: 'collections', stroke: '#10b981' },
              { dataKey: 'complaints', stroke: '#ef4444' }
            ]}
          />
          
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Anomalies</h3>
              <Badge variant="warning">{stats.recentAnomalies?.length || 0} alerts</Badge>
            </div>
            <DataTable 
              columns={anomalyCols} 
              data={stats.recentAnomalies || []} 
              keyField="_id"
              emptyMessage="No active anomalies detected."
            />
          </div>
        </div>

        <div className="space-y-6">
          <TrustScoreGauge score={stats.complianceRate} title="Overall Compliance Rate" />
          <TrustScoreGauge score={stats.resolutionRate} title="Complaint Resolution Rate" />
          
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
                <span className="text-sm text-gray-500">Verified Collections</span>
                <span className="font-semibold text-emerald-600">{stats.verifiedCollections}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
                <span className="text-sm text-gray-500">Completed Collections</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.completedCollections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
