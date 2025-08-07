
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Employee, EmployeeRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pen, Trash2, PlusCircle } from 'lucide-react';

const EmployeeForm = ({ employee, onSave, onDone }: { employee?: Employee | null, onSave: (e: any) => void, onDone: () => void }) => {
    const [name, setName] = useState(employee?.name || '');
    const [cod, setCod] = useState(employee?.cod || '');
    const [role, setRole] = useState<EmployeeRole>(employee?.role || 'Vendedor');
    const { getNextEmployeeCode } = useStore();

    useEffect(() => {
        if (!employee) {
            setCod(getNextEmployeeCode(role));
        }
    }, [employee, role, getNextEmployeeCode]);

    const handleRoleChange = (newRole: EmployeeRole) => {
        setRole(newRole);
        if (!employee) { // only update code for new employees
            setCod(getNextEmployeeCode(newRole));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: employee?.id, name, cod, role });
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="cod">Código do Funcionário</Label>
                <Input id="cod" value={cod} readOnly disabled />
            </div>
            <div>
                <Label htmlFor="name">Nome do Funcionário</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="role">Cargo</Label>
                <Select value={role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Vendedor">Vendedor</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Estoquista">Estoquista</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
    )
}

export default function EmployeeList() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleSave = (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      updateEmployee({ ...editingEmployee, ...employeeData });
    } else {
      addEmployee(employeeData);
    }
  };
  
  const openDialogForEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  }

  const openDialogForNew = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gerenciamento de Funcionários</CardTitle>
                <CardDescription>Adicione, edite ou remova funcionários.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Funcionário</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
                    </DialogHeader>
                    <EmployeeForm
                        employee={editingEmployee}
                        onSave={handleSave}
                        onDone={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-mono">{employee.cod}</TableCell>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(employee)}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteEmployee(employee.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
