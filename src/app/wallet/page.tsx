
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

export default function WalletPage() {
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFundWallet = async () => {
    const fundAmount = parseFloat(amount);
    if (!user || !fundAmount || fundAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount to fund.',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        walletBalance: increment(fundAmount),
      });

      // Update local state to reflect the change immediately
      setUserData((prev: any) => ({
        ...prev,
        walletBalance: (prev.walletBalance || 0) + fundAmount,
      }));

      toast({
        title: 'Wallet Funded!',
        description: `₦${fundAmount.toLocaleString()} has been added to your wallet.`,
      });
      setAmount('');

    } catch (error: any) {
      console.error("Funding failed:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Could not fund your wallet.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Wallet</h1>
        <p className="text-muted-foreground">Fund your wallet, view balance, and make withdrawals.</p>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>This is your available balance for transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold mb-6">₦{(userData?.walletBalance || 0).toLocaleString()}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              type="number"
              placeholder="Enter amount to fund"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button className="flex-1" onClick={handleFundWallet} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2" />
                  Funding...
                </>
              ) : (
                <>
                  <Plus className="mr-2" />
                  Fund Wallet
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" className="w-full">
               <ArrowDown className="mr-2" />
              Withdraw Funds (Demo)
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
