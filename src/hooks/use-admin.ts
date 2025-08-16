
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export const useAdmin = () => {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !userData?.isAdmin) {
        router.push('/');
      }
    }
  }, [user, userData, loading, router]);

  return { user, userData, loading };
};
