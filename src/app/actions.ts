
'use server';

import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';


// This function calls the ML model to get a risk score.
async function getStrokeRisk(payload: StrokeRiskFormValues, modelName: string): Promise<number> {
    // We remove the model name from the payload before sending it to the python server
    const { model, ...patientData } = payload;
    
    console.log('Sending payload to prediction service:', patientData);

    try {
        const response = await fetch('http://172.17.0.2:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The python server expects a specific set of keys.
            body: JSON.stringify({
                ...patientData,
                Residence_type: patientData.residenceType,
                avg_glucose_level: patientData.avgGlucoseLevel,
                ever_married: patientData.everMarried,
                work_type: patientData.workType,
                smoking_status: patientData.smokingStatus,
                // The model name is not part of the payload for the python server
                // as it is handled by the python server itself if needed,
                // or you could pass it as a query param if your server supports it.
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Prediction service responded with status ${response.status}: ${errorBody}`);
            throw new Error(`The prediction service failed with status: ${response.status}`);
        }

        const result = await response.json();

        if (result.strokeRisk !== undefined) {
            console.log('Predicted stroke risk:', result.strokeRisk);
            // The model returns a value between 0 and 1, so we convert it to a percentage.
            return Math.round(result.strokeRisk * 100);
        } else {
            console.error('Error from prediction script:', result.error);
            throw new Error(result.error || 'Failed to get stroke risk from script.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw new Error('Could not connect to the prediction service. Please ensure the Python server is running.');
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
    const { model, ...patientData } = validatedData;

    // You can now specify which model to use, e.g., getStrokeRisk(validatedData, 'other_model.pkl')
    const riskScore = await getStrokeRisk(validatedData, model);

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

    return {
        riskScore,
        summary: summaryResult.summary,
        insights: insightsResult.insights,
        preventionTips: insightsResult.preventionTips,
    };
}
