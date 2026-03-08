import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle2, Clock, Search, X, Coffee, UtensilsCrossed, LayoutDashboard, Settings, LogOut, Bell, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  customerName: string;
  tableNumber: string;
  notes: string;
  totalPrice: number;
  items: OrderItem[];
  status: 'pending' | 'completed';
  createdAt: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Assume true initially to prevent flicker
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setIsAuthenticated(false);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err));

    const socket = io();

    socket.on('newOrder', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on('orderCompleted', (id: string) => {
      setOrders(prev => prev.map(o => o.id.toString() === id.toString() ? { ...o, status: 'completed' } : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleComplete = async (id: number) => {
    try {
      const res = await fetch(`/api/orders/${id}/complete`, { method: 'PATCH' });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'completed' } : o));
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Failed to complete order:', err);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (search && !order.customerName.includes(search) && !order.tableNumber.includes(search)) return false;
    return true;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#3B1F10] font-sans flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-[#3B1F10] text-[#E8D5B0] hidden md:flex flex-col shadow-2xl z-20 sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-4 border-b border-white/10">
          <div className="bg-[#E8D5B0] text-[#3B1F10] p-3 rounded-2xl shadow-lg">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">لقمة</h1>
            <p className="text-[#E8D5B0]/60 text-xs mt-1 font-bold tracking-wider">لوحة التحكم</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-[#E8D5B0] text-[#3B1F10] px-4 py-3.5 rounded-2xl font-bold shadow-md transition-all">
            <LayoutDashboard size={20} />
            الطلبات المباشرة
            {pendingCount > 0 && (
              <span className="mr-auto bg-[#3B1F10] text-[#E8D5B0] text-xs px-2.5 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </a>
          <a href="#" className="flex items-center gap-3 text-[#E8D5B0]/70 hover:text-[#E8D5B0] hover:bg-white/5 px-4 py-3.5 rounded-2xl font-bold transition-all">
            <Settings size={20} />
            الإعدادات
          </a>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-[#E8D5B0]/70 hover:text-red-400 hover:bg-white/5 px-4 py-3.5 rounded-2xl font-bold transition-all w-full"
          >
            <LogOut size={20} />
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white px-8 py-5 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 z-10">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <input
                type="text"
                placeholder="بحث برقم الطاولة أو اسم العميل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-5 pl-12 text-[#3B1F10] placeholder-gray-400 focus:outline-none focus:border-[#3B1F10]/30 focus:bg-white transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-gray-100 rounded-2xl p-1.5 shadow-inner">
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-white text-[#3B1F10] shadow-sm' : 'text-gray-500 hover:text-[#3B1F10]'}`}
              >
                قيد الانتظار
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'completed' ? 'bg-white text-[#3B1F10] shadow-sm' : 'text-gray-500 hover:text-[#3B1F10]'}`}
              >
                مكتملة
              </button>
            </div>
            <button className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Bell size={20} className="text-gray-600" />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {/* Mobile Logout */}
            <button 
              onClick={handleLogout}
              className="md:hidden p-3 bg-red-50 text-red-500 rounded-full"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Orders Grid */}
        <div className="flex-1 overflow-auto p-8 bg-[#F8F9FA]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 group ${order.status === 'completed' ? 'opacity-60 grayscale-[0.2]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md">#{order.id}</span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#3B1F10] truncate max-w-[150px]">{order.customerName}</h3>
                    </div>
                    <div className="text-left flex flex-col items-end">
                      <span className="inline-flex items-center justify-center bg-[#E8D5B0]/20 text-[#3B1F10] w-12 h-12 rounded-2xl text-lg font-black border border-[#E8D5B0]/50 shadow-sm">
                        {order.tableNumber}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 mt-1">رقم الطاولة</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm font-medium text-gray-700">
                        <span className="bg-gray-100 text-gray-600 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ml-3 shrink-0">{item.quantity}</span>
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-xs text-gray-400 font-bold pt-2 ml-9">+{order.items.length - 3} عناصر أخرى</div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-xs mb-5 border border-orange-100 font-medium flex items-start gap-2">
                      <span className="font-black mt-0.5">!</span>
                      <span className="line-clamp-2">{order.notes}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-lg font-black text-[#3B1F10]">{order.totalPrice} <span className="text-xs text-gray-500">ر.س</span></span>
                    {order.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(order.id);
                        }}
                        className="bg-[#3B1F10] text-[#E8D5B0] px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2A150B] active:scale-[0.98] transition-all flex items-center gap-2 shadow-md opacity-0 group-hover:opacity-100 md:opacity-100"
                      >
                        <CheckCircle2 size={16} />
                        إنهاء
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredOrders.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-32 text-gray-400"
              >
                <div className="bg-gray-100 p-6 rounded-full mb-6">
                  <Coffee className="w-16 h-16 text-gray-300" />
                </div>
                <p className="text-2xl font-black mb-2 text-gray-500">لا توجد طلبات حالياً</p>
                <p className="text-sm font-medium">في انتظار طلبات جديدة...</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B1F10]/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-[#3B1F10] text-[#E8D5B0] p-8 flex justify-between items-center shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-black">طلب #{selectedOrder.id}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedOrder.status === 'pending' ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>
                      {selectedOrder.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                    </span>
                  </div>
                  <p className="text-[#E8D5B0]/70 flex items-center gap-2 text-sm font-medium">
                    <Clock size={14} />
                    {new Date(selectedOrder.createdAt).toLocaleString('ar-SA')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="flex gap-6 mb-8">
                  <div className="flex-1 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                    <span className="text-xs text-gray-400 block mb-1 font-bold">اسم العميل</span>
                    <span className="text-xl font-black text-[#3B1F10]">{selectedOrder.customerName}</span>
                  </div>
                  <div className="bg-[#E8D5B0]/20 p-5 rounded-3xl border border-[#E8D5B0]/50 min-w-[120px] text-center">
                    <span className="text-xs text-[#3B1F10]/60 block mb-1 font-bold">رقم الطاولة</span>
                    <span className="text-3xl font-black text-[#3B1F10]">{selectedOrder.tableNumber}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-black text-lg mb-4 text-[#3B1F10] flex items-center gap-2">
                    <Coffee size={20} className="text-[#E8D5B0]" />
                    تفاصيل الطلب
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <span className="bg-white text-[#3B1F10] w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm border border-gray-200 text-lg">
                            {item.quantity}
                          </span>
                          <span className="font-bold text-gray-800">{item.name}</span>
                        </div>
                        <span className="text-gray-500 font-bold">{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-8">
                    <h3 className="font-black text-lg mb-3 text-[#3B1F10]">ملاحظات العميل</h3>
                    <div className="bg-orange-50 text-orange-800 p-5 rounded-2xl border border-orange-100 font-medium leading-relaxed">
                      {selectedOrder.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold text-gray-500">المجموع الكلي</span>
                  <span className="text-4xl font-black text-[#3B1F10]">{selectedOrder.totalPrice} <span className="text-lg text-gray-500">ر.س</span></span>
                </div>

                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => handleComplete(selectedOrder.id)}
                    className="w-full bg-[#3B1F10] text-[#E8D5B0] py-5 rounded-2xl text-xl font-black hover:bg-[#2A150B] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    <CheckCircle2 size={24} />
                    إنهاء الطلب
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
