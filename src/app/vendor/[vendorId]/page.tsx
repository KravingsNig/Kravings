
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import VendorClientPage from './vendor-client-page';

interface Vendor {
  businessName: string;
  businessDescription: string;
  imageUrl: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  details: string;
  imageUrl: string;
}

async function getVendorData(vendorId: string) {
  try {
    // Fetch vendor details
    const vendorDocRef = doc(db, 'users', vendorId);
    const vendorDocSnap = await getDoc(vendorDocRef);
    
    if (!vendorDocSnap.exists()) {
      return { vendor: null, products: [] };
    }
    
    const vendor = vendorDocSnap.data() as Vendor;

    // Fetch vendor's products
    const q = query(
      collection(db, "products"), 
      where("vendorId", "==", vendorId),
      where("approved", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });

    return { vendor, products };

  } catch (error) {
    console.error('Error fetching vendor data:', error);
    return { vendor: null, products: [] };
  }
}


export default async function VendorPage({ params }: { params: { vendorId: string } }) {
  const { vendorId } = params;
  const { vendor, products } = await getVendorData(vendorId);

  if (!vendor) {
    return <div className="text-center py-16">Vendor not found.</div>;
  }

  return (
    <div>
      <div className="h-48 bg-muted relative">
        {vendor.imageUrl ? (
          <Image
            src={vendor.imageUrl}
            alt={vendor.businessName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary to-accent" />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl font-bold font-headline text-white">{vendor.businessName}</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center max-w-2xl mx-auto text-muted-foreground mb-12">{vendor.businessDescription}</p>
        <VendorClientPage products={products} />
      </div>
    </div>
  );
}
