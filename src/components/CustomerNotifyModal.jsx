import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Send, Loader2, Sparkles, MessageSquare, Utensils, UtensilsCrossed, Droplets, Receipt } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const QUICK_OPTIONS = [
  { label: 'Call Waiter', icon: Bell, message: 'Please send a waiter to our table.' },
  { label: 'Drinking Water', icon: Droplets, message: 'Please provide fresh drinking water.' },
  { label: 'Request Bill', icon: Receipt, message: 'Please bring our table bill.' },
  { label: 'Clean Table', icon: Utensils, message: 'Please clean our table.' },
  { label: 'Cutlery & Napkins', icon: UtensilsCrossed, message: 'Please provide extra cutlery and napkins.' },
  { label: 'Order Inquiry', icon: MessageSquare, message: 'Could you please check on our order status?' }
];

const CustomerNotifyModal = ({ isOpen, onClose }) => {
  const { table, setTable } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [tableInput, setTableInput] = useState(table?.number || table?.name || '');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [selectedQuick, setSelectedQuick] = useState(QUICK_OPTIONS[0].label);
  const [customMessage, setCustomMessage] = useState(QUICK_OPTIONS[0].message);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectQuick = (option) => {
    setSelectedQuick(option.label);
    setCustomMessage(option.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const resolvedTable = tableInput.trim() || table?.number || table?.name || 'Walk-in';
    const messageToSend = customMessage.trim() || `Customer requested: ${selectedQuick}`;

    setLoading(true);
    try {
      const res = await api.post('/notify-staff', {
        tableNumber: resolvedTable,
        customerName: customerName.trim() || (isAuthenticated ? user?.name : 'Guest Customer'),
        requestType: selectedQuick,
        message: messageToSend
      });

      if (res.data.success) {
        if (tableInput.trim() && (!table || table.number !== tableInput.trim())) {
          setTable({
            number: tableInput.trim(),
            name: String(tableInput.trim()).toLowerCase().startsWith('table')
              ? tableInput.trim()
              : `Table ${tableInput.trim()}`
          });
        }

        setSuccessMsg(res.data.message || 'Notification sent to staff successfully!');
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 2200);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E6DCD3] shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[85vh] text-[#2C1810]">
        {/* Fixed Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-[#E6DCD3] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C85A32] text-white flex items-center justify-center shadow-xs shrink-0">
              <Bell size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#2C1810] leading-tight">
                Service Bell & Staff Alert
              </h3>
              <p className="text-xs text-[#7A685D] mt-0.5">
                Notify cafe staff instantly for anything you need
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#E6DCD3] flex items-center justify-center text-[#7A685D] hover:text-[#2C1810] transition cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        {successMsg ? (
          <div className="py-10 px-4 text-center space-y-3 flex-1 overflow-y-auto flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-lg font-extrabold text-[#2C1810]">Staff Notified!</h4>
            <p className="text-xs sm:text-sm text-[#7A685D] max-w-sm mx-auto">
              {successMsg} A team member has received your alert and is on their way.
            </p>
          </div>
        ) : (
          <form id="service-bell-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}

              {/* Table Number & Customer Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4A2C18] mb-1">
                    Table Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Table 04 or 4"
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E6DCD3] bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A2C18] mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-[#E6DCD3] bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Quick Assistance Categories */}
              <div>
                <label className="block text-xs font-bold text-[#4A2C18] mb-2">
                  What do you need assistance with?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_OPTIONS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedQuick === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleSelectQuick(item)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition text-left cursor-pointer active:scale-98 ${
                          isSelected
                            ? 'bg-[#4A2C18] text-white border-[#4A2C18] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#7A685D] border-[#E6DCD3] hover:border-[#4A2C18] hover:text-[#2C1810]'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-[#C85A32]' : 'text-[#7A685D] shrink-0'} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Message / Instructions */}
              <div>
                <label className="block text-xs font-bold text-[#4A2C18] mb-1">
                  Custom Message / Details for Staff
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type any instructions, items, or requirements here..."
                  className="w-full text-xs font-medium p-3 rounded-xl border border-[#E6DCD3] bg-[#FAF7F2] focus:bg-white focus:outline-hidden focus:border-[#C85A32] leading-relaxed resize-none"
                ></textarea>
                <p className="text-[10px] text-[#7A685D] mt-1">
                  Tip: You can edit or add specific details (e.g. "Warm water please", "Please bring bill").
                </p>
              </div>
            </div>

            {/* Sticky Fixed Bottom Actions (Always visible on mobile & tablet) */}
            <div className="shrink-0 p-3.5 sm:p-4 border-t border-[#E6DCD3] bg-[#FAF7F2] flex items-center justify-end gap-2.5">
              <div className="grid grid-cols-2 sm:flex sm:items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl border border-[#E6DCD3] text-xs font-bold text-[#7A685D] bg-white hover:bg-[#F5EFEB] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B24E2A] text-white text-xs font-bold shadow-md transition disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Notifying...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Ring Bell</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerNotifyModal;
