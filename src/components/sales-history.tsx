
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
    <Card className="bg-yellow-100 text-black font-mono">
      <CardHeader>
        <CardTitle className="text-black">Histórico de Vendas</CardTitle>
        <CardDescription className="text-black/80">
            Visualize e filtre todas as transações realizadas. Total vendido: <span className="font-bold text-black">R$ {totalSales.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-sm bg-white/60 border-black/20 focus:bg-white"
          />
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-[180px] bg-white/60 border-black/20 focus:bg-white">
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

        <div className="border border-dashed border-black/20 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow className="border-dashed border-black/20 hover:bg-black/5">
                    <TableHead className="w-12 text-black"></TableHead>
                    <TableHead className="text-center text-black">Data</TableHead>
                    <TableHead className="text-center text-black">Hora</TableHead>
                    <TableHead className="text-center text-black">Pagamento</TableHead>
                    <TableHead className="text-right text-black">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(tx => {
                        const txDate = new Date(tx.date);
                        return (
                        <Accordion type="single" collapsible className="w-full" asChild key={tx.id}>
                            <AccordionItem value={tx.id} className="border-b-0">
                                <TableRow className="border-dashed border-black/20 hover:bg-black/5">
                                    <TableCell className="p-0 pl-4">
                                        <AccordionTrigger className="py-2 hover:no-underline [&[data-state=open]>svg]:text-black">
                                            <span className="sr-only">Ver detalhes</span>
                                        </AccordionTrigger>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="font-medium">{txDate.toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{txDate.toLocaleTimeString()}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="border-black/50">{tx.paymentMethod}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">R$ {tx.total.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow className="hover:bg-black/5">
                                    <TableCell colSpan={5} className="p-0">
                                        <AccordionContent>
                                                <div className="p-4 bg-black/5">
                                                    <h4 className="font-semibold mb-2">Itens da Venda:</h4>
                                                    <ul className="space-y-1 list-disc list-inside">
                                                        {tx.items.map(item => (
                                                            <li key={item.id}>
                                                                {item.quantity}x {item.cod} - {item.name} - R$ {(item.price * item.quantity).toFixed(2)}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                        </AccordionContent>
                                    </TableCell>
                                </TableRow>
                            </AccordionItem>
                        </Accordion>
                        )
                    })
                ) : (
                    <TableRow className="hover:bg-black/5">
                    <TableCell colSpan={5} className="h-24 text-center">
                        Nenhuma venda encontrada.
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
