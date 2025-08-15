
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDown } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">My Wallet</h1>
        <p className="text-muted-foreground">Fund your wallet, view balance, and make withdrawals.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription>This is your available balance for transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold mb-6">₦0.00</p>
          <div className="flex gap-4">
            <Button className="flex-1">
              <Plus className="mr-2" />
              Fund Wallet
            </Button>
            <Button variant="outline" className="flex-1">
               <ArrowDown className="mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
