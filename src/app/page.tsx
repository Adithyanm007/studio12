'use client';

import { useState } from 'react';
import { StrokeRiskForm } from '@/components/stroke-risk-form';
import { ResultsDisplay } from '@/components/results-display';
import { getStrokePredictionAndInsights } from '@/app/actions';
import type { StrokeRiskFormValues } from '@/lib/schema';
import { Logo } from '@/components/logo';
import { Skeleton } from '@/components/ui/skeleton';

type Results = {
  riskScore: number;
  summary: string;
  insights: string;
  preventionTips: string;
};

export default function Home() {
  const [results, setResults] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: StrokeRiskFormValues) => {
    setIsLoading(true);
    setResults(null);
    try {
      const res = await getStrokePredictionAndInsights(data);
      setResults(res);
    } catch (error) {
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
      <main className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <div className="inline-block">
            <Logo />
          </div>
          <p className="mt-2 text-muted-foreground">
            Your personal AI-powered stroke risk assistant.
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
          <StrokeRiskForm onSubmit={handleFormSubmit} />
        )}
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StrokeWise. All rights reserved.</p>
        <p className="mt-1">This tool provides an estimate and is not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
