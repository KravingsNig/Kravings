import VendorClientPage from './vendor-client-page';

// This function is required by Next.js for static exports of dynamic routes.
// We return an empty array because we want all vendor pages to be rendered on the client-side.
export async function generateStaticParams() {
  return [];
}

// This is a Server Component. Its only job is to render the Client Component.
// The props are typed correctly to satisfy the Next.js build process.
export default function VendorPage({ params }: { params: { vendorId: string } }) {
  return <VendorClientPage vendorId={params.vendorId} />;
}
