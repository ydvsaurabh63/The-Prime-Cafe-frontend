import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Tag, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const { itemCount } = useCart();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { label: 'Offers', path: '/offers', icon: Tag },
    { label: 'Order', path: '/order', icon: ShoppingBag, badge: itemCount },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E6DCD3] shadow-[0_-4px_20px_rgba(44,24,16,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center transition-all duration-200 relative ${
                  isActive
                    ? 'text-[#C85A32] font-semibold scale-105'
                    : 'text-[#7A685D] hover:text-[#4A2C18]'
                }`
              }
            >
              <div className="relative">
                <Icon size={22} strokeWidth={2} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#C85A32] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
