'use server';

import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput } from '@/ai/flows/generate-insights';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';

function calculateRiskScore(data: StrokeRiskFormValues): number {
    let score = 5.0;

    if (data.age > 40) {
        score += (data.age - 40) * 0.5;
    }
    if (data.hypertension) {
        score += 15;
    }
    if (data.heartDisease) {
        score += 15;
    }
    if (data.avgGlucoseLevel > 120 && data.avgGlucoseLevel <= 200) {
        score += 10;
    } else if (data.avgGlucoseLevel > 200) {
        score += 20;
    }
    if (data.bmi > 25 && data.bmi <= 30) {
        score += 5;
    } else if (data.bmi > 30) {
        score += 10;
    }
    if (data.smokingStatus === 'smokes') {
        score += 10;
    }
    if (data.smokingStatus === 'formerly smoked') {
        score += 5;
    }
    if (data.gender === 'Male') {
        score += 2;
    }
    
    return Math.min(Math.round(score), 99);
}

export async function getStrokePredictionAndInsights(formData: StrokeRiskFormValues) {
    const validatedData = strokeRiskSchema.parse(formData);

    const riskScore = calculateRiskScore(validatedData);

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
