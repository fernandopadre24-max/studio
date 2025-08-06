'use client';

import { useState } from 'react';
import { useProductsStore, Product } from '@/hooks/use-products-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, PlusCircle, Edit, Trash2 } from 'lucide-react';

export function ProductManager() {
  const { products, addProduct, updateProduct, removeProduct } = useProductsStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const { toast } = useToast();

  const handleOpenDialog = (product: Product | null) => {
    setCurrentProduct(product);
    setProductName(product ? product.name : '');
    setProductPrice(product ? String(product.price) : '');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentProduct(null);
    setProductName('');
    setProductPrice('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(productPrice);
    if (!productName || isNaN(price) || price <= 0) {
      toast({
        title: "Entrada Inválida",
        description: "Por favor, insira um nome e preço de produto válidos.",
        variant: "destructive",
      });
      return;
    }

    if (currentProduct) {
      // Editing existing product
      updateProduct({ ...currentProduct, name: productName, price });
       toast({ title: "Produto Atualizado", description: `"${productName}" foi atualizado com sucesso.` });
    } else {
      // Adding new product
      addProduct({ id: crypto.randomUUID(), name: productName, price });
      toast({ title: "Produto Adicionado", description: `"${productName}" foi adicionado ao seu inventário.` });
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    removeProduct(id);
    toast({ title: "Produto Removido", description: "O produto foi removido do seu inventário." });
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Package />Gerenciador de Produtos</CardTitle>
            <CardDescription>Adicione, edite e remova produtos do seu inventário.</CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length > 0 ? (
                  products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">R${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum produto cadastrado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onInteractOutside={handleCloseDialog}>
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogDescription>
              {currentProduct ? 'Edite os detalhes do seu produto abaixo.' : 'Preencha os detalhes do novo produto.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productNameDialog" className="text-sm font-medium">Nome do Produto</label>
              <Input id="productNameDialog" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="ex: Maçãs" />
            </div>
            <div>
              <label htmlFor="productPriceDialog" className="text-sm font-medium">Preço</label>
              <Input id="productPriceDialog" type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="ex: 1.99" min="0.01" step="0.01" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit">{currentProduct ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
