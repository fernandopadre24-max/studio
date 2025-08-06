
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem, Transaction } from '@/lib/types';

interface AppState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  finalizeSale: (paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [
        { id: '1', name: 'Café Expresso', price: 5.0, stock: 100 },
        { id: '2', name: 'Pão de Queijo', price: 3.5, stock: 50 },
        { id: '3', name: 'Bolo de Fubá', price: 7.0, stock: 30 },
      ],
      cart: [],
      transactions: [],

      addProduct: (productData) => {
        const newProduct: Product = { ...productData, id: new Date().toISOString() };
        set((state) => ({ products: [...state.products, newProduct] }));
      },
      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === updatedProduct.id ? updatedProduct : p
          ),
        }));
      },
      deleteProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      addToCart: (product) => {
        const { cart, products } = get();
        const productInStock = products.find((p) => p.id === product.id);
        if (!productInStock || productInStock.stock <= 0) return;

        const existingItem = cart.find((item) => item.id === product.id);

        let newCart: CartItem[];
        if (existingItem) {
          newCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newCart = [...cart, { ...product, quantity: 1 }];
        }

        const newProducts = products.map((p) =>
          p.id === product.id ? { ...p, stock: p.stock - 1 } : p
        );

        set({ cart: newCart, products: newProducts });
      },
      removeFromCart: (productId) => {
        const { cart, products } = get();
        const itemToRemove = cart.find((item) => item.id === productId);
        if (!itemToRemove) return;

        const newCart = cart.filter((item) => item.id !== productId);
        const newProducts = products.map((p) =>
            p.id === productId ? { ...p, stock: p.stock + itemToRemove.quantity } : p
        );

        set({ cart: newCart, products: newProducts });
      },
      updateCartItemQuantity: (productId, quantity) => {
         const { cart, products } = get();
         const itemToUpdate = cart.find(item => item.id === productId);
         if (!itemToUpdate) return;
 
         const productInStock = products.find(p => p.id === productId)!;
         const quantityDiff = quantity - itemToUpdate.quantity;
 
         if (productInStock.stock < quantityDiff) return; // Not enough stock
 
         const newCart = cart.map(item => item.id === productId ? { ...item, quantity } : item).filter(item => item.quantity > 0);
         const newProducts = products.map(p => p.id === productId ? { ...p, stock: p.stock - quantityDiff } : p);
         
         set({ cart: newCart, products: newProducts });
      },
      clearCart: () => {
        const { cart, products } = get();
         const newProducts = [...products];
         cart.forEach(cartItem => {
             const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
             if (productIndex !== -1) {
                 newProducts[productIndex].stock += cartItem.quantity;
             }
         });
         set({ cart: [], products: newProducts });
      },
      finalizeSale: (paymentMethod) => {
        const { cart } = get();
        if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newTransaction: Transaction = {
          id: new Date().toISOString(),
          items: cart,
          total,
          paymentMethod,
          date: new Date(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          cart: [], // Esvazia o carrinho após a venda
        }));
      },
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
