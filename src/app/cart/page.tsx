
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  const deliveryFee = 1500;

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
                    <span>₦{(cartTotal + deliveryFee).toLocaleString()}</span>
                 </div>
                 <Button className="w-full mt-4">Proceed to Checkout</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
