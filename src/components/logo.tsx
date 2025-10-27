import { Stethoscope } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function Logo() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-2">
      <Stethoscope className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-3xl font-bold tracking-tight">{t('app.title')}</h1>
    </div>
  );
}
