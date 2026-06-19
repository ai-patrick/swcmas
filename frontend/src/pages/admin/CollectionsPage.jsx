import React, { useEffect, useState, useRef } from 'react';
import { listCollections, deleteCollection, createCollection, updateCollection } from '@/api/collections.api.js';
import { listUsers } from '@/api/users.api.js';
import { listApartments } from '@/api/apartments.api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { Truck, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CollectionsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ collections: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  
  const selectedId = useRef(null);
  const [formData, setFormData] = useState({
    apartment: '',
    wasteCollector: '',
    scheduledDate: '',
    notes: '',
  });

  if (!user || user.role !== 'county_admin') {
    return <EmptyState title="Access Denied" message="You do not have permission to view this page." icon={Truck} />;
  }

  const fetchCollections = async (page = 1) => {
    try {
      setLoading(true);
      const result = await listCollections(page);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, aptsRes] = await Promise.all([
          listUsers(1, 200),
          listApartments(1, 200),
        ]);
        setUsers(usersRes.users);
        setApartments(aptsRes.apartments);
      } catch (e) {
        // ignore errors
      }
    };
    fetchData();
  }, []);

  const handleDeleteClick = (col) => {
    setCollectionToDelete(col);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection(collectionToDelete._id);
      toast.success('Collection deleted successfully');
      fetchCollections(data.page);
    } catch (e) {
      toast.error('Failed to delete collection');
    }
  };

  const openCreateModal = () => {
    setIsEdit(false);
    selectedId.current = null;
    setFormData({
      apartment: '',
      wasteCollector: '',
      scheduledDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (col) => {
    setIsEdit(true);
    selectedId.current = col._id;
    setFormData({
      apartment: col.apartment?._id || '',
      wasteCollector: col.wasteCollector?._id || '',
      scheduledDate: col.scheduledDate ? new Date(col.scheduledDate).toISOString().slice(0, 16) : '',
      notes: col.notes || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        apartment: formData.apartment,
        wasteCollector: formData.wasteCollector,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : '',
        notes: formData.notes,
      };
      
      if (isEdit) {
        await updateCollection(selectedId.current, payload);
        toast.success('Collection updated successfully');
      } else {
        await createCollection(payload);
        toast.success('Collection scheduled successfully');
      }
      
      setShowModal(false);
      fetchCollections(data.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors = {
    scheduled: 'info',
    in_progress: 'warning',
    completed: 'success',
    verified: 'success',
    disputed: 'danger'
  };

  const columns = [
    { 
      header: 'Property', 
      accessor: 'apartment',
      render: (row) => <span className="font-medium text-gray-900 dark:text-white">{row.apartment?.name}</span>
    },
    { 
      header: 'Collector', 
      accessor: 'collector',
      render: (row) => row.wasteCollector ? `${row.wasteCollector.firstName} ${row.wasteCollector.lastName}` : 'Unassigned'
    },
    { 
      header: 'Scheduled Time', 
      accessor: 'scheduledDate',
      render: (row) => (
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(row.scheduledDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </div>
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
      header: 'Verification', 
      accessor: 'verificationStatus',
      render: (row) => (
        <Badge variant={row.verificationStatus === 'verified' ? 'success' : row.verificationStatus === 'suspicious' ? 'danger' : 'default'} className="capitalize">
          {row.verificationStatus ? row.verificationStatus.replace('_', ' ') : 'N/A'}
        </Badge>
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
            title="Edit Collection"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Collection"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Collections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage scheduled waste collections</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Collection
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading && !data.collections.length ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState title="Error Loading Collections" message={error} icon={Truck} />
        ) : (
          <DataTable 
            columns={columns} 
            data={data.collections} 
            keyField="_id"
            emptyMessage="No collections scheduled."
          />
        )}
      </div>

      {collectionToDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCollectionToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Collection"
          message={`Are you sure you want to delete this collection schedule for ${collectionToDelete.apartment?.name}?`}
          confirmText="Delete Collection"
          isDestructive={true}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Collection Schedule' : 'Schedule New Collection'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property</label>
            <select name="apartment" value={formData.apartment} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="">Select property</option>
              {apartments.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waste Collector</label>
            <select name="wasteCollector" value={formData.wasteCollector} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
              <option value="">Select collector</option>
              {users.filter((u) => u.role === 'waste_collector').map((u) => (
                <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date & Time</label>
            <input type="datetime-local" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="Any special instructions..."></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700 mt-6">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-70">
              {isSubmitting ? <LoadingSpinner size="sm" /> : isEdit ? 'Save Changes' : 'Schedule Collection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CollectionsPage;
