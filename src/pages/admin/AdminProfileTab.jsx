import React, { useEffect, useState } from 'react';
import { User, Lock, QrCode, Shield, Check, AlertCircle, Plus, Trash2, Printer, Download } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminProfileTab = () => {
  const { user, updateCurrentUser } = useAuth();

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Table & QR Management state
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableId, setNewTableId] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');

  const fetchTables = async () => {
    try {
      setTablesLoading(true);
      const res = await api.get('/admin/tables');
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch tables:', e);
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileMsg('');
      const res = await api.patch('/admin/profile', { name, email, phone });
      if (res.data.success) {
        updateCurrentUser(res.data.data);
        setProfileMsg('Profile updated successfully.');
        setTimeout(() => setProfileMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMsg('');
      const res = await api.patch('/admin/profile/password', {
        currentPassword,
        newPassword
      });
      if (res.data.success) {
        setPasswordMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPasswordMsg(''), 4000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNum || !newTableId) return;
    try {
      const res = await api.post('/admin/tables', {
        tableNumber: newTableNum,
        identifier: newTableId,
        seatingCapacity: newCapacity
      });
      if (res.data.success) {
        setShowAddTable(false);
        setNewTableNum('');
        setNewTableId('');
        fetchTables();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create table');
    }
  };

  const handleToggleTable = async (table) => {
    try {
      const res = await api.patch(`/admin/tables/${table._id}/toggle`);
      if (res.data.success) {
        setTables((prev) =>
          prev.map((t) => (t._id === table._id ? { ...t, isActive: !table.isActive } : t))
        );
      }
    } catch (e) {
      alert('Could not toggle table status');
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Delete ${table.tableNumber}? Active orders will lose this table reference.`)) return;
    try {
      const res = await api.delete(`/admin/tables/${table._id}`);
      if (res.data.success) {
        setTables((prev) => prev.filter((t) => t._id !== table._id));
      }
    } catch (e) {
      alert('Could not delete table');
    }
  };

  const handlePrintQR = (table) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${table.tableNumber} QR Code - The Prime Cafe</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; text-align: center; }
            h1 { color: #2C1810; margin-bottom: 5px; font-size: 26px; }
            h2 { color: #C85A32; margin-top: 0; font-size: 20px; }
            p { color: #7A685D; font-size: 14px; max-width: 300px; }
            img { width: 280px; height: 280px; border: 4px solid #FAF7F2; border-radius: 16px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <h1>The Prime Cafe</h1>
          <h2>${table.tableNumber}</h2>
          <p>Scan with your phone camera to fill the entry form & order directly from this table!</p>
          <img src="${table.qrCodeDataUrl}" alt="${table.tableNumber} QR" />
          <p>Table ID: ${table.identifier} • Seating: ${table.seatingCapacity} Guests</p>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#2C1810]">Admin Account & Cafe Tables</h2>
        <p className="text-xs text-[#7A685D] mt-0.5">
          Manage staff security, password, and generate table QR codes for dine-in guests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4A2C18] text-white font-bold text-lg flex items-center justify-center">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2C1810] flex items-center gap-1.5">
                {user?.name}
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                  Staff Role: Admin
                </span>
              </h3>
              <p className="text-xs text-[#7A685D]">{user?.email}</p>
            </div>
          </div>

          {profileMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs pt-2">
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Staff Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Staff / Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-[#4A2C18] hover:bg-[#2C1810] text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-xs"
            >
              {profileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-[#C85A32]" />
            <h3 className="font-bold text-sm text-[#2C1810]">Change Staff Password</h3>
          </div>

          {passwordMsg && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
              {passwordMsg}
            </div>
          )}
          {passwordError && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A2C18] mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DCD3] rounded-xl focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold py-2.5 px-4 rounded-xl transition text-xs shadow-xs"
            >
              {passwordLoading ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* TABLE & QR CODES MANAGEMENT SECTION */}
      <div className="bg-white rounded-3xl border border-[#E6DCD3] p-5 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5EFEB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <QrCode size={20} className="text-[#C85A32]" />
              <h3 className="font-extrabold text-base text-[#2C1810]">
                Table QR Codes & Dine-In Management
              </h3>
            </div>
            <p className="text-xs text-[#7A685D] mt-0.5">
              Every table generates a scannable QR code directing customers directly to their table cart.
            </p>
          </div>

          <button
            onClick={() => setShowAddTable(!showAddTable)}
            className="text-xs font-bold bg-[#FAF7F2] border border-[#E6DCD3] hover:bg-[#F5EFEB] text-[#4A2C18] px-3.5 py-2 rounded-xl transition shadow-2xs flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus size={15} /> Add Table
          </button>
        </div>

        {/* Add Table Form */}
        {showAddTable && (
          <form
            onSubmit={handleCreateTable}
            className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E6DCD3] space-y-3 text-xs"
          >
            <h4 className="font-bold text-[#4A2C18]">Create New Table</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Table Display Name</label>
                <input
                  type="text"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="e.g. Table 06"
                  required
                  className="w-full p-2 bg-white border border-[#E6DCD3] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Identifier</label>
                <input
                  type="text"
                  value={newTableId}
                  onChange={(e) => setNewTableId(e.target.value)}
                  placeholder="e.g. 06"
                  required
                  className="w-full p-2 bg-white border border-[#E6DCD3] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full p-2 bg-white border border-[#E6DCD3] rounded-xl"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="bg-[#C85A32] hover:bg-[#B24E2A] text-white font-bold px-4 py-1.5 rounded-xl transition"
              >
                Generate QR & Save Table
              </button>
              <button
                type="button"
                onClick={() => setShowAddTable(false)}
                className="px-3 border border-[#E6DCD3] rounded-xl bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {tables.map((table) => (
            <div
              key={table._id}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center justify-between space-y-2.5 transition ${
                table.isActive ? 'bg-[#FAF7F2] border-[#E6DCD3]' : 'bg-stone-100 border-stone-300 opacity-60'
              }`}
            >
              <div>
                <h4 className="font-extrabold text-sm text-[#2C1810]">{table.tableNumber}</h4>
                <span className="text-[10px] text-[#7A685D] block">
                  Capacity: {table.seatingCapacity} Guests
                </span>
              </div>

              {table.qrCodeDataUrl && (
                <div className="w-28 h-28 bg-white p-1 rounded-xl border border-[#E6DCD3] shadow-2xs">
                  <img
                    src={table.qrCodeDataUrl}
                    alt={`${table.tableNumber} QR`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="w-full space-y-1.5 text-xs">
                <button
                  onClick={() => handlePrintQR(table)}
                  className="w-full bg-[#4A2C18] hover:bg-[#2C1810] text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition shadow-2xs"
                >
                  <Printer size={12} /> Print QR
                </button>

                <div className="flex gap-1 justify-center">
                  <button
                    onClick={() => handleToggleTable(table)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                      table.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {table.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDeleteTable(table)}
                    className="text-[10px] text-rose-600 font-semibold p-1 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileTab;
