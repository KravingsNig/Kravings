import { KravingsLogo } from '@/components/kravings-logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <KravingsLogo className="h-24 w-24 animate-fade-in-out text-primary" />
    </div>
  );
}
