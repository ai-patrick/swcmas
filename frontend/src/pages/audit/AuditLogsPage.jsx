import React, { useState, useEffect } from 'react';
import { listAuditLogs } from '@/api/audit.api.js';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { Shield, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterEntity, setFilterEntity] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs(page, 15, filterEntity);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterEntity]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">
            {new Date(row.createdAt).toLocaleDateString()}
          </div>
          <div className="text-gray-500">
            {new Date(row.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs uppercase">
            {row.user?.firstName?.[0]}{row.user?.lastName?.[0]}
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {row.user?.firstName} {row.user?.lastName}
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        const actionColors = {
          CREATE: 'success',
          UPDATE: 'info',
          DELETE: 'error',
          LOGIN: 'warning',
        };
        return <Badge variant={actionColors[row.action] || 'default'}>{row.action}</Badge>;
      },
    },
    {
      header: 'Entity',
      accessor: 'entity',
      render: (row) => <span className="text-sm text-gray-600 dark:text-gray-400 font-medium capitalize">{row.entity}</span>,
    },
    {
      header: 'Details',
      accessor: 'details',
      render: (row) => (
        <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
          {row.entityId ? `ID: ${row.entityId.slice(-6)}` : 'N/A'}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-500" />
            System Audit Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and monitor all administrative and system events for compliance.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/20 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by entity (e.g. user, collection)..."
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No Audit Logs Found"
            message="There are no system events matching your criteria."
          />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            keyField="_id"
            pagination={{
              page,
              limit: 15,
              total,
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
