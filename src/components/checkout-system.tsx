
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { getUpsellSuggestions } from '@/ai/flows/upsell-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { SalesChart } from '@/components/sales-chart';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Lightbulb, PlusCircle, ShoppingCart, Trash2, Loader2, Sparkles, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useProductsStore } from '@/hooks/use-products-store';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type PaymentMethod = 'Dinheiro' | 'Cartão' | 'PIX';

interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  date: Date;
  paymentMethod: PaymentMethod;
}

const TAX_RATE = 0.05; // 5% tax

export function CheckoutSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Dinheiro');
  const { toast } = useToast();
  const { products } = useProductsStore();

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
        toast({
            title: "Nenhum produto selecionado",
            description: "Por favor, selecione um produto da lista.",
            variant: "destructive",
        });
        return;
    }
    
    const productToAdd = products.find(p => p.id === selectedProductId);

    if (!productToAdd) return;


    const existingItem = cart.find(item => item.id === productToAdd.id);

    if (existingItem) {
      setCart(cart.map(item => item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
    setSelectedProductId(undefined);
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
    } else {
      setCart(cart.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho Vazio",
        description: "Não é possível finalizar uma venda vazia.",
        variant: "destructive",
      });
      return;
    }
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      items: cart,
      total,
      date: new Date(),
      paymentMethod,
    };
    setTransactions([newTransaction, ...transactions]);
    setCart([]);
    setSuggestions([]);
    toast({
        title: "Venda Finalizada!",
        description: `Pagamento com ${paymentMethod}. Transação ${newTransaction.id.slice(0, 8)} registrada.`,
    });
  };

  const fetchSuggestions = useCallback(async () => {
    if (cart.length === 0) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const cartItemNames = cart.map(item => item.name);
      const result = await getUpsellSuggestions({ cartItems: cartItemNames });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Falha ao obter sugestões de upsell:", error);
      toast({
        title: "Erro de IA",
        description: "Não foi possível buscar sugestões de upsell.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [cart, toast]);

  const renderPaymentIcon = (method: PaymentMethod) => {
    switch (method) {
        case 'Dinheiro':
            return <Banknote className="h-4 w-4" />;
        case 'Cartão':
            return <CreditCard className="h-4 w-4" />;
        case 'PIX':
            return <QrCode className="h-4 w-4" />;
        default:
            return null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchSuggestions();
    }, 500); // Debounce AI call
    return () => clearTimeout(timer);
  }, [cart, fetchSuggestions]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Point of Sale and Cart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShoppingCart />Ponto de Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-4">
                <label htmlFor="product-select" className="text-sm font-medium">Selecionar Produto</label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder="Escolha um produto para adicionar ao carrinho..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.length > 0 ? (
                      products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - R${product.price.toFixed(2)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-products" disabled>Nenhum produto cadastrado</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 md:col-span-1">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </form>
            <Separator className="my-6" />
            <h3 className="text-lg font-semibold mb-2">Carrinho Atual</h3>
            <div className="max-h-64 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length > 0 ? (
                    cart.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Input type="number" value={item.quantity} onChange={e => updateQuantity(item.id, parseInt(e.target.value, 10))} className="h-8 w-16" min="1"/>
                        </TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">O carrinho está vazio</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-end gap-4 bg-secondary/30 p-4 rounded-b-lg">
            <div className="w-full max-w-xs space-y-1 text-right">
              <p>Subtotal: <span className="font-medium">R${subtotal.toFixed(2)}</span></p>
              <p>Imposto ({(TAX_RATE * 100).toFixed(0)}%): <span className="font-medium">R${tax.toFixed(2)}</span></p>
              <p className="text-xl font-bold">Total: <span className="text-primary">R${total.toFixed(2)}</span></p>
            </div>
            <div className="w-full max-w-xs space-y-3">
                <Label className="font-semibold">Forma de Pagamento</Label>
                <RadioGroup defaultValue="Dinheiro" value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} className="flex justify-around">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Dinheiro" id="r-dinheiro" />
                        <Label htmlFor="r-dinheiro" className="flex items-center gap-2"><Banknote/>Dinheiro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Cartão" id="r-cartao" />
                        <Label htmlFor="r-cartao" className="flex items-center gap-2"><CreditCard/>Cartão</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PIX" id="r-pix" />
                        <Label htmlFor="r-pix" className="flex items-center gap-2"><QrCode/>PIX</Label>
                    </div>
                </RadioGroup>
            </div>
            <Button onClick={handleFinalizeSale} size="lg" className="w-full max-w-xs bg-[hsl(var(--accent))] text-accent-foreground hover:bg-[hsl(var(--accent))]/90">
              <DollarSign className="mr-2 h-5 w-5" /> Finalizar Venda
            </Button>
          </CardFooter>
        </Card>

        {/* Transaction History */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-96 overflow-y-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Hora</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead className="text-center">Qtd. Itens</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                                        <TableCell>{tx.date.toLocaleTimeString()}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {renderPaymentIcon(tx.paymentMethod)}
                                                {tx.paymentMethod}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{tx.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                                        <TableCell className="text-right font-medium">R${tx.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma transação ainda.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        {/* AI Upsell Suggestions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Assistente de Vendas IA</CardTitle>
            <CardDescription>Sugestões baseadas nos itens do carrinho.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[120px]">
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Obtendo sugestões...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-md bg-secondary/50 p-3">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Adicione itens ao carrinho para ver sugestões.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Trends */}
        <SalesChart />
      </div>
    </div>
  );

    