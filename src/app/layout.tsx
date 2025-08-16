
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';

export const metadata: Metadata = {
  title: 'Kravings',
  description: 'Find your cravings, satisfy your needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
