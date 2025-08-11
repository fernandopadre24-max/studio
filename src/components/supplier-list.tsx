
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Supplier } from '@/lib/types';
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
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Pen, Trash2, PlusCircle } from 'lucide-react';

const SupplierForm = ({ supplier, onSave, onDone }: { supplier?: Supplier | null, onSave: (s: any) => void, onDone: () => void }) => {
    const [name, setName] = useState(supplier?.name || '');
    const [cod, setCod] = useState(supplier?.cod || '');
    const [contactPerson, setContactPerson] = useState(supplier?.contactPerson || '');
    const [phone, setPhone] = useState(supplier?.phone || '');
    const [email, setEmail] = useState(supplier?.email || '');
    const [address, setAddress] = useState(supplier?.address || '');

    const { getNextSupplierCode } = useStore();

    useEffect(() => {
        if (!supplier) {
            setCod(getNextSupplierCode());
        }
    }, [supplier, getNextSupplierCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: supplier?.id, cod, name, contactPerson, phone, email, address });
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="cod">Código do Fornecedor</Label>
                    <Input id="cod" value={cod} readOnly disabled />
                </div>
                 <div>
                    <Label htmlFor="name">Nome / Razão Social</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="contactPerson">Pessoa de Contato</Label>
                    <Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="phone">Telefone / Celular</Label>
                    <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
            </div>
             <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
             <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, Nº, Bairro, Cidade - Estado, CEP"/>
            </div>
            <DialogFooter className="pt-4">
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Salvar</Button>
            </DialogFooter>
        </form>
    )
}

export default function SupplierList() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleSave = (supplierData: Supplier) => {
    if (editingSupplier) {
      updateSupplier({ ...editingSupplier, ...supplierData });
    } else {
      addSupplier(supplierData);
    }
  };
  
  const openDialogForEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  }

  const openDialogForNew = () => {
    setEditingSupplier(null);
    setIsDialogOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gerenciamento de Fornecedores</CardTitle>
                <CardDescription>Adicione, edite ou remova seus fornecedores.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Fornecedor</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
                    </DialogHeader>
                    <SupplierForm
                        supplier={editingSupplier}
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
              <TableHead>Contato</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-mono">{supplier.cod}</TableCell>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(supplier)}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteSupplier(supplier.id)}>
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
