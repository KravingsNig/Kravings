
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
}

interface Order {
    id: string;
    vendorId: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: Timestamp;
    vendorName?: string;
}

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const q = query(collection(db, "orders"), where("consumerId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const fetchedOrders: Order[] = [];

                for (const orderDoc of querySnapshot.docs) {
                    const orderData = orderDoc.data() as Omit<Order, 'id' | 'vendorName'>;
                    
                    // Fetch vendor name
                    const vendorRef = doc(db, 'users', orderData.vendorId);
                    const vendorSnap = await getDoc(vendorRef);
                    const vendorName = vendorSnap.exists() ? vendorSnap.data().businessName : "Unknown Vendor";

                    fetchedOrders.push({
                        id: orderDoc.id,
                        ...orderData,
                        vendorName
                    });
                }
                
                fetchedOrders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Error fetching orders: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Order Received':
                return 'secondary';
            case 'Processing':
                return 'default';
            case 'Ready for Dispatch':
                return 'outline';
            default:
                return 'secondary';
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                <p className="text-muted-foreground">Track the status of your recent and past orders.</p>
            </div>
            {loading ? (
                 <div className="space-y-6">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                 </div>
            ) : orders.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                    <p>You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order.id} className="shadow-md">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Order from {order.vendorName}</CardTitle>
                                        <CardDescription>
                                            Placed on: {order.createdAt.toDate().toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={getStatusVariant(order.status) as any}>{order.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Separator className="my-4" />
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.name} className="flex items-center gap-4">
                                            <Image src={item.imageUrl} alt={item.name} width={50} height={50} className="rounded-md object-cover"/>
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity} x ₦{item.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 p-4 rounded-b-lg">
                                <p className="font-bold text-lg">Total: ₦{order.total.toLocaleString()}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
