import React, { useEffect, useState, useRef } from 'react';
import { listApartments, deleteApartment, createApartment, updateApartment } from '@/api/apartments.api.js';
import { listUsers } from '@/api/users.api.js';
import { useAuth } from '@/context/AuthContext.jsx';
import DataTable from '@/components/ui/DataTable.jsx';
import Badge from '@/components/ui/Badge.jsx';
import LoadingSpinner from '@/components/ui/LoadingSpinner.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import ConfirmDialog from '@/components/ui/ConfirmDialog.jsx';
import Modal from '@/components/ui/Modal.jsx';
import { Building2, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ApartmentsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ apartments: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState(null);
  
  const selectedId = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    county: '',
    unitCount: 1,
    location: { lat: '', lng: '' },
    landlord: '',
    wasteCollector: '',
    collectionSchedule: { frequency: 'daily', time: '' },
  });

  if (!user || user.role !== 'county_admin') {
    return <EmptyState title="Access Denied" message="You do not have permission to view this page." icon={Building2} />;
  }

  const fetchApartments = async (page = 1) => {
    try {
      setLoading(true);
      const result = await listApartments(page);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load apartments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await listUsers(1, 200);
        setUsers(result.users);
      } catch (e) {
        // ignore errors
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteClick = (apt) => {
    setApartmentToDelete(apt);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!apartmentToDelete) return;
    try {
      await deleteApartment(apartmentToDelete._id);
      toast.success('Property deleted successfully');
      fetchApartments(data.page);
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setFormData({
      name: '',
      address: '',
      city: '',
      county: '',
      unitCount: 1,
      location: { lat: '', lng: '' },
      landlord: '',
      wasteCollector: '',
      collectionSchedule: { frequency: 'daily', time: '' },
    });
    setShowModal(true);
  };

  const openEditModal = (apt) => {
    setIsEdit(true);
    selectedId.current = apt._id;
    setFormData({
      name: apt.name || '',
      address: apt.address || '',
      city: apt.city || '',
      county: apt.county || '',
      unitCount: apt.unitCount || 1,
      location: {
        lat: apt.location?.coordinates?.[1] ?? '',
        lng: apt.location?.coordinates?.[0] ?? '',
      },
      landlord: apt.landlord?._id || '',
      wasteCollector: apt.wasteCollector?._id || '',
      collectionSchedule: {
        frequency: apt.collectionSchedule?.frequency || 'daily',
        time: apt.collectionSchedule?.time || '',
      },
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        county: formData.county,
        unitCount: Number(formData.unitCount),
        location: {
          type: 'Point',
          coordinates: [Number(formData.location.lng), Number(formData.location.lat)],
        },
        landlord: formData.landlord,
        wasteCollector: formData.wasteCollector || undefined,
        collectionSchedule: {
          frequency: formData.collectionSchedule.frequency,
          time: formData.collectionSchedule.time,
        },
      };
      if (isEdit) {
        await updateApartment(selectedId.current, payload);
        toast.success('Property updated successfully');
      } else {
        await createApartment(payload);
        toast.success('Property created successfully');
      }
      setShowModal(false);
      fetchApartments(data.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save property');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Property Details', 
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {row.address}, {row.city}
          </div>
        </div>
      )
    },
    { 
      header: 'Units', 
      accessor: 'unitCount',
      render: (row) => <Badge variant="info">{row.unitCount} Units</Badge>
    },
    { 
      header: 'Landlord', 
      accessor: 'landlord',
      render: (row) => row.landlord ? `${row.landlord.firstName} ${row.landlord.lastName}` : 'Unassigned'
    },
    { 
      header: 'Collector', 
      accessor: 'wasteCollector',
      render: (row) => row.wasteCollector ? `${row.wasteCollector.firstName} ${row.wasteCollector.lastName}` : 'Unassigned'
    },
    { 
      header: 'Schedule', 
      accessor: 'schedule',
      render: (row) => (
        <span className="capitalize text-gray-600 dark:text-gray-400">
          {row.collectionSchedule?.frequency.replace('_', ' ')} @ {row.collectionSchedule?.time}
        </span>
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
            title="Edit Property"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Property"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage apartments and collection schedules</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading && !data.apartments.length ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : error ? (
          <EmptyState title="Error Loading Properties" message={error} icon={Building2} />
        ) : (
          <DataTable 
            columns={columns} 
            data={data.apartments} 
            keyField="_id"
            emptyMessage="No properties found."
          />
        )}
      </div>

      {apartmentToDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setApartmentToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Property"
          message={`Are you sure you want to delete ${apartmentToDelete.name}? This will also delete related collections.`}
          confirmText="Delete Property"
          isDestructive={true}
        />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? 'Edit Property' : 'Add New Property'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" placeholder="e.g. Sunset Apartments" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">County</label>
                <input type="text" name="county" value={formData.county} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Count</label>
                <input type="number" name="unitCount" value={formData.unitCount} onChange={handleChange} min="1" required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                <input type="number" step="any" name="lat" value={formData.location.lat} onChange={handleNestedChange('location', 'lat')} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                <input type="number" step="any" name="lng" value={formData.location.lng} onChange={handleNestedChange('location', 'lng')} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Assignments</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Landlord</label>
                  <select name="landlord" value={formData.landlord} onChange={handleChange} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    <option value="">Select landlord</option>
                    {users.filter(u => u.role === 'landlord').map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Waste Collector</label>
                  <select name="wasteCollector" value={formData.wasteCollector} onChange={handleChange} className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    <option value="">Select collector (optional)</option>
                    {users.filter(u => u.role === 'waste_collector').map(u => (
                      <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Collection Schedule</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                  <select name="frequency" value={formData.collectionSchedule.frequency} onChange={handleNestedChange('collectionSchedule', 'frequency')} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none">
                    <option value="daily">Daily</option>
                    <option value="every_other_day">Every Other Day</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input type="time" name="time" value={formData.collectionSchedule.time} onChange={handleNestedChange('collectionSchedule', 'time')} required className="w-full border border-gray-300 dark:border-slate-700 rounded-xl px-4 py-2 dark:bg-slate-800/50 focus:ring-2 focus:ring-brand-500 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl border border-gray-300 dark:border-slate-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-70">
              {isSubmitting ? <LoadingSpinner size="sm" /> : isEdit ? 'Save Changes' : 'Create Property'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApartmentsPage;
