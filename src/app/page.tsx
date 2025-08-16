
import { AuthProvider } from '@/hooks/use-auth';
import HomeComponent from '@/components/home-component';

export default function Home() {
  return (
    <AuthProvider>
      <HomeComponent />
    </AuthProvider>
  );
}
