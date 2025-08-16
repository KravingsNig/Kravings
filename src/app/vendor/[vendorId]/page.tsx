
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

interface Vendor {
  businessName: string;
  businessDescription: string;
  imageUrl: string;
}

// Mock product data for now
const products = [
    { id: 1, name: 'Jollof Rice', price: 2500, description: 'Smoky party jollof with fried plantain.', imageUrl: 'https://placehold.co/600x400' },
    { id: 2, name: 'Fried Rice', price: 2500, description: 'Classic Nigerian fried rice with chicken.', imageUrl: 'https://placehold.co/600x400' },
    { id: 3, name: 'Egusi Soup', price: 3500, description: 'Delicious egusi soup served with pounded yam.', imageUrl: 'https://placehold.co/600x400' },
];

export default function VendorPage({ params }: { params: { vendorId: string } }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.vendorId) {
      const fetchVendor = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'users', params.vendorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setVendor(docSnap.data() as Vendor);
          } else {
            console.log('No such vendor!');
            setVendor(null);
          }
        } catch (error) {
          console.error('Error fetching vendor:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchVendor();
    }
  }, [params.vendorId]);

  if (loading) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="mt-8">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index}>
                            <Skeleton className="aspect-video w-full" />
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (!vendor) {
    return <div className="text-center py-16">Vendor not found.</div>;
  }

  return (
    <div>
        <div className="h-48 bg-muted relative">
            {vendor.imageUrl && (
                <Image
                    src={vendor.imageUrl}
                    alt={vendor.businessName}
                    fill
                    className="object-cover"
                    priority
                />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <h1 className="text-4xl font-bold font-headline text-white">{vendor.businessName}</h1>
            </div>
        </div>

        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-12">{vendor.businessDescription}</p>

            <h2 className="text-2xl font-bold font-headline mb-6">Our Menu</h2>
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
                            <CardDescription>{product.description}</CardDescription>
                            <div className="flex justify-between items-center mt-4">
                               <p className="font-semibold text-lg">₦{product.price.toLocaleString()}</p>
                               <Button>
                                 <Plus className="mr-2 h-4 w-4" /> Add to Cart
                               </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
