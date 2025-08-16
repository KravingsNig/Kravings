
'use client';

import { useEffect, useState, createContext, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  setUserData: Dispatch<SetStateAction<any | null>>;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    userData: null, 
    loading: true, 
    setUserData: () => {} 
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                // Check if walletBalance exists, if not, initialize it.
                if (userDoc.data().walletBalance === undefined) {
                    await setDoc(userDocRef, { walletBalance: 0 }, { merge: true });
                    setUserData({ ...userDoc.data(), walletBalance: 0 });
                } else {
                    setUserData(userDoc.data());
                }
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
