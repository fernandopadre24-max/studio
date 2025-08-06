
'use client';

import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, CreditCard, Banknote, QrCode } from 'lucide-react';

import { useTransactionsStore, Transaction, PaymentMethod } from '@/hooks/use-transactions-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function SalesHistory() {
  const { transactions } = useTransactionsStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'Todos'>('Todos');

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        if (paymentFilter !== 'Todos' && tx.paymentMethod !== paymentFilter) {
          return false;
        }
        if (dateRange?.from && new Date(tx.date) < dateRange.from) {
          return false;
        }
        if (dateRange?.to && new Date(tx.date) > addDays(dateRange.to, 1)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateRange, paymentFilter]);

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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Histórico de Vendas</CardTitle>
        <CardDescription>Visualize e filtre todas as transações de vendas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 rounded-md border p-4">
          <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold"><Filter className="h-5 w-5" />Filtros</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateRange && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Escolha um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentMethod | 'Todos')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um método" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Todos">Todos</SelectItem>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                    </SelectContent>
                </Select>
              </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary">
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-center">Qtd. Itens</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => (
                    <Accordion type="single" collapsible className="w-full" asChild>
                        <AccordionItem value={tx.id} asChild>
                           <>
                            <TableRow key={tx.id}>
                                <TableCell>
                                    <div className="font-medium">{new Date(tx.date).toLocaleDateString()}</div>
                                    <div className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleTimeString()}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {renderPaymentIcon(tx.paymentMethod)}
                                        {tx.paymentMethod}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{tx.items.reduce((acc, item) => acc + item.quantity, 0)}</TableCell>
                                <TableCell className="text-right font-medium">R${tx.total.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    <AccordionTrigger asChild>
                                        <Button variant="ghost" size="sm">Ver Itens</Button>
                                    </AccordionTrigger>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                    <AccordionContent>
                                        <div className="bg-muted/50 p-4">
                                            <h5 className="font-semibold mb-2">Itens na Venda:</h5>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {tx.items.map(item => (
                                                    <li key={item.id}>
                                                        {item.name} ({item.quantity}x) - R${(item.price * item.quantity).toFixed(2)}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </TableCell>
                            </TableRow>
                           </>
                        </AccordionItem>
                    </Accordion>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma venda encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
