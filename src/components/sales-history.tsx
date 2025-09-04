
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, BarChart2, LineChart, PieChart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction } from '@/lib/types';
import PrintReceipt from './print-receipt';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line as RechartsLine, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';


const SalesBarChart = ({ data }: { data: { date: string, Total: number }[] }) => {
    const chartConfig = {
        Total: {
            label: 'Total Vendido (R$)',
            color: 'hsl(var(--primary))',
        },
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => format(parseISO(value), "dd/MM")}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                            labelClassName="font-bold"
                            indicator="dot"
                        />}
                    />
                    <Legend />
                    <Bar dataKey="Total" fill="var(--color-Total)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

const SalesLineChart = ({ data }: { data: { date: string, Total: number }[] }) => {
    const chartConfig = {
        Total: {
            label: 'Total Vendido (R$)',
            color: 'hsl(var(--primary))',
        },
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <RechartsLineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => format(parseISO(value), "dd/MM")}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                            labelClassName="font-bold"
                            indicator="dot"
                        />}
                    />
                    <Legend />
                    <RechartsLine type="monotone" dataKey="Total" stroke="var(--color-Total)" strokeWidth={2} dot={false} />
                </RechartsLineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

const SalesPieChart = ({ data }: { data: { name: string, value: number }[] }) => {
    const chartConfig = {
        Dinheiro: { label: 'Dinheiro', color: "hsl(var(--chart-1))" },
        Cartão: { label: 'Cartão', color: "hsl(var(--chart-2))" },
        PIX: { label: 'PIX', color: "hsl(var(--chart-3))" },
    };

    return (
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <ResponsiveContainer>
                <RechartsPieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value, name) => `R$ ${Number(value).toFixed(2)}`}
                            hideLabel
                        />}
                    />
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {data.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
                        ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </RechartsPieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}


