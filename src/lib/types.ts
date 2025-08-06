
export interface Product {
  id: string;
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
  date: Date;
}
