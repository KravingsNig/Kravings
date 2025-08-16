
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  approved: boolean;
  createdAt: Timestamp;
}

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
}

interface Order {
    id: string;
    consumerId: string;
    items: OrderItem[];
    total: number;
    status: 'Order Received' | 'Processing' | 'Ready for Dispatch';
    createdAt: Timestamp;
}


export default function VendorDashboardPage() {
  const { user, userData } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchProducts = async () => {
    if (!user) return;
    setLoadingProducts(true);
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
      
      fetchedProducts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching vendor products: ", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
      if (!user) return;
      setLoadingOrders(true);
      try {
          const q = query(collection(db, "orders"), where("vendorId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const fetchedOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
              fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
          });
          fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          setOrders(fetchedOrders);
      } catch (error) {
          console.error("Error fetching orders: ", error);
      } finally {
          setLoadingOrders(false);
      }
  };

  useEffect(() => {
    if (user) {
        fetchProducts();
        fetchOrders();
    } else {
        setLoadingProducts(false);
        setLoadingOrders(false);
    }
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
        setOrders(prevOrders => prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
        ));
    } catch (error) {
        console.error("Error updating order status: ", error);
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, orders, and wallet.</p>
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
             <p className="text-2xl font-bold">₦{(userData?.walletBalance || 0).toLocaleString()}</p>
             <Button asChild variant="outline" className="mt-4">
               <Link href="/wallet">Manage Wallet</Link>
             </Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Incoming Orders</CardTitle>
                <CardDescription>Manage and update the status of customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {loadingOrders ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You have no incoming orders yet.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Details</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <ul className="text-sm">
                                            {order.items.map(item => (
                                                <li key={item.name}>{item.quantity}x {item.name}</li>
                                            ))}
                                        </ul>
                                    </TableCell>
                                    <TableCell>₦{order.total.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Select 
                                            value={order.status}
                                            onValueChange={(value) => handleStatusChange(order.id, value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Update status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Order Received">Order Received</SelectItem>
                                                <SelectItem value="Processing">Processing</SelectItem>
                                                <SelectItem value="Ready for Dispatch">Ready for Dispatch</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>

         <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>My Products</CardTitle>
             <CardDescription>View, edit, or delete your product listings.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
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
