import React, { useState } from 'react';
import { Coffee, Bell } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CustomerNotifyModal from './CustomerNotifyModal';

const CustomerHeader = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DCD3] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Link to="/" className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#4A2C18] text-[#FAF7F2] flex items-center justify-center shadow-md shrink-0">
              <Coffee size={19} className="text-[#FAF7F2]" />
            </Link>
            <div className="min-w-0">
              <Link to="/">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#2C1810] tracking-tight leading-none hover:text-[#C85A32] transition truncate">
                  The Prime Cafe
                </h1>
              </Link>
              <p className="text-[10px] sm:text-[11px] text-[#7A685D] mt-0.5 font-medium truncate max-w-[140px] sm:max-w-none">
                Artisanal Brews & Comfort Eats
              </p>
            </div>
          </div>


        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Service Bell / Notify Button */}
          <button
            type="button"
            onClick={() => setIsNotifyModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#C85A32] hover:bg-[#B24E2A] text-white px-2.5 sm:px-3.5 py-1.5 rounded-full shadow-xs transition active:scale-95"
            title="Service Bell - Call staff or request assistance"
          >
            <Bell size={13} />
            <span className="text-[11px] sm:text-xs">Notify Staff</span>
          </button>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-xs bg-[#4A2C18] text-white px-3 py-1.5 rounded-full font-bold shadow-xs hover:bg-[#382012] transition hidden sm:inline-block"
            >
              Sign In
            </Link>
          )}

          <Link
            to="/admin/login"
            className="hidden lg:inline-block text-[11px] text-[#7A685D] hover:text-[#4A2C18] font-semibold underline ml-1"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </header>

    {/* Customer Notification / Service Bell Modal */}
    <CustomerNotifyModal
      isOpen={isNotifyModalOpen}
      onClose={() => setIsNotifyModalOpen(false)}
    />
  </>
  );
};

export default CustomerHeader;
