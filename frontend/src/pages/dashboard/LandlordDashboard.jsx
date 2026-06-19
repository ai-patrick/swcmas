import React, { useEffect, useState } from 'react';
import { getLandlordStats } from '@/api/dashboard.api.js';
import { listInvoices, payInvoice } from '@/api/invoices.api.js';
import StatCard from '@/components/ui/StatCard.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { Building2, Truck, FileWarning, CheckCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const LandlordDashboard = () => {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, invoicesData] = await Promise.all([
        getLandlordStats(),
        listInvoices(1, 10)
      ]);
      setStats(statsData);
      setInvoices(invoicesData.invoices);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (invoiceId) => {
    setPaying(invoiceId);
    try {
      await payInvoice(invoiceId, 'mpesa');
      toast.success('Payment processing via M-Pesa...');
      // Re-fetch after mock delay
      setTimeout(() => {
        toast.success('Payment successful!');
        fetchData();
        setPaying(null);
      }, 1500);
    } catch (e) {
      toast.error('Payment failed');
      setPaying(null);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <EmptyState title="Error Loading Dashboard" message={error} icon={Building2} />;
  if (!stats) return null;

  const collectionCols = [
    { header: 'Property', accessor: 'apartment', render: (row) => row.apartment?.name },
    { header: 'Date', accessor: 'scheduledDate', render: (row) => new Date(row.scheduledDate).toLocaleDateString() },
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'completed' ? 'success' : 'default'}>
        {row.status.replace('_', ' ')}
      </Badge>
    )},
    { header: 'Verification', accessor: 'verificationStatus', render: (row) => (
      <Badge variant={row.verificationStatus === 'verified' ? 'success' : row.verificationStatus === 'pending' ? 'warning' : 'default'}>
        {row.verificationStatus || 'N/A'}
      </Badge>
    )},
  ];

  const complaintCols = [
    { header: 'Property', accessor: 'apartment', render: (row) => row.apartment?.name },
    { header: 'Type', accessor: 'type', render: (row) => <span className="capitalize">{row.type.replace('_', ' ')}</span> },
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'resolved' ? 'success' : 'warning'}>
        {row.status}
      </Badge>
    )},
  ];

  const invoiceCols = [
    { header: 'Property', accessor: 'apartment', render: (row) => row.apartment?.name },
    { header: 'Amount', accessor: 'amount', render: (row) => `KES ${row.amount.toLocaleString()}` },
    { header: 'Status', accessor: 'status', render: (row) => (
      <Badge variant={row.status === 'paid' ? 'success' : 'warning'}>
        {row.status.toUpperCase()}
      </Badge>
    )},
    { header: 'Action', accessor: 'actions', render: (row) => (
      row.status === 'pending' ? (
        <button
          onClick={() => handlePay(row._id)}
          disabled={paying === row._id}
          className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs font-medium"
        >
          {paying === row._id ? 'Processing...' : 'Pay via M-Pesa'}
        </button>
      ) : (
        <span className="text-xs text-gray-500 font-medium">Paid</span>
      )
    )}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Property Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor waste collection, compliance, and billing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Properties" value={stats.apartmentCount} icon={Building2} />
        <StatCard title="Total Collections" value={stats.collectionCount} icon={Truck} />
        <StatCard title="Pending Invoices" value={invoices.filter(i => i.status === 'pending').length} icon={CreditCard} />
        <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Collections</h3>
          </div>
          <DataTable 
            columns={collectionCols} 
            data={stats.recentCollections || []} 
            keyField="_id"
            emptyMessage="No recent collections found."
          />
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing & Invoices</h3>
          </div>
          <DataTable 
            columns={invoiceCols} 
            data={invoices} 
            keyField="_id"
            emptyMessage="No invoices found."
          />
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
