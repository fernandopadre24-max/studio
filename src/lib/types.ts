
export interface Product {
  id: string;
  cod: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'Dinheiro' | 'Cartão' | 'PIX';
  date: string;
  operator: string;
  cashRegisterSessionId?: string;
}

export type EmployeeRole = 'Vendedor' | 'Gerente' | 'Estoquista';

export interface Employee {
  id: string;
  cod: string;
  name: string;
  role: EmployeeRole;
}

export type CashRegisterStatus = 'aberto' | 'fechado';

export interface CashRegisterSession {
  id: string;
  openingTime: string;
  closingTime?: string;
  openingBalance: number;
  closingBalance?: number;
  operatorId: string;
  operatorName: string;
  status: CashRegisterStatus;
  transactions: Transaction[];
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
}

export type FontFamily = 'font-inter' | 'font-space-mono' | 'font-roboto-mono' | 'font-inconsolata';

export interface ThemeSettings {
    primaryColor: HSLColor;
    fontFamily: FontFamily;
}
