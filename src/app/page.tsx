
'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart, Users, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Checkout from '@/components/checkout';
import ProductList from '@/components/product-list';
import SalesHistory from '@/components/sales-history';
import EmployeeList from '@/components/employee-list';
import type { Employee } from '@/lib/types';

type NavItem = 'Caixa' | 'Produtos' | 'Relatórios' | 'Funcionários';

function UserSelectionScreen() {
    const { employees, setCurrentUser } = useStore();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Bem-vindo ao PDV</CardTitle>
                    <CardDescription>Selecione seu usuário para começar</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {employees.map(employee => (
                        <Button
                            key={employee.id}
                            variant="outline"
                            className="justify-start gap-3 p-6"
                            onClick={() => setCurrentUser(employee)}
                        >
                            <User className="h-5 w-5" />
                            <div className="text-left">
                                <div>{employee.name}</div>
                                <div className="text-xs text-muted-foreground">{employee.role}</div>
                            </div>
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Home() {
  const { currentUser, setCurrentUser, clearCart } = useStore();
  const [activeNav, setActiveNav] = useState<NavItem>('Caixa');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    // Reset to 'Caixa' if user has permission, otherwise to 'Produtos'
    if (currentUser?.role === 'Vendedor' || currentUser?.role === 'Gerente') {
      setActiveNav('Caixa');
    } else {
      setActiveNav('Produtos');
    }
  }, [currentUser]);

  const handleLogout = () => {
    clearCart();
    setCurrentUser(null);
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'Caixa':
        return <Checkout />;
      case 'Produtos':
        return <ProductList />;
      case 'Relatórios':
        return <SalesHistory />;
      case 'Funcionários':
        return <EmployeeList />;
      default:
        return null;
    }
  };
  
  const hasCashierAccess = currentUser?.role === 'Vendedor' || currentUser?.role === 'Gerente';

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-2xl font-semibold">Carregando...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <UserSelectionScreen />;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex justify-between">
        <div>
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
              disabled={!hasCashierAccess}
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
            <NavItemButton
              label="Funcionários"
              icon={Users}
              isActive={activeNav === 'Funcionários'}
              onClick={() => setActiveNav('Funcionários')}
              disabled={currentUser.role !== 'Gerente'}
            />
          </nav>
        </div>
        <div className='space-y-2'>
            <div className='p-3 rounded-md bg-secondary text-secondary-foreground text-sm'>
                <p className='font-bold'>{currentUser.name}</p>
                <p className='text-xs'>{currentUser.role}</p>
            </div>
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Trocar Usuário
            </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
          {activeNav === 'Caixa' && !hasCashierAccess 
              ? <div className='text-center text-lg text-muted-foreground'>Você não tem permissão para acessar o caixa.</div>
              : renderContent()}
      </main>
    </div>
  );
}

interface NavItemButtonProps {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}

function NavItemButton({ label, icon: Icon, isActive, onClick, disabled }: NavItemButtonProps) {
    return (
        <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className="justify-start gap-3 px-3"
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Button>
    )
}
