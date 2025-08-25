
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { VendorProductsModal } from './vendor-products-modal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface Vendor {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  profileImageUrl: string;
  hint: string;
}

interface Product {
  id: string;
  name: string;
  vendorId: string;
}

export default function HomeComponent() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vendors
        const vendorQuery = query(collection(db, "users"), where("isVendor", "==", true));
        const vendorSnapshot = await getDocs(vendorQuery);
        const fetchedVendors: Vendor[] = [];
        vendorSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedVendors.push({
            id: doc.id,
            name: data.businessName || 'Unnamed Vendor',
            description: data.businessDescription || 'No description available.',
            imageUrl: data.imageUrl || 'https://placehold.co/600x400',
            profileImageUrl: data.profileImageUrl || 'https://placehold.co/150x150',
            hint: data.businessName?.toLowerCase().split(' ').slice(0, 2).join(' ') || 'vendor',
          });
        });
        setVendors(fetchedVendors);

        // Fetch approved products
        const productQuery = query(collection(db, "products"), where("approved", "==", true));
        const productSnapshot = await getDocs(productQuery);
        const fetchedProducts: Product[] = [];
        productSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: doc.id,
            name: data.name,
            vendorId: data.vendorId,
          });
        });
        setProducts(fetchedProducts);

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredVendors = useMemo(() => {
    if (!searchQuery) {
      return vendors;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    // Find vendor IDs from products that match the query
    const vendorIdsFromProducts = new Set(
      products
        .filter(product => product.name.toLowerCase().includes(lowercasedQuery))
        .map(product => product.vendorId)
    );

    // Filter vendors
    return vendors.filter(vendor =>
      vendor.name.toLowerCase().includes(lowercasedQuery) ||
      vendorIdsFromProducts.has(vendor.id)
    );
  }, [searchQuery, vendors, products]);

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
                placeholder="Search for vendors or food..."
                className="w-full rounded-full bg-background pl-10 pr-4 py-6 text-base shadow-md focus-visible:ring-primary/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-8 text-center font-headline text-3xl font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : "Featured Vendors"}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-full overflow-hidden">
                      <Skeleton className="h-28 w-full" />
                      <CardContent className="p-6 pt-16 relative">
                          <Skeleton className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-background" />
                          <Skeleton className="h-6 w-3/4 mb-2 mt-2" />
                          <Skeleton className="h-4 w-full mb-4" />
                          <Skeleton className="h-5 w-1/3" />
                      </CardContent>
                  </Card>
              ))
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="h-full overflow-hidden border-border/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <CardHeader className="p-0 h-28 relative">
                      <Image
                        src={vendor.imageUrl}
                        alt={`${vendor.name} background`}
                        width={600}
                        height={200}
                        data-ai-hint={vendor.hint}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                  </CardHeader>
                  <CardContent className="p-6 pt-16 relative text-center">
                    <Avatar className="absolute -top-12 left-1/2 -translate-x-1/2 h-24 w-24 border-4 border-background">
                        <AvatarImage src={vendor.profileImageUrl} alt={vendor.name} />
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mb-2 font-headline text-xl font-semibold">{vendor.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{vendor.description}</CardDescription>
                     <p className="mt-4 font-semibold text-primary/80 text-sm">
                      Click to view products
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8">
                <p>No vendors found matching your search. Please try a different term.</p>
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
