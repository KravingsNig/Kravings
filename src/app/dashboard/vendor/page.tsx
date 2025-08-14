
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function VendorDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and wallet.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your current balance and transactions.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-2xl font-bold">$0.00</p>
             <Button variant="outline" className="mt-4">Manage Wallet</Button>
          </CardContent>
        </Card>
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Products</CardTitle>
             <CardDescription>View, edit, or delete your product listings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>You haven't added any products yet.</p>
              <Button variant="link" className="mt-2">Add your first product</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
