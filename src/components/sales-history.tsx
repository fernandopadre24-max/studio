
'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


export default function SalesHistory() {
  const { transactions } = useStore();
  const [dateFilter, setDateFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const dateMatch = !dateFilter || txDate.toISOString().split('T')[0] === dateFilter;
        const paymentMatch = paymentFilter === 'all' || tx.paymentMethod === paymentFilter;
        return dateMatch && paymentMatch;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateFilter, paymentFilter]);

  const totalSales = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  }, [filteredTransactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Vendas</CardTitle>
        <CardDescription>
            Visualize e filtre todas as transações realizadas. Total vendido: <span className="font-bold text-primary">R$ {totalSales.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Forma de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Cartão">Cartão</SelectItem>
              <SelectItem value="PIX">PIX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                  <Accordion type="single" collapsible className="w-full" asChild>
                    <TableBody>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(tx => {
                            const txDate = new Date(tx.date);
                            return (
                            <AccordionItem value={tx.id} key={tx.id} asChild>
                                <>
                                    <TableRow>
                                        <TableCell>
                                            <AccordionTrigger/>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{txDate.toLocaleDateString()}</div>
                                        </TableCell>
                                        <TableCell>{txDate.toLocaleTimeString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{tx.paymentMethod}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">R$ {tx.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={5} className="p-0">
                                            <AccordionContent>
                                                    <div className="p-4 bg-muted/50">
                                                        <h4 className="font-semibold mb-2">Itens da Venda:</h4>
                                                        <ul className="space-y-1 list-disc list-inside">
                                                            {tx.items.map(item => (
                                                                <li key={item.id}>
                                                                    {item.quantity}x {item.name} - R$ {(item.price * item.quantity).toFixed(2)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                            </AccordionContent>
                                        </TableCell>
                                    </TableRow>
                                </>
                            </AccordionItem>
                            )
                        })
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Nenhuma venda encontrada.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Accordion>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}

    