import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Product } from '../store/store';
import { products } from '../data';
import { Menu as MenuIcon, ShoppingCart, X, Plus, Coffee, CakeSlice } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Menu() {
  const navigate = useNavigate();
  const { customerName, cart, addToCart } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'coffee' | 'dessert'>('all');

  const filteredProducts = products.filter(p => activeCategory === 'all' || p.category === activeCategory);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen pb-24 bg-[#3B1F10]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#3B1F10]/90 backdrop-blur-xl border-b border-[#E8D5B0]/10 p-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#E8D5B0]/10 rounded-full flex items-center justify-center text-[#E8D5B0]">
            <span className="font-bold text-lg">{customerName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xs text-[#E8D5B0]/60">مرحباً بك</p>
            <h1 className="text-lg font-bold text-[#E8D5B0]">{customerName}</h1>
          </div>
        </div>
      </header>

      <main className="p-5 space-y-8">
        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
          <CategoryButton 
            active={activeCategory === 'all'} 
            onClick={() => setActiveCategory('all')} 
            label="الكل" 
          />
          <CategoryButton 
            active={activeCategory === 'coffee'} 
            onClick={() => setActiveCategory('coffee')} 
            label="القهوة" 
            icon={<Coffee size={16} />}
          />
          <CategoryButton 
            active={activeCategory === 'dessert'} 
            onClick={() => setActiveCategory('dessert')} 
            label="الحلى" 
            icon={<CakeSlice size={16} />}
          />
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                onAdd={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Product Modal (Bottom Sheet) */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] bg-[#E8D5B0] rounded-t-[2rem] overflow-hidden text-[#3B1F10] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-72 shrink-0">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#E8D5B0] via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 left-4 bg-black/40 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-black/60 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 pt-2 overflow-y-auto">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-3xl font-black">{selectedProduct.name}</h3>
                  {selectedProduct.isNew && (
                    <span className="bg-[#3B1F10] text-[#E8D5B0] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                      جديد
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-[#3B1F10]/80 mb-6">{selectedProduct.price} <span className="text-lg">ر.س</span></p>
                
                <p className="text-lg mb-8 text-[#3B1F10]/70 leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
                
                <button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full bg-[#3B1F10] text-[#E8D5B0] py-5 rounded-2xl text-xl font-bold hover:bg-[#2A150B] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <Plus size={24} />
                  أضف للسلة
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
        active 
          ? 'bg-[#E8D5B0] text-[#3B1F10] shadow-lg scale-105' 
          : 'bg-[#E8D5B0]/10 text-[#E8D5B0] hover:bg-[#E8D5B0]/20'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ProductCard({ product, onClick, onAdd, key }: { product: Product, onClick: () => void, onAdd: (e: React.MouseEvent) => void, key?: string }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-[#E8D5B0] rounded-[1.5rem] overflow-hidden shadow-lg cursor-pointer flex flex-col relative group border border-white/20"
    >
      {product.isNew && (
        <div className="absolute top-3 right-3 bg-[#3B1F10]/90 backdrop-blur-sm text-[#E8D5B0] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase z-10 shadow-md">
          جديد
        </div>
      )}
      <div className="h-40 relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#E8D5B0] via-transparent to-transparent opacity-80" />
      </div>
      <div className="p-4 pt-2 flex flex-col flex-1 text-[#3B1F10]">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-center mt-auto pt-3">
          <span className="font-black text-lg">{product.price} <span className="text-xs">ر.س</span></span>
          <button 
            onClick={onAdd}
            className="bg-[#3B1F10] text-[#E8D5B0] p-2.5 rounded-full hover:bg-[#2A150B] active:scale-90 transition-all shadow-md"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

