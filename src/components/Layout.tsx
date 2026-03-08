import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Coffee, ShoppingCart } from 'lucide-react';
import { useStore } from '../store/store';
import { motion } from 'framer-motion';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useStore();
  
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Don't show bottom nav on welcome page or admin page
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#3B1F10] text-[#F5ECD7] font-sans pb-20" dir="rtl">
      <Outlet />
      
      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#2A150B]/90 backdrop-blur-md border-t border-[#E8D5B0]/10 px-6 py-3 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavItem 
            icon={<Home size={24} />} 
            label="الرئيسية" 
            isActive={location.pathname === '/'} 
            onClick={() => navigate('/')} 
          />
          <NavItem 
            icon={<Coffee size={24} />} 
            label="القائمة" 
            isActive={location.pathname === '/menu'} 
            onClick={() => navigate('/menu')} 
          />
          <NavItem 
            icon={<ShoppingCart size={24} />} 
            label="السلة" 
            isActive={location.pathname === '/cart'} 
            onClick={() => navigate('/cart')} 
            badge={cartItemsCount}
          />
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, badge }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 relative transition-colors duration-300 ${isActive ? 'text-[#E8D5B0]' : 'text-[#F5ECD7]/50 hover:text-[#F5ECD7]/80'}`}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#2A150B]"
          >
            {badge}
          </motion.span>
        )}
      </div>
      <span className="text-xs font-bold">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="bottomNavIndicator"
          className="absolute -bottom-3 w-1 h-1 bg-[#E8D5B0] rounded-full"
        />
      )}
    </button>
  );
}
