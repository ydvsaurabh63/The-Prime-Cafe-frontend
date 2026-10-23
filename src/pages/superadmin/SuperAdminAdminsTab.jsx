import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersRound,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
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
  fetchAdminsApi,
  createAdminApi,
  updateAdminApi,
  deleteAdminApi,
  getStoredAdmins,
  saveStoredAdmins
} from '../../services/superAdminData';

const SuperAdminAdminsTab = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState(getStoredAdmins());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: 'Delhi NCR',
    password: '',
    status: 'Active'
  });

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const list = await fetchAdminsApi();
      if (list && list.length > 0) {
        setAdmins(list);
      }
    } catch (e) {
      console.error('Error loading admins:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      region: 'Delhi NCR',
      password: '',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      region: admin.region || 'Delhi NCR',
      password: '',
      status: admin.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (admin) => {
    setCurrentAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleSaveNewAdmin = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    await createAdminApi(formData);
    await loadAdmins();
    setIsAddModalOpen(false);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!currentAdmin) return;

    await updateAdminApi(currentAdmin._id, formData);
    await loadAdmins();
    setIsEditModalOpen(false);
  };

  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return;
    await deleteAdminApi(currentAdmin._id);
    await loadAdmins();
    setIsDeleteModalOpen(false);
  };

  const handleToggleStatus = async (id) => {
    const adm = admins.find((a) => a._id === id);
    if (!adm) return;
    const newStatus = adm.status === 'Active' ? 'Inactive' : 'Active';
    await updateAdminApi(id, { status: newStatus });
    await loadAdmins();
  };

  // Filtered List
  const filteredAdmins = admins.filter((adm) => {
    const matchesSearch =
      adm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'All' || adm.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-[#2C1810] tracking-tight flex items-center gap-2">
            <UsersRound className="text-[#C85A32]" />
            Manage Territory Admins
          </h1>
          <p className="text-xs md:text-sm text-[#7A685D] mt-0.5">
            Create, assign territory zones, and manage regional admin accounts.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#C85A32] hover:bg-[#B24E2A] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <UserPlus size={16} />
          <span>Add New Admin</span>
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
            placeholder="Search by name, email, region..."
            className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-[#7A685D]" />
          <span className="text-xs text-[#7A685D] font-medium">Status:</span>
          {['All', 'Active', 'Inactive'].map((st) => (
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

      {/* Admins Table */}
      <div className="bg-white border border-[#E6DCD3] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E6DCD3] text-[#7A685D] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Assigned Territory</th>
                <th className="py-3 px-4 text-center">Managed Cafes</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFEB]">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7A685D]">
                    No admins found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((adm) => (
                  <tr key={adm._id} className="hover:bg-[#FAF7F2] transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4A2C18] text-white flex items-center justify-center font-black text-xs">
                          {adm.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <div className="font-extrabold text-[#2C1810]">{adm.name}</div>
                          <div className="text-[10px] text-[#7A685D]">
                            Joined {new Date(adm.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[#2C1810]">
                        <Mail size={12} className="text-[#C85A32]" />
                        <span>{adm.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7A685D]">
                        <Phone size={12} />
                        <span>{adm.phone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1 bg-[#F5EFEB] text-[#4A2C18] px-2.5 py-1 rounded-lg font-bold text-[11px]">
                        <MapPin size={12} className="text-[#C85A32]" />
                        <span>{adm.region}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-[#2C1810] bg-stone-100 px-2 py-0.5 rounded-full text-[11px]">
                        {adm.managedClientsCount || 0} Cafes
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(adm._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                          adm.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {adm.status === 'Active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        <span>{adm.status}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate('/admin/overview')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Admin Portal"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(adm)}
                          className="p-1.5 text-[#4A2C18] hover:bg-[#F5EFEB] rounded-lg transition"
                          title="Edit Admin"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(adm)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Admin"
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

      {/* Add Admin Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <UserPlus size={18} className="text-[#C85A32]" /> Add Territory Admin
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#7A685D] hover:text-[#2C1810]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amit Sharma"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="amit@aajkalcafe.com"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Mobile Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98112 34567"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Assigned Territory *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai West">Mumbai West</option>
                  <option value="Bangalore Tech Zone">Bangalore Tech Zone</option>
                  <option value="Pune Central">Pune Central</option>
                  <option value="Hyderabad Cyberabad">Hyderabad Cyberabad</option>
                  <option value="Kolkata Heritage">Kolkata Heritage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Initial Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty for auto-generated"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
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
                  Save Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                <Edit2 size={18} className="text-[#C85A32]" /> Edit Territory Admin
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#7A685D] hover:text-[#2C1810]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

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
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Mobile Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Territory</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai West">Mumbai West</option>
                  <option value="Bangalore Tech Zone">Bangalore Tech Zone</option>
                  <option value="Pune Central">Pune Central</option>
                  <option value="Hyderabad Cyberabad">Hyderabad Cyberabad</option>
                  <option value="Kolkata Heritage">Kolkata Heritage</option>
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
                  <option value="Inactive">Inactive</option>
                </select>
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
                  Update Admin
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
              <h3 className="font-extrabold text-base text-[#2C1810]">Delete Admin?</h3>
            </div>

            <p className="text-xs text-[#7A685D]">
              Are you sure you want to remove <strong>{currentAdmin?.name}</strong>? They will lose access to the admin dashboard.
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
                onClick={handleDeleteAdmin}
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

export default SuperAdminAdminsTab;
