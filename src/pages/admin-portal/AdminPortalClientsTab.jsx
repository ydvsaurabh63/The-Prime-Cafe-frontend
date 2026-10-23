import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldAlert,
  X
} from 'lucide-react';
import {
  fetchClientsApi,
  createClientApi,
  updateClientApi,
  toggleClientStatusApi,
  deleteClientApi,
  getStoredClients
} from '../../services/superAdminData';

const AdminPortalClientsTab = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(getStoredClients());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    cafeName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: 'New Delhi',
    address: '',
    plan: 'Growth',
    tablesCount: 8,
    status: 'Active'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchClientsApi();
      if (data && Array.isArray(data)) {
        const clean = data.filter(
          (c) => !['Urban Chai Lounge', 'Roast & Toast Bistro', 'Mocha Express'].includes(c.cafeName)
        );
        setClients(clean);
      }
    } catch (e) {
      console.error('Error loading admin portal clients:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      cafeName: '',
      ownerName: '',
      email: '',
      phone: '',
      city: 'New Delhi',
      address: '',
      plan: 'Growth',
      tablesCount: 8,
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setCurrentClient(client);
    setFormData({
      cafeName: client.cafeName || '',
      ownerName: client.ownerName || '',
      email: client.email || '',
      phone: client.phone || '',
      city: client.city || '',
      address: client.address || '',
      plan: client.plan || 'Growth',
      tablesCount: client.tablesCount || 8,
      status: client.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (client) => {
    setCurrentClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleSaveNewClient = async (e) => {
    e.preventDefault();
    if (!formData.cafeName || !formData.ownerName || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    await createClientApi({
      ...formData,
      assignedAdminName: 'Amit Sharma (Delhi NCR)'
    });
    await loadData();
    setIsAddModalOpen(false);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!currentClient) return;

    await updateClientApi(currentClient._id, formData);
    await loadData();
    setIsEditModalOpen(false);
  };

  const handleDeleteClient = async () => {
    if (!currentClient) return;
    await deleteClientApi(currentClient._id);
    await loadData();
    setIsDeleteModalOpen(false);
  };

  const handleToggleStatus = async (id) => {
    await toggleClientStatusApi(id);
    await loadData();
  };

  // Filter
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.cafeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#2C1810] tracking-tight flex items-center gap-2">
            <Store className="text-[#C85A32]" />
            Manage Territory Clients
          </h1>
          <p className="text-xs md:text-sm text-[#7A685D] mt-0.5">
            Add new client cafes, view live performance, and assist cafe managers.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#C85A32] hover:bg-[#B24E2A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Add New Client Cafe</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cafe name or owner..."
            className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#7A685D]" />
          <span className="text-xs text-[#7A685D] font-medium">Status:</span>
          {['All', 'Active', 'Pending', 'Suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#4A2C18] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E6DCD3] text-[#7A685D] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Cafe Client</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Tables</th>
                <th className="py-3 px-4 text-right">Sales</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A685D]">
                    No client cafes found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-[#FAF7F2] transition">
                    <td className="py-3 px-4 font-extrabold text-[#2C1810]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#4A2C18] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {client.cafeName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div>{client.cafeName}</div>
                          <div className="text-[10px] text-[#7A685D] font-normal">{client.plan} Plan</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="font-bold text-[#2C1810]">{client.ownerName}</div>
                      <div className="text-[11px] text-[#7A685D] flex items-center gap-1">
                        <Mail size={11} className="text-[#C85A32]" />
                        <span>{client.email}</span>
                      </div>
                      <div className="text-[11px] text-[#7A685D] flex items-center gap-1">
                        <Phone size={11} />
                        <span>{client.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-[#2C1810] font-medium flex items-center gap-1">
                        <MapPin size={12} className="text-[#C85A32]" />
                        <span>{client.city}</span>
                      </div>
                      {client.address && (
                        <div className="text-[10px] text-[#7A685D] truncate max-w-[140px]">
                          {client.address}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-[#FAF7F2] px-2 py-0.5 rounded font-bold text-[#4A2C18] text-[11px]">
                        {client.tablesCount} Tables
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold text-[#2C1810]">
                      ₹{client.totalSales?.toLocaleString('en-IN') || '0'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(client._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          client.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : client.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {client.status === 'Active' && <CheckCircle2 size={11} />}
                        {client.status === 'Pending' && <Clock size={11} />}
                        {client.status === 'Suspended' && <XCircle size={11} />}
                        <span>{client.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate('/client/orders')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition"
                          title="Open Cafe Client Dashboard"
                        >
                          <span>Open Panel</span>
                          <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-1.5 text-[#4A2C18] hover:bg-[#F5EFEB] rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(client)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#C85A32]" /> Add Client Cafe
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewClient} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Cafe Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.cafeName}
                    onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Tables Count</label>
                  <input
                    type="number"
                    value={formData.tablesCount}
                    onChange={(e) => setFormData({ ...formData, tablesCount: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD3]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A685D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl"
                >
                  Save Cafe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <Edit2 size={18} className="text-[#C85A32]" /> Edit Client Cafe
              </h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Cafe Name</label>
                  <input
                    type="text"
                    required
                    value={formData.cafeName}
                    onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD3]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A685D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl"
                >
                  Update Cafe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <ShieldAlert size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#2C1810]">Delete Cafe Client?</h3>
            </div>
            <p className="text-xs text-[#7A685D]">
              Remove <strong>{currentClient?.cafeName}</strong> from active registry?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#7A685D]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortalClientsTab;