export default function SalesHistory() {
  const { transactions, cashRegisterHistory } = useStore();
  const [dateFilter, setDateFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [transactionToPrint, setTransactionToPrint] = useState<Transaction | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const handlePrint = (tx: Transaction) => {
    setTransactionToPrint(tx);
    setTimeout(() => {
        window.print();
        setTransactionToPrint(null);
    }, 100);
  }
  
  const filteredTransactions = useMemo(() => {
    const lowerCaseOperatorFilter = operatorFilter.toLowerCase();
    return transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const dateMatch = !dateFilter || txDate.toISOString().split('T')[0] === dateFilter;
        const paymentMatch = paymentFilter === 'all' || tx.paymentMethod === paymentFilter;
        const operatorMatch = !operatorFilter || 
                              (tx.operator && tx.operator.toLowerCase().includes(lowerCaseOperatorFilter));
        return dateMatch && paymentMatch && operatorMatch;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateFilter, paymentFilter, operatorFilter]);

  const totalSales = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  }, [filteredTransactions]);

  const salesByDay = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {};
    filteredTransactions.forEach(tx => {
        const date = format(new Date(tx.date), 'yyyy-MM-dd');
        if (dailyTotals[date]) {
            dailyTotals[date] += tx.total;
        } else {
            dailyTotals[date] = tx.total;
        }
    });

    return Object.entries(dailyTotals)
      .map(([date, total]) => ({
        date: date,
        Total: total
      }))
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredTransactions]);

  const salesByPaymentMethod = useMemo(() => {
    const summary: { 'Dinheiro': number, 'Cartão': number, 'PIX': number } = { 'Dinheiro': 0, 'Cartão': 0, 'PIX': 0 };
    filteredTransactions.forEach(tx => {
        summary[tx.paymentMethod] += tx.total;
    });
    return Object.entries(summary)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0);
  }, [filteredTransactions]);
  
  const productSummary = useMemo(() => {
    const summary: { [key: string]: { name: string; quantity: number, unit: string } } = {};
    filteredTransactions.forEach(tx => {
      tx.items.forEach(item => {
        if (summary[item.id]) {
          summary[item.id].quantity += item.quantity;
        } else {
          summary[item.id] = { name: item.name, quantity: item.quantity, unit: item.unit };
        }
      });
    });
    return Object.values(summary).sort((a, b) => b.quantity - a.quantity);
  }, [filteredTransactions]);

  const operatorTimeSummary = useMemo(() => {
    const summary: { [key: string]: { name: string, totalMilliseconds: number } } = {};
    cashRegisterHistory
        .filter(session => session.status === 'fechado' && session.closingTime)
        .forEach(session => {
            const openingTime = new Date(session.openingTime);
            const closingTime = new Date(session.closingTime!);
            const durationMs = closingTime.getTime() - openingTime.getTime();

            if (summary[session.operatorId]) {
                summary[session.operatorId].totalMilliseconds += durationMs;
            } else {
                summary[session.operatorId] = {
                    name: session.operatorName,
                    totalMilliseconds: durationMs,
                }
            }
        });
    
    return Object.values(summary).map(s => ({
        ...s,
        formattedTime: formatDistanceStrict(0, s.totalMilliseconds, { unit: 'minute', locale: ptBR })
    })).sort((a, b) => b.totalMilliseconds - a.totalMilliseconds);
  }, [cashRegisterHistory]);
  
  const renderChart = () => {
    switch(chartType) {
        case 'bar':
            return salesByDay.length > 0 ? <SalesBarChart data={salesByDay} /> : null;
        case 'line':
            return salesByDay.length > 0 ? <SalesLineChart data={salesByDay} /> : null;
        case 'pie':
            return salesByPaymentMethod.length > 0 ? <SalesPieChart data={salesByPaymentMethod} /> : null;
        default:
            return null;
    }
  }


  return (
    <>
    <div className="hidden">
        {transactionToPrint && <PrintReceipt transaction={transactionToPrint} />}
    </div>
    <div className="space-y-8">
        <Card className="bg-yellow-100 text-black font-mono">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-black flex items-center gap-2">
                        {chartType === 'bar' && <BarChart2 />}
                        {chartType === 'line' && <LineChart />}
                        {chartType === 'pie' && <PieChart />}
                        Gráfico de Vendas
                    </CardTitle>
                    <CardDescription className="text-black/80">
                        Visualização do total de vendas.
                    </CardDescription>
                </div>
                <Tabs value={chartType} onValueChange={(value) => setChartType(value as 'bar' | 'line' | 'pie')} className="font-sans">
                    <TabsList>
                        <TabsTrigger value="bar"><BarChart2 className="mr-2" />Barras</TabsTrigger>
                        <TabsTrigger value="line"><LineChart className="mr-2" />Linhas</TabsTrigger>
                        <TabsTrigger value="pie"><PieChart className="mr-2" />Pizza</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent>
                {renderChart() ?? (
                    <div className="text-center p-10 text-black/60">
                        Não há dados suficientes para exibir o gráfico.
                    </div>
                )}
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
                <Card className="bg-yellow-100 text-black font-mono">
                    <CardHeader>
                        <CardTitle className="text-black">Histórico de Vendas</CardTitle>
                        <CardDescription className="text-black/80">
                            Visualize e filtre todas as transações realizadas. Total vendido: <span className="font-bold text-black">R$ {totalSales.toFixed(2)}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-wrap items-center gap-4">
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
                        <Input
                            type="text"
                            placeholder="Filtrar por nome do operador..."
                            value={operatorFilter}
                            onChange={(e) => setOperatorFilter(e.target.value)}
                            className="max-w-sm bg-white/60 border-black/20 focus:bg-white"
                        />
                        </div>

                        <div className="border border-dashed border-black/20 rounded-md text-sm">
                            {/* Header */}
                            <div className="flex p-4 bg-black/5 font-bold border-b border-dashed border-black/20">
                                <div className="w-12 text-center text-black"></div>
                                <div className="flex-1 text-center text-black">Data</div>
                                <div className="flex-1 text-center text-black">Hora</div>
                                <div className="flex-1 text-center text-black">Operador</div>
                                <div className="flex-1 text-center text-black">Pagamento</div>
                                <div className="flex-1 text-right text-black">Total</div>
                                <div className="w-12 text-center text-black"></div>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(tx => {
                                        const txDate = new Date(tx.date);
                                        return (
                                            <AccordionItem value={tx.id} key={tx.id} className="border-b border-dashed border-black/20 last:border-b-0">
                                                <div className="flex items-center p-4 hover:bg-black/5 data-[state=open]:bg-black/10">
                                                    <div className="w-12 text-center">
                                                        <AccordionTrigger className="py-0 hover:no-underline [&[data-state=open]>svg]:text-black justify-center" />
                                                    </div>
                                                    <div className="flex-1 text-center font-medium">{txDate.toLocaleDateString()}</div>
                                                    <div className="flex-1 text-center">{txDate.toLocaleTimeString()}</div>
                                                    <div className="flex-1 text-center">{tx.operatorCod ? `${tx.operatorCod} -` : ''} {tx.operator}</div>
                                                    <div className="flex-1 text-center">
                                                        <Badge variant="outline" className="border-black/50">{tx.paymentMethod}</Badge>
                                                    </div>
                                                    <div className="flex-1 text-right font-bold">R$ {tx.total.toFixed(2)}</div>
                                                    <div className="w-12 text-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-black hover:bg-black/10" onClick={() => handlePrint(tx)}>
                                                            <Printer size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <AccordionContent>
                                                    <div className="p-4 bg-black/5 border-t border-dashed border-black/20">
                                                        <h4 className="font-semibold mb-2">Itens da Venda:</h4>
                                                        <ul className="space-y-1 list-disc list-inside">
                                                            {tx.items.map(item => (
                                                                <li key={item.id}>
                                                                    {item.quantity} {item.unit} - {item.cod} - {item.name} - R$ {(item.price * item.quantity).toFixed(2)}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })
                                ) : (
                                    <div className="text-center p-10">
                                        Nenhuma venda encontrada.
                                    </div>
                                )}
                            </Accordion>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                <Card className="bg-yellow-100 text-black font-mono">
                    <CardHeader>
                        <CardTitle className="text-black">Resumo de Produtos</CardTitle>
                        <CardDescription className="text-black/80">
                            Produtos mais vendidos no período.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-dashed border-black/20 hover:bg-black/5">
                                    <TableHead className="text-black">Produto</TableHead>
                                    <TableHead className="text-right text-black">Qtd. Vendida</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productSummary.length > 0 ? (
                                    productSummary.map(prod => (
                                        <TableRow key={prod.name} className="border-dashed border-black/20 hover:bg-black/5">
                                            <TableCell className="font-medium">{prod.name}</TableCell>
                                            <TableCell className="text-right font-bold">{prod.quantity.toFixed(3)} {prod.unit}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            Nenhum produto vendido no período.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-100 text-black font-mono">
                    <CardHeader>
                        <CardTitle className="text-black">Tempo de Caixa por Operador</CardTitle>
                        <CardDescription className="text-black/80">
                            Tempo total de caixa aberto por operador.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-dashed border-black/20 hover:bg-black/5">
                                    <TableHead className="text-black">Operador</TableHead>
                                    <TableHead className="text-right text-black">Tempo Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {operatorTimeSummary.length > 0 ? (
                                    operatorTimeSummary.map(op => (
                                        <TableRow key={op.name} className="border-dashed border-black/20 hover:bg-black/5">
                                            <TableCell className="font-medium">{op.name}</TableCell>
                                            <TableCell className="text-right font-bold">{op.formattedTime}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            Nenhuma sessão de caixa fechada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
    </>
  );
}
