
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Employee, Role } from '@/lib/types';
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
import { Pen, Trash2, PlusCircle, User, FileText, Briefcase, Eye, KeyRound } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const EmployeeDetails = ({ employee }: { employee: Employee }) => {
    const { getRoleName } = useStore();
    return (
        <ScrollArea className="h-[60vh]">
            <div className="space-y-6 p-4 font-sans">
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><Briefcase size={20} /> Informações do Cargo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Código do Funcionário</Label>
                            <p className="font-semibold">{employee.cod}</p>
                        </div>
                        <div>
                            <Label>Cargo</Label>
                            <p className="font-semibold">{getRoleName(employee.roleId)}</p>
                        </div>
                         <div>
                            <Label>Data de Admissão</Label>
                            <p className="font-semibold">{employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</p>
                        </div>
                         <div>
                            <Label>Salário (R$)</Label>
                            <p className="font-semibold">R$ {employee.salary?.toFixed(2) || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><User size={20} /> Informações Pessoais</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Nome Completo</Label>
                            <p className="font-semibold">{employee.name}</p>
                        </div>
                        <div>
                            <Label>CPF</Label>
                            <p className="font-semibold">{employee.cpf || 'N/A'}</p>
                        </div>
                         <div>
                            <Label>RG</Label>
                            <p className="font-semibold">{employee.rg || 'N/A'}</p>
                        </div>
                         <div>
                            <Label>Telefone / Celular</Label>
                            <p className="font-semibold">{employee.phone || 'N/A'}</p>
                        </div>
                     </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><FileText size={20} /> Endereço</h3>
                    <div>
                        <Label>Endereço Completo</Label>
                        <p className="font-semibold">{employee.address || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

const EmployeeForm = ({ employee, onSave, onDone }: { employee?: Employee | null, onSave: (e: any) => void, onDone: () => void }) => {
    const { roles, getNextEmployeeCode } = useStore();
    const [name, setName] = useState(employee?.name || '');
    const [cod, setCod] = useState(employee?.cod || '');
    const [roleId, setRoleId] = useState(employee?.roleId || roles[0]?.id || '');
    const [cpf, setCpf] = useState(employee?.cpf || '');
    const [rg, setRg] = useState(employee?.rg || '');
    const [phone, setPhone] = useState(employee?.phone || '');
    const [address, setAddress] = useState(employee?.address || '');
    const [admissionDate, setAdmissionDate] = useState(employee?.admissionDate || '');
    const [salary, setSalary] = useState(employee?.salary || 0);

    useEffect(() => {
        if (!employee && roleId) {
            setCod(getNextEmployeeCode(roleId));
        }
    }, [employee, roleId, getNextEmployeeCode]);

    const handleRoleChange = (newRoleId: string) => {
        setRoleId(newRoleId);
        if (!employee) { // only update code for new employees
            setCod(getNextEmployeeCode(newRoleId));
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: employee?.id, name, cod, roleId, cpf, rg, phone, address, admissionDate, salary });
        onDone();
    };

    return (
        <form onSubmit={handleSubmit}>
            <ScrollArea className="h-[60vh]">
                <div className="space-y-6 p-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><Briefcase size={20} /> Informações do Cargo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="cod">Código do Funcionário</Label>
                                <Input id="cod" value={cod} readOnly disabled />
                            </div>
                            <div>
                                <Label htmlFor="roleId">Cargo</Label>
                                <Select value={roleId} onValueChange={handleRoleChange}>
                                    <SelectTrigger id="roleId">
                                        <SelectValue placeholder="Selecione o cargo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label htmlFor="admissionDate">Data de Admissão</Label>
                                <Input id="admissionDate" type="date" value={admissionDate} onChange={e => setAdmissionDate(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="salary">Salário (R$)</Label>
                                <Input id="salary" type="number" step="0.01" value={salary} onChange={e => setSalary(parseFloat(e.target.value))} />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><User size={20} /> Informações Pessoais</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <Label htmlFor="cpf">CPF</Label>
                                <Input id="cpf" value={cpf} onChange={e => setCpf(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="rg">RG</Label>
                                <Input id="rg" value={rg} onChange={e => setRg(e.target.value)} />
                            </div>
                             <div>
                                <Label htmlFor="phone">Telefone / Celular</Label>
                                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                         </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2"><FileText size={20} /> Endereço</h3>
                        <div>
                            <Label htmlFor="address">Endereço Completo</Label>
                            <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Nº, Bairro, Cidade - Estado, CEP"/>
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="mt-6">
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
    )
}

export default function EmployeeList() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, getRoleName } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSave = (employeeData: Omit<Employee, 'id'> & { id?: string }) => {
    if (employeeData.id) {
      updateEmployee(employeeData as Employee);
    } else {
      addEmployee(employeeData);
    }
  };
  
  const openDialogForEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  }

  const openDialogForNew = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  }

  const openDialogForView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewOpen(true);
  }


  return (
    <Card className="bg-yellow-100 text-black font-mono">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-black">Gerenciamento de Funcionários</CardTitle>
                <CardDescription className="text-black/80">Adicione, edite ou remova funcionários. Dê um duplo clique para ver os detalhes.</CardDescription>
            </div>
            <Button onClick={openDialogForNew} className="font-sans bg-slate-800 text-white hover:bg-slate-700"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Funcionário</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-dashed border-black/20">
              <TableHead className="text-black">Código</TableHead>
              <TableHead className="text-black">Nome</TableHead>
              <TableHead className="text-black">Cargo</TableHead>
              <TableHead className="text-right text-black">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} onDoubleClick={() => openDialogForView(employee)} className="border-dashed border-black/20 cursor-pointer">
                <TableCell className="font-mono">{employee.cod}</TableCell>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{getRoleName(employee.roleId)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-black hover:bg-black/10" onClick={() => openDialogForEdit(employee)}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-black/10" onClick={() => deleteEmployee(employee.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

       <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="font-sans sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>{selectedEmployee ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
                </DialogHeader>
                <EmployeeForm
                    employee={selectedEmployee}
                    onSave={handleSave}
                    onDone={() => setIsFormOpen(false)}
                />
            </DialogContent>
        </Dialog>
        
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
            <DialogContent className="font-sans sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Eye /> Detalhes do Funcionário</DialogTitle>
                </DialogHeader>
                {selectedEmployee && <EmployeeDetails employee={selectedEmployee} />}
                 <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsViewOpen(false)}>Fechar</Button>
                    <Button onClick={() => { setIsViewOpen(false); if(selectedEmployee) openDialogForEdit(selectedEmployee)}}>Editar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </Card>
  );
}
