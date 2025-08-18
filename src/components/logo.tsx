import { Stethoscope } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Stethoscope className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-3xl font-bold tracking-tight">StrokeWise</h1>
    </div>
  );
}
