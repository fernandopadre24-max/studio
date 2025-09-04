
'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Product, ProductUnit, Supplier } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pen, Trash2, PlusCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const ProductForm = ({ product, onSave, onDone }: { product?: Product | null, onSave: (p: any) => void, onDone: () => void }) => {
    const [name, setName] = useState(product?.name || '');
    const [cod, setCod] = useState(product?.cod || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [stock, setStock] = useState(product?.stock || 0);
    const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'UN');
    const [supplierId, setSupplierId] = useState(product?.supplierId || 'none');
    const [imagePreview, setImagePreview] = useState(product?.imageUrl || '');
    
    const { getNextProductCode, suppliers } = useStore();

    useEffect(() => {
        if (!product) {
            setCod(getNextProductCode());
        }
    }, [product, getNextProductCode]);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: product?.id, name, cod, price, stock, unit, supplierId: supplierId === 'none' ? undefined : supplierId, imageUrl: imagePreview });
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="cod">Código do Produto</Label>
                <Input id="cod" value={cod} readOnly disabled />
            </div>
            <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
             <div>
                <Label htmlFor="imageUrl">Imagem do Produto</Label>
                <Input id="imageUrl" type="file" onChange={handleImageChange} accept="image/*" />
                 {imagePreview && (
                    <div className="mt-2">
                        <Image
                            src={imagePreview}
                            alt="Pré-visualização"
                            width={100}
                            height={100}
                            className="rounded-md object-cover"
                        />
                    </div>
                 )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required />
                </div>
                 <div>
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={unit} onValueChange={(value: ProductUnit) => setUnit(value)}>
                        <SelectTrigger id="unit">
                            <SelectValue placeholder="Selecione"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UN">Unidade (UN)</SelectItem>
                            <SelectItem value="KG">Quilo (KG)</SelectItem>
                            <SelectItem value="G">Grama (G)</SelectItem>
                            <SelectItem value="CX">Caixa (CX)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div>
                <Label htmlFor="supplierId">Fornecedor</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger id="supplierId">
                        <SelectValue placeholder="Selecione o fornecedor"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.cod} - {supplier.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input id="stock" type="number" step="0.001" value={stock} onChange={e => setStock(parseFloat(e.target.value))} required />
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

export default function ProductList() {
  const { products, addProduct, updateProduct, deleteProduct, suppliers } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSave = (productData: Product) => {
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...productData });
    } else {
      addProduct(productData);
    }
  };
  
  const openDialogForEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  const openDialogForNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  }
  
  const getSupplierName = (supplierId?: string) => {
    if(!supplierId) return 'N/A';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Desconhecido';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Gerenciamento de Produtos</CardTitle>
                <CardDescription>Adicione, edite ou remova seus produtos.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={openDialogForNew}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Produto</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                        product={editingProduct}
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
              <TableHead className="w-20">Imagem</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover"
                      data-ai-hint={`${product.name.split(' ')[0]} product`}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono">{product.cod}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{getSupplierName(product.supplierId)}</TableCell>
                <TableCell>R$ {product.price.toFixed(2)} / {product.unit}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(product)}>
                    <Pen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => deleteProduct(product.id)}>
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
