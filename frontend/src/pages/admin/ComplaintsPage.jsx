import React, { useEffect, useState, useRef } from 'react';
import { listComplaints, deleteComplaint, updateComplaint, createComplaint } from '@/api/complaints.api.js';
import { listApartments } from '@/api/apartments.api.js';
import { listUsers } from '@/api/users.api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { FileWarning, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ complaints: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]); // officers
  const editSelectedId = useRef(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    resolution: '',
  });

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    type: '',
    resident: '',
    apartment: '',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  if (!user || user.role !== 'county_admin') {
    return <EmptyState title="Access Denied" message="You do not have permission to view this page." icon={FileWarning} />;
  }

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      const result = await listComplaints(page);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Load officers for assign dropdown
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const result = await listUsers(1, 200);
        setUsers(result.users.filter((u) => u.role === 'county_officer'));
      } catch (e) {
        // ignore
      }
    };
    fetchOfficers();
  }, []);

  // Load residents and apartments for create dropdowns
  useEffect(() => {
    const fetchCreateData = async () => {
      try {
        const [usersRes, aptsRes] = await Promise.all([
          listUsers(1, 200),
          listApartments(1, 200)
        ]);
        setResidents(usersRes.users.filter(u => u.role === 'resident'));
        setApartments(aptsRes.apartments);
      } catch (e) {
        // ignore
      }
    };
    fetchCreateData();
  }, []);

  const handleDeleteClick = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!complaintToDelete) return;
    try {
      await deleteComplaint(complaintToDelete._id);
      toast.success('Complaint deleted successfully');
      fetchComplaints(data.page);
    } catch (e) {
      toast.error('Failed to delete complaint');
    }
  };

  const openEditModal = (complaint) => {
    setEditFormData({
      status: complaint.status || '',
      priority: complaint.priority || '',
      assignedTo: complaint.assignedTo?._id || '',
      resolution: complaint.resolution || '',
    });
    editSelectedId.current = complaint._id;
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        status: editFormData.status,
        priority: editFormData.priority,
        assignedTo: editFormData.assignedTo || undefined,
        resolution: editFormData.resolution,
      };
      if (editSelectedId.current) {
        await updateComplaint(editSelectedId.current, payload);
        toast.success('Complaint updated successfully');
      }
      setShowEditModal(false);
      fetchComplaints(data.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: createFormData.title,
        description: createFormData.description,
        type: createFormData.type,
        resident: createFormData.resident,
        apartment: createFormData.apartment || undefined,
      };
      await createComplaint(payload);
      toast.success('Complaint created successfully');
      setShowCreateModal(false);
      setCreateFormData({ title: '', description: '', type: '', resident: '', apartment: '' });
      fetchComplaints(data.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'default'
  };

  const statusColors = {
    pending: 'warning',
    in_progress: 'info',
    resolved: 'success',
    rejected: 'danger'
  };

  const columns = [
    { 
      header: 'Complaint', 
      accessor: 'title',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 capitalize">{row.type.replace('_', ' ')}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Resident', 
      accessor: 'resident',
      render: (row) => row.resident ? `${row.resident.firstName} ${row.resident.lastName}` : 'Unknown'
    },
    { 
      header: 'Priority', 
      accessor: 'priority',
      render: (row) => (
        <Badge variant={priorityColors[row.priority] || 'default'} className="capitalize">
          {row.priority}
        </Badge>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <Badge variant={statusColors[row.status] || 'default'} className="capitalize">
          {row.status.replace('_', ' ')}
        </Badge>
      )
    },
    { 
      header: 'AI Score', 
      accessor: 'aiConfidenceScore',
      render: (row) => (
        row.aiAnalysis?.confidenceScore ? (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${row.aiAnalysis.confidenceScore >= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {Math.round(row.aiAnalysis.confidenceScore * 100)}%
            </span>
          </div>
        ) : <span className="text-gray-400 text-sm">N/A</span>
      )
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(row); }}
            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Edit/Triage Complaint"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Complaint"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Complaints & Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and triage citizen feedback</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Complaint
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading && !data.complaints.length ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState title="Error Loading Complaints" message={error} icon={FileWarning} />
        ) : (
          <DataTable 
            columns={columns} 
            data={data.complaints} 
            keyField="_id"
            emptyMessage="No complaints recorded."
          />
        )}
      </div>

      {complaintToDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setComplaintToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Complaint"
          message="Are you sure you want to delete this complaint? This action cannot be undone."
          confirmText="Delete Complaint"
          isDestructive={true}
        />
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Triage & Update Complaint"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select name="status" value={editFormData.status} onChange={handleEditChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select name="priority" value={editFormData.priority} onChange={handleEditChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to Officer</label>
            <select name="assignedTo" value={editFormData.assignedTo} onChange={handleEditChange} className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Notes</label>
            <textarea name="resolution" value={editFormData.resolution} onChange={handleEditChange} rows={3} className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Provide resolution details..."></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-6">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-70">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="File New Complaint"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" name="title" value={createFormData.title} onChange={handleCreateChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Brief summary of issue" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea name="description" value={createFormData.description} onChange={handleCreateChange} rows={3} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Detailed explanation..."></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select name="type" value={createFormData.type} onChange={handleCreateChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option value="">Select type</option>
                <option value="missed_collection">Missed Collection</option>
                <option value="illegal_dumping">Illegal Dumping</option>
                <option value="overflowing_bins">Overflowing Bins</option>
                <option value="bad_odor">Bad Odor</option>
                <option value="burning_waste">Burning Waste</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resident</label>
              <select name="resident" value={createFormData.resident} onChange={handleCreateChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                <option value="">Select resident</option>
                {residents.map((r) => (
                  <option key={r._id} value={r._id}>{r.firstName} {r.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Related Property (Optional)</label>
            <select name="apartment" value={createFormData.apartment} onChange={handleCreateChange} className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="">None</option>
              {apartments.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-6">
            <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-70">
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'File Complaint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
