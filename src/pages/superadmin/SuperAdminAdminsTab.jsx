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
  Eye,
  EyeOff,
  Copy,
  Check,
  KeyRound,
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

  // Password visibility & copy states for table
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    region: 'Delhi NCR & North Zone',
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

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (pwd, id) => {
    navigator.clipboard.writeText(pwd || 'Admin@123');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDirectLogin = (admin) => {
    navigate('/admin/overview');
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      organization: '',
      email: '',
      phone: '',
      region: 'Delhi NCR & North Zone',
      password: 'Admin@123',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setCurrentAdmin(admin);
    setFormData({
      name: admin.name || '',
      organization: admin.organization || `${admin.name || 'Admin'} Cafe Operations`,
      email: admin.email || '',
      phone: admin.phone || '',
      region: admin.region || 'Delhi NCR & North Zone',
      password: admin.password || 'Admin@123',
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

    try {
      const res = await updateAdminApi(currentAdmin._id, formData);
      if (res && res.success === false) {
        alert(res.message || 'Failed to update admin');
        return;
      }
      await loadAdmins();
      setIsEditModalOpen(false);
      alert('Admin details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating admin');
    }
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
                <th className="py-3.5 px-4">ADMIN NAME & IDENTITY</th>
                <th className="py-3.5 px-4">OFFICIAL CONTACT</th>
                <th className="py-3.5 px-4">TERRITORY / AREA</th>
                <th className="py-3.5 px-4">PASSWORD</th>
                <th className="py-3.5 px-4 text-center">LOGIN</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
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
                filteredAdmins.map((adm, index) => (
                  <tr key={adm._id || index} className="hover:bg-[#FAF7F2]/60 transition">
                    {/* 1. ADMIN NAME & IDENTITY */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#2C1810] text-[#E6DCD3] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                          {adm.name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-[#2C1810] text-xs leading-tight">
                            {adm.name}
                          </div>
                          <div className="text-[11px] text-[#7A685D] mt-0.5 truncate">
                            {adm.organization || `${adm.name} Operations`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. OFFICIAL CONTACT */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[#2C1810] font-medium">
                          <Mail size={12} className="text-[#7A685D] shrink-0" />
                          <span className="truncate">{adm.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#7A685D]">
                          <Phone size={12} className="shrink-0" />
                          <span>{adm.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* 3. TERRITORY / AREA */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E6DCD3] text-[#2C1810] px-3 py-1.5 rounded-xl text-xs font-semibold">
                        <MapPin size={12} className="text-[#C85A32] shrink-0" />
                        <span>{adm.region || 'Delhi NCR & North Zone'}</span>
                      </div>
                    </td>

                    {/* 4. PASSWORD */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E6DCD3] px-3 py-1.5 rounded-xl text-xs text-[#2C1810]">
                        <span className="font-mono tracking-wider font-bold">
                          {visiblePasswords[adm._id]
                            ? (adm.password || 'Admin@123')
                            : '••••••••'}
                        </span>
                        <div className="flex items-center gap-1 text-[#7A685D] pl-1 border-l border-[#E6DCD3]">
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(adm._id)}
                            className="hover:text-[#2C1810] p-1 transition cursor-pointer"
                            title={visiblePasswords[adm._id] ? 'Hide password' : 'Show password'}
                          >
                            {visiblePasswords[adm._id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(adm.password || 'Admin@123', adm._id)}
                            className="hover:text-[#C85A32] p-1 transition cursor-pointer"
                            title="Copy password"
                          >
                            {copiedId === adm._id ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 5. LOGIN */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDirectLogin(adm)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C85A32] hover:bg-[#B24E2A] text-white rounded-xl font-bold text-xs transition shadow-xs cursor-pointer"
                        title={`Login as ${adm.name}`}
                      >
                        <ExternalLink size={13} />
                        <span>Login</span>
                      </button>
                    </td>

                    {/* 6. ACTIONS */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(adm)}
                          className="p-2 bg-[#FAF7F2] border border-[#E6DCD3] hover:border-[#C85A32] text-[#4A2C18] hover:text-[#C85A32] rounded-xl transition cursor-pointer"
                          title="Edit Admin"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(adm)}
                          className="p-2 bg-[#FAF7F2] border border-[#E6DCD3] hover:border-rose-400 text-[#7A685D] hover:text-rose-600 rounded-xl transition cursor-pointer"
                          title="Delete Admin"
                        >
                          <Trash2 size={13} />
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
                className="text-[#7A685D] hover:text-[#2C1810] cursor-pointer"
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
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Amit Sharma Cafe Operations"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Territory / Location *</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Delhi NCR & North Zone"
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
                  className="px-4 py-2 text-xs font-bold text-[#7A685D] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl transition shadow-xs cursor-pointer"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-[#E6DCD3]">
            <div className="flex items-center justify-between border-b border-[#E6DCD3] pb-3">
              <h3 className="font-extrabold text-base text-[#2C1810] flex items-center gap-2">
                Edit: {currentAdmin?.name} (ADMIN)
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#7A685D] hover:text-[#2C1810] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vijay Kumar Singh"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Company / Organization */}
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Vijay Kumar Singh Operations"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@aajkalcafe.com"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C1810] mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876500002"
                    className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Territory / Location */}
              <div>
                <label className="block text-xs font-bold text-[#2C1810] mb-1">Territory / Location</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="Delhi NCR & North Zone"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Update Password */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#C85A32] mb-1">
                  <KeyRound size={13} className="text-[#C85A32]" />
                  <span>Update Password</span>
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="admin123"
                  autoComplete="off"
                  className="w-full bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl px-3 py-2 text-xs text-[#2C1810] font-mono focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E6DCD3]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7A685D] hover:bg-[#F5EFEB] rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#C85A32] hover:bg-[#B24E2A] rounded-xl transition shadow-xs cursor-pointer"
                >
                  Save Changes
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
