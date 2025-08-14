
'use client'

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const featuredVendors = [
  { id: '1', name: 'Gourmet Burgers', description: 'Juicy, handcrafted burgers made with love.', imageUrl: 'https://placehold.co/600x400', hint: 'burger shop' },
  { id: '2', name: 'Pizza Palace', description: 'Authentic Italian pizza with fresh toppings.', imageUrl: 'https://placehold.co/600x400', hint: 'pizza restaurant' },
  { id: '3', name: 'Sushi Central', description: 'The freshest sushi and sashimi in town.', imageUrl: 'https://placehold.co/600x400', hint: 'sushi bar' },
  { id: '4', name: 'Taco Town', description: 'Spicy and savory tacos for every craving.', imageUrl: 'https://placehold.co/600x400', hint: 'taco stand' },
  { id: '5', name: 'Sweet Escapes', description: 'Decadent desserts and pastries.', imageUrl: 'https://placehold.co/600x400', hint: 'cake shop' },
  { id: '6', name: 'Vegan Vibes', description: 'Delicious and healthy plant-based meals.', imageUrl: 'https://placehold.co/600x400', hint: 'vegan food' },
];


function HomeComponent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/profile');
    }
  }, [user, loading, router]);

  return (
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
          {featuredVendors.map((vendor) => (
            <Link key={vendor.id} href={`/vendor/${vendor.id}`} className="group block">
              <Card className="h-full overflow-hidden border-border/60 transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl">
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
                  <Button variant="link" className="mt-4 p-0 font-semibold text-primary">
                    View Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
