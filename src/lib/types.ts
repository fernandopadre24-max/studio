

export type ProductUnit = 'UN' | 'KG' | 'G' | 'CX';

export interface Product {
  id: string;
  cod: string;
  name: string;
  price: number;
  stock: number;
  unit: ProductUnit;
  supplierId?: string;
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
  operatorCod?: string;
  cashRegisterSessionId?: string;
}

export interface Role {
    id: string;
    name: string;
    prefix: string;
}

export interface Employee {
  id: string;
  cod: string;
  name: string;
  roleId: string;
  password?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  address?: string;
  admissionDate?: string;
  salary?: number;
}

export interface Supplier {
    id: string;
    cod: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
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
