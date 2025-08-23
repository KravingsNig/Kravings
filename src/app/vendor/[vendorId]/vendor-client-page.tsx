
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  details: string;
  imageUrl: string;
}

interface VendorClientPageProps {
  products: Product[];
}

export default function VendorClientPage({ products }: VendorClientPageProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your shopping cart.`,
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold font-headline mb-6">Our Menu</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2">{product.name}</CardTitle>
                <CardDescription>{product.details}</CardDescription>
                <div className="flex justify-between items-center mt-4">
                  <p className="font-semibold text-lg">₦{product.price.toLocaleString()}</p>
                  <Button onClick={() => handleAddToCart(product)}>
                    <Plus className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16">
          <p>This vendor has not added any products yet. Please check back later.</p>
        </div>
      )}
    </>
  );
}
