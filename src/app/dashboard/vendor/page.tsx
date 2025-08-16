
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  approved: boolean;
  createdAt: Timestamp;
}

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"), 
          where("vendorId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // Sort products by creation date on the client side
        fetchedProducts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching vendor products: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchProducts();
    } else {
        setLoading(false);
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and wallet.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vendor/add-product">
            <PlusCircle className="mr-2" />
            Add New Product
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your current balance and transactions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold">₦0.00</p>
             <Button asChild variant="outline" className="mt-4">
               <Link href="/wallet">Manage Wallet</Link>
             </Button>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Products</CardTitle>
             <CardDescription>View, edit, or delete your product listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                <p>You haven't added any products yet.</p>
                <Button variant="link" asChild className="mt-2">
                    <Link href="/dashboard/vendor/add-product">Add your first product</Link>
                </Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                        <TableRow key={product.id}>
                            <TableCell>
                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>₦{product.price.toLocaleString()}</TableCell>
                            <TableCell>
                                <Badge variant={product.approved ? 'default' : 'secondary'}>
                                    {product.approved ? 'Approved' : 'Pending'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
