import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { useAuth } from '@/context/AuthContext.jsx';
import { listReports, getReport, generateReport } from '@/api/reports.api.js';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import Badge from '@/components/ui/Badge.jsx';
import { FileText, Sparkles, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// ─── Report Generate Form ────────────────────────────────────────────────────
const ReportGenerateForm = ({ onGenerated }) => {
  const [type, setType] = useState('daily');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const setPresetRange = (t) => {
    const now = new Date();
    let start, end;
    end = new Date(now);
    if (t === 'daily') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (t === 'weekly') {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
    } else {
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
    }
    setType(t);
    setPeriodStart(start.toISOString().slice(0, 10));
    setPeriodEnd(end.toISOString().slice(0, 10));
  };

  useEffect(() => { setPresetRange('daily'); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await generateReport({
        type,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
      });
      toast.success('Report generated successfully!');
      onGenerated();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-brand-500" />
        Generate New AI Report
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
          <select
            value={type}
            onChange={(e) => setPresetRange(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start</label>
          <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required
            className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End</label>
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required
            className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm" />
        </div>
        <div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-70 text-sm font-medium shadow-sm"
          >
            {loading ? <LoadingSpinner size="sm" /> : <><RefreshCw className="w-4 h-4" /> Generate Report</>}
          </button>
        </div>
      </div>
    </form>
  );
};

// ─── Report List Item ────────────────────────────────────────────────────────
const ReportListItem = ({ report, onClick, isSelected }) => {
  const typeColors = { daily: 'success', weekly: 'info', monthly: 'warning' };
  return (
    <div
      onClick={() => onClick(report._id)}
      className={`p-4 rounded-xl cursor-pointer border transition-all ${
        isSelected
          ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-400 dark:border-brand-500 shadow-sm'
          : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <Badge variant={typeColors[report.type] || 'default'} className="capitalize text-xs">{report.type}</Badge>
        <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
        {new Date(report.period?.start).toLocaleDateString()} — {new Date(report.period?.end).toLocaleDateString()}
      </p>
      <p className="text-xs text-gray-400 mt-1">By {report.generatedBy?.firstName} {report.generatedBy?.lastName}</p>
      {report.aiSummary && (
        <div className="flex items-center gap-1 mt-2">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">AI Summary Available</span>
        </div>
      )}
    </div>
  );
};

// ─── Chart Card ──────────────────────────────────────────────────────────────
const ChartCard = ({ title, children }) => (
  <div className="glass-panel rounded-xl p-5">
    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{title}</h4>
    {children}
  </div>
);

// ─── Rate Stat ───────────────────────────────────────────────────────────────
const RateStat = ({ label, value, color }) => (
  <div className="glass-panel rounded-xl p-5 text-center">
    <p className={`text-4xl font-extrabold ${color}`}>{value}%</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</p>
    <div className="mt-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full bg-current ${color}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

// ─── Report Detail ───────────────────────────────────────────────────────────
const ReportDetail = ({ report, loading }) => {
  const [rawOpen, setRawOpen] = useState(false);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!report) return (
    <div className="h-64 glass-panel rounded-2xl flex items-center justify-center">
      <EmptyState title="Select a Report" message="Click any report from the list to view its details." icon={FileText} />
    </div>
  );

  const d = report.data || {};
  const collectionData = [
    { name: 'Scheduled', value: d.totalCollections || 0 },
    { name: 'Completed', value: d.completedCollections || 0 },
    { name: 'Verified', value: d.verifiedCollections || 0 },
    { name: 'Disputed', value: d.disputedCollections || 0 },
  ];
  const complaintBreakdownData = Object.entries(d.complaintBreakdown || {}).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
  const collectorPerformanceData = (d.collectorPerformance || []).map((c) => ({
    name: c.name?.split(' ')[0] || 'N/A',
    Collections: c.totalCollections || 0,
    Verified: c.verified || 0,
    Score: Math.round(c.averageScore || 0),
  }));
  const radarData = [
    { metric: 'Collections', value: d.totalCollections || 0 },
    { metric: 'Completed', value: d.completedCollections || 0 },
    { metric: 'Verified', value: d.verifiedCollections || 0 },
    { metric: 'Complaints', value: d.totalComplaints || 0 },
    { metric: 'Resolved', value: d.resolvedComplaints || 0 },
  ];
  const completionRate = d.totalCollections ? Math.round((d.completedCollections / d.totalCollections) * 100) : 0;
  const verificationRate = d.totalCollections ? Math.round((d.verifiedCollections / d.totalCollections) * 100) : 0;
  const resolutionRate = d.totalComplaints ? Math.round((d.resolvedComplaints / d.totalComplaints) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white capitalize">{report.type} Report</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date(report.period?.start).toLocaleDateString()} — {new Date(report.period?.end).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Generated by {report.generatedBy?.firstName} {report.generatedBy?.lastName} · {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={report.type === 'monthly' ? 'warning' : report.type === 'weekly' ? 'info' : 'success'} className="capitalize text-sm px-3 py-1">{report.type}</Badge>
        </div>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-3 gap-4">
        <RateStat label="Completion Rate" value={completionRate} color="text-brand-600 dark:text-brand-400" />
        <RateStat label="Verification Rate" value={verificationRate} color="text-blue-600 dark:text-blue-400" />
        <RateStat label="Complaint Resolution" value={resolutionRate} color="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Collection Breakdown">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={collectionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaint Types">
          {complaintBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={complaintBreakdownData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {complaintBreakdownData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No complaint data</div>
          )}
        </ChartCard>
      </div>

      {collectorPerformanceData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Collector Performance">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={collectorPerformanceData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="Collections" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Verified" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Operations Radar">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(150,150,150,0.2)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fontSize: 10 }} />
                <Radar name="Metrics" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* High-Risk Areas */}
      {(d.highRiskAreas || []).length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">High-Risk Areas</h4>
          <div className="space-y-3">
            {d.highRiskAreas.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.complaintCount} complaints</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${a.riskScore >= 70 ? 'bg-red-500' : a.riskScore >= 40 ? 'bg-amber-500' : 'bg-brand-500'}`}
                      style={{ width: `${a.riskScore}%` }}
                    />
                  </div>
                  <Badge variant={a.riskScore >= 70 ? 'danger' : a.riskScore >= 40 ? 'warning' : 'success'} className="text-xs">
                    {a.riskScore >= 70 ? 'Critical' : a.riskScore >= 40 ? 'Elevated' : 'Low'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {report.aiSummary && (
        <div className="glass-panel rounded-xl p-5 border border-brand-200 dark:border-brand-500/30 bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-500/5 dark:to-emerald-500/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-brand-500 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI-Generated Summary</h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.aiSummary}</p>
        </div>
      )}

      {/* Recommendations */}
      {(report.recommendations || []).length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recommendations</h4>
          <ul className="space-y-3">
            {report.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Data Toggle */}
      <div className="glass-panel rounded-xl p-4">
        <button onClick={() => setRawOpen(!rawOpen)} className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">
          {rawOpen ? 'Hide' : 'View'} Raw Report Data
        </button>
        {rawOpen && (
          <pre className="mt-3 text-xs bg-gray-50 dark:bg-slate-900 p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  if (!user || (user.role !== 'county_admin' && user.role !== 'county_officer')) {
    return <EmptyState title="Access Denied" message="You do not have permission to view this page." icon={ShieldAlert} />;
  }

  const fetchReports = useCallback(async (p = 1, t = '') => {
    setLoadingList(true);
    setError(null);
    try {
      const params = { page: p, limit: 10 };
      if (t) params.type = t;
      const result = await listReports(params);
      setReports(result.reports || []);
      setTotal(result.total || 0);
      setPage(result.page || p);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(1, typeFilter);
  }, [fetchReports, typeFilter]);

  const handleSelectReport = async (id) => {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const report = await getReport(id);
      setSelectedReport(report);
    } catch {
      setSelectedReport(null);
      toast.error('Failed to load report details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-500" />
          AI-Driven Reports
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Generate and review AI-powered analytical reports with operational insights.
        </p>
      </div>

      <ReportGenerateForm onGenerated={() => fetchReports(1, typeFilter)} />

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Reports List */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className="text-xs text-gray-400 ml-auto">{total} reports</span>
          </div>

          {loadingList ? (
            <div className="py-8 flex justify-center"><LoadingSpinner /></div>
          ) : reports.length === 0 ? (
            <div className="glass-panel rounded-2xl py-8 px-4 text-center text-sm text-gray-400">
              No reports found. Generate one above.
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                {reports.map((r) => (
                  <ReportListItem key={r._id} report={r} onClick={handleSelectReport} isSelected={selectedId === r._id} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button onClick={() => fetchReports(page - 1, typeFilter)} disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button onClick={() => fetchReports(page + 1, typeFilter)} disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Report Detail */}
        <div className="lg:col-span-2">
          <ReportDetail report={selectedReport} loading={loadingDetail} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
