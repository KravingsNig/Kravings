'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { KravingsLogo } from '@/components/kravings-logo';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const cartItemCount = 3; // Mocked value

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <KravingsLogo />
          <span className="font-headline text-xl font-semibold text-primary">Kravings</span>
        </Link>
        
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link href="/profile" className="text-foreground/60 transition-colors hover:text-foreground/80">
              Profile
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {cartItemCount}
              </span>
            )}
          </Button>

          <ModeToggle />
          
          {user ? (
             <Button variant="ghost" size="icon" aria-label="Sign Out" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={() => router.push('/signin')}>Sign In</Button>
          )}


          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-12">
                <Link href="/" className="mb-4 flex items-center gap-2">
                    <KravingsLogo />
                    <span className="font-headline text-xl font-semibold text-primary">Kravings</span>
                </Link>
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
                 {user && (
                  <Link href="/profile" className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                    Profile
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
