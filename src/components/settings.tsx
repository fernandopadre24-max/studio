
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { FontFamily, HSLColor, Role } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Pen, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from './ui/dialog';
import { Input } from './ui/input';

const colorPresets: HSLColor[] = [
    { h: 262, s: 83, l: 58 }, // Default Purple
    { h: 217, s: 91, l: 60 }, // Blue
    { h: 142, s: 71, l: 45 }, // Green
    { h: 35, s: 92, l: 55 },  // Orange
    { h: 0, s: 84, l: 60 },    // Red
    { h: 346, s: 84, l: 60 }, // Pink
];

const RoleForm = ({ role, onSave, onDone }: { role?: Role | null, onSave: (r: any) => void, onDone: () => void }) => {
    const [name, setName] = useState(role?.name || '');
    const [prefix, setPrefix] = useState(role?.prefix || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: role?.id, name, prefix });
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Nome do Cargo</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="prefix">Prefixo do Código (1-3 letras)</Label>
                <Input id="prefix" value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase().slice(0,3))} required maxLength={3} />
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

function RoleManager() {
    const { roles, addRole, updateRole, deleteRole, canDeleteRole } = useStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const handleSave = (roleData: Role) => {
        if (editingRole) {
            updateRole({ ...editingRole, ...roleData });
        } else {
            addRole(roleData);
        }
    };
    
    const openDialogForEdit = (role: Role) => {
        setEditingRole(role);
        setIsDialogOpen(true);
    }

    const openDialogForNew = () => {
        setEditingRole(null);
        setIsDialogOpen(true);
    }
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Gerenciamento de Cargos</h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openDialogForNew} size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Cargo</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingRole ? 'Editar Cargo' : 'Adicionar Novo Cargo'}</DialogTitle>
                        </DialogHeader>
                        <RoleForm
                            role={editingRole}
                            onSave={handleSave}
                            onDone={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Prefixo</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell>{role.prefix}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(role)}>
                                        <Pen className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteRole(role.id)} disabled={!canDeleteRole(role.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SettingsPage() {
    const { theme, setTheme } = useStore();

    const handlePrimaryColorChange = (newColor: Partial<HSLColor>) => {
        setTheme({ primaryColor: { ...theme.primaryColor, ...newColor } });
    };

    const handleFontChange = (newFont: FontFamily) => {
        setTheme({ fontFamily: newFont });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Personalize o visual e as funcionalidades do seu sistema de PDV.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Cor Principal</h3>
                    <div className="flex items-center gap-4">
                        <p>Predefinições:</p>
                        {colorPresets.map((color, i) => (
                            <button
                                key={i}
                                className="h-8 w-8 rounded-full border-2"
                                style={{ 
                                    backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)`,
                                    borderColor: theme.primaryColor.h === color.h ? 'hsl(var(--primary))' : 'transparent'
                                }}
                                onClick={() => handlePrimaryColorChange(color)}
                            />
                        ))}
                    </div>
                     <div className="space-y-2">
                        <Label>Matiz (Hue): {theme.primaryColor.h}</Label>
                        <Slider
                            value={[theme.primaryColor.h]}
                            max={360}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ h: value[0] })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Saturação (Saturation): {theme.primaryColor.s}%</Label>
                        <Slider
                            value={[theme.primaryColor.s]}
                            max={100}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ s: value[0] })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Luminosidade (Lightness): {theme.primaryColor.l}%</Label>
                        <Slider
                            value={[theme.primaryColor.l]}
                            max={100}
                            step={1}
                            onValueChange={(value) => handlePrimaryColorChange({ l: value[0] })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fonte do Aplicativo</h3>
                     <Select value={theme.fontFamily} onValueChange={handleFontChange}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="font-inter">Inter (Padrão)</SelectItem>
                            <SelectItem value="font-space-mono">Space Mono</SelectItem>
                            <SelectItem value="font-roboto-mono">Roboto Mono</SelectItem>
                            <SelectItem value="font-inconsolata">Inconsolata</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <hr />
                
                <RoleManager />
            </CardContent>
        </Card>
    );
}
