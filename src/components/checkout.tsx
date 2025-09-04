
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Product, CashRegisterSession, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, DollarSign, Search, ShoppingCart, Lock, Unlock, XCircle, QrCode, Camera, CheckCircle, Printer } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import CameraScanner from './camera-scanner';
import PrintReceipt from './print-receipt';

function ProductSelector() {
    const { products, addToCart, findProductByCode } = useStore();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [weightProduct, setWeightProduct] = useState<Product | null>(null);
    const [weight, setWeight] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            p.cod.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [products, searchTerm]);

    const handleProductClick = (product: Product) => {
        if (product.unit === 'KG' || product.unit === 'G') {
            setWeightProduct(product);
        } else {
            addToCart(product);
            toast({
                title: "Produto adicionado",
                description: `${product.name} foi adicionado ao carrinho.`,
            })
        }
    }
    
    const handleAddWeightProduct = () => {
        if (weightProduct && weight) {
            const quantity = parseFloat(weight);
            if (quantity > 0) {
                addToCart(weightProduct, quantity);
                toast({
                    title: "Produto adicionado",
                    description: `${quantity}${weightProduct.unit} de ${weightProduct.name} adicionado ao carrinho.`,
                });
                setWeightProduct(null);
                setWeight('');
            }
        }
    }
    
    const handleScan = (code: string | null) => {
        if (code) {
            setScannerOpen(false);
            const product = findProductByCode(code);
            if (product) {
                handleProductClick(product);
            } else {
                toast({
                    variant: "destructive",
                    title: "Produto não encontrado",
                    description: `Nenhum produto encontrado com o código ${code}.`,
                });
            }
        }
    };

    return (
        <div className='flex flex-col gap-4'>
            <Dialog open={!!weightProduct} onOpenChange={() => setWeightProduct(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pesar Produto</DialogTitle>
                        <DialogDescription>Insira o peso para {weightProduct?.name} ({weightProduct?.unit})</DialogDescription>
                    </DialogHeader>
                    <div className='space-y-2'>
                        <Label htmlFor='weight'>Peso ({weightProduct?.unit})</Label>
                        <Input 
                            id="weight"
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder='0.000'
                        />
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setWeightProduct(null)}>Cancelar</Button>
                         <Button onClick={handleAddWeightProduct}>Adicionar ao Carrinho</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou código..."
                        className="pl-8 sm:w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10">
                            <Camera className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Escanear Código de Barras</DialogTitle>
                            <DialogDescription>Aponte a câmera para o código de barras do produto.</DialogDescription>
                        </DialogHeader>
                        <CameraScanner onScan={handleScan} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className='border rounded-md'>
                <ScrollArea className="h-[200px]">
                    <div className='p-2 space-y-1'>
                    {filteredProducts.map(product => (
                        <Button 
                            key={product.id} 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-2"
                            onClick={() => handleProductClick(product)}
                            disabled={product.stock <= 0}
                        >
                            <div className='flex flex-col items-start'>
                                <p>{product.cod} - {product.name}</p>
                                <p className='text-sm text-muted-foreground'>
                                    R$ {product.price.toFixed(2)} / {product.unit} | Estoque: {product.stock}
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

function OpenCashRegisterForm({ onOpen }: { onOpen: (balance: number) => void }) {
    const [openingBalance, setOpeningBalance] = useState('300');
    const { currentUser } = useStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const balance = parseFloat(openingBalance);
        if (!isNaN(balance)) {
            onOpen(balance);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p>
                Operador: <span className="font-semibold">{currentUser?.name.split(' ')[0]}</span>
            </p>
            <div>
                <Label htmlFor="openingBalance">Valor de Abertura (R$)</Label>
                <Input
                    id="openingBalance"
                    type="number"
                    step="0.01"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    required
                    placeholder="Fundo de troco"
                    autoFocus
                />
            </div>
            <DialogFooter>
                <Button type="submit">Abrir Caixa</Button>
            </DialogFooter>
        </form>
    )
}

function CloseCashRegisterDialog({ session, onClose }: { session: CashRegisterSession, onClose: () => void }) {
    const salesByPaymentMethod = useMemo(() => {
        const summary = { 'Dinheiro': 0, 'Cartão': 0, 'PIX': 0 };
        session.transactions.forEach(tx => {
            summary[tx.paymentMethod] += tx.total;
        });
        return summary;
    }, [session]);

    const totalSales = salesByPaymentMethod.Dinheiro + salesByPaymentMethod.Cartão + salesByPaymentMethod.PIX;
    const expectedClosingBalance = session.openingBalance + salesByPaymentMethod.Dinheiro;

    return (
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Fechar o Caixa</DialogTitle>
                <DialogDescription>
                    Confira os valores e confirme o fechamento do caixa.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Resumo da Sessão</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p>Operador: <span className="font-semibold">{session.operatorName.split(' ')[0]}</span></p>
                        <p>Abertura: <span className="font-semibold">{new Date(session.openingTime).toLocaleString()}</span></p>
                        <p>Saldo Inicial: <span className="font-semibold text-blue-600">R$ {session.openingBalance.toFixed(2)}</span></p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Resumo de Vendas</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p>Vendas em Dinheiro: <span className="font-semibold">R$ {salesByPaymentMethod.Dinheiro.toFixed(2)}</span></p>
                        <p>Vendas em Cartão: <span className="font-semibold">R$ {salesByPaymentMethod.Cartão.toFixed(2)}</span></p>
                        <p>Vendas em PIX: <span className="font-semibold">R$ {salesByPaymentMethod.PIX.toFixed(2)}</span></p>
                        <hr/>
                        <p className="text-lg">Total de Vendas: <span className="font-bold">R$ {totalSales.toFixed(2)}</span></p>
                    </CardContent>
                </Card>
                 <Card className="bg-green-100 dark:bg-green-900">
                    <CardHeader><CardTitle>Fechamento</CardTitle></CardHeader>
                    <CardContent>
                       <p className="text-xl">Valor esperado em caixa: <span className="font-bold text-green-700 dark:text-green-400">R$ {expectedClosingBalance.toFixed(2)}</span></p>
                        <p className="text-sm text-muted-foreground">(Saldo Inicial + Vendas em Dinheiro)</p>
                    </CardContent>
                </Card>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={onClose}>Confirmar Fechamento</Button>
            </DialogFooter>
        </DialogContent>
    )
}

function PixScannerDialog({ onScan }: { onScan: (data: string | null) => void }) {
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Escanear QR Code PIX</DialogTitle>
                <DialogDescription>Aponte a câmera para o QR Code do cliente.</DialogDescription>
            </DialogHeader>
            <CameraScanner onScan={onScan} />
        </DialogContent>
    )
}

function SaleSuccessDialog({ transaction, open, onOpenChange }: { transaction: Transaction, open: boolean, onOpenChange: (open: boolean) => void }) {
    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex justify-center">
                       <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <DialogTitle className="text-center text-2xl">Venda Finalizada!</DialogTitle>
                    <DialogDescription className="text-center">
                        Venda no valor de R$ {transaction.total.toFixed(2)} finalizada com sucesso.
                    </DialogDescription>
                </DialogHeader>
                <div className="hidden">
                   <PrintReceipt transaction={transaction} />
                </div>
                <DialogFooter className="sm:justify-center pt-4">
                    <Button type="button" variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/>Imprimir Recibo</Button>
                    <DialogClose asChild>
                        <Button type="button">Nova Venda</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function Checkout() {
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    finalizeSale,
    currentCashRegister,
    openCashRegister,
    closeCashRegister,
    currentUser,
    lastTransaction,
    setLastTransaction
  } = useStore(s => s);

  const [paymentMethod, setPaymentMethod] = useState<'Dinheiro' | 'Cartão' | 'PIX'>('Dinheiro');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [addition, setAddition] = useState(0);
  const [isPixScannerOpen, setPixScannerOpen] = useState(false);
  const [isCloseDialog, setCloseDialog] = useState(false);
  
  const subTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
  const total = useMemo(() => subTotal - discount + addition, [subTotal, discount, addition]);
  const amountPaidValue = parseFloat(amountPaid) || 0;
  const change = useMemo(() => paymentMethod === 'Dinheiro' && amountPaidValue > total ? amountPaidValue - total : 0, [paymentMethod, amountPaidValue, total]);

  const handleFinalizeSale = (pixData?: string) => {
    const transaction = finalizeSale(paymentMethod, total);
    if(transaction) {
        setDiscount(0);
        setAddition(0);
        setAmountPaid('');
    }
  }
  
  const totalItems = useMemo(() => cart.length, [cart]);
  const totalQuantity = useMemo(() => cart.reduce((total, item) => total + item.quantity, 0), [cart]);
  
  const canFinalize = useMemo(() => {
    if (cart.length === 0 || total <= 0) return false;
    if (paymentMethod === 'Dinheiro') {
      return amountPaidValue >= total;
    }
    return true;
  }, [cart, total, paymentMethod, amountPaidValue]);

  useEffect(() => {
    if (paymentMethod !== 'Dinheiro') {
      setAmountPaid(total.toFixed(2));
    } else {
      setAmountPaid('');
    }
  }, [paymentMethod, total]);

  const handlePixScan = (data: string | null) => {
    setPixScannerOpen(false);
    if (data) {
        handleFinalizeSale(data);
    }
  }

  if (!currentCashRegister || currentCashRegister.status === 'fechado') {
        return (
            <Dialog open={true} onOpenChange={() => {}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Lock /> Caixa Fechado</DialogTitle>
                        <DialogDescription>
                            Para iniciar as vendas, você precisa abrir o caixa.
                        </DialogDescription>
                    </DialogHeader>
                    <OpenCashRegisterForm onOpen={openCashRegister} />
                </DialogContent>
            </Dialog>
        );
    }

  return (
    <>
    {lastTransaction && (
        <SaleSuccessDialog 
            transaction={lastTransaction} 
            open={!!lastTransaction} 
            onOpenChange={() => setLastTransaction(null)} 
        />
    )}
    <div className="grid h-full max-h-[calc(100vh-4rem)] grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Product Selection & Cart */}
      <div className="lg:col-span-3">
        <div className="grid grid-rows-[auto,1fr] gap-4 h-full">
            <ProductSelector />
            <Card className="h-full flex flex-col bg-yellow-100 text-black font-mono">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-black">
                    <div className="flex items-center gap-2">
                        <ShoppingCart />
                        Cupom Fiscal
                    </div>
                     <Dialog open={isCloseDialog} onOpenChange={setCloseDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="font-sans"
                                disabled={ (currentUser?.roleName !== 'Gerente' && currentUser?.roleName !== 'Vendedor' && currentUser?.roleName !== 'Caixa' && currentUser?.roleName !== 'Supervisor' && currentUser?.roleName !== 'Administrador' ) || cart.length > 0}>
                                <XCircle className="mr-2 h-4 w-4" /> Fechar Caixa
                            </Button>
                        </DialogTrigger>
                        {currentCashRegister && <CloseCashRegisterDialog session={currentCashRegister} onClose={() => { closeCashRegister(); setCloseDialog(false); }} />}
                    </Dialog>
                </CardTitle>
                 <CardDescription className="text-black/80 flex items-center gap-2 pt-2">
                    <Unlock size={16} /> Caixa Aberto por: <span className="font-semibold text-black">{currentCashRegister.operatorName.split(' ')[0]}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="border-t border-b border-dashed border-black/20">
                  <ScrollArea className="h-[calc(100vh-38rem)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-dashed border-black/20">
                          <TableHead className="text-black">Item</TableHead>
                          <TableHead className="text-black">Qtd</TableHead>
                          <TableHead className="text-black">Vl. Unit.</TableHead>
                          <TableHead className="text-black">Vl. Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.length > 0 ? (
                          cart.map((item) => (
                            <TableRow key={item.id} className="border-dashed border-black/20">
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                   { item.unit === 'UN' || item.unit === 'CX' ? (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6 bg-transparent border-black/20 hover:bg-black/10"
                                            onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span>{item.quantity}</span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6 bg-transparent border-black/20 hover:bg-black/10"
                                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </>
                                   ) : (
                                    <span>{item.quantity.toFixed(3)} {item.unit}</span>
                                   )}
                                </div>
                              </TableCell>
                              <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                              <TableCell>R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-700 hover:text-red-800 hover:bg-black/10"
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
              <CardFooter className="flex-col items-start p-4 border-t border-dashed border-black/20 space-y-2">
                <div className="w-full flex justify-between font-bold">
                    <span>Nº DE ITENS: {totalItems}</span>
                    <span>QUANTIDADES: {totalQuantity.toFixed(3)}</span>
                </div>
                <Button variant="outline" size="sm" onClick={clearCart} disabled={cart.length === 0} className="w-full bg-transparent border-black/20 hover:bg-black/10">Limpar Carrinho</Button>
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
                    <Label className="text-red-200 text-xs">A PAGAR</Label>
                    <p className="text-2xl font-bold">R$ {(total - (paymentMethod === 'Dinheiro' ? amountPaidValue : total) > 0 ? total - (paymentMethod === 'Dinheiro' ? amountPaidValue : total) : 0).toFixed(2)}</p>
                </div>
                
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">VALOR RECEBIDO</Label>
                    <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" className="bg-slate-900 border-slate-700 text-2xl font-bold p-0 border-0 h-auto" disabled={paymentMethod !== 'Dinheiro'} />
                </div>
                 <div className="bg-slate-700 p-3 rounded-md">
                    <Label className="text-slate-400 text-xs">TROCO</Label>
                    <p className="text-2xl font-bold">R$ {change.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-slate-400">Forma de Pagamento</Label>
                <div className="flex gap-2">
                    <Select onValueChange={(value: 'Dinheiro' | 'Cartão' | 'PIX') => setPaymentMethod(value)} defaultValue={paymentMethod}>
                        <SelectTrigger className="bg-slate-900 border-slate-700 flex-1">
                            <SelectValue placeholder="Forma de Pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="Cartão">Cartão</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                        </SelectContent>
                    </Select>
                    {paymentMethod === 'PIX' && (
                        <Dialog open={isPixScannerOpen} onOpenChange={setPixScannerOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="outline" className="bg-slate-900 border-slate-700 hover:bg-slate-800">
                                    <QrCode className="mr-2 h-4 w-4" /> Escanear QR Code
                                </Button>
                            </DialogTrigger>
                            <PixScannerDialog onScan={handlePixScan} />
                        </Dialog>
                    )}
                </div>
              </div>

          </CardContent>
          <CardFooter className="!p-4">
                <Button size="lg" disabled={!canFinalize} onClick={() => handleFinalizeSale()} className="w-full h-16 text-xl bg-green-600 hover:bg-green-700">
                    Finalizar Venda
                </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    </>
  );
}

    

    
