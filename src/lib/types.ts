
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
}

export type EmployeeRole = 'Vendedor' | 'Gerente';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
}
