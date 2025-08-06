'use client';

import { useState } from 'react';
import { CheckoutSystem } from '@/components/checkout-system';
import { Logo } from '@/components/logo';
import { ProductManager } from '@/components/product-manager';
import { SalesChart } from '@/components/sales-chart';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type View = 'checkout' | 'products' | 'reports';

export default function Home() {
  const [activeView, setActiveView] = useState<View>('checkout');

  const renderContent = () => {
    switch (activeView) {
      case 'checkout':
        return <CheckoutSystem />;
      case 'products':
        return <ProductManager />;
      case 'reports':
        return (
            <div className="p-4 md:p-6">
                <h2 className="text-3xl font-bold mb-6">Relatório de Vendas</h2>
                <div className="max-w-4xl mx-auto">
                    <SalesChart />
                </div>
            </div>
        );
      default:
        return <CheckoutSystem />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('checkout')} isActive={activeView === 'checkout'} tooltip="Caixa">
                <ShoppingCart />
                Caixa
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('products')} isActive={activeView === 'products'} tooltip="Produtos">
                <Package />
                Produtos
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setActiveView('reports')} isActive={activeView === 'reports'} tooltip="Relatórios">
                <TrendingUp />
                Relatórios
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-bold">
                {activeView === 'checkout' && 'Caixa'}
                {activeView === 'products' && 'Gerenciador de Produtos'}
                {activeView === 'reports' && 'Relatórios'}
              </h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto flex-1 p-4 md:p-6">
          {renderContent()}
        </main>
      </SidebarInset>
    </div>
  );
}
