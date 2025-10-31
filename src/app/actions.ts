
'use server';

import { spawn } from 'child_process';
import path from 'path';
import { summarizeFactors, type SummarizeFactorsInput } from '@/ai/flows/summarize-factors';
import { generateInsights, type GenerateInsightsInput, type GenerateInsightsOutput } from '@/ai/flows/generate-insights';
import { strokeRiskSchema, type StrokeRiskFormValues } from '@/lib/schema';

// This function calls a Python script to get a risk score from the ML model.
async function getStrokeRisk(payload: StrokeRiskFormValues, modelName: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const { model, ...patientData } = payload;
        
        console.log('Sending payload to python script:', { patientData, modelName });

        // The Python script will be in the `src/ai` directory.
        // We construct an absolute path to it to be safe.
        const scriptPath = path.resolve(process.cwd(), 'src', 'ai', 'predict.py');
        const modelPath = path.resolve(process.cwd(), 'src', 'ai', 'model', modelName);

        // Using an absolute path to the python executable
        const pythonExecutable = '/usr/bin/python3';

        const pythonProcess = spawn(pythonExecutable, [
            scriptPath,
            JSON.stringify(patientData),
            modelPath
        ]);

        let predictionResult = '';
        let errorResult = '';

        pythonProcess.stdout.on('data', (data) => {
            predictionResult += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorResult += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}: ${errorResult}`);
                reject(new Error(`Prediction script failed: ${errorResult}`));
            } else {
                try {
                    const result = JSON.parse(predictionResult);
                    if (result.strokeRisk !== undefined) {
                        console.log('Predicted stroke risk:', result.strokeRisk);
                        // The model returns a value between 0 and 1, so we convert it to a percentage.
                        resolve(Math.round(result.strokeRisk * 100));
                    } else {
                        console.error('Error from prediction script:', result.error);
                        reject(new Error(result.error || 'Failed to get stroke risk from script.'));
                    }
                } catch (e) {
                    console.error('Failed to parse python script output:', predictionResult);
                    reject(new Error('Failed to parse prediction result.'));
                }
            }
        });
        
        pythonProcess.on('error', (err) => {
            console.error('Failed to start subprocess.', err);
            reject(new Error('Could not execute prediction script. Please ensure Python is installed and in the system PATH.'));
        });
    });
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
