
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorProductsModal } from './vendor-products-modal';

interface Vendor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  hint: string;
}

export default function HomeComponent() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const q = query(collection(db, "users"), where("isVendor", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedVendors: Vendor[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedVendors.push({
            id: doc.id,
            name: data.businessName || 'Unnamed Vendor',
            description: data.businessDescription || 'No description available.',
            imageUrl: data.imageUrl || 'https://placehold.co/600x400',
            hint: data.businessName?.toLowerCase().split(' ').slice(0, 2).join(' ') || 'vendor',
          });
        });
        setVendors(fetchedVendors);
      } catch (error) {
        console.error("Error fetching vendors: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-12 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Find Your Kravings
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
            Discover local vendors and satisfy your deepest food cravings, all in one place.
          </p>
          <div className="mt-8 mx-auto max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for vendors, food, or drinks..."
                className="w-full rounded-full bg-background pl-10 pr-4 py-6 text-base shadow-md focus-visible:ring-primary/40"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-8 text-center font-headline text-3xl font-bold">Featured Vendors</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-full overflow-hidden">
                      <Skeleton className="aspect-video w-full" />
                      <CardContent className="p-6">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <Skeleton className="h-5 w-1/3" />
                      </CardContent>
                  </Card>
              ))
            ) : vendors.length > 0 ? (
              vendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="h-full overflow-hidden border-border/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={vendor.imageUrl}
                        alt={vendor.name}
                        width={600}
                        height={400}
                        data-ai-hint={vendor.hint}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-2 font-headline text-xl font-semibold">{vendor.name}</CardTitle>
                    <CardDescription>{vendor.description}</CardDescription>
                     <p className="mt-4 font-semibold text-primary/80 text-sm">
                      Click to view products
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <p>No vendors are available at the moment. Please check back later.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      {selectedVendor && (
        <VendorProductsModal
          vendor={selectedVendor}
          isOpen={!!selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </>
  );
}
