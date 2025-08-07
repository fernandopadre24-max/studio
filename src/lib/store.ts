
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem, Transaction, Employee, CashRegisterSession, ThemeSettings, ProductUnit, EmployeeRole } from '@/lib/types';

interface AppState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  employees: Employee[];
  currentUser: Employee | null;
  cashRegisterHistory: CashRegisterSession[];
  currentCashRegister: CashRegisterSession | null;
  theme: ThemeSettings,
  addProduct: (product: Omit<Product, 'id' | 'cod'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  finalizeSale: (paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX', total: number) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  setCurrentUser: (employee: Employee | null) => void;
  openCashRegister: (openingBalance: number) => void;
  closeCashRegister: () => void;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  findProductByCode: (code: string) => Product | undefined;
  getNextProductCode: () => string;
  getNextEmployeeCode: (role: EmployeeRole) => string;
}

const defaultTheme: ThemeSettings = {
    primaryColor: { h: 262, s: 83, l: 58 }, // Default HSL for primary color
    fontFamily: 'font-inter', // Default font
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [
        { id: '1', cod: '7891000315507', name: 'Café Expresso', price: 5.0, stock: 100, unit: 'UN' },
        { id: '2', cod: '7891000051019', name: 'Pão de Queijo', price: 25.0, stock: 5, unit: 'KG' },
        { id: '3', cod: '7896024921028', name: 'Bolo de Fubá', price: 7.0, stock: 30, unit: 'UN' },
      ],
      cart: [],
      transactions: [],
      employees: [
        { id: '1', cod: 'G-001', name: 'Alice', role: 'Gerente' },
        { id: '2', cod: 'V-001', name: 'Beto', role: 'Vendedor' },
        { id: '3', cod: 'E-001', name: 'Carlos', role: 'Estoquista' },
      ],
      currentUser: null,
      cashRegisterHistory: [],
      currentCashRegister: null,
      theme: defaultTheme,

      getNextProductCode: () => {
        const { products } = get();
        const prodCodes = products
            .filter(p => p.cod.startsWith('PROD-'))
            .map(p => parseInt(p.cod.replace('PROD-', ''), 10))
            .filter(n => !isNaN(n));
        const maxCode = prodCodes.length > 0 ? Math.max(...prodCodes) : 0;
        return `PROD-${(maxCode + 1).toString().padStart(4, '0')}`;
      },

      getNextEmployeeCode: (role: EmployeeRole) => {
        const { employees } = get();
        const prefixMap: Record<EmployeeRole, string> = {
          'Gerente': 'G',
          'Vendedor': 'V',
          'Estoquista': 'E'
        };
        const prefix = prefixMap[role];
        
        const roleEmployees = employees.filter(e => e.role === role);
        const maxCode = roleEmployees.reduce((max, e) => {
            const codeNum = parseInt(e.cod.split('-')[1]);
            return codeNum > max ? codeNum : max;
        }, 0);

        return `${prefix}-${(maxCode + 1).toString().padStart(3, '0')}`;
      },

      findProductByCode: (code) => {
        return get().products.find(p => p.cod === code);
      },

      addProduct: (productData) => {
        const newProduct: Product = { 
            ...productData, 
            id: new Date().toISOString(),
            cod: get().getNextProductCode(),
        };
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

      addToCart: (product, quantity = 1) => {
        const { cart, products } = get();
        const productInStock = products.find((p) => p.id === product.id);
        if (!productInStock || productInStock.stock <= 0) return;

        const existingItem = cart.find((item) => item.id === product.id);
        
        const isWeightBased = product.unit === 'KG' || product.unit === 'G';
        const addQuantity = isWeightBased ? quantity : Math.floor(quantity);


        if (existingItem) {
          const newQuantity = existingItem.quantity + addQuantity;
          if (newQuantity > productInStock.stock) return; // Prevent adding more than in stock
          
          const newCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: newQuantity }
              : item
          );
           set({ cart: newCart });

        } else {
           if (addQuantity > productInStock.stock) return;
           set((state) => ({ cart: [...state.cart, { ...product, quantity: addQuantity }] }));
        }
      },
      removeFromCart: (productId) => {
        const { cart } = get();
        const newCart = cart.filter((item) => item.id !== productId);
        set({ cart: newCart });
      },
      updateCartItemQuantity: (productId, quantity) => {
         const { cart, products } = get();
         const itemToUpdate = cart.find(item => item.id === productId);
         if (!itemToUpdate) return;
 
         const productInStock = products.find(p => p.id === productId)!;
         const availableStock = productInStock.stock;
         
         const isWeightBased = itemToUpdate.unit === 'KG' || itemToUpdate.unit === 'G';
         const newQuantity = isWeightBased ? quantity : Math.floor(quantity);

         if(newQuantity > availableStock) return;
 
         if (newQuantity <= 0) {
            get().removeFromCart(productId);
            return;
         }

         const newCart = cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
         set({ cart: newCart });
      },
      clearCart: () => {
         set({ cart: [] });
      },
      finalizeSale: (paymentMethod, total) => {
        const { cart, products, currentUser, currentCashRegister } = get();
        if (cart.length === 0 || !currentUser || !currentCashRegister || currentCashRegister.status !== 'aberto') return;

        const newTransaction: Transaction = {
          id: new Date().toISOString(),
          items: cart,
          total,
          paymentMethod,
          date: new Date().toISOString(),
          operator: currentUser.name,
          operatorCod: currentUser.cod,
          cashRegisterSessionId: currentCashRegister.id,
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
          currentCashRegister: {
            ...currentCashRegister,
            transactions: [...currentCashRegister.transactions, newTransaction]
          },
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
      
      setCurrentUser: (employee) => {
        set({ currentUser: employee, cart: [] }); // Clear cart on user switch
      },

      openCashRegister: (openingBalance) => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        const newSession: CashRegisterSession = {
          id: new Date().toISOString(),
          openingTime: new Date().toISOString(),
          openingBalance,
          operatorId: currentUser.id,
          operatorName: currentUser.name,
          status: 'aberto',
          transactions: [],
        };
        set({ currentCashRegister: newSession });
      },

      closeCashRegister: () => {
        const { currentCashRegister } = get();
        if (!currentCashRegister) return;
        
        const salesInCash = currentCashRegister.transactions
            .filter(t => t.paymentMethod === 'Dinheiro')
            .reduce((sum, t) => sum + t.total, 0);

        const closingBalance = currentCashRegister.openingBalance + salesInCash;

        const closedSession: CashRegisterSession = {
            ...currentCashRegister,
            status: 'fechado',
            closingTime: new Date().toISOString(),
            closingBalance,
        };
        
        set(state => ({
            cashRegisterHistory: [closedSession, ...state.cashRegisterHistory],
            currentCashRegister: null,
        }))
      },
      setTheme: (newTheme) => {
        set((state) => ({
            theme: { ...state.theme, ...newTheme }
        }))
      }
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['currentUser', 'currentCashRegister'].includes(key))
        ),
    }
  )
);
