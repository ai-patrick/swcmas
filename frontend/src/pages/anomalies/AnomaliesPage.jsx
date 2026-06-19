import React, { useEffect, useState, useRef } from 'react';
import { listAnomalies, resolveAnomaly } from '@/api/anomalies.api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { ShieldAlert, CheckCircle2, Clock, AlertTriangle, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';

const AnomaliesPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ alerts: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showResolveModal, setShowResolveModal] = useState(false);
  const resolveId = useRef(null);
  const [resolutionText, setResolutionText] = useState('');

  if (!user || (user.role !== 'county_admin' && user.role !== 'county_officer')) {
    return <EmptyState title="Access Denied" message="You do not have permission to view this page." icon={ShieldAlert} />;
  }

  const fetchAnomalies = async (page = 1) => {
    try {
      setLoading(true);
      const result = await listAnomalies(page);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const openResolveModal = (alert) => {
    resolveId.current = alert._id;
    setResolutionText('');
    setShowResolveModal(true);
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resolveAnomaly(resolveId.current, resolutionText);
      toast.success('Anomaly resolved successfully');
      setShowResolveModal(false);
      fetchAnomalies(data.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resolve anomaly');
    } finally {
      setIsSubmitting(false);
    }
  };

  const severityColors = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  const typeIcons = {
    missed_collection: <Clock className="w-4 h-4 text-orange-500" />,
    verification_fraud: <ShieldAlert className="w-4 h-4 text-red-500" />,
    pattern_anomaly: <Cpu className="w-4 h-4 text-blue-500" />,
    trust_score_drop: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  };

  const columns = [
    {
      header: 'Anomaly',
      accessor: 'type',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
            {typeIcons[row.type] || <ShieldAlert className="w-4 h-4 text-gray-500" />}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white capitalize">
              {row.type.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {row.description || 'No description provided'}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => (
        <Badge variant={severityColors[row.severity] || 'default'} className="capitalize">
          {row.severity}
        </Badge>
      )
    },
    {
      header: 'AI Confidence',
      accessor: 'confidenceScore',
      render: (row) => row.confidenceScore != null ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 w-20">
            <div
              className="h-1.5 rounded-full bg-brand-500"
              style={{ width: `${Math.round(row.confidenceScore * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {Math.round(row.confidenceScore * 100)}%
          </span>
        </div>
      ) : <span className="text-gray-400 text-sm">N/A</span>
    },
    {
      header: 'Status',
      accessor: 'isResolved',
      render: (row) => (
        <Badge variant={row.isResolved ? 'success' : 'warning'}>
          {row.isResolved ? 'Resolved' : 'Active'}
        </Badge>
      )
    },
    {
      header: 'Detected',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => !row.isResolved ? (
        <button
          onClick={(e) => { e.stopPropagation(); openResolveModal(row); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-lg transition-colors text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4" />
          Resolve
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Resolved</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Anomaly Alerts
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          AI-detected anomalies that require review and resolution
        </p>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        {loading && !data.alerts.length ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState title="Error Loading Anomalies" message={error} icon={ShieldAlert} />
        ) : (
          <DataTable
            columns={columns}
            data={data.alerts}
            keyField="_id"
            emptyMessage="No active anomalies detected."
          />
        )}
      </div>

      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Anomaly"
      >
        <form onSubmit={handleResolve} className="space-y-5">
          <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
            <p className="font-medium mb-1">Before resolving:</p>
            <p>Ensure you have investigated this anomaly and taken appropriate action. Provide a clear resolution note for the audit trail.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              rows={4}
              required
              className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Describe the steps taken to address this anomaly..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-6">
            <button
              type="button"
              onClick={() => setShowResolveModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : (
                <><CheckCircle2 className="w-4 h-4" /> Mark as Resolved</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnomaliesPage;
