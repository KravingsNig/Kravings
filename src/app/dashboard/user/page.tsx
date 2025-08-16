
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UserDashboardPage() {
  const { userData } = useAuth();
  const { toast } = useToast();

  const handleCopy = () => {
    if (userData?.referralCode) {
      navigator.clipboard.writeText(userData.referralCode);
      toast({
        title: "Copied!",
        description: "Your referral code has been copied to the clipboard.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="mb-8">
          <h1 className="text-3xl font-bold font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your wallet, orders, and referrals.</p>
        </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your current balance and transactions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold">₦0.00</p>
             <Button asChild variant="outline" className="mt-4">
              <Link href="/wallet">Manage Wallet</Link>
             </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
             <CardDescription>Review your past orders.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-center text-muted-foreground py-8">
              <p>You haven't placed any orders yet.</p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Referral Code</CardTitle>
            <CardDescription>Share your code to earn rewards.</CardDescription>
          </CardHeader>
          <CardContent>
            {userData?.referralCode ? (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <p className="text-lg font-mono font-bold">{userData.referralCode}</p>
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Referral code not available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
