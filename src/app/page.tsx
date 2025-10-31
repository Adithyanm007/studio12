
'use client';

import { useState, useEffect } from 'react';
import { StrokeRiskForm } from '@/components/stroke-risk-form';
import { ResultsDisplay } from '@/components/results-display';
import type { StrokeRiskFormValues } from '@/lib/schema';
import { Logo } from '@/components/logo';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

// This is the type of data we expect from our new API route
export type PredictionAndInsightsResult = {
  riskScore: number;
  summary: string;
  insights: string;
  preventionTips: { title: string; description: string; }[];
};


function ClientOnlyStrokeForm({ onSubmit }: { onSubmit: (data: StrokeRiskFormValues) => void }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
        <div className="space-y-6 rounded-lg border p-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    );
  }

  return <StrokeRiskForm onSubmit={onSubmit} />;
}


export default function Home() {
  const [results, setResults] = useState<PredictionAndInsightsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();


  const handleFormSubmit = async (data: StrokeRiskFormValues) => {
    setIsLoading(true);
    setResults(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const res = await response.json();
      setResults(res);
    } catch (error: any) {
      console.error("Failed to get prediction:", error);
      // Here you would typically show a toast notification to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
       <header className="absolute top-4 right-4">
          <LanguageSwitcher />
        </header>
      <main className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <div className="inline-block">
            <Logo />
          </div>
          <p className="mt-2 text-muted-foreground">
            {t('app.description')}
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : results ? (
          <ResultsDisplay results={results} onReset={handleReset} />
        ) : (
          <ClientOnlyStrokeForm onSubmit={handleFormSubmit} />
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {t('app.title')}. {t('footer.rights')}</p>
        <p className="mt-1">{t('footer.disclaimer')}</p>
      </footer>
    </div>
  );
}
