
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowRight } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Vendor {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  details: string;
  imageUrl: string;
}

interface VendorProductsModalProps {
  vendor: Vendor;
  isOpen: boolean;
  onClose: () => void;
}

export function VendorProductsModal({ vendor, isOpen, onClose }: VendorProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const q = query(
            collection(db, "products"),
            where("vendorId", "==", vendor.id),
            where("approved", "==", true)
          );
          const querySnapshot = await getDocs(q);
          const fetchedProducts: Product[] = [];
          querySnapshot.forEach((doc) => {
            fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
          });
          setProducts(fetchedProducts);
        } catch (error) {
          console.error('Error fetching vendor products:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen, vendor.id]);

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your shopping cart.`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{vendor.name}</DialogTitle>
          <DialogDescription>{vendor.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Menu</h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-md" />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="flex items-center gap-4">
                    <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">₦{product.price.toLocaleString()}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAddToCart(product)}>
                      <Plus className="mr-2" /> Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>This vendor has not added any products yet.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
           <Button variant="ghost" asChild>
            <Link href={`/vendor/${vendor.id}`}>
              View Store <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
