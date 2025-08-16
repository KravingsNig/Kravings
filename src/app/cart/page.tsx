
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { collection, addDoc, doc, runTransaction, Timestamp, where, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryFee = 1500;
  const totalCost = cartTotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not logged in", description: "You must be signed in to checkout." });
        return;
    }
    if ((userData?.walletBalance || 0) < totalCost) {
        toast({ variant: "destructive", title: "Insufficient Funds", description: "Please fund your wallet before checking out." });
        return;
    }

    setIsCheckingOut(true);

    // Group items by vendor
    const vendorItems: { [vendorId: string]: any[] } = {};
    const productVendorMap: { [productId: string]: string } = {};

    try {
        const productIds = cartItems.map(item => item.id);
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('__name__', 'in', productIds));
        const productSnapshots = await getDocs(q);

        productSnapshots.forEach(doc => {
            productVendorMap[doc.id] = doc.data().vendorId;
        });

        cartItems.forEach(item => {
            const vendorId = productVendorMap[item.id];
            if (!vendorItems[vendorId]) {
                vendorItems[vendorId] = [];
            }
            vendorItems[vendorId].push({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
            });
        });

        // Create an order for each vendor
        for (const vendorId of Object.keys(vendorItems)) {
            const items = vendorItems[vendorId];
            const vendorSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            await runTransaction(db, async (transaction) => {
                const consumerDocRef = doc(db, "users", user.uid);
                const vendorDocRef = doc(db, "users", vendorId);
                const orderRef = doc(collection(db, "orders"));

                // 1. Create the order
                transaction.set(orderRef, {
                    consumerId: user.uid,
                    vendorId: vendorId,
                    items: items,
                    total: vendorSubtotal,
                    status: "Order Received",
                    createdAt: Timestamp.now(),
                });

                // 2. Debit consumer
                transaction.update(consumerDocRef, { walletBalance: userData.walletBalance - vendorSubtotal });

                // 3. Credit vendor
                const vendorDoc = await transaction.get(vendorDocRef);
                const currentVendorBalance = vendorDoc.data()?.walletBalance || 0;
                transaction.update(vendorDocRef, { walletBalance: currentVendorBalance + vendorSubtotal });
            });

             // Update local state for consumer
            setUserData((prev: any) => ({
                ...prev,
                walletBalance: prev.walletBalance - vendorSubtotal,
            }));
        }

        // Handle delivery fee debit as a separate transaction if needed
        // For simplicity, we assume it goes to the platform, so we just debit the user
         await runTransaction(db, async (transaction) => {
            const consumerDocRef = doc(db, "users", user.uid);
            transaction.update(consumerDocRef, { walletBalance: userData.walletBalance - cartTotal - deliveryFee });
        });

        setUserData((prev: any) => ({
            ...prev,
            walletBalance: prev.walletBalance - deliveryFee,
        }));


        toast({ title: "Order Placed!", description: "Your order has been successfully placed." });
        clearCart();
        router.push('/orders');

    } catch (error) {
        console.error("Checkout failed:", error);
        toast({ variant: "destructive", title: "Checkout Failed", description: "There was an issue placing your order." });
    } finally {
        setIsCheckingOut(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Shopping Cart</h1>
        <p className="text-muted-foreground">Review your items and proceed to checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
           <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
            <p className="mt-2">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="mt-6">
                <Link href="/">Start Shopping</Link>
            </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-md object-cover" />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <p className="font-semibold">₦{item.price.toLocaleString()}</p>
                         <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₦{deliveryFee.toLocaleString()}</span>
                 </div>
                 <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{totalCost.toLocaleString()}</span>
                 </div>
                 <Button className="w-full mt-4" onClick={handleCheckout} disabled={isCheckingOut}>
                    {isCheckingOut ? (
                        <>
                            <LoaderCircle className="mr-2 animate-spin" />
                            Placing Order...
                        </>
                    ) : (
                        'Proceed to Checkout'
                    )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
