import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { motion } from 'framer-motion';

export default function Welcome() {
  const navigate = useNavigate();
  const { customerName, setCustomerName } = useStore();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customerName.trim();
    if (name === 'لقمة') {
      localStorage.setItem('adminToken', 'true');
      navigate('/admin');
    } else if (name) {
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#3B1F10]">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#3B1F10] via-[#3B1F10]/80 to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md text-center z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-7xl font-black mb-2 text-[#E8D5B0] tracking-tight drop-shadow-2xl">لقمة</h1>
          <p className="text-2xl mb-16 text-[#F5ECD7]/80 font-light tracking-wide">أحلى لقمة في يومك</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-[#E8D5B0]/95 backdrop-blur-xl rounded-[2rem] p-8 text-[#3B1F10] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
        >
          <h2 className="text-3xl font-bold mb-4">أهلاً وسهلاً بك</h2>
          <p className="mb-8 text-lg text-[#3B1F10]/70 font-medium">شرفتنا! بس أول شيء نبي نعرف اسمك</p>
          
          <form onSubmit={handleStart} className="flex flex-col gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب اسمك هنا..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white/60 border-2 border-[#3B1F10]/10 rounded-2xl p-5 text-xl text-center focus:outline-none focus:border-[#3B1F10]/50 focus:bg-white transition-all duration-300 placeholder-[#3B1F10]/40 font-bold shadow-inner"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#3B1F10] text-[#E8D5B0] rounded-2xl py-5 text-xl font-bold hover:bg-[#2A150B] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
            >
              <span>ابدأ الطلب</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
