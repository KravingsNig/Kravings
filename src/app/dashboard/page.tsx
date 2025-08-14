
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Loading from '@/app/loading';

export default function DashboardRedirectPage() {
  const { userData, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished and we have user data.
    if (!loading) {
      if (!user) {
        // If no user is logged in, redirect to sign-in page.
        router.push('/signin');
      } else if (userData) {
        // If we have a user and their data, redirect based on their role.
        if (userData.isVendor) {
          router.push('/dashboard/vendor');
        } else {
          router.push('/dashboard/user');
        }
      }
    }
  }, [user, userData, loading, router]);

  // Display a loading state while we determine the redirect.
  return <Loading />;
}
