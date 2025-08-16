
'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, LogOut, LayoutDashboard, ShieldCheck, User, Wallet, Info, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { KravingsLogo } from '@/components/kravings-logo';
import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';

export function Header() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const { cartItemCount } = useCart();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };
  
  const userLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/orders', label: 'Orders', icon: Package },
      { href: '/wallet', label: 'Wallet', icon: Wallet },
      { href: '/profile', label: 'Profile', icon: User },
  ];

  const publicLinks = [
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact Us', icon: Info },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <KravingsLogo />
          <span className="font-headline text-xl font-semibold text-primary">Kravings</span>
        </Link>
        
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">
            Home
          </Link>

          {user && (
            <>
              {userLinks.map(link => (
                 <Link key={link.href} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
                  {link.label}
                </Link>
              ))}
            </>
          )}

          {publicLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
                {link.label}
              </Link>
          ))}
          
          {user && userData?.isAdmin && (
            <Link href="/admin" className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground/80">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
            <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {cartItemCount}
                </span>
                )}
            </Link>
          </Button>

          <ModeToggle />
          
          {!user && (
            <Button className="hidden md:inline-flex" onClick={() => router.push('/signin')}>Sign In</Button>
          )}

          {user && (
             <Button variant="ghost" size="icon" aria-label="Sign Out" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}


          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex flex-col gap-6 pt-12">
                    <Link href="/" className="mb-4 flex items-center gap-2">
                        <KravingsLogo />
                        <span className="font-headline text-xl font-semibold text-primary">Kravings</span>
                    </Link>
                    
                    <SheetClose asChild>
                      <Link href="/" className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                          Home
                      </Link>
                    </SheetClose>

                    {user && (
                      <>
                        {userLinks.map(link => (
                            <SheetClose asChild key={link.href}>
                              <Link href={link.href} className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                                  {link.label}
                              </Link>
                            </SheetClose>
                        ))}
                      </>
                    )}

                    {publicLinks.map(link => (
                        <SheetClose asChild key={link.href}>
                          <Link href={link.href} className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                              {link.label}
                          </Link>
                        </SheetClose>
                    ))}

                    {user && userData?.isAdmin && (
                        <SheetClose asChild>
                          <Link href="/admin" className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5"/>
                          Admin
                          </Link>
                        </SheetClose>
                    )}
                  </div>
                </div>

                <div className="mt-auto mb-4">
                  {user ? (
                      <Button variant="outline" className="w-full" onClick={handleSignOut}>
                          <LogOut className="mr-2"/>
                          Sign Out
                      </Button>
                  ) : (
                      <SheetClose asChild>
                        <Button className="w-full" onClick={() => router.push('/signin')}>
                          Sign In
                        </Button>
                      </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
