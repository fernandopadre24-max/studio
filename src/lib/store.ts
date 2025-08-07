
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem, Transaction, Employee } from '@/lib/types';

interface AppState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  employees: Employee[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  finalizeSale: (paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX', total: number) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [
        { id: '1', cod: 'CAF-EXP', name: 'Café Expresso', price: 5.0, stock: 100 },
        { id: '2', cod: 'PAO-QJO', name: 'Pão de Queijo', price: 3.5, stock: 50 },
        { id: '3', cod: 'BOL-FBA', name: 'Bolo de Fubá', price: 7.0, stock: 30 },
      ],
      cart: [],
      transactions: [],
      employees: [
        { id: '1', name: 'Alice', role: 'Gerente' },
        { id: '2', name: 'Beto', role: 'Vendedor' },
      ],

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

        if (existingItem) {
          const quantityDiff = 1;
          if (productInStock.stock < quantityDiff) return; // Not enough stock

          const newCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
           set((state) => ({ 
                cart: newCart, 
            }));

        } else {
          set((state) => ({ cart: [...state.cart, { ...product, quantity: 1 }] }));
        }
      },
      removeFromCart: (productId) => {
        const { cart, products } = get();
        const itemToRemove = cart.find((item) => item.id === productId);
        if (!itemToRemove) return;

        const newCart = cart.filter((item) => item.id !== productId);
        
        set({ cart: newCart });
      },
      updateCartItemQuantity: (productId, quantity) => {
         const { cart, products } = get();
         const itemToUpdate = cart.find(item => item.id === productId);
         if (!itemToUpdate) return;
 
         const productInStock = products.find(p => p.id === productId)!;
         const availableStock = productInStock.stock + itemToUpdate.quantity;

         if(quantity > availableStock) return;
 
         if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
         }

         const newCart = cart.map(item => item.id === productId ? { ...item, quantity } : item);
         set({ cart: newCart });
      },
      clearCart: () => {
         set({ cart: [] });
      },
      finalizeSale: (paymentMethod, total) => {
        const { cart, products } = get();
        if (cart.length === 0) return;

        const newTransaction: Transaction = {
          id: new Date().toISOString(),
          items: cart,
          total,
          paymentMethod,
          date: new Date().toISOString(),
        };

        const newProducts = [...products];
        cart.forEach(cartItem => {
            const productIndex = newProducts.findIndex(p => p.id === cartItem.id);
            if (productIndex !== -1) {
                newProducts[productIndex].stock -= cartItem.quantity;
            }
        });

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
          cart: [],
          products: newProducts,
        }));
      },

      addEmployee: (employeeData) => {
        const newEmployee: Employee = { ...employeeData, id: new Date().toISOString() };
        set((state) => ({ employees: [...state.employees, newEmployee] }));
      },
      updateEmployee: (updatedEmployee) => {
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === updatedEmployee.id ? updatedEmployee : e
          ),
        }));
      },
      deleteEmployee: (employeeId) => {
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== employeeId),
        }));
      },
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
