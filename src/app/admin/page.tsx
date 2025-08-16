
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Loading from '@/app/loading';

export default function AdminPage() {
  const { user, userData, loading } = useAdmin();

  if (loading) {
    return <Loading />;
  }

  if (!user || !userData?.isAdmin) {
    return null; 
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage vendor products and platform settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Approvals</CardTitle>
          <CardDescription>Review and approve newly added vendor products.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>There are no products currently awaiting approval.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
