import React, { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
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
      {/* Responsive Container: expands on desktop/laptop with pb-24 for bottom navigation bar */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 pt-4 flex flex-col justify-between">
        <div className="flex-1">
          <Outlet />
        </div>

        {/* Website Footer Credit */}
        <footer className="mt-14 pt-6 border-t border-[#E6DCD3] text-center space-y-1 text-xs text-[#7A685D]">
          <p className="font-semibold text-[#4A2C18]">
            Designed & Developed by <span className="font-bold text-[#2C1810]">Diin Technologies Pvt. Ltd.</span>
          </p>
          <p className="text-[11px] text-[#8C7B70]">
            © 2026 Diin Technologies Pvt. Ltd. All rights reserved.
          </p>
        </footer>
      </main>
      <PWAInstallBanner />
      <BottomNav />
    </div>
  );
};

export default CustomerLayout;

