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
  X,
  CreditCard,
  Layers,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  fetchClientsApi,
  createClientApi,
  updateClientApi,
  toggleClientStatusApi,
  deleteClientApi,
  fetchAdminsApi,
  getStoredClients,
  getStoredAdmins
} from '../../services/superAdminData';

const SuperAdminClientsTab = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(getStoredClients());
  const [admins, setAdmins] = useState(getStoredAdmins());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    cafeName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: 'New Delhi',
    address: '',
    assignedAdminName: 'Amit Sharma (Delhi NCR)',
    plan: 'Growth',
    tablesCount: 10,
    status: 'Active',
    password: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsData, adminsData] = await Promise.all([
        fetchClientsApi(),
        fetchAdminsApi()
      ]);
      if (clientsData && Array.isArray(clientsData)) {
        const clean = clientsData.filter(
          (c) => !['Urban Chai Lounge', 'Roast & Toast Bistro', 'Mocha Express'].includes(c.cafeName)
        );
        setClients(clean);
      }
      if (adminsData && Array.isArray(adminsData)) {
        setAdmins(adminsData);
      }
    } catch (e) {
      console.error('Error loading clients/admins:', e);
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
      assignedAdminName: admins[0]?.name ? `${admins[0].name} (${admins[0].region})` : 'Superadmin HQ',
      plan: 'Growth',
      tablesCount: 10,
      status: 'Active',
      password: 'Admin@123'
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
      assignedAdminName: client.assignedAdminName || 'Superadmin HQ',
      plan: client.plan || 'Growth',
      tablesCount: client.tablesCount || 10,
      status: client.status || 'Active',
      password: client.password || client.plainPassword || 'Admin@123'
    });
    setShowEditPassword(true);
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

    await createClientApi(formData);
    await loadData();
    setIsAddModalOpen(false);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!currentClient) return;

    try {
      const res = await updateClientApi(currentClient._id, formData);
      if (res && res.success === false) {
        alert(res.message || 'Failed to update client');
        return;
      }
      await loadData();
      setIsEditModalOpen(false);
      alert('Client cafe details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating client cafe');
    }
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

  // Filter logic
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.cafeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);

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
            Manage Franchise Clients (Cafes)
          </h1>
          <p className="text-xs md:text-sm text-[#7A685D] mt-0.5">
            Onboard new cafes, assign territory managers, monitor subscription plans and sales.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#C85A32] hover:bg-[#B24E2A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Onboard New Cafe Client</span>
        </button>
      </div>

      {/* Stats summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E6DCD3] p-3.5 rounded-xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-[#7A685D]">Total Clients</div>
          <div className="text-xl font-black text-[#2C1810]">{clients.length}</div>
        </div>
        <div className="bg-white border border-[#E6DCD3] p-3.5 rounded-xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-emerald-700">Active Cafes</div>
          <div className="text-xl font-black text-emerald-700">
            {clients.filter(c => c.status === 'Active').length}
          </div>
        </div>
        <div className="bg-white border border-[#E6DCD3] p-3.5 rounded-xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-amber-700">Pending Review</div>
          <div className="text-xl font-black text-amber-700">
            {clients.filter(c => c.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white border border-[#E6DCD3] p-3.5 rounded-xl shadow-xs">
          <div className="text-[10px] uppercase font-bold text-purple-700">Total Tables</div>
          <div className="text-xl font-black text-purple-700">
            {clients.reduce((acc, c) => acc + (c.tablesCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A685D]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cafe name, owner, city..."
            className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#7A685D] font-medium">Status:</span>
            {['All', 'Active', 'Pending'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#7A685D] hover:bg-[#F5EFEB]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
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
                <th className="py-3 px-4">Assigned Admin</th>
                <th className="py-3 px-4 text-right">Total Sales</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A685D]">
                    No client cafes found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client._id} className="hover:bg-[#FAF7F2] transition">
                    {/* Cafe */}
                    <td className="py-3 px-4 font-extrabold text-[#2C1810]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#4A2C18] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {client.cafeName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div>{client.cafeName}</div>
                          <div className="text-[10px] text-[#7A685D] font-normal">
                            ID: {client._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner */}
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

                    {/* Location */}
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

                    {/* Admin */}
                    <td className="py-3 px-4">
                      <span className="bg-[#F5EFEB] px-2 py-0.5 rounded text-[11px] font-medium text-[#4A2C18]">
                        {client.assignedAdminName || 'Superadmin HQ'}
                      </span>
                    </td>

                    {/* Sales */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#2C1810]">
                      <div>₹{client.totalSales?.toLocaleString('en-IN') || '0'}</div>
                      <div className="text-[10px] font-normal text-[#7A685D]">
                        {client.totalOrders || 0} orders
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(client._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          client.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {client.status === 'Active' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        <span>{client.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Open Client Live Dashboard */}
                        <button
                          onClick={() => navigate('/client/orders')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C85A32] bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg transition"
                          title="Open Cafe Client Dashboard (The Prime Cafe)"
                        >
                          <span>Open Panel</span>
                          <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-1.5 text-[#4A2C18] hover:bg-[#F5EFEB] rounded-lg transition"
                          title="Edit Cafe"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(client)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Cafe"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <PlusCircle size={18} className="text-[#C85A32]" /> Onboard New Cafe Client
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#7A685D] hover:text-[#2C1810]"
              >
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
                    placeholder="e.g. Blue Lagoon Cafe"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@cafe.com"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Connaught Place, New Delhi"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Table Seating Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.tablesCount}
                    onChange={(e) => setFormData({ ...formData, tablesCount: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Subscription Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Starter">Starter (Up to 8 Tables)</option>
                    <option value="Growth">Growth (Up to 15 Tables)</option>
                    <option value="Enterprise">Enterprise (Unlimited Tables)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Assigned Territory Admin</label>
                  <select
                    value={formData.assignedAdminName}
                    onChange={(e) => setFormData({ ...formData, assignedAdminName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Superadmin HQ">Superadmin HQ</option>
                    {admins.map((adm) => (
                      <option key={adm._id} value={`${adm.name} (${adm.region})`}>
                        {adm.name} ({adm.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Branch Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Market / Area details"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Initial Password</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Admin@123"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] font-mono focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD3]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A685D] hover:bg-[#F5EFEB] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl transition shadow-xs"
                >
                  Onboard Cafe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <Edit2 size={18} className="text-[#C85A32]" /> Edit Cafe Client Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#7A685D] hover:text-[#2C1810]"
              >
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
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
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
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Assigned Admin</label>
                  <select
                    value={formData.assignedAdminName}
                    onChange={(e) => setFormData({ ...formData, assignedAdminName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Superadmin HQ">Superadmin HQ</option>
                    {admins.map((adm) => (
                      <option key={adm._id} value={`${adm.name} (${adm.region})`}>
                        {adm.name} ({adm.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Update Password */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#C85A32] mb-1">
                  <KeyRound size={13} className="text-[#C85A32]" />
                  <span>Update Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    autoComplete="off"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl pl-3 pr-9 py-2 text-xs text-[#2C1810] font-mono focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A685D] hover:text-[#2C1810] p-1 cursor-pointer"
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD3]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A685D] hover:bg-[#F5EFEB] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl transition shadow-xs"
                >
                  Update Cafe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <ShieldAlert size={22} />
              </div>
              <h3 className="font-extrabold text-base text-[#2C1810]">Delete Client Cafe?</h3>
            </div>

            <p className="text-xs text-[#7A685D]">
              Are you sure you want to remove <strong>{currentClient?.cafeName}</strong>? All associated menu, orders, and branch data will be permanently archived.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#7A685D] hover:bg-[#F5EFEB] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminClientsTab;
