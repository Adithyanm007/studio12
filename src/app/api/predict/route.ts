
import { NextResponse } from 'next/server';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';
import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput } from '@/ai/flows/generate-insights';

async function getStrokeRisk(payload: StrokeRiskFormValues): Promise<number> {
    const { model, ...patientData } = payload;
    const modelServerUrl = 'http://127.0.0.1:5001/predict';

    try {
        console.log('Sending payload to model server:', { patientData });

        const response = await fetch(modelServerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request to model server failed with status ${response.status}`);
        }

        const result = await response.json();

        if (result.strokeRisk !== undefined) {
            console.log('Predicted stroke risk:', result.strokeRisk);
            return Math.round(result.strokeRisk * 100);
        } else {
            throw new Error('Invalid response from prediction service.');
        }

    } catch (error: any) {
        console.error('Error connecting to prediction service:', error);
        throw new Error('Could not connect to the prediction service. Please ensure the Python server is running.');
    }
}

export async function POST(req: Request) {
    try {
        const formData: StrokeRiskFormValues = await req.json();
        const validatedData = strokeRiskSchema.parse(formData);
        const { model, ...patientData } = validatedData;

        const riskScore = await getStrokeRisk(validatedData);

        const summaryInput: SummarizeFactorsInput = {
            ...patientData,
            everMarried: patientData.everMarried === 'Yes',
        };
        const summaryResult = await summarizeFactors(summaryInput);

        const insightsInput: GenerateInsightsInput = {
            riskScore,
            age: patientData.age,
            gender: patientData.gender,
            hypertension: patientData.hypertension,
            heartDisease: patientData.heartDisease,
            smokingStatus: patientData.smokingStatus,
        };
        const insightsResult = await generateInsights(insightsInput);

        if (!summaryResult.summary || !insightsResult.insights || !insightsResult.preventionTips) {
            throw new Error('Failed to generate AI insights.');
        }

        const response = {
            riskScore,
            summary: summaryResult.summary,
            insights: insightsResult.insights,
            preventionTips: insightsResult.preventionTips,
        };
        
        return NextResponse.json(response);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
