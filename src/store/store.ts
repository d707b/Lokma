import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'coffee' | 'dessert';
  isNew?: boolean;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface AppState {
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  customerName: '',
  setCustomerName: (name) => set({ customerName: name }),
  tableNumber: '',
  setTableNumber: (num) => set({ tableNumber: num }),
  cart: [],
  addToCart: (product) => set((state) => {
    const existing = state.cart.find(item => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  updateQuantity: (id, delta) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0)
  })),
  clearCart: () => set({ cart: [] })
}));
