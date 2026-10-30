import React, { useEffect } from 'react';
import { Link, Outlet, useSearchParams } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
import BottomNav from '../components/BottomNav';
import PWAInstallBanner from '../components/PWAInstallBanner';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const CustomerLayout = () => {
  const [searchParams] = useSearchParams();
  const { setTable } = useCart();

  // If table parameter exists in URL (e.g. ?table=05), validate & persist it
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const validateTableIdentifier = async () => {
        try {
          const res = await api.get(`/tables/validate/${tableParam}`);
          if (res.data.success && res.data.table) {
            setTable({
              number: res.data.table.identifier,
              name: res.data.table.tableNumber
            });
          }
        } catch (e) {
          setTable({
            number: tableParam,
            name: `Table ${tableParam}`
          });
        }
      };
      validateTableIdentifier();

      // Customers can browse menu freely; table identifier is stored in background if provided
    }
  }, [searchParams, setTable]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] flex flex-col antialiased">
      <CustomerHeader />
      {/* Responsive Container: expands on mobile, tablet & laptop with pb-28 to avoid bottom nav clipping */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-28 sm:pb-24 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4 flex flex-col justify-between min-w-0">
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>

        {/* Website Footer Credit & Management Portal Access */}
        <footer className="mt-14 pt-6 border-t border-[#E6DCD3] text-xs text-[#7A685D]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            {/* Developer Credit */}
            <div className="space-y-0.5">
              <p className="font-semibold text-[#4A2C18]">
                Designed & Developed by <span className="font-bold text-[#2C1810]">Diin Technologies Pvt. Ltd.</span>
              </p>
              <p className="text-[11px] text-[#8C7B70]">
                © 2026 Diin Technologies Pvt. Ltd. All rights reserved.
              </p>
            </div>

            {/* Management Portal Link (Shifted to bottom side for mobile & laptop) */}
            <div className="flex items-center gap-1.5">
              <Link
                to="/client/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF0E6] text-[#7A685D] hover:text-[#C85A32] border border-[#E6DCD3] text-[11px] font-bold shadow-2xs transition active:scale-95"
                title="Management Portal Login"
              >
                <span>Management Portal</span>
                <span className="text-[10px]">🔒</span>
              </Link>
            </div>
          </div>
        </footer>
      </main>
      <PWAInstallBanner />
      <BottomNav />
    </div>
  );
};

export default CustomerLayout;

