'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

const chartData = [
  { category: 'Hortifrúti', sales: 4560 },
  { category: 'Laticínios', sales: 3210 },
  { category: 'Padaria', sales: 2180 },
  { category: 'Carnes', sales: 3790 },
  { category: 'Mercearia', sales: 5120 },
  { category: 'Congelados', sales: 1890 },
];

const chartConfig = {
  sales: {
    label: 'Vendas',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function SalesChart() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Tendências de Vendas por Categoria
        </CardTitle>
        <CardDescription>Dados fictícios mostrando vendas por categoria nos últimos 30 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis 
                tickFormatter={(value) => `R$${Number(value) / 1000}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
