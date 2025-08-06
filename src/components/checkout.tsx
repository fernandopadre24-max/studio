
'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, DollarSign, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


function ProductSelector() {
    const { products, addToCart } = useStore();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
    }
    
    return (
        <div className='flex flex-col gap-4'>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="pl-8 sm:w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='border rounded-md'>
                <ScrollArea className="h-[200px]">
                    <div className='p-2 space-y-1'>
                    {filteredProducts.map(product => (
                        <Button 
                            key={product.id} 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-2"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0}
                        >
                            <div className='flex flex-col items-start'>
                                <p>{product.name}</p>
                                <p className='text-sm text-muted-foreground'>
                                    R$ {product.price.toFixed(2)} | Estoque: {product.stock}
                                </p>
                            </div>
                        </Button>
                    ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}


export default function Checkout() {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    finalizeSale,
  } = useStore(s => ({
    cart: s.cart,
    removeFromCart: s.removeFromCart,
    updateCartItemQuantity: s.updateCartItemQuantity,
    clearCart: s.clearCart,
    finalizeSale: s.finalizeSale,
  }));

  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Cartão' | 'PIX'>('Dinheiro');
  const [amountPaid, setAmountPaid] = useState(0);

  const subTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const [discount, setDiscount] = useState(0);
  const [addition, setAddition] = useState(0);

  const total = useMemo(() => subTotal - discount + addition, [subTotal, discount, addition]);
  const change = useMemo(() => amountPaid > total ? amountPaid - total : 0, [amountPaid, total]);

  const handleFinalizeSale = () => {
    finalizeSale(paymentMethod, total);
    setDiscount(0);
    setAddition(0);
    setAmountPaid(0);
  }

  return (
    <div className="grid h-full max-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Product Selection & Cart */}
      <div className="lg:col-span-3">
        <div className="grid grid-rows-[auto,1fr] gap-4 h-full">
            <ProductSelector />
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Carrinho</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="border rounded-md">
                  <ScrollArea className="h-[calc(100vh-32rem)]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Qtd.</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.length > 0 ? (
                          cart.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span>{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                              <TableCell>R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                              Seu carrinho está vazio.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={clearCart} disabled={cart.length === 0}>Limpar Carrinho</Button>
              </CardFooter>
            </Card>
        </div>
      </div>

      {/* Payment */}
      <div className="lg:col-span-2">
        <Card className="flex h-full flex-col bg-slate-800 text-white">
          <CardHeader className="bg-slate-900">
            <CardTitle className="flex items-center gap-2">
              <DollarSign /> Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">SUBTOTAL</Label>
                    <p className="text-2xl font-bold">R$ {subTotal.toFixed(2)}</p>
                </div>
                 <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">TOTAL</Label>
                    <p className="text-2xl font-bold text-green-400">R$ {total.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor='addition' className="text-slate-400">Acréscimo (R$)</Label>
                    <Input id="addition" type="number" value={addition} onChange={(e) => setAddition(Math.max(0, parseFloat(e.target.value) || 0))} className="bg-slate-900 border-slate-700" />
                 </div>
                 <div>
                    <Label htmlFor='discount' className="text-slate-400">Desconto (R$)</Label>
                    <Input id="discount" type="number" value={discount} onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} className="bg-slate-900 border-slate-700" />
                 </div>
              </div>

               <div className="bg-red-700 p-3 rounded-md text-white">
                    <Label className="text-red-200 text-xs">SALDO</Label>
                    <p className="text-2xl font-bold">R$ {(total - amountPaid > 0 ? total - amountPaid : 0).toFixed(2)}</p>
                </div>
                
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">VALOR RECEBIDO</Label>
                    <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))} className="bg-slate-900 border-slate-700 text-2xl font-bold p-0 border-0 h-auto" />
                </div>
                 <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">TROCO</Label>
                    <p className="text-2xl font-bold">R$ {change.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-slate-400">Forma de Pagamento</Label>
                <Select onValueChange={(value: 'Dinheiro' | 'Cartão' | 'PIX') => setPaymentMethod(value)} defaultValue={paymentMethod}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                        <SelectValue placeholder="Forma de Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                    </SelectContent>
                </Select>
              </div>

          </CardContent>
          <CardFooter className="!p-4">
                <Button size="lg" disabled={cart.length === 0 || total <= 0 || amountPaid < total} onClick={handleFinalizeSale} className="w-full h-16 text-xl bg-green-600 hover:bg-green-700">
                    Finalizar Venda
                </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
