'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ShieldCheck, FileText, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsDisplayProps {
  results: {
    riskScore: number;
    summary: string;
    insights: string;
    preventionTips: string;
  };
  onReset: () => void;
}

const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 33) return 'low';
  if (score < 66) return 'medium';
  return 'high';
};

const riskStyles = {
  low: {
    textColor: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    text: 'Low',
  },
  medium: {
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    text: 'Medium',
  },
  high: {
    textColor: 'text-destructive',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    text: 'High',
  },
};

export function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  const riskLevel = getRiskLevel(results.riskScore);
  const styles = riskStyles[riskLevel];

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <Card className={cn('border-2 text-center', styles.borderColor)}>
        <CardHeader>
          <CardTitle>Your Estimated Stroke Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={cn(
              'mx-auto flex h-32 w-32 items-center justify-center rounded-full',
              styles.bgColor
            )}
          >
            <span className={cn('text-6xl font-bold', styles.textColor)}>
              {results.riskScore}
              <span className="text-3xl">%</span>
            </span>
          </div>
          <p className={cn('text-lg font-semibold', styles.textColor)}>{styles.text} Risk</p>
          <p className="text-sm text-muted-foreground">
            This is an estimate based on the information you provided. Consult a healthcare professional for a comprehensive evaluation.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Key Risk Factors Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>{results.summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            <span>Personalized Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>{results.insights}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Prevention Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>{results.preventionTips}</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={onReset}>
          <Repeat /> Assess Again
        </Button>
      </div>
    </div>
  );
}
