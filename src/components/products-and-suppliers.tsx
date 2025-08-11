
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductList from './product-list';
import SupplierList from './supplier-list';
import { useStore } from '@/lib/store';
import { Package, Truck } from 'lucide-react';

export default function ProductsAndSuppliers() {
  const { currentUser } = useStore();
  const hasSupplierAccess = currentUser?.roleName === 'Gerente' || currentUser?.roleName === 'Estoquista' || currentUser?.roleName === 'Supervisor' || currentUser?.roleName === 'Administrador';

  return (
    <Tabs defaultValue="products">
      <TabsList className="mb-4">
        <TabsTrigger value="products">
          <Package className="mr-2 h-4 w-4" />
          Produtos
        </TabsTrigger>
        {hasSupplierAccess && (
          <TabsTrigger value="suppliers">
            <Truck className="mr-2 h-4 w-4" />
            Fornecedores
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="products">
        <ProductList />
      </TabsContent>
      {hasSupplierAccess && (
        <TabsContent value="suppliers">
          <SupplierList />
        </TabsContent>
      )}
    </Tabs>
  );
}
