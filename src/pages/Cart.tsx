import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQuantity, customerName, tableNumber, setTableNumber, clearCart } = useStore();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!tableNumber.trim()) {
      setErrorMsg('الرجاء إدخال رقم الطاولة');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('السلة فارغة');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          tableNumber,
          notes,
          totalPrice,
          items: cart
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate('/menu');
        }, 3000);
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setErrorMsg('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#3B1F10]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#E8D5B0] text-[#3B1F10] p-10 rounded-[2rem] text-center max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-7xl mb-6"
          >
            ✨
          </motion.div>
          <h2 className="text-3xl font-black mb-4">تم إرسال طلبك بنجاح</h2>
          <p className="text-lg opacity-80 font-medium">سيتم تجهيز طلبك بأسرع وقت</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 bg-[#3B1F10]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#3B1F10]/90 backdrop-blur-xl border-b border-[#E8D5B0]/10 p-5 flex items-center gap-4 shadow-sm">
        <button 
          onClick={() => navigate('/menu')}
          className="p-2.5 bg-[#E8D5B0]/10 hover:bg-[#E8D5B0]/20 rounded-full transition-colors text-[#E8D5B0]"
        >
          <ArrowRight size={20} />
        </button>
        <h1 className="text-2xl font-bold text-[#E8D5B0]">سلة المشتريات</h1>
      </header>

      <main className="p-5 max-w-2xl mx-auto">
        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 opacity-50 text-[#E8D5B0]"
          >
            <ShoppingCartIcon className="mx-auto mb-6 w-20 h-20 opacity-50" />
            <p className="text-2xl font-bold">السلة فارغة</p>
            <p className="mt-2">أضف بعض المنتجات اللذيذة</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, x: -100 }}
                    className="bg-[#E8D5B0] rounded-[1.5rem] p-4 flex gap-4 items-center text-[#3B1F10] shadow-lg border border-white/20"
                  >
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-inner">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
                      <p className="font-black text-[#3B1F10]/80 mb-3">{item.price} <span className="text-xs">ر.س</span></p>
                      
                      <div className="flex items-center gap-4 bg-white/60 rounded-full px-2 py-1.5 w-max shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 bg-white hover:bg-red-50 rounded-full transition-colors shadow-sm"
                        >
                          {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                        </button>
                        <span className="font-bold w-6 text-center text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 bg-[#3B1F10] text-[#E8D5B0] hover:bg-[#2A150B] rounded-full transition-colors shadow-sm"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-[#E8D5B0]/5 backdrop-blur-md rounded-[2rem] p-6 space-y-6 border border-[#E8D5B0]/10 shadow-xl">
              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/30 font-bold text-center"
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="block text-lg font-bold mb-3 text-[#E8D5B0]">رقم الطاولة</label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="مثال: 5"
                  className="w-full bg-[#E8D5B0] text-[#3B1F10] rounded-2xl p-4 text-lg font-bold focus:outline-none focus:ring-4 focus:ring-[#E8D5B0]/30 placeholder-[#3B1F10]/40 transition-all shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-3 text-[#E8D5B0]">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="بدون سكر، حليب خالي الدسم..."
                  className="w-full bg-[#E8D5B0] text-[#3B1F10] rounded-2xl p-4 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-[#E8D5B0]/30 min-h-[120px] resize-none placeholder-[#3B1F10]/40 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-5 z-40 pointer-events-none">
          <div className="max-w-md mx-auto bg-[#E8D5B0] rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 pointer-events-auto flex items-center justify-between gap-6">
            <div className="flex flex-col pl-4">
              <span className="text-[#3B1F10]/60 text-sm font-bold">المجموع الكلي</span>
              <span className="text-3xl font-black text-[#3B1F10]">{totalPrice} <span className="text-lg">ر.س</span></span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-[#3B1F10] text-[#E8D5B0] py-4 rounded-2xl text-xl font-bold hover:bg-[#2A150B] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'أرسل الطلب'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
