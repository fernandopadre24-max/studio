
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentMethod = 'Dinheiro' | 'Cartão' | 'PIX';

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: PaymentMethod;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
}

export const useTransactionsStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          // Add new transaction to the beginning of the array
          transactions: [transaction, ...state.transactions],
        })),
    }),
    {
      name: 'transaction-storage',
      storage: createJSONStorage(() => localStorage),
       // Custom reviver to restore Date objects
      reviver: (key, value) => {
        if (key === 'transactions' && Array.isArray(value)) {
          return value.map(tx => ({...tx, date: new Date(tx.date)}));
        }
        return value;
      },
    }
  )
);
