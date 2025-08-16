import { KravingsLogo } from '@/components/kravings-logo';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in-out">
        <KravingsLogo className="h-24 w-24 text-primary" />
        <span className="text-2xl font-headline font-bold text-primary tracking-wider">
          Kravings
        </span>
      </div>
    </div>
  );
}
