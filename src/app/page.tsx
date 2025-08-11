
'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart, Users, LogOut, User, Settings, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Checkout from '@/components/checkout';
import ProductList from '@/components/product-list';
import SalesHistory from '@/components/sales-history';
import EmployeeList from '@/components/employee-list';
import SupplierList from '@/components/supplier-list';
import SettingsPage from '@/components/settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type NavItem = 'Caixa' | 'Produtos' | 'Fornecedores' | 'Relatórios' | 'Funcionários' | 'Configurações';

function LoginScreen() {
    const { login } = useStore();
    const { toast } = useToast();
    const [userCode, setUserCode] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(userCode, password);
        if (!success) {
            toast({
                variant: 'destructive',
                title: 'Erro de Login',
                description: 'Código de usuário ou senha incorretos.',
            });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Bem-vindo ao PDV</CardTitle>
                        <CardDescription>Faça login para começar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userCode">Código do Usuário</Label>
                            <Input
                                id="userCode"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                required
                                placeholder="ex: ADM-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

export default function Home() {
  const { currentUser, logout, clearCart } = useStore();
  const [activeNav, setActiveNav] = useState<NavItem>('Caixa');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!currentUser) return;
    // Reset to 'Caixa' if user has permission, otherwise to 'Produtos'
    if (currentUser.roleName === 'Vendedor' || currentUser.roleName === 'Gerente' || currentUser.roleName === 'Caixa' || currentUser.roleName === 'Supervisor' || currentUser.roleName === 'Administrador') {
      setActiveNav('Caixa');
    } else {
      setActiveNav('Produtos');
    }
  }, [currentUser]);

  const handleLogout = () => {
    clearCart();
    logout();
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'Caixa':
        return <Checkout />;
      case 'Produtos':
        return <ProductList />;
      case 'Fornecedores':
        return <SupplierList />;
      case 'Relatórios':
        return <SalesHistory />;
      case 'Funcionários':
        return <EmployeeList />;
      case 'Configurações':
        return <SettingsPage />;
      default:
        return null;
    }
  };
  
  const hasCashierAccess = currentUser?.roleName === 'Vendedor' || currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Caixa' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';
  const hasEmployeeAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';
  const hasSettingsAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Administrador';
  const hasSupplierAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Estoquista' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';


  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-2xl font-semibold">Carregando...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background p-4 sm:flex justify-between">
        <div>
          <div className="mb-8 flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">PDV</h1>
          </div>
          <nav className="flex flex-col gap-4">
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
              label="Fornecedores"
              icon={Truck}
              isActive={activeNav === 'Fornecedores'}
              onClick={() => setActiveNav('Fornecedores')}
              disabled={!hasSupplierAccess}
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
              disabled={!hasEmployeeAccess}
            />
            <NavItemButton
              label="Configurações"
              icon={Settings}
              isActive={activeNav === 'Configurações'}
              onClick={() => setActiveNav('Configurações')}
              disabled={!hasSettingsAccess}
            />
          </nav>
        </div>
        <div className='space-y-2'>
            <div className='p-3 rounded-md bg-secondary text-secondary-foreground text-sm'>
                <p className='font-bold'>{currentUser.cod} - {currentUser.name}</p>
                <p className='text-xs'>{currentUser.roleName}</p>
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
            variant="ghost"
            className={cn(
                "justify-start gap-3 px-4 py-6 text-base font-normal rounded-xl transition-all duration-200 ease-in-out",
                "text-muted-foreground hover:text-foreground",
                "shadow-[5px_5px_10px_#e0e0e0,-5px_-5px_10px_#ffffff]",
                "dark:shadow-[5px_5px_10px_#1a1a1a,-5px_-5px_10px_#2a2a2a]",
                "hover:shadow-[inset_5px_5px_10px_#e0e0e0,inset_-5px_-5px_10px_#ffffff]",
                "dark:hover:shadow-[inset_5px_5px_10px_#1a1a1a,inset_-5px_-5px_10px_#2a2a2a]",
                {
                    "bg-background text-foreground shadow-[inset_5px_5px_10px_#e0e0e0,inset_-5px_-5px_10px_#ffffff] dark:shadow-[inset_5px_5px_10px_#1a1a1a,inset_-5px_-5px_10px_#2a2a2a]": isActive,
                    "bg-muted/40": !isActive
                }
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Button>
    )
}
