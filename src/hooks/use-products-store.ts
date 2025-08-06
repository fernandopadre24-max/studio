import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
}

const initialProducts: Product[] = [
    { id: 'prod1', name: 'Maçãs Fuji (Kg)', price: 7.99 },
    { id: 'prod2', name: 'Pão Francês (Un)', price: 0.75 },
    { id: 'prod3', name: 'Leite Integral (Litro)', price: 4.50 },
    { id: 'prod4', name: 'Café Torrado e Moído (500g)', price: 15.80 },
    { id: 'prod5', name: 'Queijo Minas Frescal (Kg)', price: 45.90 },
];

export const useProductsStore = create<ProductState>()(
  persist(
    (set) => ({
      products: initialProducts,
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'product-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
