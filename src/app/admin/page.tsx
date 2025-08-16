
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Loading from '@/app/loading';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  vendorId: string;
}

export default function AdminPage() {
  const { user, userData, loading: adminLoading } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { toast } = useToast();

  const fetchUnapprovedProducts = async () => {
    setLoadingProducts(true);
    try {
      const q = query(collection(db, "products"), where("approved", "==", false));
      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching unapproved products: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products for approval.' });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (userData?.isAdmin) {
      fetchUnapprovedProducts();
    }
  }, [userData]);

  const handleApprove = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, { approved: true });
      toast({ title: 'Success', description: 'Product has been approved.' });
      // Refresh the list after approval
      fetchUnapprovedProducts();
    } catch (error) {
      console.error("Error approving product: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not approve the product.' });
    }
  };

  if (adminLoading) {
    return <Loading />;
  }

  if (!user || !userData?.isAdmin) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage vendor products and platform settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Approvals</CardTitle>
          <CardDescription>Review and approve newly added vendor products.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>There are no products currently awaiting approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center gap-4">
                    <Image src={product.imageUrl} alt={product.name} width={50} height={50} className="rounded-md" />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">₦{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleApprove(product.id)}>Approve</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
