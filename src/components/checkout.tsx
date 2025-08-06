
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function Checkout() {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    finalizeSale
  } = useStore();
  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Cartão' | 'PIX'>('Dinheiro');

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleFinalizeSale = () => {
    finalizeSale(paymentMethod);
  }

  return (
    <div className="grid h-full max-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Product Selection */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Adicionar Produtos ao Carrinho</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-14rem)]">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:shadow-md"
                    onClick={() => addToCart(product)}
                    data-ai-hint="product item"
                  >
                    <div className="text-center">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {product.price.toFixed(2)}
                      </p>
                       <p className="text-xs text-muted-foreground">
                        Estoque: {product.stock}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart /> Carrinho
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[calc(100vh-25rem)]">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                         <Button
                          size="icon"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Seu carrinho está vazio.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          {cart.length > 0 && (
            <CardFooter className="flex-col items-stretch gap-4 !p-6">
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearCart}>Limpar Carrinho</Button>
                </div>
                
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="lg" disabled={cart.length === 0}>Finalizar Venda</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Finalizar Venda</AlertDialogTitle>
                        <AlertDialogDescription>
                            Selecione a forma de pagamento e confirme para concluir a venda.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                             <Select onValueChange={(value: 'Dinheiro' | 'Cartão' | 'PIX') => setPaymentMethod(value)} defaultValue={paymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Forma de Pagamento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                    <SelectItem value="Cartão">Cartão</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalizeSale}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
