
'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Checkout from '@/components/checkout';
import ProductList from '@/components/product-list';
import SalesHistory from '@/components/sales-history';

type NavItem = 'Caixa' | 'Produtos' | 'Relatórios';

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavItem>('Caixa');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderContent = () => {
    switch (activeNav) {
      case 'Caixa':
        return <Checkout />;
      case 'Produtos':
        return <ProductList />;
      case 'Relatórios':
        return <SalesHistory />;
      default:
        return null;
    }
  };

  if (!isClient) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-2xl font-semibold">Carregando...</div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex">
        <div className="mb-8 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">PDV</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItemButton
            label="Caixa"
            icon={LayoutDashboard}
            isActive={activeNav === 'Caixa'}
            onClick={() => setActiveNav('Caixa')}
          />
          <NavItemButton
            label="Produtos"
            icon={Package}
            isActive={activeNav === 'Produtos'}
            onClick={() => setActiveNav('Produtos')}
          />
          <NavItemButton
            label="Relatórios"
            icon={BarChart}
            isActive={activeNav === 'Relatórios'}
            onClick={() => setActiveNav('Relatórios')}
          />
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
          {renderContent()}
      </main>
    </div>
  );
}

interface NavItemButtonProps {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}

function NavItemButton({ label, icon: Icon, isActive, onClick }: NavItemButtonProps) {
    return (
        <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className="justify-start gap-3 px-3"
            onClick={onClick}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Button>
    )
}
