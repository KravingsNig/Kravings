
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Loading from '@/app/loading';

export default function DashboardRedirectPage() {
  const { userData, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user) {
      router.replace('/signin');
    } else if (userData) {
      if (userData.isVendor) {
        router.replace('/dashboard/vendor');
      } else {
        router.replace('/dashboard/user');
      }
    }
  }, [user, userData, loading, router]);

  return <Loading />;
}
