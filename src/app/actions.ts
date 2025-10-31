'use server';

import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';

// This function calls the ML model to get a risk score.
async function getStrokeRisk(payload: StrokeRiskFormValues): Promise<number> {
  try {
    const response = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.strokeRisk !== undefined) {
      console.log('Predicted stroke risk:', result.strokeRisk);
      // The model returns a value between 0 and 1, so we convert it to a percentage.
      return Math.round(result.strokeRisk * 100);
    } else {
      console.error('Error from prediction API:', result.error);
      throw new Error(result.error || 'Failed to get stroke risk from API.');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Could not connect to the prediction service.');
  }
}


export type PredictionAndInsightsResult = {
  riskScore: number;
  summary: string;
  insights: string;
  preventionTips: GenerateInsightsOutput['preventionTips'];
};


export async function getStrokePredictionAndInsights(formData: StrokeRiskFormValues): Promise<PredictionAndInsightsResult> {
    const validatedData = strokeRiskSchema.parse(formData);

    const riskScore = await getStrokeRisk(validatedData);

    const summaryInput: SummarizeFactorsInput = {
        ...validatedData,
        everMarried: validatedData.everMarried === 'Yes',
    };
    const summaryResult = await summarizeFactors(summaryInput);

    const insightsInput: GenerateInsightsInput = {
        riskScore,
        age: validatedData.age,
        gender: validatedData.gender,
        hypertension: validatedData.hypertension,
        heartDisease: validatedData.heartDisease,
        smokingStatus: validatedData.smokingStatus,
    };
    const insightsResult = await generateInsights(insightsInput);

    if (!summaryResult.summary || !insightsResult.insights || !insightsResult.preventionTips) {
        throw new Error('Failed to generate AI insights.');
    }

    return {
        riskScore,
        summary: summaryResult.summary,
        insights: insightsResult.insights,
        preventionTips: insightsResult.preventionTips,
    };
}
