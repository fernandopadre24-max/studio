
'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Package, BarChart, Users, Settings, UserCheck, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Checkout from '@/components/checkout';
import SalesHistory from '@/components/sales-history';
import EmployeeList from '@/components/employee-list';
import SettingsPage from '@/components/settings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/lib/types';
import ProductsAndSuppliers from '@/components/products-and-suppliers';


function UserSelectionScreen() {
    const { employees, login, getRoleName } = useStore();
    const { toast } = useToast();
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [password, setPassword] = useState('');
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const handleEmployeeSelect = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsPasswordDialogOpen(true);
    };

    const handleLogin = () => {
        if (!selectedEmployee) return;

        if (login(selectedEmployee.cod, password)) {
             toast({
                title: `Bem-vindo, ${selectedEmployee.name.split(' ')[0]}!`,
                description: "Login realizado com sucesso.",
            });
            setIsPasswordDialogOpen(false);
            setPassword('');
            setSelectedEmployee(null);
        } else {
            toast({
                variant: 'destructive',
                title: 'Senha incorreta',
                description: 'A senha que você inseriu está incorreta. Tente novamente.',
            });
            setPassword('');
        }
    };

    const handleDialogClose = () => {
        setIsPasswordDialogOpen(false);
        setPassword('');
        setSelectedEmployee(null);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCheck /> Selecionar Usuário</CardTitle>
                    <CardDescription>Clique no seu nome para acessar o sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72">
                        <div className="space-y-2">
                            {employees.map((employee) => (
                                <Button
                                    key={employee.id}
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3"
                                    onClick={() => handleEmployeeSelect(employee)}
                                >
                                    <div className="flex flex-col items-start">
                                        <p className="font-bold">{employee.name}</p>
                                        <p className="text-sm text-muted-foreground">{getRoleName(employee.roleId)}</p>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><KeyRound /> Inserir Senha</DialogTitle>
                        <DialogDescription>
                            Olá, <span className="font-bold">{selectedEmployee?.name}</span>. Por favor, insira sua senha para continuar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleDialogClose}>Cancelar</Button>
                        <Button type="button" onClick={handleLogin}>Entrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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

    const isAdminOrManager = currentUser.roleName === 'Gerente' || currentUser.roleName === 'Administrador';

    if (isAdminOrManager) {
        setActiveNav('Caixa');
    } else if (currentUser.roleName === 'Vendedor' || currentUser.roleName === 'Caixa' || currentUser.roleName === 'Supervisor') {
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
        return <ProductsAndSuppliers />;
      case 'Relatórios':
        return <SalesHistory />;
      case 'Funcionários':
        return <EmployeeList />;
      case 'Configurações':
        return <SettingsPage />;
      default:
        return <div className="text-center text-lg text-muted-foreground">Selecione uma opção no menu.</div>;
    }
  };
  
  const hasCashierAccess = currentUser?.roleName === 'Vendedor' || currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Caixa' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';
  const hasEmployeeAccess = currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';
  const hasSettingsAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Administrador';
  const hasProductAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Estoquista' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-2xl font-semibold">Carregando Sistema PDV...</div>
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
              disabled={!hasProductAccess}
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
            <Button variant="ghost" onClick={handleLogout} className="w-full">Sair</Button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8 overflow-auto">
          {activeNav === 'Caixa' && !hasCashierAccess 
              ? <div className='text-center text-lg text-muted-foreground'>Você não tem permissão para acessar o caixa.</div>
              : renderContent()}
      </main>
    </div>
  );
}

type NavItem = 'Caixa' | 'Produtos' | 'Relatórios' | 'Funcionários' | 'Configurações';

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
                },
                 {"opacity-50 cursor-not-allowed": disabled}
            )}
            onClick={onClick}
            disabled={disabled}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Button>
    )
}
