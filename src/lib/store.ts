
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, CartItem, Transaction, Employee, CashRegisterSession, ThemeSettings, ProductUnit, Supplier, Role } from '@/lib/types';

interface AppState {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  lastTransaction: Transaction | null;
  employees: Employee[];
  suppliers: Supplier[];
  roles: Role[];
  currentUser: (Employee & { roleName: string }) | null;
  cashRegisterHistory: CashRegisterSession[];
  currentCashRegister: CashRegisterSession | null;
  theme: ThemeSettings,
  addProduct: (product: Omit<Product, 'id' | 'cod'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'cod'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (role: Role) => void;
  deleteRole: (roleId: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  finalizeSale: (paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX', total: number) => Transaction | undefined;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  login: (userCode: string, password?: string) => boolean;
  logout: () => void;
  openCashRegister: (openingBalance: number) => void;
  closeCashRegister: () => void;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  findProductByCode: (code: string) => Product | undefined;
  getNextProductCode: () => string;
  getNextEmployeeCode: (roleId: string) => string;
  getNextSupplierCode: () => string;
  setLastTransaction: (transaction: Transaction | null) => void;
  getRoleName: (roleId: string) => string;
  canDeleteRole: (roleId: string) => boolean;
}

const defaultTheme: ThemeSettings = {
    primaryColor: { h: 262, s: 83, l: 58 }, // Default HSL for primary color
    fontFamily: 'font-inter', // Default font
};

const defaultRoles: Role[] = [
    { id: '1', name: 'Gerente', prefix: 'G' },
    { id: '2', name: 'Vendedor', prefix: 'V' },
    { id: '3', name: 'Estoquista', prefix: 'E' },
    { id: '4', name: 'Caixa', prefix: 'C' },
    { id: '5', name: 'Supervisor', prefix: 'S' },
    { id: '6', name: 'Administrador', prefix: 'ADM' },
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: [
        { id: '1', cod: '7891000315507', name: 'Café Expresso', price: 5.0, stock: 100, unit: 'UN', supplierId: '1' },
        { id: '2', cod: '7891000051019', name: 'Pão de Queijo', price: 25.0, stock: 5, unit: 'KG', supplierId: '1' },
        { id: '3', cod: '7896024921028', name: 'Bolo de Fubá', price: 7.0, stock: 30, unit: 'UN', supplierId: '2' },
      ],
      cart: [],
      transactions: [],
      lastTransaction: null,
      employees: [
        { id: '1', cod: 'G-001', name: 'Alice', roleId: '1' },
        { id: '2', cod: 'V-001', name: 'Beto', roleId: '2' },
        { id: '3', cod: 'E-001', name: 'Carlos', roleId: '3' },
        { id: '4', cod: 'ADM-001', name: 'Admin', roleId: '6', password: '2026' },
      ],
       suppliers: [
        { id: '1', cod: 'FOR-001', name: 'Padaria Pão Quente', contactPerson: 'João', phone: '11-98765-4321', email: 'contato@paoquente.com' },
        { id: '2', cod: 'FOR-002', name: 'Doce Sabor Confeitaria', contactPerson: 'Maria', phone: '11-91234-5678', email: 'vendas@docesabor.com' },
      ],
      roles: defaultRoles,
      currentUser: null,
      cashRegisterHistory: [],
      currentCashRegister: null,
      theme: defaultTheme,

      getRoleName: (roleId) => {
          return get().roles.find(r => r.id === roleId)?.name || 'N/A';
      },
      
      canDeleteRole: (roleId) => {
          return !get().employees.some(e => e.roleId === roleId);
      },

      getNextProductCode: () => {
        const { products } = get();
        const prodCodes = products
            .map(p => parseInt(p.cod.replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));
        const maxCode = prodCodes.length > 0 ? Math.max(...prodCodes) : 0;
        return `PROD-${(maxCode + 1).toString().padStart(4, '0')}`;
      },

      getNextEmployeeCode: (roleId: string) => {
        const { employees, roles } = get();
        const role = roles.find(r => r.id === roleId);
        if (!role) return 'ERROR-000';

        const prefix = role.prefix;
        
        const roleEmployees = employees.filter(e => e.cod.startsWith(`${prefix}-`));
        const maxCode = roleEmployees.reduce((max, e) => {
            const codeNum = parseInt(e.cod.split('-')[1]);
            return codeNum > max ? codeNum : max;
        }, 0);

        return `${prefix}-${(maxCode + 1).toString().padStart(3, '0')}`;
      },
      
      getNextSupplierCode: () => {
        const { suppliers } = get();
        const supCodes = suppliers
            .map(s => parseInt(s.cod.replace(/\D/g, ''), 10))
            .filter(n => !isNaN(n));
        const maxCode = supCodes.length > 0 ? Math.max(...supCodes) : 0;
        return `FOR-${(maxCode + 1).toString().padStart(3, '0')}`;
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

      addSupplier: (supplierData) => {
        const newSupplier: Supplier = {
            ...supplierData,
            id: new Date().toISOString(),
            cod: get().getNextSupplierCode(),
        }
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
      },
      updateSupplier: (updatedSupplier) => {
        set((state) => ({
          suppliers: state.suppliers.map((s) =>
            s.id === updatedSupplier.id ? updatedSupplier : s
          ),
        }));
      },
      deleteSupplier: (supplierId) => {
        set((state) => ({
          suppliers: state.suppliers.filter((s) => s.id !== supplierId),
        }));
      },
      
      addRole: (roleData) => {
        const newRole: Role = {
            ...roleData,
            id: new Date().toISOString(),
        }
        set((state) => ({ roles: [...state.roles, newRole] }));
      },
      updateRole: (updatedRole) => {
        set((state) => ({
          roles: state.roles.map((r) =>
            r.id === updatedRole.id ? updatedRole : r
          ),
        }));
      },
      deleteRole: (roleId) => {
        if (!get().canDeleteRole(roleId)) return;
        set((state) => ({
          roles: state.roles.filter((r) => r.id !== roleId),
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
          lastTransaction: newTransaction,
        }));
        return newTransaction;
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
      
      login: (userCode, password) => {
        const { employees } = get();
        const employee = employees.find(e => e.cod === userCode);

        if (!employee) return false;

        // If employee has a password, it must match.
        // If employee doesn't have a password, login is allowed without a password.
        if (employee.password && employee.password !== password) {
            return false;
        }

        const roleName = get().getRoleName(employee.roleId);
        set({ currentUser: { ...employee, roleName }, cart: [] }); // Clear cart on user switch
        return true;
      },

      logout: () => {
        set({ currentUser: null, cart: [] });
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
      },
      setLastTransaction: (transaction: Transaction | null) => {
        set({ lastTransaction: transaction });
      },
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['currentUser', 'currentCashRegister', 'lastTransaction'].includes(key))
        ),
    }
  )
);
